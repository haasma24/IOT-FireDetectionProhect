import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { db, database, firestore } from "./firebase-config";
import Notification_agent from "./Notification";
import { useLocation } from "react-router-dom";
import "./Migrate.css"; // Assurez-vous que ce fichier CSS est bien importé

const MigrateData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const userdata = location.state;

  // Migration des données de Realtime Database vers Firestore
  useEffect(() => {
    const dbRef = ref(database, "data"); // Référence au nœud "data" dans Realtime Database

    const unsubscribe = onValue(dbRef, async (snapshot) => {
      if (snapshot.exists()) {
        const dataObject = snapshot.val();
        const finalData = {
          ...Object.fromEntries(
            Object.entries(dataObject).map(([key, value]) => [
              key,
              // Convertir les valeurs en nombres si elles sont des chaînes représentant des nombres
              typeof value === 'string' && !isNaN(value) ? parseFloat(value) : value,
            ])
          ),
          timestamp: new Date().toISOString(), // Ajout d'une date pour le suivi
          agent_id: null,
          status: false,
        };

        // Ajouter les données dans Firestore
        const collectionRef = collection(firestore, "notification");
        try {
          await addDoc(collectionRef, finalData);
        } catch (error) {
          setError("Error migrating data: " + error.message);
          console.error("Error migrating data: ", error);
        }
      } else {
        console.log("No data available in Realtime Database");
      }
    });

    // Nettoyage
    return () => unsubscribe();
  }, []);

  // Récupérer toutes les notifications depuis Firestore en temps réel
  useEffect(() => {
    const q = query(collection(db, "notification"));

    // Écouter les mises à jour en temps réel avec onSnapshot
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ data: doc.data(), id: doc.id });
      });

      if (notifications.length > 0) {
        setData(notifications); // Mettre à jour l'état avec les notifications
      } else {
        setError("No notifications found.");
      }
      setLoading(false); // Désactiver le chargement après avoir récupéré les notifications
    });

    // Nettoyage de l'écouteur
    return () => unsubscribe();
  }, []); // Le tableau vide garantit que l'effet est exécuté une seule fois au montage

  return (
    <div>
        <p className="user-info">{userdata.data.Nom} {userdata.data.Prenom}</p>
    <div className="migrate-data-container">
      {loading && <div className="loading-spinner"></div>}
      {error && <div className="error-message">{error}</div>}

      {data.length > 0 ? (
        data.map((notification, index) => (
          notification.data.flame < 2000 && !notification.data.status && (
            <Notification_agent
              key={index}
              Notification={notification}
              userdata={userdata}
            />
          )
        ))
      ) : (
        !loading && <p>No notifications found.</p>
      )}
    </div>
    </div>
  );
};

export default MigrateData;
