import React from "react";
import { Link } from "react-router-dom";
import "./index.css";
import googleIcon from './images/google-icon.png';

const SignUp = () => {
  return (
    <div className="container">
      {/* Left Half - Mint Green Background */}
      <div className="left-side"></div>

      {/* Right Half - Sign Up Form */}
      <div className="right-side">
        <div className="form-container">
          <h1>Sign Up</h1>
          <p>Please enter your details to create an account.</p>
          
          <form>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" required />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="info@example.com" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Create a password" required />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm your password" required />
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