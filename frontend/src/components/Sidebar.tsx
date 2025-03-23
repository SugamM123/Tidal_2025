import React from 'react';

const Sidebar: React.FC<{ position: 'left' | 'right' }> = ({ position }) => {
  return (
    <div className="w-72 bg-[#1e1e1e] border-gray-700 p-4">
      {position === 'left' ? (
        <>
          <h2 className="text-white mb-4 font-semibold flex justify-between items-center">
            Sources
            <button className="text-gray-400 hover:text-white">
              <i className="fas fa-expand"></i>
            </button>
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
        <>
          <h2 className="text-white mb-4 font-semibold">Studio</h2>
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-white mb-2">Audio Overview</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                <i className="fas fa-microphone text-gray-400"></i>
              </div>
              <div>
                <p className="text-white text-sm">Deep Dive conversation</p>
                <p className="text-gray-400 text-xs">Two hosts (English only)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 px-4 rounded-lg bg-gray-700 text-white hover:bg-gray-600">
                Customize
              </button>
              <button className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>
          <div className="text-white">
            <div className="flex justify-between items-center mb-4">
              <h3>Notes</h3>
              <button className="text-gray-400 hover:text-white">
                <i className="fas fa-ellipsis-h"></i>
              </button>
            </div>
            <button className="w-full py-2 px-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700">
              + Add note
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar; 