const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Define your GraphQL schema
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// Define the resolver functions for the schema
const root = {
  hello: () => 'Hello, World!',
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
