/* TAGS LOCAL STORAGE */

function saveTagsToCache(tags) {
  localStorage.setItem("search_tags", JSON.stringify(tags));
}

function extractTags() {
  const tags = [...document.querySelectorAll("#tag-input-wrapper span")];
  return tags.map((tag) => {
    const clone = tag.cloneNode(true);
    clone.querySelector("button")?.remove();
    return clone.textContent.trim();
  });
}

export function loadTagsFromCache() {
  const cached = localStorage.getItem("search_tags");
  return cached ? JSON.parse(cached) : [];
}

export function saveCurrentTags() {
  const tags = extractTags();
  saveTagsToCache(tags);
}
