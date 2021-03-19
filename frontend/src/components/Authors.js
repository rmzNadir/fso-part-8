import React, {useState} from 'react';
import Select from 'react-select';


import { useQuery, useMutation } from '@apollo/client';
import { ALL_AUTHORS } from '../queries';
import {EDIT_AUTHOR} from '../mutations'

const Authors = (props) => {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const { data } = useQuery(ALL_AUTHORS);
  const { allAuthors } = { ...data };

  const [addBook] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    addBook({ variables: { name:name.value, born: +born } });

    setName('');
    setBorn('')
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
      <h2>
        Set birthyear
      </h2>
      <form onSubmit={submit}>

      <Select
        value={name}
        onChange={(e)=>setName(e)}
        options={allAuthors && allAuthors.map(a=>({value:a.name, label:a.name}))}
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
