const { apiYourBattleBoxes } = require('./your_battle_boxes.js');
const { apiYourBattleBoxesInsert } = require('./your_battle_boxes_insert.js');
const { apiYourBattleBoxesRemove } = require('./your_battle_boxes_remove.js');
const { apiYourBattleBoxesShift } = require('./your_battle_boxes_shift.js');
const { apiYourBattleBoxesLockToggle } = require('./your_battle_boxes_lock_toggle.js');

module.exports = {
    apiYourBattleBoxes,
    apiYourBattleBoxesInsert,
    apiYourBattleBoxesRemove,
    apiYourBattleBoxesShift,
    apiYourBattleBoxesLockToggle,
};
