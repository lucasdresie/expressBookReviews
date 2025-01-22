const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }
  
  else {
    //users.push = ({username, password});
    users[username] = { username, password }; // Store user as an object
    res.status(200).json({ message: "User registered successfully" });
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  })
  .then((books) => {
    res.status(200).json(books);
  })
  .catch((err) => {
    res.status(500).json({ message: "Internal Server Error" });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  })
  .then((book) => {
    res.status(200).json(book);
  })
  .catch((err) => {
    res.status(404).json({ message: err });
  });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  new Promise((resolve, reject) => {
    const author = req.params.author;
    const booksByAuthor = Object.keys(books).filter(isbn => books[isbn].author === author).map(isbn => books[isbn]);

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found by this author");
    }
  })
  .then((booksByAuthor) => {
    res.status(200).json(booksByAuthor);
  })
  .catch((err) => {
    res.status(404).json({ message: err });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  new Promise((resolve, reject) => {
    const title = req.params.title;
    const booksByTitle = Object.keys(books).filter(isbn => books[isbn].title === title).map(isbn => books[isbn]);

    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found with this title");
    }
  })
  .then((booksByTitle) => {
    res.status(200).json(booksByTitle);
  })
  .catch((err) => {
    res.status(404).json({ message: err });
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "No reviews found for this book" });
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
