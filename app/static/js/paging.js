import {
  loadTagsFromCache,
  loadVerificationFromCache,
  loadMaxItemsPerPageFromCache,
  saveMaxItemsPerPageToCache,
  loadPageTabFromCache,
} from "./localStorage.js";
import { homePage, logsPage } from "./tabPages.js";

export async function loadPage(page) {
  const savedTags = loadTagsFromCache();
  const savedVerified = loadVerificationFromCache();
  const pageTab = loadPageTabFromCache();
  const max_items = loadMaxItemsPerPageFromCache();
  const tags = savedTags.join(",");
  const response = await fetch(
    `/page/${page}?tags=${tags}&verified=${savedVerified}&max_items=${max_items}&page_tab=${pageTab}`
  );
  const data = await response.json();

  // Update the content with the new audio files
  const tableContainer = document.querySelector(".table-container");
  const audioList = document.getElementById("audio-list");
  const logsTable = document.getElementById("logs-table");
  audioList.innerHTML = ""; // Clear current content
  logsTable.innerHTML = ""; // Clear current content

  if (pageTab == 0) {
    homePage(data, tableContainer, audioList);
  } else if (pageTab == 1) {
    logsPage(data, tableContainer, audioList);
  } else {
    homePage(data, tableContainer, audioList);
  }

  const currentPlaylist = document.querySelector("#playlist-title");
  const totalMatches = document.querySelector("#playlist-total");

  currentPlaylist.innerHTML =
    savedVerified == 0 ? "Pending For verification:" : "Verified:";
  totalMatches.innerHTML = `total matches: ${data.total_documents}`;

  // Update pagination
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = `Page ${data.page} of ${data.MAX_PAGE}`;
  pagination.dataset.page = `${data.page}`;
  pagination.dataset.maxPage = `${data.MAX_PAGE}`;
}

// Move between pages

function handlePrevPage() {
  const pagination = document.getElementById("pagination");
  const currentPage = parseInt(pagination.dataset.page);
  const prevPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
  loadPage(prevPage);
}

function handleNextPage() {
  const pagination = document.getElementById("pagination");
  const currentPage = parseInt(pagination.dataset.page);
  const nextPage =
    currentPage + 1 <= pagination.dataset.maxPage
      ? currentPage + 1
      : pagination.dataset.maxPage;
  loadPage(nextPage);
}

export function reloadPage(firstPage = false) {
  const pagination = document.getElementById("pagination");
  const currentPage = firstPage ? 1 : parseInt(pagination.dataset.page);
  loadPage(currentPage);
}

// Max items per page
function handleMaxItemsChange(event) {
  const selectedValue = event.target.value;

  saveMaxItemsPerPageToCache(selectedValue);
  reloadPage();
}

// Handle previous page button
document.querySelector(".prev-btn").addEventListener("click", function () {
  handlePrevPage();
});

// Handle next page button
document.querySelector(".next-btn").addEventListener("click", function () {
  handleNextPage();
});

const select = document.getElementById("max-items-in-page");
const cache_max_items = loadMaxItemsPerPageFromCache();

select.addEventListener("change", handleMaxItemsChange);
select.value = cache_max_items ? cache_max_items : 5;
