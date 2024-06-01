const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const book = require("../models/book");
const debug = require("debug")("bookinstance");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: " Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();
  if (bookInstance === null) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book.id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookinstance = await BookInstance.findById(req.params.id)
    .populate({
      path: "book",
      select: "title",
      populate: {
        path: "author",
        select: "first_name family_name",
      },
    })
    .exec();
  debug(bookinstance);
  res.render("bookinstance_delete", {
    title: "Delete BookInstance",
    bookinstance: bookinstance,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookinstance = await BookInstance.findById(req.params.id)
    .populate({
      path: "book",
      select: "title",
      populate: {
        path: "author",
        select: "name",
      },
    })
    .exec();

  if (bookinstance === null) {
    res.redirect("/catalog/bookinstances");
  } else {
    await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
    res.redirect("/catalog/bookinstances");
  }
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookinstance, allBooks] = Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find().sort({ title: 1 }).exec(),
  ]);
  if (bookinstance === null) {
    const err = new Error("Book instance not found.");
    err.status = 404;
    next(err);
  }

  res.render("bookinstance_form", {
    title: "Update BookInstance",
    book_list: allBooks,
    selected_book: bookinstance.book._id,
    bookinstance: bookinstance,
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  body("book", "Book name is required.").trim().isLength({ min: 1 }).escape(),
  body("imprint", " Imprint must be specified.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back").optional({ values: "falsy" }).isISO8601().isDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const updatedBookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.status,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, "title").exec();

      res.render("book_form", {
        title: "Update BookInstance",
        selected_book: updatedBookInstance.book._id,
        book_list: allBooks,
        bookinstance: updatedBookInstance,
        errors: errors.array(),
      });
      return;
    } else {
      await BookInstance.findByIdAndUpdate(
        req.params.id,
        updatedBookInstance,
        {}
      );
      res.redirect(updatedBookInstance.url);
    }
  }),
];
