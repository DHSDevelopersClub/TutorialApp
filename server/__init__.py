'''The endpoints server.'''
__author__ = 'Sebastian Boyd', 'Alexander Otavka'
__copyright__ = 'Copyright (C) 2015 DHS Developers Club'

import datetime

import endpoints
from protorpc import message_types, remote
from google.appengine.ext import ndb

#from libs.endpoints_proto_datastore.ndb import EndpointsModel
import libs.pytz as pytz

from redirect_handler import redirect
import models
from messages import (ClassroomQueryMessage, ClassroomMessage, ClassroomListMessage,
                      SignupCommandMessage, SignupStateMessage, NextTutorialDateMessage,
                      StudentMessage, StudentListMessage)
from auth_decorators import requires_student, requires_teacher, requires_root
from debug_class_gen import test_gen_classes


WEB_CLIENT_ID = '912907751553-lb6mvsskb62dpre0kje7fbvriracme0m.apps.googleusercontent.com'
ANDROID_CLIENT_ID = ''
IOS_CLIENT_ID = ''
ANDROID_AUDIENCE = ANDROID_CLIENT_ID


def check_signup(classroom, student):
    signedup = False
    for dsid in classroom.signedup_students:
        if student is not None and dsid == student.key.id():
            signedup = True
            break
    return signedup

def search(search, classrooms):
    if search == None: search = ''
    search_list = search.split()
    print len(search_list)
    for c in classrooms:
        c.teacher_object = models.Teacher.get_by_id(c.teacher)
    def match_count(classroom):
        searched_properties = (classroom.room, classroom.teacher_object.name_text,
        classroom.teacher_object.name_prefix)
        match_count = 0
        for string in searched_properties:
            for search in search_list:
                if search.lower() in string.lower():
                    match_count += 1
        return match_count

    # Sort the list of classrooms, then shave off anything with too few search results
    sorted_classrooms = sorted((-match_count(c), c.totalseats - c.takenseats == 0, c.teacher_object.name_text, c) for c in classrooms)
    if search == '':
        shaved_classrooms = [i[3] for i in sorted_classrooms]
    else:
        shaved_classrooms = [i[3] for i in sorted_classrooms if abs(i[0]) > len(search_list) / 2]
    return shaved_classrooms

def signup_simple(student, classroom):
    person = student.key.id()
    classroom.signedup_students.append(person)
    classroom.put()

def unsignup_simple(student, classroom):
    person = student.key.id()
    try:
        classroom.signedup_students.remove(person)
        classroom.put()
    except:
        pass

def next_weekday(d, weekday):
    days_ahead = weekday - d.weekday()
    if days_ahead <= 0: # Target day already happened this week
        days_ahead += 7
    return d + datetime.timedelta(days_ahead)

def get_next_tutorial():
    local_tz = pytz.timezone('America/Los_Angeles')
    d = datetime.datetime.now().replace(tzinfo=pytz.utc)
    d = d.astimezone(local_tz)
    next_wednesday = next_weekday(d, 2)
    next_friday = next_weekday(d, 4)
    if next_wednesday < next_friday:
        return next_wednesday
    else:
        return next_friday


@endpoints.api(name='dhstutorial', version='v1',
               allowed_client_ids=[WEB_CLIENT_ID, endpoints.API_EXPLORER_CLIENT_ID])
