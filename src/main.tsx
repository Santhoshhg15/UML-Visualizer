import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';

/* Global styles – must be imported before component styles */
import '@/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
