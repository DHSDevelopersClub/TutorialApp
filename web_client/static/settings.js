/**
 * settings.js
 *
 * Javascript (for app auto-binding template) shared across clients.
 *
 * Author: Sebastian Boyd
 */

var settings = document.querySelector("#settings");

settings.addEventListener("template-bound", function() {
  settings.Back = function() {
      window.location.href = "/app";
  };
});
