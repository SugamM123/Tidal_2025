import React, { useState } from 'react';
import MediaViewer from './MediaViewer';
import MediaGallery, { MediaItem } from './MediaGallery';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  video?: string;
  videoList?: { key: string; size: number; last_modified: string; url: string }[];
}

// Interface for video items
interface Video {
  key: string;
  size: number;
  last_modified: string;
  url: string;
}

const API_BASE_URL = import.meta.env.PROD
  ? 'https://alphaapi.shlokbhakta.dev' // Production API URL
  : '/api'; // Development (uses Vite proxy)

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<Video[]>([]);

  const handleSend = async () => {
    if (input.trim()) {
      // Add user message
      const newMessage: Message = {
        id: Date.now(),
        text: input,
        sender: 'user',
      };
      setMessages([...messages, newMessage]);
      setLoading(true);
      setVideoUrl(null);
      
      try {
        // Check if user wants to list videos
        if (input.toLowerCase().includes('list videos')) {
          // Make sure the URL matches exactly what your backend expects
          const response = await fetch(`${API_BASE_URL}/list_videos`);
          
          // Check if response is OK before trying to parse JSON
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setVideoList(data.videos || []);
          
          // Create a response that includes the video list
          const botResponse: Message = {
            id: Date.now() + 1,
            text: "Here are the available videos:",
            sender: 'bot',
            videoList: data.videos || [],
          };
          
          setMessages(prev => [...prev, botResponse]);
        } else {
          // Regular video generation flow
          const response = await fetch(`${API_BASE_URL}/run?prompt=${encodeURIComponent(input)}`);
          
          // Check if response is OK before trying to parse JSON
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          // Set video URL from response
          setVideoUrl(data.video_url);
          
          // Add bot response with video
          const botResponse: Message = {
            id: Date.now() + 1,
            text: "Here's a visualization of your request:",
            sender: 'bot',
            video: data.video_url
          };
          
          setMessages(prev => [...prev, botResponse]);
        }
      } catch (error) {
        console.error("API Error:", error);
        
        let errorMessage = "Failed to process request";
        
        if (error instanceof Error) {
          console.error("Error details:", error.message);
          errorMessage = error.message;
          
          // Try to extract more info if it's a response error
          if (error.message.includes('status: 500')) {
            errorMessage = "Server error: The backend couldn't process this request. Try a different prompt.";
          }
        }
        
        // Handle errors
        const errorMsg: Message = {
          id: Date.now() + 1,
          text: `Error: ${errorMessage}`,
          sender: 'bot',
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setLoading(false);
        setInput('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <h1 className="text-2xl mb-2">Welcome to Alpha</h1>
            <p>Your intelligent assistant - ask me anything!</p>
            <p className="mt-2 text-sm">Type "list videos" to see all available visualizations</p>
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
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-center">
            <div className="bg-gray-700 text-white rounded-lg p-3">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{input.toLowerCase().includes('list videos') ? 'Fetching videos...' : 'Generating animation...'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2 mb-4">
          <button
            onClick={async () => { 
              setInput('list videos'); 
              await handleSend(); 
            }}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white"
          >
            <i className="fas fa-video mr-2"></i>List Videos
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Enter a prompt to generate a visualization"
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className={`px-4 py-2 rounded-lg text-white ${loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90'}`}
            disabled={loading}
          >
            {loading 
              ? <i className="fas fa-circle-notch fa-spin"></i> 
              : <i className="fas fa-paper-plane"></i>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to format file size
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
}

export default ChatInterface; 