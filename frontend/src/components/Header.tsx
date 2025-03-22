import React from 'react';
import ProfileButton from './ProfileButton';
import { useAuth0 } from '@auth0/auth0-react';

const Header: React.FC = () => {
  const { user } = useAuth0();
  
  return (
    <header className="bg-[#1e1e1e] text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 rounded-md flex items-center justify-center font-bold text-xl">
          A
        </div>
        <span className="text-xl font-semibold">Alpha Assistant</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#2a2a2a] rounded-lg">
          <i className="fas fa-bell"></i>
        </button>
        <button className="p-2 hover:bg-[#2a2a2a] rounded-lg">
          <i className="fas fa-cog"></i>
        </button>
        <ProfileButton />
      </div>
    </header>
  );
};

export default Header; 