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
    togglePlayButtons(event.target);
  }

  if (event.target && event.target.classList.contains("item")) {
    handleMedia(
      event.target.querySelector(".play-btn"),
      originalModel,
      modifiedModel
    );
    const el = event.target.querySelector(".play-btn");
    togglePlayButtons(el);
  }

  if (event.target && event.target.classList.contains("img")) {
    handleMedia(
      event.target.parentElement.querySelector(".play-btn"),
      originalModel,
      modifiedModel
    );
    const el = event.target.querySelector(".play-btn");
    togglePlayButtons(el);
  }
});

function togglePlayButtons(element) {
  // Reset all icons
  document.querySelectorAll(".play-btn").forEach((el) => {
    if (el !== element) {
      el.classList.remove("bi-pause-fill");
      el.classList.add("bi-play-fill");
    }
  });

  // Set clicked icon to pause
  if (element.className.includes("bi-pause-fill")) {
    element.classList.remove("bi-pause-fill");
    element.classList.add("bi-play-fill");
  } else {
    element.classList.remove("bi-play-fill");
    element.classList.add("bi-pause-fill");
  }
}

loadPage(1);
