DROP TABLE `administrators`;

DROP TABLE `series`;

CREATE TABLE `Administrators` (
  `admin_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `login` varchar(50) NOT NULL,
  `password` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;

CREATE TABLE `Actors`
(
	`actor_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(50) NOT NULL,
	`middle_name` VARCHAR(50) NULL,
	`surname` VARCHAR(50) NOT NULL,
	`date_of_birth` DATE NULL,
	`citizenship` VARCHAR(50) NULL,
	`imdb_id` BIGINT UNSIGNED NULL,
	CONSTRAINT `PK_Actors` PRIMARY KEY (`actor_id` ASC)
);

CREATE TABLE `Actors_In_Series`
(
	`series_id` BIGINT UNSIGNED NOT NULL,
	`actor_id` BIGINT UNSIGNED NOT NULL,
	CONSTRAINT `PK_Actors_In_Series` PRIMARY KEY (`series_id` ASC, `actor_id` ASC)
);

CREATE TABLE `Episodes`
(
	`episode_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`season_id` BIGINT UNSIGNED NOT NULL,
	`serial_number` SMALLINT UNSIGNED NOT NULL,
	`title` VARCHAR(50) NULL,
	`duration` TIME NOT NULL,
	`premiere_date` DATE NULL,
	`description` TEXT NULL,
	CONSTRAINT `PK_Episodes` PRIMARY KEY (`episode_id` ASC)
);

CREATE TABLE `Ratings`
(
	`user_id` BIGINT UNSIGNED NOT NULL,
	`series_id` BIGINT UNSIGNED NOT NULL,
	`rating_value` TINYINT NOT NULL,
	CONSTRAINT `PK_Ratings` PRIMARY KEY (`user_id` ASC, `series_id` ASC)
);

CREATE TABLE `Seasons`
(
	`season_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`series_id` BIGINT UNSIGNED NOT NULL,
	`serial_number` TINYINT UNSIGNED NOT NULL,
	`title` VARCHAR(50) NULL,
	`premiere_date` DATE NULL,
	`description` TEXT NULL,
	CONSTRAINT `PK_Seasons` PRIMARY KEY (`season_id` ASC)
);

CREATE TABLE `Series`
(
	`series_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`title` VARCHAR(50) NOT NULL,
	`country` VARCHAR(50) NULL,
	`premiere_date` DATE NULL,
	`original_language` VARCHAR(50) NULL,
	`opening_theme` NVARCHAR(100) NULL,
	`age_limit` VARCHAR(3) NULL,
	`description` TEXT NULL,
	`rating` FLOAT(2,1) NULL,
	`imdb_id` BIGINT UNSIGNED NULL,
	CONSTRAINT `PK_Series` PRIMARY KEY (`series_id` ASC)
);

CREATE TABLE `Users`
(
	`user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`e_mail` VARCHAR(50) NOT NULL,
	`password` VARCHAR(32) NOT NULL,
	`nickname` VARCHAR(50) NOT NULL,
	CONSTRAINT `PK_Users` PRIMARY KEY (`user_id` ASC)
)

ALTER TABLE `Actors`
 ADD CONSTRAINT `UQ_Actors_Imdb_Id` UNIQUE (`imdb_id` ASC)
;

ALTER TABLE `Actors`
 ADD INDEX `IX_Actors_Name` (`name` ASC)
;

ALTER TABLE `Actors`
 ADD INDEX `IX_Actors_Surname` (`surname` ASC)
;

ALTER TABLE `Actors`
 ADD INDEX `IX_Actors_Middle_Name` (`middle_name` ASC)
;

ALTER TABLE `Actors`
 ADD INDEX `IX_Actors_Citizenship` (`citizenship` ASC)
;

ALTER TABLE `Actors`
 ADD INDEX `IX_Actors_Name_Surname` (`name` ASC, `surname` ASC)
;

ALTER TABLE `Actors`
 ADD INDEX `IX_Actors_Middle_Name_Surname` (`middle_name` ASC, `surname` ASC)
;

ALTER TABLE `Actors`
 ADD INDEX `IX_Actors_Name_Middle_Name_Surname` (`name` ASC, `middle_name` ASC, `surname` ASC)
;

