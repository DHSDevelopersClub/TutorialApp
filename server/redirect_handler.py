from google.appengine.api import users
import webapp2


class RootHandler(webapp2.RequestHandler):
    def get(self):
        current_user = users.get_current_user()
        if current_user is None:
            self.redirect('/welcome')
        else:
            self.redirect('/app')

redirect =  webapp2.WSGIApplication([("/", RootHandler)])
