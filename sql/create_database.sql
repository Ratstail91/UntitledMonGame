# create the database
CREATE DATABASE IF NOT EXISTS eggtrainer;
USE eggtrainer;

# create the database user
CREATE USER IF NOT EXISTS 'eggtrainer'@'localhost' IDENTIFIED BY 'pikachu';
GRANT ALL PRIVILEGES ON eggtrainer.* TO 'eggtrainer'@'localhost';
