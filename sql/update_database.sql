# analytics system
CREATE TABLE IF NOT EXISTS dailySnapshots (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	totalAccounts INTEGER NOT NULL DEFAULT 0,
	activeAccounts INTEGER NOT NULL DEFAULT 0,
	totalProfiles INTEGER NOT NULL DEFAULT 0,
	activeProfiles INTEGER NOT NULL DEFAULT 0
	#TODO: more data to be captured on a daily basis
);

CREATE TABLE IF NOT EXISTS dailySnapshotsEvents (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	eventName VARCHAR(100),
	quantity INTEGER NOT NULL DEFAULT 1
);

# account system
CREATE TABLE IF NOT EXISTS signups (
	email VARCHAR(320) UNIQUE,
	username VARCHAR(100) UNIQUE,
	hash VARCHAR(100),
	promotions BOOLEAN DEFAULT FALSE,
	code VARCHAR(100),
	referral VARCHAR(100),

	verify INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accounts (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	accountType ENUM ('administrator', 'moderator', 'alpha', 'beta', 'normal') DEFAULT 'normal',

	email VARCHAR(320) UNIQUE,
	username VARCHAR(100) UNIQUE,
	hash VARCHAR(100),
	promotions BOOLEAN DEFAULT FALSE,

	coins INTEGER UNSIGNED NOT NULL DEFAULT 500,

	#TODO: banned from micro-transactions field

	lastActivityTime TIMESTAMP DEFAULT '2019-01-01 00:00:00',

	deletionTime TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	accountId INTEGER UNSIGNED,
	token INTEGER DEFAULT 0,

	CONSTRAINT FOREIGN KEY fk_sessions_accountId(accountId) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS passwordRecover (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	accountId INTEGER UNSIGNED UNIQUE,
	token INTEGER DEFAULT 0,

	CONSTRAINT FOREIGN KEY fk_passwordRecover_accountId(accountId) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bannedEmails (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	email VARCHAR(320) UNIQUE,
	reason VARCHAR(1000)
	#TODO: banned for a specific timespan
);

#signup reward system
CREATE TABLE IF NOT EXISTS rewardCodes (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	code INTEGER UNSIGNED NOT NULL UNIQUE,
	used BOOLEAN DEFAULT FALSE,

	flag VARCHAR(100) NOT NULL
);

#profile system
CREATE TABLE IF NOT EXISTS profiles (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	accountId INTEGER UNSIGNED UNIQUE,

	CONSTRAINT FOREIGN KEY fk_profiles_accountId(accountId) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE
);

#creature data
CREATE TABLE IF NOT EXISTS creatures (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	profileId INTEGER UNSIGNED,

	species VARCHAR(100) NOT NULL,

	nickname VARCHAR(100) NULL DEFAULT NULL,

	#should never exceed 16
	geneticPointsHealth INTEGER UNSIGNED NOT NULL DEFAULT 0,
	geneticPointsSpeed INTEGER UNSIGNED NOT NULL DEFAULT 0,
	geneticPointsStrength INTEGER UNSIGNED NOT NULL DEFAULT 0,
	geneticPointsPower INTEGER UNSIGNED NOT NULL DEFAULT 0,

	#should never total more than 16
	statPointsHealth INTEGER UNSIGNED NOT NULL DEFAULT 0,
	statPointsSpeed INTEGER UNSIGNED NOT NULL DEFAULT 0,
	statPointsStrength INTEGER UNSIGNED NOT NULL DEFAULT 0,
	statPointsPower INTEGER UNSIGNED NOT NULL DEFAULT 0,

	#breeding and other mechanics
	breeding BOOLEAN DEFAULT FALSE,

	trainingTime TIMESTAMP NULL DEFAULT NULL,
	trainingType ENUM ('health', 'speed', 'strength', 'power'),

	CONSTRAINT FOREIGN KEY fk_creatures_profiles(profileId) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS creatureMovesOwned (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	creatureId INTEGER UNSIGNED,

	idx VARCHAR(100) NOT NULL,
	equipped BOOLEAN NOT NULL DEFAULT FALSE,

	CONSTRAINT FOREIGN KEY fk_creatureMovesOwned_creatures(creatureId) REFERENCES creatures(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS creatureEggs (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	profileId INTEGER UNSIGNED,

	species VARCHAR(100) NOT NULL,

	geneticPointsHealth INTEGER UNSIGNED NOT NULL DEFAULT 0,
	geneticPointsSpeed INTEGER UNSIGNED NOT NULL DEFAULT 0,
	geneticPointsStrength INTEGER UNSIGNED NOT NULL DEFAULT 0,
	geneticPointsPower INTEGER UNSIGNED NOT NULL DEFAULT 0,

	incubationTime TIMESTAMP NULL DEFAULT NULL,

	CONSTRAINT FOREIGN KEY fk_creatureEggs_profiles(profileId) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE
);

#items data
CREATE TABLE IF NOT EXISTS items (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	profileId INTEGER UNSIGNED,

	idx VARCHAR(100) NOT NULL,

	CONSTRAINT FOREIGN KEY fk_items_profiles(profileId) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE
);

#shop system
CREATE TABLE IF NOT EXISTS shopEggs (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	shopSlot INTEGER UNSIGNED UNIQUE,

	species VARCHAR(100) NOT NULL, #TODO: allow some eggs to be random?

	geneticPointsHealth INTEGER UNSIGNED NULL DEFAULT NULL,
	geneticPointsSpeed INTEGER UNSIGNED NULL DEFAULT NULL,
	geneticPointsStrength INTEGER UNSIGNED NULL DEFAULT NULL,
	geneticPointsPower INTEGER UNSIGNED NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS shopItems (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	shopSlot INTEGER UNSIGNED UNIQUE, #TODO: remove shopSlot

	idx VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS shopPremiums (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	shopSlot INTEGER UNSIGNED UNIQUE, #TODO: remove shopSlot

	idx VARCHAR(100) NOT NULL
);

#track transactions
CREATE TABLE IF NOT EXISTS premiumTransactions (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	accountId INTEGER UNSIGNED,

	idx VARCHAR(100) NOT NULL,

	state VARCHAR(100) NOT NULL
);

#battle system
CREATE TABLE IF NOT EXISTS battles (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	inviteCode VARCHAR(100) UNIQUE,
	status ENUM ("open", "inProgress", "completed")
);

CREATE TABLE IF NOT EXISTS battleLogs (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	battleId INTEGER UNSIGNED,
	message VARCHAR(255),

	CONSTRAINT FOREIGN KEY fk_battleLogs_battles(battleId) REFERENCES battles(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pendingBattleActions (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	actionType ENUM ('move', 'item') DEFAULT 'move',

	battleId INTEGER UNSIGNED NULL DEFAULT NULL,

	attackerId INTEGER UNSIGNED NULL DEFAULT NULL,
	moveActionId INTEGER UNSIGNED NULL DEFAULT NULL,
	targetId INTEGER UNSIGNED NULL DEFAULT NULL,

	itemIdx VARCHAR(100) NULL DEFAULT NULL,

	CONSTRAINT FOREIGN KEY fk_pendingBattleActions_battles(battleId) REFERENCES battles(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY fk_pendingBattleActions_attacker(attackerId) REFERENCES creatures(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY fk_pendingBattleActions_moveAction(moveActionId) REFERENCES creatureMovesOwned(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY fk_pendingBattleActions_target(targetId) REFERENCES creatures(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exhaustedBattleItems (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	profileId INTEGER UNSIGNED NOT NULL,
	battleId INTEGER UNSIGNED NOT NULL,

	idx VARCHAR(100) NOT NULL,

	CONSTRAINT FOREIGN KEY fk_exaustedBattleItems_profiles(profileId) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY fk_exaustedBattleItems_battles(battleId) REFERENCES battles(id) ON UPDATE CASCADE ON DELETE CASCADE
);

#battle box system
CREATE TABLE IF NOT EXISTS battleBoxes (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	profileId INTEGER UNSIGNED,
	battleId INTEGER UNSIGNED NULL DEFAULT NULL,

	locked BOOLEAN DEFAULT FALSE,

	CONSTRAINT FOREIGN KEY fk_battleBoxes_profiles(profileId) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY fk_battleBoxes_battles(battleId) REFERENCES battles(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS battleBoxSlots (
	id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY UNIQUE,
	td TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

	battleBoxId INTEGER UNSIGNED,
	creatureId INTEGER UNSIGNED,

	boxSlot INTEGER NOT NULL,

	#battle stats
	maximumHealth INTEGER,
	currentHealth INTEGER,
	currentSpeedMod INTEGER, #mods are from -6 to +6
	currentStrengthMod INTEGER,
	currentPowerMod INTEGER,
	currentPhysicalAttackMod INTEGER,
	currentPhysicalDefenseMod INTEGER,
	currentMagicalAttackMod INTEGER,
	currentMagicalDefenseMod INTEGER,

	activePosition ENUM ('none', 'top', 'bottom') DEFAULT 'none',

	CONSTRAINT FOREIGN KEY fk_battleBoxSlots_battleBoxes(battleBoxId) REFERENCES battleBoxes(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY fk_battleBoxSlots_creatures(creatureId) REFERENCES creatures(id) ON UPDATE CASCADE ON DELETE CASCADE
);
