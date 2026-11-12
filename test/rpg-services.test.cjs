const test = require('node:test');
const assert = require('node:assert/strict');
const profileSvc = require('../dist/rpg/profile-service');
const inventory = require('../dist/rpg/inventory-service');
const world = require('../dist/rpg/world-service');
const quests = require('../dist/rpg/quest-service');
const combat = require('../dist/rpg/combat-service');
const groups = require('../dist/rpg/group-service');
const market = require('../dist/rpg/market-service');
const pets = require('../dist/rpg/pet-service');
const { RPG_RECIPES } = require('../dist/rpg/data/recipes');
const crafting = require('../dist/rpg/crafting-service');

test('new profile has all 11 professions and a valid starting region', () => {
  const p = profileSvc.createRpgProfile(1);
  assert.equal(Object.keys(p.professions).length, 11);
  assert.equal(p.characterLevel, 1);
  assert.equal(p.currentRegionId, 'baslangic_duzlugu');
});

test('profile migration fills missing profession and region fields without dropping inventory', () => {
  const p = { itemInstances: [{ id: 'x', definitionId: 'sert_agac', quantity: 2, acquiredAt: 1 }], professions: {} };
  const merged = profileSvc.ensureRpgProfile(p, 2);
  assert.equal(Object.keys(merged.professions).length, 11);
  assert.equal(merged.itemInstances[0].quantity, 2);
});

test('inventory stacks items and refuses invalid quantities', () => {
  const p = profileSvc.createRpgProfile();
  assert.equal(inventory.addItem(p, 'sert_agac', 100).ok, true);
  assert.equal(inventory.countItem(p, 'sert_agac'), 100);
  assert.equal(inventory.addItem(p, 'sert_agac', -1).ok, false);
  assert.equal(inventory.removeItem(p, 'sert_agac', 30).ok, true);
  assert.equal(inventory.countItem(p, 'sert_agac'), 70);
});

test('world map exposes only unlocked starting regions and rejects locked travel', () => {
  const p = profileSvc.createRpgProfile();
  assert.equal(world.isRegionUnlocked(p, 'baslangic_duzlugu'), true);
  assert.equal(world.travelToRegion(p, 'baslangic_duzlugu').ok, true);
  const locked = world.getWorldMap(p).find(r => !r.unlocked);
  assert.ok(locked);
  assert.equal(world.travelToRegion(p, locked.id).ok, false);
});

test('quest lifecycle advances objectives and grants its item/XP rewards', () => {
  const p = profileSvc.createRpgProfile();
  assert.equal(quests.startQuest(p, 'ilk_adim', 10).ok, true);
  quests.advanceQuest(p, 'ilk_adim', 'collect', 'sert_agac', 5, 11);
  const done = quests.advanceQuest(p, 'ilk_adim', 'collect', 'sifali_ot', 3, 12);
  assert.equal(done.ok, true);
  assert.equal(done.completed, true);
  assert.equal(p.quests.ilk_adim.status, 'completed');
  assert.equal(inventory.countItem(p, 'orman_meyvesi'), 3);
  assert.ok(p.characterXp > 0);
});

test('combat starts only once and resolves victory with deterministic strong character', () => {
  const p = profileSvc.createRpgProfile();
  p.characterLevel = 100; p.stats.strength = 1000;
  const started = combat.startCombat(p, 'bozkir_kurdu', 'player-1', 100);
  assert.equal(started.ok, true);
  assert.equal(combat.startCombat(p, 'bozkir_kurdu', 'player-1', 101).ok, false);
  const turn = combat.combatTurn(p, 'player-1', 'attack', () => 0.5, 102);
  assert.equal(turn.ok, true);
  assert.equal(turn.state, 'won');
  assert.equal(p.activeBattle, undefined);
});

test('group invites require acceptance and enforce four-player capacity', () => {
  const state = {};
  const made = groups.createGroup(state, 'guild', 'leader', 1);
  assert.equal(made.ok, true);
  assert.equal(groups.inviteToGroup(made.group, 'leader', 'member', 2).ok, true);
  assert.equal(made.group.members.length, 1);
  assert.equal(groups.acceptGroupInvite(state, made.group.id, 'member', 3).ok, true);
  assert.equal(made.group.members.length, 2);
});

test('market listing removes listed stock and cancellation returns it', () => {
  const p = profileSvc.createRpgProfile();
  inventory.addItem(p, 'sert_agac', 5);
  const listings = {};
  const created = market.createListing(listings, 'seller', p, 'sert_agac', 3, 10, 100);
  assert.equal(created.ok, true);
  assert.equal(inventory.countItem(p, 'sert_agac'), 2);
  assert.equal(market.cancelListing(listings, created.listing.id, 'seller', p).ok, true);
  assert.equal(inventory.countItem(p, 'sert_agac'), 5);
});

