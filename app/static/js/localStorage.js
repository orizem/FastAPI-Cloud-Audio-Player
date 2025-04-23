/* TAGS LOCAL STORAGE */

function saveTagsToCache(tags) {
  localStorage.setItem("search_tags", JSON.stringify(tags));
}

export function saveVerificationToCache(verification) {
  localStorage.setItem("search_verification", JSON.stringify(verification));
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

export function loadVerificationFromCache() {
  const cached = localStorage.getItem("search_verification");
  return cached ? JSON.parse(cached) : 0;
}

export function saveCurrentTags() {
  const tags = extractTags();
  saveTagsToCache(tags);
}
