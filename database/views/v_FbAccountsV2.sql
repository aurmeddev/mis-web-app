SELECT
  fb.id,
  fb.fb_owner_name,
  fb.contact_no,
  fb.email_address,
  fb.username,
  fb.`password`,
  fb.app_2fa_key,
  fb.marketing_api_access_token,
  fb.recovery_code,
  fb.fb_owner_account_created,
  CASE
    WHEN fb.fb_owner_account_created IS NULL
      THEN 'The FB account creation date is missing.'
    WHEN fb.fb_owner_account_created >= CURDATE() - INTERVAL 3 MONTH
      THEN 'NEW'
    WHEN fb.fb_owner_account_created >= CURDATE() - INTERVAL 12 MONTH
      THEN 'OLD'
    ELSE 'AGED'
  END AS age_of_fb,
  fb.no_of_friends,
  CONCAT_WS(' ',
    ap.profile_name,
    fb.fb_owner_name,
    fb.contact_no,
    fb.email_address,
    fb.username
  ) AS base_search_keyword,
  CASE
    WHEN COALESCE(ac.ap_count, 0) = 0 AND fb.fb_account_quality_type_id = 0 THEN '-'
    WHEN fb.fb_account_quality_type_id = 0 THEN 'rejected'
    WHEN fb.fb_account_quality_type_id = 1 THEN 'passed'
    ELSE 'unknown'
  END AS fb_account_quality,
  fb.remarks,
  CASE WHEN COALESCE(ac.ap_count, 0) = 0 THEN 'available' ELSE 'active' END AS `status`,
  fb.created_at,
  LOWER(ru.full_name) AS recruiter,
  CASE
    WHEN ru.id IS NULL THEN JSON_OBJECT()
    ELSE JSON_OBJECT('id', ru.id, 'full_name', ru.full_name, 'team_name', rt.team_name)
  END AS recruited_by,
  CASE
    WHEN ap.id IS NULL THEN JSON_OBJECT()
    ELSE JSON_OBJECT(
      'id', ap.id,
      'fb_account_id', ap.fb_account_id,
      'profile_name', ap.profile_name,
      'remarks', ap.remarks,
      'created_at', ap.created_at,
      'created_by', CASE
          WHEN cu.id IS NULL THEN JSON_OBJECT()
          ELSE JSON_OBJECT('full_name', cu.full_name, 'team_name', ct.team_name)
        END,
      'status', IF(ap.is_active = 1, 'active', 'inactive')
    )
  END AS ap_profile
FROM Fb_Accounts fb
LEFT JOIN (
  SELECT fb_account_id, COUNT(*) AS ap_count
  FROM Ap_Profiles
  GROUP BY fb_account_id
) ac ON ac.fb_account_id = fb.id
LEFT JOIN LATERAL (
  SELECT *
  FROM Ap_Profiles ap
  WHERE ap.fb_account_id = fb.id
  ORDER BY ap.created_at DESC
  LIMIT 1
) ap ON TRUE
LEFT JOIN Users ru ON ru.id = fb.recruited_by
LEFT JOIN Teams rt ON rt.id = ru.team_id
LEFT JOIN Users cu ON cu.id = ap.created_by
LEFT JOIN Teams ct ON ct.id = cu.team_id;

-- For top-1 latest profile lookups:
CREATE INDEX idx_ap_fb_created ON Ap_Profiles (fb_account_id, created_at);

-- If not already present:
CREATE INDEX idx_fb_recruited_by ON Fb_Accounts (recruited_by);
CREATE INDEX idx_users_team_id   ON Users (team_id);
-- Primary keys on Users(id), Teams(id), Fb_Accounts(id) should already exist.