test('pet adoption enforces pet limit and active pet can be selected', () => {
  const p = profileSvc.createRpgProfile();
  const adopted = pets.adoptPet(p, 'kurt', 'Yoldaş', 100);
  assert.equal(adopted.ok, true);
  assert.equal(pets.setActivePet(p, adopted.pet.id).ok, true);
  assert.equal(p.activePetId, adopted.pet.id);
});

test('crafting rejects missing profession ingredients without consuming inventory', () => {
  const p = profileSvc.createRpgProfile();
  const recipe = RPG_RECIPES[0];
  const before = p.itemInstances.length;
  const result = crafting.craftItem(p, recipe.id, 1, () => 0.5);
  assert.equal(result.ok, false);
  assert.equal(p.itemInstances.length, before);
});

test('crafting consumes ingredients, creates output with quality and grants profession XP', () => {
  const p = profileSvc.createRpgProfile();
  for (const [id, amount] of [['demir_cevheri', 4], ['hurda_metal', 2], ['sert_agac', 1]]) inventory.addItem(p, id, amount);
  const result = crafting.craftItem(p, 'demir_kilic_tarifi', 1, () => 0.5);
  assert.equal(result.ok, true);
  assert.equal(inventory.countItem(p, 'demir_cevheri'), 0);
  assert.equal(inventory.countItem(p, 'hurda_metal'), 0);
  assert.equal(inventory.countItem(p, 'demir_kilic'), 1);
  assert.ok(p.professions.demirci.xp > 0);
  assert.ok(p.itemInstances.find(item => item.definitionId === 'demir_kilic').quality > 0);
});

test('active pet expedition cannot be claimed early and grants region loot when complete', () => {
  const p = profileSvc.createRpgProfile();
  const adopted = pets.adoptPet(p, 'kurt', 'Yoldaş', 100);
  assert.equal(adopted.ok, true);
  const started = pets.startPetExpedition(p, adopted.pet.id, 'baslangic_duzlugu', 1000);
  assert.equal(started.ok, true);
  const expedition = p.petExpeditions[0];
  assert.equal(pets.claimPetExpedition(p, expedition.id, 1001).reason, 'not_ready');
  const claimed = pets.claimPetExpedition(p, expedition.id, expedition.completesAt + 1, () => 0);
  assert.equal(claimed.ok, true);
  assert.equal(expedition.status, 'claimed');
});

test('story choices advance a branching main story and unlock the next region', () => {
  const story = require('../dist/rpg/story-service');
  const p = profileSvc.createRpgProfile();
  assert.equal(story.getAvailableStory(p)[0].id, 'ilk_ates');
  assert.equal(story.chooseStory(p, 'ilk_ates', 'izciye_danisma').ok, true);
  assert.equal(story.getAvailableStory(p).length,0);
  p.characterLevel=5;
  assert.equal(story.getAvailableStory(p)[0].id, 'orman_fisiltisi');
  assert.equal(story.chooseStory(p, 'orman_fisiltisi', 'sirri_arastir').ok, true);
  assert.equal(p.storyFlags.story_orman_ilerledi,true);
  assert.equal(require('../dist/rpg/world-service').isRegionUnlocked(p,'kadim_orman'),false);
  p.characterLevel=15;
  assert.equal(story.getAvailableStory(p)[0].id,'kadim_orman_sirri');
});

test('world boss requires a full valid party, consumes summon materials and rewards all members', () => {
  const bossService = require('../dist/rpg/world-boss-service');
  const state = bossService.createWorldBossState();
  const group = { id:'g1', guildId:'guild', leaderId:'p1', members:['p1','p2','p3','p4'].map(userId=>({userId,joinedAt:1})), invites:[],createdAt:1 };
  const profiles = {};
  for (const id of group.members.map(x=>x.userId)) {
    profiles[id] = profileSvc.createRpgProfile();
    profiles[id].characterLevel = 100;
    profiles[id].currentRegionId = 'karanlik_yar';
    profiles[id].stats.strength = 100000;
  }
  inventory.addItem(profiles.p1,'nadir_yumurta',1);
  inventory.addItem(profiles.p1,'boss_ozu',12);
  const started = bossService.startWorldBoss(state,'yitik_kiyamet',group,profiles,1000);
  assert.equal(started.ok,true);
  assert.equal(profiles.p1.activeWorldBossId,'yitik_kiyamet');
  assert.equal(inventory.countItem(profiles.p1,'boss_ozu'),0);
  const hit = bossService.attackWorldBoss(state,'yitik_kiyamet','p1',profiles,()=>0.5,5000);
  assert.equal(hit.ok,true);
  assert.equal(hit.encounter.status,'won');
  for (const id of ['p1','p2','p3','p4']) {
    assert.equal(profiles[id].activeWorldBossId,undefined);
    assert.ok(profiles[id].bossProgress.yitik_kiyamet.defeatedAt);
    assert.ok(inventory.countItem(profiles[id],'boss_ozu')>=12);
  }
});

