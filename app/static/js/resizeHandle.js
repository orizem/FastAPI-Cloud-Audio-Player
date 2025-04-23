const preview = document.querySelector(".preview");
const handle = document.querySelector(".resize-handle");

let isResizing = false;

handle.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.cursor = "ns-resize";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const windowHeight = window.innerHeight;
  const newHeight = windowHeight - e.clientY;
  preview.style.height = `${newHeight}px`;
  preview.style.top = "auto";
  preview.style.bottom = "0";
  preview.style.position = "fixed";
});

document.addEventListener("mouseup", () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = "default";
  }
});

handle.addEventListener("touchstart", (e) => {
  isResizing = true;
  document.body.style.cursor = "ns-resize";
  e.preventDefault(); // prevent scrolling while resizing
});

document.addEventListener(
  "touchmove",
  (e) => {
    if (!isResizing) return;
    const touch = e.touches[0];
    const windowHeight = window.innerHeight;
    const newHeight = windowHeight - touch.clientY;
    preview.style.height = `${newHeight}px`;
    preview.style.top = "auto";
    preview.style.bottom = "0";
    preview.style.position = "fixed";
    e.preventDefault(); // prevent default scrolling
  },
  { passive: false }
);

document.addEventListener("touchend", () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = "default";
  }
});
