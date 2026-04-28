CREATE DATABASE IF NOT EXISTS fsad_portal;
USE fsad_portal;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(30) NOT NULL,
    progress INT NOT NULL,
    owner_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    bio VARCHAR(1000),
    phone VARCHAR(20),
    branch VARCHAR(100),
    college VARCHAR(150),
    github_url VARCHAR(250),
    linkedin_url VARCHAR(250),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS milestones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(30) NOT NULL,
    student_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_milestones_student FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message VARCHAR(2000) NOT NULL,
    admin_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_feedback_admin FOREIGN KEY (admin_id) REFERENCES users(id),
    CONSTRAINT fk_feedback_student FOREIGN KEY (student_id) REFERENCES users(id)
);
