'''Decorators that restrict endpoints methods.

This decorator must be applied before the `endpoints.method` decorator.  So:

    @endpoints.method(...)
    @requires_student
    def foo(self, request):
        ...
'''


import endpoints
import google.appengine.api.users
import models
from libs import wrapt
#from google.appengine.ext import ndb

@wrapt.decorator
def requires_student(func, instance, args, kwargs):
    current_user = endpoints.get_current_user()
    if current_user == None:
        raise endpoints.UnauthorizedException('Invalid token')
    qry = models.Student.query(models.Student.user == current_user).fetch(1)
    results = models.Prefs.query().fetch(1)
    if results == []:
        new_prefs = models.Prefs()
        new_prefs.put()
        results = [new_prefs]
    prefs = results[0]
    if qry == [] and prefs.enable_register_student == True:
        student = models.Student(user=current_user)
        student.put()
    elif qry == [] and prefs.enable_register_student == False:
        raise endpoints.UnauthorizedException('Invalid token')
    elif qry != []:
        student = qry[0]
    kwargs['current_user'] = current_user
    kwargs['student'] = student
    return func(*args, **kwargs)

@wrapt.decorator
def requires_teacher(func, instance, args, kwargs):
    current_user = endpoints.get_current_user()
    teacher_list = [] # TODO for Sebastian: make datastore object
    if current_user not in teacher_list:
        raise endpoints.UnauthorizedException('Invalid token')
    kwargs['current_user'] = current_user
    return func(*args, **kwargs)

@wrapt.decorator
def requires_admin(func, instance, args, kwargs):
    current_user = endpoints.get_current_user()
    teacher_list = [] # TODO for Sebastian: make datastore object
    if current_user not in teacher_list:
        raise endpoints.UnauthorizedException('Invalid token')
    kwargs['current_user'] = current_user
    return func(*args, **kwargs)

@wrapt.decorator
def requires_root(func, instance, args, kwargs):
    current_user = endpoints.get_current_user()
    if current_user == None:
        raise endpoints.UnauthorizedException('Invalid token')
    if current_user.email() not in ['lord.of.all.sebastian@gmail.com', 'zotavka@gmail.com']:
        raise endpoints.UnauthorizedException('Invalid token')
    kwargs['current_user'] = current_user
    return func(*args, **kwargs)
