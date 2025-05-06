import { saveCurrentAudioIdToCache } from "./localStorage.js";
import { verificationBtnUpdate } from "./verifiedItems.js";
import { originalModel, modifiedModel } from "./textCompare.js";

export async function handleMedia(el, originalModel, modifiedModel) {
  if (!el) return;

  const audioId = el.dataset.audioId;
  const audioElement = document.getElementById("audio_id");
  const previewTextElement = document.querySelector(".preview .text h6");
  const audioUrl = `/api/audio/${audioId}`;
  const currentAudioSrc = audioElement.querySelector("source").src;

  // Fetch subtitle data
  const response = await fetch(`/api/subtitles/${audioId}`);
  const data = await response.json();

  // Update models
  if (originalModel) {
    originalModel.setValue(data);
    modifiedModel.setValue("");
  }

  const isSameAudio = currentAudioSrc.endsWith(audioId);

  // Playback logic
  if (isSameAudio) {
    if (audioElement.paused) {
      audioElement.play();
      saveCurrentAudioIdToCache(audioId);
    } else {
      audioElement.pause();
      el.classList.remove("bi-pause-fill");
      el.classList.add("bi-play-fill");
    }
  } else {
    // Load and play new audio
    audioElement.querySelector("source").src = audioUrl;
    audioElement.load();
    audioElement.play();
    saveCurrentAudioIdToCache(audioId);

    if (previewTextElement) {
      previewTextElement.textContent = `Playing: ${el.dataset.audioFilename}`;

      verificationBtnUpdate(audioId);
    }
  }

  // Update play/pause button icon
  if (audioElement.paused) {
    el.classList.remove("bi-pause-fill");
    el.classList.add("bi-play-fill");
  } else {
    el.classList.remove("bi-play-fill");
    el.classList.add("bi-pause-fill");
  }
}

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

export function initAudio() {
  const audioList = document.getElementById("audio-list");

  audioList.addEventListener("click", function (event) {
    const getPlayButton = (target) => {
      if (target.classList.contains("play-btn")) return target;
      if (target.classList.contains("item"))
        return target.querySelector(".play-btn");
      if (
        target.classList.contains("img") ||
        target.classList.contains("carousel-container")
      )
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
}
