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
      el.classList.remove("bi-pause-fill");
      el.classList.add("bi-play-fill");
    });

    // Set clicked icon to pause
    if (event.target.className.contains("bi-pause-fill")) {
      event.target.classList.remove("bi-pause-fill");
      event.target.classList.add("bi-play-fill");
    } else {
      event.target.classList.remove("bi-play-fill");
      event.target.classList.add("bi-pause-fill");
    }
  }
});

loadPage(1);
