require('dotenv').config();

const {
  ApolloServer,
  UserInputError,
  AuthenticationError,
  gql,
} = require('apollo-server');

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Author = require('./models/author');
const Book = require('./models/book');
const User = require('./models/user');

const { MONGODB_URI, JWT_SECRET } = process.env;
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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genres: [String!]): [Book!]!
    allAuthors: [Author!]
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: AuthorInput!
      genres: [String!]!
    ): Book
    editAuthor(id: String!, born: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
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
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

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
    createUser: async (root, { username, favoriteGenre }) => {
      const user = new User({ username, favoriteGenre });

      try {
        user.save();
      } catch (e) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      return user;
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'papope') {
        throw new UserInputError('Wrong credentials');
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
    editAuthor: async (root, { id, ...newInfo }, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      const updatedAuthor = await Author.findByIdAndUpdate(
        id,
        { ...newInfo },
        { new: true }
      );

      return updatedAuthor;
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
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);

      const currentUser = await User.findById(decodedToken.id).populate(
        'friends'
      );
      return { currentUser };
    }
  },
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
