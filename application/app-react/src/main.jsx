import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from './application/dashboard'
import { User } from '@/application/pages/user/form/User'
import ResizerProvider from '@/providers/iframe-resizer';
import { PrimeReactProvider } from 'primereact/api';
import Layout from "@/application/Layout"
import '@iframe-resizer/child'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider>
      <ResizerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/user/:userId?" element={<User />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ResizerProvider>
    </PrimeReactProvider>
  </StrictMode>,
)
