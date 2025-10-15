DELIMITER //

CREATE PROCEDURE sp_getApProfilesByBrandsV2 (
    IN in_brand_ids VARCHAR(255),  -- e.g. '1,2,3'
    IN in_limit_raw VARCHAR(10),   -- e.g. '20' or ''
    IN in_offset_raw VARCHAR(10)   -- e.g. '0' or ''
)
BEGIN
    DECLARE in_limit INT;
    DECLARE in_offset INT;

    -- Convert pagination inputs to INT (NULL means "no pagination")
    SET in_limit  = IF(TRIM(in_limit_raw)  = '', NULL, CAST(in_limit_raw  AS UNSIGNED));
    SET in_offset = IF(TRIM(in_offset_raw) = '', NULL, CAST(in_offset_raw AS UNSIGNED));

    -- Build the CTE (must be the first token in the final SQL)
    SET @cte_query = CONCAT(
        'WITH BrandAggregations AS (',
        '  SELECT',
        '    apa.ap_profile_id,',
        '    JSON_ARRAYAGG(',
        '      JSON_OBJECT(',
        '        "id", b.id,',
        '        "brand_name", b.brand_name,',
        '        "status", IF(apa.is_active = 1, ''active'', ''inactive'')',
        '      )',
        '    ) AS assigned_brands',
        '  FROM `Ap_Profiles_Access` AS apa',
        '  INNER JOIN `Brands` AS b ON b.id = apa.brand_id',
        '  WHERE apa.is_active = 1',
        '    AND apa.brand_id IN (', in_brand_ids, ')',
        '  GROUP BY apa.ap_profile_id',
        ') '
    );

    -- Build the main SELECT which references the CTE alias
    SET @base_select = CONCAT(
        'SELECT',
        '  v_ap.id,',
        '  v_ap.fb_account_id,',
        '  v_ap.profile_name,',
        '  v_ap.remarks,',
        '  COALESCE(ba.assigned_brands, JSON_ARRAY()) AS assigned_brands,',
        '  v_ap.fb_account,',
        '  v_ap.created_at,',
        '  v_ap.created_by,',
        '  v_ap.ap_created_by,',
        '  v_ap.is_active,',
        '  v_ap.status ',
        'FROM `v_ApProfiles` AS v_ap ',
        'INNER JOIN BrandAggregations AS ba ',
        '  ON ba.ap_profile_id = v_ap.id '
        'ORDER BY v_ap.id '
    );

    -- Build pagination (OFFSET only valid with LIMIT)
    SET @pagination := '';
    IF in_limit IS NOT NULL AND in_limit > 0 THEN
        SET @pagination := CONCAT(' LIMIT ', in_limit);
        IF in_offset IS NOT NULL AND in_offset >= 0 THEN
            SET @pagination := CONCAT(@pagination, ' OFFSET ', in_offset);
        END IF;
    END IF;

    -- Final SQL: CTE + SELECT + pagination
    SET @sql := CONCAT(@cte_query, @base_select, @pagination);

    PREPARE data_stmt FROM @sql;
    EXECUTE data_stmt;
    DEALLOCATE PREPARE data_stmt;
END //

DELIMITER ;