test('RPG catalog references are complete and every profession has starter recipes', () => {
  const { RPG_ITEMS } = require('../dist/rpg/data/items');
  const { RPG_PROFESSIONS } = require('../dist/rpg/data/professions');
  const { RPG_RECIPES } = require('../dist/rpg/data/recipes');
  const { RPG_REGIONS } = require('../dist/rpg/data/world');
  const { RPG_CREATURES } = require('../dist/rpg/data/creatures');
  const itemIds = new Set(Object.keys(RPG_ITEMS));
  const creatureIds = new Set(Object.keys(RPG_CREATURES));
  for (const region of RPG_REGIONS) {
    for (const id of [...region.resources, ...region.explorationRewards]) assert.ok(itemIds.has(id), `${region.id}: ${id}`);
    for (const id of region.creatures) assert.ok(creatureIds.has(id), `${region.id}: ${id}`);
  }
  for (const recipe of RPG_RECIPES) {
    assert.ok(itemIds.has(recipe.outputItemId), `${recipe.id} output`);
    for (const ingredient of recipe.ingredients) assert.ok(itemIds.has(ingredient.itemId), `${recipe.id} ingredient ${ingredient.itemId}`);
  }
  for (const profession of RPG_PROFESSIONS) {
    assert.ok(RPG_RECIPES.some(r=>r.profession===profession.id&&r.requiredLevel===1), `${profession.id} starter recipe`);
    for (const id of [...profession.products,...profession.specializations.flatMap(s=>s.focus)]) assert.ok(itemIds.has(id), `${profession.id}: ${id}`);
  }
  assert.deepEqual(new Set(RPG_REGIONS.map(r=>r.dangerLevel)),new Set([1,2,3,4,5,6,7,8]));
});

test('profession boss uses tier requirements, rewards profession XP and enforces retry protection', () => {
  const bosses = require('../dist/rpg/profession-boss-service');
  const p = profileSvc.createRpgProfile();
  p.stats.strength = 100000;
  const started = bosses.startProfessionBoss(p, 'ormanci', 'p1', 1000);
  assert.equal(started.ok, true);
  assert.equal(bosses.startProfessionBoss(p, 'ormanci', 'p1', 1001).reason, 'already_in_combat');
  assert.equal(bosses.professionBossTurn(p, 'p1', 'flee', () => 0.5, 1002).state, 'fled');
  assert.equal(bosses.startProfessionBoss(p, 'ormanci', 'p1', 1003).reason, 'cooldown');
  const startedAgain = bosses.startProfessionBoss(p, 'ormanci', 'p1', 3_601_001);
  assert.equal(startedAgain.ok, true);
  const result = bosses.professionBossTurn(p, 'p1', 'attack', () => 0.5, 3_603_001);
  assert.equal(result.ok, true);
  assert.equal(result.state, 'won');
  assert.ok(p.professions.ormanci.xp > 0);
  assert.equal(p.activeBattle, undefined);
  assert.ok(p.bossProgress.orman_koruyucusu.defeatedAt);
});

test('defeat creates a timed injury and correct medicine removes it', () => {
  const injuries = require('../dist/rpg/injury-service');
  const p = profileSvc.createRpgProfile();
  inventory.addItem(p, 'saglik_iksiri', 1);
  const injury = injuries.applyBattleInjury(p, 1000);
  assert.equal(injury.severity, 'moderate');
  assert.ok(injuries.getInjuryModifiers(p, 1001).attack < 0);
  assert.equal(injuries.treatInjury(p, injury.id, 'yanlis_esya').reason, 'wrong_treatment');
  assert.equal(injuries.treatInjury(p, injury.id, 'saglik_iksiri').ok, true);
  assert.equal(injuries.getActiveInjuries(p, 1002).length, 0);
});

test('player market purchase transfers stock and settles currency with bounded price math', () => {
  const seller = profileSvc.createRpgProfile();
  const buyer = profileSvc.createRpgProfile();
  inventory.addItem(seller, 'sert_agac', 4);
  const listings = {};
  const listing = market.createListing(listings, 'seller', seller, 'sert_agac', 2, 25, 100).listing;
  const bought = market.buyListing(listings, listing.id, 'buyer', buyer, 1000, 101);
  assert.equal(bought.ok, true);
  assert.equal(bought.total, 50);
  assert.equal(inventory.countItem(buyer, 'sert_agac'), 2);
  assert.equal(inventory.countItem(seller, 'sert_agac'), 2);
});

