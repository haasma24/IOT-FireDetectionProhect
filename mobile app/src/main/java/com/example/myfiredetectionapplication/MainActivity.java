package com.example.myfiredetectionapplication;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import com.google.android.material.progressindicator.CircularProgressIndicator;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class MainActivity extends AppCompatActivity {
    private CircularProgressIndicator pbTemperature, pbHumidity;
    private TextView tvTemperature, tvHumidity, tvFlame, tvGas;
    private DatabaseReference databaseReference;
    private static final String CHANNEL_ID = "fire_detection_channel";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialisation des vues
        pbTemperature = findViewById(R.id.pbTemperature);
        pbHumidity = findViewById(R.id.pbHumidity);
        tvTemperature = findViewById(R.id.tvTemperature);
        tvHumidity = findViewById(R.id.tvHumidity);
        tvFlame = findViewById(R.id.tvFlame);
        tvGas = findViewById(R.id.tvGas);

        // Redirection vers la page Call Us
        Button callUsButton = findViewById(R.id.callUsButton);
        callUsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MainActivity.this, CallUsActivity.class);
                startActivity(intent);
            }
        });

        // Vérification et demande de permission pour les notifications (Android 13+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
            }
        }

        // Créer le canal de notification (pour Android 8.0+)
        createNotificationChannel();

        // Initialisation de la référence Firebase
        databaseReference = FirebaseDatabase.getInstance().getReference("data");

        // Récupération des données en temps réel
        databaseReference.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                try {
                    if (snapshot.exists()) {
                        // Récupérer les données en tant que chaînes de caractères
                        String temperatureString = snapshot.child("temperature").getValue(String.class);
                        String humidityString = snapshot.child("humidity").getValue(String.class);
                        String flameString = snapshot.child("flame").getValue(String.class);
                        String gasString = snapshot.child("gaz").getValue(String.class);

                        // Convertir les chaînes en types numériques
                        if (temperatureString != null) {
                            float temperature = Float.parseFloat(temperatureString);
                            pbTemperature.setProgress((int) temperature); // Progress bar accepte un int
                            tvTemperature.setText("Température: " + temperature + "°C");

                            // Vérifier si la température est trop élevée
                            if (temperature > 50) {
                                showNotification("Alerte Température", "Température élevée détectée: " + temperature + "°C");
                            }
                        }

                        if (humidityString != null) {
                            float humidity = Float.parseFloat(humidityString);
                            pbHumidity.setProgress((int) humidity); // Progress bar accepte un int
                            tvHumidity.setText("Humidité: " + humidity + "%");

                            // Vérifier si l'humidité est trop basse
                            if (humidity < 20) {
                                showNotification("Alerte Humidité", "Humidité basse détectée: " + humidity + "%");
                            }
                        }

                        if (flameString != null) {
                            float flameValue = Float.parseFloat(flameString);
                            tvFlame.setText("Flamme: " + flameValue);

                            // Vérifier si la valeur du capteur de flamme dépasse un seuil
                            int flameThreshold = 500; // Seuil à ajuster en fonction de votre capteur
                            if (flameValue > flameThreshold) {
                                showNotification("Alerte Incendie", "Flamme détectée ! Valeur du capteur: " + flameValue);
                            }
                        }

                        if (gasString != null) {
                            float gas = Float.parseFloat(gasString);
                            tvGas.setText("Gaz: " + gas + " ppm");

                            // Vérifier si le niveau de gaz est trop élevé
                            if (gas > 300) { // Seuil de gaz anormal
                                showNotification("Alerte Gaz", "Niveau élevé de gaz détecté: " + gas + " ppm");
                            }
                        }
                    }
                } catch (NumberFormatException e) {
                    handleError(e); // Gère les erreurs de conversion
                } catch (Exception e) {
                    handleError(e); // Gère d'autres erreurs inattendues
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {
                handleError(error.toException());
            }
        });
    }

    // Créer un canal de notification pour Android 8.0+
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Fire Detection Alerts";
            String description = "Notifications for fire and abnormal conditions";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    // Afficher une notification
    private void showNotification(String title, String message) {
        // Intent pour ouvrir l'application lorsqu'on appuie sur la notification
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK); // Assure une navigation correcte
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE // FLAG_IMMUTABLE est requis pour Android 12+
        );

        // Construire et afficher la notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_alert) // Icône par défaut
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent) // Lien avec le PendingIntent
                .setAutoCancel(true); // Ferme la notification après clic

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        notificationManager.notify((int) System.currentTimeMillis(), builder.build());
    }

    // Gestion des erreurs globales
    private void handleError(Exception e) {
        // Log l'exception pour le débogage
        e.printStackTrace();

        // Afficher un message d'erreur générique à l'utilisateur
        tvTemperature.setText("Erreur de connexion");
        tvHumidity.setText("Erreur de connexion");
        tvFlame.setText("Erreur de connexion");
        tvGas.setText("Erreur de connexion");

        // Afficher une notification d'erreur
        showNotification("Erreur", "Une erreur s'est produite dans l'application.");
    }

    // Gérer la réponse de la demande de permission
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 1) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission accordée
            } else {
                // Permission refusée
            }
        }
    }
}
