import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { useAuth0 } from '@auth0/auth0-react';
import MarkdownRenderer from './MarkdownRenderer';
import DesmosModal from './DesmosModal';
import { detectMathExpression, shouldShowGraph } from '../utils/mathParser';
import { processCommand } from '../utils/commandProcessor';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  graphExpression?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [desmosModalOpen, setDesmosModalOpen] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('');
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
      text: "Welcome to Alpha Assistant. I'm here to help with your questions and tasks. I can also assist with mathematical concepts - just mention equation terms like calculus, trigonometry, or algebra.",
      isUser: false,
    };
    
    setMessages([initialGreeting]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugInfo(null); // Clear previous debug info
    
    if (!input.trim()) return;

    // Process commands
    const commandResult = processCommand(input);
    if (commandResult.isCommand) {
      const userMessage: Message = { 
        id: messages.length, 
        text: input, 
        isUser: true 
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      
      // Handle different command actions
      if (commandResult.action === 'clear') {
        handleNewConversation();
        return;
      }
      
      if (commandResult.action === 'desmos' && commandResult.data?.expression) {
        setCurrentExpression(commandResult.data.expression);
        setDesmosModalOpen(true);
      }
      
      // Add assistant response for the command
      if (commandResult.message) {
        setMessages((prev) => [
          ...prev,
          { 
            id: prev.length, 
            text: commandResult.message || '',
            isUser: false,
            graphExpression: commandResult.action === 'desmos' ? commandResult.data?.expression : undefined
          },
        ]);
      }
      
      return;
    }

    // If user is not authenticated, prompt login
    if (!isAuthenticated) {
      const shouldLogin = window.confirm('Please log in to use the chat. Would you like to log in now?');
      if (shouldLogin) {
        loginWithRedirect();
      }
      return;
    }

    // Check if the input contains a graph request
    const mathExpression = detectMathExpression(input);
    const userMessage: Message = { 
      id: messages.length, 
      text: input, 
      isUser: true 
    };
    
    // If there's a direct graphing request, add the graph expression to the message
    if (mathExpression.hasEquation && shouldShowGraph(input)) {
      userMessage.graphExpression = mathExpression.latex;
    }
    
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input; // Store input before clearing
    setInput('');
    setIsLoading(true);

    try {
      // Simple message for testing
      if (userInput.toLowerCase() === 'test') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
        setMessages((prev) => [
          ...prev,
          { id: prev.length, text: "Test successful! The chat interface is working properly.\n\n**Bold text** and *italic text* should be formatted correctly.", isUser: false },
        ]);
        setIsLoading(false);
        return;
      }

      // Send message to Gemini API with timeout handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000); // 30 second timeout
      });
      
      console.log("Sending message to Gemini API:", userInput);
      const responsePromise = geminiService.sendMessage(userInput);
      
      // Use Promise.race to implement timeout
      const response = await Promise.race([responsePromise, timeoutPromise]) as string;
      console.log("Received response from Gemini API:", response);
      
      // Check if the response contains any mathematical expressions that should be graphed
      const responseHasGraph = shouldShowGraph(response);
      const responseMathExpression = responseHasGraph ? detectMathExpression(response) : { hasEquation: false, latex: '', type: 'unknown' };
      
      // Add AI response to messages
      setMessages((prev) => [
        ...prev,
        { 
          id: prev.length, 
          text: response || "I received your message but couldn't generate a response. Please try again.", 
          isUser: false,
          graphExpression: responseMathExpression.hasEquation ? responseMathExpression.latex : undefined
        },
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
          ? "Welcome to Alpha Assistant. I'm here to help with your questions and tasks. I can also assist with mathematical concepts - just mention equation terms like calculus, trigonometry, or algebra."
          : "Welcome to Alpha Assistant. Note: There was an issue resetting the conversation history.",
        isUser: false,
      },
    ]);
    
    // Clear debug info
    setDebugInfo(null);
  };

  const openDesmosWithExpression = (expression: string) => {
    setCurrentExpression(expression);
    setDesmosModalOpen(true);
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
                <MarkdownRenderer content={message.text} />
              )}
              
              {/* Render the math expression button if there's a graph expression */}
              {message.graphExpression && (
                <div className="mt-4 flex justify-between items-center bg-[#1e1e1e] rounded-lg p-2">
                  <span className="text-xs text-gray-300">Mathematical expression detected</span>
                  <button 
                    onClick={() => openDesmosWithExpression(message.graphExpression!)} 
                    className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    Open in Desmos Studio
                  </button>
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
        <div ref={messagesEndRef} />
      </div>
      
      {/* Debug info panel, conditionally rendered */}
      {debugInfo && (
        <div className="p-2 bg-gray-800 border-t border-gray-700 max-h-40 overflow-y-auto">
          <h3 className="text-sm font-bold text-yellow-400 mb-1">Debug Information:</h3>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#2a2a2a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask a question or mention mathematical concepts for visualization..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !input.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
      
      {/* Desmos Modal */}
      <DesmosModal
        isOpen={desmosModalOpen}
        onClose={() => setDesmosModalOpen(false)}
        expression={currentExpression}
      />
    </div>
  );
};

export default ChatInterface; 