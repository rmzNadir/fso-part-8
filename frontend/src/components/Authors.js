import React, { useState } from 'react';
import Select from 'react-select';

import { useQuery, useMutation } from '@apollo/client';
import { ALL_AUTHORS } from '../queries';
import { EDIT_AUTHOR } from '../mutations';

const Authors = (props) => {
  const [author, setAuthor] = useState('');
  const [born, setBorn] = useState('');

  const { data } = useQuery(ALL_AUTHORS);
  const { allAuthors } = { ...data };

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    editAuthor({ variables: { id: author.value, born: +born } });

    setAuthor('');
    setBorn('');
  };

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {allAuthors &&
            allAuthors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <Select
          value={author}
          onChange={(e) => setAuthor(e)}
          options={
            allAuthors &&
            allAuthors.map((a) => ({ value: a.id, label: a.name }))
          }
        />
        <div>
          born
          <input
            type='number'
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>

        <button type='submit'>Update author</button>
      </form>
    </div>
  );
};

export default Authors;