test('world boss, profession boss, NPC, pet and lore catalogues are internally consistent', () => {
  const { RPG_ITEMS } = require('../dist/rpg/data/items');
  const { RPG_REGIONS } = require('../dist/rpg/data/world');
  const { RPG_PET_SPECIES } = require('../dist/rpg/data/pets');
  const { RPG_PROFESSION_BOSSES, RPG_WORLD_BOSSES } = require('../dist/rpg/data/bosses');
  const { RPG_NPCS } = require('../dist/rpg/npc-service');
  const { RPG_ANCIENT_POWERS, RPG_ANCIENT_CULTURES } = require('../dist/rpg/data/lore');
  const itemIds = new Set(Object.keys(RPG_ITEMS));
  const regionIds = new Set(RPG_REGIONS.map(r=>r.id));
  for (const pet of RPG_PET_SPECIES) for (const food of pet.preferredFood) assert.ok(itemIds.has(food), `${pet.id} food ${food}`);
  for (const boss of RPG_PROFESSION_BOSSES) for (const tier of boss.tiers) for (const reward of tier.rewards) assert.ok(itemIds.has(reward.itemId), `${boss.id} reward ${reward.itemId}`);
  for (const boss of RPG_WORLD_BOSSES) {
    assert.ok(regionIds.has(boss.regionId), `${boss.id} region`);
    assert.ok(boss.maxPartySize <= 4 && boss.minPartySize <= 4, `${boss.id} party limit`);
    for (const item of [...boss.summonRequirements,...boss.rewards]) assert.ok(itemIds.has(item.itemId), `${boss.id} item ${item.itemId}`);
  }
  for (const npc of RPG_NPCS) assert.ok(regionIds.has(npc.regionId), `${npc.id} region`);
  assert.equal(new Set(RPG_ANCIENT_POWERS.map(p=>p.id)).size,8);
  assert.ok(RPG_ANCIENT_CULTURES.length>=7);
});

test('only the globally selected specialization branch progresses and its recipes unlock at thresholds', () => {
  const specs = require('../dist/rpg/specializations');
  const p = profileSvc.createRpgProfile();
  p.professions.ormanci.level = 10;
  assert.equal(specs.selectMainSpecialization(p,'ormanci','kerestecilik').ok,true);
  profileSvc.addProfessionXp(p,'ormanci',500);
  assert.equal(p.professions.ormanci.specializations.kerestecilik.level,2);
  assert.ok(p.professions.ormanci.unlockedRecipes.includes('ormanci_kerestecilik_uzmanlik_tarifi'));
  profileSvc.addProfessionXp(p,'ormanci',2000);
  assert.equal(p.professions.ormanci.specializations.kerestecilik.level,3);
  assert.equal(specs.selectMainSpecialization(p,'madenci','metal_madenciligi').ok,true);
  assert.equal(p.professions.ormanci.specializations.kerestecilik.level,1);
  assert.equal(p.professions.ormanci.specializations.kerestecilik.xp,0);
  assert.equal(p.professions.madenci.specializations.metal_madenciligi.level,1);
});

test('specialization recipe crafting requires the selected branch and its branch level', () => {
  const specs = require('../dist/rpg/specializations');
  const p = profileSvc.createRpgProfile();
  p.professions.ormanci.level = 10;
  specs.selectMainSpecialization(p,'ormanci','kerestecilik');
  inventory.addItem(p,'sert_agac',2);
  inventory.addItem(p,'recine',1);
  const result = crafting.craftItem(p,'ormanci_kerestecilik_uzmanlik_tarifi',1,()=>0.5);
  assert.equal(result.ok,true);
  assert.equal(inventory.countItem(p,'kereste'),1);
});

test('character reaches level 100 then converts all further XP into unlimited mastery', () => {
  const p = profileSvc.createRpgProfile();
  const result = profileSvc.addCharacterXp(p, 50_000_000);
  assert.equal(p.characterLevel, 100);
  assert.ok(p.masteryLevel > 100);
  assert.equal(p.masteryPoints, 100);
  assert.ok(p.masteryTitles.includes('Nexus Efsanesi'));
  assert.ok(p.masteryCosmetics.includes('Sonsuzluk Işıltısı'));
  assert.ok(result.masteryLevels > 0);
  profileSvc.addCharacterXp(p, 1_000_000);
  assert.ok(p.masteryLevel > 100);
  assert.equal(p.masteryPoints, 100);
});

