

SELECT * FROM
	(SELECT id AS idA, species AS speciesA, profileId AS profileIdA, geneticPointsHealth AS healthA, geneticPointsSpeed AS speedA, geneticPointsStrength AS strengthA, geneticPointsPower AS powerA FROM creatures WHERE breeding = TRUE ORDER BY id ASC) AS a
JOIN
	(SELECT id AS idB, species AS speciesB, profileId AS profileIdB, geneticPointsHealth AS healthB, geneticPointsSpeed AS speedB, geneticPointsStrength AS strengthB, geneticPointsPower AS powerB FROM creatures WHERE breeding = TRUE ORDER BY id DESC) AS b
ON
	a.profileIdA = b.profileIdB
WHERE
	a.idA <> b.idB
;
