import {
  loadTagsFromCache,
  loadVerificationFromCache,
  loadCurrentAudioIdFromCache,
  loadMaxItemsPerPageFromCache,
  saveMaxItemsPerPageToCache,
} from "./localStorage.js";

export async function loadPage(page) {
  const savedTags = loadTagsFromCache();
  const savedVerified = loadVerificationFromCache();
  const max_items = loadMaxItemsPerPageFromCache();
  const tags = savedTags.join(",");
  const response = await fetch(
    `/page/${page}?tags=${tags}&verified=${savedVerified}&max_items=${max_items}`
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

  const audioId = loadCurrentAudioIdFromCache();
  const audio = document.getElementById("audio_id");
  let el = null;

  if (audioId) {
    el = document.querySelector(`.play-btn[data-audio-id="${audioId}"]`);

    if (el) {
      if (!audio.paused) {
        el.classList.remove("bi-play-fill");
        el.classList.add("bi-pause-fill");
      }
    }
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

const select = document.getElementById("max-items-in-page");
const cache_max_items = loadMaxItemsPerPageFromCache();

select.addEventListener("change", handleMaxItemsChange);
select.value = cache_max_items ? cache_max_items : 5;
