import React from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';

const GraphicDesignerHomeForm = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <p>Graphic Designer</p>
        <div className="flex-1 p-8">
          <div className="space-y-8">
          </div>
        </div>
      </div>
    </div>
          
  );
};

export default GraphicDesignerHomeForm;
