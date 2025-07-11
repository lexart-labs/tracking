import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
import { Dashboard } from './application/dashboard'
import '@iframe-resizer/child'
import { ResizerProvider } from './providers/iframe-resizer';
import { PrimeReactProvider } from 'primereact/api';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider>
      <ResizerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
      </BrowserRouter>
      </ResizerProvider>
    </PrimeReactProvider>
  </StrictMode>,
)
