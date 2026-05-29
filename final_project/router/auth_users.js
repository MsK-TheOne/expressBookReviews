const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const reg_users = express.Router();

let users = [];

const isValid = (username) => {
  // Returns true if username is valid/not empty
  return username && username.trim().length > 0;
}

const authenticatedUser = (username, password) => {
  // Check if username and password match the registered records
  return users.some(user => user.username === username && user.password === password);
}

// Task 8: Only registered users can login
reg_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JSON Web Token valid for 1 hour
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    
    // Store the token and username in the session cookie storage
    req.session.authorization = { accessToken, username };
    
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 9: Add or modify a book review
reg_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review; // Extract review from URL query parameters
  const username = req.session.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required in query parameters" });
  }

  // If the book reviews object doesn't exist, initialize it
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Save or modify the review under the logged-in user's name
  books[isbn].reviews[username] = reviewText;
  
  return res.status(200).json({ 
    message: `The review for book with ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews 
  });
});

// Task 10: Delete a book review
reg_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const userReviewExists = books[isbn].reviews && books[isbn].reviews[username];
  
  if (userReviewExists) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: `Reviews for the ISBN ${isbn} posted by user ${username} deleted.` });
  } else {
    return res.status(404).json({ message: "No review found for this user on the specified book" });
  }
});

module.exports.authenticated = reg_users;
module.exports.isValid = isValid;
module.exports.users = users;