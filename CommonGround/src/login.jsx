import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleIcon from "./images/google-icon.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  
    const simulatedResponse = { ok: true, token: "fake-token" };
  
    if (simulatedResponse.ok) {
      localStorage.setItem("token", simulatedResponse.token);
      navigate("/dashboard"); 
    } else {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="left-side"></div>
      <div className="right-side">
        <div className="form-container">
          <h1>Login</h1>
          <p>Please enter your login details to sign in.</p>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
