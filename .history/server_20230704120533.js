const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

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

// In-memory data
const books = [
  { id: '1', title: 'Book 1', author: 'Author 1' },
  { id: '2', title: 'Book 2', author: 'Author 2' },
  { id: '3', title: 'Book 3', author: 'Author 3' },
];

// Define the resolver functions for the schema
const root = {
  book: ({ id }) => books.find(book => book.id === id),
  books: () => books,
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
