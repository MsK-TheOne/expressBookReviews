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

// Task 2 & 11: Get the book list available in the shop using Async/Await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => Promise.resolve(books);
    const bookList = await getBooks();
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 3 & 12: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  const findBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found with this ISBN");
    }
  });

  findBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ message: error }));
});
  
// Task 4 & 13: Get book details based on author using Promises
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  
  const findBooksByAuthor = new Promise((resolve, reject) => {
    const matchedBooks = [];
    Object.keys(books).forEach(isbn => {
      if (books[isbn].author.toLowerCase() === author) {
        matchedBooks.push({ isbn, ...books[isbn] });
      }
    });
    
    if (matchedBooks.length > 0) {
      resolve(matchedBooks);
    } else {
      reject("No books found by this author");
    }
  });

  findBooksByAuthor
    .then((booksList) => res.status(200).json(booksList))
    .catch((error) => res.status(404).json({ message: error }));
});

// Task 5 & 14: Get all books based on title using Async/Await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  
  try {
    const findBooksByTitle = () => Promise.resolve(
      Object.keys(books)
        .filter(isbn => books[isbn].title.toLowerCase() === title)
        .map(isbn => ({ isbn, ...books[isbn] }))
    );

    const matchedBooks = await findBooksByTitle();
    
    if (matchedBooks.length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error processing request" });
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

module.exports.general = public_users;
