import React, { useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { ALL_BOOKS, CURRENT_USER } from '../queries';

const Recommended = ({ show }) => {
  const [genre, setGenre] = useState('');

  const [getRecommended, { loading, data }] = useLazyQuery(ALL_BOOKS, {
    variables: { genres: [genre] },
  });
  const { data: currentUserData } = useQuery(CURRENT_USER);

  const { allBooks } = { ...data };
  const { me } = { ...currentUserData };

  useEffect(() => {
    if (me) {
      setGenre(me.favoriteGenre);
      getRecommended();
    }
  }, [me, getRecommended]);

  if (!show) {
    return null;
  }

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <strong>{genre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {allBooks &&
            allBooks.map((a) => (
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
