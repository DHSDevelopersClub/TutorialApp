'''Endpoints messages.'''


from protorpc import messages


class ClassroomQueryMessage(messages.Message):
    date = messages.StringField(1, required=True)
    search = messages.StringField(2)

class ClassroomMessage(messages.Message):
    dsid = messages.StringField(1)
    parent_id = messages.StringField(2)
    teacher = messages.StringField(3)
    profilepic = messages.StringField(4)
    room = messages.StringField(5)
    totalseats = messages.IntegerField(6)
    takenseats = messages.IntegerField(7)
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

class NextTutorialResponse(messages.Message):
    date = messages.StringField(1)
