-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 06-09-2023 a las 15:43:12
-- Versión del servidor: 8.0.34-0ubuntu0.20.04.1
-- Versión de PHP: 7.4.3-4ubuntu2.18
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;
--
-- Base de datos: `lextracking`
--
CREATE DATABASE IF NOT EXISTS `lextracking` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `lextracking`;
--
-- Estructura de tabla para la tabla `PaymentRequest`
--
CREATE TABLE IF NOT EXISTS `PaymentRequest` (
`id` int NOT NULL,
`user_id` int NOT NULL,
`status` ENUM('Pending', 'Approved', 'Rejected', 'Canceled') NOT NULL DEFAULT 'Pending',
`currency` varchar(10) NOT NULL,
`reply` varchar(500),
`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = latin1;
-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `PaymentRequestDetail`
--
CREATE TABLE IF NOT EXISTS `PaymentRequestDetail` (
`id` int NOT NULL,
`payment_request_id` int NOT NULL,
`concept` ENUM('Benefits', 'Compensation', 'Closure') NOT NULL,
`concept_description` varchar(500) NOT NULL,
`amount` DOUBLE NOT NULL,
`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = latin1;
-- --------------------------------------------------------
-- Add PaymentRequest table PK
ALTER TABLE `PaymentRequest`
ADD PRIMARY KEY (`id`);
-- Add AUTO_INCREMENT to PaymentRequest id
ALTER TABLE `PaymentRequest`
MODIFY `id` int NOT NULL AUTO_INCREMENT;
-- Add PaymentRequest table FK
ALTER TABLE `PaymentRequest`
ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES Users(`id`) ON UPDATE CASCADE ON DELETE RESTRICT;
-- Add PaymentRequestDetail table PK
ALTER TABLE `PaymentRequestDetail`
ADD PRIMARY KEY (`id`);
-- Add AUTO_INCREMENT to PaymentRequestDetail id
ALTER TABLE `PaymentRequestDetail`
MODIFY `id` int NOT NULL AUTO_INCREMENT;
-- Add PaymentRequestDetail table FK
ALTER TABLE `PaymentRequestDetail`
ADD CONSTRAINT `fk_payment_request_id` FOREIGN KEY (`payment_request_id`) REFERENCES PaymentRequest(`id`) ON UPDATE CASCADE ON DELETE RESTRICT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;