(function () {
  var STORAGE_KEY = "geotaxi-web-theme";
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === "light" || saved === "dark") {
    root.setAttribute("data-theme", saved);
  }

  function isDark() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  toggle.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  });
})();
