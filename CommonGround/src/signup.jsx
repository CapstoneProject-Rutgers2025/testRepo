import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./index.css";

const SignUp = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('https://testrepo-hkzu.onrender.com/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: fullName, email, password }),
            });

            if (response.ok) {
                alert('User created successfully!');
                navigate('/dashboard');
            } else {
                const errorText = await response.text();
                setError('Error creating user: ' + errorText);
            }
        } catch (err) {
            setError('Error creating user: ' + err.message);
        }
    };

    const handleGoogleSignupSuccess = (credentialResponse) => {
        try {
            const decodedToken = jwtDecode(credentialResponse.credential);
            console.log("Google User Info:", decodedToken);
            localStorage.setItem("token", credentialResponse.credential);
            navigate("/dashboard");
        } catch (err) {
            console.error("Error decoding Google token:", err);
            setError("Google Sign-Up Failed. Please try again.");
        }
    };
    

    // Handle Google Sign-Up Failure
    const handleGoogleSignupFailure = () => {
        console.error("Google Sign-Up Failed");
        setError("Google Sign-Up Failed. Please try again.");
    };

    return (
        <div className="container">
            <div className="left-side"></div>

            <div className="right-side">
                <div className="form-container">
                    <h1>Sign Up</h1>
                    <p>Please enter your details to create an account.</p>

                    {error && <p className="error-message">{error}</p>}

                    <form onSubmit={handleSubmit}>
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

                        {/* Google Sign-Up Button */}
                        <GoogleLogin
                            onSuccess={handleGoogleSignupSuccess}
                            onError={handleGoogleSignupFailure}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
