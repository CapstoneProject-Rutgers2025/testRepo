import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';  
import SignUp from './signup'; 
import Dashboard from "./dashboard";
import HomeScreen from './homescreen';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
