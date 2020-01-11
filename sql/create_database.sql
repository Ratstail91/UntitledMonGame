# create the database
CREATE DATABASE IF NOT EXISTS mon;
USE mon;

# create the database user
CREATE USER IF NOT EXISTS 'mon'@'localhost' IDENTIFIED BY 'pikachu';
GRANT ALL PRIVILEGES ON mon.* TO 'mon'@'localhost';
