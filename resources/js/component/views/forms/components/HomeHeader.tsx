import React from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';

const HomeHeader = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#f3f4f6' }} elevation={24}>
      <Toolbar className="container mx-auto flex justify-between items-center py-2 px-6">
        {/* Logo */}
        <Typography variant="h6" component="div" className="text-yellow-500 font-bold">
          <span className="text-blue-600">Cust</span>Me
        </Typography>

        {/* Navigation Links */}
        <Box className="flex items-center space-x-4">
          <nav className="flex space-x-4">
            <NavLink to="/" className="text-black hover:text-yellow-500">
              Home
            </NavLink>
            <NavLink to="/about" className="text-black hover:text-yellow-500">
              About
            </NavLink>
            <NavLink to="/services" className="text-black hover:text-yellow-500">
              Services
            </NavLink>
          </nav>

          {/* Sign in Button */}
          <Button 
            component={NavLink}
            to="/login"
            className="text-black bg-yellow-300" 
            variant="outlined" 
          >
            Sign in
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HomeHeader;
