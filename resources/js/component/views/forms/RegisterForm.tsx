import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Google, Facebook } from "@mui/icons-material"; // MUI icons
import { TextField, Button, CircularProgress, Typography, Box } from "@mui/material"; // MUI components
import apiServices from "../../services/apiService";

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
  const [selectedRole, setSelectedRole] = useState("2");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get("role");
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
    <>
      {/* Registration Form */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <Typography variant="h4" className="text-center text-primary font-bold mb-4">
            CustMe
          </Typography>
          <Typography variant="h6" className="text-center text-gray-700 mb-6">
            Register Your Account
          </Typography>

          {/* Social Login Buttons */}
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Button
              variant="contained"
              startIcon={<Google />}
              className="bg-red-600 text-white w-[48%]"
            >
              Google
            </Button>
            <Button
              variant="contained"
              startIcon={<Facebook />}
              className="bg-blue-700 text-white w-[48%]"
            >
              Facebook
            </Button>
          </Box>

          <Typography className="text-center text-gray-500 mb-4">OR</Typography>

          {/* Registration Form Fields */}
          <form onSubmit={handleSubmit}>
            <Box mb={3} display="flex" gap={2}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={validateUsername}
                error={Boolean(usernameError)}
                helperText={usernameError}
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                error={Boolean(emailError)}
                helperText={emailError}
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validatePassword}
                error={Boolean(passwordError)}
                helperText={passwordError}
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={validateConfirmPassword}
                error={Boolean(confirmPasswordError)}
                helperText={confirmPasswordError}
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Zipcode"
                variant="outlined"
                fullWidth
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                onBlur={validateZipcode}
                error={Boolean(zipcodeError)}
                helperText={zipcodeError}
                required
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="bg-primary text-white py-2"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} className="text-white" /> : "Register"}
            </Button>
          </form>

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

          <div className="text-center mt-4">
            <Typography variant="body2">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold">
                Log In
              </Link>
            </Typography>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
