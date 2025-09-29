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
-- Table structure for table `trade_area_region`
--

DROP TABLE IF EXISTS `trade_area_region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_area_region` (
  `TRDAR_SE_CD` char(1) DEFAULT NULL COMMENT '상권_구분_코드',
  `TRDAR_SE_CD_NM` varchar(20) DEFAULT NULL COMMENT '상권_구분_코드_명',
  `TRDAR_CD` int NOT NULL COMMENT '상권_코드',
  `TRDAR_CD_NM` varchar(100) DEFAULT NULL COMMENT '상권_코드_명',
  `XCNTS_VALUE` double DEFAULT NULL COMMENT '엑스좌표_값(중심점)',
  `YDNTS_VALUE` double DEFAULT NULL COMMENT '와이좌표_값(중심점)',
  `SIGNGU_CD` varchar(10) DEFAULT NULL COMMENT '자치구_코드',
  `SIGNGU_CD_NM` varchar(50) DEFAULT NULL COMMENT '자치구_코드_명',
  `ADSTRD_CD` varchar(20) DEFAULT NULL COMMENT '행정동_코드',
  `ADSTRD_CD_NM` varchar(50) DEFAULT NULL COMMENT '행정동_코드_명',
  `RELM_AR` decimal(18,2) DEFAULT NULL COMMENT '영역_면적',
  PRIMARY KEY (`TRDAR_CD`),
  KEY `ix_region_gu_dong_trdar` (`SIGNGU_CD_NM`,`ADSTRD_CD_NM`,`TRDAR_CD`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='서울시 상권분석서비스(영역-상권): 상권코드별 중심좌표/행정코드/면적';
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
