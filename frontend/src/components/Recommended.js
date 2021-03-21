import React from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS, CURRENT_USER } from '../queries';

const Recommended = ({ show }) => {
  const { data } = useQuery(ALL_BOOKS);
  const { data: currentUserData } = useQuery(CURRENT_USER);

  const { allBooks } = { ...data };
  const { me } = { ...currentUserData };

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <strong>{me && me.favoriteGenre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {allBooks &&
            allBooks
              .filter((b) => b.genres.includes(me && me.favoriteGenre))
              .map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommended;
