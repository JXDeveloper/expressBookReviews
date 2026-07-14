const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username) {
    return res.status(400).json({
      error: "bad request",
      message: "Missing required field: 'username'",
    });
  }

  if (!password) {
    return res.status(400).json({
      error: "bad request",
      message: "Missing required field: 'password'",
    });
  }

  const doesUserExist = users.some((user) => user.username === username);
  if (doesUserExist) {
    return res.status(200).json({ message: "This user already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: `user with username @${username} registered successfully` });
});

const getAllUsers = () =>
  new Promise((res, rej) => {
    res(books);
  });

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return getAllUsers()
    .then((books) => res.status(200).send(JSON.stringify(books, null, 4)))
    .catch((err) => res.status(400).json({ error: "internal server error", message: "unable to get books data" }));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const book = books[req.params.isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book));
  }
  return res.status(200).json({ message: "Book was not found" });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  if (author) {
    const resultant_books = { books: [] };
    for (const book of Object.values(books)) {
      if (book.author === author) {
        resultant_books.books.push(book);
      }
    }
    if (resultant_books.books.length === 0) {
      return res.status(200).send({ message: "No book found of this author!" });
    }
    return res.status(200).send(JSON.stringify(resultant_books, null, 4));
  }
  return res.status(400).json({
    error: "bad request",
    message: "Missing required field: 'author'",
  });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  if (title) {
    const resultant_books = { books: [] };
    for (const book of Object.values(books)) {
      if (book.title === title) {
        resultant_books.books.push(book);
      }
    }
    if (resultant_books.books.length === 0) {
      return res.status(200).send({ message: "No book found with this title!" });
    }
    return res.status(200).send(JSON.stringify(resultant_books, null, 4));
  }
  return res.status(400).json({
    error: "bad request",
    message: "Missing required field: 'title'",
  });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (isbn) {
    const book = books[isbn];

    if (book) {
      return res.status(200).send(JSON.stringify({ reviews: book.reviews }));
    }
    return res.status(200).json({ message: "Book was not found with this ISBN" });
  }
  return res.status(400).json({
    error: "bad request",
    message: "Missing required field: 'isbn'",
  });
});

module.exports.general = public_users;
