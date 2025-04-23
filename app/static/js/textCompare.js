// Text Compare
export let originalModel;
export let modifiedModel;

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

const editorContainer = document.getElementById("editor");
editorContainer.style.width = "100%";
editorContainer.style.height = "500px";
editorContainer.style.border = "1px solid #ccc";
