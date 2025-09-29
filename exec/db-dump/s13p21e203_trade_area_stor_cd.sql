-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: ssafy-mysql-db.mysql.database.azure.com    Database: s13p21e203
-- ------------------------------------------------------
-- Server version	8.0.42-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `trade_area_stor_cd`
--

DROP TABLE IF EXISTS `trade_area_stor_cd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_area_stor_cd` (
  `STDR_YYQU_CD` varchar(6) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '기준_년분기_코드',
  `TRDAR_SE_CD` char(1) DEFAULT NULL COMMENT '상권_구분_코드',
  `TRDAR_SE_CD_NM` varchar(20) DEFAULT NULL COMMENT '상권_구분_코드_명',
  `TRDAR_CD` int NOT NULL COMMENT '상권_코드',
  `TRDAR_CD_NM` varchar(100) DEFAULT NULL COMMENT '상권_코드_명',
  `SVC_INDUTY_CD` varchar(20) NOT NULL COMMENT '서비스_업종_코드',
  `SVC_INDUTY_CD_NM` varchar(50) DEFAULT NULL COMMENT '서비스_업종_코드_명',
  `STOR_CO` int unsigned DEFAULT NULL COMMENT '점포_수',
  `SIMILR_INDUTY_STOR_CO` int unsigned DEFAULT NULL COMMENT '유사_업종_점포_수',
  `OPBIZ_RT` decimal(7,4) DEFAULT NULL COMMENT '개업_율(%)',
  `OPBIZ_STOR_CO` int unsigned DEFAULT NULL COMMENT '개업_점포_수',
  `CLSBIZ_RT` decimal(7,4) DEFAULT NULL COMMENT '폐업_률(%)',
  `CLSBIZ_STOR_CO` int unsigned DEFAULT NULL COMMENT '폐업_점포_수',
  `FRC_STOR_CO` int unsigned DEFAULT NULL COMMENT '프랜차이즈_점포_수',
  PRIMARY KEY (`STDR_YYQU_CD`,`TRDAR_CD`,`SVC_INDUTY_CD`),
  KEY `ix_stor_trdar_svc_yyqu` (`TRDAR_CD`,`SVC_INDUTY_CD_NM`,`STDR_YYQU_CD`),
  KEY `ix_stor_trdar_svc_yyqu_cover` (`TRDAR_CD`,`SVC_INDUTY_CD_NM`,`STDR_YYQU_CD`,`STOR_CO`,`SIMILR_INDUTY_STOR_CO`),
  KEY `ix_stor_trdar_svc_qu` (`TRDAR_CD`,`SVC_INDUTY_CD_NM`,`STDR_YYQU_CD` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
