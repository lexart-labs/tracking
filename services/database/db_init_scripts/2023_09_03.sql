-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 06-09-2023 a las 15:43:12
-- Versión del servidor: 8.0.34-0ubuntu0.20.04.1
-- Versión de PHP: 7.4.3-4ubuntu2.18

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `lextracking`
--
CREATE DATABASE IF NOT EXISTS `lextracking` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `lextracking`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Banks`
--

CREATE TABLE IF NOT EXISTS `Banks` (
  `id` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `branchOffice` varchar(50) DEFAULT NULL,
  `holder` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `currency` varchar(50) DEFAULT NULL,
  `identificationCard` varchar(50) DEFAULT NULL,
  `account` varchar(50) DEFAULT NULL,
  `priceUsd` float DEFAULT NULL,
  `borrado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Bills`
--

CREATE TABLE IF NOT EXISTS `Bills` (
  `id` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `billNumber` varchar(50) DEFAULT NULL,
  `rut` varchar(50) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `concept` varchar(50) DEFAULT NULL,
  `price` varchar(50) DEFAULT NULL,
  `expirationTime` datetime DEFAULT NULL,
  `borrado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Budgets`
--

CREATE TABLE IF NOT EXISTS `Budgets` (
  `id` int NOT NULL,
  `idClient` int NOT NULL,
  `idUser` int NOT NULL DEFAULT '1',
  `concept` varchar(200) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(100) NOT NULL,
  `active` tinyint NOT NULL,
  `date` datetime NOT NULL,
  `description` longtext NOT NULL,
  `hoursTotal` decimal(10,2) NOT NULL,
  `hoursPayable` decimal(10,2) NOT NULL,
  `status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Clients`
--

CREATE TABLE IF NOT EXISTS `Clients` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `company` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `EasyWeb`
--

CREATE TABLE IF NOT EXISTS `EasyWeb` (
  `id` int NOT NULL,
  `name` varchar(500) NOT NULL,
  `domain` varchar(600) NOT NULL,
  `description` longtext NOT NULL,
  `jsonMenu` longtext NOT NULL,
  `jsonSections` longtext NOT NULL,
  `jsonSliders` longtext NOT NULL,
  `jsonForm` longtext NOT NULL,
  `jsonFooter` longtext NOT NULL,
  `active` int NOT NULL,
  `idUser` int NOT NULL,
  `connectToken` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Evaluate`
--

