import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { useAuth0 } from '@auth0/auth0-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial greeting when component mounts
  useEffect(() => {
    const initialGreeting = {
      id: 0,
      text: "Hi! I'm Alpha Assistant. How can I help you today?",
      isUser: false,
    };
    
    setMessages([initialGreeting]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugInfo(null); // Clear previous debug info
    
    if (!input.trim()) return;

    // If user is not authenticated, prompt login
    if (!isAuthenticated) {
      const shouldLogin = window.confirm('Please log in to use the chat. Would you like to log in now?');
      if (shouldLogin) {
        loginWithRedirect();
      }
      return;
    }

    const userMessage = { id: messages.length, text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input; // Store input before clearing
    setInput('');
    setIsLoading(true);

    try {
      // Simple message for testing

      // Send message to Gemini API with timeout handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000); // 30 second timeout
      });
      
      console.log("Sending message to Gemini API:", userInput);
      const responsePromise = geminiService.sendMessage(userInput);
      
      // Use Promise.race to implement timeout
      const response = await Promise.race([responsePromise, timeoutPromise]) as string;
      console.log("Received response from Gemini API:", response);
      
      // Add AI response to messages
      setMessages((prev) => [
        ...prev,
        { id: prev.length, text: response || "I received your message but couldn't generate a response. Please try again.", isUser: false },
      ]);
    } catch (error) {
      console.error('Error getting response:', error);
      let errorMessage = 'Sorry, I encountered an error processing your request.';
      
      // Enhanced error handling with debugging info
      if (error instanceof Error) {
        // Set debug info for troubleshooting
        setDebugInfo(`Error: ${error.message}\n${error.stack || ''}`);
        
        // Add more specific error message based on the type of error
        if (error.message.includes('timed out')) {
          errorMessage = 'The request took too long to process. Please try again with a shorter message.';
        } else if (error.message.includes('API key')) {
          errorMessage = 'There is an issue with the API configuration. Please check your API key.';
        } else if (error.message.includes('network')) {
          errorMessage = 'There seems to be a network issue. Please check your connection and try again.';
        } else if (error.message.includes('safety settings')) {
          errorMessage = 'Your message was flagged by safety settings. Please try a different question.';
        }
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          text: errorMessage,
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    // Reset the conversation in the Gemini service
    const success = geminiService.resetConversation();
    
    // Clear all messages and add the greeting
    setMessages([
      {
        id: 0,
        text: success 
          ? "Hi! I'm Alpha Assistant. How can I help you today?" 
          : "Hi! I'm Alpha Assistant. Note: There was an issue resetting the conversation history.",
        isUser: false,
      },
    ]);
    
    // Clear debug info
    setDebugInfo(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Chat</h2>
        </div>
        <div className="flex gap-2">
          {debugInfo && (
            <button
              onClick={() => setDebugInfo(null)}
              className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition-colors text-sm"
              title="Clear debug information"
            >
              Clear Debug
            </button>
          )}
          <button 
            onClick={handleNewConversation}
            className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            New Conversation
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2a2a2a] text-gray-100'
              }`}
            >
              {message.isUser ? (
                <p className="whitespace-pre-wrap">{message.text}</p>
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown 
                    components={{
                      h1: ({children}) => <h1 className="text-xl font-bold my-3">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-bold my-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-md font-bold my-2">{children}</h3>,
                      ul: ({children}) => <ul className="list-disc ml-6 my-2">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal ml-6 my-2">{children}</ol>,
                      li: ({children}) => <li className="my-1">{children}</li>,
                      code: ({className, children, node}: any) => {
                        const isInline = !node?.position?.start?.line;
                        return isInline ? 
                          <code className="bg-gray-800 px-1 rounded text-pink-300">{children}</code> : 
                          <code className="block bg-gray-800 p-2 rounded my-2 overflow-x-auto text-pink-300">{children}</code>;
                      },
                      a: ({href, children}) => <a href={href} className="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">{children}</a>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-gray-500 pl-4 py-1 my-2 italic">{children}</blockquote>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      strong: ({children}) => <strong className="font-bold">{children}</strong>,
                      p: ({children}) => <p className="mb-3">{children}</p>
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-[#2a2a2a] text-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-800 text-red-300 rounded-lg text-xs overflow-x-auto">
            <pre>{debugInfo}</pre>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#2a2a2a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask Alpha anything you'd like to know or learn about!"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim() || isLoading}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 