'''NDB models.'''


from google.appengine.ext import ndb


class Teacher(ndb.Model):
    '''Represents a teacher with associated OAuth account.'''
    user = ndb.UserProperty()
    name_prefix = ndb.StringProperty()
    name_text = ndb.StringProperty()
    profilepic = ndb.StringProperty()

class Student(ndb.Model):
    '''Represents a student with associated OAuth account.'''
    user = ndb.UserProperty()

class Classroom(ndb.Model):
    '''An individual classroom on a specific date.'''
    teacher = ndb.StructuredProperty(Teacher)
    room = ndb.StringProperty()
    totalseats = ndb.IntegerProperty()
    takenseats = ndb.ComputedProperty(lambda self: len(self.signedup_sudents))
    signedup_sudents = ndb.StructuredProperty(Student, repeated=True)

class Date(ndb.Model):
    '''The date of a tutorial.

    Serves as a parent for Classroom entities.
    '''
    date = ndb.DateProperty(auto_now_add=True)
