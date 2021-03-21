import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries';

const Books = (props) => {
  const [activeGenre, setActiveGenre] = useState(null);

  const { data } = useQuery(ALL_BOOKS);
  const { allBooks } = { ...data };

  let genres = [];

  if (allBooks) {
    genres = allBooks
      .map((b) => b.genres)
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i);
  }

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>books</h2>
      {activeGenre && (
        <div>
          in genre <strong>{activeGenre}</strong>
        </div>
      )}
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {activeGenre
            ? allBooks &&
              allBooks
                .filter((b) => b.genres.includes(activeGenre))
                .map((a) => (
                  <tr key={a.title}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
                  </tr>
                ))
            : allBooks &&
              allBooks.map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
        </tbody>
      </table>
      {genres.map((g, i) => (
        <button key={i} onClick={() => setActiveGenre(g)}>
          {g}
        </button>
      ))}
      {activeGenre && (
        <button onClick={() => setActiveGenre(null)}>all genres</button>
      )}
    </div>
  );
};

export default Books;
