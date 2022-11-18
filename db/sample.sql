
CREATE TABLE `email` (
     `id` INT NOT NULL AUTO_INCREMENT,
     `email` VARCHAR(45) NULL,
     `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     `last_verified_at` timestamp NULL DEFAULT NULL,
     PRIMARY KEY (`id`)
);

CREATE TABLE `email_verification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `result` varchar(30) NOT NULL,
  `is_private` tinyint(1) DEFAULT NULL,
  `is_catchall` tinyint(1) DEFAULT NULL,
  `is_disposable` tinyint(1) DEFAULT NULL,
  `is_freemail` tinyint(1) DEFAULT NULL,
  `is_rolebased`  tinyint(1) DEFAULT NULL,
  `is_dns_valid`  tinyint(1) DEFAULT NULL,
  `is_dns_valid_mx`  tinyint(1) DEFAULT NULL,
  `is_smtp_valid` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
