package com.example.myfiredetectionapplication;

import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

public class CallUsActivity extends AppCompatActivity {

    private static final int REQUEST_CALL_PERMISSION = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_call_us);

        // Activer le bouton de retour dans la barre d'action
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Numéros SOS en Tunisie");
        }
    }

    // Gérer le clic sur le bouton de retour
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish(); // Fermer l'activité actuelle pour revenir en arrière
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    // Cette méthode sera appelée lorsque l'utilisateur clique sur une carte
    public void onCardClick(View view) {
        // Définir le numéro de téléphone comme une variable finale
        final String phoneNumber;

        if (view.getId() == R.id.card_police) {
            phoneNumber = "tel:197"; // Police
        } else if (view.getId() == R.id.card_pompiers) {
            phoneNumber = "tel:198"; // Pompiers
        } else if (view.getId() == R.id.card_ambulance) {
            phoneNumber = "tel:190"; // Ambulance
        } else if (view.getId() == R.id.card_guard) {
            phoneNumber = "tel:193"; // Garde nationale
        } else {
            return; // Si la vue n'est pas reconnue, on ne fait rien
        }

        // Créer un AlertDialog pour confirmer l'appel
        new AlertDialog.Builder(this)
                .setTitle("Appeler ce numéro ?")
                .setMessage("Voulez-vous appeler le numéro " + phoneNumber + " ?")
                .setPositiveButton("Oui", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        // Vérifier si la permission d'appel est accordée
                        if (ActivityCompat.checkSelfPermission(CallUsActivity.this, android.Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
                            // Si la permission n'est pas accordée, demander à l'utilisateur
                            ActivityCompat.requestPermissions(CallUsActivity.this, new String[]{android.Manifest.permission.CALL_PHONE}, REQUEST_CALL_PERMISSION);
                        } else {
                            // Si la permission est déjà accordée, lancer l'appel
                            makePhoneCall(phoneNumber);
                        }
                    }
                })
                .setNegativeButton("Non", null)
                .show();
    }

    // Cette méthode est appelée après la demande de permission
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == REQUEST_CALL_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission accordée, effectuer l'appel
                makePhoneCall("tel:197"); // Vous pouvez ajuster cela selon le numéro choisi
            } else {
                // Si la permission est refusée, afficher un message d'erreur
                Toast.makeText(this, "Permission d'appel non accordée", Toast.LENGTH_SHORT).show();
            }
        }
    }

    // Effectuer l'appel téléphonique
    private void makePhoneCall(String phoneNumber) {
        Intent callIntent = new Intent(Intent.ACTION_CALL);
        callIntent.setData(Uri.parse(phoneNumber));

        // Vérifier si l'application peut effectuer l'appel
        if (callIntent.resolveActivity(getPackageManager()) != null) {
            startActivity(callIntent);
        } else {
            Toast.makeText(this, "Impossible de passer l'appel", Toast.LENGTH_SHORT).show();
        }
    }
}
