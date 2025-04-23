import {
  saveCurrentTags,
  loadTagsFromCache,
  saveVerificationToCache,
  loadVerificationFromCache,
} from "./localStorage.js";
import { handleMedia } from "./audio.js";

// Theme

const themeBtn = document.getElementById("theme-btn");

// Load theme: system preference OR saved override
(function initializeTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", theme);
  const icon = themeBtn.querySelector("i");
  if (icon) icon.className = theme === "light" ? "bi bi-sun" : "bi bi-moon";
})();

// Toggle theme
themeBtn.addEventListener("click", function () {
  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);

  const icon = themeBtn.querySelector("i");
  if (icon) icon.className = next === "light" ? "bi bi-sun" : "bi bi-moon";
});

// Text Compare
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

const editorContainer = document.getElementById("editor");
editorContainer.style.width = "100%";
editorContainer.style.height = "500px";
editorContainer.style.border = "1px solid #ccc";

// Verified items

const unverifyBtn = document.getElementById("verifyAudio");
const verifiedNavBtn = document.getElementById("verified-btn");
const unverifiedNavBtn = document.getElementById("unverified-btn");

verifiedNavBtn.addEventListener("click", function (event) {
  if (event.target) {
    saveVerificationToCache(1);
    reloadPage(true);
  }
});

unverifiedNavBtn.addEventListener("click", function (event) {
  if (event.target) {
    saveVerificationToCache(0);
    reloadPage(true);
  }
});

unverifyBtn.addEventListener("click", async () => {
  const audio = document.getElementById("audio_id");
  const source = audio?.querySelector("source");
  if (!source) return;

  const audioId = source.src.split("/api/audio/")[1];
  const verification = await fetch(`/api/verified/${audioId}`);
  const data = await verification.json();

  if (!audioId || audioId === "#" || data === 1) return;

  try {
    const res = await fetch(`/api/verify/${audioId}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    reloadPage();
  } catch (err) {
    console.error("Error:", err);
  }
});

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

async function loadPage(page) {
  const savedTags = loadTagsFromCache();
  const savedVerified = loadVerificationFromCache();
  const tags = savedTags.join(",");
  const response = await fetch(
    `/page/${page}?tags=${tags}&verified=${savedVerified}`
  );
  const data = await response.json();

  // Update the content with the new audio files
  const audioList = document.getElementById("audio-list");
  audioList.innerHTML = ""; // Clear current content

  data.audio_files.forEach((audio) => {
    audioList.innerHTML += `
      <div class="item">
      <img class="img"
        src="https://canto-wp-media.s3.amazonaws.com/app/uploads/2019/11/19191844/audio-file-types-36-768x704.jpg"
      />
      <div class="play">
        <span
          class="bi bi-play-fill play-btn"
          data-audio-id="${audio.id}"
          data-audio-filename="${audio.filename}"
        ></span>
      </div>
      <div class="carousel-container">
      <h4 class="hover-carousel">
      ${audio.filename}
      </h4>
      </div>
        <div class="tooltip">
          <span class="tooltiptext">${audio.filename}</span>
        </div>
      </div>
    `;
  });

  const currentPlaylist = document.querySelector(".playlists h2");

  currentPlaylist.innerHTML =
    savedVerified == 0 ? "Pending For verification" : "Verified";

  // Update pagination
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = `Page ${data.page} of ${data.MAX_PAGE}`;
  pagination.dataset.page = `${data.page}`;
  pagination.dataset.maxPage = `${data.MAX_PAGE}`;
}

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

// Move between pages

function handlePrevPage(el) {
  const pagination = document.getElementById("pagination");
  const currentPage = parseInt(pagination.dataset.page);
  const prevPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
  loadPage(prevPage);
}

function handleNextPage(el) {
  const pagination = document.getElementById("pagination");
  const currentPage = parseInt(pagination.dataset.page);
  const nextPage =
    currentPage + 1 <= pagination.dataset.maxPage
      ? currentPage + 1
      : pagination.dataset.maxPage;
  loadPage(nextPage);
}

// Handle previous page button
document.querySelector(".prev-btn").addEventListener("click", function () {
  handlePrevPage(this);
});

// Handle next page button
document.querySelector(".next-btn").addEventListener("click", function () {
  handleNextPage(this);
});

const preview = document.querySelector(".preview");
const handle = document.querySelector(".resize-handle");

let isResizing = false;

handle.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.cursor = "ns-resize";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const windowHeight = window.innerHeight;
  const newHeight = windowHeight - e.clientY;
  preview.style.height = `${newHeight}px`;
  preview.style.top = "auto";
  preview.style.bottom = "0";
  preview.style.position = "fixed";
});

document.addEventListener("mouseup", () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = "default";
  }
});

const wrapper = document.getElementById("tag-input-wrapper");
const input = document.getElementById("tag-input");
const button = document.getElementById("add-tag-btn");

function reloadPage(firstPage = false) {
  const pagination = document.getElementById("pagination");
  const currentPage = firstPage ? 1 : parseInt(pagination.dataset.page);
  loadPage(currentPage);
}

function removeTag(el) {
  el.parentElement.remove();
  saveCurrentTags();
  reloadPage();
}

function createTag(tag, value) {
  tag.className =
    "flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full";
  tag.innerHTML = `
    ${value}
    <button class="ml-2 text-blue-500 hover:text-blue-500 focus:outline-none remove-btn">×</button>
  `;
}

button.addEventListener("click", () => {
  const value = input.value.trim();
  if (value === "") return;

  const tag = document.createElement("span");

  createTag(tag, value);
  wrapper.insertBefore(tag, input);
  input.value = "";
  tag.querySelector(".remove-btn").addEventListener("click", function () {
    removeTag(this);
  });

  saveCurrentTags();
  reloadPage(true);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    button.click();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const savedTags = loadTagsFromCache();
  const tagWrapper = document.getElementById("tag-input-wrapper");

  for (const tagText of savedTags) {
    // Re-render tags from saved state
    const tag = document.createElement("span");

    createTag(tag, tagText);
    tagWrapper.insertBefore(tag, input);
    tag.querySelector(".remove-btn").addEventListener("click", function () {
      removeTag(this);
    });
  }
});

// Search
document.querySelector(".search-btn").addEventListener("click", function () {
  // handleSearch(this);
  console.log("test");
});

loadPage(1);
