SELECT 
  fb.id,
  fb.fb_owner_name,
  fb.contact_no,
  fb.email_address,
  fb.username,
  fb.password,
  fb.app_2fa_key,
  fb.marketing_api_access_token,
  fb.recovery_code,
  fb.fb_owner_account_created,
  (CASE
	  WHEN TIMESTAMPDIFF(MONTH, fb.fb_owner_account_created, CURDATE()) <= 3 THEN 'NEW'
	  WHEN TIMESTAMPDIFF(MONTH, fb.fb_owner_account_created, CURDATE()) >= 12  THEN 'AGED'
    ELSE 'OLD'
  END) AS age_of_fb,
  fb.no_of_friends,
  (CONCAT(
    COALESCE(fb.fb_owner_name,''),' ',
	  COALESCE(fb.contact_no,''), ' ',
    COALESCE(fb.email_address,''), ' ',
	  COALESCE(fb.username,''))) AS base_search_keyword,
  (CASE
    WHEN (SELECT COUNT(*) 
          FROM `Ap_Profiles` ap
          WHERE ap.fb_account_id = fb.id) = 0 AND fb.fb_account_quality_type_id = 0 THEN '-'
    WHEN fb.fb_account_quality_type_id = 0 THEN 'rejected'
    WHEN fb.fb_account_quality_type_id = 1 THEN 'passed'
    ELSE 'unknown'
  END) AS fb_account_quality,
  fb.remarks,
  (CASE
    WHEN (SELECT COUNT(*) 
          FROM `Ap_Profiles` ap
          WHERE ap.fb_account_id = fb.id) = 0 THEN 'available'
    ELSE 'active'
  END) AS status, 
  fb.created_at,
  (SELECT u.full_name FROM `Users` AS u 
   WHERE u.id = fb.recruited_by) AS recruiter,
   COALESCE((
        SELECT JSON_OBJECT(
          'id', fb.recruited_by,
          'full_name', u.full_name,
          'team_name', t.team_name
        )
        FROM `Users` AS u
        INNER JOIN `Teams` AS t ON u.team_id = t.id
        WHERE u.id = fb.recruited_by
    ), JSON_OBJECT()) AS recruited_by,
  COALESCE((
    SELECT JSON_OBJECT(
      'id',ap.id,
      'fb_account_id',ap.fb_account_id,
      'profile_name',ap.profile_name,
      'remarks',ap.remarks,
      'created_at',ap.created_at,
      'created_by',COALESCE((
    		SELECT JSON_OBJECT(
      			'full_name', u.full_name,
      			'team_name', t.team_name
    		)
    		FROM `Users` AS u
    		INNER JOIN `Teams` AS t ON u.team_id = t.id
    		WHERE u.id = ap.created_by
  		), JSON_OBJECT()),
      'status',(SELECT IF(ap.is_active = 1, 'active', 'inactive'))
    )
    FROM `Ap_Profiles` AS ap
    WHERE fb.id=ap.fb_account_id
  ), JSON_OBJECT()) AS ap_profile
FROM `Fb_Accounts` AS fb;