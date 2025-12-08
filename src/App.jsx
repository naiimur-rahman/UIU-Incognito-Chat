import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Chat from './components/Chat';
import Layout from './components/Layout';

function App() {
  const { currentUser } = useAuth();

  return (
    <Layout>
      {!currentUser ? <Login /> : <Chat />}
    </Layout>
  );
}

export default App;
