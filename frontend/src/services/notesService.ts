export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

class NotesService {
  private readonly STORAGE_KEY = 'alpha_assistant_notes';

  getAllNotes(): Note[] {
    const notesJson = localStorage.getItem(this.STORAGE_KEY);
    const notes = notesJson ? JSON.parse(notesJson) : [];
    
    // Handle migration of old notes format to new format with title
    return notes.map((note: any) => {
      if (!note.title) {
        // Extract title from content for old notes or create default title
        const lines = note.content.split('\n');
        let title = 'Untitled Note';
        
        // Check if content starts with timestamp format like [3/23/2025, 12:12:24 AM]
        const timestampMatch = lines[0].match(/^\[(.*?)\]/);
        if (timestampMatch) {
          // Use the first line of actual content after timestamp as title
          const contentStart = lines.slice(2).find(line => line.trim() !== '');
          if (contentStart) {
            title = contentStart.substring(0, 50); // Limit title length
          }
          
          // Remove timestamp from content
          note.content = lines.slice(2).join('\n').trim();
        } else if (lines[0].trim()) {
          // Use first line as title
          title = lines[0].substring(0, 50);
        }
        
        return {
          ...note,
          title
        };
      }
      return note;
    });
  }

  addNote(title: string, content: string): Note {
    const notes = this.getAllNotes();
    const newNote: Note = {
      id: Date.now().toString(),
      title: title || 'Untitled Note',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    return newNote;
  }

  updateNote(id: string, updates: { title?: string; content?: string }): Note | null {
    const notes = this.getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) return null;
    
    const updatedNote = {
      ...notes[noteIndex],
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.content !== undefined ? { content: updates.content } : {}),
      updatedAt: new Date().toISOString()
    };
    
    notes[noteIndex] = updatedNote;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    return updatedNote;
  }

  deleteNote(id: string): boolean {
    const notes = this.getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    
    if (filteredNotes.length === notes.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes.filter(note => note.id !== id)));
    return true;
  }
}

export const notesService = new NotesService(); 