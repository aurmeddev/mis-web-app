WITH DistinctRecruiters AS (
    SELECT DISTINCT(recruited_by) AS recruited_by FROM `Fb_Accounts` 
),
Totals AS (
    SELECT dr.recruited_by, COUNT(id) as totals 
	FROM `v_FbAccountsV2` AS v_fb
	INNER JOIN DistinctRecruiters AS dr 
    ON dr.recruited_by=v_fb.recruiter
    GROUP BY dr.recruited_by
)
SELECT u.id, u.full_name, u.display_name, total.totals FROM `Users` AS u 
INNER JOIN Totals AS total
ON total.recruited_by=u.id;