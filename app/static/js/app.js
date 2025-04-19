async function loadPage(page) {
  const response = await fetch(`/${page}`);
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
          class="fa fa-play"
          onclick="handlePlay(this)"
          data-audio-id="${audio}"
        ></span>
      </div>
      <h4>${audio}</h4>
      <p>Text here...</p>
    </div>
    `;
  });

  // Update pagination
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = `Page ${data.page} of ${data.MAX_PAGE}`;
  pagination.dataset.page = `${data.page}`;
  pagination.dataset.maxPage = `${data.MAX_PAGE}`;
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

loadPage(1);
