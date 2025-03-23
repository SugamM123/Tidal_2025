import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NotesPanel from './NotesPanel';
import SourceUploader from './SourceUploader';

interface Source {
  id: string;
  name: string;
  timestamp: string;
}

const SOURCES_STORAGE_KEY = 'alpha_assistant_sources';

const Sidebar: React.FC<{ position: 'left' | 'right' }> = ({ position }) => {
  const [showSourceUploader, setShowSourceUploader] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);

  // Load sources from localStorage on mount
  useEffect(() => {
    const savedSources = localStorage.getItem(SOURCES_STORAGE_KEY);
    if (savedSources) {
      try {
        setSources(JSON.parse(savedSources));
      } catch (err) {
        console.error('Error loading sources from localStorage:', err);
      }
    }
  }, []);

  // Save sources to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(sources));
  }, [sources]);

  const handleSourceUploadComplete = (filename: string) => {
    const newSource: Source = {
      id: Date.now().toString(),
      name: filename,
      timestamp: new Date().toLocaleString()
    };
    
    setSources(prev => [newSource, ...prev]);
  };

  return (
    <div className="w-72 bg-[#1e1e1e] border-gray-700 p-4">
      {position === 'left' ? (
        <>
          <h2 className="text-white mb-4 font-semibold">
            Navigation
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

          <h2 className="text-white mb-4 font-semibold">
            Sources
          </h2>
          <button 
            onClick={() => setShowSourceUploader(true)}
            className="w-full py-2 px-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 mb-4"
          >
            + Add source
          </button>
          
          {sources.length > 0 ? (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {sources.map(source => (
                <div 
                  key={source.id}
                  className="bg-[#2a2a2a] rounded-lg p-3 text-gray-200"
                >
                  <div className="flex items-start">
                    <span className="mr-3 text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{source.name}</p>
                      <p className="text-xs text-gray-400">Added: {source.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
          
          {showSourceUploader && (
            <SourceUploader 
              onClose={() => setShowSourceUploader(false)}
              onUploadComplete={handleSourceUploadComplete}
            />
          )}
        </>
      ) : (
        <NotesPanel />
      )}
    </div>
  );
};

export default Sidebar;