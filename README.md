# Quiz avec niveaux - PHP/JS

Ce projet est un système de quiz avec plusieurs niveaux, développé en PHP, HTML, CSS et JavaScript.

## 🔧 Technologies utilisées

- PHP (backend)
- MySQL (base de données)
- HTML/CSS/JavaScript (frontend)

## ⚠️ Important

Ce projet **ne peut pas être exécuté directement sur GitHub**, car il nécessite un serveur PHP.

### 💡 Comment tester ce projet

Vous pouvez :

1. Télécharger et installer un environnement local comme :
   - [Laragon](https://laragon.org/)
   - [XAMPP](https://www.apachefriends.org/)
   - [MAMP](https://www.mamp.info/)


CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    pays VARCHAR(100),
    date_naissance DATE,
    mot_de_passe VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


Merci et bonne visite!
