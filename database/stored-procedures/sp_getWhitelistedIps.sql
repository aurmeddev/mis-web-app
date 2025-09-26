DELIMITER //

CREATE PROCEDURE sp_getWhitelistedIps (
  IN in_limit_raw VARCHAR(10),
  IN in_offset_raw VARCHAR(10)
)
BEGIN
  DECLARE db_table_name TEXT;
  DECLARE total_count INT DEFAULT 0;
  DECLARE total_pages INT DEFAULT 0;

  DECLARE in_limit INT;
  DECLARE in_offset INT;

  -- Convert pagination inputs
  SET in_limit = IF(TRIM(in_limit_raw) = '', NULL, CAST(in_limit_raw AS UNSIGNED));
  SET in_offset = IF(TRIM(in_offset_raw) = '', NULL, CAST(in_offset_raw AS UNSIGNED));

  SET db_table_name = ' FROM User_IP_Whitelist';

  -- Count whitelisted IPs and set the result to total_count
  SELECT COUNT(id) INTO total_count FROM `User_IP_Whitelist`;

  -- Use total_count for pagination
  SET total_pages = IF(in_limit IS NOT NULL AND in_limit > 0, CEIL(total_count / in_limit), 1);

  -- Data query
  SET @data_sql = CONCAT(
    'SELECT *, ', total_count, ' AS total_count,
      ', total_pages, ' AS total_pages',
    db_table_name
  );

  -- Apply pagination if needed
  IF in_limit IS NOT NULL AND in_limit > 0 THEN
    SET @data_sql = CONCAT(@data_sql, ' LIMIT ', in_limit);
    IF in_offset IS NOT NULL AND in_offset > 0 THEN
      SET @data_sql = CONCAT(@data_sql, ' OFFSET ', in_offset);
    END IF;
  END IF;

  -- Execute
  PREPARE data_stmt FROM @data_sql;
  EXECUTE data_stmt;
  DEALLOCATE PREPARE data_stmt;
END //

DELIMITER ;
