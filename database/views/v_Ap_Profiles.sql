SELECT 
  ap.id,
  ap.profile_name,
  ap.fb_owner_name,
  ap.username,
  ap.password,
  ap.app_2fa_code,
  ap.marketing_api_access_token,
  ap.remarks,
  ap.created_at,
  ap.is_active,
  ap.created_by AS created_by_id,
  COALESCE((
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', rc.id,
        'recovery_code', rc.recovery_code,
        'is_active', rc.is_active
      )
    )
    FROM `Recovery_Codes` AS rc
    WHERE rc.ap_profile_id = ap.id
  ), JSON_ARRAY()) AS recovery_codes,
  COALESCE((
    SELECT JSON_OBJECT(
      'full_name', u.full_name,
      'team_name', t.team_name
    )
    FROM `Users` AS u
    INNER JOIN `Teams` AS t ON u.team_id = t.id
    WHERE u.id = ap.created_by
  ), JSON_OBJECT()) AS created_by,
  COALESCE((
    SELECT JSON_OBJECT(
      'is_active', st.id,
      'status', st.status
    )
    FROM `Status_Types` AS st
    WHERE st.id = ap.is_active
    LIMIT 1
  ), JSON_OBJECT()) AS status
FROM `Ap_Profiles` AS ap;