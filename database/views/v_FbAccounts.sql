SELECT 
  fb.id,
  fb.fb_owner_name,
  fb.contact_no,
  fb.email_address,
  fb.username,
  fb.password,
  fb.app_2fa_key,
  fb.marketing_api_access_token,
  fb.fb_owner_account_created,
  fb.no_of_friends,
  (CASE
    	WHEN fb.fb_account_quality_type_id = 0 THEN 'rejected'
    	WHEN fb.fb_account_quality_type_id = 1 THEN 'passed'
    	ELSE 'unknown'
  END) AS fb_account_quality,
  fb.remarks,
  IF(is_active = 1, 'active', 'inactive') AS status, 
  fb.created_at,
  COALESCE((
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
          'id', rc.id,
          'recovery_code', rc.recovery_code,
          'is_active', rc.is_active
        )
      )
        FROM `Recovery_Codes` AS rc
        WHERE rc.fb_account_id = fb.id
   ), JSON_ARRAY()) AS recovery_codes,
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
      'status',(SELECT IF(is_active = 1, 'active', 'inactive'))
    )
    FROM `Ap_Profiles` AS ap
    WHERE fb.id=ap.fb_account_id
  ), JSON_OBJECT()) AS ap_profile
FROM `Fb_Accounts` AS fb;