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
    app.username = "";
    app.password = "";
    document.getElementById("login").style.display = "";
    document.getElementById("logout").style.display = "none";
  }
  app.submit = function(){
    app.spinner = true;
    sendPostRequest(app.username, app.password, function(response){
      app.spinner = false;
      if (response.status === "OK") {
        document.getElementById("login").style.display = "none";
        document.getElementById("logout").style.display = "";
        app.classrooms = response.classes;
      }
      else {
        document.getElementById("login_error").style.display = "";
        app.password = '';
      }
      console.log(response);
    });
  };
  app.$.apiLoader.setOnload(function() {

  });
});

window.onkeyup = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;

   if (key == 13) {
       app.submit()
   }
}
