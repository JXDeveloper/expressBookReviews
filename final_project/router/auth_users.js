const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) =>
  !!users.find((user) => user.username === username && user.password === password);

//only registered users can login
regd_users.post("/login", (req, res) => {
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

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, "my_secret_key", { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  }

  return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!review) {
    return res.status(400).json({
      error: "bad request",
      message: "Missing required field: 'review'",
    });
  }

  const username = req.session.authorization["username"];
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: `@${username} review is set to '${books[isbn].reviews[username]}'!` });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization["username"];
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: `@${username} review is deleted` });
  }
  return res.status(200).json({ message: `@${username} had no review` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
