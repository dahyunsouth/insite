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
-- Table structure for table `trade_area_flpop_cd`
--

DROP TABLE IF EXISTS `trade_area_flpop_cd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_area_flpop_cd` (
  `STDR_YYQU_CD` int unsigned NOT NULL COMMENT '기준_년분기_코드',
  `TRDAR_SE_CD` varchar(20) DEFAULT NULL COMMENT '상권_구분_코드',
  `TRDAR_SE_CD_NM` varchar(20) DEFAULT NULL COMMENT '상권_구분_코드_명',
  `TRDAR_CD` int unsigned NOT NULL COMMENT '상권_코드',
  `TRDAR_CD_NM` varchar(100) DEFAULT NULL COMMENT '상권_코드_명',
  `TOT_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '총_유동인구_수',
  `ML_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '남성_유동인구_수',
  `FML_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '여성_유동인구_수',
  `AGRDE_10_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_10_유동인구_수',
  `AGRDE_20_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_20_유동인구_수',
  `AGRDE_30_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_30_유동인구_수',
  `AGRDE_40_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_40_유동인구_수',
  `AGRDE_50_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_50_유동인구_수',
  `AGRDE_60_ABOVE_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_60_이상_유동인구_수',
  `TMZON_00_06_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '시간대_00_06_유동인구_수',
  `TMZON_06_11_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '시간대_06_11_유동인구_수',
  `TMZON_11_14_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '시간대_11_14_유동인구_수',
  `TMZON_14_17_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '시간대_14_17_유동인구_수',
  `TMZON_17_21_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '시간대_17_21_유동인구_수',
  `TMZON_21_24_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '시간대_21_24_유동인구_수',
  `MON_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '월요일_유동인구_수',
  `TUES_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '화요일_유동인구_수',
  `WED_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '수요일_유동인구_수',
  `THUR_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '목요일_유동인구_수',
  `FRI_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '금요일_유동인구_수',
  `SAT_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '토요일_유동인구_수',
  `SUN_FLPOP_CO` int unsigned DEFAULT NULL COMMENT '일요일_유동인구_수',
  PRIMARY KEY (`STDR_YYQU_CD`,`TRDAR_CD`),
  KEY `ix_flpop_trdar_qu` (`TRDAR_CD`,`STDR_YYQU_CD` DESC)
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
