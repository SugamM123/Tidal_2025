import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Callback: React.FC = () => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Add a delay to allow Auth0 to complete processing
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          navigate('/');
        } else if (error) {
          console.error('Auth0 error:', error);
          navigate('/');
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoading, error, isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a] text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Logging you in...</h1>
        <p className="text-gray-400">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default Callback; 