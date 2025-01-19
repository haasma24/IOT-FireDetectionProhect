import React, { useState, useEffect } from "react";
import { db } from "./firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import "./agent-list.css"; // Import du fichier CSS

const Agent_list = () => {
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
        where("Status", "==", true),
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

  return (
    <div className="admin-connected-container">
      <div className="header">
        <h2>Connected Admin: {userdata?.data?.Nom} {userdata?.data?.Prenom}</h2>
      </div>

      {message && <div className="error-message">{message}</div>}

      <div className="users-list">
        {users.length > 0 ? (
          users.map((user, index) => (
            <div key={index} className="user-item">
              <h3>{user.data.Nom} {user.data.Prenom}</h3>
              <p>Email: {user.data.Email}</p>
              <p>Status: {user.data.Status ? "Active" : "Inactive"}</p>
            </div>
          ))
        ) : (
          <p>No agents available.</p>
        )}
      </div>
    </div>
  );
};

export default Agent_list;
