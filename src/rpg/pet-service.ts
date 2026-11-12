import type { RpgPet, RpgProfileData } from './types';
import { RPG_PET_SPECIES, getPetSpecies } from './data/pets';
import { getRegion } from './data/world';
import { addItem, removeItem } from './inventory-service';
import { getRpgItem } from './data/items';

export type PetResult = { ok:true; pet?:RpgPet; rewards?:{itemId:string;quantity:number}[] } | { ok:false;reason:string };
export function adoptPet(profile:RpgProfileData,speciesId:string,name?:string,now=Date.now()):PetResult {
 const species=getPetSpecies(speciesId);if(!species)return {ok:false,reason:'unknown_species'};
 const pets=profile.pets||[];if(pets.length>=5)return {ok:false,reason:'pet_limit'};
 const pet:RpgPet={id:`pet-${now.toString(36)}-${Math.random().toString(36).slice(2,7)}`,speciesId,name:(name||species.name).trim().slice(0,24)||species.name,rarity:species.rarity,level:1,xp:0,bond:0,hunger:100,health:species.baseStats.health,morale:100,energy:100,skills:[],equipment:{},status:profile.activePetId?'resting':'active',bound:true,acquiredAt:now,visual:species.visual};
 profile.pets=pets.concat(pet);if(!profile.activePetId)profile.activePetId=pet.id;return {ok:true,pet};
}
export function setActivePet(profile:RpgProfileData,petId:string):PetResult {
 const pet=profile.pets?.find(item=>item.id===petId);if(!pet)return {ok:false,reason:'pet_not_found'};
 if(pet.status==='injured'||pet.status==='expedition')return {ok:false,reason:'pet_unavailable'};
 profile.activePetId=pet.id;pet.status='active';for(const other of profile.pets||[])if(other.id!==pet.id&&other.status==='active')other.status='resting';return {ok:true,pet};
}
export function feedPet(profile:RpgProfileData,petId:string,foodItemId:string):PetResult {
 const pet=profile.pets?.find(item=>item.id===petId);const species=pet&&getPetSpecies(pet.speciesId);if(!pet||!species)return {ok:false,reason:'pet_not_found'};
 if(pet.hunger>=100)return {ok:false,reason:'not_hungry'};
 const food=getRpgItem(foodItemId);if(!food||(food.category!=='pet_food'&&food.category!=='food'&&!species.preferredFood.includes(foodItemId)))return {ok:false,reason:'invalid_food'};
 const removed=removeItem(profile,foodItemId,1);if(!removed.ok)return {ok:false,reason:'food_missing'};
 const preferred=species.preferredFood.includes(foodItemId);pet.hunger=Math.min(100,pet.hunger+(preferred?45:25));pet.bond=Math.min(100,pet.bond+(preferred?5:2));pet.morale=Math.min(100,pet.morale+5);const maxHealth=species.baseStats.health+Math.max(0,pet.level-1)*10;pet.health=Math.min(maxHealth,pet.health+(preferred?25:12));pet.energy=Math.min(100,pet.energy+10);return {ok:true,pet};
}

export function startPetExpedition(profile:RpgProfileData,petId:string,regionId:string,now=Date.now()):PetResult {
 const pet=profile.pets?.find(item=>item.id===petId);const region=getRegion(regionId);if(!pet||!region)return {ok:false,reason:'pet_or_region_missing'};
 if(pet.status==='injured'||pet.status==='expedition'||pet.energy<20||pet.hunger<20)return {ok:false,reason:'pet_unavailable'};
 if(!profile.regions?.[regionId]?.discovered&&!region.initiallyUnlocked)return {ok:false,reason:'region_not_discovered'};
 const expeditions=profile.petExpeditions||[];if(expeditions.some(e=>e.petId===petId&&e.status==='active'))return {ok:false,reason:'expedition_active'};
 const duration=Math.max(30,region.travelMinutes*2)*60_000;
 profile.petExpeditions=expeditions.concat({id:`exp-${now.toString(36)}-${petId}`,petId,regionId,startedAt:now,completesAt:now+duration,status:'active'});pet.status='expedition';pet.energy-=20;pet.hunger=Math.max(0,pet.hunger-15);return {ok:true,pet};
}
export function claimPetExpedition(profile:RpgProfileData,expeditionId:string,now=Date.now(),random=Math.random):PetResult {
 const expedition=profile.petExpeditions?.find(item=>item.id===expeditionId);if(!expedition)return {ok:false,reason:'expedition_missing'};
 if(expedition.status!=='active')return {ok:false,reason:'already_claimed'};if(now<expedition.completesAt)return {ok:false,reason:'not_ready'};
 const pet=profile.pets?.find(item=>item.id===expedition.petId);const region=getRegion(expedition.regionId);if(!pet||!region)return {ok:false,reason:'pet_or_region_missing'};
 const rewards:{itemId:string;quantity:number}[]=[];const candidates=region.explorationRewards.filter(id=>!!getRpgItem(id));
 if(candidates.length){const count=1+(random()<0.25?1:0);for(let i=0;i<count;i++){const itemId=candidates[Math.floor(random()*candidates.length)];const quantity=1+Math.floor(random()*2);if(addItem(profile,itemId,quantity,'pet_expedition').ok)rewards.push({itemId,quantity});}}
 expedition.status='claimed';pet.status=pet.id===profile.activePetId?'active':'resting';pet.xp+=20+region.dangerLevel*5;while(pet.level<100&&pet.xp>=100+pet.level*60){pet.xp-=100+pet.level*60;pet.level++;pet.health+=10;}pet.bond=Math.min(100,pet.bond+3);pet.energy=Math.min(100,pet.energy+10);return {ok:true,pet,rewards};
}
export function listPetSpecies(){return RPG_PET_SPECIES;}
