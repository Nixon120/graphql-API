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
  }
`);

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'nixon',
  password: 'Maya100$',
  database: 'logging_db',
  connectionLimit: 10, // Adjust this based on your requirements
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
  console.log('GraphQL server is running on http://localhost:4000/graphql');
});
