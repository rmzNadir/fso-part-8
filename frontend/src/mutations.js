import { gql } from '@apollo/client';

const inputDefs = gql`
  input AuthorInput {
    name: String!
    born: Int
  }
`;

export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $published: Int!
    $author: AuthorInput!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      published
      author {
        name
        born
      }
      genres
    }
  }
`;

export const EDIT_AUTHOR = gql`
  mutation editAuthor($id: String!, $born: Int!) {
    editAuthor(id: $id, born: $born) {
      name
      born
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;
