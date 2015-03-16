'''Decorators that restrict endpoints methods.

This decorator must be applied before the `endpoints.method` decorator.  So:

    @endpoints.method(...)
    @requires_student
    def foo(self, request):
        ...
'''


import endpoints
from libs import wrapt


@wrapt.decorator
def requires_student(func, instance, args, kwargs):
    current_user = endpoints.get_current_user()
    if current_user is None:
        raise endpoints.UnauthorizedException('Invalid token.')
    kwargs['current_user'] = current_user
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
