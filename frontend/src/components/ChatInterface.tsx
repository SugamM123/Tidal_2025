import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { useAuth0 } from '@auth0/auth0-react';
import ReactMarkdown from 'react-markdown';
import MediaViewer from './MediaViewer';
import MediaGallery, { MediaItem } from './MediaGallery';
import DrawingBoard from './DrawingBoard';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  video?: string;
  videoList?: { key: string; size: number; last_modified: string; url: string }[];
}

interface Video {
  key: string;
  size: number;
  last_modified: string;
  url: string;
}

const API_BASE_URL = 'https://alphaapi.shlokbhakta.dev';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<Video[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [showDrawingBoard, setShowDrawingBoard] = useState(false);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial greeting when component mounts
  useEffect(() => {
    const initialGreeting = {
      id: 0,
      text: "Hi! I'm Alpha Assistant. How can I help you today?",
      sender: 'bot',
    };
    
    setMessages([initialGreeting]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setDebugInfo(null);

    // If user is not authenticated, prompt login
    if (!isAuthenticated) {
      const shouldLogin = window.confirm('Please log in to use the chat. Would you like to log in now?');
      if (shouldLogin) {
        loginWithRedirect();
      }
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    setVideoUrl(null);

    try {
      // Check if user wants to list videos
      if (input.toLowerCase().includes('list videos')) {
        const response = await fetch(`${API_BASE_URL}/list_videos`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setVideoList(data.videos || []);
        
        const botResponse: Message = {
          id: Date.now() + 1,
          text: "Here are the available videos:",
          sender: 'bot',
          videoList: data.videos || [],
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Check if it's a video generation request
        if (input.toLowerCase().includes('generate') || input.toLowerCase().includes('create video')) {
          const response = await fetch(`${API_BASE_URL}/run?prompt=${encodeURIComponent(input)}`);
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setVideoUrl(data.video_url);
          
          const botResponse: Message = {
            id: Date.now() + 1,
            text: "Here's a visualization of your request:",
            sender: 'bot',
            video: data.video_url
          };
          
          setMessages(prev => [...prev, botResponse]);
        } else {
          // Handle regular chat message with Gemini
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 30000);
          });
          
          console.log("Sending message to Gemini API:", userInput);
          const responsePromise = geminiService.sendMessage(userInput);
          
          const response = await Promise.race([responsePromise, timeoutPromise]) as string;
          console.log("Received response from Gemini API:", response);
          
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: response || "I received your message but couldn't generate a response. Please try again.",
              sender: 'bot',
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error getting response:', error);
      let errorMessage = 'Sorry, I encountered an error processing your request.';
      
      if (error instanceof Error) {
        setDebugInfo(`Error: ${error.message}\n${error.stack || ''}`);
        
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
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: errorMessage,
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    const success = geminiService.resetConversation();
    
    setMessages([
      {
        id: 0,
        text: success 
          ? "Hi! I'm Alpha Assistant. How can I help you today?" 
          : "Hi! I'm Alpha Assistant. Note: There was an issue resetting the conversation history.",
        sender: 'bot',
      },
    ]);
    
    setDebugInfo(null);
    setVideoUrl(null);
    setVideoList([]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Chat</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => { 
              setInput('list videos'); 
              handleSubmit(new Event('submit') as React.FormEvent); 
            }}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white"
          >
            <i className="fas fa-video mr-2"></i>List Videos
          </button>
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
          <button
            onClick={() => setShowDrawingBoard(prev => !prev)}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white"
          >
            <i className="fas fa-pencil-alt mr-2"></i>Drawing Board
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              }`}
            >
              {message.sender === 'user' ? (
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
                  
                  {message.video && (
                    <div className="mt-3">
                      <MediaViewer
                        type="video"
                        src={message.video}
                        interactive={true}
                        width="100%"
                      />
                    </div>
                  )}
                  
                  {message.videoList && message.videoList.length > 0 && (
                    <div className="mt-3">
                      <MediaGallery
                        items={message.videoList.map(video => ({
                          id: video.key,
                          type: 'video',
                          src: video.url,
                          title: video.key,
                          size: video.size,
                          lastModified: video.last_modified
                        }))}
                        layout="list"
                      />
                    </div>
                  )}
                  
                  {message.videoList && message.videoList.length === 0 && (
                    <div className="mt-3 text-sm text-gray-300">
                      No videos found in storage.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-center">
            <div className="bg-gray-700 text-white rounded-lg p-3">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>
                  {input.toLowerCase().includes('list videos') 
                    ? 'Fetching videos...' 
                    : input.toLowerCase().includes('generate') || input.toLowerCase().includes('create video')
                      ? 'Generating animation...'
                      : 'Thinking...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-800 text-red-300 rounded-lg text-xs overflow-x-auto">
            <pre>{debugInfo}</pre>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask me anything or type 'generate' to create a visualization!"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg text-white ${
              isLoading || !input.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90'
            }`}
            disabled={isLoading || !input.trim()}
          >
            {isLoading 
              ? <i className="fas fa-circle-notch fa-spin"></i> 
              : <i className="fas fa-paper-plane"></i>}
          </button>
        </div>
      </form>
      
      {showDrawingBoard && (
        <div className="mb-4">
          <DrawingBoard height="400px" />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;