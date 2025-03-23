import React from 'react';
import { Link } from 'react-router-dom';
import NotesPanel from './NotesPanel';

const Sidebar: React.FC<{ position: 'left' | 'right' }> = ({ position }) => {
  return (
    <div className="w-72 bg-[#1e1e1e] border-gray-700 p-4">
      {position === 'left' ? (
        <>
          <h2 className="text-white mb-4 font-semibold flex justify-between items-center">
            Navigation
            <button className="text-gray-400 hover:text-white">
              <i className="fas fa-expand"></i>
            </button>
          </h2>

          <nav className="mb-6">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="flex items-center w-full py-2 px-4 rounded-lg hover:bg-gray-700 text-gray-200"
                >
                  <span className="mr-3">💬</span>
                  Chat
                </Link>
              </li>
              <li>
                <Link 
                  to="/math" 
                  className="flex items-center w-full py-2 px-4 rounded-lg hover:bg-gray-700 text-gray-200"
                >
                  <span className="mr-3">📊</span>
                  Math Studio
                </Link>
              </li>
            </ul>
          </nav>

          <h2 className="text-white mb-4 font-semibold flex justify-between items-center">
            Sources
          </h2>
          <button className="w-full py-2 px-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 mb-4">
            + Add source
          </button>
          <div className="text-center text-gray-400 mt-8">
            <div className="mb-4">
              <i className="fas fa-file-alt text-4xl mb-2"></i>
            </div>
            <p className="text-sm">
              Saved sources will appear here
              <br />
              Click Add source above to add PDFs, websites, text, videos, or audio files.
            </p>
          </div>
        </>
      ) : (
        <NotesPanel />
      )}
    </div>
  );
};

export default Sidebar;