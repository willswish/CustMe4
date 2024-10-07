import React from 'react';
import { Link } from 'react-router-dom';

const CommunityJoin = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center relative">
      <h1 className="text-5xl font-bold text-yellow-500 mb-8">
        <span className="text-blue-600">Cust</span>Me
      </h1>
      <div className="bg-blue-500 rounded-lg p-12 flex flex-col items-center w-full max-w-2xl h-auto py-16">
        <h2 className="text-white text-3xl font-bold mb-8">Join our community</h2>
        <div className="flex space-x-8">
          <Link
            to="/register?role=3"
            className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center w-56"
          >
            <img src="/storage/images/graphicdesigner.png" alt="Designer Icon" className="w-32 h-32 mb-4" />
            <span className="text-black font-semibold text-lg">I AM DESIGNER</span>
          </Link>
          <Link
            to="/register?role=4"
            className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center w-56"
          >
            <img src="/storage/images/printingprovider.png" alt="Printer Icon" className="w-32 h-32 mb-4" />
            <span className="text-black font-semibold text-lg">I AM PRINTING PROVIDER</span>
          </Link>
        </div>
      </div>
      <div className="absolute top-8 left-8">
        <Link to="/" className="bg-yellow-500 text-white px-4 py-2 rounded">
          Back
        </Link>
      </div>
    </div>
  );
};

export default CommunityJoin;
