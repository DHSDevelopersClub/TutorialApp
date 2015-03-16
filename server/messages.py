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

class ClassroomListMessage(messages.Message):
    classrooms = messages.MessageField(ClassroomMessage, 1, repeated=True)

class SignupCommandMessage(messages.Message):
    dsid = messages.StringField(1)
    parent_id = messages.StringField(2)
    signup = messages.BooleanField(3)

class SignupStateMessage(messages.Message):
    '''The status of a classroom's signedup state.

    Status codes:
        0: Successful
        1: Already Signed Up
        2: Class Full
        3: Invalid ID
    Additional codes can be added as needed.
    '''

    class State(messages.Enum):
        SUCCESS = 0
        ALREADY_DONE = 1
        CLASS_FULL = 2
        INVALID_ID = 3

    signedup = messages.BooleanField(1)
    status = messages.EnumField(State, 2, default=0)
    message = messages.StringField(3)

class NextTutorialDateMessage(messages.Message):
    date = messages.StringField(1)
