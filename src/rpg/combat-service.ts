import type { RpgBattleState, RpgProfileData } from './types';
import { getCreature } from './data/creatures';
import { addCharacterXp } from './profile-service';
import { addItem } from './inventory-service';
import { applyBattleInjury, getInjuryModifiers } from './injury-service';
import { getCreatureResearch, recordCreatureVictory } from './creature-research-service';

export type CombatResult = { ok: true; state: 'started' | 'player_turn' | 'won' | 'lost'; battle: RpgBattleState; damage: number; enemyAbility?:string; rewards?: { xp: number; coins: number; drops: { itemId: string; quantity: number }[] } } | { ok: false; reason: string };
export function startCombat(profile: RpgProfileData, creatureId: string, ownerId: string, now = Date.now()): CombatResult {
  if (profile.activeBattle) return { ok: false, reason: 'battle_active' };
  const creature = getCreature(creatureId);
  if (!creature) return { ok: false, reason: 'unknown_creature' };
  if ((profile.characterLevel || 1) + 5 < creature.level) return { ok: false, reason: 'creature_too_strong' };
  const stats = profile.stats || { strength: 5, vitality: 5, agility: 5, intelligence: 5, points: 0 };
  const health = 100 + stats.vitality * 10 + ((profile.characterLevel || 1) - 1) * 8;
  const battle: RpgBattleState = {
    id: `${now.toString(36)}-${ownerId}`, opponentId: creature.id, opponentName: creature.name,
    opponentHealth: creature.health, maxOpponentHealth: creature.health,
    playerHealth: health, maxPlayerHealth: health, turn: 1, startedAt: now,
    expiresAt: now + 30 * 60_000, statuses: [], ownerId, visual: creature.visual
  };
  profile.activeBattle = battle;
  return { ok: true, state: 'started', battle, damage: 0 };
}
export function combatTurn(profile: RpgProfileData, ownerId: string, action: 'attack' | 'defend' | 'flee', random = Math.random, now = Date.now()): CombatResult {
  const battle = profile.activeBattle;
  if (!battle || battle.ownerId !== ownerId) return { ok: false, reason: 'battle_not_found' };
  if (battle.expiresAt && now > battle.expiresAt) { delete profile.activeBattle; return { ok: false, reason: 'battle_expired' }; }
  if (battle.opponentId.startsWith('profession-boss:')) return { ok:false, reason:'profession_boss_requires_command' };
  const creature = getCreature(battle.opponentId);
  if (!creature) { delete profile.activeBattle; return { ok: false, reason: 'opponent_missing' }; }
  if (action === 'flee') { delete profile.activeBattle; return { ok: true, state: 'player_turn', battle, damage: 0 }; }
  if (battle.lastActionAt && now - battle.lastActionAt < 1500) return { ok:false, reason:'turn_cooldown' };
  battle.lastActionAt = now;
  for (const status of battle.statuses) { if (status.id === 'poisoned') battle.playerHealth = Math.max(0, battle.playerHealth - status.potency); status.turnsRemaining--; }
  const weakened = battle.statuses.some(status => status.id === 'weakened' && status.turnsRemaining > 0);
  battle.statuses = battle.statuses.filter(status => status.turnsRemaining > 0);
  if (battle.playerHealth <= 0) { delete profile.activeBattle; applyBattleInjury(profile, now); return { ok:true, state:'lost', battle, damage:0 }; }
  const stats = profile.stats || { strength: 5, vitality: 5, agility: 5, intelligence: 5, points: 0 };
  let damage = 0;
  if (action === 'attack') {
    const weaponId = profile.equipment?.weapon;
    const weapon = profile.itemInstances?.find(item => item.id === weaponId);
    const injury = getInjuryModifiers(profile, now);
    const researchBonus=getCreatureResearch(profile,creature.id).researched?0.1:0;
    const attack = (8 + stats.strength * 2 + (weapon?.stats?.attack || 0)) * Math.max(0.2, 1 + (injury.attack || 0)) * (weakened?0.85:1) * (1+researchBonus);
    damage = Math.max(1, Math.floor(attack * (0.85 + random() * 0.3) - creature.defense - (battle.opponentDefenseBonus||0)));battle.opponentDefenseBonus=0;
    battle.opponentHealth = Math.max(0, battle.opponentHealth - damage);
  }
  if (battle.opponentHealth <= 0) {
    const research=recordCreatureVictory(profile,creature.id,now);
    const coins = creature.coinsMin + Math.floor(random() * (creature.coinsMax - creature.coinsMin + 1));
    const drops: { itemId: string; quantity: number }[] = [];
    for (const drop of creature.drops) if (random() * 100 < Math.min(100,drop.chance+(research.researched?10:0))) {
      const quantity = drop.minQuantity + Math.floor(random() * (drop.maxQuantity - drop.minQuantity + 1));
      if (addItem(profile, drop.itemId, quantity, `combat:${creature.id}`).ok) drops.push({ itemId: drop.itemId, quantity });
    }
    addCharacterXp(profile, creature.experience);
    delete profile.activeBattle;
    return { ok: true, state: 'won', battle, damage, rewards: { xp: creature.experience, coins, drops } };
  }
  const pet = profile.pets?.find(item => item.id === profile.activePetId && item.status === 'active' && item.health > 0 && item.energy > 0);
  const petEquipmentAttack = pet ? Object.values(pet.equipment || {}).reduce((sum,id)=>sum+(profile.itemInstances?.find(item=>item.id===id)?.stats?.attack||0),0) : 0;
  const petDamage = pet ? Math.max(1, Math.floor((pet.level * 2 + 5 + petEquipmentAttack) * (0.85 + random() * 0.3) - creature.defense * 0.25)) : 0;
  if (petDamage) battle.opponentHealth = Math.max(0, battle.opponentHealth - petDamage);
  if (battle.opponentHealth <= 0) {
    const research=recordCreatureVictory(profile,creature.id,now);
    const coins = creature.coinsMin + Math.floor(random() * (creature.coinsMax - creature.coinsMin + 1));
    const drops: { itemId: string; quantity: number }[] = [];
    for (const drop of creature.drops) if (random() * 100 < Math.min(100,drop.chance+(research.researched?10:0))) { const q = drop.minQuantity + Math.floor(random() * (drop.maxQuantity - drop.minQuantity + 1)); if (addItem(profile, drop.itemId, q, `combat:${creature.id}`).ok) drops.push({ itemId: drop.itemId, quantity: q }); }
    addCharacterXp(profile, creature.experience); delete profile.activeBattle;
    return { ok: true, state: 'won', battle, damage: damage + petDamage, rewards: { xp: creature.experience, coins, drops } };
  }
  const defenseBonus = action === 'defend' ? 0.55 : 0;
  const injury = getInjuryModifiers(profile, now);
  const armorDefense = Object.values(profile.equipment || {}).reduce((sum, id) => { const item = profile.itemInstances?.find(entry => entry.id === id); return sum + (item?.stats?.defense || 0); }, 0);
  let enemyAbility:string|undefined;let abilityMultiplier=1;
  if(creature.abilities.length&&random()<Math.min(0.35,Math.max(0.05,(creature.aggression||50)/300))){enemyAbility=creature.abilities[Math.floor(random()*creature.abilities.length)];const ability=enemyAbility.toLocaleLowerCase('tr-TR');if(/zehir|poison/.test(ability)){const old=battle.statuses.find(x=>x.id==='poisoned');if(old){old.turnsRemaining=Math.max(old.turnsRemaining,2);old.potency=Math.max(old.potency,Math.max(2,Math.floor(battle.maxPlayerHealth*0.025)));old.source=enemyAbility;}else battle.statuses.push({id:'poisoned',turnsRemaining:2,potency:Math.max(2,Math.floor(battle.maxPlayerHealth*0.025)),source:enemyAbility});abilityMultiplier=1.1;}else if(/korku|fear|ruh/.test(ability)){const old=battle.statuses.find(x=>x.id==='weakened');if(old){old.turnsRemaining=Math.max(old.turnsRemaining,2);old.potency=Math.max(old.potency,0.15);old.source=enemyAbility;}else battle.statuses.push({id:'weakened',turnsRemaining:2,potency:0.15,source:enemyAbility});abilityMultiplier=1.05;}else if(/tas_kabuk|kalkan|shield|zırh|zirh/.test(ability)){battle.opponentDefenseBonus=Math.floor(creature.defense*0.5);abilityMultiplier=0.9;}else if(/iyiles|sifa|heal/.test(ability)){battle.opponentHealth=Math.min(battle.maxOpponentHealth,battle.opponentHealth+Math.floor(battle.maxOpponentHealth*0.05));}else abilityMultiplier=1.25;}
  const roleMultiplier=creature.role==='world_boss'?1.35:creature.role==='mini_boss'?1.2:creature.role==='elite'?1.1:1;
  const playerDamage = Math.max(1, Math.floor(creature.attack * roleMultiplier * abilityMultiplier * (0.8 + random() * 0.4) * (1 - defenseBonus) * Math.max(0.2, 1 - (injury.defense || 0)) - stats.vitality * 0.35 - armorDefense));
  battle.playerHealth = Math.max(0, battle.playerHealth - playerDamage);
  battle.turn++;
  if (pet) { const petArmor=Object.values(pet.equipment||{}).reduce((sum,id)=>sum+(profile.itemInstances?.find(item=>item.id===id)?.stats?.defense||0),0);pet.energy = Math.max(0, pet.energy - 1); pet.health = Math.max(0, pet.health - Math.max(0,Math.floor(playerDamage * 0.15)-petArmor)); }
  if (battle.playerHealth <= 0) { delete profile.activeBattle; applyBattleInjury(profile, now); return { ok: true, state: 'lost', battle, damage: damage + petDamage, enemyAbility }; }
  return { ok: true, state: 'player_turn', battle, damage: damage + petDamage, enemyAbility };
}
