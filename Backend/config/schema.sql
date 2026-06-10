CREATE DATABASE IF NOT EXISTS ikonex_student_management;
USE ikonex_student_management;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_streams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grading_scales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  min_score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  grade VARCHAR(2) NOT NULL,
  UNIQUE(grade)
);

CREATE TABLE class_subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_stream_id INT NOT NULL,
  subject_id INT NOT NULL,
  FOREIGN KEY (class_stream_id) REFERENCES class_streams(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(class_stream_id, subject_id)
);

CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  admission_number VARCHAR(50) NOT NULL UNIQUE,
  class_stream_id INT NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_stream_id) REFERENCES class_streams(id) ON DELETE CASCADE
);

CREATE TABLE scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  exam_score DECIMAL(5,2) DEFAULT 0,
  continuous_assessment DECIMAL(5,2) DEFAULT 0,
  total_score DECIMAL(5,2),
  grade VARCHAR(2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(student_id, subject_id)
);

INSERT INTO grading_scales (min_score, max_score, grade) VALUES
(80, 100, 'A'),
(70, 79.99, 'B'),
(60, 69.99, 'C'),
(50, 59.99, 'D'),
(0, 49.99, 'F');

-- Demo user (password: password123, hashed with bcryptjs)
INSERT INTO users (name, email, password) VALUES
('Admin User', 'admin@test.com', '$2a$10$HJwkiqzY1HVg99CyxXUVSuDhkTHjFqsP0TFaGJQHdmCnfKhfFQvJi');
