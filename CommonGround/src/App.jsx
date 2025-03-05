import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';  // Ensure the path is correct
import SignUp from './signup'; // Ensure the path is correct

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  {/* Show Login by default */}
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
