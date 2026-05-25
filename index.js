import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  host: "",
  user: "",
  database: "",
  port: 5432,
  password: "",
});

db.connect();

const API_search_URL = "https://openlibrary.org/search.json?";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

async function getBooks() {
  const result = await db.query("SELECT * FROM books");

  return result.rows.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    notes: book.notes,
    cover_id: book.cover_id,
    start_date: book.start_date,
    pages: book.pages,
    read_pages: book.read_pages,
    finished: book.finished,
    date_added: book.date_added,
    date_finished: book.date_finished,
  }));
}

async function getBook(id) {
  const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
  const book = result.rows[0];

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    notes: book.notes,
    cover_id: book.cover_id,
    start_date: book.start_date,
    pages: book.pages,
    read_pages: book.read_pages,
    finished: book.finished,
    date_added: book.date_added,
    date_finished: book.date_finished,
  };
}

app.get("/", async (req, res) => {
  const sort = req.query.sort || "recently-added";
  const filter = req.query.filter || "all";

  let books = await getBooks();

  const total = books.length;

  if (filter === "reading") {
    books = books.filter((book) => !book.finished);
  } else if (filter === "finished") {
    books = books.filter((book) => book.finished);
  }

  if (sort === "title") {
    books.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sort === "progress") {
    books.sort((a, b) => {
      const progressA = a.pages > 0 ? a.read_pages / a.pages : 0;
      const progressB = b.pages > 0 ? b.read_pages / b.pages : 0;

      return progressB - progressA;
    });
  }

  if (sort === "recently-added") {
    books.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));
  }

  const booksWithPercent = books.map((book) => {
    const percent = book.pages > 0 ? (book.read_pages * 100) / book.pages : 0;
    return {
      ...book,
      percent: Math.round(percent),
    };
  });
  res.render("index.ejs", {
    books: booksWithPercent,
    currentSort: sort,
    currentFilter: filter,
    total: total,
  });
});

app.get("/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/new", async (req, res) => {
  const title = req.body.title;
  const author = req.body.author;
  const notes = req.body.notes;
  const start_date = req.body.started;
  const read_pages = req.body.read_pages;
  const finished = false;
  const pages = req.body.pages;

  const searchURL =
    API_search_URL +
    `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;

  const searchResult = await axios.get(searchURL);

  if (searchResult.data.docs.length == 0) {
    console.log("Book was not found");
    res.render("new.ejs", {
      error: "Book was not found 🙁",
    });
  } else {
    const cover_i = searchResult.data.docs?.[0]?.cover_i || null;
    const result = await db.query(
      "INSERT INTO books (title, author, notes, cover_id, start_date, read_pages, pages, finished) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [title, author, notes, cover_i, start_date, read_pages, pages, finished],
    );
    const id = result.rows[0].id;
    res.redirect(`/book/${id}`);
  }
});

app.get("/book/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const book = await getBook(id);

  const percent = book.pages > 0 ? (book.read_pages * 100) / book.pages : 0;

  let formattedDate = "Not set";
  if (book.start_date) {
    const date = new Date(book.start_date);
    if (!isNaN(date)) {
      formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

let readingDays = null;

if (book.start_date) {
  const start = new Date(book.start_date);
  const end = book.date_finished ? new Date(book.date_finished) : new Date();

  if (!isNaN(start)) {
    const diffTime = end - start;
    readingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
  res.render("book.ejs", {
    book,
    percent: Math.round(percent),
    formattedDate,
    readingDays,
  });
});

app.post("/edit/:id", async (req, res) => {
  let id = parseInt(req.params.id);
  let updatedNotes = req.body.notes;

  await db.query("UPDATE books SET notes = $1 WHERE id = $2", [
    updatedNotes,
    id,
  ]);
  res.redirect(`/book/${id}`);
});

app.post("/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  await db.query("DELETE FROM books WHERE id = $1", [id]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const ids = JSON.parse(req.body.ids || "[]");
  console.log(ids);
  if (ids.length > 0) {
    try {
      await db.query("DELETE FROM books where id = ANY($1::int[])", [ids]);
    } catch(error) {
      console.log(error);
    }
  } else {
    console.log("No books to delete");
  }

  res.redirect("/");
})

app.listen(port, () => {
  console.log("Server is listening on port", port);
});
