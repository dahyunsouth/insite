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
-- Table structure for table `trade_area_repop_cd`
--

DROP TABLE IF EXISTS `trade_area_repop_cd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_area_repop_cd` (
  `STDR_YYQU_CD` varchar(6) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '기준_년분기_코드',
  `TRDAR_SE_CD` char(1) DEFAULT NULL COMMENT '상권_구분_코드',
  `TRDAR_SE_CD_NM` varchar(20) DEFAULT NULL COMMENT '상권_구분_코드_명',
  `TRDAR_CD` int NOT NULL COMMENT '상권_코드',
  `TRDAR_CD_NM` varchar(100) DEFAULT NULL COMMENT '상권_코드_명',
  `TOT_REPOP_CO` int unsigned DEFAULT NULL COMMENT '총_상주인구_수',
  `ML_REPOP_CO` int unsigned DEFAULT NULL COMMENT '남성_상주인구_수',
  `FML_REPOP_CO` int unsigned DEFAULT NULL COMMENT '여성_상주인구_수',
  `AGRDE_10_REPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_10_상주인구_수',
  `AGRDE_20_REPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_20_상주인구_수',
  `AGRDE_30_REPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_30_상주인구_수',
  `AGRDE_40_REPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_40_상주인구_수',
  `AGRDE_50_REPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_50_상주인구_수',
  `AGRDE_60_ABOVE_REPOP_CO` int unsigned DEFAULT NULL COMMENT '연령대_60_이상_상주인구_수',
  `MAG_10_REPOP_CO` int unsigned DEFAULT NULL COMMENT '남성연령대_10_상주인구_수',
  `MAG_20_REPOP_CO` int unsigned DEFAULT NULL COMMENT '남성연령대_20_상주인구_수',
  `MAG_30_REPOP_CO` int unsigned DEFAULT NULL COMMENT '남성연령대_30_상주인구_수',
  `MAG_40_REPOP_CO` int unsigned DEFAULT NULL COMMENT '남성연령대_40_상주인구_수',
  `MAG_50_REPOP_CO` int unsigned DEFAULT NULL COMMENT '남성연령대_50_상주인구_수',
  `MAG_60_ABOVE_REPOP_CO` int unsigned DEFAULT NULL COMMENT '남성연령대_60_이상_상주인구_수',
  `FAG_10_REPOP_CO` int unsigned DEFAULT NULL COMMENT '여성연령대_10_상주인구_수',
  `FAG_20_REPOP_CO` int unsigned DEFAULT NULL COMMENT '여성연령대_20_상주인구_수',
  `FAG_30_REPOP_CO` int unsigned DEFAULT NULL COMMENT '여성연령대_30_상주인구_수',
  `FAG_40_REPOP_CO` int unsigned DEFAULT NULL COMMENT '여성연령대_40_상주인구_수',
  `FAG_50_REPOP_CO` int unsigned DEFAULT NULL COMMENT '여성연령대_50_상주인구_수',
  `FAG_60_ABOVE_REPOP_CO` int unsigned DEFAULT NULL COMMENT '여성연령대_60_이상_상주인구_수',
  `TOT_HSHLD_CO` int unsigned DEFAULT NULL COMMENT '총_가구_수',
  `APT_HSHLD_CO` int unsigned DEFAULT NULL COMMENT '아파트_가구_수',
  `NON_APT_HSHLD_CO` int unsigned DEFAULT NULL COMMENT '비_아파트_가구_수',
  PRIMARY KEY (`STDR_YYQU_CD`,`TRDAR_CD`),
  KEY `ix_repop_trdar_qu` (`TRDAR_CD`,`STDR_YYQU_CD` DESC)
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
