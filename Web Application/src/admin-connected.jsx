import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Fenetre from "./fenetre";
import Agent_list from "./agent-list";
import Agent_signup_pending from "./agent-signup-pending";
import "./AdminConnected.css"; // Import du fichier CSS
import { Link } from "react-router-dom";
const AdminConnected = () => {
  const [show, setShow] = useState(false);
  const [pending,setpening] = useState(false);

  return (
    <div className="admin-container">
      <header className="admin-header">
        <button 
          className="toggle-button" 
          onClick={() => setShow((prevShow) => !prevShow)}
        >
          ☰
        </button>
        <h1 className="admin-title">Espace Administrateur</h1>
      </header>
      <main className="admin-main">
      {show && (
        <nav className="admin-navbar">
          <button onClick={()=>setpening(true)} className="nav-link">manage list</button>
          <button onClick={()=>setpening(false)} className="nav-link">pending </button>
        </nav>
      )}
        {
            pending && (<section className="agent-list-section">
                <Agent_signup_pending />
              </section>)
        }
        {
            !pending && (<section className="agent-list-section">
                <Agent_list />
              </section>)
        }
      </main>
    </div>
  );
};

export default AdminConnected;
