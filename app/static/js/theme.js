// Theme

const themeBtn = document.getElementById("theme-btn");

// Load theme: system preference OR saved override
(function initializeTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", theme);
  const icon = themeBtn.querySelector("i");
  if (icon) icon.className = theme === "light" ? "bi bi-sun" : "bi bi-moon";
})();

// Toggle theme
themeBtn.addEventListener("click", function () {
  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);

  const icon = themeBtn.querySelector("i");
  if (icon) icon.className = next === "light" ? "bi bi-sun" : "bi bi-moon";
});
