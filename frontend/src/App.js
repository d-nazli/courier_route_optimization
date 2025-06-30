import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import User from './pages/User';
import Courier from './pages/Courier';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user" element={<User />} />
        <Route path="/courier" element={<Courier />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
