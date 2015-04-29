/**
 * grades.js
 *
 * Javascript (for app auto-binding template) shared across clients.
 *
 * Author: Sebastian Boyd
 */
var sendPostRequest = function(username, password, callback) {
   gapi.client.homeaccessclient.login({
       "username": username,
       "password": password,
   }).execute(callback);
};

var app = document.querySelector("template#grades");
app.addEventListener("template-bound", function(){
  app.logout = function(){
    app.classrooms = "";
    document.getElementById("login_error").style.display = "";
  }
  app.submit = function(){
    app.spinner = true;
    sendPostRequest(app.username, app.password, function(response){
      app.spinner = false;
      if (response.status === "LOGIN_ERROR") {
        document.getElementById("login_error").style.display = "";
        app.password = '';
      }
      else {
        document.getElementById("login").style.display = "none";
        app.classrooms = response.classes;
      }
      console.log(response);
    });
  };
  app.$.apiLoader.setOnload(function() {

  });
});
