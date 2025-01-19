import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore"; 
import { db } from "./firebase-config";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Notif.css";

const Notification_agent = ({ Notification, userdata }) => {
    const [notification, setNotification] = useState(Notification); // Importer les méthodes nécessaires de Firebase

    const handleTakeAction = async () => {
        if (!notification) {
            console.error("Notification non définie.");
            return;
        }
    
        const docRef = doc(db, "notification", notification.id); // Référence au document par ID
        try {
            // Crée une copie de la notification et modifie les valeurs
            const updatedNotification = { 
                ...notification.data, // Utilisez les données de la notification existante
                agent_id: userdata.id,  // Ajoute l'ID de l'agent
                status: true,            // Marque la notification comme traitée
                timestamp: new Date().toISOString(), // Ajout d'un timestamp
            };
    
            // Mise à jour du document dans Firestore
            await updateDoc(docRef, updatedNotification);
            console.log("Notification mise à jour avec succès !");
        } catch (e) {
            console.error("Erreur lors de la mise à jour de la notification : ", e);
        }
    };
    return (
        <div>
            <div className="notification-container">
            <div>
                <p>Incendie au {notification.data.Lieu ? notification.Lieu.name : "Inconnu"}</p>
                {notification.Lieu && notification.Lieu._lat && notification.Lieu._long ? (
                    <p>Coordonnées : Latitude - {notification.Lieu._lat}, Longitude - {notification.Lieu._long}</p>
                ) : (
                    <p>Coordonnées non disponibles</p>
                )}
                <p>Temperature : {notification.data.flame}</p>
                <button onClick={handleTakeAction}>I'll do it</button>
            </div>
        </div>
        </div>
    );
};

export default Notification_agent;
