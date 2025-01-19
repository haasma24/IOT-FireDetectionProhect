import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom'
import Agent_page from './agent_page.jsx'
import Admin_page from './admin_page.jsx'
import Admin_connected from './admin-connected.jsx'
import Agent_signup_pending from './agent-signup-pending.jsx'
import Agent_list from './agent-list.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin_page/>} />
        <Route path="/agent" element={<Agent_page/>} />
        <Route path="/manage/agent" element={<Admin_connected/>}/>
        <Route path="/agent-list" element={<Agent_list/>}/>
        <Route path="/agent-pending-list" element={<Agent_signup_pending/>}/>
      </Routes>
    </Router>
  </StrictMode>,
)
