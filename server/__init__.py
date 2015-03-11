'''The endpoints server.

It can respond to a GET request with the classes available on a certain date.

    A request sent to the path "classes" in "v1" of the api named
    "tutorialsignup" with the date parameter "2015-01-04" and search parameter
    "mr".
        ---------------------------------------------
        tutorialsignup.list_classes:
        {
          "date": "2015-01-04",
          "search": "mr"
        }
        ---------------------------------------------

    Should return a response with a list of classrooms available for tutorial
    on that day, with teacher name or room number containing the search term.
    It should include the teacher's name, the room number, the number of seats
    available, and whether the student has signed up already.  It should also
    include an ID, namely the datastore key.
        ---------------------------------------------
        {
          "classrooms": [
            {
              "dsid": "239hsefosFHSO4892",
              "parent_id": "3284928340284",
              "teacher": "Mr. Milstead",
              "profilepic": "http://www.example.com/rmilstead.png",
              "room": "127",
              "totalseats": 30,
              "seats_left": 14,
              "signedup": false
            },
            {
              "dsid": "shHUE7e2BF2Hkkeuk",
              "teacher": "Mrs. Example",
              "profilepic": "http://www.example.com/mexample.png",
              "room": "104A",
              "totalseats": 33,
              "seats_left": 19,
              "signedup": true
            }
          ]
        }
        ---------------------------------------------

It can also accept a POST request to signup for a specific class on a certain
date.

    Receive a POST request to "tutorialsignup" api with an id and whether to
    sign up, or un sign up.
        ---------------------------------------------
        POST /_ah/api/tutorialsignup/v1/sign HTTP/1.1
        Content-Type:  application/json
        More-Headers:  etc...

        {
          "dsid": "239hsefosFHSO4892",
          "parent_id": "83984294820834994",
          "signup": true
        }
        ---------------------------------------------

    Respond with the new signup state.  If there was an error, eg. the class
    was full or the class doesn't exist anymore, then the state should reflect
    that, and a status code should be included.  If they are already signed up,
    return status 1.
        ---------------------------------------------
        200 OK
        Date:  Mon, 05 Jan 2015 02:43:57 GMT
        Content-Type:  application/json
        More-Headers:  etc...

        {
          "signedup": true,
          "status": 1,
        }
        ---------------------------------------------
    If the class is full, return status 2.
        ---------------------------------------------
        200 OK
        Date:  Mon, 05 Jan 2015 02:43:57 GMT
        Content-Type:  application/json
        More-Headers:  etc...

        {
          "signedup": false,
          "status": 2,
          "message": "Failed to sign up: class is full."
        }
        ---------------------------------------------
    If everything is perfect, return status 0.
        ---------------------------------------------
        200 OK
        Date:  Mon, 05 Jan 2015 02:43:57 GMT
        Content-Type:  application/json
        More-Headers:  etc...

        {
          "signedup": true,
          "status": 0,
          "message": ""
        }
        ---------------------------------------------
    Status codes:
        0: Successful
        1: Already Signed Up
        2: Class Full
        3: Invalid ID
    Additional codes can be added as needed.
'''
__author__ = 'Sebastian Boyd'


import datetime

import endpoints
from protorpc import message_types, remote
from google.appengine.ext import ndb

#from libs.endpoints_proto_datastore.ndb import EndpointsModel

from models import TeacherNDB, StudentNDB, ClassroomNDB, DateNDB
from messages import (ClassroomQueryMessage, ClassroomMessage, ClassroomCollectionMessage,
                      SignupRequest, SignupResponse)
from auth_decorators import require_student


WEB_CLIENT_ID = '185595448807-h36t655f1phh27l4jp9pfkmu4legbkro.apps.googleusercontent.com'
# I commented this one out, because it seems to work without it.  Sebastian, tell me if I am
# wrong, but I am guessing that that is the client id of the API explorer.
#SOME_UNKNOWN_CLIENT_ID = '292824132082.apps.googleusercontent.com',


def test_classes(name='Mr. Milstead', profilepic='', room='123', totalseats=12, seats_left=0):
    later = datetime.date(2015, 3, 11)
    date = DateNDB(date=later)
    teacher1 = TeacherNDB(text_name=name)
    key = date.put()
    class1 = ClassroomNDB(parent=key, teacher=teacher1, room=room,
                          totalseats=totalseats, seats_left=seats_left,
                          signedup_sudents=[])
    class1.put()

