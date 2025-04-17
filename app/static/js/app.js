// document.addEventListener("DOMContentLoaded", function () {
//   const searchInput = document.getElementById("searchInput");
//   searchInput.addEventListener("input", function () {
//     const filter = this.value.toLowerCase();
//     document.querySelectorAll("tbody tr").forEach((row) => {
//       const text = row.textContent.toLowerCase();
//       row.style.display = text.includes(filter) ? "" : "none";
//     });
//   });
// });

function handlePrevPage(el) {
  const currentPath = window.location.pathname;
  const match = currentPath.match(/^\/(\d+)$/);

  if (match) {
    const currentPage = parseInt(match[1]);
    const prevPage = currentPage - 1 > 0 ? currentPage - 1 : 1;

    window.location.href = `/${prevPage}`;
  } else {
    console.log("No page number found in the path.");
  }
}

function handleNextPage(el) {
  const currentPath = window.location.pathname;
  const match = currentPath.match(/^\/(\d+)$/);

  if (match) {
    const currentPage = parseInt(match[1]);
    const nextPage = currentPage + 1;

    window.location.href = `/${nextPage}`;
  } else {
    console.log("No page number found in the path.");
  }
}
