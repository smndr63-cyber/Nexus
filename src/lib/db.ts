import fs from 'node:fs';
import path from 'node:path';
import type { RpgProfileData } from '../rpg/types';

export type GuildConfig = {
  prefix:string; commandRoles:Record<string,string[]>; commandUsers:Record<string,string[]>; logChannels:Record<string,string>; ignoredChannels:string[]; ignoredRoles:string[];
  levelIgnoredChannels:string[]; levelIgnoredRoles:string[]; levelChannel?:string; welcome?:{channel:string; message:string; dm?:string};
  leave?:{channel:string; message:string}; autorole?:{member?:string; bot?:string}; aiChannel?:string; customCommands:Record<string,string>;
  botName?:string; tempVoice?:{lobby:string; category?:string}; ticket?:{category?:string; supportRole?:string; complaintRole?:string; supportCategory?:string; complaintCategory?:string; panelChannel?:string}; features?:{ai:boolean;music:boolean};
  economyName:string; currency:string; xpMin:number; xpMax:number; cooldown:number;
};


export type UserData={xp:number; level:number; messages:number; voiceSeconds:number; coins:number; bank:number; warnings:number; lastXp:number; lastDaily:number; lastWeekly:number; lastWork:number; dailyStreak?:number; afk?:string; activeBet?:{game:string;amount:number;created:number}; inventory:string[]; rpg?:RpgProfileData; [key:string]:any};
export type GuildData={config:GuildConfig; users:Record<string,UserData>; cases:any[]; reactionRoles:any[]; giveaways:any[]; reminders:any[]; customCommands:Record<string,string>; starboard?:{channel:string;threshold:number}; stats:Record<string,{messages:number;voiceSeconds:number}>; rpg?:Record<string,any>; rpgSchemaVersion?:number; [key:string]:any};
const dir=path.resolve(process.env.DATA_DIR||'./data');
if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,'database.json');
const defaults=():GuildData=>({config:{prefix:process.env.PREFIX||'!',commandRoles:{},commandUsers:{},logChannels:{},ignoredChannels:[],ignoredRoles:[],levelIgnoredChannels:[],levelIgnoredRoles:[],customCommands:{},features:{ai:false,music:true},economyName:'Nexus Ekonomisi',currency:'◈',xpMin:2,xpMax:4,cooldown:45000},users:{},cases:[],reactionRoles:[],giveaways:[],reminders:[],customCommands:{},stats:{},rpgSchemaVersion:1});
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
  // One-time reset for the new RPG schema. Economy and Discord data stay untouched.
  if((g.rpgSchemaVersion??0)<1){
    for(const u of Object.values(g.users)){
      delete u.rpg;
    }
    delete g.rpg;
    g.rpgSchemaVersion=1;
  }

  for(const u of Object.values(g.users)){
    u.inventory??=[];
  }
}
for(const g of Object.values(db))migrateGuild(g);
if(Object.keys(db).length>0)save();
export function refundInterruptedBets(){
  const pending:{u:UserData;coins:number;bet:NonNullable<UserData['activeBet']>}[]=[];
  for(const g of Object.values(db)){
    for(const u of Object.values(g.users)){
      const bet=u.activeBet;
      if(!bet)continue;
      if(!Number.isSafeInteger(bet.amount)||bet.amount<=0){
        console.error('KRİTİK: Geçersiz yarım bahis kaydı; Nexus güvenlik nedeniyle açılmayacak.');
        throw new Error('Geçersiz yarım bahis kaydı bulundu.');
      }
      if(!Number.isSafeInteger(u.coins)||u.coins<0||!Number.isSafeInteger(u.coins+bet.amount)){
        console.error('KRİTİK: Kesilen bahis güvenli biçimde iade edilemedi; Nexus güvenlik nedeniyle açılmayacak.');
        throw new Error('Yarım bahis güvenli biçimde iade edilemedi.');
      }
      pending.push({u,coins:u.coins,bet});
    }
  }
  if(!pending.length)return 0;
  if(timer){clearTimeout(timer);timer=undefined;}
  for(const item of pending){
    item.u.coins+=item.bet.amount;
    delete item.u.activeBet;
  }
  try{
    atomicWrite();
  }catch(error){
    for(const item of pending){
      item.u.coins=item.coins;
      item.u.activeBet=item.bet;
    }
    timer=setTimeout(()=>{try{atomicWrite();}catch(e){console.error('Veritabanı kaydedilemedi; mevcut dosya korunuyor.',e);}},150);
    throw error;
  }
  return pending.length;
}
export function guild(id:string){if(!db[id]){db[id]=defaults();save();}else migrateGuild(db[id]);return db[id];}
export function user(gid:string,uid:string){const g=guild(gid);if(!g.users[uid]){g.users[uid]={xp:0,level:0,messages:0,voiceSeconds:0,coins:100,bank:0,warnings:0,lastXp:0,lastDaily:0,lastWeekly:0,lastWork:0,inventory:[]};save();}return g.users[uid];}
export function mutate(fn:()=>void){fn();save();}
export function persist(){if(timer){clearTimeout(timer);timer=undefined;}atomicWrite();}
