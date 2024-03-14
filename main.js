const bookshelf = [];
const RENDER_EVENT = "render_books";

const STORAGE_KEY = "BOOKSHELF_APPS";
const SAVED_EVENT = "saved_books";

let SEARCH_STATE = false;
let SEARCH_KEYWORD = "";

//local Storage

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser anda Tidak mendukung Local Storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelf);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookshelf.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const bookShelfLabel = document.getElementById("bookShelfLabel");
  const isComplete = document.getElementById("inputBookIsComplete");
  isComplete.addEventListener("change", function () {
    if (isComplete.checked) {
      bookShelfLabel.innerText = "Selesai dibaca";
    } else {
      bookShelfLabel.innerText = "Belum selesai dibaca";
    }
  });

  const searchForm = document.getElementById("searchBook");
  const searchkeyword = document.getElementById("searchBookTitle");

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (searchkeyword.value) {
      SEARCH_STATE = true;
      SEARCH_KEYWORD = searchkeyword.value.toLowerCase();
    } else {
      SEARCH_STATE = false;
      SEARCH_KEYWORD = "";
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  searchkeyword.addEventListener("change", function () {
    if (!searchkeyword.value) {
      SEARCH_STATE = false;
      SEARCH_KEYWORD = "";

      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  incompleteBookshelfList.innerHTML = "";

  const completeBookshelfList = document.getElementById("completeBookshelfList");
  completeBookshelfList.innerHTML = "";

  for (const book of filterBooks(bookshelf)) {
    const bookElemet = makeBookItem(book);

    if (book.isComplete) {
      completeBookshelfList.append(bookElemet);
    } else {
      incompleteBookshelfList.append(bookElemet);
    }
  }
});

function generateBook(title, author, publishedYear, isComplete) {
  return {
    id: +new Date(),
    title: title,
    author: author,
    year: Number(publishedYear),
    isComplete: isComplete,
  };
}

function findBook(bookid) {
  for (const bookItem of bookshelf) {
    if (bookItem.id === bookid) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookid) {
  for (const index in bookshelf) {
    if (bookshelf[index].id === bookid) {
      return index;
    }
  }
  return -1;
}

function filterBooks(booksToFilter) {
  if (!SEARCH_STATE) {
    return booksToFilter;
  }

  const filteredBooks = [];
  const searchRegex = new RegExp(SEARCH_KEYWORD);

  for (const book of booksToFilter) {
    if (searchRegex.test(book.title.toLowerCase())) {
      filteredBooks.push(book);
    }
  }

  return filteredBooks;
}

function makeBookItem(book) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = book.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${book.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${book.year}`;

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textTitle, textAuthor, textYear);
  container.setAttribute("id", `book-${book.id}`);

  if (book.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.innerText = "Belum selesai dibaca";
    undoButton.classList.add("blue");

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus buku";
    trashButton.classList.add("red");

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");
    actionContainer.append(undoButton, trashButton);

    container.append(actionContainer);

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(book.id);
    });

    trashButton.addEventListener("click", function () {
      removeBook(book.id);
    });
  } else {
    const completeButton = document.createElement("button");
    completeButton.innerText = "Selesai dibaca";
    completeButton.classList.add("blue");

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus buku";
    trashButton.classList.add("red");

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");
    actionContainer.append(completeButton, trashButton);

    container.append(actionContainer);

    completeButton.addEventListener("click", function () {
      addBookToCompleted(book.id);
    });

    trashButton.addEventListener("click", function () {
      removeBook(book.id);
    });
  }

  return container;
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const publishedYear = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const book = generateBook(title, author, publishedYear, isComplete);
  bookshelf.push(book);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const book = findBook(bookId);

  if (book == null) return;

  book.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const book = findBook(bookId);

  if (book == null) return;

  book.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  bookshelf.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}