ALTER TABLE `Actors`
 ADD INDEX `IX_Actors_Name_Middle_Name` (`name` ASC, `middle_name` ASC)
;

ALTER TABLE `Actors_In_Series`
 ADD INDEX `IXFK_Actors_In_Series_Actors` (`actor_id` ASC)
;

ALTER TABLE `Actors_In_Series`
 ADD INDEX `IXFK_Actors_In_Series_Series` (`series_id` ASC)
;

ALTER TABLE `Episodes`
 ADD INDEX `IXFK_Episodes_Seasons` (`season_id` ASC)
;

ALTER TABLE `Episodes`
 ADD INDEX `UQIX_Episodes_Season_Id_Serial_Number` (`season_id` ASC, `serial_number` ASC)
;

ALTER TABLE `Episodes`
 ADD INDEX `IX_Episodes_Title` (`title` ASC)
;

ALTER TABLE `Episodes`
 ADD INDEX `IX_Episodes_Premiere_Date` (`premiere_date` ASC)
;

ALTER TABLE `Episodes`
 ADD INDEX `UQIX_Episodes_Season_Id_Title` (`season_id` ASC, `title` ASC)
;

ALTER TABLE `Ratings`
 ADD CONSTRAINT `CHK_Ratings_Rating_Value` CHECK (rating_value <= 5 AND rating_value >= 1)
;

ALTER TABLE `Ratings`
 ADD INDEX `IXFK_Ratings_Series` (`series_id` ASC)
;

ALTER TABLE `Ratings`
 ADD INDEX `IXFK_Ratings_Users` (`user_id` ASC)
;

DELIMITER //
DELIMITER //
CREATE TRIGGER `TRG_Ratings_OnInsert` BEFORE INSERT ON `Ratings`
FOR EACH ROW
BEGIN
  DECLARE k BIGINT UNSIGNED;
  DECLARE old_rating FLOAT(2,1);
  DECLARE new_rating FLOAT(2,1);
  SET k = (SELECT COUNT(*) FROM `Ratings` WHERE `series_id` = NEW.series_id);
  SET old_rating = (SELECT `rating` FROM `Series` WHERE `series_id`=NEW.series_id);
  SET new_rating = ((old_rating * k + NEW.rating_value) / (k + 1));
  UPDATE `Series` SET `rating` = new_rating WHERE `series_id` = NEW.series_id;
END //
DELIMITER ;
//
DELIMITER ;
;

ALTER TABLE `Seasons`
 ADD INDEX `IXFK_Seasons_Series` (`series_id` ASC)
;

ALTER TABLE `Seasons`
 ADD INDEX `IX_Seasons_Title` (`title` ASC)
;

ALTER TABLE `Seasons`
 ADD INDEX `UQIX_Seasons_Series_Id_Serial_Number` (`series_id` ASC, `serial_number` ASC)
;

ALTER TABLE `Seasons`
 ADD INDEX `IX_Seasons_Premiere_Date` (`premiere_date` ASC)
;

ALTER TABLE `Seasons`
 ADD INDEX `UQIX_Seasons_Series_Id_Title` (`series_id` ASC, `title` ASC)
;

ALTER TABLE `Series`
 ADD CONSTRAINT `UQ_Series_Imdb_Id` UNIQUE (`imdb_id` ASC)
;

ALTER TABLE `Series`
 ADD INDEX `IX_Series_Title` (`title` ASC)
;

ALTER TABLE `Series`
 ADD INDEX `IX_Series_Country` (`country` ASC)
;

ALTER TABLE `Series`
 ADD INDEX `IX_Series_Rating` (`rating` ASC)
;

ALTER TABLE `Series`
 ADD INDEX `IX_Series_Premiere_Date` (`premiere_date` ASC)
;

ALTER TABLE `Series`
 ADD INDEX `IX_Series_Title_Country` (`title` ASC, `country` ASC)
;

ALTER TABLE `Series`
 ADD INDEX `IX_Series_Country_Rating` (`country` ASC, `rating` ASC)
;

ALTER TABLE `Series`
 ADD INDEX `IX_Series_Country_Premiere_Date` (`country` ASC, `premiere_date` ASC)
;

