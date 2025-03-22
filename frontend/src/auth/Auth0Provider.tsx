import { Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderProps {
  children: ReactNode;
}

// Auth0 credentials
const domain = 'spacecraftt.us.auth0.com';
const clientId = '2jIxAMDZmxDW2iWGSE0yuLPGVJJZqRN2';
const redirectUri = `${window.location.origin}/callback`;

export const Auth0Provider = ({ children }: Auth0ProviderProps) => {
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