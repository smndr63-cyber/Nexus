import fs from 'node:fs';
import path from 'node:path';

export type GuildConfig = {
  prefix:string; commandRoles:Record<string,string[]>; commandUsers:Record<string,string[]>; logChannels:Record<string,string>; ignoredChannels:string[]; ignoredRoles:string[];
  levelIgnoredChannels:string[]; levelIgnoredRoles:string[]; levelChannel?:string; welcome?:{channel:string; message:string; dm?:string};
  leave?:{channel:string; message:string}; autorole?:{member?:string; bot?:string}; aiChannel?:string; customCommands:Record<string,string>;
  botName?:string; tempVoice?:{lobby:string; category?:string}; ticket?:{category?:string; supportRole?:string; complaintRole?:string; supportCategory?:string; complaintCategory?:string; panelChannel?:string}; features?:{ai:boolean;music:boolean};
  economyName:string; currency:string; xpMin:number; xpMax:number; cooldown:number;
};
export type RPGWeapon={id:string;name:string;kind:string;rarity:string;level:number;attack:number;special?:string};
export type RPGState={profession?:string;professionLevel:number;professionXp:number;lastWork:number;items:Record<string,number>;weapons:RPGWeapon[];armor?:any[];equippedWeapon?:string;equipment:Record<string,string>;lastBattle:number;wins:number;losses:number};
export type UserData={xp:number; level:number; messages:number; voiceSeconds:number; coins:number; bank:number; warnings:number; lastXp:number; lastDaily:number; lastWeekly:number; lastWork:number; afk?:string; inventory:string[]; rpg?:RPGState; [key:string]:any};
export type GuildData={config:GuildConfig; users:Record<string,UserData>; cases:any[]; reactionRoles:any[]; giveaways:any[]; reminders:any[]; customCommands:Record<string,string>; starboard?:{channel:string;threshold:number}; stats:Record<string,{messages:number;voiceSeconds:number}>; rpg?:{boss?:any;marketListings?:any[]}; [key:string]:any};
const dir=path.resolve(process.env.DATA_DIR||'./data');
if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,'database.json');
const defaults=():GuildData=>({config:{prefix:process.env.PREFIX||'!',commandRoles:{},commandUsers:{},logChannels:{},ignoredChannels:[],ignoredRoles:[],levelIgnoredChannels:[],levelIgnoredRoles:[],customCommands:{},features:{ai:false,music:true},economyName:'Nexus Ekonomisi',currency:'◈',xpMin:2,xpMax:4,cooldown:45000},users:{},cases:[],reactionRoles:[],giveaways:[],reminders:[],customCommands:{},stats:{},rpg:{marketListings:[]}});
let db:Record<string,GuildData>={};
if(!fs.existsSync(file) && process.env.REQUIRE_EXISTING_DATABASE==='true'){throw new Error(`KORUMA: ${file} bulunamadı. Boş veritabanıyla devam edilmiyor; canlı veritabanı kalıcı depolamaya bağlanmalı.`);}
if(fs.existsSync(file)){
  try { const parsed=JSON.parse(fs.readFileSync(file,'utf8')); if(!parsed || typeof parsed!=='object' || Array.isArray(parsed)) throw new Error('Veritabanı kök yapısı geçersiz.'); db=parsed; }
  catch(error){ console.error(`KRİTİK: ${file} okunamadı. Boş veritabanıyla devam edilmeyecek; mevcut dosyayı koruyun.`,error); throw error; }
  if(process.env.REQUIRE_EXISTING_DATABASE==='true' && Object.keys(db).length===0)throw new Error(`KORUMA: ${file} boş. Canlı veritabanı bağlanmadan bot başlatılmayacak.`);
}
let timer:NodeJS.Timeout|undefined;
function atomicWrite(){
  const temp=`${file}.tmp`;
  fs.writeFileSync(temp,JSON.stringify(db,null,2));
  fs.renameSync(temp,file);
}
function save(){
  if(timer)clearTimeout(timer);
  timer=setTimeout(()=>{try{atomicWrite();}catch(e){console.error('Veritabanı kaydedilemedi; geçici dosya ve mevcut veritabanı korunuyor.',e);}},150);
}
function migrateGuild(g:GuildData){
  // Add missing fields only. Existing user stats, settings and histories are never replaced.
  g.config??=defaults().config;
  g.config.commandRoles??={}; g.config.commandUsers??={}; g.config.logChannels??={};
  g.config.ignoredChannels??=[]; g.config.ignoredRoles??=[]; g.config.levelIgnoredChannels??=[]; g.config.levelIgnoredRoles??=[]; g.config.customCommands??={};
  g.users??={}; g.cases??=[]; g.reactionRoles??=[]; g.giveaways??=[]; g.reminders??=[]; g.customCommands??={}; g.stats??={};
  g.rpg??={marketListings:[]}; g.rpg.marketListings??=[];
  for(const u of Object.values(g.users)){
    u.inventory??=[];
    // RPG data is additive; do not alter legacy coins, XP, levels, warnings or activity counters.
    u.rpg??={professionLevel:1,professionXp:0,lastWork:0,items:{},weapons:[],armor:[],equipment:{},lastBattle:0,wins:0,losses:0};
    u.rpg.items??={}; u.rpg.weapons??=[]; u.rpg.armor??=[]; u.rpg.equipment??={};
    u.rpg.professionLevel??=1; u.rpg.professionXp??=0; u.rpg.lastWork??=0; u.rpg.lastBattle??=0; u.rpg.wins??=0; u.rpg.losses??=0;
  }
}
for(const g of Object.values(db))migrateGuild(g);
if(Object.keys(db).length>0)save();
export function guild(id:string){if(!db[id]){db[id]=defaults();save();}else migrateGuild(db[id]);return db[id];}
export function user(gid:string,uid:string){const g=guild(gid);if(!g.users[uid]){g.users[uid]={xp:0,level:0,messages:0,voiceSeconds:0,coins:100,bank:0,warnings:0,lastXp:0,lastDaily:0,lastWeekly:0,lastWork:0,inventory:[],rpg:{professionLevel:1,professionXp:0,lastWork:0,items:{},weapons:[],armor:[],equipment:{},lastBattle:0,wins:0,losses:0}};save();}else{const u=g.users[uid];u.rpg??={professionLevel:1,professionXp:0,lastWork:0,items:{},weapons:[],armor:[],equipment:{},lastBattle:0,wins:0,losses:0};u.rpg.items??={};u.rpg.weapons??=[];u.rpg.armor??=[];u.rpg.equipment??={};}return g.users[uid];}
export function mutate(fn:()=>void){fn();save();}
export function persist(){if(timer){clearTimeout(timer);timer=undefined;}atomicWrite();}
