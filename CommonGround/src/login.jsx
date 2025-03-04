import React, { useState } from "react";
import './index.css'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    console.log("Logging in with", { email, password });

    setError("");
  };

  return (
    <div className="site-wrap d-md-flex align-items-stretch">
      <div className="bg-img" style={{ backgroundImage: "url('images/mint.jpg')" }}></div>
      <div className="form-wrap">
        <div className="form-inner">
          <h1 className="title">Login</h1>
          <p className="caption mb-4">Please enter your login details to sign in.</p>

          <form onSubmit={handleSubmit} className="pt-3">
            <div className="form-floating">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="info@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">Email Address</label>
            </div>

            <div className="form-floating position-relative">
              <span
                className={`password-show-toggle ${showPassword ? "active" : ""}`}
                onClick={togglePasswordVisibility}
              >
                <span className="uil"></span>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">Password</label>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="d-flex justify-content-between">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="remember" />
                <label htmlFor="remember" className="form-check-label">Keep me logged in</label>
              </div>
              <div><a href="#">Forgot password?</a></div>
            </div>

            <div className="d-grid mb-4">
              <button type="submit" className="btn btn-primary">Log in</button>
            </div>

            <div className="mb-2">Don’t have an account? <a href="signup.jsx">Sign up</a></div>

            <div className="social-account-wrap">
              <h4 className="mb-4"><span>or continue with</span></h4>
              <ul className="list-unstyled social-account d-flex justify-content-between">
                <li><a href="#"><img src="images/google-icon.png" alt="Google logo" /></a></li>
              </ul>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
