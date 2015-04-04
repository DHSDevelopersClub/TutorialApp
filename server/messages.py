'''Endpoints messages.'''


from protorpc import messages

class State(messages.Enum):
    SUCCESS = 0
    ALREADY_DONE = 1
    CLASS_FULL = 2
    INVALID_ID = 3

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
    '''
    Status codes:
        0: Successful
        1: Already Signed Up
        2: Class Full
        3: Invalid ID
    Additional codes can be added as needed.
    '''



    signedup = messages.BooleanField(1)
    status = messages.EnumField(State, 2, default=0)
    message = messages.StringField(3)

class NextTutorialDateMessage(messages.Message):
    date = messages.StringField(1)

class StudentMessage(messages.Message):
    name = messages.StringField(1)

class StudentListMessage(messages.Message):
    students = messages.MessageField(StudentMessage, 1, repeated=True)

class VerifyStudentMessage(messages.Message):
    '''
    Status Codes:
        0: Present
        1: Tardy
        2: Absent
    '''

    class Verification(messages.Enum):
        PRESENT = 0
        TARDY = 1
        ABSENT = 2

    student_id = messages.StringField(1)
    presence_state = messages.EnumField(Verification, 2)

class VerifyStudentMessageResponse(messages.Message):
    status = messages.EnumField(State, 1)

class GetAuthMessage(messages.Message):
    class AuthLevel(messages.Enum):
        NO_USER = 0
        STUDENT = 1
        TEACHER = 2
        ADMIN = 3
        ROOT = 4
    auth = messages.EnumField(AuthLevel, 1)
