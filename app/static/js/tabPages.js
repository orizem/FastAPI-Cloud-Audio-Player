import { initAudio } from "./audio.js";
import { toggleDisplayButton } from "./displayItems.js";
import { loadCurrentAudioIdFromCache } from "./localStorage.js";
import { verificationBtnUpdate } from "./verifiedItems.js";

export function homePage(data, tableContainer, audioList) {
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
}

export function logsPage(data, tableContainer, audioList) {
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
