SELECT 
  ap.id,
  ap.fb_account_id,
  ap.profile_name,
  ap.remarks,
  COALESCE((
    SELECT JSON_OBJECT(
      'id',fb.id,
      'fb_owner_name',fb.fb_owner_name,
      'contact_no',fb.contact_no,
      'email_address',fb.email_address,
      'username',fb.username,
      'password',fb.password,
      'app_2fa_key',fb.app_2fa_key,
      'marketing_api_access_token',fb.marketing_api_access_token,
      'fb_owner_account_created',fb.fb_owner_account_created,
      'no_of_friends',fb.no_of_friends,
      'fb_account_quality',
       (CASE
    		WHEN fb.fb_account_quality_type_id = 0 THEN 'rejected'
    		WHEN fb.fb_account_quality_type_id = 1 THEN 'passed'
    		ELSE 'unknown'
  		END),
      'remarks',fb.remarks,
      'status',(SELECT IF(is_active = 1, 'active', 'inactive')),
      'recovery_codes',COALESCE((
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
          'id', rc.id,
          'recovery_code', rc.recovery_code,
          'is_active', rc.is_active
        )
      )
        FROM `Recovery_Codes` AS rc
        WHERE rc.fb_account_id = fb.id
      ), JSON_ARRAY()),
      'recruited_by',COALESCE((
        SELECT JSON_OBJECT(
          'id', fb.recruited_by,
          'full_name', u.full_name,
          'team_name', t.team_name
        )
        FROM `Users` AS u
        INNER JOIN `Teams` AS t ON u.team_id = t.id
        WHERE u.id = fb.recruited_by
      ), JSON_OBJECT())
    )
    FROM `Fb_Accounts` AS fb
    WHERE ap.fb_account_id=fb.id
  ), JSON_OBJECT()) AS fb_account,
  ap.created_at,
  ap.created_by,
  COALESCE((
    SELECT JSON_OBJECT(
      'full_name', u.full_name,
      'team_name', t.team_name
    )
    FROM `Users` AS u
    INNER JOIN `Teams` AS t ON u.team_id = t.id
    WHERE u.id = ap.created_by
  ), JSON_OBJECT()) AS ap_created_by,
  ap.is_active,
  CASE
    WHEN is_active = 0 AND fb_account_id != 0 THEN 'inactive'
    WHEN is_active = 1 AND fb_account_id != 0 THEN 'active'
    WHEN is_active = 0 AND fb_account_id = 0 THEN 'available'
    ELSE 'unknown'
  END AS status
FROM `Ap_Profiles` AS ap;