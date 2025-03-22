import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: input,
        sender: 'user',
      };
      setMessages([...messages, newMessage]);
      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now() + 1,
          text: 'Hello! I am Alpha, your intelligent assistant. How can I help you today?',
          sender: 'bot',
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <h1 className="text-2xl mb-2">Welcome to Alpha</h1>
            <p>Your intelligent assistant - ask me anything!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2 mb-4">
          <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white">
            <i className="fas fa-search mr-2"></i>DeepSearch
          </button>
          <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white">
            <i className="fas fa-brain mr-2"></i>Think
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="What do you want to know?"
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:opacity-90 text-white"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 