var settings = document.querySelector("#settings");

settings.addEventListener("template-bound", function() {
  settings.Back = function() {
      window.location.href = "/app";
  };
});
