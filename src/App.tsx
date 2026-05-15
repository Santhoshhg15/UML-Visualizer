/**
 * App.tsx
 * ──────────────────────────────────────────────────
 * Root application component with client-side routing.
 *
 * Routes:
 *  /        → LandingPage (product marketing)
 *  /editor  → EditorPage  (the React Flow UML canvas)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { EditorPage } from '@/pages/EditorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
