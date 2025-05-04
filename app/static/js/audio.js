import { saveCurrentAudioIdToCache } from "./localStorage.js";
import { verificationBtnUpdate } from "./verifiedItems.js";

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
