import { saveCurrentTags, loadTagsFromCache } from "./localStorage.js";

async function loadPage(page) {
  const savedTags = loadTagsFromCache();
  const tags = savedTags.join(",");
  const response = await fetch(`/page/${page}?tags=${tags}`);
  const data = await response.json();

  // Update the content with the new audio files
  const audioList = document.getElementById("audio-list");
  audioList.innerHTML = ""; // Clear current content

  data.audio_files.forEach((audio) => {
    audioList.innerHTML += `
      <div class="item">
      <img
        src="https://canto-wp-media.s3.amazonaws.com/app/uploads/2019/11/19191844/audio-file-types-36-768x704.jpg"
      />
      <div class="play">
        <span
          class="fa fa-play play-btn"
          data-audio-id="${audio}"
        ></span>
      </div>
      <div class="carousel-container">
      <h4 class="hover-carousel">
      ${audio}
      </h4>
      </div>
        <div class="tooltip">
          <span class="tooltiptext">${audio}</span>
        </div>
      </div>
    `;
  });

  // Update pagination
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = `Page ${data.page} of ${data.MAX_PAGE}`;
  pagination.dataset.page = `${data.page}`;
  pagination.dataset.maxPage = `${data.MAX_PAGE}`;

  audioList.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("play-btn")) {
      handlePlay(event.target);
    }
  });
}

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

function reloadPage() {
  const pagination = document.getElementById("pagination");
  const currentPage = parseInt(pagination.dataset.page);
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
  reloadPage();
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
