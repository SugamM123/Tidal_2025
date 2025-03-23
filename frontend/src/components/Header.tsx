import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#1e1e1e] text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 rounded-md flex items-center justify-center font-bold text-xl">
          A
        </div>
        <span className="text-xl font-semibold">Alpha</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#2a2a2a] rounded-lg">
          <i className="fas fa-bell"></i>
        </button>
        <button className="p-2 hover:bg-[#2a2a2a] rounded-lg">
          <i className="fas fa-cog"></i>
        </button>
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <span>H</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 