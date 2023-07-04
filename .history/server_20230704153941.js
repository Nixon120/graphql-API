require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mysql = require('mysql2/promise');

// Define your GraphQL schema
const schema = buildSchema(`
  type Book {
    id: ID!
    title: String!
    author: String!
  }

  input BookInput {
    title: String!
    author: String!
  }

  type Query {
    book(id: ID!): Book
    books: [Book]
  }

  type Mutation {
    createBook(book: BookInput!): Book
    createBooks(books: [BookInput!]!): [Book]
    updateBook(id: ID!, book: BookInput!): Book
  }
`);

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
});

// Define the resolver functions for the schema
const root = {
  book: async ({ id }) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM books WHERE id = ?', [id]);
      return rows[0];
    } finally {
      connection.release();
    }
  },
  books: async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM books');
      return rows;
    } finally {
      connection.release();
    }
  },
  createBook: async ({ book }) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query('INSERT INTO books (title, author) VALUES (?, ?)', [
        book.title,
        book.author,
      ]);
      const [rows] = await connection.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
      return rows[0];
    } finally {
      connection.release();
    }
  },
  createBooks: async ({ books }) => {
    const connection = await pool.getConnection();
    try {
      const createdBooks = [];

      for (const book of books) {
        const [result] = await connection.query('INSERT INTO books (title, author) VALUES (?, ?)', [
          book.title,
          book.author,
        ]);

        const [rows] = await connection.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
        createdBooks.push(rows[0]);
      }

      return createdBooks;
    } finally {
      connection.release();
    }
  },
  updateBook: async ({ id, book }) => {
    const connection = await pool.getConnection();
    try {
      await connection.query('UPDATE books SET title = ?, author = ? WHERE id = ?', [
        book.title,
        book.author,
        id,
      ]);
      const [rows] = await connection.query('SELECT * FROM books WHERE id = ?', [id]);
      return rows[0];
    } finally {
      connection.release();
    }
  },
};

// Create an Express server
const app = express();

// Define the GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Enable GraphiQL for testing
  })
);

// Start the server
app.listen(4000, () => {
  console.log('
