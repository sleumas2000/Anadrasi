CREATE DATABASE IF NOT EXISTS Anadrasi;
USE Anadrasi;

CREATE TABLE Ratings (
	RatingID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	TimeSubmitted TIMESTAMP,
	Rating INT NOT NULL
);
CREATE TABLE Feedback (
	FeedbackID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	TimeSubmitted TIMESTAMP,
	Comment VARCHAR(500) NOT NULL
);
CREATE TABLE Menu (
	MenuID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	Week VARCHAR(64) NOT NULL,
	Day VARCHAR(64) NOT NULL,
    MenuJSON VARCHAR(10000)
);
CREATE TABLE Config (
	Setting VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
    Value VARCHAR(64)
);