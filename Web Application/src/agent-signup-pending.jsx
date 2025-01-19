import React, { useState, useEffect } from "react";
import { db } from "./firebase-config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import "./agent_signup_pending.css"; // Import du fichier CSS

const Agent_signup_pending = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const userdata = location.state;

  useEffect(() => {
    getAllAgent(); // Appeler la fonction au montage du composant
  }, []);

  const getAllAgent = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("Status", "==", false),
        where("Role", "==", "agent")
      );

      const querySnapshot = await getDocs(q);
      const list = [];

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          list.push({ data: doc.data(), id: doc.id });
        });
        setUsers(list);
      } else {
        setMessage("No agents found.");
      }
    } catch (e) {
      setMessage("Error fetching agents: " + e.message);
      console.error(e);
    }
  };

  const handleAction = async (user) => {
    const docRef = doc(db, "users", user.id); // Référence au document par ID
    try {
      // Crée une copie des données et modifie les valeurs
      const updated = { 
        ...user.data, 
        Status: true,            // Marquer l'agent comme actif
        timestamp: new Date().toISOString(), // Ajouter un timestamp
      };

      // Mise à jour du document dans Firestore
      await updateDoc(docRef, updated);
      console.log("Agent mis à jour avec succès !");
    } catch (e) {
      console.error("Erreur lors de la mise à jour de l'agent : ", e);
    }
  };

  return (
    <div className="agent-signup-pending-container">
      <div className="header">
        <h2>Pending Agent Signups: {userdata?.data?.Nom} {userdata?.data?.Prenom}</h2>
      </div>

      {message && <div className="error-message">{message}</div>}

      <div className="users-list">
        {users.length > 0 ? (
          users.map((user, index) => (
            <div key={index} className="user-item">
              <h3>{user.data.Nom} {user.data.Prenom}</h3>
              <p>Email: {user.data.Email}</p>
              <p>Status: {user.data.Status ? "Active" : "Pending"}</p>
              {/* Modifié pour éviter l'appel immédiat de handleAction */}
              <button onClick={() => handleAction(user)}>Enable</button>
            </div>
          ))
        ) : (
          <p>No pending agents found.</p>
        )}
      </div>
    </div>
  );
};

export default Agent_signup_pending;
