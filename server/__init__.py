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
              "id": "239hsefosFHSO4892",
              "teacher": "Mr. Milstead",
              "profilepic": "http://www.example.com/rmilstead.png",
              "room": "127",
              "totalseats": 30,
              "takenseats": 14,
              "signedup": false
            },
            {
              "id": "shHUE7e2BF2Hkkeuk",
              "teacher": "Mrs. Example",
              "profilepic": "http://www.example.com/mexample.png",
              "room": "104A",
              "totalseats": 33,
              "takenseats": 19,
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
          "id": "239hsefosFHSO4892",
          "signup": true
        }
        ---------------------------------------------

    Respond with the new signup state.  If there was an error, eg. the class
    was full or the class doesn't exist anymore, then the state should reflect
    that, and an error message can be included along with a status code.
        ---------------------------------------------
        200 OK
        Date:  Mon, 05 Jan 2015 02:43:57 GMT
        Content-Type:  application/json
        More-Headers:  etc...

        {
          "signup": true,
          "status": 1,
          "message": "You are already signed up."
        }
        ---------------------------------------------
    If the class is full, say so.
        ---------------------------------------------
        200 OK
        Date:  Mon, 05 Jan 2015 02:43:57 GMT
        Content-Type:  application/json
        More-Headers:  etc...

        {
          "signup": false,
          "status": 2,
          "message": "Failed to sign up: class is full."
        }
        ---------------------------------------------
    If everything is perfect, message should be blank.
        ---------------------------------------------
        200 OK
        Date:  Mon, 05 Jan 2015 02:43:57 GMT
        Content-Type:  application/json
        More-Headers:  etc...

        {
          "signup": true,
          "status": 0,
          "message": ""
        }
        ---------------------------------------------
    Status codes:
        0: Successful
        1: Already Signed Up
        2: Class Full
    Additional codes can be added as needed.
'''
__author__ = 'insert name here'


import endpoints
from protorpc import remote


@endpoints.api(name='dhstutorialsignup', version='v1')
class TutorialSignupAPI(remote.Service):
    '''Mediates between client and datastore.'''
    pass


application = endpoints.api_server([TutorialSignupAPI])
