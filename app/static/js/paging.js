import {
  loadTagsFromCache,
  loadVerificationFromCache,
  loadCurrentAudioIdFromCache,
  loadMaxItemsPerPageFromCache,
  saveMaxItemsPerPageToCache,
  loadIsLogsDisplayFromCache,
} from "./localStorage.js";
import { initAudio } from "./audio.js";
import { toggleDisplayButton } from "./displayItems.js";
import { verificationBtnUpdate } from "./verifiedItems.js";

export async function loadPage(page) {
  const savedTags = loadTagsFromCache();
  const savedVerified = loadVerificationFromCache();
  const isLogs = loadIsLogsDisplayFromCache();
  const max_items = loadMaxItemsPerPageFromCache();
  const tags = savedTags.join(",");
  const response = await fetch(
    `/page/${page}?tags=${tags}&verified=${savedVerified}&max_items=${max_items}&is_logs=${isLogs}`
  );
  const data = await response.json();

  // Update the content with the new audio files
  const tableContainer = document.querySelector(".table-container");
  const audioList = document.getElementById("audio-list");
  const logsTable = document.getElementById("logs-table");
  audioList.innerHTML = ""; // Clear current content
  logsTable.innerHTML = ""; // Clear current content

  if (isLogs == 0) {
    initAudio();
    
    tableContainer.style.display = "none";
    if (!data.audio_files) reloadPage(true);
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

    const display = localStorage.getItem("display") || "expand";
    toggleDisplayButton(display);

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
    verificationBtnUpdate(audioId);
  } else {
    tableContainer.style.display = "block";

    let html = `
    <div id="playlist-info">
      <h2 id="playlist-title">Pending for verification:</h2>
      <h6 id="playlist-total">total matches: 0</h6>
    </div>

    <div class="table-container">
      <table id="logs-table">
        <tr>
        <th>ID</th>
        <th>File Name</th>
        <th>Verified</th>
        <th>Audio File ID</th>
        <th>Action</th>
        <th>Column Changed</th>
        <th>Timestamp</th>
      </tr>`;

    if (!data.audio_files) reloadPage(true);
    data.audio_files.forEach((audio) => {
      html += `
        <tr>
          <td>${audio.id}</td>
          <td>${audio.filename}</td>
          <td>${audio.verified}</td>
          <td>${audio.audio_file_id}</td>
          <td>${audio.action}</td>
          <td>${audio.column_changed}</td>
          <td>${audio.timestamp}</td>
        </tr>
      `;
    });
    html += `</table></div> <div class="list" id="audio-list"></div>`;
    audioList.parentElement.innerHTML = html;
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
  const isLogs = 1;
  const pagination = document.getElementById("pagination");
  const currentPage = parseInt(pagination.dataset.page);
  const prevPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
  loadPage(prevPage, isLogs);
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
