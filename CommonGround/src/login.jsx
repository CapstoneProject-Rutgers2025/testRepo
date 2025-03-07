
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleIcon from "./images/google-icon.png";
import {GoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode"; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:3000/login', { // Replace with your backend URL if deployed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token); // Store the JWT
            navigate("/dashboard"); // Navigate to the dashboard
        } else {
            const errorText = await response.text();
            setError(errorText || 'Login failed. Please try again.');
        }
    } catch (err) {
        console.error('Error during login:', err);
        setError('An error occurred. Please try again.');
    }


    // Simulated login response
    const simulatedResponse = { ok: true, token: "fake-token" };

    if (simulatedResponse.ok) {
      localStorage.setItem("token", simulatedResponse.token);
      navigate("/dashboard");
    } else {
      setError("Login failed. Please try again.");
    }
  };

  // Handle Google Login Success
  const handleGoogleLoginSuccess = (credentialResponse) => {
    const decodedToken = jwtDecode(credentialResponse.credential);
    console.log("Google User Info:", decodedToken);

    // Store the token and redirect
    localStorage.setItem("token", credentialResponse.credential);
    navigate("/dashboard");
  };

  // Handle Google Login Failure
  const handleGoogleLoginFailure = () => {
    console.error("Google Sign-In Failed");
    setError("Google Sign-In Failed. Please try again.");
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

            {/* Google Login Button */}
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;