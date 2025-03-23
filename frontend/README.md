# Alpha Assistant

A modern AI assistant application built with React, featuring Auth0 authentication and Google's Gemini API integration.

## Features

- User authentication via Auth0
- AI-powered chat with Google's Gemini model
- Modern UI with Tailwind CSS
- Real-time message display
- Persistent conversation history

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- NPM or Yarn
- Auth0 account
- Google Gemini API key

### Setup

1. Clone the repository
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Create a `.env` file in the `frontend` directory with the following variables:

```
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id

# Gemini API Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key
```

4. Start the development server:

```bash
npm run dev
```

## Troubleshooting

If you're experiencing issues with the Gemini API integration:

1. Type "check api key" in the chat to verify if your API key is working
2. Type "test" to check if the chat interface is functioning properly
3. Look for the "API Connected" or "API Key Invalid" indicator in the chat header
4. Check the debug logs when errors occur for more detailed information

## Auth0 Setup

See the `AUTH0_SETUP.md` file for detailed instructions on configuring Auth0.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