def test_gen_classes():
    classlist = [
            {
              "dsid": "a39hsefosFHSO4892",
              "teacher": "Mr. Milstead",
              "profilepic": "http://cache3.asset-cache.net/gc/57442583-portrait-of-a-school-teacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=Y3hy48kuiy7pabQpAfxaQrcgpfAMUuQ1FcwFl8J80Es%3D",
              "room": "127",
              "totalseats": 30,
              "takenseats": 14,
              "signedup": True
            },
            {
              "dsid": "bh9hsefk23hrkO489",
              "teacher": "Mrs. Foo",
              "profilepic": "http://mcauliffe.dpsk12.org/wp-content/uploads/2011/09/StephanieGronholz_Retouch-square-crop.jpg",
              "room": "222",
              "totalseats": 28,
              "takenseats": 28,
              "signedup": False
            },
            {
              "dsid": "Clghi4k23hrkO4892",
              "teacher": "Mr. Bar",
              "profilepic": "http://4.bp.blogspot.com/-sXyOdCbaVi4/UA7dYAwjUCI/AAAAAAAAFmI/tbO4vxpVHS4/s220/nfowkes-square.jpg",
              "room": "409",
              "totalseats": 30,
              "takenseats": 28,
              "signedup": False
            },
            {
              "dsid": "d8s4hOFH4h84HOf48",
              "teacher": "Mrs. Wolfeschlegelsteinhausenbergerdorff",
              "profilepic": "http://cache2.asset-cache.net/gc/dv1313056-portrait-of-a-mature-teacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=jDI%2BiZbzwv%2BjFYTsYAzbzRIz392Wxp0jHzYXiV6NO3k%3D",
              "room": "413",
              "totalseats": 18,
              "takenseats": 17,
              "signedup": False
            },
            {
              "dsid": "ehHUE7e2BF2Hkkeuk",
              "teacher": "Mrs. Example",
              "profilepic": "http://cache4.asset-cache.net/gc/57442708-portrait-of-a-female-school-teacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=E5y3FqGCZA78hfJC8P3s3hrnAf50DBBxD1Fa1hqvjx8%3D",
              "room": "104A",
              "totalseats": 33,
              "takenseats": 3,
              "signedup": False
            }
          ]
    later = datetime.date(2015, 3, 11)
    date = DateNDB(date=later)
    key = date.put()
    for i in classlist:
        teacher1 = TeacherNDB(text_name=i['teacher'], profilepic=i['profilepic'])

        class1 = ClassroomNDB(parent=key, teacher=teacher1, room=i['room'],
                              totalseats=i['totalseats'],
                              seats_left=i['totalseats'] - i['takenseats'],
                              signedup_sudents=[])
        class1.put()


@endpoints.api(name='tutorialsignup', version='v1',
               allowed_client_ids=[WEB_CLIENT_ID, endpoints.API_EXPLORER_CLIENT_ID])
class TutorialSignupAPI(remote.Service):
    '''Mediates between client and datastore.'''

    @endpoints.method(message_types.VoidMessage, message_types.VoidMessage,
                      name='gen_debug_classes')
    def gen_debug_classes(self, request):
        test_gen_classes()
        return message_types.VoidMessage()

    @endpoints.method(SignupRequest, SignupResponse, name='signup')
    @require_student
    def signup(self, request):
#        current_user = endpoints.get_current_user()
#        if current_user is None:
#            raise endpoints.UnauthorizedException('Invalid token.')
        dsid = request.dsid
        signup = request.signup

        parent_key = ndb.Key('DateNDB', int(request.parent_id))
        print parent_key
        classroom = ClassroomNDB.get_by_id(int(dsid), parent=parent_key)
        if classroom == None:
            return SignupResponse(signedup=False, status=3, message='Invalid id')

        #Check if signedup
        qry = ClassroomNDB.query(ClassroomNDB.signedup_sudents.name == current_user).fetch()
        if qry == []:
            signedup = False
            signedup_here = False
        else:
            signedup = True
            signedup_here = False
            for student in classroom.signedup_sudents:
                if student.name == current_user:
                    signedup_here = True

        if signedup_here == signup: # Already have what you want
            return SignupResponse(signedup=signedup_here, status=0, message='Already done')

        elif signedup == False: # Not signed up but want to be
            print str(classroom)
            person = StudentNDB(name=current_user)
            classroom.signedup_sudents.append(person)
            classroom.seats_left = classroom.seats_left - 1
            classroom.put()
        elif signedup_here == True: # Already signedup here don't want to be
            person = StudentNDB(name=current_user)
            classroom.signedup.remove(current_user)
            classroom.seats_left = classroom.seats_left + 1
            classroom.put()
        elif signedup == True: #Signed up in diffrent classrom somthing is wrong
            return SignupResponse(signedup=False, status=1, message='')

        print 'DEBUG -', repr(dsid), repr(signup)
        return SignupResponse(signedup=signup, status=0, message=str(current_user))

    @endpoints.method(ClassroomQueryMessage, ClassroomCollectionMessage, name='list_classes')
    def listClasses(self, request):
        date = datetime.datetime.strptime(request.date, '%Y-%m-%d')
        qry = DateNDB.query(DateNDB.date == date)
        result = qry.fetch(1)[0]
        date_key = result.key

        qry = ClassroomNDB.query(ancestor=date_key).order(-ClassroomNDB.seats_left).fetch(20)
        print qry
        return ClassroomCollectionMessage(classrooms=[
            ClassroomMessage(
                dsid=str(classroom.key.id()),
                teacher=classroom.teacher.text_name,
                profilepic=classroom.teacher.profilepic,
                room=classroom.room,
                totalseats=classroom.totalseats,
                takenseats=(classroom.totalseats - classroom.seats_left))
            for classroom in qry])


application = endpoints.api_server([TutorialSignupAPI])
