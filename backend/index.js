require('dotenv').config();

const { ApolloServer, UserInputError, gql } = require('apollo-server');
const { v4: uuid } = require('uuid');

const mongoose = require('mongoose');
const Author = require('./models/author');
const Book = require('./models/book');
const author = require('./models/author');
const { NetworkAuthenticationRequire } = require('http-errors');

const { MONGODB_URI } = process.env;
const { ObjectId } = mongoose.Types;

console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

let authors = [
  {
    name: 'Robert Martin',
    id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
    born: 1963,
  },
  {
    name: 'Fyodor Dostoevsky',
    id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
    born: 1821,
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e',
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e',
  },
];

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 */

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
    genres: ['agile', 'patterns', 'design'],
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'patterns'],
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'design'],
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'crime'],
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'revolution'],
  },
];

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  input AuthorInput {
    name: String!
    born: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genres: [String!]): [Book!]!
    allAuthors: [Author!]
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: AuthorInput!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, { author, genres }) => {
      if (author && genres) {
        return Book.find({
          genres: { $in: genres },
          author: ObjectId(author),
        }).populate('author');
      }
      if (author) {
        return Book.find({ author: ObjectId(author) }).populate('author');
      }
      if (genres) {
        return Book.find({ genres: { $in: genres } }).populate('author');
      }
      return Book.find({});
    },
    allAuthors: () => Author.find({}),
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author.name });

      if (await Book.findOne({ title: args.title })) {
        throw new UserInputError('Book already exists', {
          invalidArgs: [args.title],
        });
      }

      if (!author) {
        author = new Author({ ...args.author });
        try {
          await author.save();
        } catch (e) {
          throw new UserInputError(e.message, {
            invalidArgs: args.author,
          });
        }
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: author,
        genres: args.genres,
      });

      try {
        await book.save();
      } catch (e) {
        const { author, ...bookArgs } = args;
        throw new UserInputError(e.message, {
          invalidArgs: bookArgs,
        });
      }

      return book;
    },
    editAuthor: (root, args) => {
      let author = authors.find((a) => a.name === args.name);

      if (!author) {
        return null;
      }

      author = { ...author, born: args.setBornTo };
      authors = authors.map((a) => (a.name === args.name ? author : a));
      return author;
    },
  },
  Author: {
    bookCount: (root) => {
      return Book.find({ author: ObjectId(root.id) }).countDocuments();
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

// Mutation example

/* 
The object below the addBook call is used to specify the return values of the mutation.
  {
    title,
    author
  }

  Ej. the mutation below will return the next object as a response
  {
  "data": {
    "addBook": {
      "title": "Pimeyden tangoxddd",
      "author": "Reijo Mäki"
    }
  }
}
*/

// mutation {
//   addBook(
//     title: "Pimeyden tangoxddd",
//     author: "Reijo Mäki",
//     published: 1997,
//     genres: ["crime"]
//   ) {
//     title,
//     author
//   }
// }
