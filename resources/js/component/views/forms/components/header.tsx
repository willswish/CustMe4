import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { FaHome, FaPlus, FaTasks, FaSignOutAlt, FaComments, FaShoppingCart, FaPencilRuler } from 'react-icons/fa';
import NotificationsDropdown from '../components/NotificationsDropDown';
import Avatar from '@mui/material/Avatar';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* AppBar */}
      <AppBar position="fixed" color="inherit" elevation={1} sx={{ backgroundColor: '#fff', width: '100%' }}>
        <Toolbar className="flex justify-between items-center">
          {/* Hamburger Menu Icon for Sidebar */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar} // Toggle sidebar open/close
            sx={{ marginRight: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo and Title Section */}
          <Box display="flex" alignItems="center">
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
              <span style={{ color: '#2563eb' }}>Cust</span>Me
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#000', ml: 2 }}>
              Dashboard
            </Typography>
          </Box>

          {/* Notifications Dropdown */}
          <Box display="flex" alignItems="center" sx={{ ml: 'auto' }}>
            <NotificationsDropdown />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary" // Temporary drawer for pop-out
        anchor="left"
        open={isSidebarOpen}
        onClose={toggleSidebar} // Close the sidebar when clicking outside
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#707070',
            color: 'black',
          },
        }}
      >
        <List>
            {user && (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4} mb={2}>
          <Avatar
            src={user.personal_information?.profilepicture || 'https://via.placeholder.com/40'}
            alt="Profile"
            sx={{ width: 64, height: 64, mb: 1 }}
          />
          <NavLink to={`/users/${user.id}/profile`} className="text-white text-sm hover:underline">
            {user.username}
          </NavLink>
        </Box>
    )}


          {/* Menu Items */}
          <ListItem component={NavLink} to="/dashboard">
            <ListItemIcon sx={{ color: 'black' }}>
              <FaHome />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem component={NavLink} to="/chats">
            <ListItemIcon sx={{ color: 'black' }}>
              <FaComments />
            </ListItemIcon>
            <ListItemText primary="Chats" />
          </ListItem>

          {/* <ListItem component={NavLink} to="/purchases">
            <ListItemIcon sx={{ color: 'white' }}>
              <FaShoppingCart />
            </ListItemIcon>
            <ListItemText primary="My Purchases" />
          </ListItem> */}

          <ListItem component={NavLink} to="/allposts">
            <ListItemIcon sx={{ color: 'black' }}>
              <FaPencilRuler />
            </ListItemIcon>
            <ListItemText primary="Designer" />
          </ListItem>

          <ListItem component={NavLink} to="/users">
            <ListItemIcon sx={{ color: 'black' }}>
              <FaTasks />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>

          <ListItem component={NavLink} to="/posts">
            <ListItemIcon sx={{ color: 'black' }}>
              <FaPlus />
            </ListItemIcon>
            <ListItemText primary="Add post" />
          </ListItem>

          {/* Logout Button */}
          <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
            <ListItemIcon sx={{ color: 'black' }}>
              <FaSignOutAlt />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Header;
