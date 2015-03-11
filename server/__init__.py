'''The endpoints server.

It can respond to a GET request with the classes available on a certain date.

    A GET request sent to the path "classes" in "v1" of the api named
    "tutorialsignup" with the date parameter "2015-01-04" and search parameter
    "mr".
        ---------------------------------------------
        GET /_ah/api/tutorialsignup/v1/classes?date=2015-01-04&search=mr HTTP/1.1
        Example-Header:  Foo Example Header
        Other-Header:  etc, etc...
        ---------------------------------------------

    Should return a response with a list of classrooms available for tutorial
    on that day, with teacher name or room number containing the search term.
    It should include the teacher's name, the room number, the number of seats
    available, and whether the student has signed up already.  It should also
    include an ID, namely the datastore key.
        ---------------------------------------------
        200 OK
        Date:  Mon, 05 Jan 2015 01:48:57 GMT
        Content-Type:  application/json
        More-Headers:  etc...

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
__author__ = 'Alexander Otavka', 'Sebastian Boyd'


import endpoints
from protorpc import messages, message_types, remote
from google.appengine.ext import ndb
import datetime

#from libs.endpoints_proto_datastore.ndb import EndpointsModel


WEB_CLIENT_ID = '185595448807-h36t655f1phh27l4jp9pfkmu4legbkro.apps.googleusercontent.com'
# I commented this one out, because it seems to work without it.  Sebastian, tell me if I am
# wrong, but I am guessing that that is the client id of the API explorer.
#SOME_UNKNOWN_CLIENT_ID = '292824132082.apps.googleusercontent.com',


class TeacherNDB(ndb.Model):
    name = ndb.UserProperty()
    text_name = ndb.StringProperty() # Testing only
    profilepic = ndb.StringProperty()

class StudentNDB(ndb.Model):
    name = ndb.UserProperty()

class ClassroomNDB(ndb.Model):
    '''An individual classroom on a specific date.'''
    teacher = ndb.StructuredProperty(TeacherNDB)
    room = ndb.StringProperty()
    totalseats = ndb.IntegerProperty()
    seats_left = ndb.IntegerProperty()
    signedup_sudents = ndb.StructuredProperty(StudentNDB, repeated=True)

class DateNDB(ndb.Model):
    date = ndb.DateProperty(auto_now_add=True)

class ClassroomMessage(messages.Message):
    dsid = messages.StringField(1)
    parent_id = messages.StringField(2)
    teacher = messages.StringField(3)
    profilepic = messages.StringField(4)
    room = messages.StringField(5)
    totalseats = messages.IntegerField(6)
    seats_left = messages.IntegerField(7)
    signedup = messages.BooleanField(8)

class ClassroomCollectionMessage(messages.Message):
    classrooms = messages.MessageField(ClassroomMessage, 1, repeated=True)

class SignupRequest(messages.Message):
    dsid = messages.StringField(1)
    parent_id = messages.StringField(2)
    signup = messages.BooleanField(3)

class SignupResponse(messages.Message):
    signedup = messages.BooleanField(1)
    status = messages.IntegerField(2)
    message = messages.StringField(3)

def test_classes():
    later = datetime.date(2015, 3, 11)
    date = DateNDB(date = later)
    teacher1 = TeacherNDB(text_name="Mr Milstead")
    key = date.put()
    class1 = ClassroomNDB(parent=key, teacher=teacher1, room="123", totalseats=12, seats_left=1, signedup_sudents=[])
    class1.put()

@endpoints.api(name='tutorialsignup', version='v1',
               allowed_client_ids=[WEB_CLIENT_ID, endpoints.API_EXPLORER_CLIENT_ID])
class TutorialSignupAPI(remote.Service):
    '''Mediates between client and datastore.'''
    @endpoints.method(SignupRequest, SignupResponse, name='signup')
    def signup(self, request):
        current_user = endpoints.get_current_user()
        if current_user is None:
            raise endpoints.UnauthorizedException('Invalid token.')
        #test_classes()
        #return
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
            if classroom.signedup_sudents.name == current_user: # Need to fix
                signedup_here = False
            else:
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

    @endpoints.method(message_types.VoidMessage, ClassroomCollectionMessage, name='list_classes')

    def listClasses(self, request):
        today = datetime.date.today()
        qry = DateNDB.query(DateNDB.date >= today)
        qry.order(DateNDB.date)
        result = qry.fetch(1)
        date_key = result[0].key
        date_id = date_key.id()
        print str(date_id)
        qry = ClassroomNDB.query(ancestor=date_key).order(-ClassroomNDB.seats_left)
        classroom_collection = []
        for classroom in qry:
            print str(classroom)
            class_message = ClassroomMessage(dsid=str(classroom.key.id()), teacher=classroom.teacher.text_name, profilepic=classroom.teacher.profilepic, room=classroom.room, totalseats=classroom.totalseats, seats_left=classroom.seats_left, parent_id=str(date_id))

            classroom_collection.append(class_message)

        return ClassroomCollectionMessage(classrooms = classroom_collection)


application = endpoints.api_server([TutorialSignupAPI])
