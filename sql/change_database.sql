ALTER TABLE creatures ADD trainingTime TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE creatures ADD trainingType ENUM ('health', 'speed', 'strength', 'power');