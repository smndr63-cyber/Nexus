import type { RpgProfileData } from './types';
import type { RpgGroup } from './group-service';
import { getWorldBoss } from './data/bosses';
import { addItem, removeItem } from './inventory-service';
import { addCharacterXp } from './profile-service';
import { applyBattleInjury } from './injury-service';

export interface RpgWorldBossEncounter {
 id:string; bossId:string; groupId:string; leaderId:string; participants:string[];
 health:number; maxHealth:number; phaseId?:string; startedAt:number; expiresAt:number;
 status:'active'|'won'|'failed'; healthByUser:Record<string,number>;
 lastActionByUser:Record<string,number>; damageByUser:Record<string,number>;
}
export interface RpgWorldBossState { encounters:Record<string,RpgWorldBossEncounter>; lastSummonedAt:Record<string,number>; }
export type WorldBossResult = {ok:true;encounter:RpgWorldBossEncounter;damage?:number;playerDamage?:number;rewards?:{xp:number;items:{itemId:string;quantity:number}[]}}|{ok:false;reason:string};
export function createWorldBossState():RpgWorldBossState{return {encounters:{},lastSummonedAt:{}};}
export function startWorldBoss(state:RpgWorldBossState,bossId:string,group:RpgGroup,profiles:Record<string,RpgProfileData>,now=Date.now()):WorldBossResult {
 const boss=getWorldBoss(bossId);if(!boss)return {ok:false,reason:'unknown_boss'};
 if(group.leaderId!==group.members.find(m=>m.userId===group.leaderId)?.userId)return {ok:false,reason:'invalid_group'};
 if(group.members.length<boss.minPartySize||group.members.length>Math.min(4,boss.maxPartySize))return {ok:false,reason:'party_size'};
 if(state.lastSummonedAt[bossId]&&now-state.lastSummonedAt[bossId]<boss.summonCooldownHours*3_600_000)return {ok:false,reason:'boss_cooldown'};
 const leader=profiles[group.leaderId];if(!leader)return {ok:false,reason:'leader_profile_missing'};
 for(const member of group.members){const profile=profiles[member.userId];if(!profile)return {ok:false,reason:'member_profile_missing'};if((profile.characterLevel||1)<boss.minCharacterLevel)return {ok:false,reason:'level_required'};if(profile.currentRegionId!==boss.regionId)return {ok:false,reason:'wrong_region'};if(profile.activeBattle||profile.activeWorldBossId)return {ok:false,reason:'member_in_combat'};}
 const removed:{itemId:string;quantity:number}[]=[];
 for(const req of boss.summonRequirements){const result=removeItem(leader,req.itemId,req.quantity);if(!result.ok){for(const old of removed)addItem(leader,old.itemId,old.quantity,'boss_summon_rollback');return {ok:false,reason:`missing:${req.itemId}`};}removed.push(req);}
 const participants=group.members.map(m=>m.userId);const healthByUser:Record<string,number>={};
 for(const id of participants){const p=profiles[id];const vitality=p.stats?.vitality||5;healthByUser[id]=100+vitality*12+(p.characterLevel||1)*10;p.activeWorldBossId=bossId;}
 for(const id of participants){const p=profiles[id];p.bossProgress=p.bossProgress||{};const progress=p.bossProgress[bossId]||{bossId,attempts:0};progress.attempts++;progress.lastAttemptAt=now;p.bossProgress[bossId]=progress;}
 const encounter:RpgWorldBossEncounter={id:`${bossId}-${now.toString(36)}`,bossId,groupId:group.id,leaderId:group.leaderId,participants,health:boss.health,maxHealth:boss.health,startedAt:now,expiresAt:now+60*60_000,status:'active',healthByUser,lastActionByUser:{},damageByUser:{}};
 state.encounters[bossId]=encounter;state.lastSummonedAt[bossId]=now;return {ok:true,encounter};
}
export function attackWorldBoss(state:RpgWorldBossState,bossId:string,userId:string,profiles:Record<string,RpgProfileData>,random=Math.random,now=Date.now()):WorldBossResult {
 const encounter=state.encounters[bossId];const boss=getWorldBoss(bossId);if(!encounter||!boss)return {ok:false,reason:'encounter_missing'};
 if(encounter.status!=='active')return {ok:false,reason:'encounter_ended'};
 if(now>encounter.expiresAt){encounter.status='failed';for(const id of encounter.participants)if(profiles[id])delete profiles[id].activeWorldBossId;return {ok:false,reason:'encounter_expired'};}
 if(!encounter.participants.includes(userId))return {ok:false,reason:'not_participant'};
 const profile=profiles[userId];if(!profile||profile.activeWorldBossId!==bossId)return {ok:false,reason:'participant_inactive'};
 if(encounter.healthByUser[userId]<=0)return {ok:false,reason:'participant_defeated'};
 if(encounter.lastActionByUser[userId]&&now-encounter.lastActionByUser[userId]<3000)return {ok:false,reason:'turn_cooldown'};
 encounter.lastActionByUser[userId]=now;
 const stats=profile.stats||{strength:5,vitality:5,agility:5,intelligence:5,points:0};
 const weapon=profile.itemInstances?.find(item=>item.id===profile.equipment?.weapon);
 const attackDamage=Math.max(1,Math.floor((stats.strength*2+15+(weapon?.stats?.attack||0))*(0.85+random()*0.3)-boss.defense*0.35));
 const pet=profile.pets?.find(item=>item.id===profile.activePetId&&item.status==='active'&&item.health>0&&item.energy>0);
 const petAttack=pet?Object.values(pet.equipment||{}).reduce((sum,id)=>sum+(profile.itemInstances?.find(item=>item.id===id)?.stats?.attack||0),0):0;
 const petDamage=pet?Math.max(1,Math.floor((pet.level*2+5+petAttack)*(0.85+random()*0.3)-boss.defense*0.2)):0;
 const damage=attackDamage+petDamage;
 encounter.health=Math.max(0,encounter.health-damage);encounter.damageByUser[userId]=(encounter.damageByUser[userId]||0)+damage;
 if(pet){const petArmor=Object.values(pet.equipment||{}).reduce((sum,id)=>sum+(profile.itemInstances?.find(item=>item.id===id)?.stats?.defense||0),0);pet.energy=Math.max(0,pet.energy-1);pet.health=Math.max(0,pet.health-Math.max(0,Math.floor(boss.attack*0.03)-petArmor));}
 if(encounter.health<=0){encounter.status='won';const items:{itemId:string;quantity:number}[]=[];for(const id of encounter.participants){const p=profiles[id];if(!p)continue;delete p.activeWorldBossId;addCharacterXp(p,Math.floor(boss.health/Math.max(1,encounter.participants.length)*0.08));p.bossProgress=p.bossProgress||{};const progress=p.bossProgress[bossId]||{bossId,attempts:0};progress.defeatedAt=now;progress.bestDamage=Math.max(progress.bestDamage||0,encounter.damageByUser[id]||0);progress.unlocked=true;p.bossProgress[bossId]=progress;for(const reward of boss.rewards)if(random()*100<reward.chance){const quantity=reward.minQuantity+Math.floor(random()*(reward.maxQuantity-reward.minQuantity+1));if(addItem(p,reward.itemId,quantity,`world_boss:${bossId}`).ok&&id===userId)items.push({itemId:reward.itemId,quantity});}}return {ok:true,encounter,damage,rewards:{xp:Math.floor(boss.health/Math.max(1,encounter.participants.length)*0.08),items}};}
 const armor=Object.values(profile.equipment||{}).reduce((sum,id)=>sum+(profile.itemInstances?.find(item=>item.id===id)?.stats?.defense||0),0);
 const phase=[...boss.phases].sort((a,b)=>a.healthThreshold-b.healthThreshold).find(p=>encounter.health/encounter.maxHealth*100<=p.healthThreshold);encounter.phaseId=phase?.id;
 const phaseIndex=phase?boss.phases.findIndex(item=>item.id===phase.id):-1;const phaseMultiplier=phaseIndex<0?1:1+phaseIndex*0.2;const playerDamage=Math.max(1,Math.floor(boss.attack*phaseMultiplier*(0.75+random()*0.5)-stats.vitality*0.4-armor));encounter.healthByUser[userId]=Math.max(0,encounter.healthByUser[userId]-playerDamage);
 if(encounter.healthByUser[userId]<=0){applyBattleInjury(profile,now);delete profile.activeWorldBossId;}
 if(encounter.participants.every(id=>encounter.healthByUser[id]<=0)){encounter.status='failed';for(const id of encounter.participants)if(profiles[id])delete profiles[id].activeWorldBossId;}
 return {ok:true,encounter,damage,playerDamage};
}
