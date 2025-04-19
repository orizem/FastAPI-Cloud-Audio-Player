let originalModel;
let modifiedModel;

require.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs" },
});

require(["vs/editor/editor.main"], function () {
  originalModel = monaco.editor.createModel("", "text/plain");
  modifiedModel = monaco.editor.createModel("", "text/plain");

  const diffEditor = monaco.editor.createDiffEditor(
    document.getElementById("editor"),
    {
      theme: "vs",
      renderSideBySide: true,
      automaticLayout: true,
    }
  );

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });
});

async function handlePlay(el) {
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
