// document.addEventListener("DOMContentLoaded", function () {
//   const audioElements = document.querySelectorAll("audio");

//   audioElements.forEach((audio) => {
//     audio.addEventListener("play", () => {
//       audioElements.forEach((otherAudio) => {
//         if (otherAudio !== audio) {
//           otherAudio.pause();
//         }
//       });
//     });
//   });
// });

function handlePlay(el) {
  const audioElement = document.getElementById("audio_id");
  const previewTextElement = document.querySelector(".preview .text h6");
  const audioId = el.dataset.audioId;

  audioElement.querySelector("source").src = `/api/audio/${audioId}`;
  audioElement.load();
  try {
    audioElement.play();
  } catch {}

  if (previewTextElement) {
    previewTextElement.textContent = `Playing: ${audioId}`;
  }
}