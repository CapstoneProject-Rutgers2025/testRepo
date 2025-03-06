import React, { useState} from "react";
import { Link } from "react-router-dom";
import "./index.css";
import googleIcon from './images/google-icon.png';

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:3000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: fullName, email, password }),
        });
  
        if (response.ok) {
          alert('User created successfully!');
        } else {
          const errorText = await response.text();
          alert('Error creating user: ' + errorText);
        }
      } catch (err) {
        alert('Error creating user: ' + err.message);
      }
    };

  return (
    <div className="container">
      {/* Left Half - Mint Green Background */}
      <div className="left-side"></div>

      {/* Right Half - Sign Up Form */}
      <div className="right-side">
        <div className="form-container">
          <h1>Sign Up</h1>
          <p>Please enter your details to create an account.</p>
          
          
          <form onSubmit = {handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="info@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">Sign Up</button>

            <p className="signup-text">
              Already have an account? <Link to="/">Log in</Link>
            </p>

            <div className="separator">or continue with</div>

            {/* Google Sign Up Button */}
            <button className="google-btn">
              <img src={googleIcon} alt="Google logo" />
              Sign up with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
 };


export default SignUp;