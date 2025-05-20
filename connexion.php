// <!-- <?php
// require 'db.php';
// header('Content-Type: application/json');
//
// if ($_SERVER["REQUEST_METHOD"] === "POST") {
//     $nom = $_POST['username'];
//     $pass = $_POST['password'];
//
//     $stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE nom = ?");
//     $stmt->execute([$nom]);
//     $user = $stmt->fetch();
//
//     if ($user && password_verify($pass, $user['pass1'])) {
//         echo "Connexion réussie";
//         // Redirection ici si besoin
//         // header("Location: quiz.php");
//     } else {
//         echo "Nom ou mot de passe incorrect.";
//     }
// }
// ?> -->

// <?php
// require 'db.php';
// header('Content-Type: application/json');
//
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
//
// if ($_SERVER["REQUEST_METHOD"] === "POST") {
//     // Lire les données JSON brutes
//     $data = json_decode(file_get_contents("php://input"), true);
//
//     $nom = $data['username'] ?? '';
//     $pass = $data['password'] ?? '';
//
//     $stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE nom = ?");
//     $stmt->execute([$nom]);
//     $user = $stmt->fetch();
//
//     if ($user && password_verify($pass, $user['pass1'])) {
//         echo json_encode(["success" => true, "message" => "Connexion réussie"]);
//     } else {
//         echo json_encode(["success" => false, "message" => "Nom ou mot de passe incorrect."]);
//     }
// }
// ?>

<?php
// Connexion à la base de données
$host = 'localhost';
$user = 'root';
$password = ''; // Mets ici ton mot de passe s’il y en a un
$dbname = 'quiz';

$conn = mysqli_connect($host, $user, $password, $dbname);

if (!$conn) {
    die("Erreur de connexion à la base de données: " . mysqli_connect_error());
}

// Traitement de la requête POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nom = $_POST['username'] ?? '';
    $pass = $_POST['password'] ?? '';

    // Échapper les entrées pour éviter les injections SQL
    $nom = mysqli_real_escape_string($conn, $nom);
    $pass = mysqli_real_escape_string($conn, $pass);

    $sql = "SELECT * FROM utilisateurs WHERE nom = '$nom'";
    $result = mysqli_query($conn, $sql);

    if ($result && mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        if (password_verify($pass, $user['pass1'])) {
            echo "Connexion réussie";
            // Redirection vers la page principale
            header("Location: index.html");
            exit;
        } else {
            echo "Mot de passe incorrect.";
        }
    } else {
        echo "Nom d'utilisateur introuvable.";
    }
}

mysqli_close($conn);
?>