class DHSTutorialAPI(remote.Service):
    '''Mediates between client and datastore.'''

    @endpoints.method(message_types.VoidMessage, message_types.VoidMessage,
                      name='gen_debug_classes')
    @requires_root
    def gen_debug_classes(self, request, user_entity):
        test_gen_classes(get_next_tutorial())
        return message_types.VoidMessage()

    @endpoints.method(SignupCommandMessage, SignupStateMessage, name='signup')
    @requires_student
    def signup(self, request, user_entity):
        '''Add or remove a signup for the current user on a specific date.

        If the current user is already signedup for another class on the specified date, their
        signup will be removed from that class so they can only be signed up for one class per date.
        '''
        dsid = request.dsid
        signup = request.signup

        parent_key = ndb.Key('Date', int(request.parent_id))
        classroom = models.Classroom.get_by_id(int(dsid), parent=parent_key)
        if classroom == None:
            return SignupStateMessage(signedup=False,
                                      status=SignupStateMessage.Status.INVALID_ID)

        #Check if signedup
        try:
            dsid = user_entity.key.id()
        except:
            raise endpoints.UnauthorizedException("Not student")
        print dsid
        qry = models.Classroom.query(models.Classroom.signedup_students == dsid).fetch()
        if qry == []:
            signedup = False
            signedup_here = False
        else:
            signedup = True
            signedup_here = check_signup(classroom, user_entity)
        if signedup_here == signup:
            # Already have what you want
            return SignupStateMessage(signedup=signedup_here,
                                      status=SignupStateMessage.Status.ALREADY_DONE)
        elif signedup == False:
            # Not signed up but want to be
            signup_simple(user_entity, classroom)
        elif signedup_here == True:
            # Already signedup here don't want to be
            unsignup_simple(user_entity, classroom)
        elif signedup == True:
            # Signed up in diffrent classroom somthing is wrong
            unsignup_simple(user_entity, qry[0])
            signup_simple(user_entity, classroom)

        return SignupStateMessage(signedup=signup)

    @endpoints.method(ClassroomQueryMessage, ClassroomListMessage, name='list_classes')
    @requires_student
    def list_classes(self, request, user_entity):
        '''List classes on a given date that match the given search.

        A search of either '' or None will return all classes.
        '''
        date = datetime.datetime.strptime(request.date, '%Y-%m-%d')
        qry = models.Date.query(models.Date.date == date)
        try:
            result = qry.fetch(1)[0]
        except IndexError:
            return ClassroomListMessage(classrooms=[])
        date_key = result.key
        qry_result = models.Classroom.query(ancestor=date_key).fetch()
        filtered = search(request.search, qry_result)
        # Move signup class to top
        for classroom in filtered:
            if check_signup(classroom, user_entity):
                filtered.insert(0, filtered.pop(filtered.index(classroom)))
        return ClassroomListMessage(classrooms=[
            ClassroomMessage(
                dsid=str(classroom.key.id()),
                teacher='{} {}'.format(classroom.teacher_object.name_prefix, classroom.teacher_object.name_text),
                profilepic=classroom.teacher_object.profilepic,
                room=classroom.room,
                totalseats=classroom.totalseats,
                takenseats=classroom.takenseats,
                parent_id=str(date_key.id()),
                signedup=check_signup(classroom, user_entity))
            for classroom in filtered])

    @endpoints.method(message_types.VoidMessage, NextTutorialDateMessage, name='next_tutorial')
    def next_tutorial(self, request):
        '''Get the date of the next tutorial after this moment.

        If we are in the middle of a tutorial right now, today's date will be returned.
        '''
        # TODO: Sebastian, make it return today's date if we are in the middle of a tutorial.
        str_date = get_next_tutorial().strftime('%Y-%m-%d')
        return NextTutorialDateMessage(date=str_date)

    @endpoints.method(message_types.VoidMessage, StudentListMessage, name='list_students')
    @requires_teacher
    def list_students(self, request, user_entity):
        date = datetime.datetime.strptime(request.date, '%Y-%m-%d')
        qry = models.Date.query(models.Date.date == date)
        try:
            result = qry.fetch(1)[0]
        except IndexError:
            return StudentListMessage(students=[])
        date_key = result.key
        user_dsid = user_entity.key.id()
        print user_dsid
        qry = models.Classroom.query(models.Classroom.teacher == user_dsid).fetch()
application = endpoints.api_server([DHSTutorialAPI])
