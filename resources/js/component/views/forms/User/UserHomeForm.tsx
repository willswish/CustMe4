import React from 'react';
import Sidebar from '../components/sidebar';
import UserHeader from '../components/userheader';


const UserHomeForm = () => {
  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <UserHeader />
        <p>USer</p>
        <div className="flex-1 p-8">
          <div className="space-y-8">
          </div>
        </div>
      </div>
    </div>
          
  );
};

export default UserHomeForm;
