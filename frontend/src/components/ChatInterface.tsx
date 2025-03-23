import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { useAuth0 } from '@auth0/auth0-react';
import MarkdownRenderer from './MarkdownRenderer';
import DesmosModal from './DesmosModal';
import { detectMathExpression, shouldShowGraph } from '../utils/mathParser';
import { processCommand } from '../utils/commandProcessor';
import { extractFrontmatter } from '../utils/frontmatterParser';
import { ParsedFrontmatter } from '../utils/toolParsers';
import MediaViewer from './MediaViewer';
import MediaGallery, { MediaItem } from './MediaGallery';
import { ExcalidrawWrapper } from './ExcalidrawWrapper';
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  graphExpression?: string;
  frontmatter?: ParsedFrontmatter;
  video?: string;
  videoList?: { key: string; size: number; last_modified: string; url: string }[];
  mermaidCode?: string;
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
  const [desmosModalOpen, setDesmosModalOpen] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<Video[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  // Drawing board state removed - now using frontmatter for diagrams

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial greeting when component mounts
  useEffect(() => {
    const initialGreeting: Message = {
      id: 0,
      text: "Welcome to Alpha Assistant. I'm here to help with your questions and tasks. I can help with STEM topics, generate visualizations, and assist with mathematical concepts.",
      sender: 'bot' as const,
    };
    
    setMessages([initialGreeting]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput('');
    setIsLoading(true);
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: userMessage,
        sender: 'user',
      },
    ]);
    
    // If user is not authenticated, prompt login
    if (!isAuthenticated) {
      const shouldLogin = window.confirm('Please log in to use the chat. Would you like to log in now?');
      if (shouldLogin) {
        loginWithRedirect();
      }
      setIsLoading(false);
      return;
    }

    try {
      // Simple message for testing
      if (userMessage.toLowerCase() === 'test') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
        setMessages((prev) => [
          ...prev,
          { id: prev.length, text: "Test successful! The chat interface is working properly.\n\n**Bold text** and *italic text* should be formatted correctly.", sender: 'bot' },
        ]);
        setIsLoading(false);
        return;
      } else if (userMessage.toLowerCase().includes('list videos')) {
        // Handle video listing
        const response = await fetch(`${API_BASE_URL}/list_videos`);
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setVideoList(data.videos || []);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Here are the available videos:",
            sender: 'bot',
            videoList: data.videos || [],
          },
        ]);
      } else if (userMessage.toLowerCase().includes('generate') || userMessage.toLowerCase().includes('create video')) {
        // Handle video generation
        const response = await fetch(`${API_BASE_URL}/run?prompt=${encodeURIComponent(userMessage)}`);
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setVideoUrl(data.video_url);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Here's a visualization of your request:",
            sender: 'bot',
            video: data.video_url
          },
        ]);
      } else {
        // Handle regular chat message with Gemini
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out')), 30000);
        });
        
        console.log("Sending message to Gemini API:", userMessage);
        const responsePromise = geminiService.sendMessage(userMessage);
        const response = await Promise.race([responsePromise, timeoutPromise]) as string;
        console.log("Received response from Gemini API:", response);
        
        // Process frontmatter if present
        const { frontmatter, content } = extractFrontmatter(response);

        // Handle special commands from frontmatter first
        if (frontmatter.video) {
          // Handle video generation
          const videoResponse = await fetch(`${API_BASE_URL}/run?prompt=${encodeURIComponent(frontmatter.video.description)}`);
          if (!videoResponse.ok) {
            throw new Error(`Server responded with status: ${videoResponse.status}`);
          }
          const videoData = await videoResponse.json();
          if (videoData.error) {
            throw new Error(videoData.error);
          }
          setVideoUrl(videoData.video_url);
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: "Here's a visualization based on the request:",
              sender: 'bot',
              video: videoData.video_url
            },
          ]);
        }

        if (frontmatter.graph) {
          // Convert graph elements to Desmos format
          const graphExpression = frontmatter.graph.elements
            .map(element => {
              if ('latex' in element) {
                return `${element.id},${element.latex},${element.color || ''}`;
              } else if ('sliderBounds' in element) {
                const { min, max, step } = element.sliderBounds;
                return `${element.id},${min},${max},${step}`;
              }
              return '';
            })
            .filter(Boolean)
            .join('|');
          
          setCurrentExpression(graphExpression);
          setDesmosModalOpen(true);
        }

        // Add diagram message if present
        if (frontmatter.diagram?.mermaidCode) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: "",
              sender: 'bot',
              mermaidCode: frontmatter.diagram!.mermaidCode
            }
          ]);
        }

        // Check for mathematical expressions
        const responseHasGraph = shouldShowGraph(content);
        const responseMathExpression = responseHasGraph ? detectMathExpression(content) : { hasEquation: false, latex: '', type: 'unknown' };
        
        // Add the main content message
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: content || "I received your message but couldn't generate a response. Please try again.",
            sender: 'bot',
            graphExpression: responseMathExpression.hasEquation ? responseMathExpression.latex : undefined,
            frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined
          },
        ]);
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
          ? "Welcome to Alpha Assistant. I'm here to help with your questions and tasks. I can help with STEM topics, generate visualizations, and assist with mathematical concepts."
          : "Welcome to Alpha Assistant. Note: There was an issue resetting the conversation history.",
        sender: 'bot',
      },
    ]);
    
    setDebugInfo(null);
    setVideoUrl(null);
    setVideoList([]);
    setDesmosModalOpen(false);
    setCurrentExpression('');
  };

  // Drawing board toggle removed - now using frontmatter for diagrams

  const openDesmosWithExpression = (expression: string) => {
    setCurrentExpression(expression);
    setDesmosModalOpen(true);
  };



  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Chat</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setInput('list videos');
              handleSubmit({
                preventDefault: () => {},
                type: 'submit'
              } as React.FormEvent);
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
          {/* Drawing board button removed - now using frontmatter for diagrams */}
        </div>
      </div>
      
      {/* Messages */}
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
                <div>
                  {message.text && <MarkdownRenderer content={message.text} />}
                  
                  {/* Mermaid diagram */}
                  {message.mermaidCode && (
                    <ExcalidrawWrapper mermaidCode={message.mermaidCode} />
                  )}
                  
                  {/* Graph expression */}
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
                  
                  {/* Video */}
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
                  
                  {/* Video list */}
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
        
        {/* Loading indicator */}
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
        
        {/* Debug info */}
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-800 text-red-300 rounded-lg text-xs overflow-x-auto">
            <pre>{debugInfo}</pre>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#2a2a2a] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask a question, generate visualizations, or mention math concepts..."
            disabled={isLoading}
          />
          {/* Drawing board button removed - now using frontmatter for diagrams */}
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
      
      {/* Modals */}
      <DesmosModal
        isOpen={desmosModalOpen}
        onClose={() => setDesmosModalOpen(false)}
        expression={currentExpression}
      />
      
      {/* Excalidraw Modal */}
    </div>
  );
};

export default ChatInterface;