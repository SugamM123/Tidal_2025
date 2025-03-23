import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] text-white">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar position="left" />
        <main className="flex-1 border-x border-gray-700">
          <ChatInterface />
        </main>
        <Sidebar position="right" />
      </div>
    </div>
  );
}

export default App;
