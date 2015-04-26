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
  app.submit = function(){
    document.getElementById("login").style.visibility = "collapse";
    app.spinner = "true"
    sendPostRequest(app.username, app.password, function(response){
      console.log(response.classes);
      app.classrooms = response.classes;
    });
  };
  app.$.apiLoader.setOnload(function() {

  });
});
