import type { RpgProfileData } from './types';
import { getCreature } from './data/creatures';
export type CreatureResearchResult={ok:true;observations:number;kills:number;researched:boolean;clue?:string}|{ok:false;reason:string};
function getRecord(profile:RpgProfileData,creatureId:string){profile.creatureResearch=profile.creatureResearch||{};return profile.creatureResearch[creatureId]||(profile.creatureResearch[creatureId]={observations:0,kills:0,researched:false});}
export function trackCreature(profile:RpgProfileData,creatureId:string,regionId:string,now=Date.now()):CreatureResearchResult{
 const creature=getCreature(creatureId);if(!creature||!creature.regionIds.includes(regionId))return {ok:false,reason:'creature_not_here'};
 const record=getRecord(profile,creatureId);if(record.lastSeenAt&&now-record.lastSeenAt<5*60_000)return {ok:false,reason:'tracking_cooldown'};
 record.observations++;record.lastSeenAt=now;
 const clue=creature.aggression>=80?'Çok saldırgan; izlerini takip ederken pusuya hazırlıklı ol.':creature.role==='mini_boss'||creature.role==='world_boss'?'Bölgenin baskın tehdidi; sıradan bir karşılaşma değil.':creature.speed>=12?'Çok çevik; savunma ve zamanlama önemli.':'Düzenli iz bırakıyor; çevredeki kaynakları ve ayak izlerini incele.';
 return {ok:true,observations:record.observations,kills:record.kills,researched:record.researched,clue};
}
export function researchCreature(profile:RpgProfileData,creatureId:string):CreatureResearchResult{
 const creature=getCreature(creatureId);if(!creature)return {ok:false,reason:'unknown_creature'};const record=getRecord(profile,creatureId);
 if(record.researched)return {ok:false,reason:'already_researched'};if(record.observations<3)return {ok:false,reason:'more_observations_required'};
 record.researched=true;return {ok:true,observations:record.observations,kills:record.kills,researched:true,clue:`Araştırma tamamlandı. Saldırı ${creature.attack}, savunma ${creature.defense}; bilinen yetenekler: ${creature.abilities.join(', ')||'yok'}.`};
}
export function recordCreatureVictory(profile:RpgProfileData,creatureId:string,now=Date.now()){
 const record=getRecord(profile,creatureId);record.kills++;record.observations++;record.lastHuntedAt=now;return record;
}
export function getCreatureResearch(profile:RpgProfileData,creatureId:string){return profile.creatureResearch?.[creatureId]||{observations:0,kills:0,researched:false};}
