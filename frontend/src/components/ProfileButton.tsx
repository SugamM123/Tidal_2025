import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ProfileButton: React.FC = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      // Show a dropdown menu for logout
      const shouldLogout = window.confirm('Do you want to log out?');
      if (shouldLogout) {
        logout({ logoutParams: { returnTo: window.location.origin } });
      }
    } else {
      loginWithRedirect();
    }
  };

  // Initial loading state
  if (isLoading) {
    return (
      <div className="w-20 h-8 bg-gray-500 rounded-md flex items-center justify-center animate-pulse">
        <span>...</span>
      </div>
    );
  }

  // If the user is authenticated, show their first initial or profile picture
  if (isAuthenticated && user) {
    // Get the first letter of the user's name if available, otherwise use their email
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 
                   (user.email ? user.email.charAt(0).toUpperCase() : 'U');
    
    return (
      <button 
        onClick={handleProfileClick}
        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
        title={user.name || user.email || 'Profile'}
      >
        {user.picture ? (
          <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full" />
        ) : (
          <span>{initial}</span>
        )}
      </button>
    );
  }

  // If not authenticated, show the login button with text "Login"
  return (
    <button 
      onClick={handleProfileClick}
      className="px-4 py-1 bg-orange-500 rounded-md flex items-center justify-center hover:bg-orange-600 transition-colors"
      title="Login"
    >
      <span>Login</span>
    </button>
  );
};

export default ProfileButton; 