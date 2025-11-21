WITH DistinctRecruiters AS (
    SELECT DISTINCT(recruited_by) AS recruited_by, COUNT(id) as totals 
	FROM `Fb_Accounts` AS fb
    GROUP BY fb.recruited_by
)
SELECT u.id, u.full_name, u.display_name, dr.totals FROM `Users` AS u 
INNER JOIN DistinctRecruiters AS dr
ON dr.recruited_by=u.id;