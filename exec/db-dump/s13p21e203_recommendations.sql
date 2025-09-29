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
-- Table structure for table `recommendations`
--

DROP TABLE IF EXISTS `recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `area_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '발달' COMMENT '상권 유형',
  `district` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '구명',
  `ranking` int NOT NULL COMMENT '순위',
  `area_code` int NOT NULL,
  `area_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '상권명',
  `total_score` decimal(5,2) NOT NULL COMMENT '종합 점수',
  `sustainability_score` decimal(5,2) DEFAULT NULL COMMENT '지속성 점수',
  `profitability_score` decimal(5,2) DEFAULT NULL COMMENT '수익성 점수',
  `accessibility_score` decimal(5,2) DEFAULT NULL COMMENT '접근성 점수',
  `risk_score` decimal(5,2) DEFAULT NULL COMMENT '위험도 점수',
  `competition_score` decimal(5,2) DEFAULT NULL COMMENT '경쟁강도',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `administrative_dong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '행정동',
  PRIMARY KEY (`id`),
  KEY `idx_district_ranking` (`district`,`ranking`),
  KEY `idx_total_score` (`total_score` DESC),
  KEY `idx_area_type_district` (`area_type`,`district`,`ranking`),
  KEY `ix_recommendations_district_type_ranking` (`district`,`area_type`,`ranking`)
) ENGINE=InnoDB AUTO_INCREMENT=2739 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='상권 추천 결과 테이블';
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
