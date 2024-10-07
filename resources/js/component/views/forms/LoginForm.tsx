import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GoogleIcon from '@mui/icons-material/Google'; // Import MUI Google icon
import FacebookIcon from '@mui/icons-material/Facebook'; // Import MUI Facebook icon

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
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="absolute top-8 right-8">
        <Link to="/register" className="bg-yellow-500 text-white px-4 py-2 rounded">
          Sign up
        </Link>
      </div>
      <div className="w-full max-w-md p-8 bg-blue-500 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-yellow-500 mb-8">
          <span className="text-blue-600">Cust</span>Me
        </h1>
        <h2 className="text-xl font-bold mb-4 text-center text-white">Log in Account to CustMe</h2>
        <p className="text-center text-white mb-4">Connect with designer and printing provider</p>
        <div className="flex justify-center space-x-4 mb-4">
          <button className="bg-white text-blue-500 px-4 py-2 rounded flex items-center space-x-2">
            <GoogleIcon className="w-4 h-4" />
            <span>Sign up to Google</span>
          </button>
          <button className="bg-white text-blue-500 px-4 py-2 rounded flex items-center space-x-2">
            <FacebookIcon className="w-4 h-4" />
            <span>Sign up to Facebook</span>
          </button>
        </div>
        <div className="text-center text-white mb-4">OR</div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col text-white">
              Email
              <input
                type="text"
                className="p-2 rounded bg-white text-black"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                disabled={isLoading}
              />
            </label>
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            <label className="flex flex-col text-white">
              Password
              <input
                type="password"
                className="p-2 rounded bg-white text-black"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validatePassword}
                disabled={isLoading}
              />
            </label>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            <Link to="/forgot-password" className="text-xs text-white text-right mb-4">
              Forgot Password?
            </Link>
            <button
              type="submit"
              className="bg-yellow-500 text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner loading-md"></span> : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
