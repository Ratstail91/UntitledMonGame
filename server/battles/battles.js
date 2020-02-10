const { apiYourBattleBoxes } = require('./your_battle_boxes.js');
const { apiYourBattleBoxesInsert } = require('./your_battle_boxes_insert.js');
const { apiYourBattleBoxesRemove } = require('./your_battle_boxes_remove.js');
const { apiYourBattleBoxesShift } = require('./your_battle_boxes_shift.js');

module.exports = {
    apiYourBattleBoxes,
    apiYourBattleBoxesInsert,
    apiYourBattleBoxesRemove,
    apiYourBattleBoxesShift,
};
