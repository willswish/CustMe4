import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Google as GoogleIcon, Facebook as FacebookIcon } from '@mui/icons-material';
import { CircularProgress, TextField, Button } from '@mui/material';

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user?.role?.rolename) {
        case "Admin":
          navigate("/admin");
          break;
        case "User":
          navigate("/user");
          break;
        case "Graphic Designer":
          navigate("/graphic-designer");
          break;
        case "Printing Shop":
          navigate("/printing-shop");
          break;
        default:
          navigate("/register");
      }
    }
  }, [user, navigate]);

  const validateEmail = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailError("Invalid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      try {
        const isLoggedIn = await login(email, password);
        if (!isLoggedIn) {
          setEmailError("Invalid email or password");
          setPasswordError("Invalid email or password");
        }
      } catch (error) {
        console.error("An error occurred during login:", error);
        setEmailError("An unexpected error occurred. Please try again later.");
        setPasswordError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md w-full p-8 rounded-lg shadow-lg bg-white mx-auto mt-10">
      <h1 className="text-4xl font-bold text-primary text-center mb-4">CustMe</h1>
      <p className="text-center text-gray-600 mb-6">
        Connect with designers and printing providers
      </p>

      {/* Social Login Buttons */}
      <div className="flex justify-between mb-6">
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          className="bg-red-600 text-white w-[48%] p-2 rounded-lg"
        >
          Google
        </Button>
        <Button
          variant="contained"
          startIcon={<FacebookIcon />}
          className="bg-blue-700 text-white w-[48%] p-2 rounded-lg"
        >
          Facebook
        </Button>
      </div>

      <p className="text-center text-gray-500 mb-4">OR</p>

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
            error={Boolean(emailError)}
            helperText={emailError}
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validatePassword}
            error={Boolean(passwordError)}
            helperText={passwordError}
            disabled={isLoading}
          />
        </div>

        <Link
          to="/forgot-password"
          className="text-right block text-sm text-primary hover:underline mb-4"
        >
          Forgot Password?
        </Link>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading}
          className="bg-primary text-white py-2 rounded-lg"
        >
          {isLoading ? <CircularProgress size={24} className="text-white" /> : "Log In"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-primary font-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
