import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_BOOK } from '../mutations';
import { ALL_BOOKS, ALL_AUTHORS } from '../queries';
import GenreSelector from './GenreSelector';

const NewBook = (props) => {
  const [title, setTitle] = useState('');
  const [author, setAuhtor] = useState('');
  const [born, setBorn] = useState('');
  const [published, setPublished] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [existsAlready, setExistsAlready] = useState(false);
  const [bookGenres, setBookGenres] = useState([]);
  // const [queries, setQueries] = useState([{ query: ALL_AUTHORS }]);

  const { data } = useQuery(ALL_BOOKS);

  const { allBooks } = { ...data };

  const [addBook] = useMutation(ADD_BOOK, {
    // We removed query "ALL_BOOKS" so the cache update
    // is now done by the function "updateAllBooksCache"
    // after the subscription returns info of a new book
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (e) => console.log(e),
  });

  useEffect(() => {
    if (allBooks) {
      const allGenres = allBooks
        .map((b) => b.genres)
        .flat()
        .filter((v, i, a) => a.indexOf(v) === i);

      setBookGenres(allGenres);
    }
  }, [allBooks]);

  useEffect(() => {
    const exists =
      bookGenres &&
      bookGenres.find((g) => g.toLowerCase() === genre.toLowerCase());
    exists ? setExistsAlready(true) : setExistsAlready(false);
  }, [genre, bookGenres]);

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    addBook({
      variables: {
        title,
        published: +published,
        author: { name: author, born: born.length > 0 ? +born : null },
        genres,
      },
    });

    setTitle('');
    setPublished('');
    setAuhtor('');
    setGenres([]);
    setGenre('');
    setBorn('');
    setBookGenres([]);
  };

  const addGenre = () => {
    setBookGenres([...bookGenres, genre]);
    setGenres(genres.concat(genre));
    setGenre('');
    // setQueries([...queries, { query: ALL_BOOKS }]);
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          born
          <input
            type='number'
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>

        {bookGenres &&
          bookGenres.map((g, i) => (
            <GenreSelector
              genre={g}
              key={i}
              genres={genres}
              setGenres={setGenres}
            />
          ))}

        {existsAlready && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            Genre {genre} already exists!
          </p>
        )}

        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type='button' disabled={existsAlready}>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type='submit'>create book</button>
      </form>
    </div>
  );
};

export default NewBook;
