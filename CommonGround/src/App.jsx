import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';  
import SignUp from './signup'; 
import Dashboard from "./dashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