test('character level rewards attribute points and allocation respects available points and caps', () => {
  const attributes = require('../dist/rpg/character-service');
  const p = profileSvc.createRpgProfile();
  profileSvc.addCharacterXp(p, profileSvc.xpForCharacterLevel(1));
  assert.equal(p.stats.points, 3);
  assert.equal(attributes.allocateStatPoints(p,'strength',2).ok,true);
  assert.equal(p.stats.strength,7);
  assert.equal(p.stats.points,1);
  assert.equal(attributes.allocateStatPoints(p,'vitality',2).reason,'insufficient_points');
});

test('equipment instances receive catalogue stats and cannot leave dangling equipment references', () => {
  const p = profileSvc.createRpgProfile();
  inventory.addItem(p,'kilic',1);
  const weapon = p.itemInstances.find(item=>item.definitionId==='kilic');
  assert.equal(weapon.stats.attack,4);
  assert.equal(inventory.equipItem(p,weapon.id).ok,true);
  assert.equal(p.equipment.weapon,weapon.id);
  assert.equal(inventory.removeItem(p,'kilic',1).ok,true);
  assert.equal(p.equipment.weapon,undefined);
});

test('pet equipment is attached to the active pet and removal clears the pet slot', () => {
  const p = profileSvc.createRpgProfile();
  const pet = pets.adoptPet(p,'kurt','Kor',100).pet;
  p.professions.derici.level = 10;
  inventory.addItem(p,'pet_zirhi',1);
  const armor = p.itemInstances.find(item=>item.definitionId==='pet_zirhi');
  assert.equal(inventory.equipItem(p,armor.id).ok,true);
  assert.equal(pet.equipment.pet_armor,armor.id);
  assert.equal(inventory.removeItem(p,'pet_zirhi',1).ok,true);
  assert.equal(pet.equipment.pet_armor,undefined);
});

