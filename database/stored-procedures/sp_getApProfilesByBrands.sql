DELIMITER //

CREATE PROCEDURE sp_getApProfilesByBrands (
    IN in_brand_ids VARCHAR(255),      -- e.g. '1,2,3'
    IN in_ap_profile_name VARCHAR(255),-- e.g. 'PH-AP OXY 00001' or ''
    IN in_limit_raw VARCHAR(10),       -- e.g. '20' or ''
    IN in_offset_raw VARCHAR(10)       -- e.g. '0' or ''
)
BEGIN
    DECLARE in_limit INT;
    DECLARE in_offset INT;

    -- Handle empty brand_ids by setting to '0' (no matches)
    IF in_brand_ids IS NULL OR TRIM(in_brand_ids) = '' THEN
    	SET @in_brand := '0';
    ELSE
        SET @in_brand := in_brand_ids;
    END IF;

    -- Convert pagination inputs to INT (NULL means "no pagination")
    SET in_limit  = IF(TRIM(in_limit_raw)  = '', NULL, CAST(in_limit_raw  AS UNSIGNED));
    SET in_offset = IF(TRIM(in_offset_raw) = '', NULL, CAST(in_offset_raw AS UNSIGNED));

    -- Safe token for math in the generated SQL (avoid CONCAT NULL collapse)
    SET @in_limit_token := IF(in_limit IS NULL, 'NULL', CAST(in_limit AS CHAR));

    -- Dynamic WHERE: only add if non-empty; QUOTE() safely wraps/escapes the string
    IF in_ap_profile_name IS NULL OR TRIM(in_ap_profile_name) = '' THEN
        SET @where_clause := '';
    ELSE
        SET @where_clause := CONCAT('WHERE v_ap.profile_name = ', QUOTE(in_ap_profile_name), ' ');
    END IF;

    SET @pagination := '';
    SET @total_count_pages_query := '';
    -- Pagination (OFFSET only valid with LIMIT)
    IF in_limit IS NOT NULL AND in_limit > 0 THEN
        SET @pagination := CONCAT(' LIMIT ', in_limit);
        IF in_offset IS NOT NULL AND in_offset >= 0 THEN
            SET @pagination := CONCAT(@pagination, ' OFFSET ', in_offset);
        END IF;

        SET @total_count_pages_query := CONCAT(
            ', tc.total_count, IF(', @in_limit_token,
            ' IS NOT NULL AND ', @in_limit_token, ' > 0, CEIL(tc.total_count / ',
            @in_limit_token, '), 1) AS total_pages '
        );
    END IF;

    -- Build the CTE (must be first token)
    SET @cte_query = CONCAT(
        'WITH ApProfilesByBrands AS (',
        '  SELECT',
        '    apa.ap_profile_id',
        '  FROM `Ap_Profiles_Access` AS apa',
        '  WHERE apa.brand_id IN (', @in_brand, ') AND apa.is_active = 1 ',
        '  GROUP BY apa.ap_profile_id',
        '), ',
        'AssignedBrandsToApProfiles AS (',
        '  SELECT',
        '    apa.ap_profile_id,',
        '    JSON_ARRAYAGG(',
        '      JSON_OBJECT(',
        '        "id", b.id,',
        '        "brand_name", b.brand_name,',
        '        "status", "active"',
        '      )',
        '    ) AS assigned_brands',
        '  FROM `Ap_Profiles_Access` AS apa',
        '  INNER JOIN `ApProfilesByBrands` AS apb ON apb.ap_profile_id = apa.ap_profile_id',
        '  INNER JOIN `Brands` AS b ON b.id = apa.brand_id AND apa.is_active = 1',
        '  GROUP BY apa.ap_profile_id',
        '), ',
        'TotalCount AS (',
        '  SELECT',
        '    COUNT(apb.ap_profile_id) AS total_count',
        '  FROM ApProfilesByBrands AS apb',
        ') '
    );

    -- Main SELECT (references the CTE)
    SET @main_query = CONCAT(
        'SELECT',
        '  v_ap.id,',
        '  v_ap.fb_account_id,',
        '  v_ap.profile_name,',
        '  v_ap.remarks,',
        '  COALESCE(abap.assigned_brands, JSON_ARRAY()) AS assigned_brands,',
        '  v_ap.fb_account,',
        '  v_ap.created_at,',
        '  v_ap.created_by,',
        '  v_ap.ap_created_by,',
        '  v_ap.is_active,',
        '  tc.total_count, ',
        '  v_ap.status ',
        @total_count_pages_query,
        'FROM `v_ApProfiles` AS v_ap ',
        'INNER JOIN AssignedBrandsToApProfiles AS abap ',
        '  ON abap.ap_profile_id = v_ap.id ',
        'CROSS JOIN TotalCount AS tc ',
        @where_clause,
        'ORDER BY v_ap.id '
    );

    -- Final SQL: CTE + SELECT + pagination
    SET @sql := CONCAT(@cte_query, @main_query, @pagination);

    PREPARE data_stmt FROM @sql;
    EXECUTE data_stmt;
    DEALLOCATE PREPARE data_stmt;
END //

DELIMITER ;
