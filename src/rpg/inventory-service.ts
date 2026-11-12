import { randomUUID } from 'node:crypto';
import type { RpgEquipmentSlot, RpgProfileData } from './types';
import { getRpgItem } from './data/items';
import { ensureRpgProfile } from './profile-service';

export type InventoryResult = { ok: true; quantity: number } | { ok: false; reason: string };
export function countItem(profile: RpgProfileData, itemId: string): number {
  return (profile.itemInstances || []).filter(item => item.definitionId === itemId).reduce((sum, item) => sum + item.quantity, 0);
}
export function addItem(profileInput: RpgProfileData, itemId: string, quantity: number, origin = 'system', now = Date.now()): InventoryResult {
  const profile = ensureRpgProfile(profileInput);
  const definition = getRpgItem(itemId);
  if (!definition) return { ok: false, reason: 'unknown_item' };
  if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 100000) return { ok: false, reason: 'invalid_quantity' };
  const items = profile.itemInstances!;
  if (definition.stackable) {
    let remaining = quantity;
    const max = definition.maxStack || 999;
    for (const stack of items.filter(item => item.definitionId === itemId && item.quantity < max)) {
      const add = Math.min(remaining, max - stack.quantity);
      stack.quantity += add; remaining -= add;
      if (!remaining) break;
    }
    while (remaining > 0) {
      const add = Math.min(remaining, max);
      items.push({ id: randomUUID(), definitionId: itemId, quantity: add, acquiredAt: now, origin, tradeable: definition.tradeable, bound: false });
      remaining -= add;
    }
  } else {
    if (quantity > 100) return { ok: false, reason: 'too_many_instances' };
    for (let i = 0; i < quantity; i++) items.push({
      id: randomUUID(), definitionId: itemId, quantity: 1, acquiredAt: now, origin,
      rarity: definition.rarity, tradeable: definition.tradeable, bound: false,
      stats: definition.stats ? { ...definition.stats } : undefined,
      durability: definition.slot ? 100 : undefined, maxDurability: definition.slot ? 100 : undefined
    });
  }
  profileInput.itemInstances = items;
  return { ok: true, quantity };
}
function clearEquipmentReference(profile: RpgProfileData, instanceId: string) {
  for (const [slot, id] of Object.entries(profile.equipment || {})) if (id === instanceId) delete profile.equipment![slot as RpgEquipmentSlot];
  for (const pet of profile.pets || []) for (const [slot, id] of Object.entries(pet.equipment || {})) if (id === instanceId) delete pet.equipment[slot as RpgEquipmentSlot];
}
export function removeItem(profile: RpgProfileData, itemId: string, quantity: number): InventoryResult {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) return { ok: false, reason: 'invalid_quantity' };
  const items = profile.itemInstances || [];
  const available = countItem(profile, itemId);
  if (available < quantity) return { ok: false, reason: 'insufficient_items' };
  let remaining = quantity;
  for (let i = items.length - 1; i >= 0 && remaining > 0; i--) {
    const item = items[i];
    if (item.definitionId !== itemId) continue;
    const take = Math.min(item.quantity, remaining);
    item.quantity -= take; remaining -= take;
    if (item.quantity === 0) { clearEquipmentReference(profile, item.id); items.splice(i, 1); }
  }
  profile.itemInstances = items;
  return { ok: true, quantity };
}
export function transferItem(from: RpgProfileData, to: RpgProfileData, itemId: string, quantity: number): InventoryResult {
  const definition = getRpgItem(itemId);
  if (!definition?.tradeable) return { ok: false, reason: 'not_tradeable' };
  const matching = (from.itemInstances || []).filter(item => item.definitionId === itemId);
  if (matching.some(item => item.bound || item.tradeable === false)) return { ok: false, reason: 'bound_item' };
  if (countItem(from, itemId) < quantity) return { ok: false, reason: 'insufficient_items' };
  const removed = removeItem(from, itemId, quantity);
  if (!removed.ok) return removed;
  const added = addItem(to, itemId, quantity, 'player_trade');
  if (!added.ok) { addItem(from, itemId, quantity, 'trade_rollback'); return added; }
  return { ok: true, quantity };
}
export function equipItem(profile: RpgProfileData, instanceId: string): InventoryResult {
  const instance = profile.itemInstances?.find(item => item.id === instanceId);
  if (!instance) return { ok: false, reason: 'item_not_found' };
  const definition = getRpgItem(instance.definitionId);
  if (!definition?.slot || !['weapon','armor','shield','accessory','pet_equipment'].includes(definition.category)) return { ok: false, reason: 'not_equippable' };
  if ((profile.characterLevel || 1) < (definition.requiredLevel || 1)) return { ok: false, reason: 'level_too_low' };
  if (definition.requiredProfession && (profile.professions?.[definition.requiredProfession]?.level || 1) < (definition.requiredProfessionLevel || 1)) return { ok: false, reason: 'profession_required' };
  if (definition.requiredSpecialization && profile.mainSpecialization?.specializationId !== definition.requiredSpecialization) return { ok: false, reason: 'specialization_required' };
  if (definition.category === 'pet_equipment') {
    const pet = profile.pets?.find(item => item.id === profile.activePetId);
    if (!pet) return { ok: false, reason: 'active_pet_required' };
    pet.equipment[definition.slot] = instance.id;
  } else {
    profile.equipment = profile.equipment || {};
    profile.equipment[definition.slot] = instance.id;
  }
  return { ok: true, quantity: 1 };
}
export function unequipItem(profile: RpgProfileData, slot: RpgEquipmentSlot, petEquipment = false): InventoryResult {
  if (petEquipment) {
    const pet = profile.pets?.find(item => item.id === profile.activePetId);
    if (!pet) return { ok: false, reason: 'active_pet_required' };
    if (!pet.equipment[slot]) return { ok: false, reason: 'slot_empty' };
    delete pet.equipment[slot];
  } else {
    if (!profile.equipment?.[slot]) return { ok: false, reason: 'slot_empty' };
    delete profile.equipment[slot];
  }
  return { ok: true, quantity: 1 };
}
