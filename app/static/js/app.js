import { handleMedia } from "./audio.js";
import { loadPage } from "./paging.js";
import { originalModel, modifiedModel } from "./textCompare.js";

import "./wave.js";
import "./theme.js";
import "./search.js";
import "./resizeHandle.js";
import "./verifiedItems.js";

const audioList = document.getElementById("audio-list");

audioList.addEventListener("click", function (event) {
  if (event.target && event.target.classList.contains("play-btn")) {
    handleMedia(event.target, originalModel, modifiedModel);
  }

  if (event.target && event.target.classList.contains("item")) {
    handleMedia(
      event.target.querySelector(".play-btn"),
      originalModel,
      modifiedModel
    );
  }

  if (event.target && event.target.classList.contains("img")) {
    handleMedia(
      event.target.parentElement.querySelector(".play-btn"),
      originalModel,
      modifiedModel
    );
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("play-btn")) {
    // Reset all icons
    document.querySelectorAll(".play-btn").forEach((el) => {
      el.className = "bi bi-play-fill play-btn";
    });

    // Set clicked icon to pause
    if (event.target.className === "bi bi-pause-fill play-btn")
      event.target.className = "bi bi-play-fill play-btn";
    else event.target.className = "bi bi-pause-fill play-btn";
  }
});

loadPage(1);
