CREATE DATABASE user_database;

CREATE TABLE user_table(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    primary_skill VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
);

INSERT INTO user_table (name, email, password, age, primary_skill, address) VALUES ('admin', 'admin@example.com', 'admin', 14, 'admin', 'admin');