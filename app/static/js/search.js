import { saveCurrentTags, loadTagsFromCache } from "./localStorage.js";
import { reloadPage } from "./paging.js";

const wrapper = document.getElementById("tag-input-wrapper");
const input = document.getElementById("tag-input");
const button = document.getElementById("add-tag-btn");
const removeButton = document.getElementById("remove-all-tags-btn");

function removeTag(el, tags = false, reload = false) {
  el.parentElement.remove();
  if (tags) saveCurrentTags();
  if (reload) reloadPage();
}

function createTag(tag, value) {
  tag.className =
    "flex items-center bg-blue-100 text-sm font-medium px-3 py-1 rounded-full";
  tag.innerHTML = `
    ${value}
    <button class="ml-2 focus:outline-none remove-btn">×</button>
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
    removeTag(this, true, true);
  });

  saveCurrentTags();
  reloadPage(true);
});

removeButton.addEventListener("click", () => {
  wrapper.querySelectorAll(".remove-btn").forEach((el) => {
    removeTag(el);
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
      removeTag(this, true, true);
    });
  }
});
