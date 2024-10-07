import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiServices from "../../services/apiService";
import { Google, Facebook } from "@mui/icons-material"; // Import MUI icons

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [zipcodeError, setZipcodeError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("2");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get('role');
    if (role) {
      setSelectedRole(role);
    }
  }, [location]);

  const validateEmail = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const validateUsername = () => {
    if (username.trim() === "") {
      setUsernameError("Username is required");
    } else {
      setUsernameError("");
    }
  };

  const validateZipcode = () => {
    if (zipcode.trim() === "") {
      setZipcodeError("Zipcode is required");
    } else {
      setZipcodeError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    validateEmail();
    validatePassword();
    validateConfirmPassword();
    validateUsername();
    validateZipcode();

    if (!emailError && !passwordError && !confirmPasswordError && !usernameError && !zipcodeError) {
      const userData = {
        username,
        email,
        password,
        firstname,
        lastname,
        zipcode,
        role_id: selectedRole,
      };

      apiServices
        .post("/register", userData)
        .then(() => {
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFirstname("");
          setLastname("");
          setZipcode("");
          setRegistrationSuccess(true);
        })
        .catch((error) => {
          console.error("Registration error:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setRegistrationSuccess(false);
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="absolute top-8 right-8">
        <Link to="/login" className="bg-yellow-500 text-white px-4 py-2 rounded">
          Log in
        </Link>
      </div>
      <div className="w-full max-w-md p-8 bg-blue-500 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-yellow-500 mb-8">
          <span className="text-blue-600">Cust</span>Me
        </h1>
        <h2 className="text-xl font-bold mb-4 text-center text-white">Register Account to CustMe</h2>
        <p className="text-center text-white mb-4">Connect with designer and printing provider</p>
        <div className="flex justify-center space-x-4 mb-4">
          <button className="bg-white text-blue-500 px-4 py-2 rounded flex items-center space-x-2">
            <Google className="w-4 h-4" />
            <span>Sign up with Google</span>
          </button>
          <button className="bg-white text-blue-500 px-4 py-2 rounded flex items-center space-x-2">
            <Facebook className="w-4 h-4" />
            <span>Sign up with Facebook</span>
          </button>
        </div>
        <div className="text-center text-white mb-4">OR</div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="p-2 rounded bg-white text-black w-1/2"
                placeholder="First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />
              <input
                type="text"
                className="p-2 rounded bg-white text-black w-1/2"
                placeholder="Last Name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </div>
            <input
              type="text"
              className="p-2 rounded bg-white text-black"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={validateUsername}
              required
            />
            {usernameError && <p className="text-xs text-red-500">{usernameError}</p>}
            <input
              type="text"
              className="p-2 rounded bg-white text-black"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validateEmail}
              required
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            <input
              type="password"
              className="p-2 rounded bg-white text-black"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validatePassword}
              required
            />
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            <input
              type="password"
              className="p-2 rounded bg-white text-black"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={validateConfirmPassword}
              required
            />
            {confirmPasswordError && <p className="text-xs text-red-500">{confirmPasswordError}</p>}
            <input
              type="text"
              className="p-2 rounded bg-white text-black"
              placeholder="Zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              onBlur={validateZipcode}
              required
            />
            {zipcodeError && <p className="text-xs text-red-500">{zipcodeError}</p>}
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
      {registrationSuccess && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Registration Successful</h3>
            <p className="py-4">Successfully registered!</p>
            <div className="modal-action">
              <button className="btn" onClick={handleModalClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
