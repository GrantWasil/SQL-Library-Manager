const express = require("express");
const router = express.Router();
const Book = require("../models").Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

/* Get book list */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll({order: [["year", "DESC"]]});
    res.render("books/index", {books: books, title: "Book List"});
  })
);

/* Create a new book form. */
router.get("/new", (req, res) => {
  res.render("books/new", {book: {}, title: "New Book"});
});

/* POST create book. */
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        res.render("books/new", {
          book,
          errors: error.errors,
          title: "New Book"
        });
      } else {
        throw error; // error caught in the asyncHandler's catch block
      }
    }
  })
);

/* GET individual book. */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/show", {book, title: book.title});
    }
    res.render("books/notFound");
  })
);

/* Update an book. */
router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books/" + book.id);
      } else {
        res.render("books/notFound");
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id; // make sure correct article gets updated
        res.render(`books/show`, {
          book,
          errors: error.errors,
          title: "Edit Book"
        });
      } else {
        throw error;
      }
    }
  })
);

/* Delete individual book. */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.render("books/notFound");
    }
  })
);

module.exports = router;
