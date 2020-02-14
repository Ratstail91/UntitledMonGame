const { apiYourBattleBoxes } = require('./your_battle_boxes.js');
const { apiYourBattleBoxesInsert } = require('./your_battle_boxes_insert.js');
const { apiYourBattleBoxesRemove } = require('./your_battle_boxes_remove.js');
const { apiYourBattleBoxesShift } = require('./your_battle_boxes_shift.js');
const { apiYourBattleBoxesLockToggle } = require('./your_battle_boxes_lock_toggle.js');
const { apiYourBattles } = require('./your_battles.js');
const { apiYourBattlesInvite } = require('./your_battles_invite.js');
const { apiYourBattlesJoin } = require('./your_battles_join.js');
const { apiYourBattlesResign } = require('./your_battles_resign.js');

module.exports = {
    apiYourBattleBoxes,
    apiYourBattleBoxesInsert,
    apiYourBattleBoxesRemove,
    apiYourBattleBoxesShift,
    apiYourBattleBoxesLockToggle,
    apiYourBattles,
    apiYourBattlesInvite,
    apiYourBattlesJoin,
    apiYourBattlesResign,
};
