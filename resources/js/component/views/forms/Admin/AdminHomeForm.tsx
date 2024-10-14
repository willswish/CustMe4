import React from 'react';

import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/adminheader';

const AdminHomeForm = () => {
  return (
      <div className="flex-1 flex flex-col">
        <AdminHeader/>
        
        <div className="flex-1 p-8">
          {/* This is where the nested routes will be rendered */}
          <Outlet />
        </div>
      
    </div>
  );
};

export default AdminHomeForm;
