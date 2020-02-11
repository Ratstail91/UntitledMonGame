const { apiYourBattleBoxes } = require('./your_battle_boxes.js');
const { apiYourBattleBoxesInsert } = require('./your_battle_boxes_insert.js');
const { apiYourBattleBoxesRemove } = require('./your_battle_boxes_remove.js');
const { apiYourBattleBoxesShift } = require('./your_battle_boxes_shift.js');
const { apiYourBattleBoxesLock } = require('./your_battle_boxes_lock.js');

module.exports = {
    apiYourBattleBoxes,
    apiYourBattleBoxesInsert,
    apiYourBattleBoxesRemove,
    apiYourBattleBoxesShift,
    apiYourBattleBoxesLock,
};
