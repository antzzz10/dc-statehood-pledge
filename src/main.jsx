import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Respond from './Respond.jsx'
import Party from './Party.jsx'
import PostPrimaryResults from './PostPrimaryResults.jsx'
import PostPrimaryArchive from './PostPrimaryArchive.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostPrimaryResults />} />
        <Route path="/archive" element={<PostPrimaryArchive />} />
        <Route path="/2026/primary" element={<App />} />
        <Route path="/respond" element={<Respond />} />
        <Route path="/party" element={<Party />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
