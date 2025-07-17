ALTER TABLE `PaymentRequestDetail`
ADD COLUMN `bill_link` VARCHAR(255),
ADD COLUMN `report_link` VARCHAR(255),
ADD COLUMN `start_date` DATE,
ADD COLUMN `end_date` DATE;

ALTER TABLE PaymentRequestDetail
MODIFY COLUMN concept ENUM('Benefits', 'Compensation', 'Closure', 'External') NOT NULL;