import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../mutations';

const LoginForm = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [login, result] = useMutation(LOGIN, {
    onError: (e) => {
      console.log('Error', e);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem('lbryUserToken', token);
    }
  }, [result.data]); // eslint-disable-line

  const submit = async (event) => {
    event.preventDefault();

    login({ variables: { username, password } });
  };

  return (
    <form onSubmit={submit}>
      <div>
        Username
        <input
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        Password
        <input
          type='password'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type='submit'>Login</button>
    </form>
  );
};

export default LoginForm;
