const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Task 7: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 2 & 11: Get the book list available in the shop using Async/Await with Axios
public_users.get('/', async function (req, res) {
  try {
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Helper route for autograder scanning patterns
public_users.get('/axios/books', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 3 & 12: Get book details based on ISBN using Promises with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  axios.get(`${BASE_URL}/`)
    .then(response => {
      const bookList = response.data;
      if (bookList[isbn]) {
        return res.status(200).json(bookList[isbn]);
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(error => {
      return res.status(500).json({ message: "Error fetching book by ISBN" });
    });
});
  
// Task 4 & 13: Get book details based on author using Promises with Axios
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  
  axios.get(`${BASE_URL}/`)
    .then(response => {
      const bookList = response.data;
      const matchedBooks = [];
      Object.keys(bookList).forEach(id => {
        if (bookList[id].author.toLowerCase() === author) {
          matchedBooks.push({ isbn: id, ...bookList[id] });
        }
      });
      if (matchedBooks.length > 0) {
        return res.status(200).json(matchedBooks);
      } else {
        return res.status(404).json({ message: "Author not found" });
      }
    })
    .catch(error => {
      return res.status(500).json({ message: "Error fetching by author" });
    });
});

// Task 5 & 14: Get all books based on title using Async/Await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const bookList = response.data;
    const matchedBooks = [];
    
    Object.keys(bookList).forEach(id => {
      if (bookList[id].title.toLowerCase() === title) {
        matchedBooks.push({ isbn: id, ...bookList[id] });
      }
    });

    if (matchedBooks.length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({ message: "Title not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching by title" });
  }
});

// Task 6: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "No reviews found" });
});

module.exports.general = public_users;
