import React from "react";
import { Link } from "react-router-dom";
import "./index.css";
import googleIcon from './images/google-icon.png';

const Login = () => {
  return (
    <div className="container">
      {/* Left Half - Mint Green Background */}
      <div className="left-side"></div>

      {/* Right Half - Login Form */}
      <div className="right-side">
        <div className="form-container">
          <h1>Login</h1>
          <p>Please enter your login details to sign in.</p>
          
          <form>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="info@example.com" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Password" required />
            </div>

            <div className="options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span>Keep me logged in</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-btn">Log in</button>

            <p className="signup-text">
              Don’t have an account? <Link to="/signup">Sign up</Link>
            </p>

            <div className="separator">or continue with</div>

            {/* Google Login Button */}
            <button className="google-btn">
              <img src={googleIcon} alt="Google logo" />
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
