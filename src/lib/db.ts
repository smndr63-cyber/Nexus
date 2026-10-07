import fs from 'node:fs';
import path from 'node:path';

export type GuildConfig = {
  prefix:string; commandRoles:Record<string,string[]>; commandUsers:Record<string,string[]>; logChannels:Record<string,string>; ignoredChannels:string[]; ignoredRoles:string[];
  levelIgnoredChannels:string[]; levelIgnoredRoles:string[]; welcome?:{channel:string; message:string; dm?:string};
  leave?:{channel:string; message:string}; autorole?:{member?:string; bot?:string}; aiChannel?:string; customCommands:Record<string,string>;
  botName?:string; tempVoice?:{lobby:string; category?:string}; ticket?:{category?:string; supportRole?:string; complaintRole?:string; supportCategory?:string; complaintCategory?:string; panelChannel?:string}; features?:{ai:boolean;music:boolean};
  economyName:string; currency:string; xpMin:number; xpMax:number; cooldown:number;
};
export type UserData={xp:number; level:number; messages:number; voiceSeconds:number; coins:number; bank:number; warnings:number; lastXp:number; lastDaily:number; lastWeekly:number; lastWork:number; afk?:string; inventory:string[]};
export type GuildData={config:GuildConfig; users:Record<string,UserData>; cases:any[]; reactionRoles:any[]; giveaways:any[]; reminders:any[]; customCommands:Record<string,string>; starboard?:{channel:string;threshold:number}; stats:Record<string,{messages:number;voiceSeconds:number}>};
const dir=path.resolve(process.env.DATA_DIR||'./data'); if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,'database.json');
const defaults=():GuildData=>({config:{prefix:process.env.PREFIX||'!',commandRoles:{},commandUsers:{},logChannels:{},ignoredChannels:[],ignoredRoles:[],levelIgnoredChannels:[],levelIgnoredRoles:[],customCommands:{},features:{ai:false,music:true},economyName:'Nexus Ekonomisi',currency:'◈',xpMin:8,xpMax:18,cooldown:60000},users:{},cases:[],reactionRoles:[],giveaways:[],reminders:[],customCommands:{},stats:{}});
let db:Record<string,GuildData>={};
try{if(fs.existsSync(file))db=JSON.parse(fs.readFileSync(file,'utf8'));}catch{db={};}
let timer:NodeJS.Timeout|undefined;
function save(){clearTimeout(timer);timer=setTimeout(()=>fs.writeFileSync(file,JSON.stringify(db,null,2)),150);}
export function guild(id:string){if(!db[id]){db[id]=defaults();save();} return db[id];}
export function user(gid:string,uid:string){const g=guild(gid);if(!g.users[uid])g.users[uid]={xp:0,level:0,messages:0,voiceSeconds:0,coins:100,bank:0,warnings:0,lastXp:0,lastDaily:0,lastWeekly:0,lastWork:0,inventory:[]};return g.users[uid];}
export function mutate(fn:()=>void){fn();save();}
export function persist(){save();}

