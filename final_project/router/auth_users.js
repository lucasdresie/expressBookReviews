const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const SECRET_KEY = "fingerprint_customer";

const users = {}; // Assuming users is an object

function isValid(username) {
  return users.hasOwnProperty(username);
}

function authenticatedUser(username, password) {
  return users[username] && users[username].password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const username = decoded.username;
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = [];
    }

    const bookReviews = books[isbn].reviews;
    const userReview = Object.keys(bookReviews).find(r => r.username === username);
    if (userReview) {
      userReview.review = review;
    } else {
      books[isbn].reviews[username] = review;
    }
    console.log(books[isbn].reviews);
    return res.status(200).json({ message: "Review added/updated successfully" });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (!books[isbn].reviews) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }

    books[isbn].reviews = Object.keys(books[isbn].reviews).find(r => r.username !== username);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
