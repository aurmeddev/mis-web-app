SELECT 
  ap.id AS ap_profile_id,
  ap.fb_account_id,
  ap.profile_name,
  ap.remarks,
  fb.fb_owner_name,
  fb.recruited_by AS recruited_by_id,
  COALESCE((
    SELECT JSON_OBJECT(
      'full_name', u.full_name,
      'team_name', t.team_name
    )
    FROM `Users` AS u
    INNER JOIN `Teams` AS t ON u.team_id = t.id
    WHERE u.id = fb.recruited_by
  ), JSON_OBJECT()) AS recruited_by,
  fb.contact_no,
  fb.email_address,
  fb.username,
  fb.password,
  fb.app_2fa_key,
  ap.marketing_api_access_token,
  fb.fb_owner_account_created,
  fb.no_of_friends,
  fb.fb_account_quality_status_id,
  COALESCE((
    SELECT JSON_OBJECT(
      'fb_account_quality_status_id', st.id,
      'status', st.status
    )
    FROM `Status_Types` AS st
    WHERE st.id = fb.fb_account_quality_status_id
  ), JSON_OBJECT()) AS fb_account_quality_status,
  fb.is_active AS fb_account_is_active,
  COALESCE((
    SELECT JSON_OBJECT(
      'fb_account_is_active', st.id,
      'status', st.status
    )
    FROM `Status_Types` AS st
    WHERE st.id = fb.is_active
  ), JSON_OBJECT()) AS fb_account_status,
  ap.created_at,
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
  ap.created_by AS created_by_id,
  COALESCE((
    SELECT JSON_OBJECT(
      'full_name', u.full_name,
      'team_name', t.team_name
    )
    FROM `Users` AS u
    INNER JOIN `Teams` AS t ON u.team_id = t.id
    WHERE u.id = ap.created_by
  ), JSON_OBJECT()) AS ap_created_by,
  ap.is_active AS ap_is_active,
  COALESCE((
    SELECT JSON_OBJECT(
      'ap_is_active', st.id,
      'status', st.status
    )
    FROM `Status_Types` AS st
    WHERE st.id = ap.is_active
  ), JSON_OBJECT()) AS status
FROM `Ap_Profiles` AS ap
INNER JOIN `Fb_Accounts` AS fb
ON ap.fb_account_id=fb.id;