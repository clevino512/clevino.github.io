<?php
require 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $date = $_POST['date'];
    $newPass = $_POST['password'];
    $confirmPass = $_POST['confirmPassword'];

    if ($newPass !== $confirmPass) {
        echo "Les mots de passe ne correspondent pas.";
        exit;
    }

    // Vérifie si un utilisateur correspond à cette date de naissance
    $stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE naissance = ?");
    $stmt->execute([$date]);
    $user = $stmt->fetch();

    if ($user) {
        $hash = password_hash($newPass, PASSWORD_DEFAULT);
        $update = $pdo->prepare("UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?");
        $update->execute([$hash, $user['id']]);
        echo "Mot de passe mis à jour.";
    } else {
        echo "Date de naissance incorrecte.";
    }
}
?>
