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

export function saveCurrentAudioIdToCache(audio_id) {
  localStorage.setItem(
    "current_audio_id_verification",
    JSON.stringify(audio_id)
  );
}

export function loadCurrentAudioIdFromCache() {
  const cached = localStorage.getItem("current_audio_id_verification");
  return cached ? JSON.parse(cached) : null;
}

export function saveMaxItemsPerPageToCache(max_items) {
  localStorage.setItem(
    "max_items_per_page",
    JSON.stringify(max_items)
  );
}

export function loadMaxItemsPerPageFromCache() {
  const cached = localStorage.getItem("max_items_per_page");
  return cached ? JSON.parse(cached) : null;
}
