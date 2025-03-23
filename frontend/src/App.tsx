import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Callback from './components/Callback';
import { Auth0Provider } from './auth/Auth0Provider';
import MathStudio from './components/MathStudio';
import './App.css';

function App() {
  return (
    <Auth0Provider>
      <Router>
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-white">
          <Routes>
            <Route path="/callback" element={<Callback />} />
            <Route path="/" element={
              <>
                <Header />
                <div className="flex-1 flex overflow-hidden">
                  <Sidebar position="left" />
                  <main className="flex-1 border-x border-gray-700">
                    <ChatInterface />
                  </main>
                  <Sidebar position="right" />
                </div>
              </>
            } />
            <Route path="/math" element={
              <>
                <Header />
                <div className="flex-1 flex overflow-hidden">
                  <Sidebar position="left" />
                  <main className="flex-1 border-x border-gray-700">
                    <MathStudio />
                  </main>
                  <Sidebar position="right" />
                </div>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </Auth0Provider>
  );
}

export default App;