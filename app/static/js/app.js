import { handleMedia } from "./audio.js";
import { loadPage } from "./paging.js";
import { originalModel, modifiedModel } from "./textCompare.js";

import "./wave.js";
import "./theme.js";
import "./displayItems.js";
import "./search.js";
import "./resizeHandle.js";
import "./verifiedItems.js";
import "./sidNavBar.js";

const audioList = document.getElementById("audio-list");

audioList.addEventListener("click", function (event) {
  const getPlayButton = (target) => {
    if (target.classList.contains("play-btn")) return target;
    if (target.classList.contains("item"))
      return target.querySelector(".play-btn");
    if (target.classList.contains("img") || target.classList.contains("carousel-container"))
      return target.parentElement?.querySelector(".play-btn");
    if (target.classList.contains("hover-carousel"))
      return target.parentElement?.parentElement?.querySelector(".play-btn");
    return null;
  };

  const playBtn = getPlayButton(event.target);
  if (playBtn) {
    handleMedia(playBtn, originalModel, modifiedModel);
    togglePlayButtons(playBtn);
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
