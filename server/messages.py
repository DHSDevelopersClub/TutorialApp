'''Endpoints messages.'''


from protorpc import messages


class ClassroomQueryMessage(messages.Message):
    date = messages.StringField(1)
    search = messages.StringField(2)

class ClassroomMessage(messages.Message):
    dsid = messages.StringField(1)
    teacher = messages.StringField(2)
    profilepic = messages.StringField(3)
    room = messages.StringField(4)
    totalseats = messages.IntegerField(5)
    takenseats = messages.IntegerField(6)
    #signedup = messages.BooleanField(7)

class ClassroomCollectionMessage(messages.Message):
    classrooms = messages.MessageField(ClassroomMessage, 1, repeated=True)

class SignupRequest(messages.Message):
    dsid = messages.StringField(1)
    signup = messages.BooleanField(2)

class SignupResponse(messages.Message):
    signedup = messages.BooleanField(1)
    status = messages.IntegerField(2)
    message = messages.StringField(3)
