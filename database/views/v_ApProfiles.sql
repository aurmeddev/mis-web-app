SELECT 
  ap.id,
  ap.fb_account_id,
  ap.profile_name,
  ap.marketing_api_access_token,
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
      'fb_owner_account_created',fb.fb_owner_account_created,
      'no_of_friends',fb.no_of_friends,
      'fb_account_quality',
       COALESCE((
        SELECT JSON_OBJECT(
          'id', qt.id,
          'status', qt.fb_account_quality
        )
        FROM `Fb_Account_Quality_Types` AS qt
        WHERE qt.id = fb.fb_account_quality_type_id
      ), JSON_OBJECT()),
      'remarks',fb.remarks,
      'is_active',COALESCE((
        SELECT JSON_OBJECT(
          'id', st.id,
          'status', st.status
        )
        FROM `Status_Types` AS st
        WHERE st.id = fb.is_active
      ), JSON_OBJECT()),
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
  COALESCE((
    SELECT JSON_OBJECT(
      'id', st.id,
      'status', st.status
    )
    FROM `Status_Types` AS st
    WHERE st.id = ap.is_active
  ), JSON_OBJECT()) AS is_active_status
FROM `Ap_Profiles` AS ap