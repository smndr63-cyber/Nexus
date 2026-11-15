const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('season reset clears only RPG data once while preserving Discord and economy data', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-season-reset-'));
  const file = path.join(dir, 'database.json');

  const old = {
    guild: {
      config: {
        prefix: '!',
        commandRoles: {},
        commandUsers: {},
        logChannels: {},
        ignoredChannels: [],
        ignoredRoles: [],
        levelIgnoredChannels: [],
        levelIgnoredRoles: [],
        customCommands: {},
        economyName: 'Nexus Ekonomisi',
        currency: '◈',
        xpMin: 2,
        xpMax: 4,
        cooldown: 45000
      },
      users: {
        player: {
          xp: 1234,
          level: 12,
          messages: 345,
          voiceSeconds: 678,
          coins: 9876,
          bank: 5432,
          warnings: 2,
          lastXp: 10,
          lastDaily: 20,
          lastWeekly: 30,
          lastWork: 40,
          dailyStreak: 5,
          inventory: ['legacy_item'],
          rpg: { characterLevel: 77, items: ['old'] },
          activeBet: { game: 'dice', amount: 100, created: 50 }
        }
      },
      cases: [{ id: 1 }],
      reactionRoles: [],
      giveaways: [],
      reminders: [],
      customCommands: {},
      stats: { player: { messages: 345, voiceSeconds: 678 } },
      rpg: { marketListings: { old: { id: 'old' } } },
      rpgSchemaVersion: 1
    }
  };

  fs.writeFileSync(file, JSON.stringify(old));

  const run = (code) => {
    const result = spawnSync(
      process.execPath,
      ['-e', code],
      {
        encoding: 'utf8',
        env: { ...process.env, DATA_DIR: dir }
      }
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
  };

  try {
    run("const db=require('./dist/lib/db');db.guild('guild');db.persist();");

    let migrated = JSON.parse(fs.readFileSync(file, 'utf8')).guild;
    let user = migrated.users.player;

    assert.equal(user.rpg, undefined);
    assert.deepEqual(user.inventory, ['legacy_item']);
    assert.equal(user.coins, 9876);
    assert.equal(user.bank, 5432);
    assert.deepEqual(user.activeBet, { game: 'dice', amount: 100, created: 50 });
    assert.equal(user.xp, 1234);
    assert.equal(user.level, 12);
    assert.equal(user.messages, 345);
    assert.equal(user.voiceSeconds, 678);
    assert.equal(user.warnings, 2);
    assert.equal(user.lastXp, 10);
    assert.equal(user.lastDaily, 20);
    assert.equal(user.lastWeekly, 30);
    assert.equal(user.dailyStreak, 5);
    assert.equal(user.lastWork, 40);
    assert.deepEqual(migrated.rpg, undefined);
    assert.equal(migrated.rpgSchemaVersion, 2);
    assert.deepEqual(migrated.cases, [{ id: 1 }]);
    assert.deepEqual(migrated.stats.player, {
      messages: 345,
      voiceSeconds: 678
    });

    // New-season progress must survive later restarts.
    migrated.users.player.coins = 555;
    migrated.users.player.bank = 222;
    migrated.users.player.inventory = ['new_item'];
    migrated.users.player.rpg = { characterLevel: 2 };
    migrated.rpg = { marketListings: { new: { id: 'new' } } };
    fs.writeFileSync(file, JSON.stringify({ guild: migrated }));

    run("const db=require('./dist/lib/db');db.guild('guild');db.persist();");

    migrated = JSON.parse(fs.readFileSync(file, 'utf8')).guild;
    user = migrated.users.player;

    assert.equal(user.coins, 555);
    assert.equal(user.bank, 222);
    assert.deepEqual(user.inventory, ['new_item']);
    assert.deepEqual(user.rpg, { characterLevel: 2 });
    assert.equal(migrated.rpg.marketListings.new.id, 'new');
    assert.equal(migrated.rpgSchemaVersion, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});