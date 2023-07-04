const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mysql = require('mysql2');

// MySQL database configuration
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'nixon',
  password: 'Maya100$',
  database: 'logging_db',
});

// Connect to MySQL database
connection.connect(error => {
  if (error) {
    console.error('Error connecting to the database:', error);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Define your GraphQL schema
const schema = buildSchema(`
  type Book {
    id: ID!
    title: String!
    author: String!
  }

  type Query {
    book(id: ID!): Book
    books: [Book]
  }
`);

// Define the resolver functions for the schema
const root = {
  book: ({ id }) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM books WHERE id = ?';
      connection.query(query, [id], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  },
  books: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM books';
      connection.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  },
};

// Create an Express server
const app = express();

// Define the GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Enable GraphiQL for testing
}));

// Start the server
app.listen(4000, () => {
  console.log('GraphQL server is running on http://localhost:4000/graphql');
});
