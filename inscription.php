<?php
require 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nom = $_POST['nom'];
    $prenom = $_POST['prenom'];
    $pays = $_POST['pays'];
    $naissance = $_POST['naissance'];
    $pass1 = $_POST['pass1'];
    $pass2 = $_POST['pass2'];

    if ($pass1 !== $pass2) {
        echo "Les mots de passe ne correspondent pas.";
        exit;
    }

    $hash = password_hash($pass1, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO utilisateurs (nom, prenom, pays, naissance, pass1) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$nom, $prenom, $pays, $naissance, $hash])) {
        header("Location: connexion.html");
        exit;
    } else {
        echo "Erreur lors de l'inscription.";
    }
}
?>
