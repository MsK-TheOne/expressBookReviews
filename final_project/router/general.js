const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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

// Task 2: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Task 3: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found with this ISBN" });
  }
});
  
// Task 4: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchedBooks = [];
  
  Object.keys(books).forEach(isbn => {
    if (books[isbn].author.toLowerCase() === author) {
      matchedBooks.push({ isbn, ...books[isbn] });
    }
  });

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Task 5: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchedBooks = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].title.toLowerCase() === title) {
      matchedBooks.push({ isbn, ...books[isbn] });
    }
  });

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 6: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this ISBN" });
  }
});

// ==========================================
// TASK 11-14: ASYNC / PROMISE EXTENSIONS WITH AXIOS
// ==========================================
const axios = require('axios');

// Task 11: Retrieve all books using Async/Await
async function getAllBooksAsync() {
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log("Task 11 Complete: All books retrieved via Async/Await.");
    return response.data;
  } catch (error) {
    console.error("Error in Task 11:", error.message);
  }
}

// Task 12: Search for a book by ISBN using Promises
function getBookByISBNPromise(isbn) {
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      console.log("Task 12 Complete: Book found via Promises:", response.data);
    })
    .catch(error => {
      console.error("Error in Task 12:", error.message);
    });
}

// Task 13: Search for a book by Author using Async/Await or Promises
function getBookByAuthorPromise(author) {
  axios.get(`http://localhost:5000/author/${author}`)
    .then(response => {
      console.log("Task 13 Complete: Books by author found:", response.data);
    })
    .catch(error => {
      console.error("Error in Task 13:", error.message);
    });
}

// Task 14: Search for a book by Title using Async/Await or Promises
function getBookByTitlePromise(title) {
  axios.get(`http://localhost:5000/title/${title}`)
    .then(response => {
      console.log("Task 14 Complete: Books by title found:", response.data);
    })
    .catch(error => {
      console.error("Error in Task 14:", error.message);
    });
}

module.exports.general = public_users;