CREATE TABLE IF NOT EXISTS `Evaluate` (
  `id` int NOT NULL,
  `idUser` int NOT NULL,
  `idAdmin` int NOT NULL,
  `idTask` int NOT NULL,
  `evaluacion` text NOT NULL,
  `puntaje` tinyint NOT NULL,
  `fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Finances`
--

CREATE TABLE IF NOT EXISTS `Finances` (
  `id` int NOT NULL,
  `description` varchar(500) NOT NULL,
  `concept` varchar(200) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` varchar(200) NOT NULL,
  `currency` varchar(100) NOT NULL,
  `active` tinyint NOT NULL,
  `date` datetime NOT NULL,
  `status` varchar(200) NOT NULL,
  `idUser` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Hosting`
--

CREATE TABLE IF NOT EXISTS `Hosting` (
  `id` int NOT NULL,
  `fullName` varchar(50) DEFAULT NULL,
  `account` varchar(50) DEFAULT NULL,
  `serviceNumber` varchar(50) DEFAULT NULL,
  `finalClient` tinyint DEFAULT NULL,
  `company` tinyint DEFAULT NULL,
  `accountStatus` varchar(50) DEFAULT NULL,
  `serviceDescription` text,
  `serviceCost` int DEFAULT NULL,
  `contractType` varchar(50) DEFAULT NULL,
  `billingAddress` varchar(200) DEFAULT NULL,
  `businessName` varchar(50) DEFAULT NULL,
  `contact` text,
  `rut` varchar(50) DEFAULT NULL,
  `document` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `products` longtext,
  `startDate` datetime DEFAULT NULL,
  `borrado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `HoursCost`
--

CREATE TABLE IF NOT EXISTS `HoursCost` (
  `id` int NOT NULL,
  `idUser` int NOT NULL,
  `idClient` int NOT NULL,
  `costUser` decimal(10,2) NOT NULL,
  `costClient` decimal(10,2) NOT NULL,
  `currencyClient` varchar(100) NOT NULL,
  `currencyUser` varchar(100) NOT NULL,
  `date` datetime NOT NULL,
  `active` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `JiraBoards`
--

CREATE TABLE IF NOT EXISTS `JiraBoards` (
  `id` int NOT NULL,
  `idBoard` int NOT NULL,
  `keyProject` varchar(10) NOT NULL,
  `idProyecto` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `projectName` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `JiraTasks`
--

CREATE TABLE IF NOT EXISTS `JiraTasks` (
  `id` int NOT NULL,
  `idTask` int NOT NULL,
  `keyTask` varchar(12) NOT NULL,
  `idBoard` int NOT NULL,
  `idProyecto` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `project` varchar(100) NOT NULL,
  `status` text NOT NULL,
  `priority` text NOT NULL,
  `reporter` varchar(100) NOT NULL,
  `users` varchar(500) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `comments` varchar(500) NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  `type` varchar(200) NOT NULL DEFAULT 'jira'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Performance`
--

CREATE TABLE IF NOT EXISTS `Performance` (
  `id` int NOT NULL DEFAULT '0',
  `idUser` int NOT NULL,
  `year` year NOT NULL,
  `idMonth` tinyint NOT NULL,
  `month` text NOT NULL,
  `salary` int NOT NULL,
  `costHour` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Products`
--

CREATE TABLE IF NOT EXISTS `Products` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `cpu` varchar(50) DEFAULT NULL,
  `hdd` varchar(50) DEFAULT NULL,
  `transfer` varchar(50) DEFAULT NULL,
  `memory` varchar(50) DEFAULT NULL,
  `diskSpace` varchar(20) DEFAULT NULL,
  `amountEmails` int DEFAULT NULL,
  `amountDataBase` int DEFAULT NULL,
  `domain` varchar(50) DEFAULT NULL,
  `expiration` datetime DEFAULT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `placeAccommodation` varchar(50) DEFAULT NULL,
  `accessData` text,
  `link` varchar(50) DEFAULT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `note` text NOT NULL,
  `price` int NOT NULL,
  `databaseAccess` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `borrado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Projects`
--

CREATE TABLE IF NOT EXISTS `Projects` (
  `id` int NOT NULL,
  `idClient` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL,
  `comments` varchar(500) DEFAULT NULL,
  `duration` time DEFAULT NULL,
  `tracked` time NOT NULL,
  `totalCost` int NOT NULL DEFAULT '0',
  `presupuesto` int NOT NULL DEFAULT '0',
  `externals` binary(1) DEFAULT '0',
  `active` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Sales`
--

CREATE TABLE IF NOT EXISTS `Sales` (
  `id` int NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `concept` varchar(200) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `type` varchar(200) DEFAULT NULL,
  `currency` varchar(100) DEFAULT NULL,
  `active` tinyint DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `status` varchar(200) DEFAULT NULL,
  `client` varchar(200) DEFAULT NULL,
  `idClient` int DEFAULT NULL,
  `seller` varchar(200) DEFAULT NULL,
  `payType` varchar(200) DEFAULT NULL,
  `card` varchar(200) DEFAULT NULL,
  `idUser` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TaskAutomatic`
--

CREATE TABLE IF NOT EXISTS `TaskAutomatic` (
  `id` int NOT NULL,
  `idProyecto` int DEFAULT NULL,
  `idClient` int NOT NULL,
  `error` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `project` text NOT NULL,
  `line` int NOT NULL,
  `column` int NOT NULL,
  `file` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `origin` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `url` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `dateCapture` datetime NOT NULL,
  `dateCreate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dateUpdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comments` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `duration` time NOT NULL,
  `users` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'automatic',
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `client` text NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Tasks`
--

CREATE TABLE IF NOT EXISTS `Tasks` (
  `id` int NOT NULL,
  `idProject` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL,
  `comments` varchar(500) DEFAULT NULL,
  `duration` time DEFAULT NULL,
  `users` varchar(500) DEFAULT NULL,
  `type` varchar(200) NOT NULL DEFAULT 'manual',
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Tracks`
--

CREATE TABLE IF NOT EXISTS `Tracks` (
  `id` int NOT NULL,
  `idTask` int DEFAULT NULL,
  `idUser` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `typeTrack` varchar(20) DEFAULT 'manual',
  `currency` varchar(10) DEFAULT NULL,
  `trackCost` int DEFAULT NULL,
  `idProyecto` int DEFAULT NULL,
  `duracion` int DEFAULT '0',
  `startTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TrelloBoard`
--

CREATE TABLE IF NOT EXISTS `TrelloBoard` (
  `id` int NOT NULL,
  `tablero_id` varchar(250) NOT NULL,
  `proyecto_id` int NOT NULL,
  `url` varchar(250) NOT NULL,
  `activo` text NOT NULL,
  `dateCreate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dateUpdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TrelloTask`
--

CREATE TABLE IF NOT EXISTS `TrelloTask` (
  `id` int NOT NULL,
  `card_id` varchar(250) NOT NULL,
  `id_project` int NOT NULL,
  `idProyecto` int NOT NULL,
  `id_board` varchar(250) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `project` text NOT NULL,
  `description` varchar(500) NOT NULL,
  `comments` text NOT NULL,
  `duration` time NOT NULL,
  `users` varchar(500) NOT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'trello',
  `dateCreate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dateUpdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `status` varchar(20) NOT NULL,
  `client` text NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `UserExceptions`
--

CREATE TABLE IF NOT EXISTS `UserExceptions` (
  `user_exceptions_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `day` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `title` varchar(255) NOT NULL,
  `start` timestamp NULL DEFAULT NULL,
  `end` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Users`
--

CREATE TABLE IF NOT EXISTS `Users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(100) NOT NULL,
  `jiraToken` longtext,
  `idSlack` varchar(50) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `UsersHours`
--

CREATE TABLE IF NOT EXISTS `UsersHours` (
  `user_hour_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `day` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `title` enum('Horario Fijo') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `start` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `end` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `WeeklyHours`
--

CREATE TABLE IF NOT EXISTS `WeeklyHours` (
  `id` int NOT NULL,
  `idUser` int DEFAULT NULL,
  `userName` varchar(50) DEFAULT NULL,
  `costHour` float DEFAULT NULL,
  `workLoad` float DEFAULT NULL,
  `currency` varchar(200) DEFAULT NULL,
  `borrado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Banks`
--
ALTER TABLE `Banks`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Bills`
--
ALTER TABLE `Bills`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Budgets`
--
ALTER TABLE `Budgets`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Clients`
--
ALTER TABLE `Clients`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `EasyWeb`
--
ALTER TABLE `EasyWeb`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Evaluate`
--
ALTER TABLE `Evaluate`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Finances`
--
ALTER TABLE `Finances`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Hosting`
--
ALTER TABLE `Hosting`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `HoursCost`
--
ALTER TABLE `HoursCost`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `JiraBoards`
--
ALTER TABLE `JiraBoards`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Products`
--
ALTER TABLE `Products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Projects`
--
ALTER TABLE `Projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idClient` (`idClient`);

--
-- Indices de la tabla `Sales`
--
ALTER TABLE `Sales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `TaskAutomatic`
--
ALTER TABLE `TaskAutomatic`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Tasks`
--
ALTER TABLE `Tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idProject` (`idProject`);

--
-- Indices de la tabla `Tracks`
--
ALTER TABLE `Tracks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idTask` (`idTask`),
  ADD KEY `idUser` (`idUser`);

--
-- Indices de la tabla `TrelloBoard`
--
ALTER TABLE `TrelloBoard`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `TrelloTask`
--
ALTER TABLE `TrelloTask`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indices de la tabla `UserExceptions`
--
ALTER TABLE `UserExceptions`
  ADD PRIMARY KEY (`user_exceptions_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `UsersHours`
--
ALTER TABLE `UsersHours`
  ADD PRIMARY KEY (`user_hour_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `WeeklyHours`
--
ALTER TABLE `WeeklyHours`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Banks`
--
ALTER TABLE `Banks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Bills`
--
ALTER TABLE `Bills`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Budgets`
--
ALTER TABLE `Budgets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Clients`
--
ALTER TABLE `Clients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `EasyWeb`
--
ALTER TABLE `EasyWeb`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Evaluate`
--
ALTER TABLE `Evaluate`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Finances`
--
ALTER TABLE `Finances`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Hosting`
--
ALTER TABLE `Hosting`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `HoursCost`
--
ALTER TABLE `HoursCost`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `JiraBoards`
--
ALTER TABLE `JiraBoards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Products`
--
ALTER TABLE `Products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Projects`
--
ALTER TABLE `Projects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Sales`
--
ALTER TABLE `Sales`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `TaskAutomatic`
--
ALTER TABLE `TaskAutomatic`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Tasks`
--
ALTER TABLE `Tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Tracks`
--
ALTER TABLE `Tracks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `TrelloBoard`
--
ALTER TABLE `TrelloBoard`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `TrelloTask`
--
ALTER TABLE `TrelloTask`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `UserExceptions`
--
ALTER TABLE `UserExceptions`
  MODIFY `user_exceptions_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `UsersHours`
--
ALTER TABLE `UsersHours`
  MODIFY `user_hour_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `WeeklyHours`
--
ALTER TABLE `WeeklyHours`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Projects`
--
ALTER TABLE `Projects`
  ADD CONSTRAINT `Projects_ibfk_1` FOREIGN KEY (`idClient`) REFERENCES `Clients` (`id`);

--
-- Filtros para la tabla `Tasks`
--
ALTER TABLE `Tasks`
  ADD CONSTRAINT `Tasks_ibfk_1` FOREIGN KEY (`idProject`) REFERENCES `Projects` (`id`);

--
-- Filtros para la tabla `Tracks`
--
ALTER TABLE `Tracks`
  ADD CONSTRAINT `Tracks_ibfk_2` FOREIGN KEY (`idUser`) REFERENCES `Users` (`id`);
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
