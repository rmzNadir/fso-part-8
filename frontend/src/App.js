import React, { useState, useEffect } from 'react';
import { useApolloClient, useSubscription } from '@apollo/client';

import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import Recommended from './components/Recommended';
import { BOOK_ADDED } from './subscriptions';
import { ALL_BOOKS } from './queries';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useEffect(() => {
    const lsToken = localStorage.getItem('lbryUserToken');
    setToken(lsToken);
  }, []);

  const updateAllBooksCache = (newBook) => {
    const includedIn = (set, object) =>
      set.map((p) => p.id).includes(object.id);

    const dataInStore = client.readQuery({ query: ALL_BOOKS });
    const { allBooks } = dataInStore;
    if (!includedIn(allBooks, newBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: [...allBooks, newBook] },
      });
    }
  };

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({
      subscriptionData: {
        data: {
          bookAdded,
          bookAdded: {
            author: { name },
            title,
          },
        },
      },
    }) => {
      updateAllBooksCache(bookAdded);
      alert(`New book '${title}' by ${name}`);
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.removeItem('lbryUserToken');
    client.resetStore();
  };

  if (!token) {
    return (
      <>
        <h2>Login</h2>
        <LoginForm setToken={setToken} />
      </>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommended')}>recommended</button>

        <button onClick={logout}>logout</button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Recommended show={page === 'recommended'} />
    </div>
  );
};

export default App;
