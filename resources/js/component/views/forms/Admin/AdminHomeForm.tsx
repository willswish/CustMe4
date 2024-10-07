import React from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import { Outlet } from 'react-router-dom';

const AdminHomeForm = () => {
  return (
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8">
          {/* This is where the nested routes will be rendered */}
          <Outlet />
        </div>
      
    </div>
  );
};

export default AdminHomeForm;
