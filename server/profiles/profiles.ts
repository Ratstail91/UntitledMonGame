import { apiYourProfile } from './your_profile';
import { apiYourCreatures } from './your_creatures';
import { apiYourCreaturesInspect } from './your_creatures_inspect';
import { apiYourCreaturesTrain, runTrainJob } from './your_creatures_train';
import { apiYourCreaturesTrainCancel } from './your_creatures_train_cancel';
import { apiYourCreaturesMoves } from './your_creatures_moves';
import { apiYourCreaturesMovesBuy } from './your_creatures_moves_buy';
import { apiYourCreaturesMovesEquip } from './your_creatures_moves_equip';
import { apiYourCreaturesMovesUnequip } from './your_creatures_moves_unequip';
import { apiYourCreaturesBreed, runBreedingJob } from './your_creatures_breed';
import { apiYourCreaturesBreedCancel } from './your_creatures_breed_cancel';
import { apiYourCreaturesRelease } from './your_creatures_release';
import { apiYourEggs } from './your_eggs';
import { apiYourEggsSell } from './your_eggs_sell';
import { apiYourEggsIncubate, runEggHatchJob } from './your_eggs_incubate';
import { apiYourItems } from './your_items';
import { apiYourItemsSell } from './your_items_sell';

export default {
	apiYourProfile,
	apiYourCreatures,
	apiYourCreaturesInspect,
	apiYourCreaturesTrain,
	apiYourCreaturesTrainCancel,
	runTrainJob,
	apiYourCreaturesMoves,
	apiYourCreaturesMovesBuy,
	apiYourCreaturesMovesEquip,
	apiYourCreaturesMovesUnequip,
	apiYourCreaturesBreed,
	apiYourCreaturesBreedCancel,
	apiYourCreaturesRelease,
	runBreedingJob,
	apiYourEggs,
	apiYourEggsSell,
	apiYourEggsIncubate,
	runEggHatchJob,
	apiYourItems,
	apiYourItemsSell,
};
