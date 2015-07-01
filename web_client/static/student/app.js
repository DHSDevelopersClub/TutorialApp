/**
 * app.js
 *
 * Javascript for app auto-binding template in student.html.
 *
 * Author: Alexander Otavka
 */

var app = document.querySelector("template#app");

app.addEventListener("template-bound", function() {
    "use strict";

    app.refresh = function() {
        app.$.classroomManager.load(true);
    };
});
