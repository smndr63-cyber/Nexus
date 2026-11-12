import type { RpgBattleState, RpgProfileData } from './types';
import { getProfessionBoss, getProfessionBossTier } from './data/bosses';
import { addItem } from './inventory-service';
import { addCharacterXp, addProfessionXp } from './profile-service';
import { applyBattleInjury, getInjuryModifiers } from './injury-service';

export type ProfessionBossResult={ok:true;state:'started'|'player_turn'|'won'|'lost'|'fled';battle:RpgBattleState;damage:number;rewards?:{xp:number;professionXp:number;items:{itemId:string;quantity:number}[]}}|{ok:false;reason:string};
export function startProfessionBoss(profile:RpgProfileData,professionId:string,ownerId:string,now=Date.now()):ProfessionBossResult {
 if(profile.activeBattle||profile.activeWorldBossId)return {ok:false,reason:'already_in_combat'};
 const progress=profile.professions?.[professionId];const boss=getProfessionBoss(professionId);if(!progress||!boss)return {ok:false,reason:'unknown_profession'};
 const tier=getProfessionBossTier(professionId,progress.level,progress.mastery);if(!tier)return {ok:false,reason:'tier_locked'};
 const previous=profile.bossProgress?.[boss.id];if(previous?.lastAttemptAt&&now-previous.lastAttemptAt<boss.repeatProtectionMinutes*60_000)return {ok:false,reason:'cooldown'};
 const bossLevel=progress.level+tier.levelOffset;const maxHealth=Math.max(100,Math.floor((220+bossLevel*85)*tier.healthMultiplier));
 profile.bossProgress=profile.bossProgress||{};const bossProgress=profile.bossProgress[boss.id]||{bossId:boss.id,attempts:0};bossProgress.lastAttemptAt=now;bossProgress.attempts++;profile.bossProgress[boss.id]=bossProgress;
 const battle:RpgBattleState={id:`${boss.id}-${now.toString(36)}`,opponentId:`profession-boss:${boss.id}:${tier.id}`,opponentName:tier.name,opponentHealth:maxHealth,maxOpponentHealth:maxHealth,playerHealth:100+(profile.stats?.vitality||5)*10+(profile.characterLevel||1)*8,maxPlayerHealth:100+(profile.stats?.vitality||5)*10+(profile.characterLevel||1)*8,turn:1,startedAt:now,expiresAt:now+30*60_000,statuses:[],ownerId,visual:tier.visual,opponentAttack:Math.floor((10+bossLevel*4)*tier.attackMultiplier),opponentDefense:Math.floor((bossLevel*2)*tier.defenseMultiplier),professionId,bossTierId:tier.id};
 profile.activeBattle=battle;return {ok:true,state:'started',battle,damage:0};
}
export function professionBossTurn(profile:RpgProfileData,ownerId:string,action:'attack'|'defend'|'flee',random=Math.random,now=Date.now()):ProfessionBossResult {
 const battle=profile.activeBattle;if(!battle?.opponentId.startsWith('profession-boss:')||battle.ownerId!==ownerId)return {ok:false,reason:'boss_battle_not_found'};
 if(battle.expiresAt&&now>battle.expiresAt){delete profile.activeBattle;return {ok:false,reason:'battle_expired'};}
 if(action==='flee'){delete profile.activeBattle;return {ok:true,state:'fled',battle,damage:0};}
 if(battle.lastActionAt&&now-battle.lastActionAt<1500)return {ok:false,reason:'turn_cooldown'};battle.lastActionAt=now;
 const stats=profile.stats||{strength:5,vitality:5,agility:5,intelligence:5,points:0};const weapon=profile.itemInstances?.find(item=>item.id===profile.equipment?.weapon);const injury=getInjuryModifiers(profile,now);
 let damage=0;if(action==='attack'){const attack=(8+stats.strength*2+(weapon?.stats?.attack||0))*Math.max(0.2,1+(injury.attack||0));damage=Math.max(1,Math.floor(attack*(0.85+random()*0.3)-(battle.opponentDefense||0)));battle.opponentHealth=Math.max(0,battle.opponentHealth-damage);}
 const pet=profile.pets?.find(item=>item.id===profile.activePetId&&item.status==='active'&&item.health>0&&item.energy>0);if(pet&&battle.opponentHealth>0){const petAttack=Object.values(pet.equipment||{}).reduce((sum,id)=>sum+(profile.itemInstances?.find(item=>item.id===id)?.stats?.attack||0),0);const petDamage=Math.max(1,Math.floor((pet.level*2+5+petAttack)*(0.85+random()*0.3)-(battle.opponentDefense||0)*0.2));battle.opponentHealth=Math.max(0,battle.opponentHealth-petDamage);damage+=petDamage;pet.energy=Math.max(0,pet.energy-1);}
 if(battle.opponentHealth<=0){const bossId=battle.opponentId.split(':')[1];const boss=getProfessionBoss(battle.professionId||'');const tier=boss?.tiers.find(item=>item.id===battle.bossTierId);const items:{itemId:string;quantity:number}[]=[];for(const reward of tier?.rewards||[])if(random()*100<reward.chance){const quantity=reward.minQuantity+Math.floor(random()*(reward.maxQuantity-reward.minQuantity+1));if(addItem(profile,reward.itemId,quantity,`profession_boss:${bossId}`).ok)items.push({itemId:reward.itemId,quantity});}
 const xp=80+(profile.professions?.[battle.professionId||'']?.level||1)*30;const professionXp=60+(profile.professions?.[battle.professionId||'']?.level||1)*15;addCharacterXp(profile,xp);addProfessionXp(profile,battle.professionId||'',professionXp);const profession=profile.professions?.[battle.professionId||''];if(profession){profession.statistics=profession.statistics||{};profession.statistics.bossesDefeated=(profession.statistics.bossesDefeated||0)+1;}
 profile.bossProgress=profile.bossProgress||{};const previous=profile.bossProgress[bossId]||{bossId,attempts:0};previous.lastAttemptAt=now;previous.defeatedAt=now;previous.bestDamage=Math.max(previous.bestDamage||0,damage);profile.bossProgress[bossId]=previous;delete profile.activeBattle;return {ok:true,state:'won',battle,damage,rewards:{xp,professionXp,items}};}
 const armor=Object.values(profile.equipment||{}).reduce((sum,id)=>sum+(profile.itemInstances?.find(item=>item.id===id)?.stats?.defense||0),0);const playerDamage=Math.max(1,Math.floor((battle.opponentAttack||10)*(0.8+random()*0.4)*(action==='defend'?0.45:1)-stats.vitality*0.35-armor));battle.playerHealth=Math.max(0,battle.playerHealth-playerDamage);if(pet){const petArmor=Object.values(pet.equipment||{}).reduce((sum,id)=>sum+(profile.itemInstances?.find(item=>item.id===id)?.stats?.defense||0),0);pet.health=Math.max(0,pet.health-Math.max(0,Math.floor(playerDamage*0.15)-petArmor));}battle.turn++;
 if(battle.playerHealth<=0){const bossId=battle.opponentId.split(':')[1];profile.bossProgress=profile.bossProgress||{};const previous=profile.bossProgress[bossId]||{bossId,attempts:0};previous.lastAttemptAt=now;profile.bossProgress[bossId]=previous;applyBattleInjury(profile,now);delete profile.activeBattle;return {ok:true,state:'lost',battle,damage};}
 return {ok:true,state:'player_turn',battle,damage};
}
