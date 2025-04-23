export async function handleMedia(el, originalModel, modifiedModel) {
  const audioElement = document.getElementById("audio_id");
  const previewTextElement = document.querySelector(".preview .text h6");
  const audioId = el.dataset.audioId;

  const response = await fetch(`/api/subtitles/${audioId}`);
  const data = await response.json();

  if (originalModel) {
    originalModel.setValue(data); // Set the new content in the original model
    modifiedModel.setValue("");
  }

  audioElement.querySelector("source").src = `/api/audio/${audioId}`;
  audioElement.load();
  try {
    audioElement.play();
  } catch {}

  if (previewTextElement) {
    previewTextElement.textContent = `Playing: ${audioId}`;
  }
}