test('Discord slash command registration remains below the 100-command platform limit', () => {
  const fs = require('node:fs');
  const source = fs.readFileSync(require('node:path').join(__dirname,'../src/index.ts'),'utf8');
  const registrations = [...source.matchAll(/(?:simple|staffCmd|adminCmd)\('([^']+)'/g)].map(match=>match[1]);
  const prefixMatch = source.match(/PREFIX_ONLY_COMMANDS=new Set\(\[(.*?)\]\)/s);
  assert.ok(prefixMatch);
  const prefixOnly = [...prefixMatch[1].matchAll(/'([^']+)'/g)].map(match=>match[1]);
  const slashCount = new Set(registrations.filter(name=>!prefixOnly.includes(name))).size;
  assert.ok(slashCount <= 100, `Slash command count ${slashCount} exceeds Discord's limit`);
  assert.equal(new Set(prefixOnly).size,prefixOnly.length);
});

test('daily streak grants seven-day milestone, enforces 24-hour cooldown and resets after a missed window', () => {
  const { claimDailyStreak } = require('../dist/lib/daily-streak');
  const account = { coins:0, lastDaily:0, dailyStreak:0 };
  let now = 1_000_000;
  for (let day=1;day<=7;day++) {
    const result=claimDailyStreak(account,now+(day-1)*86_400_000);
    assert.equal(result.ok,true);
    assert.equal(result.streak,day);
    if(day===7)assert.equal(result.milestoneBonus,500);
  }
  const cooldown=claimDailyStreak(account,now+6*86_400_000+60_000);
  assert.equal(cooldown.reason,'cooldown');
  const reset=claimDailyStreak(account,now+10*86_400_000);
  assert.equal(reset.ok,true);
  assert.equal(reset.streak,1);
});

test('character XP safely initializes optional attributes on a partial legacy profile', () => {
  const partial = { characterLevel:1, characterXp:0 };
  const result = profileSvc.addCharacterXp(partial, profileSvc.xpForCharacterLevel(1));
  assert.equal(result.level,2);
  assert.equal(partial.stats.points,3);
});

test('pet feeding accepts pet food and preferred natural food, and rejects unrelated materials', () => {
  const p = profileSvc.createRpgProfile();
  const pet = pets.adoptPet(p,'ayi','Boz',1).pet;
  pet.hunger = 30;
  inventory.addItem(p,'bal',1);
  inventory.addItem(p,'demir_cevheri',1);
  assert.equal(pets.feedPet(p,pet.id,'demir_cevheri').reason,'invalid_food');
  pet.health=1;pet.energy=0;
  assert.equal(pets.feedPet(p,pet.id,'bal').ok,true);
  assert.ok(pet.hunger>30);
  assert.ok(pet.health>1);
  assert.ok(pet.energy>0);
});

test('specialization tariff, free first choice, no-op repeats and persistence rollback are correct', () => {
  const { getSpecializationChangeFee } = require('../dist/rpg/specialization-fees');
  const { changeMainSpecialization } = require('../dist/rpg/specialization-service');
  assert.deepEqual([0,1,2,3,4,5,6,7,8].map(getSpecializationChangeFee),[500,1000,2000,3500,5000,7500,10000,10000,10000]);
  const wallet={coins:5000,rpg:profileSvc.createRpgProfile()};
  assert.equal(changeMainSpecialization(wallet,'ormanci','kerestecilik',()=>{}).charged,0);
  assert.equal(changeMainSpecialization(wallet,'ormanci','kerestecilik',()=>{}).changed,false);
  assert.equal(changeMainSpecialization(wallet,'ormanci','yay_ustaligi',()=>{}).charged,500);
  assert.equal(wallet.coins,4500);
  const before=structuredClone(wallet.rpg);
  const failed=changeMainSpecialization(wallet,'ormanci','orman_koruyuculugu',()=>{throw new Error('disk');});
  assert.equal(failed.reason,'persistence_failed');
  assert.equal(wallet.coins,4500);
  assert.deepEqual(wallet.rpg,before);
});

test('world map connections are valid, symmetric and connect every region', () => {
  const { RPG_REGIONS } = require('../dist/rpg/data/world');
  const byId = new Map(RPG_REGIONS.map(region=>[region.id,region]));
  for (const region of RPG_REGIONS) for (const neighbour of region.connectedRegions) {
    assert.ok(byId.has(neighbour),`${region.id} -> ${neighbour}`);
    assert.ok(byId.get(neighbour).connectedRegions.includes(region.id),`${neighbour} must connect back to ${region.id}`);
  }
  const seen = new Set(['baslangic_duzlugu']);
  const queue = ['baslangic_duzlugu'];
  while(queue.length){const current=byId.get(queue.shift());for(const next of current.connectedRegions)if(!seen.has(next)){seen.add(next);queue.push(next);}}
  assert.equal(seen.size,RPG_REGIONS.length);
});

test('main quest chain and story flags unlock regions without circular objectives', () => {
  const quest = require('../dist/rpg/quest-service');
  const world = require('../dist/rpg/world-service');
  const p = profileSvc.createRpgProfile();
  p.characterLevel = 65;
  p.storyFlags = {
    story_orman_ilerledi:true, story_kadim_muhur:true, story_derin_kuyu:true,
    story_deniz_muhur:true, story_yitik_yemin:true, story_ejderha_kalbi:true
  };
  function complete(id, events) {
    assert.equal(quest.startQuest(p,id,Date.now()).ok,true,`start ${id}`);
    for(const event of events){
      if(event.type==='collect') inventory.addItem(p,event.target,event.amount);
      if(event.type==='level') p.characterLevel=Math.max(p.characterLevel,event.amount);
      if(event.type==='discover') world.discoverRegion(p,event.target);
      if(event.type==='level') quest.syncQuestMilestones(p);
      else quest.advanceQuest(p,id,event.type,event.target,event.amount||1);
    }
    assert.equal(p.quests[id].status,'completed',`complete ${id}`);
  }
  complete('ilk_adim',[{type:'collect',target:'sert_agac',amount:5},{type:'collect',target:'sifali_ot',amount:3}]);
  complete('orman_yolu',[{type:'discover',target:'yesilorman'},{type:'collect',target:'recine',amount:5},{type:'defeat',target:'orman_kurdu',amount:3}]);
  complete('kadim_orman_izleri',[{type:'level',amount:15},{type:'collect',target:'kadim_lif',amount:8},{type:'defeat',target:'orman_ayi'}]);
  assert.equal(world.isRegionUnlocked(p,'kadim_orman'),true);
  world.discoverRegion(p,'kadim_orman');
  complete('madenin_sirri',[{type:'level',amount:20},{type:'collect',target:'hurda_metal',amount:5},{type:'interact',target:'maden_rehberi'}]);
  assert.equal(world.isRegionUnlocked(p,'derin_maden'),true);
  complete('kayip_deniz_feneri',[{type:'level',amount:25},{type:'collect',target:'recine',amount:8},{type:'interact',target:'denizci_salih'}]);
  assert.equal(world.isRegionUnlocked(p,'sisli_sahil'),true);
  complete('kayip_kasifin_gunlugu',[{type:'discover',target:'yesilorman'},{type:'interact',target:'bilge_tomris'},{type:'collect',target:'kadim_lif',amount:5}]);
  assert.equal(world.isRegionUnlocked(p,'gizli_magara'),true);
  world.discoverRegion(p,'gizli_magara');
  complete('unutulmus_muhur',[{type:'level',amount:35},{type:'collect',target:'buyulu_kristal',amount:10},{type:'defeat',target:'gizli_muhafiz'}]);
  assert.equal(world.isRegionUnlocked(p,'unutulmus_gecit'),true);
  world.discoverRegion(p,'unutulmus_gecit');
  complete('ejderha_mirasinin_anahtari',[{type:'level',amount:55},{type:'collect',target:'buyulu_kristal',amount:10},{type:'defeat',target:'golge_savasci'}]);
  assert.equal(world.isRegionUnlocked(p,'ejderha_tepesi'),true);
  world.discoverRegion(p,'ejderha_tepesi');
  assert.equal(world.isRegionUnlocked(p,'karanlik_yar'),true);
});

test('all quest objectives, NPC quest links, region gates and specialization recipe references resolve', () => {
  const { RPG_ITEMS } = require('../dist/rpg/data/items');
  const { RPG_CREATURES } = require('../dist/rpg/data/creatures');
  const { RPG_REGIONS } = require('../dist/rpg/data/world');
  const { RPG_QUESTS } = require('../dist/rpg/data/quests');
  const { RPG_RECIPES } = require('../dist/rpg/data/recipes');
  const { RPG_PROFESSIONS } = require('../dist/rpg/data/professions');
  const { RPG_NPCS } = require('../dist/rpg/npc-service');
  const itemIds=new Set(Object.keys(RPG_ITEMS));const creatureIds=new Set(Object.keys(RPG_CREATURES));
  const regionIds=new Set(RPG_REGIONS.map(x=>x.id));const questIds=new Set(RPG_QUESTS.map(x=>x.id));
  const recipeIds=new Set(RPG_RECIPES.map(x=>x.id));const npcIds=new Set(RPG_NPCS.map(x=>x.id));
  for(const q of RPG_QUESTS){
    for(const id of q.prerequisites)assert.ok(questIds.has(id),`${q.id} prerequisite ${id}`);
    for(const o of q.objectives){
      if(o.type==='collect'&&o.targetId)assert.ok(itemIds.has(o.targetId),`${q.id} collect ${o.targetId}`);
      if(o.type==='defeat'&&o.targetId)assert.ok(creatureIds.has(o.targetId)||o.targetId.startsWith('boss:'),`${q.id} defeat ${o.targetId}`);
      if(o.type==='interact')assert.ok(npcIds.has(o.targetId),`${q.id} NPC ${o.targetId}`);
      if(o.type==='discover')assert.ok(regionIds.has(o.targetId),`${q.id} region ${o.targetId}`);
    }
    if(q.rewards.unlockRecipe)assert.ok(recipeIds.has(q.rewards.unlockRecipe));
    if(q.rewards.unlockRegion)assert.ok(regionIds.has(q.rewards.unlockRegion));
  }
  for(const npc of RPG_NPCS)for(const q of npc.questIds||[])assert.ok(questIds.has(q),`${npc.id} quest ${q}`);
  for(const recipe of RPG_RECIPES.filter(r=>r.specialization))assert.ok(RPG_PROFESSIONS.find(p=>p.id===recipe.profession).specializations.some(s=>s.id===recipe.specialization),`${recipe.id} specialization`);
  assert.equal(RPG_PROFESSIONS.length,11);
  assert.ok(RPG_PROFESSIONS.every(p=>p.specializations.length===3));
  assert.equal(RPG_RECIPES.filter(r=>r.specialization).length,33);
  assert.equal(new Set(RPG_REGIONS.map(r=>r.dangerLevel)).size,8);
  assert.equal(new Set(RPG_NPCS.map(n=>n.role)).size,10);
});

test('all eight story chapters advance in order and preserve one of two permanent endings', () => {
  const story=require('../dist/rpg/story-service');const p=profileSvc.createRpgProfile();
  const levels=[1,5,15,25,35,45,55,65];const choices=['koru_incele','yemini_koru','koku_dinle','ocagi_onar','isigi_paylas','muhru_yenile','atesi_dindir','dengeyi_koru'];
  for(let i=0;i<levels.length;i++){
    p.characterLevel=levels[i];const chapter=story.getAvailableStory(p)[0];assert.ok(chapter,`chapter ${i+1}`);
    assert.equal(story.chooseStory(p,chapter.id,choices[i]).ok,true);
  }
  assert.equal(p.storyEnding,'balance');
  assert.equal(story.getAvailableStory(p).length,0);
});

test('NPC merchants sell common stock infinitely, limit rare stock and buy player items at half price', () => {
  const shop=require('../dist/rpg/npc-market-service');const state=shop.createNpcShopState();const p=profileSvc.createRpgProfile();const wallet={coins:10000};
  const bought=shop.buyFromNpc(state,p,wallet,'baslangic_duzlugu','sert_agac',5,1000);
  assert.equal(bought.ok,true);assert.equal(bought.stock,null);assert.equal(wallet.coins,10000-5*RPGItemPrice('sert_agac'));
  const rare=shop.buyFromNpc(state,p,wallet,'baslangic_duzlugu','nadir_kristal',20,2000);
  assert.equal(rare.ok,true);assert.equal(rare.stock,0);
  assert.equal(shop.buyFromNpc(state,p,wallet,'baslangic_duzlugu','nadir_kristal',1,3000).reason,'out_of_stock');
  const sold=shop.sellToNpc(state,p,wallet,'baslangic_duzlugu','sert_agac',2,4000);
  assert.equal(sold.ok,true);assert.equal(sold.unitPrice,Math.floor(RPGItemPrice('sert_agac')*0.5));
  const restocked=shop.buyFromNpc(state,p,wallet,'baslangic_duzlugu','nadir_kristal',1,86_402_001);
  assert.equal(restocked.ok,true);
});
function RPGItemPrice(id){return require('../dist/rpg/data/items').RPG_ITEMS[id].basePrice;}

test('creature tracking requires observations before research and records hunting knowledge', () => {
  const research=require('../dist/rpg/creature-research-service');const p=profileSvc.createRpgProfile();
  assert.equal(research.trackCreature(p,'bozkir_kurdu','baslangic_duzlugu',1000).observations,1);
  assert.equal(research.trackCreature(p,'bozkir_kurdu','baslangic_duzlugu',2000).reason,'tracking_cooldown');
  assert.equal(research.trackCreature(p,'bozkir_kurdu','baslangic_duzlugu',301001).observations,2);
  research.recordCreatureVictory(p,'bozkir_kurdu',302000);
  assert.equal(research.getCreatureResearch(p,'bozkir_kurdu').kills,1);
  const result=research.researchCreature(p,'bozkir_kurdu');
  assert.equal(result.ok,true);assert.equal(result.researched,true);assert.match(result.clue,/Saldırı/);
});

test('aggressive creature abilities apply poison and status damage over subsequent turns', () => {
  const p=profileSvc.createRpgProfile();p.characterLevel=100;p.stats.strength=1;p.stats.vitality=1;
  const combat=require('../dist/rpg/combat-service');
  assert.equal(combat.startCombat(p,'zehirli_bitki','p1',1000).ok,true);
  const first=combat.combatTurn(p,'p1','defend',()=>0,3000);
  assert.equal(first.ok,true);assert.equal(first.enemyAbility,'zehirli_diken');
  assert.ok(p.activeBattle.statuses.some(status=>status.id==='poisoned'));
  const before=p.activeBattle.playerHealth;
  combat.combatTurn(p,'p1','defend',()=>0,5000);
  assert.ok(p.activeBattle.playerHealth<before);
  assert.equal(p.activeBattle.statuses.filter(status=>status.id==='poisoned').length,1);
});

test('all nine regions have a settlement with valid notable NPCs', () => {
  const { RPG_REGIONS }=require('../dist/rpg/data/world');
  const { RPG_SETTLEMENTS }=require('../dist/rpg/data/settlements');
  const { RPG_NPCS }=require('../dist/rpg/npc-service');
  assert.equal(RPG_SETTLEMENTS.length,9);
  for(const region of RPG_REGIONS){
    const settlement=RPG_SETTLEMENTS.find(item=>item.id===region.settlementId);
    assert.ok(settlement,`${region.id} settlement`);
    assert.equal(settlement.regionId,region.id);
    for(const npcId of settlement.notableNpcIds){const npc=RPG_NPCS.find(item=>item.id===npcId);assert.ok(npc,`${settlement.id} NPC ${npcId}`);assert.equal(npc.regionId,region.id,`${npcId} region`);}
  }
});

test('eight faith traditions each reference an existing ancient power and holy lore remains geographically grounded', () => {
  const { RPG_ANCIENT_POWERS,RPG_ANCIENT_CULTURES,RPG_FAITH_TRADITIONS }=require('../dist/rpg/data/lore');
  const { RPG_REGIONS }=require('../dist/rpg/data/world');const regionIds=new Set(RPG_REGIONS.map(r=>r.id));
  const powerIds=new Set(RPG_ANCIENT_POWERS.map(p=>p.id));
  assert.equal(RPG_FAITH_TRADITIONS.length,8);
  for(const faith of RPG_FAITH_TRADITIONS)assert.ok(powerIds.has(faith.powerId),`${faith.id} power`);
  for(const culture of RPG_ANCIENT_CULTURES)for(const region of culture.regionIds)assert.ok(regionIds.has(region),`${culture.id} region ${region}`);
});
