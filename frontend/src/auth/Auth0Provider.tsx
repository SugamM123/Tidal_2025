import { Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderProps {
  children: ReactNode;
}

// Auth0 credentials from environment variables
const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const redirectUri = `${window.location.origin}/callback`;

export const Auth0Provider = ({ children }: Auth0ProviderProps) => {
  if (!domain || !clientId) {
    console.warn('Auth0 domain or client ID not set in environment variables');
  }

  return (
    <Auth0ProviderBase
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: 'openid profile email',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0ProviderBase>
  );
};