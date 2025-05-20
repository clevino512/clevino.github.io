# Utiliser l'image officielle PHP avec Apache
FROM php:8.1-apache

# Copier tout le contenu de ton projet vers le dossier du serveur web Apache
COPY . /var/www/html/

# Donner les bons droits aux fichiers
RUN chown -R www-data:www-data /var/www/html

# Activer le module Apache "rewrite" (utile pour certains frameworks PHP)
RUN a2enmod rewrite

# Exposer le port utilisé par Apache
EXPOSE 80