DELIMITER //
DELIMITER //
CREATE TRIGGER `TRG_Series_OnInsert` BEFORE INSERT ON `Series`
FOR EACH ROW
BEGIN
  SET NEW.rating = 0;
END //
DELIMITER ;
//
DELIMITER ;
;

ALTER TABLE `Users`
 ADD INDEX `UQIX_Users_E_Mail` (`e_mail` ASC)
;

ALTER TABLE `Administrators`
 ADD INDEX `UQIX_Administrators_Login` (`login` ASC)
;

ALTER TABLE `Users`
 ADD INDEX `UQIX_Users_Nickname` (`nickname` ASC)
;

DELIMITER //
DELIMITER //
CREATE TRIGGER `TRG_Users_OnInsert` BEFORE INSERT ON `Users`
FOR EACH ROW
BEGIN
  SET NEW.password = md5(NEW.password);
END //
DELIMITER ;
//
DELIMITER ;
;

DELIMITER //
DELIMITER //
CREATE TRIGGER `TRG_Users_OnUpdate` BEFORE UPDATE ON `Users`
FOR EACH ROW
BEGIN
  SET NEW.password = md5(NEW.password);
END //
DELIMITER ;
//
DELIMITER ;
;

DELIMITER //
DELIMITER //
CREATE TRIGGER `TRG_Administrators_OnInsert` BEFORE INSERT ON `Administrators`
FOR EACH ROW
BEGIN
  SET NEW.password = md5(NEW.password);
END //
DELIMITER ;
//
DELIMITER ;
;

DELIMITER //
DELIMITER //
CREATE TRIGGER `TRG_Administrators_OnUpdate` BEFORE UPDATE ON `Administrators`
FOR EACH ROW
BEGIN
  SET NEW.password = md5(NEW.password);
END //
DELIMITER ;
//
DELIMITER ;
;

ALTER TABLE `Actors_In_Series`
 ADD CONSTRAINT `FK_Actors_In_Series_Actors`
	FOREIGN KEY (`actor_id`) REFERENCES `Actors` (`actor_id`) ON DELETE Cascade ON UPDATE Cascade
;

ALTER TABLE `Actors_In_Series`
 ADD CONSTRAINT `FK_Actors_In_Series_Series`
	FOREIGN KEY (`series_id`) REFERENCES `Series` (`series_id`) ON DELETE Cascade ON UPDATE Cascade
;

ALTER TABLE `Episodes`
 ADD CONSTRAINT `FK_Episodes_Seasons`
	FOREIGN KEY (`season_id`) REFERENCES `Seasons` (`season_id`) ON DELETE Cascade ON UPDATE Cascade
;

ALTER TABLE `Ratings`
 ADD CONSTRAINT `FK_Ratings_Series`
	FOREIGN KEY (`series_id`) REFERENCES `Series` (`series_id`) ON DELETE Cascade ON UPDATE Cascade
;

ALTER TABLE `Ratings`
 ADD CONSTRAINT `FK_Ratings_Users`
	FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE Cascade ON UPDATE Cascade
;

ALTER TABLE `Seasons`
 ADD CONSTRAINT `FK_Seasons_Series`
	FOREIGN KEY (`series_id`) REFERENCES `Series` (`series_id`) ON DELETE Cascade ON UPDATE Cascade
;

INSERT INTO `administrators` (`login`, `password`) VALUES
('episodia@gmail.com', 'episodia2019')

INSERT INTO `administrators` (`login`, `password`) VALUES
('episodia@mail.ru', 'episodia2019')


INSERT INTO `administrators` (`login`, `password`) VALUES
('episodia@gmail.com', 'episodia2019')

INSERT INTO `administrators` (`login`, `password`) VALUES
('episodia@mail.ru', 'episodia2019')

INSERT INTO `series` (`series_id`, `title`, `country`, `premiere_date`, `original_language`, `opening_theme`, `age_limit`, `description`, `rating`, `imdb_id`) VALUES ('1', 'Family Guy', 'USA', '1999-01-31', 'English', 'Seth MacFarlane - \"Family Guy\"', '16+', 'In a wacky Rhode Island town, a dysfunctional family strive to cope with everyday life as they are thrown from one crazy scenario to another.', '5.0', '182576');

COMMIT;
