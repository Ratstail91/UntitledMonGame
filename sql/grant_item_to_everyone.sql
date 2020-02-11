#grant everyone a potion

DROP PROCEDURE IF EXISTS fill;

DELIMITER ;;

CREATE PROCEDURE fill()
BEGIN

	SET @idColumn = 0;

	SELECT MIN(id) FROM profiles INTO @idColumn;

	WHILE (@idColumn IS NOT NULL) DO
		INSERT INTO items (profileId, idx) VALUES (@idColumn, 'potion');
	    SELECT MIN(id) FROM profiles WHERE id > @idColumn INTO @idColumn;
	END WHILE;

END

;;

CALL fill();