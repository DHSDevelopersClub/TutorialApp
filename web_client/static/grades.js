/**
 * grades.js
 *
 * Javascript (for app auto-binding template) shared across clients.
 *
 * Author: Sebastian Boyd
 */

var grades = document.querySelector("#grades");

grades.addEventListener("template-bound", function() {
  grades.Back = function() {
      window.location.href = "/app";
  };
});
