// Display

const displayBtn = document.getElementById("display-btn");

// Load display: system preference OR saved override
(function initializeDisplay() {
  const saved = localStorage.getItem("display");
  const display = saved || "expand";

  document.documentElement.setAttribute("data-display", display);
  const icon = displayBtn.querySelector("i");
  if (icon)
    icon.className =
      display === "expand"
        ? "bi bi-arrows-angle-expand"
        : "bi bi-arrows-angle-contract";
})();

export function toggleDisplayButton(display) {
  if (display === "contract") {
    document
      .querySelectorAll(".item .img")
      .forEach((el) => (el.style.display = "none"));
    document
      .querySelectorAll(".display-type .list")
      .forEach((el) => (el.style.gap = "5px"));
    document
      .querySelectorAll(".display-type .list .item .play .bi")
      .forEach(
        (el) => (
          (el.style.top = "14px"),
          (el.style.padding = "8px"),
          (el.style.right = "-10px")
        )
      );
    document
      .querySelectorAll(".tooltip .tooltiptext")
      .forEach((el) => (el.style.bottom = "55px"));
  } else {
    document
      .querySelectorAll(".item .img")
      .forEach((el) => (el.style.display = ""));
    document
      .querySelectorAll(".display-type .list")
      .forEach((el) => (el.style.gap = "15px"));
    document
      .querySelectorAll(".display-type .list .item .play .bi")
      .forEach(
        (el) => (
          (el.style.top = "-60px"),
          (el.style.padding = "18px"),
          (el.style.right = "10px")
        )
      );
    document
      .querySelectorAll(".tooltip .tooltiptext")
      .forEach((el) => (el.style.bottom = "115px"));
  }
}

// Toggle display
displayBtn.addEventListener("click", function () {
  const current =
    document.documentElement.getAttribute("data-display") || "contract";
  const next = current === "contract" ? "expand" : "contract";

  document.documentElement.setAttribute("data-display", next);
  localStorage.setItem("display", next);

  const icon = displayBtn.querySelector("i");
  if (icon) {
    icon.className =
      next === "contract"
        ? "bi bi-arrows-angle-contract"
        : "bi bi-arrows-angle-expand";

    toggleDisplayButton(next);
  }
});
