import React, { useState, KeyboardEvent } from 'react';
import { Note, notesService } from '../services/notesService';

interface NoteItemProps {
  note: Note;
  onUpdate: () => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSave = () => {
    if (content.trim()) {
      notesService.updateNote(note.id, { 
        title: title.trim() || 'Untitled Note', 
        content: content.trim() 
      });
      setIsEditing(false);
      onUpdate();
    }
  };

  const handleDelete = () => {
    notesService.deleteNote(note.id);
    onUpdate();
    setShowDeleteConfirm(false);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    // Save on Ctrl+Enter or Command+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    // Cancel on Escape
    else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setTitle(note.title);
      setContent(note.content); // Reset content to original
    }
  };

  return (
    <div className="mb-4">
      <div className="bg-[#2a2a2a] rounded-lg p-4 text-gray-100 relative group">
        {isEditing ? (
          <div className="space-y-3">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#3a3a3a] text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Note title"
              autoFocus
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#3a3a3a] text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Enter your note..."
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {content.length} character{content.length !== 1 ? 's' : ''}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(note.title);
                    setContent(note.content); // Reset content to original
                  }}
                  className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg mb-2 text-white">{note.title}</h3>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="whitespace-pre-wrap mb-3 text-gray-300">{note.content}</p>
            <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
              <span>Updated: {formatDate(note.updatedAt)}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                title="Edit note"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog as a separate element below the note */}
      {showDeleteConfirm && (
        <div className="bg-[#2a2a2a] rounded-lg p-4 mt-2 text-gray-100 border border-red-500">
          <p className="text-center mb-3">Are you sure you want to delete this note?</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteItem; 