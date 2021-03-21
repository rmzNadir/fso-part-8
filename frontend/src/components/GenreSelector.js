import React, { useState, useEffect } from 'react';

const GenreSelector = ({ genre, genres, setGenres }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checked
      ? setGenres([...genres, genre])
      : setGenres(genres.filter((g) => g !== genre));
  }, [checked]); // eslint-disable-line

  return (
    <div>
      <input
        type='radio'
        value={genre}
        checked={checked}
        onChange={() => null}
        onClick={() => setChecked(!checked)}
      />
      <label htmlFor={genre}>{genre}</label>
    </div>
  );
};

export default GenreSelector;
