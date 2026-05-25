document.addEventListener("DOMContentLoaded", () => {
  const editForm = document.getElementById("edit-form");
  const editBtn = document.getElementById("edit-btn");
  const notesParagraph = document.getElementById("notes-paragraph");
  const notesWrapper = document.querySelector(".book-notes-wrapper");

editBtn.addEventListener("click", (e) => {
  e.preventDefault();

  editForm.classList.toggle("hidden");
  notesWrapper.classList.toggle("hidden");
});
});

const books = document.querySelectorAll(".books-list li .book .one-book");

const selectAllButton = document.getElementById("select-all-btn");
let isSelectedAll = false;

selectAllButton.addEventListener("click", function () {
  isSelectedAll = !isSelectedAll;

  books.forEach((book) => {
    book.classList.toggle("selected-books", isSelectedAll);
  });

  if (isSelectedAll) {
    selectAllButton.innerHTML = `
      <svg width="24px" height="24px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <title>cancel</title>
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="work-case" fill="#000000" transform="translate(91.520000, 91.520000)">
                  <polygon id="Close" points="328.96 30.2933333 298.666667 1.42108547e-14 164.48 134.4 30.2933333 1.42108547e-14 1.42108547e-14 30.2933333 134.4 164.48 1.42108547e-14 298.666667 30.2933333 328.96 164.48 194.56 298.666667 328.96 328.96 298.666667 194.56 164.48">
                  </polygon>
              </g>
          </g>
      </svg>
      Cancel
    `;
  } else {
    selectAllButton.innerHTML = `
      <svg fill="black" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g data-name="Layer 2">
          <g data-name="checkmark-circle">
          <rect width="24" height="24" opacity="0"/>
          <path d="M9.71 11.29a1 1 0 0 0-1.42 1.42l3 3A1 1 0 0 0 12 16a1 1 0 0 0 .72-.34l7-8a1 1 0 0 0-1.5-1.32L12 13.54z"/>
          <path d="M21 11a1 1 0 0 0-1 1 8 8 0 0 1-8 8A8 8 0 0 1 6.33 6.36 7.93 7.93 0 0 1 12 4a8.79 8.79 0 0 1 1.9.22 1 1 0 1 0 .47-1.94A10.54 10.54 0 0 0 12 2a10 10 0 0 0-7 17.09A9.93 9.93 0 0 0 12 22a10 10 0 0 0 10-10 1 1 0 0 0-1-1z"/>
          </g>
          </g>
      </svg>
      Select All
    `;
  }
});

const form = document.querySelector("form[action='/delete']");
const input = document.getElementById("selected-ids-input");
form.addEventListener("submit", (e) => {
  const selectedIds = [...document.querySelectorAll(".selected-books")]
    .map(el => el.dataset.id);
  input.value = JSON.stringify(selectedIds);

});