-- Dangerous. Never run in production
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS dailySnapshots;
DROP TABLE IF EXISTS dailySnapshotsEvents;
DROP TABLE IF EXISTS signups;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS passwordRecover;
DROP TABLE IF EXISTS bannedEmails;
DROP TABLE IF EXISTS rewardCodes;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS creatures;
DROP TABLE IF EXISTS creatureMovesOwned;
DROP TABLE IF EXISTS creatureMovesEquipped;
DROP TABLE IF EXISTS creatureEggs;
DROP TABLE IF EXISTS shopEggs;