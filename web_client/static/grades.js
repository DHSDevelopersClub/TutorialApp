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
  app.$.apiLoader.setOnload(function() {
    var username = "sebastian.boyd";
    var password = "";
    sendPostRequest(username, password, function(response){
      console.log(response.classes);
      app.classrooms = response.classes
    });
  });
});
