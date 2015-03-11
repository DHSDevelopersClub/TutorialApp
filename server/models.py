'''NDB models.'''


from google.appengine.ext import ndb


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
    signedup_sudents = ndb.StructuredProperty(StudentNDB)

class DateNDB(ndb.Model):
    date = ndb.DateProperty(auto_now_add=True)
