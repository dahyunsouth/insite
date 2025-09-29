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
-- Table structure for table `trade_area_income_expend_cd`
--

DROP TABLE IF EXISTS `trade_area_income_expend_cd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_area_income_expend_cd` (
  `STDR_YYQU_CD` varchar(6) NOT NULL COMMENT '기준_년분기_코드',
  `TRDAR_SE_CD` char(1) DEFAULT NULL COMMENT '상권_구분_코드',
  `TRDAR_SE_CD_NM` varchar(20) DEFAULT NULL COMMENT '상권_구분_코드_명',
  `TRDAR_CD` int NOT NULL COMMENT '상권_코드',
  `TRDAR_CD_NM` varchar(100) DEFAULT NULL COMMENT '상권_코드_명',
  `MNTH_AVRG_INCM_AMT` bigint unsigned DEFAULT NULL COMMENT '월_평균_소득_금액',
  `INCM_SE_CD` tinyint unsigned DEFAULT NULL COMMENT '소득_구간_코드',
  `TOT_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '지출_총금액',
  `FD_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '식료품_지출_총금액',
  `CLTHS_SHOES_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '의류_신발_지출_총금액',
  `LIVNG_SUPLY_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '생활용품_지출_총금액',
  `MED_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '의료비_지출_총금액',
  `TRNSPRT_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '교통_지출_총금액',
  `LEISURE_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '여가_지출_총금액',
  `CULTURE_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '문화_지출_총금액',
  `EDU_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '교육_지출_총금액',
  `ENTMNT_EXPNDTR_AMT` bigint unsigned DEFAULT NULL COMMENT '유흥_지출_총금액',
  PRIMARY KEY (`STDR_YYQU_CD`,`TRDAR_CD`)
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
