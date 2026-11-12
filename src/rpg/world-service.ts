import type { RpgProfileData, RpgRegionProgress } from './types';
import { RPG_REGIONS, getRegion } from './data/world';
import { getSettlement } from './data/settlements';
import { countItem, removeItem } from './inventory-service';

export type WorldResult = { ok: true; regionId: string } | { ok: false; reason: string };
function completed(profile: RpgProfileData, questId: string) { return profile.quests?.[questId]?.status === 'completed'; }
export function isRegionUnlocked(profile: RpgProfileData, regionId: string): boolean {
  const region = getRegion(regionId);
  if (!region) return false;
  if (region.initiallyUnlocked) return true;
  const reqs = region.unlockRequirements || [];
  if (!reqs.length) return !!profile.regions?.[regionId]?.unlocked;
  // Every listed condition is a gate; this avoids accidental bypasses when a region has several requirements.
  return reqs.every(req => {
    if (req.characterLevel && (profile.characterLevel || 1) < req.characterLevel) return false;
    if (req.completedQuest && !completed(profile, req.completedQuest)) return false;
    if (req.discoveredRegion && !profile.regions?.[req.discoveredRegion]?.discovered) return false;
    if (req.itemId && countItem(profile, req.itemId) < (req.itemQuantity || 1)) return false;
    if (req.storyFlag && !profile.storyFlags?.[req.storyFlag]) return false;
    return true;
  });
}
export function discoverRegion(profile: RpgProfileData, regionId: string): WorldResult {
  const region = getRegion(regionId);
  if (!region) return { ok: false, reason: 'unknown_region' };
  if (!isRegionUnlocked(profile, regionId)) return { ok: false, reason: 'region_locked' };
  const previous = profile.regions?.[regionId] || { regionId, discovered: false, unlocked: region.initiallyUnlocked, completedQuests: [] };
  profile.regions = profile.regions || {};
  profile.regions[regionId] = { ...previous, unlocked: true, discovered: true, discoveredAt: previous.discoveredAt || Date.now(), completedQuests: previous.completedQuests || [] };
  return { ok: true, regionId };
}
export function travelToRegion(profile: RpgProfileData, regionId: string, now = Date.now()): WorldResult {
  const region = getRegion(regionId);
  if (!region) return { ok: false, reason: 'unknown_region' };
  if (!isRegionUnlocked(profile, regionId)) return { ok: false, reason: 'region_locked' };
  const currentRegionId = profile.currentRegionId || RPG_REGIONS.find(item => item.initiallyUnlocked)?.id;
  if (currentRegionId === regionId) return { ok: true, regionId };
  const currentRegion = currentRegionId ? getRegion(currentRegionId) : undefined;
  if (!currentRegion?.connectedRegions.includes(regionId)) return { ok: false, reason: 'not_connected' };
  const minutes = Math.max(0, region.travelMinutes || 0);
  const wait = minutes * 60_000;
  if (profile.lastTravelAt && now - profile.lastTravelAt < wait) return { ok: false, reason: 'travel_cooldown' };
  profile.currentRegionId = regionId;
  profile.lastTravelAt = now;
  discoverRegion(profile, regionId);
  return { ok: true, regionId };
}
export function getWorldMap(profile: RpgProfileData) {
  const currentRegionId=profile.currentRegionId||RPG_REGIONS.find(item=>item.initiallyUnlocked)?.id;
  return RPG_REGIONS.map(region => ({ ...region, unlocked: isRegionUnlocked(profile, region.id), discovered: !!profile.regions?.[region.id]?.discovered || region.initiallyUnlocked, current: currentRegionId === region.id, connected: !!getRegion(currentRegionId||'')?.connectedRegions.includes(region.id), settlement: getSettlement(region.settlementId) }));
}
export function consumeUnlockItems(profile: RpgProfileData, regionId: string): WorldResult {
  const region = getRegion(regionId);
  if (!region || !isRegionUnlocked(profile, regionId)) return { ok: false, reason: 'region_locked' };
  for (const req of region.unlockRequirements) if (req.itemId && countItem(profile, req.itemId) < (req.itemQuantity || 1)) return { ok: false, reason: 'missing_unlock_item' };
  for (const req of region.unlockRequirements) if (req.itemId) removeItem(profile, req.itemId, req.itemQuantity || 1);
  profile.regions = profile.regions || {};
  const old: RpgRegionProgress = profile.regions[regionId] || { regionId, discovered: false, unlocked: false, completedQuests: [] };
  profile.regions[regionId] = { ...old, unlocked: true };
  return { ok: true, regionId };
}
