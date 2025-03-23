import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Note, notesService } from '../services/notesService';
import NoteItem from './NoteItem';

const NotesPanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
    
    // Add keyboard shortcut for new note (Alt+N)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setIsAddingNote(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredNotes(notes);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  const loadNotes = () => {
    const allNotes = notesService.getAllNotes();
    // Sort notes by updatedAt, newest first
    const sortedNotes = allNotes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setNotes(sortedNotes);
    setFilteredNotes(sortedNotes);
  };

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      notesService.addNote(
        newNoteTitle.trim() || 'Untitled Note', 
        newNoteContent.trim()
      );
      setNewNoteTitle('');
      setNewNoteContent('');
      setIsAddingNote(false);
      loadNotes();
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    // Save on Ctrl+Enter or Command+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddNote();
    }
    // Cancel on Escape
    else if (e.key === 'Escape') {
      e.preventDefault();
      setIsAddingNote(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Notes</h3>
        {!isAddingNote && (
          <button 
            onClick={() => setIsAddingNote(true)}
            className="px-3 py-1 text-sm bg-blue-600 rounded-md hover:bg-blue-700 text-white transition-colors"
            title="Add note (Alt+N)"
          >
            + Add note
          </button>
        )}
      </div>

      {isAddingNote && (
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4">
          <input 
            type="text" 
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#3a3a3a] text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            placeholder="Note title"
            autoFocus
          />
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#3a3a3a] text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Enter your note... (Ctrl+Enter to save, Esc to cancel)"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">
              {newNoteContent.length} character{newNoteContent.length !== 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                disabled={!newNoteContent.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {notes.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2a2a2a] text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search notes..."
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1">
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => (
            <NoteItem 
              key={note.id} 
              note={note} 
              onUpdate={loadNotes} 
            />
          ))
        ) : notes.length > 0 && searchQuery ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-sm">
              No notes match your search
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-sm">
              No notes yet
              <br />
              {!isAddingNote && "Click Add note above or press Alt+N to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPanel; 