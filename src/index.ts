// @ts-nocheck
import 'dotenv/config';
import path from 'node:path';
import {
 Client, GatewayIntentBits, Partials, Collection, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction,
 Message, PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder,
 StringSelectMenuInteraction, ButtonInteraction, UserSelectMenuInteraction, UserSelectMenuBuilder, RoleSelectMenuInteraction, RoleSelectMenuBuilder, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle,
 GuildMember, ChannelType, TextChannel, VoiceChannel, AuditLogEvent,
 ActivityType, User, Role, Guild, WebhookClient
} from 'discord.js';
import {guild,user,mutate,persist,refundInterruptedBets} from './lib/db';
import { RPG_PROFESSIONS } from './rpg/data/professions';
import { getSpecializationChangeFee } from './rpg/specialization-fees';
import { changeMainSpecialization } from './rpg/specialization-service';
import { ensureRpgProfile, addCharacterXp, addProfessionXp, xpForMasteryLevel } from './rpg/profile-service';
import { addItem, countItem, removeItem, equipItem, unequipItem } from './rpg/inventory-service';
import { getWorldMap, travelToRegion } from './rpg/world-service';
import { availableQuests, startQuest, advanceQuest, syncQuestMilestones } from './rpg/quest-service';
import { getNpc, getNpcsInRegion } from './rpg/npc-service';
import { getAvailableStory, chooseStory } from './rpg/story-service';
import { startCombat, combatTurn } from './rpg/combat-service';
import { getRegion } from './rpg/data/world';
import { getRpgItem } from './rpg/data/items';
import { RPG_ANCIENT_POWERS, RPG_ANCIENT_CULTURES, RPG_FAITH_TRADITIONS } from './rpg/data/lore';
import { createGroup, inviteToGroup, acceptGroupInvite, leaveGroup } from './rpg/group-service';
import { createListing, buyListing, cancelListing } from './rpg/market-service';
import { craftItem } from './rpg/crafting-service';
import { createWorldBossState, startWorldBoss, attackWorldBoss } from './rpg/world-boss-service';
import { startProfessionBoss, professionBossTurn } from './rpg/profession-boss-service';
import { allocateStatPoints } from './rpg/character-service';
import { claimDailyStreak } from './lib/daily-streak';
import { createNpcShopState, buyFromNpc, sellToNpc } from './rpg/npc-market-service';
import { trackCreature, researchCreature, getCreatureResearch } from './rpg/creature-research-service';
import { getProfessionBossTier, getProfessionBoss } from './rpg/data/bosses';
import { getActiveInjuries, treatInjury } from './rpg/injury-service';
import { RPG_WORLD_BOSSES } from './rpg/data/bosses';
import { RPG_RECIPES } from './rpg/data/recipes';
import { adoptPet, setActivePet, startPetExpedition, claimPetExpedition, feedPet, listPetSpecies } from './rpg/pet-service';
import {ignored,isStaff,formatDuration,parseDuration,clean} from './lib/utils';
import {askAI} from './lib/ai';
import {playTrack,queue as musicQueue,current as musicCurrent,skip,stop,pause,resume,setVolume as musicVolume,setLoop as musicLoop,shuffle as musicShuffle,remove as musicRemove,initMusic} from './lib/music';

const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMessageReactions,GatewayIntentBits.GuildVoiceStates],partials:[Partials.Message,Partials.Channel,Partials.Reaction]});

type Ctx={interaction?:ChatInputCommandInteraction;message?:Message;member:GuildMember;guild:Guild;args:string[]};
type Cmd={name:string;description:string;builder?:()=>any;execute:(c:Ctx)=>Promise<any>;aliases?:string[];staff?:boolean;admin?:boolean};
const tempRoomOwners=new Map<string,string>();
const tempRoomPanel=new Map<string,string>();
const tempRoomControls=new Map<string,string>();
const permissionSessions=new Map<string,{guildId:string;targetType:'user'|'role';targetId:string;targetIds:string[];category?:string;action?:'add'|'remove'|'view'}>();
const ticketClaims=new Map<string,string>();
const levelResetSessions=new Map<string,{guildId:string;adminId:string}>();
const specializationSessions=new Map<string,any>();
const commands=new Collection<string,Cmd>();
const ownerIds=new Set((process.env.OWNER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean));
const voiceStarts=new Map<string,number>();
const gameCooldowns=new Map<string,number>();
const MAX_BET=150000;
const activeBetGames=new Map<string,string>();
const technicalRefundBetKeys=new Set<string>();
const coinflipGames=new Map<string,{amount:number;created:number}>();
const diceGames=new Map<string,{amount:number;created:number}>();
const blackjackGames=new Map<string,{bet:number;deck:string[];player:string[];dealer:string[];created:number}>();
const recentMessages=new Map<string,{t:number;count:number}>();
function add(c:Cmd){commands.set(c.name,c);(c.aliases||[]).forEach(a=>commands.set(a,c));}
const reply=(c:Ctx,content:any,ephemeral=false)=>{
 if(c.interaction){
  const payload=typeof content==='string'?{embeds:[embed('⚔️ NEXUS',content)]}:content;
  if(ephemeral)return c.interaction.reply({...payload,flags:MessageFlags.Ephemeral});
  return c.interaction.reply(payload);
 }
 const payload=typeof content==='string'?{embeds:[embed('⚔️ NEXUS',content)]}:content;
 if(c.message?.deleted) return c.message.channel.send(payload);
 return c.message?.reply(payload);
};
const embed=(title:string,description:string,color=0x5865f2)=>new EmbedBuilder().setAuthor({name:'⚔️ NEXUS'}).setTitle(title).setDescription(description).setColor(color).setFooter({text:'NEXUS • Discord Sunucu Yönetim Sistemi'}).setTimestamp();
function member(c:Ctx,option='user'){return c.interaction?.options.getMember(option) as GuildMember||c.member;}
function num(c:Ctx,name:string,def=0){const x=c.interaction?.options.getInteger(name);return x ?? (Number(c.args.shift())||def);}
function str(c:Ctx,name:string){const x=c.interaction?.options.getString(name);return x ?? (c.args.shift()||'');}
function channel(c:Ctx,name='channel'){const slash=c.interaction?.options.getChannel(name) as any;if(slash)return slash;if(c.message){const raw=(c.args[0]||'').trim();const id=raw.match(/^<#(\d+)>$/)?.[1]||raw.match(/^(\d{15,25})$/)?.[1];if(id){const found=c.guild.channels.cache.get(id);if(found){c.args.shift();return found;}}return c.message.channel as any;}return c.guild.channels.cache.get(c.args.shift()||'');}
function role(c:Ctx,name='role'){return c.interaction?.options.getRole(name) as Role||c.guild.roles.cache.get(c.args.shift()||'') as Role;}
function userOpt(c:Ctx,name='user'){
 const slash=c.interaction?.options.getUser(name); if(slash)return slash;
 const raw=(c.args.shift()||'').trim(); const id=raw.match(/^<@!?(\d+)>$/)?.[1]||raw.match(/^(\d{15,25})$/)?.[1];
 if(id){const cached=c.guild.members.cache.get(id)?.user;if(cached)return cached; const cachedUser=client.users.cache.get(id);if(cachedUser)return cachedUser;}
 return c.member.user;
}

const base=(name:string,description:string)=>new SlashCommandBuilder().setName(name).setDescription(description);
function staffCmd(name:string,description:string,fn:(c:Ctx)=>Promise<any>,builder?:()=>any,aliases?:string[]){add({name,description,staff:true,execute:fn,builder:()=>builder?builder():base(name,description),aliases});}
function adminCmd(name:string,description:string,fn:(c:Ctx)=>Promise<any>,builder?:()=>any){add({name,description,admin:true,execute:fn,builder:builder||(()=>base(name,description).setDefaultMemberPermissions(PermissionFlagsBits.Administrator))});}
function canonicalCommandName(command:string){const aliases:Record<string,string>={sil:'purge',clear:'purge'};return aliases[command]||command;}
function hasNEXUSGrant(m:GuildMember,command:string){const cfg=guild(m.guild.id).config;const key=canonicalCommandName(command);const users=cfg.commandUsers?.[key]||[];const roles=cfg.commandRoles?.[key]||[];return users.includes(m.id)||roles.some(r=>m.roles.cache.has(r));}
const commandPermissions:Record<string,bigint>={clear:PermissionFlagsBits.ManageMessages,sil:PermissionFlagsBits.ManageMessages,purge:PermissionFlagsBits.ManageMessages,kick:PermissionFlagsBits.KickMembers,ban:PermissionFlagsBits.BanMembers,timeout:PermissionFlagsBits.ModerateMembers,untimeout:PermissionFlagsBits.ModerateMembers,warn:PermissionFlagsBits.ModerateMembers,warnings:PermissionFlagsBits.ModerateMembers,lock:PermissionFlagsBits.ManageChannels,unlock:PermissionFlagsBits.ManageChannels,slowmode:PermissionFlagsBits.ManageChannels,prefix:PermissionFlagsBits.ManageGuild,ignore:PermissionFlagsBits.ManageGuild,'level-ignore':PermissionFlagsBits.ManageGuild,'seviye-kanal':PermissionFlagsBits.ManageGuild,autorole:PermissionFlagsBits.ManageRoles,rolver:PermissionFlagsBits.ManageRoles,rolal:PermissionFlagsBits.ManageRoles,'role-info':PermissionFlagsBits.ManageRoles,'channel-info':PermissionFlagsBits.ManageChannels,'özel-kanal':PermissionFlagsBits.ManageChannels,tempvoice:PermissionFlagsBits.ManageChannels,custom:PermissionFlagsBits.ManageGuild,embed:PermissionFlagsBits.ManageMessages,say:PermissionFlagsBits.ManageMessages,log:PermissionFlagsBits.ManageGuild,rr:PermissionFlagsBits.ManageRoles,giveaway:PermissionFlagsBits.ManageGuild};
function canUseCommand(m:GuildMember,cmd:Cmd){if(cmd.name==='paraekle')return ownerIds.has(m.id);if(cmd.admin)return m.permissions.has(PermissionFlagsBits.Administrator);if(m.permissions.has(PermissionFlagsBits.Administrator))return true;if(hasNEXUSGrant(m,cmd.name))return true;if(cmd.staff){const required=commandPermissions[cmd.name];return required?m.permissions.has(required):isStaff(m);}return true;}
function commandPermissionBuilder(name:string,description:string,perm?:bigint){let b=base(name,description);if(perm)b=b.setDefaultMemberPermissions(perm);return b;}
function visibleCommand(m:GuildMember,cmd:Cmd){return canUseCommand(m,cmd);}
function simple(name:string,description:string,fn:(c:Ctx)=>Promise<any>,builder?:()=>any,aliases?:string[]){add({name,description,execute:fn,builder:builder||(()=>base(name,description)),aliases});}

// RPG CORE
simple('rpg-profil','RPG karakterinin genel durumunu gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id); const profile=ensureRpgProfile(wallet.rpg); wallet.rpg=profile; persist();
 const level=profile.characterLevel||1; const xp=profile.characterXp||0;
 const professionLines=Object.entries(profile.professions||{}).map(([id,p])=>{const def=RPG_PROFESSIONS.find(x=>x.id===id);return `• **${def?.name||id}:** ${p.level}. seviye (${p.xp} XP)`;});
 const mainSpec=profile.mainSpecialization?RPG_PROFESSIONS.find(p=>p.id===profile.mainSpecialization!.professionId)?.specializations.find(s=>s.id===profile.mainSpecialization!.specializationId)?.name:'Seçilmedi';
 const pet=profile.pets?.find(x=>x.id===profile.activePetId);
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🧭 NEXUS | Maceracı Profili').setDescription(`**${c.member.displayName}**\nKarakter seviyesi: **${level}** • XP: **${xp}**\nBölge: **${profile.currentRegionId||'Bilinmiyor'}**\nGüç ${profile.stats?.strength||5} • Dayanıklılık ${profile.stats?.vitality||5} • Çeviklik ${profile.stats?.agility||5} • Zekâ ${profile.stats?.intelligence||5} • Dağıtılabilir puan ${profile.stats?.points||0}\nCüzdan: **${wallet.coins.toLocaleString('tr-TR')} ◈** • Banka: **${wallet.bank.toLocaleString('tr-TR')} ◈**\nPet: **${pet?.name||'Yok'}**\nAna uzmanlık: **${mainSpec}**\nUstalık: **${profile.masteryLevel||0}** • Ustalık XP: **${profile.masteryXp||0}** • Ustalık puanı: **${profile.masteryPoints||0}**`).addFields({name:'Meslek Gelişimi',value:professionLines.join('\n')||'Meslek verisi yok.'}).setTimestamp()]});
});
simple('envanter','RPG envanterini gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);wallet.rpg=profile;persist();
 const lines=(profile.itemInstances||[]).slice(0,35).map(item=>{const def=getRpgItem(item.definitionId);return `• **${def?.name||item.definitionId}** ×${item.quantity} • Kimlik: \`${item.id}\``;});
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x3498db).setTitle('🎒 NEXUS | Envanter').setDescription(lines.join('\n')||'Envanterin boş.').setFooter({text:`Toplam ${profile.itemInstances?.length||0} eşya yığını`})]});
});
simple('kusak','Envanterindeki bir ekipman örneğini kuşanır.',async c=>{
 const instanceId=str(c,'esya');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=equipItem(profile,instanceId);
 if(!result.ok)return reply(c,({item_not_found:'Bu eşya bulunamadı.',not_equippable:'Bu eşya kuşanabilir değil.',level_too_low:'Karakter seviyen yetersiz.',profession_required:'Gerekli meslek seviyesi yetersiz.',specialization_required:'Gerekli uzmanlaşmaya sahip değilsin.',active_pet_required:'Pet ekipmanı kuşanmak için aktif bir pet seçmelisin.'} as any)[result.reason]||'Eşya kuşanılamadı.',true);
 wallet.rpg=profile;persist();return reply(c,'🛡️ Ekipman kuşanıldı.');
},()=>base('kusak','Envanterindeki bir ekipman örneğini kuşanır.').addStringOption(o=>o.setName('esya').setDescription('Envanterde görünen eşya kimliği').setRequired(true)));
simple('ekipman-cikar','Seçili ekipman yuvasını boşaltır.',async c=>{
 const slot=str(c,'yuva');const type=str(c,'tur')==='pet';const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=unequipItem(profile,slot as any,type);
 if(!result.ok)return reply(c,'Bu ekipman yuvası zaten boş veya geçersiz.',true);
 wallet.rpg=profile;persist();return reply(c,`Ekipman yuvası **${slot}** boşaltıldı.`);
},()=>base('ekipman-cikar','Seçili ekipman yuvasını boşaltır.').addStringOption(o=>o.setName('yuva').setDescription('Boşaltılacak ekipman yuvası').setRequired(true).addChoices({name:'Silah',value:'weapon'},{name:'Miğfer',value:'helmet'},{name:'Göğüs',value:'chest'},{name:'Pantolon',value:'pants'},{name:'Eldiven',value:'gloves'},{name:'Çizme',value:'boots'},{name:'Pelerin',value:'cloak'},{name:'Kalkan',value:'shield'},{name:'Kolye',value:'necklace'},{name:'Yüzük',value:'ring'},{name:'Kemer',value:'belt'},{name:'Tılsım',value:'charm'},{name:'Pet Tasması',value:'pet_collar'},{name:'Pet Zırhı',value:'pet_armor'},{name:'Pet Tılsımı',value:'pet_talisman'})).addStringOption(o=>o.setName('tur').setDescription('Oyuncu veya aktif pet ekipmanı').addChoices({name:'Oyuncu',value:'player'},{name:'Pet',value:'pet'})));
simple('harita','Bölgeleri, kilitleri ve mevcut konumunu gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);wallet.rpg=profile;persist();
 const lines=getWorldMap(profile).map(r=>`${r.current?'📍':r.discovered?'🗺️':r.unlocked?'🔓':'🔒'} **${r.name}** — ${r.settlement?.name||'Yerleşim yok'} • Tehdit ${r.dangerLevel}/8 • Önerilen seviye ${r.recommendedLevel}${r.unlocked?'':' • Kilitli'}\nBağlantılar: ${r.connectedRegions.map(id=>getRegion(id)?.name||id).join(', ')}${r.connected?' • Buradan gidilebilir':''}`).join('\n');
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x2ecc71).setTitle('🗺️ NEXUS | Dünya Haritası').setDescription(lines).setFooter({text:'Yeni bölgeler karakter gelişimi ve hikâye ilerlemesiyle açılır.'})]});
});
simple('seyahat','Açılmış bir bölgeye seyahat eder.',async c=>{
 const regionId=str(c,'bolge');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=travelToRegion(profile,regionId);
 if(!result.ok)return reply(c,({unknown_region:'Bölge bulunamadı.',region_locked:'Bu bölge henüz açılmadı.',not_connected:'Bu bölgeye doğrudan geçiş yok; haritadaki bağlantılı bölge üzerinden ilerlemelisin.',travel_cooldown:'Bu yolculuk için bekleme süren henüz dolmadı.'} as any)[result.reason]||'Seyahat başarısız.',true);
 for(const [questId,q] of Object.entries(profile.quests||{}))if(q.status==='active'){const qr=advanceQuest(profile,questId,'discover',regionId,1);if(qr.ok&&qr.completed&&qr.rewards)wallet.coins+=qr.rewards.coins;}wallet.rpg=profile;persist();return reply(c,`🧭 **${regionId}** bölgesine ulaştın.`);
},()=>base('seyahat','Açılmış bir bölgeye seyahat eder.').addStringOption(o=>o.setName('bolge').setDescription('Bölge kimliği').setRequired(true)));
simple('kesif','Bulunduğun bölgede kaynak arar.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const region=getRegion(profile.currentRegionId||'baslangic_duzlugu');
 if(!region)return reply(c,'Geçerli bölge bulunamadı.',true);
 const candidates=region.resources.filter(id=>!!getRpgItem(id));if(!candidates.length)return reply(c,'Bu bölgede toplanabilir kaynak yok.',true);
 const itemId=candidates[Math.floor(Math.random()*candidates.length)];const quantity=1+Math.floor(Math.random()*2);const result=addItem(profile,itemId,quantity,`exploration:${region.id}`);
 if(!result.ok)return reply(c,'Kaynak envantere eklenemedi.',true);
 const profession=RPG_PROFESSIONS.find(p=>p.primaryResources.includes(itemId));let professionText='';
 if(profession){const gained=addProfessionXp(profile,profession.id,8+quantity*2);professionText=`\n**${profession.name}:** +${gained?.gained||0} meslek XP`;const p=profile.professions?.[profession.id];if(p){p.statistics=p.statistics||{};p.statistics.itemsGathered=(p.statistics.itemsGathered||0)+quantity;}}
 for(const [questId,q] of Object.entries(profile.quests||{}))if(q.status==='active'){const qResult=advanceQuest(profile,questId,'collect',itemId,quantity);if(qResult.ok&&qResult.completed&&qResult.rewards)wallet.coins+=qResult.rewards.coins;}
 wallet.rpg=profile;persist();return reply(c,`🔎 Keşif başarılı! **${getRpgItem(itemId)?.name||itemId} ×${quantity}** buldun.${professionText}`);
});
simple('gorevler','Alınabilir ve devam eden görevlerini gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);wallet.rpg=profile;persist();
 const available=availableQuests(profile).slice(0,10).map(q=>`🟢 **${q.id} — ${q.name}**\n${q.description}`).join('\n');
 const active=Object.values(profile.quests||{}).filter(q=>q.status==='active').map(q=>`🟡 **${q.questId}** — ${Object.values(q.progress).reduce((a,b)=>a+b,0)} hedef ilerlemesi`).join('\n');
 return reply(c,{embeds:[new EmbedBuilder().setColor(0xf1c40f).setTitle('📜 NEXUS | Görev Defteri').addFields({name:'Alınabilir Görevler',value:(available||'Yeni görev bulunmuyor.').slice(0,1024)},{name:'Devam Eden Görevler',value:(active||'Aktif görevin yok.').slice(0,1024)})]});
});
simple('gorev-al','Uygun bir görevi başlatır.',async c=>{
 const questId=str(c,'gorev');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=startQuest(profile,questId);
 if(!result.ok)return reply(c,({unknown_quest:'Görev bulunamadı.',quest_locked_or_completed:'Görev henüz uygun değil veya tamamlandı.',already_active:'Bu görev zaten aktif.',cooldown:'Tekrar görevi için bekleme süren dolmadı.'} as any)[result.reason]||'Görev başlatılamadı.',true);
 wallet.rpg=profile;persist();return reply(c,`📜 **${questId}** görevi günlüğüne eklendi.`);
},()=>base('gorev-al','Uygun bir görevi başlatır.').addStringOption(o=>o.setName('gorev').setDescription('Görev kimliği').setRequired(true)));
simple('npc','Bulunduğun bölgedeki NPC karakterlerini gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);wallet.rpg=profile;persist();
 const npcs=getNpcsInRegion(profile.currentRegionId||'baslangic_duzlugu');
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x9b59b6).setTitle('🧑‍🤝‍🧑 NEXUS | Bölge Sakinleri').setDescription(npcs.map(n=>`**${n.name}** — ${n.role} • ${n.settlementName||'Yerleşim'}\n${n.description}\nHizmetler: ${n.services.join(', ')}`).join('\n\n')||'Bu bölgede tanınan NPC yok.')]});
});
simple('hikaye','Açık ana hikâye bölümünü gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);wallet.rpg=profile;persist();const chapter=getAvailableStory(profile)[0];
 if(!chapter){if(profile.storyEnding)return reply(c,`📜 Ana hikâye tamamlandı. Sonun: **${profile.storyEnding==='balance'?'Sekiz Gücün Dengesi':'Yeni Kadim Yemin'}**. Seçimin kalıcı olarak kaydedildi.`);return reply(c,'Şu anda yeni bir hikâye bölümü açılmadı.');}
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x8e44ad).setTitle('📖 '+chapter.title).setDescription(chapter.description+'\n\n'+chapter.choices.map(x=>`• **${x.id}** — ${x.label}`).join('\n')).setFooter({text:'Seçim yapmak için /hikaye-sec komutunu kullan.'})]});
});
simple('hikaye-sec','Hikâye bölümünde kalıcı bir seçim yapar.',async c=>{
 const chapterId=str(c,'bolum');const choiceId=str(c,'secim');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=chooseStory(profile,chapterId,choiceId);
 if(!result.ok)return reply(c,'Bu seçim geçersiz, kilitli veya daha önce yapılmış.',true);
 wallet.rpg=profile;persist();return reply(c,'📖 Seçimin kaydedildi. Hikâye ilerleyişini etkileyecek.');
},()=>base('hikaye-sec','Hikâye bölümünde kalıcı bir seçim yapar.').addStringOption(o=>o.setName('bolum').setDescription('Bölüm kimliği').setRequired(true)).addStringOption(o=>o.setName('secim').setDescription('Seçim kimliği').setRequired(true)));
simple('yaratik-izle','Bulunduğun bölgedeki yaratığın izini sürer veya araştırır.',async c=>{
 const creatureId=str(c,'yaratik');const action=str(c,'eylem');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const regionId=profile.currentRegionId||'baslangic_duzlugu';
 const result=action==='iz_sur'?trackCreature(profile,creatureId,regionId):action==='arastir'?researchCreature(profile,creatureId):{ok:true,...getCreatureResearch(profile,creatureId)};
 if(!result.ok)return reply(c,({creature_not_here:'Bu yaratığın izi bulunduğun bölgede yok.',tracking_cooldown:'Bu yaratığın izini yakın zamanda sürdün; yeniden incelemek için beş dakika bekle.',unknown_creature:'Yaratık bulunamadı.',already_researched:'Bu yaratık hakkında araştırman zaten tamam.',more_observations_required:'Araştırma için en az üç gözlem veya av kaydı gerekli.'} as any)[result.reason]||'Yaratık araştırması başarısız.',true);
 wallet.rpg=profile;persist();return reply(c,{embeds:[new EmbedBuilder().setColor(0x16a085).setTitle('🔎 Yaratık Araştırması').setDescription(`**${creatureId}**\nGözlem: **${result.observations}/3** • Av: **${result.kills}**\nAraştırma: **${result.researched?'Tamamlandı':'Devam ediyor'}**\n${result.clue||'Henüz ayrıntılı bulgu yok.'}${result.researched?'\n\nSavaşta %10 hasar ve ganimet şansı avantajı kazanırsın.':''}`)]});
},()=>base('yaratik-izle','Bulunduğun bölgedeki yaratığın izini sürer veya araştırır.').addStringOption(o=>o.setName('yaratik').setDescription('Yaratık kimliği').setRequired(true)).addStringOption(o=>o.setName('eylem').setDescription('İz sür, araştır veya durum').setRequired(true).addChoices({name:'İz sür',value:'iz_sur'},{name:'Araştır',value:'arastir'},{name:'Durum',value:'durum'})));
simple('avla','Bulunduğun bölgedeki bir yaratıkla savaş başlatır.',async c=>{
 const creatureId=str(c,'yaratik');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const region=getRegion(profile.currentRegionId||'baslangic_duzlugu');
 if(!region?.creatures.includes(creatureId))return reply(c,'Bu yaratık bulunduğun bölgede bulunmuyor.',true);
 const result=startCombat(profile,creatureId,c.member.id);if(!result.ok)return reply(c,({battle_active:'Zaten devam eden bir savaşın var.',unknown_creature:'Yaratık bulunamadı.',creature_too_strong:'Bu yaratık seviyenin çok üzerinde.'} as any)[result.reason]||'Savaş başlatılamadı.',true);
 wallet.rpg=profile;persist();return reply(c,{embeds:[new EmbedBuilder().setColor(0xe74c3c).setTitle('⚔️ Savaş Başladı: '+result.battle.opponentName).setDescription(`Rakip canı: **${result.battle.opponentHealth}/${result.battle.maxOpponentHealth}**\nSenin canın: **${result.battle.playerHealth}/${result.battle.maxPlayerHealth}**\nHamle için /savas-hamle komutunu kullan.`)]});
},()=>base('avla','Bulunduğun bölgedeki bir yaratıkla savaş başlatır.').addStringOption(o=>o.setName('yaratik').setDescription('Yaratık kimliği').setRequired(true)));
simple('savas-hamle','Devam eden savaşta hamle yapar.',async c=>{
 const action=str(c,'hamle') as 'attack'|'defend'|'flee';if(!['attack','defend','flee'].includes(action))return reply(c,'Hamle geçersiz.',true);
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=combatTurn(profile,c.member.id,action);
 if(!result.ok)return reply(c,({battle_not_found:'Aktif savaşın bulunmuyor.',battle_expired:'Savaş süresi doldu.',opponent_missing:'Rakip artık mevcut değil.',profession_boss_requires_command:'Meslek bossu için /meslek-boss-hamle komutunu kullan.'} as any)[result.reason]||'Hamle gerçekleştirilemedi.',true);
 wallet.rpg=profile;if(result.state==='won'&&result.rewards){wallet.coins+=result.rewards.coins;for(const [questId,q] of Object.entries(profile.quests||{}))if(q.status==='active'){const qr=advanceQuest(profile,questId,'defeat',result.battle.opponentId,1);if(qr.ok&&qr.completed&&qr.rewards)wallet.coins+=qr.rewards.coins;}for(const qr of syncQuestMilestones(profile))if(qr.ok&&qr.rewards)wallet.coins+=qr.rewards.coins;}persist();
 const status=result.state==='won'?`🏆 Zafer! **${result.rewards?.xp||0} XP** ve **${result.rewards?.coins||0} ◈** kazandın.\n${result.rewards?.drops.map(d=>`${d.itemId} ×${d.quantity}`).join(', ')||'Ek ganimet yok.'}`:result.state==='lost'?'💀 Yenildin.':action==='flee'?'🏃 Savaştan kaçtın.':`Verdiğin hasar: **${result.damage}**\nRakip canı: **${result.battle.opponentHealth}/${result.battle.maxOpponentHealth}**\nSenin canın: **${result.battle.playerHealth}/${result.battle.maxPlayerHealth}**${result.enemyAbility?`\nRakip yeteneği: **${result.enemyAbility}**`:''}${result.battle.statuses.length?`\nDurum etkileri: ${result.battle.statuses.map(x=>x.id).join(', ')}`:''}`;
 return reply(c,{embeds:[new EmbedBuilder().setColor(result.state==='won'?0x2ecc71:result.state==='lost'?0x7f8c8d:0xe67e22).setTitle('⚔️ '+result.battle.opponentName).setDescription(status)]});
},()=>base('savas-hamle','Devam eden savaşta hamle yapar.').addStringOption(o=>o.setName('hamle').setDescription('Saldır, savun veya kaç').setRequired(true).addChoices({name:'Saldır',value:'attack'},{name:'Savun',value:'defend'},{name:'Kaç',value:'flee'})));

// MULTIPLAYER & PLAYER MARKET
simple('grup-kur','Dört kişiye kadar geçici macera grubu kurar.',async c=>{
 const data=guild(c.guild.id);data.rpg=data.rpg||{};data.rpg.groups=data.rpg.groups||{};
 const result=createGroup(data.rpg.groups,c.guild.id,c.member.id);if(!result.ok)return reply(c,'Zaten bir macera grubundasın.',true);
 persist();return reply(c,`🤝 Macera grubun kuruldu. Grup kimliği: \`${result.group.id}\`\nEn fazla 3 oyuncu daha davet edebilirsin.`);
});
simple('grup-davet','Macera grubuna bir oyuncu davet eder.',async c=>{
 const target=userOpt(c,'hedef');if(target.bot||target.id===c.member.id)return reply(c,'Geçerli bir oyuncu seç.',true);
 const data=guild(c.guild.id);data.rpg=data.rpg||{};data.rpg.groups=data.rpg.groups||{};
 const group=Object.values(data.rpg.groups).find((g:any)=>g.members?.some((m:any)=>m.userId===c.member.id)) as any;
 if(!group)return reply(c,'Önce /grup-kur komutuyla grup kurmalısın.',true);
 if(Object.values(data.rpg.groups).some((g:any)=>g.members?.some((m:any)=>m.userId===target.id)))return reply(c,'Bu oyuncu zaten başka bir macera grubunda.',true);
 const result=inviteToGroup(group,c.member.id,target.id);if(!result.ok)return reply(c,({leader_only:'Yalnızca grup lideri davet gönderebilir.',group_full:'Grup en fazla dört oyuncu olabilir.',already_member:'Bu oyuncu zaten grupta.',invite_exists:'Bu oyuncunun zaten geçerli daveti var.'} as any)[result.reason]||'Davet gönderilemedi.',true);
 persist();const dmSent=await target.send(`🤝 **NEXUS Macera Grubu Daveti**\n<@${c.member.id}> seni bir macera grubuna davet etti.\nGrup kimliği: \`${group.id}\`\nDavet iki dakika geçerli. Katılmak için sunucuda \`/grup-kabul grup:${group.id}\` komutunu kullan.`).then(()=>true).catch(()=>false);return reply(c,`📨 ${target} oyuncusu davet edildi. Davet **2 dakika** geçerli. Grup kimliği: \`${group.id}\`${dmSent?'\nDavet özel mesajla da iletildi.':'\nÖzel mesaj gönderilemedi; grup kimliğini oyuncuya ilet.'}`);
},()=>base('grup-davet','Macera grubuna bir oyuncu davet eder.').addUserOption(o=>o.setName('hedef').setDescription('Davet edilecek oyuncu').setRequired(true)));
simple('grup-kabul','Bir macera grubu davetini kabul eder.',async c=>{
 const groupId=str(c,'grup');const data=guild(c.guild.id);data.rpg=data.rpg||{};data.rpg.groups=data.rpg.groups||{};
 const result=acceptGroupInvite(data.rpg.groups,groupId,c.member.id);if(!result.ok)return reply(c,({group_not_found:'Grup bulunamadı.',already_in_group:'Zaten başka bir gruptasın.',invite_expired:'Geçerli davetin bulunmuyor veya süresi dolmuş.',group_full:'Grup artık dolu.'} as any)[result.reason]||'Gruba katılamadın.',true);
 persist();return reply(c,`🤝 **${result.group.leaderId}** liderliğindeki gruba katıldın. (${result.group.members.length}/4)`);
},()=>base('grup-kabul','Bir macera grubu davetini kabul eder.').addStringOption(o=>o.setName('grup').setDescription('Davet mesajındaki grup kimliği').setRequired(true)));
simple('gruptan-ayril','Mevcut macera grubundan ayrılır.',async c=>{
 const data=guild(c.guild.id);const groups=data.rpg?.groups||{};const group=Object.values(groups).find((g:any)=>g.members?.some((m:any)=>m.userId===c.member.id)) as any;
 if(!group)return reply(c,'Herhangi bir grupta değilsin.',true);
 const result=leaveGroup(groups,group.id,c.member.id);if(!result.ok)return reply(c,'Gruptan ayrılamadın.',true);
 persist();return reply(c,'Macera grubundan ayrıldın. Lider ayrıldıysa liderlik devredildi.');
});
simple('pazar-ilan','Envanterindeki eşyayı oyuncu pazarında satışa çıkarır.',async c=>{
 const itemId=str(c,'esya');const quantity=num(c,'adet',1);const price=num(c,'fiyat',0);
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);
 const data=guild(c.guild.id);data.rpg=data.rpg||{};data.rpg.marketListings=data.rpg.marketListings||{};
 const result=createListing(data.rpg.marketListings,c.member.id,profile,itemId,quantity,price);
 if(!result.ok)return reply(c,({not_tradeable:'Bu eşya takas edilemez.',invalid_listing:'Adet veya birim fiyat geçersiz.',insufficient_items:'Bu kadar eşyan yok.'} as any)[result.reason]||'İlan oluşturulamadı.',true);
 wallet.rpg=profile;persist();return reply(c,`🏷️ İlan oluşturuldu. Kimlik: \`${result.listing!.id}\` • ${quantity} adet • Birim fiyat ${price.toLocaleString('tr-TR')} ◈`);
},()=>base('pazar-ilan','Envanterindeki eşyayı oyuncu pazarında satışa çıkarır.').addStringOption(o=>o.setName('esya').setDescription('Eşya kimliği').setRequired(true)).addIntegerOption(o=>o.setName('adet').setDescription('Satılacak adet').setRequired(true).setMinValue(1).setMaxValue(999)).addIntegerOption(o=>o.setName('fiyat').setDescription('Birim fiyat').setRequired(true).setMinValue(1).setMaxValue(10000000)));
simple('pazar','Aktif oyuncu pazarı ilanlarını listeler.',async c=>{
 const listings=Object.values(guild(c.guild.id).rpg?.marketListings||{}) as any[];const now=Date.now();
 const active=listings.filter(x=>x.expiresAt>now).slice(0,15);
 return reply(c,{embeds:[new EmbedBuilder().setColor(0xf1c40f).setTitle('🏪 NEXUS | Oyuncu Pazarı').setDescription(active.map(x=>`**${getRpgItem(x.itemId)?.name||x.itemId}** ×${x.quantity}\nBirim: **${x.unitPrice.toLocaleString('tr-TR')} ◈** • Satıcı: <@${x.sellerId}>\nİlan: \`${x.id}\``).join('\n\n')||'Şu anda aktif ilan yok.').setFooter({text:'Satın almak için /pazar-al komutunu kullan.'})]});
});
simple('pazar-al','Oyuncu pazarındaki bir ilanı satın alır.',async c=>{
 const listingId=str(c,'ilan');const data=guild(c.guild.id);data.rpg=data.rpg||{};data.rpg.marketListings=data.rpg.marketListings||{};
 const listing=data.rpg.marketListings[listingId];if(!listing)return reply(c,'İlan bulunamadı.',true);
 const buyer=user(c.guild.id,c.member.id);const seller=user(c.guild.id,listing.sellerId);const buyerProfile=ensureRpgProfile(buyer.rpg);
 const before={buyerCoins:buyer.coins,sellerCoins:seller.coins,buyerRpg:buyer.rpg,listing:{...listing}};
 const result=buyListing(data.rpg.marketListings,listingId,c.member.id,buyerProfile,buyer.coins);
 if(!result.ok)return reply(c,({own_listing:'Kendi ilanını satın alamazsın.',listing_expired:'İlanın süresi dolmuş.',insufficient_coins:'Yeterli ◈ bakiyen yok.',listing_not_found:'İlan bulunamadı.'} as any)[result.reason]||'Satın alma başarısız.',true);
 const tax=Math.floor(result.total!*0.05);buyer.coins-=result.total!;seller.coins+=result.total!-tax;buyer.rpg=buyerProfile;
 try{persist();}catch(error){buyer.coins=before.buyerCoins;seller.coins=before.sellerCoins;buyer.rpg=before.buyerRpg;data.rpg.marketListings[listingId]=before.listing;throw error;}
 return reply(c,`✅ Eşyayı **${result.total!.toLocaleString('tr-TR')} ◈** karşılığında aldın. Pazar vergisi: **${tax} ◈**.`);
},()=>base('pazar-al','Oyuncu pazarındaki bir ilanı satın alır.').addStringOption(o=>o.setName('ilan').setDescription('İlan kimliği').setRequired(true)));

simple('pazar-iptal','Kendi pazar ilanını iptal edip eşyayı geri alır.',async c=>{
 const listingId=str(c,'ilan');const data=guild(c.guild.id);const listings=data.rpg?.marketListings||{};const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);
 const result=cancelListing(listings,listingId,c.member.id,profile);if(!result.ok)return reply(c,({listing_not_found:'İlan bulunamadı.',not_owner:'Bu ilan sana ait değil.'} as any)[result.reason]||'İlan iptal edilemedi.',true);
 wallet.rpg=profile;persist();return reply(c,'↩️ İlan iptal edildi ve eşya envanterine iade edildi.');
},()=>base('pazar-iptal','Kendi pazar ilanını iptal edip eşyayı geri alır.').addStringOption(o=>o.setName('ilan').setDescription('İlan kimliği').setRequired(true)));
simple('tarifler','Meslek üretim tariflerini listeler.',async c=>{
 const professionId=str(c,'meslek');const profession=RPG_PROFESSIONS.find(p=>p.id===professionId);if(!profession)return reply(c,'Meslek bulunamadı. Meslek kimliğini kontrol et.',true);
 const lines=RPG_RECIPES.filter(r=>r.profession===professionId).map(r=>`• **${r.name}** — \`${r.id}\` • Seviye ${r.requiredLevel}${r.requiredMastery?` • Ustalık ${r.requiredMastery}`:''}${r.specialization?` • Dal ${r.specialization} ${r.requiredSpecializationLevel||1}/3`:''}`);
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x1abc9c).setTitle('📘 '+profession.name+' | Tarifler').setDescription(lines.join('\n')||'Bu meslek için kayıtlı tarif yok.')]});
},()=>base('tarifler','Meslek üretim tariflerini listeler.').addStringOption(o=>o.setName('meslek').setDescription('Meslek kimliği').setRequired(true)));
simple('uret','Öğrendiğin tarifle eşya üretir.',async c=>{
 const recipeId=str(c,'tarif');const quantity=num(c,'adet',1);const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=craftItem(profile,recipeId,quantity);
 if(!result.ok)return reply(c,({unknown_recipe:'Tarif bulunamadı.',profession_missing:'Meslek verisi bulunamadı.',profession_level_low:'Meslek seviyen yetersiz.',mastery_low:'Ustalık seviyen yetersiz.',wrong_specialization:'Bu tarif için doğru ana uzmanlığa sahip değilsin.',specialization_level_low:'Uzmanlaşma dalı seviyen bu tarif için yetersiz.',recipe_locked:'Bu tarifi henüz öğrenmedin.',invalid_quantity:'Üretim adedi 1-20 arasında olmalı.',invalid_output_item:'Tarifin çıktı eşyası geçersiz.'} as any)[result.reason]||`Üretim başarısız: ${result.reason}`,true);
 for(const [questId,q] of Object.entries(profile.quests||{}))if(q.status==='active'){const qr=advanceQuest(profile,questId,'craft',result.outputItemId,quantity);if(qr.ok&&qr.completed&&qr.rewards)wallet.coins+=qr.rewards.coins;if(result.quality>=80){const master=advanceQuest(profile,questId,'craft','masterwork',1);if(master.ok&&master.completed&&master.rewards)wallet.coins+=master.rewards.coins;}}for(const qr of syncQuestMilestones(profile))if(qr.ok&&qr.rewards)wallet.coins+=qr.rewards.coins;wallet.rpg=profile;persist();return reply(c,`🔨 **${getRpgItem(result.outputItemId)?.name||result.outputItemId} ×${result.quantity}** üretildi. Kalite: **${result.quality}/100** • Meslek XP: **+${result.xpGained}**`);
},()=>base('uret','Öğrendiğin tarifle eşya üretir.').addStringOption(o=>o.setName('tarif').setDescription('Tarif kimliği').setRequired(true)).addIntegerOption(o=>o.setName('adet').setDescription('Üretim adedi').setMinValue(1).setMaxValue(20)));
// PET COMPANIONS
simple('petler','Petlerini, durumlarını ve tür kataloğunu gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);wallet.rpg=profile;persist();
 const lines=(profile.pets||[]).map(p=>`**${p.name}** (${p.speciesId}) • Seviye ${p.level} • Can ${p.health} • Enerji ${p.energy} • Açlık ${p.hunger} • ${p.status} • \`${p.id}\``);
 const catalog=listPetSpecies().map(p=>`• **${p.name}** — ${p.rarity}: ${p.description}`).join('\n');
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x27ae60).setTitle('🐾 NEXUS | Yoldaşların').setDescription(lines.join('\n')||'Henüz bir pet edinmedin.').addFields({name:'Tür Kataloğu',value:catalog.slice(0,1024)})]});
});
simple('pet-edin','Pet türleri arasından bir yoldaş edinir.',async c=>{
 const speciesId=str(c,'tur');const name=str(c,'isim');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);
 const species=listPetSpecies().find(p=>p.id===speciesId);if(!species)return reply(c,'Pet türü bulunamadı.',true);
 // Rare and higher rarity companions require the matching rare egg; common/quality companions require a pet meat offering.
 const offering=species.rarity==='legendary'||species.rarity==='mythic'?'efsanevi_yumurta':species.rarity==='epic'?'boss_ozu':'pet_et';const offeringQuantity=species.rarity==='epic'?2:species.rarity==='rare'?5:species.rarity==='quality'?3:1;
 const consumed=removeItem(profile,offering,offeringQuantity);if(!consumed.ok)return reply(c,`Bu yoldaşı edinmek için **${getRpgItem(offering)?.name||offering} ×${offeringQuantity}** gerekiyor.`,true);
 const result=adoptPet(profile,speciesId,name||undefined);if(!result.ok){addItem(profile,offering,offeringQuantity,'pet_adoption_refund');return reply(c,'Pet sınırına ulaştın veya tür bulunamadı.',true);}
 wallet.rpg=profile;persist();return reply(c,`🐾 **${result.pet!.name}** artık yoldaşın! Kullanılan eşya: ${getRpgItem(offering)?.name||offering}.`);
},()=>base('pet-edin','Pet türleri arasından bir yoldaş edinir.').addStringOption(o=>o.setName('tur').setDescription('Pet tür kimliği').setRequired(true)).addStringOption(o=>o.setName('isim').setDescription('Petin adı').setMaxLength(24)));
simple('pet-besle','Petine envanterindeki yiyeceklerden verir.',async c=>{
 const petId=str(c,'pet');const foodId=str(c,'yiyecek');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=feedPet(profile,petId,foodId);
 if(!result.ok)return reply(c,({pet_not_found:'Pet bulunamadı.',not_hungry:'Petin şu anda aç değil.',food_missing:'Bu yiyecek envanterinde yok.'} as any)[result.reason]||'Pet beslenemedi.',true);
 wallet.rpg=profile;persist();return reply(c,`🍖 **${result.pet!.name}** beslendi. Açlık: **${result.pet!.hunger}/100** • Bağ: **${result.pet!.bond}/100**`);
},()=>base('pet-besle','Petine envanterindeki yiyeceklerden verir.').addStringOption(o=>o.setName('pet').setDescription('Pet kimliği').setRequired(true)).addStringOption(o=>o.setName('yiyecek').setDescription('Yiyecek eşya kimliği').setRequired(true)));
simple('pet-aktif','Bir peti aktif yoldaşın yapar.',async c=>{
 const petId=str(c,'pet');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=setActivePet(profile,petId);
 if(!result.ok)return reply(c,'Pet bulunamadı veya şu anda kullanılamıyor.',true);
 wallet.rpg=profile;persist();return reply(c,`🐾 **${result.pet!.name}** artık aktif yoldaşın.`);
},()=>base('pet-aktif','Bir peti aktif yoldaşın yapar.').addStringOption(o=>o.setName('pet').setDescription('Pet kimliği').setRequired(true)));
simple('pet-sefer','Petini keşif seferine gönderir.',async c=>{
 const petId=str(c,'pet');const regionId=str(c,'bolge');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=startPetExpedition(profile,petId,regionId);
 if(!result.ok)return reply(c,({pet_or_region_missing:'Pet veya bölge bulunamadı.',pet_unavailable:'Petin yeterli enerjiye sahip değil ya da şu anda kullanılamıyor.',region_not_discovered:'Önce bu bölgeyi keşfetmelisin.',expedition_active:'Bu pet zaten seferde.'} as any)[result.reason]||'Sefer başlatılamadı.',true);
 const expedition=profile.petExpeditions!.find(x=>x.petId===petId&&x.status==='active')!;wallet.rpg=profile;persist();return reply(c,`🧭 **${result.pet!.name}** keşfe çıktı. Sefer kimliği: \`${expedition.id}\` • Bitiş: <t:${Math.floor(expedition.completesAt/1000)}:R>`);
},()=>base('pet-sefer','Petini keşif seferine gönderir.').addStringOption(o=>o.setName('pet').setDescription('Pet kimliği').setRequired(true)).addStringOption(o=>o.setName('bolge').setDescription('Keşfedilmiş bölge kimliği').setRequired(true)));
simple('pet-sefer-al','Tamamlanan pet keşif seferinin ganimetini alır.',async c=>{
 const expeditionId=str(c,'sefer');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=claimPetExpedition(profile,expeditionId);
 if(!result.ok)return reply(c,({expedition_missing:'Sefer bulunamadı.',already_claimed:'Bu sefer zaten tamamlanmış.',not_ready:'Sefer henüz bitmedi.',pet_or_region_missing:'Pet veya bölge verisi bulunamadı.'} as any)[result.reason]||'Ganimet alınamadı.',true);
 wallet.rpg=profile;persist();return reply(c,`🎒 **${result.pet!.name}** seferden döndü. Ganimet: ${result.rewards?.map(x=>`${x.itemId} ×${x.quantity}`).join(', ')||'Bu kez eşya bulamadı.'}`);
},()=>base('pet-sefer-al','Tamamlanan pet keşif seferinin ganimetini alır.').addStringOption(o=>o.setName('sefer').setDescription('Sefer kimliği').setRequired(true)));

simple('meslek-boss','Mesleğine ait kademeli boss ile karşılaşır.',async c=>{
 const professionId=str(c,'meslek');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=startProfessionBoss(profile,professionId,c.member.id);
 if(!result.ok)return reply(c,({already_in_combat:'Başka bir savaşın devam ediyor.',unknown_profession:'Meslek veya meslek bossu bulunamadı.',tier_locked:'Bu boss kademesi için meslek seviyesi ya da ustalığın yetersiz.',cooldown:'Bu meslek bossuna yeniden meydan okumak için beklemelisin.'} as any)[result.reason]||'Meslek bossu başlatılamadı.',true);
 wallet.rpg=profile;persist();return reply(c,`⚔️ **${result.battle.opponentName}** karşında! Canı: **${result.battle.opponentHealth}**. Hamle için /meslek-boss-hamle komutunu kullan.`);
},()=>base('meslek-boss','Mesleğine ait kademeli boss ile karşılaşır.').addStringOption(o=>o.setName('meslek').setDescription('Meslek kimliği').setRequired(true)));
simple('meslek-boss-hamle','Meslek bossu savaşında hamle yapar.',async c=>{
 const action=str(c,'hamle') as 'attack'|'defend'|'flee';if(!['attack','defend','flee'].includes(action))return reply(c,'Hamle geçersiz.',true);
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=professionBossTurn(profile,c.member.id,action);
 if(!result.ok)return reply(c,({boss_battle_not_found:'Aktif meslek bossu savaşın bulunmuyor.',battle_expired:'Savaş süresi doldu.',turn_cooldown:'Yeni hamle için biraz bekle.'} as any)[result.reason]||'Hamle başarısız.',true);
 if(result.state==='won'){for(const [questId,q] of Object.entries(profile.quests||{}))if(q.status==='active'){const qr=advanceQuest(profile,questId,'defeat','boss:'+result.battle.opponentId.split(':')[1],1);if(qr.ok&&qr.completed&&qr.rewards)wallet.coins+=qr.rewards.coins;}for(const qr of syncQuestMilestones(profile))if(qr.ok&&qr.rewards)wallet.coins+=qr.rewards.coins;}wallet.rpg=profile;persist();
 const text=result.state==='won'?`🏆 Zafer! **${result.rewards?.xp} karakter XP** ve **${result.rewards?.professionXp} meslek XP** kazandın.\n${result.rewards?.items.map(x=>`${x.itemId} ×${x.quantity}`).join(', ')||'Ek ganimet yok.'}`:result.state==='lost'?'💀 Yenildin. Yaralanmalarını kontrol et.':result.state==='fled'?'🏃 Savaştan çekildin.':`Verdiğin hasar: **${result.damage}**\nBoss canı: **${result.battle.opponentHealth}/${result.battle.maxOpponentHealth}**\nSenin canın: **${result.battle.playerHealth}/${result.battle.maxPlayerHealth}**`;
 return reply(c,{embeds:[new EmbedBuilder().setColor(result.state==='won'?0x2ecc71:result.state==='lost'?0xe74c3c:0xe67e22).setTitle('⚔️ '+result.battle.opponentName).setDescription(text)]});
},()=>base('meslek-boss-hamle','Meslek bossu savaşında hamle yapar.').addStringOption(o=>o.setName('hamle').setDescription('Saldır, savun veya kaç').setRequired(true).addChoices({name:'Saldır',value:'attack'},{name:'Savun',value:'defend'},{name:'Kaç',value:'flee'})));
simple('bosslar','Bölgesel dünya bosslarını ve gereksinimlerini listeler.',async c=>{
 const lines=RPG_WORLD_BOSSES.map(b=>`**${b.name}** — ${b.regionId}\nSeviye ${b.minCharacterLevel} • Grup ${b.minPartySize}-${Math.min(4,b.maxPartySize)} kişi\nÇağırma: ${b.summonRequirements.map(x=>`${x.itemId} ×${x.quantity}`).join(', ')}`).join('\n\n');
 return reply(c,{embeds:[new EmbedBuilder().setColor(0xc0392b).setTitle('🐉 NEXUS | Dünya Bossları').setDescription(lines.slice(0,4000))]});
});
simple('boss-cagir','Grup lideri olarak bölgesel dünya bossunu çağırır.',async c=>{
 const bossId=str(c,'boss');const data=guild(c.guild.id);data.rpg=data.rpg||{};data.rpg.worldBossState=data.rpg.worldBossState||createWorldBossState();const group=Object.values(data.rpg.groups||{}).find((g:any)=>g.leaderId===c.member.id) as any;
 if(!group)return reply(c,'Dünya bossu çağırmak için dört kişiye kadar bir macera grubu kurmalı ve lider olmalısın.',true);
 const profiles:Record<string,any>={};for(const m of group.members){const wallet=user(c.guild.id,m.userId);profiles[m.userId]=ensureRpgProfile(wallet.rpg);}
 const result=startWorldBoss(data.rpg.worldBossState,bossId,group,profiles);
 if(!result.ok)return reply(c,({unknown_boss:'Dünya bossu bulunamadı.',party_size:'Grup üye sayısı bu boss için uygun değil.',boss_cooldown:'Bu bossun çağırma bekleme süresi dolmadı.',level_required:'Grubundaki herkes gerekli karakter seviyesine ulaşmış olmalı.',wrong_region:'Bütün grup üyeleri bossun bulunduğu bölgede olmalı.',member_in_combat:'Grup üyelerinden biri başka bir savaşta.',leader_profile_missing:'Grup liderinin karakter profili bulunamadı.'} as any)[result.reason]||`Boss çağrılamadı: ${result.reason}`,true);
 for(const [id,profile] of Object.entries(profiles))user(c.guild.id,id).rpg=profile;persist();return reply(c,`🐉 **${RPG_WORLD_BOSSES.find(b=>b.id===bossId)?.name||bossId}** çağrıldı! Grup üyeleri /boss-vur komutuyla saldırabilir.\nBoss canı: **${result.encounter.health.toLocaleString('tr-TR')}**`);
},()=>base('boss-cagir','Grup lideri olarak bölgesel dünya bossunu çağırır.').addStringOption(o=>o.setName('boss').setDescription('Boss kimliği').setRequired(true)));
simple('boss-vur','Aktif dünya bossuna saldırır.',async c=>{
 const bossId=str(c,'boss');const data=guild(c.guild.id);const state=data.rpg?.worldBossState;if(!state)return reply(c,'Aktif dünya bossu bulunamadı.',true);
 const encounter=state.encounters?.[bossId];if(!encounter)return reply(c,'Bu boss için aktif karşılaşma yok.',true);
 const profiles:Record<string,any>={};for(const id of encounter.participants)profiles[id]=ensureRpgProfile(user(c.guild.id,id).rpg);
 const result=attackWorldBoss(state,bossId,c.member.id,profiles);
 if(!result.ok)return reply(c,({encounter_missing:'Karşılaşma bulunamadı.',encounter_ended:'Boss savaşı sona ermiş.',not_participant:'Bu boss savaşına katılmıyorsun.',participant_inactive:'Savaş durumun aktif değil.',participant_defeated:'Bu savaşta yenildin.',turn_cooldown:'Yeni saldırı için birkaç saniye bekle.',encounter_expired:'Boss karşılaşmasının süresi doldu.'} as any)[result.reason]||`Saldırı başarısız: ${result.reason}`,true);
 for(const [id,profile] of Object.entries(profiles)){if(result.encounter.status==='won'){for(const [questId,q] of Object.entries(profile.quests||{}))if(q.status==='active'){const qr=advanceQuest(profile,questId,'defeat','boss:'+bossId,1);if(qr.ok&&qr.completed&&qr.rewards)user(c.guild.id,id).coins+=qr.rewards.coins;}for(const qr of syncQuestMilestones(profile))if(qr.ok&&qr.rewards)user(c.guild.id,id).coins+=qr.rewards.coins;}user(c.guild.id,id).rpg=profile;}persist();
 const phase=RPG_WORLD_BOSSES.find(b=>b.id===bossId)?.phases.find(p=>p.id===result.encounter.phaseId);
 const outcome=result.encounter.status==='won'?'🏆 Dünya bossu yenildi! Katılımcıların ödülleri karakterlerine işlendi.':result.encounter.status==='failed'?'💀 Grup yenildi; karşılaşma sona erdi.':`Verdiğin hasar: **${result.damage}**\nAldığın hasar: **${result.playerDamage}**\nBoss canı: **${result.encounter.health.toLocaleString('tr-TR')}/${result.encounter.maxHealth.toLocaleString('tr-TR')}**\nSenin canın: **${result.encounter.healthByUser[c.member.id]}**`;
 return reply(c,{embeds:[new EmbedBuilder().setColor(result.encounter.status==='won'?0x2ecc71:0xe74c3c).setTitle('🐉 '+(RPG_WORLD_BOSSES.find(b=>b.id===bossId)?.name||bossId)).setDescription(`${phase?`**Aşama:** ${phase.name}\n`:''}${outcome}`)]});
},()=>base('boss-vur','Aktif dünya bossuna saldırır.').addStringOption(o=>o.setName('boss').setDescription('Boss kimliği').setRequired(true)));
simple('yaralanmalar','Aktif karakter yaralanmalarını gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const injuries=getActiveInjuries(profile);wallet.rpg=profile;persist();
 return reply(c,{embeds:[new EmbedBuilder().setColor(0xe67e22).setTitle('🩹 NEXUS | Yaralanmalar').setDescription(injuries.map(i=>`**${i.name}** — ${i.severity}\n${i.description}\nTedavi: ${i.treatmentItemId} • Bitiş: <t:${Math.floor(i.expiresAt/1000)}:R>\nKimlik: \`${i.id}\``).join('\n\n')||'Aktif yaralanman yok.')]});
});
simple('tedavi','Uygun eşya kullanarak bir yaralanmayı tedavi eder.',async c=>{
 const injuryId=str(c,'yaralanma');const itemId=str(c,'esya');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=treatInjury(profile,injuryId,itemId);
 if(!result.ok)return reply(c,({injury_not_found:'Yaralanma bulunamadı.',wrong_treatment:'Bu yaralanma için uygun tedavi eşyası değil.',treatment_item_missing:'Gerekli tedavi eşyası envanterinde yok.'} as any)[result.reason]||'Tedavi başarısız.',true);
 wallet.rpg=profile;persist();return reply(c,`🩹 **${result.removed.name}** tedavi edildi.`);
},()=>base('tedavi','Uygun eşya kullanarak bir yaralanmayı tedavi eder.').addStringOption(o=>o.setName('yaralanma').setDescription('Yaralanma kimliği').setRequired(true)).addStringOption(o=>o.setName('esya').setDescription('Tedavi eşyası kimliği').setRequired(true)));
simple('istatistik-puan','Karakter özellik puanlarını dağıtır.',async c=>{
 const attribute=str(c,'ozellik');const amount=num(c,'puan',0);const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const result=allocateStatPoints(profile,attribute,amount);
 if(!result.ok)return reply(c,({invalid_attribute:'Özellik güç, dayanıklılık, çeviklik veya zeka olmalı.',invalid_amount:'Puan miktarı 1-100 arasında olmalı.',insufficient_points:'Yeterli dağıtılabilir özellik puanın yok.',attribute_cap:'Bu özellik 500 puan sınırına ulaşıyor.'} as any)[result.reason]||'Puan dağıtılamadı.',true);
 wallet.rpg=profile;persist();return reply(c,`📈 **${result.attribute}** özelliğine **${result.allocated}** puan eklendi. Kalan puan: **${result.remaining}**.`);
},()=>base('istatistik-puan','Karakter özellik puanlarını dağıtır.').addStringOption(o=>o.setName('ozellik').setDescription('Güç, dayanıklılık, çeviklik veya zeka').setRequired(true).addChoices({name:'Güç',value:'strength'},{name:'Dayanıklılık',value:'vitality'},{name:'Çeviklik',value:'agility'},{name:'Zekâ',value:'intelligence'})).addIntegerOption(o=>o.setName('puan').setDescription('Dağıtılacak puan').setRequired(true).setMinValue(1).setMaxValue(100)));
simple('ustalik','100. seviye sonrası sınırsız ustalık gelişimini gösterir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);wallet.rpg=profile;persist();
 return reply(c,{embeds:[new EmbedBuilder().setColor(0xf1c40f).setTitle('✨ NEXUS | Ustalık').setDescription(`Karakter seviyesi: **${profile.characterLevel||1}/100**\nUstalık seviyesi: **${profile.masteryLevel||0}**\nUstalık XP: **${profile.masteryXp||0} / ${xpForMasteryLevel(profile.masteryLevel||0)}**\nUstalık puanı: **${profile.masteryPoints||0}**\n\n**Unvanlar:** ${(profile.masteryTitles||[]).join(', ')||'Henüz kazanılmadı.'}\n**Kozmetik ödüller:** ${(profile.masteryCosmetics||[]).join(', ')||'Henüz kazanılmadı.'}`)]});
});
simple('inanc','NEXUS dünyasının sekiz inanç geleneğini ve ritüellerini anlatır.',async c=>{
 const lines=RPG_FAITH_TRADITIONS.map(f=>`**${f.name}**\n${f.belief}\nRitüel: ${f.ritual}\nYasak: ${f.taboo}\nKutsal yer: ${f.holySite}`).join('\n\n');
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x8e44ad).setTitle('🕯️ NEXUS | İnanç Gelenekleri').setDescription(lines.slice(0,4000))]});
});
simple('kadim-bilgi','NEXUS dünyasının sekiz kadim gücünü anlatır.',async c=>{
 const lines=RPG_ANCIENT_POWERS.map(p=>`${p.symbol} **${p.name}** — ${p.domain}\n_${p.teaching}_`).join('\n\n');
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x8e44ad).setTitle('✨ NEXUS | Sekiz Kadim Güç').setDescription(lines)]});
});
simple('kulturler','Kadim uygarlıkları ve kültürlerini tanıtır.',async c=>{
 const lines=RPG_ANCIENT_CULTURES.map(x=>`**${x.name}**\n${x.summary}\nDeğerler: ${x.values.join(', ')}`).join('\n\n');
 return reply(c,{embeds:[new EmbedBuilder().setColor(0x8e44ad).setTitle('🏺 NEXUS | Kadim Kültürler').setDescription(lines.slice(0,4000))]});
});
simple('npc-pazar','Bulunduğun bölgedeki tüccardan eşya alır veya ona eşya satar.',async c=>{
 const action=str(c,'islem');const itemId=str(c,'esya');const quantity=num(c,'adet',1);const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const regionId=profile.currentRegionId||'baslangic_duzlugu';
 if(!RPG_NPCS.some(n=>n.regionId===regionId&&n.role==='merchant'))return reply(c,'Bulunduğun bölgede tüccar bulunmuyor.',true);
 const data=guild(c.guild.id);data.rpg=data.rpg||{};data.rpg.npcShopState=data.rpg.npcShopState||createNpcShopState();
 const result=action==='buy'?buyFromNpc(data.rpg.npcShopState,profile,wallet,regionId,itemId,quantity):sellToNpc(data.rpg.npcShopState,profile,wallet,regionId,itemId,quantity);
 wallet.rpg=profile;persist();
 if(!result.ok)return reply(c,({unknown_item:'Bu eşya katalogda bulunmuyor.',not_tradeable:'Bu eşya NPC ticaretine uygun değil.',invalid_quantity:'Adet 1-100 arasında olmalı.',price_overflow:'İşlem tutarı güvenli sınırı aşıyor.',insufficient_coins:'Bu alışveriş için yeterli ◈ yok.',out_of_stock:'Tüccarın bu eşyadan yeterli stoğu yok.',insufficient_items:'Satmak için yeterli eşyan yok.',stock_full:'Tüccarın bu nadir eşya için deposu dolu.',balance_overflow:'Cüzdan bakiyesi güvenli sınırı aşacak.'} as any)[result.reason]||'NPC ticareti tamamlanamadı.',true);
 return reply(c,`${action==='buy'?'🛒 Satın aldın':'💰 Sattın'}: **${itemId} ×${result.quantity}**\\nBirim fiyat: **${result.unitPrice.toLocaleString('tr-TR')} ◈**\\nToplam: **${result.total.toLocaleString('tr-TR')} ◈**\\n${result.stock===null?'Stok: Sınırsız':`Kalan stok: ${result.stock}` }\\nCüzdan: **${wallet.coins.toLocaleString('tr-TR')} ◈**`);
},()=>base('npc-pazar','Bulunduğun bölgedeki tüccardan eşya alır veya ona eşya satar.').addStringOption(o=>o.setName('islem').setDescription('Alış veya satış').setRequired(true).addChoices({name:'Satın al',value:'buy'},{name:'Sat',value:'sell'})).addStringOption(o=>o.setName('esya').setDescription('Eşya kimliği').setRequired(true)).addIntegerOption(o=>o.setName('adet').setDescription('İşlem adedi').setRequired(true).setMinValue(1).setMaxValue(100)));
simple('npc-konus','Bulunduğun bölgedeki bir NPC ile konuşur.',async c=>{
 const npcId=str(c,'npc');const wallet=user(c.guild.id,c.member.id);const profile=ensureRpgProfile(wallet.rpg);const npc=getNpc(npcId);
 if(!npc||npc.regionId!==(profile.currentRegionId||'baslangic_duzlugu'))return reply(c,'Bu NPC bulunduğun bölgede değil veya bulunamadı.',true);
 let completed=0;for(const [questId,q] of Object.entries(profile.quests||{}))if(q.status==='active'){const qr=advanceQuest(profile,questId,'interact',npcId,1);if(qr.ok&&qr.completed){completed++;if(qr.rewards)wallet.coins+=qr.rewards.coins;}}
 wallet.rpg=profile;persist();return reply(c,{embeds:[new EmbedBuilder().setColor(0x9b59b6).setTitle('🗣️ '+npc.name).setDescription(`_${npc.personality}_\n\n${npc.description}\n\n**Yerleşim:** ${npc.settlementName||'Bölge'}\n**Hizmetleri:** ${npc.services.join(', ')}${completed?`\n\n📜 ${completed} görev tamamlandı.`:''}`)]});
},()=>base('npc-konus','Bulunduğun bölgedeki bir NPC ile konuşur.').addStringOption(o=>o.setName('npc').setDescription('NPC kimliği').setRequired(true)));

// GENERAL
simple('uzmanlasma','Meslek uzmanlığını seç veya değiştir.',async c=>{
 const wallet=user(c.guild.id,c.member.id);
 const profile=wallet.rpg||{};
 const current=profile.mainSpecialization;
 const count=profile.specializationChangeCount??0;
 const sessionId=Date.now().toString(36)+Math.random().toString(36).slice(2,9);
 specializationSessions.set(sessionId,{
  guildId:c.guild.id,
  userId:c.member.id,
  expectedProfessionId:current?.professionId||null,
  expectedSpecializationId:current?.specializationId||null,
  expectedCount:count,
  createdAt:Date.now()
 });
 const menu=new StringSelectMenuBuilder()
  .setCustomId('spec:profession:'+sessionId)
  .setPlaceholder('Bir meslek sec')
  .addOptions(RPG_PROFESSIONS.map(p=>({
   label:p.name.slice(0,100),
   value:p.id,
   description:p.description.slice(0,100)
  })));
 const payload={
  embeds:[new EmbedBuilder()
   .setColor(0x5865F2)
   .setTitle('NEXUS | Meslek Uzmanligi')
   .setDescription('Uzmanlasmak istedigin meslegi sec.\n\nIlk uzmanlik secimin ucretsizdir. Sonraki degisikliklerde onayli ucret tarifesi uygulanir.')],
  components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)]
 };
 if(c.interaction)return c.interaction.reply({...payload,flags:MessageFlags.Ephemeral});
 if(c.message)return c.message.reply(payload);
},()=>base('uzmanlasma','Meslek uzmanligini sec veya degistir.'),['uzmanlik']);
simple('ping','Bot gecikmesini gösterir.',async c=>reply(c,`🏓 Pong! API: **${client.ws.ping}ms**`));
simple('help','NEXUS komutlarını kategoriler halinde gösterir.',async c=>{
 const cfg=guild(c.guild.id).config;
 const defs=getHelpDefs(c.member);
 const rows:ActionRowBuilder<ButtonBuilder>[]=[];
 for(let i=0;i<defs.length;i+=5){rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...defs.slice(i,i+5).map(([id,label,style])=>new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style))));}
 const e=new EmbedBuilder().setColor(0x5865f2).setTitle('⚔️ NEXUS | Komut Merkezi').setDescription(`Merhaba **${c.member.displayName}**!\n\nAşağıdaki butonlardan yetkin dahilindeki kategoriyi seçerek NEXUS komutlarını inceleyebilirsin.\n\n**Prefix:** \`${cfg.prefix}\`  •  **Slash:** \/`).addFields({name:'💡 Hızlı Başlangıç',value:`**${cfg.prefix}yardim** ile prefix üzerinden bu menüyü açabilirsin.\n**${cfg.prefix}ping** ile bağlantıyı test edebilirsin.`}).setFooter({text:'NEXUS • Yetkine göre filtrelenen komut merkezi'}).setTimestamp();
 return c.interaction?c.interaction.reply({embeds:[e],components:rows}):c.message?.reply({embeds:[e],components:rows});
},()=>base('help','NEXUS komutlarını kategoriler halinde gösterir.'));
simple('yardim','NEXUS komutlarini kategoriler halinde gosterir.',async c=>commands.get('help')?.execute(c));
simple('sunucu','Sunucu bilgilerini gösterir.',async c=>reply(c,{embeds:[embed(`🏰 ${c.guild.name}`,`Üye: **${c.guild.memberCount}**\nKanal: **${c.guild.channels.cache.size}**\nRol: **${c.guild.roles.cache.size}**\nKuruluş: <t:${Math.floor(c.guild.createdTimestamp/1000)}:R>`)]}));
simple('uye','Üye bilgilerini gösterir.',async c=>{const m=member(c);return reply(c,{embeds:[embed(`👤 ${m.user.tag}`,`ID: \`${m.id}\`\nHesaba katılım: <t:${Math.floor(m.user.createdTimestamp/1000)}:R>\nSunucuya katılım: ${m.joinedTimestamp?`<t:${Math.floor(m.joinedTimestamp/1000)}:R>`:'-'}\nRoller: ${m.roles.cache.filter(r=>r.id!==c.guild.id).map(r=>r.toString()).join(', ')||'Yok'}`)]})});
simple('avatar','Avatar gösterir.',async c=>{const u=userOpt(c);return reply(c,{embeds:[new EmbedBuilder().setColor(0x5865f2).setAuthor({name:'⚔️ NEXUS • AVATAR'}).setTitle(u.tag).setImage(u.displayAvatarURL({size:1024,dynamic:true})).setFooter({text:'Tam boy görüntülemek için görsele tıklayabilirsin.'})]} )},()=>base('avatar','Avatar gösterir.').addUserOption(o=>o.setName('user').setDescription('Avatarını görmek istediğin kullanıcı')));
staffCmd('say','Bot adına mesaj gönderir.',async c=>{const text=str(c,'text');if(!text)return reply(c,'❌ Mesaj boş olamaz.',true);const ch=(channel(c)||c.interaction?.channel) as TextChannel;if(!ch?.isTextBased())return reply(c,'❌ Geçerli bir metin kanalı seç.',true);await ch.send({content:clean(text),allowedMentions:{parse:[]}});return reply(c,`✅ Mesaj ${ch} kanalına gönderildi.`,true)},()=>base('say','Bot adına mesaj gönderir.').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addStringOption(o=>o.setName('text').setDescription('Gönderilecek mesaj').setRequired(true)).addChannelOption(o=>o.setName('channel').setDescription('Hedef kanal').addChannelTypes(ChannelType.GuildText)));

// CONFIG / PREFIX / IGNORES
staffCmd('prefix','Sunucu prefixini değiştirir.',async c=>{const p=str(c,'prefix');if(!p||p.length>5)return reply(c,'❌ Prefix 1-5 karakter olmalı.',true);mutate(()=>guild(c.guild.id).config.prefix=p);return reply(c,`✅ Prefix **${p}** olarak ayarlandı.`);},()=>base('prefix','Sunucu prefixini değiştirir.').addStringOption(o=>o.setName('prefix').setDescription('Yeni prefix').setRequired(true)));
staffCmd('ignore','Kanal/rolü sistemlerden hariç tutar.',async c=>{const kind=str(c,'type'),id=str(c,'id');const g=guild(c.guild.id).config;const arr=kind==='kanal'?g.ignoredChannels:g.ignoredRoles;if(!arr.includes(id))arr.push(id);else arr.splice(arr.indexOf(id),1);mutate(()=>{});return reply(c,`✅ ${kind} **${id}** genel sistemlerden ${arr.includes(id)?'hariç tutuldu':'çıkarıldı'}.`);},()=>base('ignore','Kanal/rolü genel sistemlerden hariç tutar.').addStringOption(o=>o.setName('type').setDescription('kanal veya rol').setRequired(true).addChoices({name:'Kanal',value:'kanal'},{name:'Rol',value:'rol'})).addStringOption(o=>o.setName('id').setDescription('ID').setRequired(true)));
staffCmd('level-ignore','XP/seviye sisteminden kanal/rolü hariç tutar.',async c=>{const kind=str(c,'type'),id=str(c,'id');const g=guild(c.guild.id).config;const arr=kind==='kanal'?g.levelIgnoredChannels:g.levelIgnoredRoles;if(arr.includes(id))arr.splice(arr.indexOf(id),1);else arr.push(id);mutate(()=>{});return reply(c,`✅ Seviye sistemi için ${kind} **${id}** ${arr.includes(id)?'yoksayıldı':'aktif edildi'}.`);},()=>base('level-ignore','XP sisteminden kanal/rolü hariç tutar.').addStringOption(o=>o.setName('type').setDescription('kanal veya rol').setRequired(true).addChoices({name:'Kanal',value:'kanal'},{name:'Rol',value:'rol'})).addStringOption(o=>o.setName('id').setDescription('ID').setRequired(true)));

staffCmd('seviye-kanal','Seviye duyurularının gönderileceği kanalı ayarlar.',async c=>{const ch=channel(c) as TextChannel;if(!ch?.isTextBased())return reply(c,'Geçerli bir metin kanalı seç.',true);guild(c.guild.id).config.levelChannel=ch.id;mutate(()=>{});return reply(c,'Seviye duyuruları artık '+ch.toString()+' kanalına gönderilecek.',true);},()=>base('seviye-kanal','Seviye duyurularının gönderileceği kanalı ayarlar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addChannelOption(o=>o.setName('channel').setDescription('Seviye duyuru kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true)));

adminCmd('seviye-sifirla','Sunucudaki tüm üyelerin XP ve seviyelerini sıfırlar.',async c=>{
 const sessionId=Date.now().toString(36)+Math.random().toString(36).slice(2,10);
 levelResetSessions.set(sessionId,{guildId:c.guild.id,adminId:c.member.id});
 const row=new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder().setCustomId('levelreset:confirm:'+c.guild.id+':'+c.member.id+':'+sessionId).setLabel('Evet, sıfırla').setStyle(ButtonStyle.Danger),
  new ButtonBuilder().setCustomId('levelreset:cancel:'+c.guild.id+':'+c.member.id+':'+sessionId).setLabel('İptal').setStyle(ButtonStyle.Secondary)
 );
 return reply(c,{embeds:[embed('Seviye Sıfırlama Onayı','Sunucudaki tüm üyelerin **XP ve seviyeleri** sıfırlanacak. Mesaj sayısı, ekonomi, envanter ve diğer veriler korunacak.\n\nBu işlem geri alınamaz. Onaylıyor musun?')],components:[row]},true);
});
// MODERATION
const purgeExecute=async(c:Ctx)=>{const n=Math.min(100,Math.max(1,num(c,'amount',10)));const ch:any=channel(c)||c.interaction?.channel;if(!ch||typeof ch.bulkDelete!=='function')return reply(c,'❌ Bu kanal türünde mesaj temizleme desteklenmiyor.',true);if(c.interaction)await c.interaction.deferReply({flags:MessageFlags.Ephemeral});const deleteAmount=c.interaction?n:Math.min(100,n+1);const deleted=await ch.bulkDelete(deleteAmount,true);await log(c.guild,'🧹 MESAJLAR TEMİZLENDİ',`Kanal: ${ch}\nMesaj sayısı: **${c.interaction?n:Math.max(0,deleted.size-(deleted.has(c.message?.id||'')?1:0))}**`, 'moderation', c.member.user);await log(c.guild,'🧹 TOPLU MESAJ SİLİNDİ',`Kanal: ${ch}\nSilinen mesaj sayısı: **${c.interaction?n:Math.max(0,deleted.size-(deleted.has(c.message?.id||'')?1:0))}**`, 'message', c.member.user);if(c.interaction)return c.interaction.editReply({embeds:[embed('🧹 Mesajlar Temizlendi',`**${n}** mesaj temizlendi.\n\n📍 ${ch}`)]});return c.message?.channel.send({embeds:[embed('🧹 Mesajlar Temizlendi',`**${n}** mesaj temizlendi.`)]});};
staffCmd('purge','Mesajları topluca temizler.',purgeExecute,()=>base('purge','Mesajları topluca temizler.').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption(o=>o.setName('amount').setDescription('1-100').setMinValue(1).setMaxValue(100).setRequired(true)).addChannelOption(o=>o.setName('channel').setDescription('Hedef kanal').addChannelTypes(ChannelType.GuildText,ChannelType.GuildAnnouncement,ChannelType.GuildVoice)),['sil']);
staffCmd('sil','Mesajları topluca temizler.',purgeExecute,()=>base('sil','Mesajları topluca temizler.').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption(o=>o.setName('amount').setDescription('1-100').setMinValue(1).setMaxValue(100).setRequired(true)).addChannelOption(o=>o.setName('channel').setDescription('Hedef kanal').addChannelTypes(ChannelType.GuildText,ChannelType.GuildAnnouncement,ChannelType.GuildVoice)));
commands.set('clear',commands.get('purge')!);
for(const [name,action] of [['kick','kick'],['ban','ban']] as const){staffCmd(name,`${name} işlemi uygular.`,async c=>{const m=member(c);const reason=str(c,'reason')||'Belirtilmedi';if(m.id===c.member.id||m.id===c.guild.ownerId)return reply(c,'❌ Bu üyeye işlem uygulanamaz.',true);try{if(action==='kick')await m.kick(reason);else await m.ban({reason,deleteMessageSeconds:0});await log(c.guild,`${name.toUpperCase()} — ${m.user.tag}`,`Sebep: ${reason}`,'moderation',c.member.user,m.user);return reply(c,`✅ **${m.user.tag}** için ${name} uygulandı.`)}catch(e:any){return reply(c,`❌ ${e.message}`,true)}},()=>base(name,`${name} işlemi uygular.`).setDefaultMemberPermissions(action==='kick'?PermissionFlagsBits.KickMembers:PermissionFlagsBits.BanMembers).addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Sebep')));}
staffCmd('unban','Kullanıcının sunucu yasağını kaldırır.',async c=>{const raw=(c.interaction?.options.getString('user')||c.args.shift()||'').trim();const id=raw.match(/^<@!?(\d+)>$/)?.[1]||raw.match(/^(\d{15,25})$/)?.[1];if(!id)return reply(c,'❌ Geçerli bir kullanıcı ID\'si gir.',true);try{await c.guild.members.unban(id, str(c,'reason')||'NEXUS unban');await log(c.guild,'🔓 YASAĞI KALDIRILDI',`Kullanıcı ID: ${id}`,'moderation',c.member.user);return reply(c,{embeds:[embed('🔓 Yasak Kaldırıldı',`<@${id}> kullanıcısının yasağı kaldırıldı.`)]});}catch(e:any){return reply(c,`❌ ${e.message}`,true)}},()=>base('unban','Kullanıcının sunucu yasağını kaldırır.').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addStringOption(o=>o.setName('user').setDescription('Kullanıcı ID veya mention').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Sebep')));
staffCmd('timeout','Üyeyi zaman aşımına sokar.',async c=>{const m=member(c);const ms=parseDuration(str(c,'duration'));if(ms<1000||ms>2419200000)return reply(c,'❌ Süre 1 saniye ile 28 gün arasında olmalı.',true);const reason=str(c,'reason')||'NEXUS timeout';await m.timeout(ms,reason);await log(c.guild,'🔇 TIMEOUT',`Süre: **${Math.ceil(ms/60000)} dakika**\nSebep: ${reason}`,'moderation',c.member.user,m.user);return reply(c,`⏱️ ${m} **${Math.ceil(ms/60000)} dakika** timeout aldı.`)},()=>base('timeout','Üyeyi timeoutlar.').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true)).addStringOption(o=>o.setName('duration').setDescription('örn. 10m, 2h').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Sebep')));
staffCmd('untimeout','Timeout kaldırır.',async c=>{const m=member(c);await m.timeout(null);await log(c.guild,'🔊 TIMEOUT KALDIRILDI',`Kullanıcının timeoutu kaldırıldı.`,'moderation',c.member.user,m.user);return reply(c,`✅ ${m} timeouttan çıkarıldı.`)},()=>base('untimeout','Timeout kaldırır.').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true)));
function activeWarnCases(g:any,userId:string){return g.cases.filter((x:any)=>x.type==='warn'&&x.user===userId&&x.active!==false);}
function syncWarningCount(g:any,userId:string){const u=user(g.id,userId);u.warnings=activeWarnCases(g,userId).length;return u.warnings;}

staffCmd('warn','Üyeyi uyarır.',async c=>{const m=member(c),g=guild(c.guild.id),u=user(c.guild.id,m.id),r=str(c,'reason')||'Belirtilmedi';const caseId=g.cases.length+1;g.cases.push({id:caseId,type:'warn',user:m.id,mod:c.member.id,reason:r,at:Date.now(),active:true});u.warnings=activeWarnCases(g,m.id).length;mutate(()=>{});await log(c.guild,'⚠️ UYARI VERİLDİ',`Kullanıcı: ${m}\nSebep: ${r}\nVaka: **#${caseId}**\nToplam aktif uyarı: **${u.warnings}**`,'moderation',c.member.user,m.user);return reply(c,{embeds:[embed('⚠️ Uyarı Verildi',`👤 **${m.user.tag}**\n📝 ${r}\n🆔 Vaka: **#${caseId}**\n\nToplam aktif uyarı: **${u.warnings}**`)]})},()=>base('warn','Üyeyi uyarır.').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Sebep')));
staffCmd('unwarn','Bir veya daha fazla uyarıyı geri çeker.',async c=>{const m=member(c),g=guild(c.guild.id),u=user(c.guild.id,m.id),active=activeWarnCases(g,m.id);if(!active.length){u.warnings=0;mutate(()=>{});return reply(c,'❌ Bu kullanıcının aktif uyarısı yok.',true);}const requested=Math.max(1,num(c,'amount',1)),amount=Math.min(requested,active.length),reason=str(c,'reason')||'Belirtilmedi';let left=amount;for(let i=g.cases.length-1;i>=0&&left>0;i--){const v=g.cases[i];if(v.type==='warn'&&v.user===m.id&&v.active!==false){v.active=false;v.reversedBy=c.member.id;v.reversedAt=Date.now();left--;}}u.warnings=activeWarnCases(g,m.id).length;g.cases.push({id:g.cases.length+1,type:'unwarn',user:m.id,mod:c.member.id,reason,amount,at:Date.now()});mutate(()=>{});await log(c.guild,'↩️ UYARI GERİ ÇEKİLDİ',`Kullanıcı: ${m}\nYetkili: ${c.member.user.tag}\nMiktar: **${amount}**\nSebep: ${reason}`,'moderation',c.member.user,m.user);return reply(c,{embeds:[embed('↩️ Uyarı Geri Çekildi',`👤 **${m.user.tag}**\n➖ Çekilen: **${amount}**\n📊 Kalan aktif uyarı: **${u.warnings}**`)]})},()=>base('unwarn','Bir veya daha fazla uyarıyı geri çeker.').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true)).addIntegerOption(o=>o.setName('amount').setDescription('Geri çekilecek uyarı sayısı').setMinValue(1)).addStringOption(o=>o.setName('reason').setDescription('Sebep')));
staffCmd('warnings','Üyenin veya tüm sunucunun uyarılarını gösterir.',async c=>{const g=guild(c.guild.id);const sub=c.interaction?.options.getSubcommand(false);const raw=sub==='all'?'all':(c.interaction?.options.getUser('user')?.id||c.args[0]||'');if(raw==='all'){const active=g.cases.filter((x:any)=>x.type==='warn'&&x.active!==false);const text=active.slice(-25).map((x:any)=>`#${x.id} • <@${x.user}> • <@${x.mod}> • ${clean(x.reason||'Belirtilmedi')}`).join('\n')||'Aktif uyarı bulunmuyor.';return reply(c,{embeds:[embed('📋 Sunucu Uyarı Listesi',`Toplam aktif uyarı: **${active.length}**\n\n${text}`)]});}const target=c.interaction?.options.getUser('user');const m=target?c.guild.members.cache.get(target.id)||await c.guild.members.fetch(target.id):member(c);const u=user(c.guild.id,m.id),cases=activeWarnCases(g,m.id);u.warnings=cases.length;mutate(()=>{});const text=cases.slice(-10).map((x:any)=>`#${x.id} • <@${x.mod}> • ${clean(x.reason||'Belirtilmedi')} • <t:${Math.floor(x.at/1000)}:R>`).join('\n')||'Kayıt bulunmuyor.';return reply(c,{embeds:[embed(`⚠️ ${m.user.tag} • Uyarılar`,`Aktif uyarı: **${u.warnings}**\n\n${text}`)]})},()=>{const b=base('warnings','Üyenin veya tüm sunucunun uyarılarını gösterir.').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);return b.addSubcommand(sc=>sc.setName('user').setDescription('Bir kullanıcının uyarılarını gösterir.').addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true))).addSubcommand(sc=>sc.setName('all').setDescription('Sunucudaki tüm aktif uyarıları gösterir.'));});
function budunRole(g:Guild){return g.roles.cache.find(r=>r.name.trim().toLocaleLowerCase('tr-TR')==='budun');}
async function setChannelLock(c:Ctx,lock:boolean){const ch=(channel(c)||c.interaction?.channel) as TextChannel;if(!ch||!ch.isTextBased()||!('permissionOverwrites' in ch))return reply(c,'❌ Bu işlem yalnızca metin/duyuru kanallarında kullanılabilir.',true);const me=c.guild.members.me;if(!me?.permissionsIn(ch).has(PermissionFlagsBits.ManageChannels))return reply(c,'❌ NEXUS bu kanalda **Kanalları Yönet** iznine sahip değil.',true);const budun=budunRole(c.guild);if(!budun)return reply(c,'❌ **Budun** rolü bulunamadı. Kanal kilitleme için bu rol gerekli.',true);try{await ch.permissionOverwrites.edit(budun.id,{SendMessages:lock?false:null});const overwrite=ch.permissionOverwrites.cache.get(budun.id);const isLocked=!!overwrite?.deny.has(PermissionFlagsBits.SendMessages);if(isLocked!==lock)return reply(c,'❌ Kanal izinleri beklenen şekilde uygulanamadı.',true);await log(c.guild,lock?'🔒 KANAL KİLİTLENDİ':'🔓 KANAL KİLİDİ AÇILDI',`Kanal: ${ch}
Hedef rol: ${budun}`,'moderation',c.member.user);return reply(c,{embeds:[embed(lock?'🔒 Kanal Kilitlendi':'🔓 Kanal Kilidi Açıldı',`📍 ${ch}

${lock?`<@&${budun.id}> rolü için mesaj gönderme izni kapatıldı.`:`<@&${budun.id}> rolü için mesaj gönderme izni kaldırıldı.`}`)]});}catch(e:any){console.error('Kanal kilit işlemi:',e);return reply(c,`❌ Kanal izinleri değiştirilemedi: ${e?.message||'Bilinmeyen hata'}`,true)}}
staffCmd('lock','Kanalı kilitler.',async c=>setChannelLock(c,true),()=>base('lock','Kanalı kilitler.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).addChannelOption(o=>o.setName('channel').setDescription('Kilitlemek istediğin kanal').addChannelTypes(ChannelType.GuildText,ChannelType.GuildAnnouncement,ChannelType.GuildVoice)));
staffCmd('unlock','Kanalın kilidini açar.',async c=>setChannelLock(c,false),()=>base('unlock','Kanalın kilidini açar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).addChannelOption(o=>o.setName('channel').setDescription('Kilidini açmak istediğin kanal').addChannelTypes(ChannelType.GuildText,ChannelType.GuildAnnouncement,ChannelType.GuildVoice)));
staffCmd('slowmode','Kanal slowmode ayarlar.',async c=>{const ch=(channel(c)||c.interaction?.channel) as TextChannel;const sec=Math.min(21600,Math.max(0,num(c,'seconds',0)));await ch.setRateLimitPerUser(sec);await log(c.guild,'🐢 SLOWMODE',`Kanal: ${ch}\nSüre: **${sec} saniye**`,'moderation',c.member.user);return reply(c,`🐢 Slowmode: **${sec} saniye**.`)},()=>base('slowmode','Kanal slowmode ayarlar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).addIntegerOption(o=>o.setName('seconds').setDescription('0-21600').setMinValue(0).setMaxValue(21600).setRequired(true)));

// LEVELS + STATS
function xpForNextLevel(level:number){return 300+level*150;}
function totalXpForLevel(level:number){return 300*level+75*level*(level-1);}
function levelProgress(xp:number,level:number){return {current:xp-totalXpForLevel(level),required:xpForNextLevel(level)};}
function progressBar(current:number,max:number,size=16){const ratio=Math.max(0,Math.min(1,current/Math.max(1,max)));const filled=Math.round(ratio*size);return '█'.repeat(filled)+'░'.repeat(size-filled);}
function rankRows(g:any,field:'xp'|'messages'|'voiceSeconds'|'coins'){return Object.entries(g.users).sort((a:any,b:any)=>((b[1][field]||0)-(a[1][field]||0))).slice(0,10) as [string,any][];}
simple('profil','Şık kullanıcı profilini gösterir.',async c=>{const target=member(c),u=user(c.guild.id,target.id),g=guild(c.guild.id),total=u.xp,progress=levelProgress(u.xp,u.level),next=progress.required,rank=rankRows(g,'xp').findIndex(x=>x[0]===target.id)+1;const e=new EmbedBuilder().setColor(0x5865f2).setAuthor({name:'⚔️ NEXUS • PROFİL'}).setThumbnail(target.displayAvatarURL({size:256})).setTitle(target.displayName).setDescription(`**${target.user.tag}**\n\n📈 **Seviye ${u.level}**\n${progressBar(progress.current,progress.required)}\n**${progress.current.toLocaleString('tr-TR')} / ${next.toLocaleString('tr-TR')} XP**`).addFields({name:'💬 Mesajlar',value:`**${u.messages.toLocaleString('tr-TR')}**`,inline:true},{name:'🎙️ Ses',value:`**${formatDuration(u.voiceSeconds)}**`,inline:true},{name:'🏆 Seviye Sırası',value:`**#${rank||'-'}**`,inline:true},{name:'💰 Cüzdan',value:`**${u.coins.toLocaleString('tr-TR')} ${g.config.currency}**`,inline:true},{name:'🏦 Banka',value:`**${u.bank.toLocaleString('tr-TR')} ${g.config.currency}**`,inline:true},{name:'⚠️ Uyarı',value:`**${u.warnings}**`,inline:true}).setFooter({text:`${c.guild.name} • NEXUS`}).setTimestamp();const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`profile:stats:${target.id}`).setLabel('📊 İstatistikler').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId(`profile:ranking:${target.id}`).setLabel('🏆 Sıralaması').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId(`profile:economy:${target.id}`).setLabel('💰 Ekonomi').setStyle(ButtonStyle.Success));return reply(c,{embeds:[e],components:[row]});},()=>base('profil','Şık kullanıcı profilini gösterir.').addUserOption(o=>o.setName('user').setDescription('Profilini görmek istediğin kullanıcı')));
simple('rank','Seviye kartını gösterir.',async c=>{const u=user(c.guild.id,c.member.id),progress=levelProgress(u.xp,u.level),next=progress.required;const e=new EmbedBuilder().setColor(0x5865f2).setAuthor({name:'⚔️ NEXUS • RANK'}).setThumbnail(c.member.displayAvatarURL({size:256})).setTitle(c.member.displayName).setDescription(`**LEVEL ${u.level}**\n\n${progressBar(progress.current,progress.required,20)}\n**${progress.current.toLocaleString('tr-TR')} / ${next.toLocaleString('tr-TR')} XP**`).addFields({name:'💬 Mesaj',value:`${u.messages.toLocaleString('tr-TR')}`,inline:true},{name:'🎙️ Ses',value:formatDuration(u.voiceSeconds),inline:true});return reply(c,{embeds:[e]});});
simple('seviye-top','Sunucu seviye sıralamasını gösterir.',async c=>{const rows=rankRows(guild(c.guild.id),'xp');const e=embed('🏆 NEXUS • SEVİYE SIRALAMASI',rows.map(([id,u],i)=>`${['🥇','🥈','🥉'][i]||`**#${i+1}**`} <@${id}>\n> **Lv.${u.level}** • ${u.xp.toLocaleString('tr-TR')} XP`).join('\n\n')||'Henüz veri yok.');return reply(c,{embeds:[e]});});
simple('mesaj-top','Sunucu mesaj sıralamasını gösterir.',async c=>{const rows=rankRows(guild(c.guild.id),'messages');return reply(c,{embeds:[embed('💬 NEXUS • MESAJ SIRALAMASI',rows.map(([id,u],i)=>`${['🥇','🥈','🥉'][i]||`**#${i+1}**`} <@${id}>\n> **${u.messages.toLocaleString('tr-TR')}** mesaj`).join('\n\n')||'Henüz veri yok.')]});});
simple('ses-top','Sunucu ses sıralamasını gösterir.',async c=>{const rows=rankRows(guild(c.guild.id),'voiceSeconds');return reply(c,{embeds:[embed('🎙️ NEXUS • SES SIRALAMASI',rows.map(([id,u],i)=>`${['🥇','🥈','🥉'][i]||`**#${i+1}**`} <@${id}>\n> **${formatDuration(u.voiceSeconds)}**`).join('\n\n')||'Henüz veri yok.')]});});
simple('leaderboard','Seviye liderlik tablosu.',async c=>{const rows=rankRows(guild(c.guild.id),'xp');return reply(c,{embeds:[embed('🏆 NEXUS • SEVİYE SIRALAMASI',rows.map(([id,u],i)=>`**${i+1}.** <@${id}> — Lv.${u.level} / ${u.xp} XP`).join('\n')||'Henüz veri yok.')]});});
simple('stats','Kullanıcı mesaj, ses ve seviye istatistiklerini gösterir.',async c=>{const u=user(c.guild.id,c.member.id);return reply(c,{embeds:[embed('📊 NEXUS • İSTATİSTİK',`**${c.member.displayName}**\n\n💬 Mesaj\n**${u.messages.toLocaleString('tr-TR')}**\n\n🎙️ Ses\n**${formatDuration(u.voiceSeconds)}**\n\n📈 XP\n**${u.xp.toLocaleString('tr-TR')}**\n\n🏅 Seviye\n**${u.level}**`)]});});
simple('serverstats','Sunucunun toplam aktivite istatistiklerini gösterir.',async c=>{const g=guild(c.guild.id),m=Object.values(g.users).reduce((a,u)=>a+u.messages,0),v=Object.values(g.users).reduce((a,u)=>a+u.voiceSeconds,0);return reply(c,{embeds:[embed('📊 NEXUS • SUNUCU AKTİVİTESİ',`💬 **${m.toLocaleString('tr-TR')}** toplam mesaj\n🎙️ **${formatDuration(v)}** toplam ses süresi\n👥 **${Object.keys(g.users).length}** kayıtlı kullanıcı`)]});});

// ECONOMY
function economyEmbed(title:string,desc:string){return new EmbedBuilder().setColor(0xf0b232).setAuthor({name:'💰 NEXUS • EKONOMİ'}).setTitle(title).setDescription(desc).setFooter({text:'NEXUS Ekonomi Sistemi'}).setTimestamp();}
simple('paraekle','Yalnızca bot sahibinin kullanabildiği para ekleme komutu.',async c=>{if(!ownerIds.has(c.member.id))return reply(c,'❌ Bu komut yalnızca bot sahibine özeldir.',true);const target=userOpt(c),n=num(c,'amount');if(n<=0)return reply(c,'❌ Geçerli bir miktar gir.',true);const u=user(c.guild.id,target.id),g=guild(c.guild.id);u.coins+=n;mutate(()=>{});return reply(c,{embeds:[economyEmbed('💰 Para Eklendi',`${target} kullanıcısına **${n.toLocaleString('tr-TR')} ${g.config.currency}** eklendi.\n\nYeni bakiye: **${u.coins.toLocaleString('tr-TR')} ${g.config.currency}**`)]});},()=>base('paraekle','Yalnızca bot sahibinin kullanabildiği para ekleme komutu.').addUserOption(o=>o.setName('user').setDescription('Para eklenecek kullanıcı').setRequired(true)).addIntegerOption(o=>o.setName('amount').setDescription('Eklenecek miktar').setRequired(true).setMinValue(1)));
simple('ekonomi','Ekonomi merkezini gösterir.',async c=>{const u=user(c.guild.id,c.member.id),g=guild(c.guild.id);const e=economyEmbed('Ekonomi Merkezi',`**${c.member.displayName}**\n\n👛 Cüzdan\n**${u.coins.toLocaleString('tr-TR')} ${g.config.currency}**\n\n🏦 Banka\n**${u.bank.toLocaleString('tr-TR')} ${g.config.currency}**`);const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('eco:balance').setLabel('💰 Bakiye').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId('eco:ranking').setLabel('🏆 Zenginler').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId('eco:games').setLabel('🎲 Oyunlar').setStyle(ButtonStyle.Success));return reply(c,{embeds:[e],components:[row]});});
simple('balance','Bakiye gösterir.',async c=>{const u=user(c.guild.id,c.member.id),g=guild(c.guild.id);return reply(c,{embeds:[economyEmbed('💰 Bakiye',`👛 **Cüzdan**\n${u.coins.toLocaleString('tr-TR')} ${g.config.currency}\n\n🏦 **Banka**\n${u.bank.toLocaleString('tr-TR')} ${g.config.currency}`)]});});
simple('daily','Günlük giriş serisi ödülünü alır.',async c=>{const u=user(c.guild.id,c.member.id),result=claimDailyStreak(u);if(!result.ok){if(result.reason==='cooldown')return reply(c,{embeds:[economyEmbed('⏳ Günlük Seri',`Bir sonraki ödülünü <t:${Math.floor((result.nextAt||Date.now())/1000)}:R> alabilirsin.\nMevcut seri: **${result.streak||0} gün**`)]});return reply(c,'Günlük ödül şu anda güvenli biçimde hesaplanamadı.',true);}mutate(()=>{});return reply(c,{embeds:[economyEmbed('🔥 Günlük Giriş Serisi',`**${result.streak}. gün** ödülünü aldın!\n\nGünlük ödül: **${result.baseReward} ◈**${result.milestoneBonus?`\n7 günlük seri bonusu: **${result.milestoneBonus} ◈**`:''}\nToplam: **${result.reward} ◈**\n\nYeni bakiye: **${result.balance.toLocaleString('tr-TR')} ◈**`)]});});
simple('deposit','Bankaya para yatırır.',async c=>{const u=user(c.guild.id,c.member.id),n=Math.min(num(c,'amount',0),u.coins);if(n<=0)return reply(c,'❌ Geçerli miktar yok.',true);u.coins-=n;u.bank+=n;mutate(()=>{});return reply(c,{embeds:[economyEmbed('🏦 Para Yatırıldı',`**${n.toLocaleString('tr-TR')} ◈** bankaya yatırıldı.\n\n👛 Cüzdan: **${u.coins} ◈**\n🏦 Banka: **${u.bank} ◈**`)]});},()=>base('deposit','Bankaya para yatırır.').addIntegerOption(o=>o.setName('amount').setDescription('Miktar').setRequired(true).setMinValue(1)));
simple('withdraw','Bankadan para çeker.',async c=>{const u=user(c.guild.id,c.member.id),n=Math.min(num(c,'amount',0),u.bank);if(n<=0)return reply(c,'❌ Geçerli miktar yok.',true);u.bank-=n;u.coins+=n;mutate(()=>{});return reply(c,{embeds:[economyEmbed('💵 Para Çekildi',`**${n.toLocaleString('tr-TR')} ◈** bankadan çekildi.\n\n👛 Cüzdan: **${u.coins} ◈**\n🏦 Banka: **${u.bank} ◈**`)]});},()=>base('withdraw','Bankadan para çeker.').addIntegerOption(o=>o.setName('amount').setDescription('Miktar').setRequired(true).setMinValue(1)));
simple('pay','Başka üyeye para yollar.',async c=>{const to=userOpt(c),u=user(c.guild.id,c.member.id),n=num(c,'amount');if(to.id===c.member.id||n<=0||u.coins<n)return reply(c,'❌ Geçersiz işlem veya yetersiz bakiye.',true);u.coins-=n;user(c.guild.id,to.id).coins+=n;mutate(()=>{});return reply(c,{embeds:[economyEmbed('💸 Transfer Tamamlandı',`${to} kişisine **${n.toLocaleString('tr-TR')} ◈** gönderildi.\n\nYeni bakiyen: **${u.coins.toLocaleString('tr-TR')} ◈**`)]});},()=>base('pay','Para gönderir.').addUserOption(o=>o.setName('user').setDescription('Alıcı').setRequired(true)).addIntegerOption(o=>o.setName('amount').setDescription('Miktar').setRequired(true).setMinValue(1)));

function betResult(title:string,result:string){return {embeds:[economyEmbed(title,result)]};}
function gameKey(gid:string,uid:string,name:string){return `${gid}:${uid}:${name}`;}
function betPlayerKey(gid:string,uid:string){return `${gid}:${uid}`;}
function validBet(n:number){return Number.isSafeInteger(n)&&n>0&&n<=MAX_BET;}
function beginBet(gid:string,uid:string,name:string,amount:number){
 const u=user(gid,uid),key=betPlayerKey(gid,uid);
 if(!validBet(amount))return 'invalid';
 if(u.activeBet||activeBetGames.has(key))return 'active';
 if(!Number.isSafeInteger(u.coins)||u.coins<0)return 'balance';
 if(u.coins<amount)return 'funds';
 const oldCoins=u.coins;
 activeBetGames.set(key,name);
 u.coins-=amount;
 u.activeBet={game:name,amount,created:Date.now()};
 try{persist();return 'ok';}
 catch(e){u.coins=oldCoins;delete u.activeBet;activeBetGames.delete(key);throw e;}
}
function settleBet(gid:string,uid:string,name:string,payout:number){
 const u=user(gid,uid),key=betPlayerKey(gid,uid),bet=u.activeBet;
 if(!bet||bet.game!==name||!Number.isSafeInteger(bet.amount)||bet.amount<=0)return false;
 if(!Number.isSafeInteger(payout)||payout<0)return false;
 if(!Number.isSafeInteger(u.coins)||u.coins<0||!Number.isSafeInteger(u.coins+payout))return false;
 const oldCoins=u.coins;
 u.coins+=payout;
 delete u.activeBet;
 activeBetGames.delete(key);
 try{persist();return true;}
 catch(e){u.coins=oldCoins;u.activeBet=bet;activeBetGames.set(key,name);throw e;}
}
function gameReady(key:string,cooldown=10000){const until=gameCooldowns.get(key)||0;if(until>Date.now())return Math.ceil((until-Date.now())/1000);return 0;}
function setGameCooldown(key:string,ms:number){gameCooldowns.set(key,Date.now()+ms);}
const BET_GAME_TIMEOUT=120000;

function cleanupExpiredBets(){
 const now=Date.now();
 for(const [playerKey,name] of activeBetGames){
  const [gid,uid]=playerKey.split(':');
  if(!gid||!uid)continue;
  const u=user(gid,uid),bet=u.activeBet;
  if(!bet||bet.game!==name){
   activeBetGames.delete(playerKey);
   continue;
  }
  if(!Number.isSafeInteger(bet.created)||bet.created<=0){
   console.error(`KRİTİK: ${name} oyununun zaman damgası geçersiz; bahis kaydına dokunulmadı: ${uid}`);
   continue;
  }
  if(now-bet.created<BET_GAME_TIMEOUT)continue;
  try{
   const payout=technicalRefundBetKeys.has(playerKey)?bet.amount:0;
   if(!settleBet(gid,uid,name,payout))continue;
   technicalRefundBetKeys.delete(playerKey);
   const key=gameKey(gid,uid,name);
   if(name==='coinflip')coinflipGames.delete(key);
   else if(name==='dice')diceGames.delete(key);
   else if(name==='blackjack')blackjackGames.delete(key);
   setGameCooldown(key,5000);
   console.log(payout>0?`↩️ ${name} teknik hata nedeniyle iade edildi: ${uid}`:`⌛ ${name} oyunu zaman aşımına uğradı; ${uid} kullanıcısının bahsi kaybedildi.`);
  }catch(e){
   console.error(`${name} zaman aşımı sonuçlandırılamadı:`,e);
  }
 }
}

const betCleanupTimer=setInterval(cleanupExpiredBets,10000);
betCleanupTimer.unref();
function diceFace(n:number){return ['','⚀','⚁','⚂','⚃','⚄','⚅'][n]||`**${n}**`;}
function gameButtons(id:string,buttons:{id:string;label:string;style:ButtonStyle}[]){return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons.map(b=>new ButtonBuilder().setCustomId(`${b.id}:${id}`).setLabel(b.label).setStyle(b.style)));}
function deck(){const suits=['S','H','D','C'],ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];const d:string[]=[];for(const s of suits)for(const r of ranks)d.push(`${r}${s}`);for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function cardLabel(card:string){const suit:{[k:string]:string}={S:'♠️',H:'♥️',D:'♦️',C:'♣️'};const m=card.match(/^(10|[2-9AJQK])([SHDC])$/);return m?`${m[1]}${suit[m[2]]}`:card;}
function handValue(hand:string[]){let total=0,aces=0;for(const card of hand){const rank=card.replace(/[SHDC]$/,'');if(rank==='A'){aces++;total+=11}else if(['K','Q','J'].includes(rank))total+=10;else total+=Number(rank)}while(total>21&&aces){total-=10;aces--}return total;}
function blackjackText(game:{bet:number;player:string[];dealer:string[]},hideDealer=true){const pv=handValue(game.player),dv=handValue(game.dealer);const dealer=hideDealer?`🂠  ${cardLabel(game.dealer[1])}`:game.dealer.map(cardLabel).join('  ');return `**Sen:** ${game.player.map(cardLabel).join('  ')}  → **${pv}**\n**Krupiye:** ${dealer}${hideDealer?'  → ?':`  → **${dv}**`}`;}
simple('coinflip','Yazı veya tura seçerek bahis oynar.',async c=>{const n=num(c,'amount'),key=gameKey(c.guild.id,c.member.id,'coinflip'),wait=gameReady(key,5000);if(wait)return reply(c,`⏳ Coinflip için **${wait} saniye** beklemelisin.`,true);if(coinflipGames.has(key))return reply(c,'❌ Önce açık olan coinflip oyununu tamamla.',true);let started:string;try{started=beginBet(c.guild.id,c.member.id,'coinflip',n);}catch(e){console.error('Coinflip bahsi başlatılamadı:',e);return reply(c,'❌ Bahis kaydedilemedi. Bakiyen değiştirilmedi.',true);}if(started==='invalid')return reply(c,`❌ Bahis 1 ile ${MAX_BET.toLocaleString('tr-TR')} ◈ arasında olmalı.`,true);if(started==='active')return reply(c,'❌ Önce açık olan bahis oyununu tamamlamalısın.',true);if(started==='funds')return reply(c,'❌ Yetersiz bakiye.',true);if(started==='balance')return reply(c,'❌ Bakiye verisi geçersiz. Bahis başlatılamadı; lütfen yönetime bildir.',true);coinflipGames.set(key,{amount:n,created:Date.now()});try{return await reply(c,{embeds:[economyEmbed('🪙 Coinflip',`Bahis: **${n} ◈**\n\nSeçimini yap: **Yazı** mı, **Tura** mı?`)],components:[gameButtons(c.member.id,[{id:'coin:yazi',label:'🪙 Yazı',style:ButtonStyle.Primary},{id:'coin:tura',label:'🪙 Tura',style:ButtonStyle.Secondary}]) ]});}catch(e){console.error('Coinflip ilk mesajı gönderilemedi:',e);try{if(settleBet(c.guild.id,c.member.id,'coinflip',n)){coinflipGames.delete(key);setGameCooldown(key,5000);return;}}catch(refundError){console.error('Coinflip teknik hata iadesi başarısız:',refundError);}technicalRefundBetKeys.add(betPlayerKey(c.guild.id,c.member.id));}},()=>base('coinflip','Yazı veya tura seçerek bahis oynar.').addIntegerOption(o=>o.setName('amount').setDescription('Bahis').setRequired(true).setMinValue(1).setMaxValue(MAX_BET)));
simple('dice','Krupiye ile zar karşılaştırmalı bahis oyunu.',async c=>{const n=num(c,'amount'),key=gameKey(c.guild.id,c.member.id,'dice'),wait=gameReady(key,8000);if(wait)return reply(c,`⏳ Zar oyunu için **${wait} saniye** beklemelisin.`,true);if(diceGames.has(key))return reply(c,'❌ Önce açık olan zar oyununu tamamla.',true);let started:string;try{started=beginBet(c.guild.id,c.member.id,'dice',n);}catch(e){console.error('Zar bahsi başlatılamadı:',e);return reply(c,'❌ Bahis kaydedilemedi. Bakiyen değiştirilmedi.',true);}if(started==='invalid')return reply(c,`❌ Bahis 1 ile ${MAX_BET.toLocaleString('tr-TR')} ◈ arasında olmalı.`,true);if(started==='active')return reply(c,'❌ Önce açık olan bahis oyununu tamamlamalısın.',true);if(started==='funds')return reply(c,'❌ Yetersiz bakiye.',true);if(started==='balance')return reply(c,'❌ Bakiye verisi geçersiz. Bahis başlatılamadı; lütfen yönetime bildir.',true);diceGames.set(key,{amount:n,created:Date.now()});try{return await reply(c,{embeds:[economyEmbed('🎲 Zar Oyunu',`Bahis: **${n} ◈**\n\nHazırsan **Zar At** butonuna bas.`)],components:[gameButtons(c.member.id,[{id:'dice:roll',label:'🎲 Zar At',style:ButtonStyle.Primary}]) ]});}catch(e){console.error('Zar ilk mesajı gönderilemedi:',e);try{if(settleBet(c.guild.id,c.member.id,'dice',n)){diceGames.delete(key);setGameCooldown(key,5000);return;}}catch(refundError){console.error('Zar teknik hata iadesi başarısız:',refundError);}technicalRefundBetKeys.add(betPlayerKey(c.guild.id,c.member.id));}},()=>base('dice','Krupiye ile zar karşılaştırmalı bahis oyunu.').addIntegerOption(o=>o.setName('amount').setDescription('Bahis').setRequired(true).setMinValue(1).setMaxValue(MAX_BET)));
simple('zar','Bahissiz zar atar; istersen başka bir üyeyle karşılaştırır.',async c=>{const sides=Math.min(1000,Math.max(2,num(c,'sides',6))),count=Math.min(20,Math.max(1,num(c,'count',1))),selected=c.interaction?.options.getUser('user');const op=selected?selected:(c.args.length?userOpt(c,'user'):null);const a=Array.from({length:count},()=>1+Math.floor(Math.random()*sides));const b=Array.from({length:count},()=>1+Math.floor(Math.random()*sides));const at=a.reduce((x,y)=>x+y,0),bt=b.reduce((x,y)=>x+y,0);const opponent=op?await c.guild.members.fetch(op.id).catch(()=>null):null;const format=(rolls:number[])=>rolls.map((n,i)=>`🎲 Zar ${i+1}: **${n}**`).join('\n');const title=opponent?`🎲 ${c.member.displayName} vs ${opponent.displayName}`:`🎲 Zar Atışı`;return reply(c,{embeds:[embed(title,`${format(a)}\n\n💠 **Toplam: ${at}**\n\n${opponent?`${format(b)}\n\n💠 **Toplam: ${bt}**\n\n${at===bt?'🤝 Berabere!':at>bt?`🏆 **${c.member.displayName}** kazandı!`:`🏆 **${opponent.displayName}** kazandı!`}`:`🎯 **${count} adet d${sides}**`}`)]});},()=>base('zar','Bahissiz zar atar.').addIntegerOption(o=>o.setName('sides').setDescription('Zarın yüz sayısı').setMinValue(2).setMaxValue(1000)).addIntegerOption(o=>o.setName('count').setDescription('Atılacak zar sayısı').setMinValue(1).setMaxValue(20)).addUserOption(o=>o.setName('user').setDescription('Karşılaştırmak istediğin kullanıcı')));
simple('slots','Animasyonlu slot makinesi oynar.',async c=>{const n=num(c,'amount'),key=gameKey(c.guild.id,c.member.id,'slots');if(gameReady(key,10000))return reply(c,`⏳ Slot için **${gameReady(key,10000)} saniye** beklemelisin.`,true);if(!c.interaction)return reply(c,'❌ Slot oyunu slash komutuyla kullanılabilir.',true);let started:string;try{started=beginBet(c.guild.id,c.member.id,'slots',n);}catch(e){console.error('Slot bahsi başlatılamadı:',e);return reply(c,'❌ Bahis kaydedilemedi. Bakiyen değiştirilmedi.',true);}if(started==='invalid')return reply(c,`❌ Bahis 1 ile ${MAX_BET.toLocaleString('tr-TR')} ◈ arasında olmalı.`,true);if(started==='active')return reply(c,'❌ Önce açık olan bahis oyununu tamamlamalısın.',true);if(started==='funds')return reply(c,'❌ Yetersiz bakiye.',true);if(started==='balance')return reply(c,'❌ Bakiye verisi geçersiz. Bahis başlatılamadı; lütfen yönetime bildir.',true);const icons=['🍒','🍋','🍊','🔔','⭐','7️⃣'];let current=['❔','❔','❔'],settled=false;try{await c.interaction.deferReply();for(let step=0;step<5;step++){await new Promise(r=>setTimeout(r,220));current=current.map(()=>icons[Math.floor(Math.random()*icons.length)]);await c.interaction.editReply({embeds:[economyEmbed('🎰 Slot Makinesi',`## ${current.join('  •  ')}\n\n${step<4?'🎞️ Makaralar dönüyor...':'🎰 Sonuç hesaplanıyor...'}`)]});}const same=current[0]===current[1]&&current[1]===current[2],pair=current[0]===current[1]||current[1]===current[2]||current[0]===current[2],payout=same?n*5:pair?n*2:0;if(!settleBet(c.guild.id,c.member.id,'slots',payout))throw new Error('Slot bahsi sonuçlandırılamadı.');settled=true;setGameCooldown(key,10000);const u=user(c.guild.id,c.member.id);return c.interaction.editReply({embeds:[economyEmbed('🎰 Slot Makinesi',`## ${current.join('  •  ')}\n\n${same?`💎 Büyük ödül! **+${n*4} ◈**`:pair?`✨ Çift! **+${n} ◈**`:`💸 Kaybettin! **-${n} ◈**`}\n\n💰 Bakiye: **${u.coins} ◈**`)]});}catch(e){console.error('Slot oyunu sırasında hata:',e);let refundStatus='unknown';if(!settled){try{refundStatus=settleBet(c.guild.id,c.member.id,'slots',n)?'refunded':'not-settled';}catch(refundError){console.error('Slot bahis iadesi başarısız:',refundError);technicalRefundBetKeys.add(betPlayerKey(c.guild.id,c.member.id));refundStatus='error';}}else{refundStatus='already-settled';}const errorMessage=refundStatus==='refunded'?'❌ Slot oyunu tamamlanamadı. Bahis iade edildi.':refundStatus==='already-settled'?'❌ Slot oyunu tamamlanamadı. Bahis zaten sonuçlandırılmış.':'❌ Slot oyunu tamamlanamadı. Bahis durumu doğrulanamadı; lütfen yönetime bildir.';return c.interaction.deferred?c.interaction.editReply({content:errorMessage,embeds:[],components:[]}).catch(()=>{}):reply(c,errorMessage,true);}},()=>base('slots','Animasyonlu slot makinesi oynar.').addIntegerOption(o=>o.setName('amount').setDescription('Bahis').setRequired(true).setMinValue(1).setMaxValue(MAX_BET)));
simple('blackjack','Klasik blackjack oynar.',async c=>{const n=num(c,'amount'),key=gameKey(c.guild.id,c.member.id,'blackjack');if(gameReady(key,5000))return reply(c,`⏳ Blackjack için **${gameReady(key,5000)} saniye** beklemelisin.`,true);if(blackjackGames.has(key))return reply(c,'❌ Önce açık olan blackjack oyununu tamamla.',true);let started:string;try{started=beginBet(c.guild.id,c.member.id,'blackjack',n);}catch(e){console.error('Blackjack bahsi başlatılamadı:',e);return reply(c,'❌ Bahis kaydedilemedi. Bakiyen değiştirilmedi.',true);}if(started==='invalid')return reply(c,`❌ Bahis 1 ile ${MAX_BET.toLocaleString('tr-TR')} ◈ arasında olmalı.`,true);if(started==='active')return reply(c,'❌ Önce açık olan bahis oyununu tamamlamalısın.',true);if(started==='funds')return reply(c,'❌ Yetersiz bakiye.',true);if(started==='balance')return reply(c,'❌ Bakiye verisi geçersiz. Bahis başlatılamadı; lütfen yönetime bildir.',true);const d=deck(),game={bet:n,deck:d,player:[d.pop()!,d.pop()!],dealer:[d.pop()!,d.pop()!],created:Date.now()};blackjackGames.set(key,game);if(handValue(game.player)===21){try{if(!settleBet(c.guild.id,c.member.id,'blackjack',Math.floor(n*2.5)))throw new Error('Doğal blackjack bahsi sonuçlandırılamadı.');}catch(e){console.error('Doğal blackjack ödemesi başarısız:',e);try{if(settleBet(c.guild.id,c.member.id,'blackjack',n)){blackjackGames.delete(key);setGameCooldown(key,5000);return reply(c,'❌ Blackjack ödemesi teknik hata nedeniyle tamamlanamadı; bahsin iade edildi.',true);}}catch(refundError){console.error('Doğal blackjack teknik hata iadesi başarısız:',refundError);}technicalRefundBetKeys.add(betPlayerKey(c.guild.id,c.member.id));return reply(c,'❌ Blackjack ödemesi kaydedilemedi. Bahis iadesi beklemede; oyun kilidi güvenlik için korunuyor.',true);}blackjackGames.delete(key);setGameCooldown(key,5000);const u=user(c.guild.id,c.member.id);return reply(c,{embeds:[economyEmbed('🃏 Blackjack',`${blackjackText(game,false)}\n\n🎉 **Blackjack! +${Math.floor(n*1.5)} ◈**\n\n💰 Bakiye: **${u.coins} ◈**`)]});}try{return await reply(c,{embeds:[economyEmbed('🃏 Blackjack',`${blackjackText(game,true)}\n\n🎯 Kart çek veya **Pas** de.`)],components:[gameButtons(c.member.id,[{id:'bj:hit',label:'🃏 Kart Çek',style:ButtonStyle.Primary},{id:'bj:stand',label:'✋ Pas',style:ButtonStyle.Secondary}]) ]});}catch(e){console.error('Blackjack ilk mesajı gönderilemedi:',e);try{if(settleBet(c.guild.id,c.member.id,'blackjack',n)){blackjackGames.delete(key);setGameCooldown(key,5000);return;}}catch(refundError){console.error('Blackjack teknik hata iadesi başarısız:',refundError);}technicalRefundBetKeys.add(betPlayerKey(c.guild.id,c.member.id));}},()=>base('blackjack','Klasik blackjack oynar.').addIntegerOption(o=>o.setName('amount').setDescription('Bahis').setRequired(true).setMinValue(1).setMaxValue(MAX_BET)));
simple('zenginler','En zengin üyeleri gösterir.',async c=>{const g=guild(c.guild.id),rows=rankRows(g,'coins').sort((a,b)=>(b[1].coins+b[1].bank)-(a[1].coins+a[1].bank)).slice(0,10);return reply(c,{embeds:[economyEmbed('🏆 NEXUS • ZENGİNLER',rows.map(([id,u],i)=>`${['🥇','🥈','🥉'][i]||`**#${i+1}**`} <@${id}>\n> **${(u.coins+u.bank).toLocaleString('tr-TR')} ${g.config.currency}**`).join('\n\n')||'Henüz veri yok.')]});});

// ROLES / AUTOROLE
staffCmd('autorole','Üye/bot giriş rollerini ayarlar.',async c=>{const type=str(c,'type'),r=role(c);if(!r)return reply(c,'❌ Rol bulunamadı.',true);const cfg=guild(c.guild.id).config;cfg.autorole??={};if(type==='bot')cfg.autorole.bot=r.id;else cfg.autorole.member=r.id;mutate(()=>{});return reply(c,{embeds:[embed('🎭 Autorole Ayarlandı',`${type==='bot'?'🤖 Botlar':'👤 Üyeler'} için otomatik rol: ${r}

Botun rolü, atanacak rolden yukarıda olmalı ve **Rolleri Yönet** izni bulunmalıdır.`)]})},()=>base('autorole','Üye/bot giriş rolünü ayarlar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addStringOption(o=>o.setName('type').setDescription('Üye veya bot').setRequired(true).addChoices({name:'Üye',value:'member'},{name:'Bot',value:'bot'})).addRoleOption(o=>o.setName('role').setDescription('Rol').setRequired(true)));
staffCmd('rolver','Üyeye rol verir.',async c=>{const m=member(c),r=role(c);if(!r)return reply(c,'❌ Rol yok.',true);await m.roles.add(r);return reply(c,`✅ ${m} → ${r}`)},()=>base('rolver','Rol verir.').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Rol').setRequired(true)));
staffCmd('rolal','Üyeden rol alır.',async c=>{const m=member(c),r=role(c);if(!r)return reply(c,'❌ Rol yok.',true);await m.roles.remove(r);return reply(c,`✅ ${m} rolü alındı: ${r}`)},()=>base('rolal','Rol alır.').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Rol').setRequired(true)));

// WELCOME
staffCmd('welcome','Hoş geldin mesajını ayarlar.',async c=>{const ch=channel(c) as TextChannel,msg=str(c,'message')||'Hoş geldin {user}! {server} sunucusuna katıldın.';guild(c.guild.id).config.welcome={channel:ch.id,message:msg};mutate(()=>{});return reply(c,`✅ Hoş geldin kanalı: ${ch}`)},()=>base('welcome','Hoş geldin mesajını ayarlar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addChannelOption(o=>o.setName('channel').setDescription('Kanal').addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption(o=>o.setName('message').setDescription('{user} {server} değişkenleri')));
staffCmd('leave-message','Veda mesajını ayarlar.',async c=>{const ch=channel(c) as TextChannel,msg=str(c,'message')||'{user} sunucudan ayrıldı.';guild(c.guild.id).config.leave={channel:ch.id,message:msg};mutate(()=>{});return reply(c,`✅ Veda kanalı: ${ch}`)},()=>base('leave-message','Veda mesajını ayarlar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addChannelOption(o=>o.setName('channel').setDescription('Kanal').addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption(o=>o.setName('message').setDescription('{user} değişkeni')));

// LOGGING
staffCmd('log','Bir log olayının kanalını ayarlar.',async c=>{const type=str(c,'type'),ch=channel(c) as TextChannel;if(!ch)return reply(c,'❌ Kanal bulunamadı.',true);guild(c.guild.id).config.logChannels[type]=ch.id;mutate(()=>{});return reply(c,{embeds:[embed('📚 Log Kanalı Ayarlandı',`**${type}** olayları artık ${ch} kanalına kaydedilecek.`)]})},()=>base('log','Log kanalını ayarlar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption(o=>o.setName('type').setDescription('Log türü').setRequired(true).addChoices(...[['message','Mesaj Logu'],['member','Üye Logu'],['role','Rol Logu'],['channel','Kanal Logu'],['moderation','Moderasyon Logu'],['server','Sunucu Logu'],['voice','Ses Logu'],['command','Komut Logu'],['economy','Ekonomi Logu'],['ticket','Ticket Logu'],['reaction','Rol/Reaction Logu']].map(([name,label])=>({name,label,value:name})))).addChannelOption(o=>o.setName('channel').setDescription('Log kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true)));
const logQueues=new Map<string,Promise<void>>();
async function log(g:Guild,title:string,description:string,type='server',actor?:User,subject?:User){const cfg=guild(g.id).config;const chId=cfg.logChannels[type]||(type==='server'?cfg.logChannels.server:undefined);const ch=chId?g.channels.cache.get(chId):undefined;if(!ch?.isTextBased())return;const e=new EmbedBuilder().setColor(0x2b2d31).setAuthor({name:actor?`⚔️ ${actor.tag}`:'⚔️ NEXUS',iconURL:actor?.displayAvatarURL({size:128})}).setTitle(title).setDescription(description).setTimestamp().setFooter({text:`NEXUS • ${type.toUpperCase()} LOG`});if(subject)e.setThumbnail(subject.displayAvatarURL({size:256}));if(actor)e.addFields({name:'👮 İşlemi Yapan',value:`${actor} \`${actor.tag}\``,inline:true});if(subject)e.addFields({name:'👤 Hedef',value:`${subject} \`${subject.tag}\``,inline:true});const key=`${g.id}:${ch.id}`;const previous=logQueues.get(key)||Promise.resolve();const current=previous.then(()=> (ch as TextChannel).send({embeds:[e]}).then(()=>{}).catch(()=>{}));logQueues.set(key,current);await current;}

// EMBED / BOT MESSAGE
staffCmd('embed','Embed mesaj gönderir.',async c=>{const ch=(channel(c)||c.interaction?.channel) as TextChannel;const title=str(c,'title'),desc=str(c,'description'),color=str(c,'color')||'#5865F2';if(!ch?.isTextBased())return reply(c,'❌ Kanal yok.',true);const col=/^#?[0-9a-f]{6}$/i.test(color)?parseInt(color.replace('#',''),16):0x5865f2;await ch.send({embeds:[embed(title,desc,col)]});return reply(c,`✅ Embed ${ch} kanalına gönderildi.`,true)},()=>base('embed','Embed mesaj gönderir.').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addChannelOption(o=>o.setName('channel').setDescription('Kanal').addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption(o=>o.setName('title').setDescription('Başlık').setRequired(true)).addStringOption(o=>o.setName('description').setDescription('İçerik').setRequired(true)).addStringOption(o=>o.setName('color').setDescription('#5865F2')));
staffCmd('nickname','Botun sunucudaki adını değiştirir.',async c=>{const n=str(c,'name');await c.guild.members.me?.setNickname(n||null);return reply(c,`✅ Bot adı: **${n||client.user?.username||'NEXUS'}**`)},()=>base('nickname','Botun adını değiştirir.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption(o=>o.setName('name').setDescription('Yeni ad').setRequired(true)));

// REACTION ROLES
staffCmd('rr','Reaction role paneli oluşturur.',async c=>{const ch=(channel(c)||c.interaction?.channel) as TextChannel,r=role(c),emoji=str(c,'emoji')||'✅',title=str(c,'title')||'Rol Seçimi',desc=str(c,'description')||'Butona tıklayarak rol alabilirsin.';if(!ch||!r)return reply(c,'❌ Kanal/rol bulunamadı.',true);const b=new ButtonBuilder().setCustomId(`rr:${r.id}`).setLabel(r.name).setEmoji(emoji).setStyle(ButtonStyle.Secondary);const m=await ch.send({embeds:[embed(title,desc)],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(b)]});guild(c.guild.id).reactionRoles.push({message:m.id,channel:ch.id,role:r.id,emoji});mutate(()=>{});return reply(c,`✅ Reaction role paneli hazır: ${m.url}`,true)},()=>base('rr','Rol alma paneli oluşturur.').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addChannelOption(o=>o.setName('channel').setDescription('Kanal').addChannelTypes(ChannelType.GuildText).setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Rol').setRequired(true)).addStringOption(o=>o.setName('emoji').setDescription('Emoji')).addStringOption(o=>o.setName('title').setDescription('Başlık')).addStringOption(o=>o.setName('description').setDescription('Açıklama')));

// GIVEAWAYS
staffCmd('giveaway','Çekiliş başlatır.',async c=>{const ch=(channel(c)||c.interaction?.channel) as TextChannel,dur=parseDuration(str(c,'duration')),prize=str(c,'prize'),winners=Math.max(1,num(c,'winners',1));if(!ch||dur<5000||!prize)return reply(c,'❌ Süre/prize/channel eksik.',true);const msg=await ch.send({embeds:[embed('🎉 ÇEKİLİŞ',`Ödül: **${prize}**\nKazanan: **${winners}**\nBitiş: <t:${Math.floor((Date.now()+dur)/1000)}:R>\n\nKatılmak için 🎉 tepkisine bas!`,0xffc107)]});await msg.react('🎉');const g=guild(c.guild.id);g.giveaways.push({message:msg.id,channel:ch.id,prize,winners,end:Date.now()+dur});mutate(()=>{});return reply(c,`🎉 Çekiliş başladı: ${msg.url}`,true)},()=>base('giveaway','Çekiliş başlatır.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addChannelOption(o=>o.setName('channel').setDescription('Kanal').addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption(o=>o.setName('duration').setDescription('örn. 1h').setRequired(true)).addStringOption(o=>o.setName('prize').setDescription('Ödül').setRequired(true)).addIntegerOption(o=>o.setName('winners').setDescription('Kazanan').setMinValue(1).setMaxValue(20)));

adminCmd('yetki','Bot özel yetkilerini seçim menüleriyle yönetir.',async c=>{
 const e=new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Özel Yetki Yönetimi').setDescription('Özel NEXUS yetkisi vermek veya kaldırmak için önce hedef türünü seç.\n\n👤 **Kullanıcı** — yalnızca seçtiğin üyeye uygulanır.\n🎭 **Rol** — o role sahip üyelere uygulanır.').setFooter({text:'Bu sistem Discord rollerinin teknik izinlerini değiştirmez; NEXUS komut erişimini yönetir.'}).setTimestamp();
 const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:target:user:${c.member.id}`).setLabel('👤 Kullanıcıya Yetki').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId(`perm:target:role:${c.member.id}`).setLabel('🎭 Role Yetki').setStyle(ButtonStyle.Secondary));
 if(c.interaction)return c.interaction.reply({embeds:[e],components:[row],flags:MessageFlags.Ephemeral});
 return c.message?.channel.send({embeds:[e],components:[row]});
},()=>base('yetki','Bot özel yetkilerini seçim menüleriyle yönetir.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator));

const permissionCatalog:Record<string,{label:string;command:string}[]>= {
 general:[['🏓 Ping','ping'],['👤 Profil','profil'],['🖼️ Avatar','avatar'],['🏰 Sunucu Bilgisi','sunucu'],['👥 Üye Bilgisi','uye']].map(([label,command])=>({label,command})),
 moderation:[['🗑️ Mesajları Temizleme','purge'],['⚠️ Uyarı Verme','warn'],['📋 Uyarıları Görme','warnings'],['↩️ Uyarı Geri Çekme','unwarn'],['🔇 Susturma','timeout'],['🔊 Susturmayı Kaldırma','untimeout'],['👢 Kullanıcı Atma','kick'],['🔨 Yasaklama','ban'],['🔓 Yasağı Kaldırma','unban'],['🔒 Kanal Kilitleme','lock'],['🔓 Kanal Kilidini Açma','unlock'],['🐢 Yavaş Mod Yönetimi','slowmode']].map(([label,command])=>({label,command})),
 management:[['🧩 Prefix Yönetimi','prefix'],['🚫 Sistem Hariç Tutma','ignore'],['📈 Seviye Hariç Tutma','level-ignore'],['🎭 Autorole Yönetimi','autorole'],['🎫 Ticket Yönetimi','ticket'],['📣 Bot Adına Mesaj','say'],['🔧 Özel Komut Yönetimi','custom'],['🎨 Reaction Role Yönetimi','rr'],['🎉 Çekiliş Yönetimi','giveaway'],['📚 Log Yönetimi','log'],['🪪 Bot Adı Yönetimi','nickname'],['🎨 Embed Gönderme','embed'],['👤 Rol Verme','rolver'],['🗑️ Rol Alma','rolal'],['🎙️ Özel Oda Yönetimi','tempvoice']].map(([label,command])=>({label,command})),
 stats:[['👤 Profil Görüntüleme','profil'],['📊 İstatistik Görüntüleme','stats'],['🏆 Sıralamaları Görme','leaderboard'],['📈 Seviye Sıralaması','seviye-top'],['💬 Mesaj Sıralaması','mesaj-top'],['🎙️ Ses Sıralaması','ses-top'],['🏆 Genel Liderlik','rank']].map(([label,command])=>({label,command})),
 economy:[['💰 Ekonomi Merkezi','ekonomi'],['💳 Bakiye','balance'],['🎁 Günlük Ödül','daily'],['🔥 Giriş Serisi','daily'],['🏦 Para Yatır','deposit'],['💵 Para Çek','withdraw'],['💸 Para Gönder','pay'],['🪙 Coinflip','coinflip'],['🎲 Zar Oyunu','dice'],['🎯 Bahissiz Zar','zar'],['🎰 Slot','slots'],['🃏 Blackjack','blackjack'],['🏆 Zenginler','zenginler'],['💎 Özel Para Ekle','paraekle']].map(([label,command])=>({label,command})),
 fun:[['📊 Anket','anket'],['💡 Öneri','öneri'],['⏰ Hatırlatıcı','remind'],['💤 AFK','afk'],['🎭 Eğlence','oda']].map(([label,command])=>({label,command}))
};
const permissionCategoryTitles:Record<string,string>={general:'🌐 Genel',moderation:'🛡️ Moderasyon',management:'⚙️ Yönetim',stats:'📊 İstatistik',economy:'💰 Ekonomi',fun:'🎉 Eğlence'};

function permissionTargetLabel(s:{targetType:'user'|'role';targetId:string;targetIds?:string[]}){const ids=s.targetIds?.length?s.targetIds:[s.targetId];return ids.map(id=>s.targetType==='user'?`<@${id}>`:`<@&${id}>`).join(', ');}
function permissionGrantedCommands(gid:string,s:{targetType:'user'|'role';targetId:string}){
 const cfg=guild(gid).config; const ids=new Set<string>();
 const directMap=s.targetType==='user'?cfg.commandUsers:cfg.commandRoles;
 for(const [command,targets] of Object.entries(directMap)) if((targets||[]).includes(s.targetId)) ids.add(canonicalCommandName(command));
 if(s.targetType==='user'){
  const member=client.guilds.cache.get(gid)?.members.cache.get(s.targetId);
  if(member) for(const roleId of member.roles.cache.keys()) for(const [command,targets] of Object.entries(cfg.commandRoles)) if((targets||[]).includes(roleId)) ids.add(canonicalCommandName(command));
 }
 return ids;
}
function permissionOverviewEmbed(gid:string,s:{targetType:'user'|'role';targetId:string},mode:'current'|'available'){
 const granted=permissionGrantedCommands(gid,s);
 const sections=Object.entries(permissionCatalog).map(([cat,items])=>{const rows=items.filter(x=>mode==='available'||granted.has(x.command)).map(x=>mode==='available'?`${granted.has(x.command)?'✅':'▫️'} ${x.label} — \`/${x.command}\``:`• ${x.label} — \`/${x.command}\``);return rows.length?`**${permissionCategoryTitles[cat]}**\n${rows.join('\n')}`:'';}).filter(Boolean).join('\n\n');
 const count=mode==='available'?Object.values(permissionCatalog).reduce((n,a)=>n+a.length,0):granted.size;
 return new EmbedBuilder().setColor(mode==='current'?0x5865f2:0x57f287).setTitle(mode==='current'?'📋 NEXUS • Mevcut Yetkiler':'📚 NEXUS • Verilebilecek Yetkiler').setDescription(`**Hedef:** ${permissionTargetLabel(s)}\n\n${sections||'Bu hedef için gösterilecek yetki bulunmuyor.'}`).setFooter({text:`${mode==='current'?'Mevcut':'Tanımlı'} yetki sayısı: ${count} • NEXUS`}).setTimestamp();
}
function permissionOverviewButtons(adminId:string){return new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:view:current:${adminId}`).setLabel('📋 Mevcut Yetkileri Gör').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId(`perm:view:available:${adminId}`).setLabel('📚 Verilebilecek Yetkileri Gör').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId(`perm:back:category:${adminId}`).setLabel('↩️ Yetki İşlemlerine Dön').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId(`perm:done:${adminId}`).setLabel('✅ Kapat').setStyle(ButtonStyle.Secondary));}

// TICKETS
adminCmd('ticket','Ticket destek panelini kurar. Yönetici izni gerekir.',async c=>{
 const cfg=guild(c.guild.id).config;cfg.ticket??={};
 const panel=(channel(c)||c.interaction?.channel) as TextChannel;
 if(!panel?.isTextBased())return reply(c,'❌ Panel kanalı bulunamadı.',true);
 const cat=c.interaction?.options.getChannel('category'); const support=c.interaction?.options.getRole('supportrole'); const complaint=c.interaction?.options.getRole('complaintrole');
 let category=cat?.id||cfg.ticket.category; if(!category){const created=await c.guild.channels.create({name:'🎫・DESTEK',type:ChannelType.GuildCategory});category=created.id;}
 cfg.ticket={...cfg.ticket,category,panelChannel:panel.id,supportRole:support?.id||cfg.ticket.supportRole,complaintRole:complaint?.id||cfg.ticket.complaintRole,supportCategory:category,complaintCategory:category};
 const rows=[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('ticket:create:support').setLabel('🎫 Destek Talebi').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId('ticket:create:complaint').setLabel('⚠️ Şikayet / Bildirim').setStyle(ButtonStyle.Danger))];
 const m=await panel.send({embeds:[new EmbedBuilder().setColor(0x5865f2).setAuthor({name:'⚔️ NEXUS • DESTEK MERKEZİ'}).setTitle('Nasıl yardımcı olabiliriz?').setThumbnail(c.guild.iconURL({size:256})||null).setDescription('Aşağıdaki seçeneklerden talebinin türünü seç.\n\n🎫 **Destek Talebi**\nGenel yardım ve destek için.\n\n⚠️ **Şikayet / Bildirim**\nKullanıcı, içerik veya sunucu ile ilgili bildirimler için.').setFooter({text:'Her kullanıcı aynı anda yalnızca bir açık ticket oluşturabilir.'}).setTimestamp()],components:rows});mutate(()=>{});return reply(c,{embeds:[embed('🎫 Ticket Sistemi Hazır',`Panel: ${m.url}\n\n🎫 Destek rolü: ${cfg.ticket.supportRole?`<@&${cfg.ticket.supportRole}>`:'Tanımlanmadı'}\n⚠️ Şikayet rolü: ${cfg.ticket.complaintRole?`<@&${cfg.ticket.complaintRole}>`:'Tanımlanmadı'}\n📁 Kategori: <#${category}>`)]},true);
},()=>base('ticket','Ticket destek panelini kurar.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addChannelOption(o=>o.setName('channel').setDescription('Panelin gönderileceği kanal').addChannelTypes(ChannelType.GuildText).setRequired(true)).addChannelOption(o=>o.setName('category').setDescription('Ticket kategorisi').addChannelTypes(ChannelType.GuildCategory)).addRoleOption(o=>o.setName('supportrole').setDescription('Destek taleplerini görecek rol')).addRoleOption(o=>o.setName('complaintrole').setDescription('Şikayetleri görecek rol')));

// TEMP VOICE / PRIVATE ROOM
staffCmd('tempvoice','Geçici ses lobisi ayarlar.',async c=>{const ch=channel(c) as VoiceChannel;if(!ch?.isVoiceBased())return reply(c,'❌ Ses kanalı seç.',true);guild(c.guild.id).config.tempVoice={lobby:ch.id,category:ch.parentId||undefined};mutate(()=>{});return reply(c,`🔊 Geçici oda lobisi: ${ch}`)},()=>base('tempvoice','Geçici ses lobisi ayarlar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).addChannelOption(o=>o.setName('channel').setDescription('Ses lobisi').addChannelTypes(ChannelType.GuildVoice).setRequired(true)));
simple('oda','Özel geçici ses odası oluşturur.',async c=>{if(!c.member.voice.channel)return reply(c,'❌ Önce ses kanalına gir.',true);return createTempRoom(c.guild,c.member);});

// PRIVATE CHANNELS
staffCmd('özel-kanal','Belirtilen üyeye özel metin kanalı oluşturur.',async c=>{const m=member(c),cat=channel(c,'category');const ch=await c.guild.channels.create({name:`özel-${m.user.username}`.toLowerCase().slice(0,90),type:ChannelType.GuildText,parent:cat?.type===ChannelType.GuildCategory?cat.id:undefined,permissionOverwrites:[{id:c.guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},{id:m.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},{id:c.guild.members.me!.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ManageChannels]}]});return reply(c,`🔐 Özel kanal oluşturuldu: ${ch}`)},()=>base('özel-kanal','Üyeye özel metin kanalı oluşturur.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).addUserOption(o=>o.setName('user').setDescription('Üye').setRequired(true)).addChannelOption(o=>o.setName('category').setDescription('Kategori').addChannelTypes(ChannelType.GuildCategory)));

// AI / CUSTOM COMMANDS
// AI şimdilik devre dışı: komut kaydı yapılmıyor. Kod altyapısı ileride yeniden etkinleştirilebilir.
staffCmd('custom','Özel prefix komutu ekler/siler.',async c=>{const n=(c.interaction?.options.getString('name')??c.args.shift()??'').toLowerCase().trim(),text=c.interaction?.options.getString('response')??c.args.join(' ');const g=guild(c.guild.id);if(!n)return reply(c,'❌ Komut adı gir.',true);if(!text){delete g.customCommands[n];mutate(()=>{});return reply(c,`🗑️ \`${n}\` silindi.`)}g.customCommands[n]=text;mutate(()=>{});return reply(c,{embeds:[embed('🧩 Özel Komut Oluşturuldu',`Komut: **${g.config.prefix}${n}**\n\nYanıt: ${text}\n\nKullanılabilir değişkenler: \`{user}\` \`{userTag}\` \`{server}\` \`{channel}\` \`{memberCount}\``)]});},()=>base('custom','Özel komut oluşturur/siler.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption(o=>o.setName('name').setDescription('Komut').setRequired(true)).addStringOption(o=>o.setName('response').setDescription('Yanıt; boş bırakırsan siler').setRequired(false)));

// MUSIC
simple('leave','Botu ses kanalından çıkarır.',async c=>{stop(c.guild.id);try{const v=require('@discordjs/voice');v.getVoiceConnection(c.guild.id)?.destroy();}catch{}return reply(c,'👋 Ses kanalından ayrıldım.')});
simple('join','Botu ses kanalına çağırır.',async c=>{if(!c.member.voice.channel)return reply(c,'❌ Ses kanalına gir.');const v=require('@discordjs/voice');v.joinVoiceChannel({channelId:c.member.voice.channel.id,guildId:c.guild.id,adapterCreator:c.guild.voiceAdapterCreator as any,selfDeaf:true});return reply(c,`🔊 ${c.member.voice.channel} kanalına geldim.`)});
simple('play','YouTube/Spotify şarkısı çalar veya kuyruğa ekler.',async c=>{try{if(c.interaction)await c.interaction.deferReply();const q=str(c,'query');const t=await playTrack(c.member,q);const payload={embeds:[new EmbedBuilder().setColor(0x5865f2).setAuthor({name:'🎵 NEXUS • MÜZİK'}).setTitle('Parça kuyruğa eklendi').setDescription(`**${t.title}**${t.duration?`\n\n⏱️ ${t.duration} saniye`:''}`).setThumbnail(t.thumbnail||null).setFooter({text:'NEXUS Müzik Sistemi'}).setTimestamp()]};if(c.interaction?.deferred)return c.interaction.editReply(payload);return reply(c,payload);}catch(e:any){if(c.interaction?.deferred)return c.interaction.editReply(`❌ ${e.message}`);return reply(c,`❌ ${e.message}`,true)}},()=>base('play','YouTube/Spotify şarkısı çalar.').addStringOption(o=>o.setName('query').setDescription('Şarkı adı veya YouTube/Spotify URL').setRequired(true)),['çal']);
simple('skip','Şarkıyı geçer.',async c=>reply(c,skip(c.guild.id)?'⏭️ Şarkı geçildi.':'❌ Şu anda çalan bir şarkı yok.',true));
simple('stop','Müziği durdurur ve kuyruğu temizler.',async c=>{stop(c.guild.id);return reply(c,'⏹️ Müzik durduruldu ve kuyruk temizlendi.')});
simple('pause','Müziği duraklatır.',async c=>reply(c,pause(c.guild.id)?'⏸️ Duraklatıldı.':'❌ Çalan bir müzik yok.',true));
simple('resume','Müziği devam ettirir.',async c=>reply(c,resume(c.guild.id)?'▶️ Devam ediyor.':'❌ Devam ettirilecek bir müzik yok.',true));
simple('queue','Müzik kuyruğunu gösterir.',async c=>{const cur=musicCurrent(c.guild.id),q=musicQueue(c.guild.id);const lines=cur?[`▶️ **${cur.title}**`]:[];q.slice(0,20).forEach((x,i)=>lines.push(`${i+1}. ${x.title}`));return reply(c,{embeds:[embed('🎶 NEXUS • MÜZİK KUYRUĞU',lines.length?lines.join('\n'):'Kuyruk boş.')]})});
simple('nowplaying','Şu anda çalan parçayı gösterir.',async c=>{const t=musicCurrent(c.guild.id);return t?reply(c,{embeds:[new EmbedBuilder().setColor(0x5865f2).setAuthor({name:'🎶 NEXUS • ŞİMDİ ÇALIYOR'}).setTitle(t.title).setThumbnail(t.thumbnail||null).setDescription(t.duration?`⏱️ ${t.duration} saniye`: 'Canlı / bilinmeyen süre').setTimestamp()]}):reply(c,'❌ Şu anda çalan bir şarkı yok.',true)});
simple('volume','Müzik sesini ayarlar.',async c=>{const n=Math.min(100,Math.max(0,num(c,'level',80)));return reply(c,musicVolume(c.guild.id,n)?`🔊 Ses seviyesi **%${n}** olarak ayarlandı.`:'❌ Çalan bir müzik yok.',true)},()=>base('volume','Müzik sesini ayarlar.').addIntegerOption(o=>o.setName('level').setDescription('0-100').setMinValue(0).setMaxValue(100).setRequired(true)));
simple('loop','Tekrar modunu ayarlar.',async c=>{const raw=(c.interaction?.options.getString('mode')||c.args.shift()||'off') as 'off'|'track'|'queue';const mode=(['off','track','queue'].includes(raw)?raw:'off') as 'off'|'track'|'queue';musicLoop(c.guild.id,mode);return reply(c,`🔁 Tekrar modu: **${mode==='off'?'Kapalı':mode==='track'?'Şarkı':'Kuyruk'}**`);},()=>base('loop','Tekrar modunu ayarlar.').addStringOption(o=>o.setName('mode').setDescription('Tekrar modu').setRequired(true).addChoices({name:'Kapalı',value:'off'},{name:'Şarkı',value:'track'},{name:'Kuyruk',value:'queue'})));
simple('shuffle','Müzik kuyruğunu karıştırır.',async c=>reply(c,musicShuffle(c.guild.id)?'🔀 Kuyruk karıştırıldı.':'❌ Kuyruk bulunamadı.',true));
simple('remove','Kuyruktan bir parçayı çıkarır.',async c=>{const n=num(c,'position',0),r=musicRemove(c.guild.id,n);return reply(c,r?`🗑️ **${r.title}** kuyruktan çıkarıldı.`:'❌ Bu sırada bir parça yok.',true)},()=>base('remove','Kuyruktan bir parçayı çıkarır.').addIntegerOption(o=>o.setName('position').setDescription('Kuyruktaki sıra').setMinValue(1).setRequired(true)));
// UTILITY: poll, suggestion, remind, afk, starboard
simple('anket','Anket oluşturur.',async c=>{const q=str(c,'question');const ch=c.interaction?.channel as any;const m=await ch?.send({embeds:[embed('📊 ANKET',q)],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('poll:yes').setLabel('Evet').setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId('poll:no').setLabel('Hayır').setStyle(ButtonStyle.Danger))]});return c.interaction?.reply({content:`✅ Anket oluşturuldu: ${m?.url}`,flags:MessageFlags.Ephemeral})},()=>base('anket','Evet/Hayır anketi oluşturur.').addStringOption(o=>o.setName('question').setDescription('Soru').setRequired(true)));
simple('öneri','Öneri gönderir.',async c=>{const text=str(c,'text');const chId=guild(c.guild.id).config.logChannels.suggestion||guild(c.guild.id).config.logChannels.server;const ch=chId?c.guild.channels.cache.get(chId):c.interaction?.channel;if(ch?.isTextBased())await (ch as TextChannel).send({embeds:[embed('💡 Öneri',`${c.member}: ${text}`)]});return reply(c,'💡 Önerin alındı. Teşekkürler!',true)},()=>base('öneri','Sunucuya öneri gönderir.').addStringOption(o=>o.setName('text').setDescription('Öneri').setRequired(true)));
simple('remind','Hatırlatıcı kurar.',async c=>{const when=parseDuration(str(c,'duration')),text=str(c,'text');if(when<1000)return reply(c,'❌ Geçerli süre gir.',true);guild(c.guild.id).reminders.push({user:c.member.id,channel:c.interaction?.channelId,text,at:Date.now()+when});mutate(()=>{});return reply(c,`⏰ Hatırlatıcı kuruldu: <t:${Math.floor((Date.now()+when)/1000)}:R>`);},()=>base('remind','Hatırlatıcı kurar.').addStringOption(o=>o.setName('duration').setDescription('örn. 30m').setRequired(true)).addStringOption(o=>o.setName('text').setDescription('Hatırlatma').setRequired(true)));
simple('afk','AFK durumunu ayarlar.',async c=>{const text=(str(c,'reason')||'AFK').trim()||'AFK';const u=user(c.guild.id,c.member.id);u.afk=text;const cleanName=c.member.displayName.replace(/^\[AFK\]\s*/i,'').trim();const afkName=`[AFK] ${cleanName}`.slice(0,32);let renamed=false;try{await c.member.setNickname(afkName);renamed=true;}catch(e){console.error('AFK isim değişikliği başarısız:',e);}mutate(()=>{});return reply(c,{embeds:[embed('💤 AFK Modu',`AFK durumun etkinleştirildi.\n\n📝 **Sebep:** ${text}\n🏷️ İsim etiketi: ${renamed?'**[AFK]** eklendi.':'**[AFK]** eklenemedi; botun **Takma Adları Yönet** yetkisini ve rol hiyerarşisini kontrol et.'}`)]})},()=>base('afk','AFK durumunu ayarlar.').addStringOption(o=>o.setName('reason').setDescription('AFK sebebin').setMaxLength(200)));

// SERVER INFO / ROLE / CHANNEL
staffCmd('role-info','Rol bilgisi gösterir.',async c=>{const r=role(c);if(!r)return reply(c,'❌ Rol yok.',true);return reply(c,{embeds:[embed(`🎭 ${r.name}`,`ID: \`${r.id}\`\nÜye: **${r.members.size}**\nMentionable: **${r.mentionable?'Evet':'Hayır'}**\nPozisyon: **${r.position}**`)]})},()=>base('role-info','Rol bilgisi gösterir.').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addRoleOption(o=>o.setName('role').setDescription('Rol').setRequired(true)));
staffCmd('channel-info','Kanal bilgisi gösterir.',async c=>{const ch=channel(c);if(!ch)return reply(c,'❌ Kanal yok.',true);return reply(c,{embeds:[embed(`📺 ${ch.name}`,`ID: \`${ch.id}\`\nTip: **${ChannelType[ch.type]}**\nKategori: **${(ch as any).parent?.name||'Yok'}**`)]})},()=>base('channel-info','Kanal bilgisi gösterir.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).addChannelOption(o=>o.setName('channel').setDescription('Kanal').setRequired(true)));

// EVENT HANDLERS
async function recentAuditActor(g:Guild,type:AuditLogEvent,targetId?:string){try{const logs=await g.fetchAuditLogs({type,limit:6});const entry=logs.entries.find(e=>Date.now()-e.createdTimestamp<10000&&(!targetId||e.target?.id===targetId));return entry?.executor||undefined;}catch{return undefined;}}
client.once('clientReady',async()=>{let refunded=0;try{refunded=refundInterruptedBets();}catch(e){console.error("KRİTİK: Yarım kalan bahisler iade edilemedi; Nexus güvenlik nedeniyle kapatılıyor:",e);process.exit(1);}if(refunded)console.log('✓ '+refunded+' yarım kalan bahis iade edildi.');console.log(`NEXUS hazır: ${client.user?.tag}`);client.user?.setActivity('sunucularını yönetiyor', {type:ActivityType.Watching});try{await initMusic();console.log('✓ Müzik altyapısı hazır.');}catch(e){console.error('Müzik altyapısı hazırlanamadı:',e);}await registerCommands();});
client.on('messageDelete',async m=>{if(m.guild&&!m.author?.bot){const actor=await recentAuditActor(m.guild,AuditLogEvent.MessageDelete,m.author?.id);await log(m.guild,'🗑️ MESAJ SİLİNDİ',`Kanal: <#${m.channelId}>\nİçerik: ${clean(m.content||'[içerik yok]').slice(0,1000)}`,'message',actor,m.author);}});
client.on('messageUpdate',async (oldM,newM)=>{if(newM.guild&&!newM.author?.bot&&oldM.content!==newM.content)await log(newM.guild,'MESAJ DÜZENLENDİ',`Kanal: <#${newM.channelId}>\nYazar: ${newM.author?.tag||'Bilinmiyor'}\nEski: ${clean(oldM.content||'').slice(0,400)}\nYeni: ${clean(newM.content||'').slice(0,400)}`,'message');});
client.on('channelCreate',async ch=>{const x:any=ch;if(x.guild){const actor=await recentAuditActor(x.guild,AuditLogEvent.ChannelCreate,x.id);await log(x.guild,'📺 KANAL OLUŞTURULDU',`Kanal: ${x}`,'channel',actor);}});
client.on('channelDelete',async ch=>{const x:any=ch;if(x.guild){if(typeof x.topic==='string'&&x.topic.startsWith('NEXUS-TICKET|'))return;const actor=await recentAuditActor(x.guild,AuditLogEvent.ChannelDelete,x.id);await log(x.guild,'🗑️ KANAL SİLİNDİ',`Kanal: **#${x.name}**`,'channel',actor);}});
client.on('roleCreate',async r=>{const actor=await recentAuditActor(r.guild,AuditLogEvent.RoleCreate,r.id);await log(r.guild,'🎭 ROL OLUŞTURULDU',`Rol: ${r}`,'role',actor);});
client.on('roleDelete',async r=>{const actor=await recentAuditActor(r.guild,AuditLogEvent.RoleDelete,r.id);await log(r.guild,'🗑️ ROL SİLİNDİ',`Rol: **${r.name}**`,'role',actor);});
client.on('guildMemberAdd',async m=>{const cfg=guild(m.guild.id).config;const rid=m.user.bot?cfg.autorole?.bot:cfg.autorole?.member;if(rid){const r=m.guild.roles.cache.get(rid);if(r)await m.roles.add(r).catch(e=>console.error(`Autorole atanamadı (${m.guild.id}/${m.id}):`,e));}if(cfg.welcome){const ch=m.guild.channels.cache.get(cfg.welcome.channel);if(ch?.isTextBased()){const welcomeText=cfg.welcome.message.replaceAll('{user}',m.toString()).replaceAll('{server}',m.guild.name);await (ch as TextChannel).send({embeds:[new EmbedBuilder().setColor(0x5865f2).setAuthor({name:'⚔️ NEXUS • HOŞ GELDİN'}).setTitle(`🌟 ${m.displayName} aramıza katıldı!`).setDescription(welcomeText).setThumbnail(m.user.displayAvatarURL({size:512})).setFooter({text:`${m.guild.name} • Yeni Üye`}).setTimestamp()]});}}await log(m.guild,'ÜYE GİRİŞ',`${m} sunucuya katıldı.`,'member');});
client.on('guildMemberRemove',async m=>{const cfg=guild(m.guild.id).config;if(cfg.leave){const ch=m.guild.channels.cache.get(cfg.leave.channel);if(ch?.isTextBased())await (ch as TextChannel).send(cfg.leave.message.replaceAll('{user}',m.user.tag).replaceAll('{server}',m.guild.name));}await log(m.guild,'ÜYE ÇIKIŞ',`${m.user.tag} sunucudan ayrıldı.`,'member');});
client.on('messageCreate',async m=>{if(m.author.bot||!m.guild)return;const u=user(m.guild.id,m.author.id),cfg=guild(m.guild.id).config;

 if(!ignored(m.member!,m.channelId,'level')){u.messages++;if(Date.now()-u.lastXp>=45000){u.xp+=Math.floor(Math.random()*3)+2;u.lastXp=Date.now();let leveledUp=false;while(u.xp>=totalXpForLevel(u.level+1)){u.level++;leveledUp=true;}if(leveledUp){const levelChannel=cfg.levelChannel?m.guild.channels.cache.get(cfg.levelChannel):null;const targetChannel=levelChannel?.isTextBased()?levelChannel:m.channel;targetChannel.send('🏆 '+m.author+', seviye **'+u.level+'** oldun!').catch(()=>{});}}}mutate(()=>{});if(u.afk&&m.content){u.afk=undefined;await m.member?.setNickname(m.member.displayName.replace(/^\[AFK\]\s*/i,'').slice(0,32)).catch(()=>{});mutate(()=>{});m.reply('👋 AFK durumun kaldırıldı.').catch(()=>{});}for(const [id,x] of Object.entries(guild(m.guild.id).users)){if(x.afk&&m.mentions.users.has(id))m.reply(`💤 <@${id}> şu anda AFK.\n📝 **Sebep:** ${String(x.afk||'AFK')}`).catch(()=>{});}const prefix=cfg.prefix;if(!m.content.startsWith(prefix))return;const raw=m.content.slice(prefix.length).trim();if(!raw)return;const parts=raw.split(/\s+/),name=parts.shift()!.toLowerCase();
 if(name==='yetki'){
  if(!m.member.permissions.has(PermissionFlagsBits.Administrator))return m.reply('❌ Bu komut için Discord Administrator yetkisine sahip olmalısın.');
  const e=new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Özel Yetki Yönetimi').setDescription('Özel NEXUS yetkisi vermek veya kaldırmak için önce hedef türünü seç.\n\n👤 **Kullanıcı** — birden fazla kullanıcı seçebilirsin.\n🎭 **Rol** — birden fazla rol seçebilirsin.').setFooter({text:'Bu sistem Discord rollerinin teknik izinlerini değiştirmez; NEXUS komut erişimini yönetir.'}).setTimestamp();
  const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:target:user:${m.author.id}`).setLabel('👤 Kullanıcıya Yetki').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId(`perm:target:role:${m.author.id}`).setLabel('🎭 Role Yetki').setStyle(ButtonStyle.Secondary));
  return m.channel.send({embeds:[e],components:[row]});
 }
 const cmd=commands.get(name)||undefined;const custom=guild(m.guild.id).customCommands[name];if(custom)return m.channel.send(custom.replaceAll('{user}',m.author.toString()).replaceAll('{userTag}',m.author.tag).replaceAll('{server}',m.guild.name).replaceAll('{channel}',m.channel.toString()).replaceAll('{memberCount}',String(m.guild.memberCount)));if(!cmd)return; if(!canUseCommand(m.member!,cmd))return m.reply('❌ Bu komut için gerekli yetkiye sahip değilsin.');try{await cmd.execute({message:m,member:m.member!,guild:m.guild,args:parts});await log(m.guild,'PREFIX KOMUT',`${m.author.tag}: ${m.content}`,'command');}catch(e){console.error(e);m.reply('❌ Komut çalışırken hata oluştu.');}});
client.on('voiceStateUpdate',async (oldS,newS)=>{
 const now=Date.now();
 if(oldS.member&&oldS.channelId){const key=`${oldS.guild.id}:${oldS.member.id}`;const start=voiceStarts.get(key);if(start){user(oldS.guild.id,oldS.member.id).voiceSeconds+=Math.floor((now-start)/1000);voiceStarts.delete(key);mutate(()=>{});}}
 if(newS.member&&newS.channelId)voiceStarts.set(`${newS.guild.id}:${newS.member.id}`,now);
 const cfg=guild(newS.guild.id).config;
 if(newS.channelId===cfg.tempVoice?.lobby&&newS.member){await createTempRoom(newS.guild,newS.member);}
 if(newS.member&&oldS.channelId!==newS.channelId){const key=`${newS.guild.id}:${newS.member.id}`;const start=voiceStarts.get(key);const duration=start?Math.floor((now-start)/1000):0;const detail=oldS.channelId&&newS.channelId?`<@${newS.member.id}>\n${oldS.channelId?`<#${oldS.channelId}>`:''} → ${newS.channelId?`<#${newS.channelId}>`:''}\n\n**Geçiş:** Ses kanalı değiştirildi.`:`<@${newS.member.id}> ${newS.channelId?'ses kanalına katıldı':'ses kanalından ayrıldı'}${!newS.channelId&&duration?`\n**Ses süresi:** ${formatDuration(duration)}`:''}`;await log(newS.guild,'🎙️ SES DURUMU',detail,'voice',newS.member.user,newS.member.user);}
 // Owner leaves: automatically transfer ownership to a remaining member.
 if(oldS.channelId&&tempRoomOwners.has(oldS.channelId)&&oldS.member?.id===tempRoomOwners.get(oldS.channelId)){
  const roomId=oldS.channelId;
  const room=oldS.guild.channels.cache.get(roomId) as VoiceChannel|null;
  if(room?.isVoiceBased()){
   const nextOwner=room.members.first();
   if(nextOwner){
    tempRoomOwners.set(roomId,nextOwner.id);
    await room.permissionOverwrites.edit(nextOwner.id,{ViewChannel:true,Connect:true,ManageChannels:true,MoveMembers:true}).catch(()=>{});
    await room.permissionOverwrites.edit(oldS.member.id,{ManageChannels:false,MoveMembers:false}).catch(()=>{});
    const controlId=tempRoomControls.get(roomId);
    if(controlId){const control=oldS.guild.channels.cache.get(controlId);if(control){await control.permissionOverwrites.edit(nextOwner.id,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true}).catch(()=>{});await control.permissionOverwrites.edit(oldS.member.id,{ViewChannel:false,SendMessages:false,ReadMessageHistory:false}).catch(()=>{});}}
    await refreshRoomPanel(room).catch(()=>{});
   }
  }
 }
 // Any tracked room that becomes empty is removed shortly after the last member leaves.
 if(oldS.channelId&&tempRoomOwners.has(oldS.channelId)){
  const roomId=oldS.channelId;
  setTimeout(()=>cleanupTempRoom(oldS.guild,roomId),250);
 }
});


async function cleanupTempRoom(g:Guild,roomId:string){
 const ch=g.channels.cache.get(roomId) as VoiceChannel|null;
 if(!ch?.isVoiceBased()||ch.members.size>0)return false;
 const controlId=tempRoomControls.get(roomId);
 if(controlId)await g.channels.cache.get(controlId)?.delete().catch(()=>{});
 await ch.delete().catch(()=>{});
 tempRoomOwners.delete(roomId);tempRoomPanel.delete(roomId);tempRoomControls.delete(roomId);
 return true;
}

async function createTempRoom(g:Guild,m:GuildMember){
 const existing=g.channels.cache.find(ch=>tempRoomOwners.get(ch.id)===m.id);
 if(existing&&existing.isVoiceBased()){await m.voice.setChannel(existing).catch(()=>{});return existing;}
 const cfg=guild(g.id).config;
 const parentId=cfg.tempVoice?.category||m.voice.channel?.parentId||undefined;
 const ch=await g.channels.create({name:`🔊 ${m.displayName}`,type:ChannelType.GuildVoice,parent:parentId,permissionOverwrites:[
  {id:g.roles.everyone.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.Connect]},
  {id:m.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.Connect,PermissionFlagsBits.ManageChannels,PermissionFlagsBits.MoveMembers]}
 ]});
 tempRoomOwners.set(ch.id,m.id);
 await m.voice.setChannel(ch).catch(()=>{});
 await sendRoomPanel(ch,m).catch(()=>{});
 return ch;
}

async function sendRoomPanel(ch:VoiceChannel,owner:GuildMember){
 const g=ch.guild;
 const control=await g.channels.create({
  name:`🔧・${ch.name.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ -]/g,'').trim().slice(0,70)||'oda'}-kontrol`,
  type:ChannelType.GuildText,
  parent:ch.parentId||undefined,
  permissionOverwrites:[
   {id:g.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
   {id:owner.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},
   {id:g.members.me!.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels]}
  ]
 }).catch(()=>null);
 if(!control)return;
 tempRoomControls.set(ch.id,control.id);
 const e=roomPanelEmbed(ch,owner);
 const rows=roomPanelRows(ch);
 const msg=await control.send({embeds:[e],components:rows}).catch(()=>null);
 if(msg)tempRoomPanel.set(ch.id,msg.id);
}

function roomPanelEmbed(ch:VoiceChannel,owner:GuildMember){
 const everyone=ch.guild.roles.everyone;
 const ow=ch.permissionOverwrites.cache.get(everyone.id);
 const hidden=ow?.deny.has(PermissionFlagsBits.ViewChannel);
 const locked=ow?.deny.has(PermissionFlagsBits.Connect);
 return new EmbedBuilder().setColor(0x5865f2).setTitle('🔊 Özel Oda Kontrol Merkezi').setDescription(`**${ch.name}**\n\nOdanın sahibi: ${owner}\nKişi sınırı: **${ch.userLimit||'Sınırsız'}**\nGörünürlük: **${hidden?'Gizli':'Herkese Açık'}**\nDurum: **${locked?'Kilitli':'Açık'}**\n\nAşağıdaki menü ve butonlarla odanı yönetebilirsin.`).addFields({name:'🎛️ Oda Yönetimi',value:'🔢 Kapasite • 👁️ Görünürlük • 👥 Üye yönetimi\n✏️ Oda adı • 🔒 Kilitle/Aç • 👑 Sahiplik • 🗑️ Kapat'}).setFooter({text:'Bu panel yalnızca oda sahibi tarafından kullanılabilir.'}).setTimestamp();
}

function roomPanelRows(ch:VoiceChannel){
 const locked=ch.permissionOverwrites.cache.get(ch.guild.roles.everyone.id)?.deny.has(PermissionFlagsBits.Connect);
 return [
  new ActionRowBuilder<ButtonBuilder>().addComponents(
   new ButtonBuilder().setCustomId(`room:limit:${ch.id}`).setLabel('🔢 Kişi Sınırı').setStyle(ButtonStyle.Primary),
   new ButtonBuilder().setCustomId(`room:visibility:${ch.id}`).setLabel('👁️ Görünürlük').setStyle(ButtonStyle.Secondary),
   new ButtonBuilder().setCustomId(`room:togglelock:${ch.id}`).setLabel(locked?'🔓 Kilidi Aç':'🔒 Kilitle').setStyle(locked?ButtonStyle.Success:ButtonStyle.Secondary)
  ),
  new ActionRowBuilder<ButtonBuilder>().addComponents(
   new ButtonBuilder().setCustomId(`room:members:${ch.id}`).setLabel('👥 Üye Yönetimi').setStyle(ButtonStyle.Primary),
   new ButtonBuilder().setCustomId(`room:name:${ch.id}`).setLabel('✏️ Oda Adı').setStyle(ButtonStyle.Secondary),
   new ButtonBuilder().setCustomId(`room:owner:${ch.id}`).setLabel('👑 Sahipliği Devret').setStyle(ButtonStyle.Secondary),
   new ButtonBuilder().setCustomId(`room:close:${ch.id}`).setLabel('🗑️ Kapat').setStyle(ButtonStyle.Danger)
  )
 ];
}

async function refreshRoomPanel(ch:VoiceChannel){
 const controlId=tempRoomControls.get(ch.id); const messageId=tempRoomPanel.get(ch.id); if(!controlId||!messageId)return;
 const control=ch.guild.channels.cache.get(controlId); if(!control?.isTextBased())return;
 const msg=await (control as TextChannel).messages.fetch(messageId).catch(()=>null); if(!msg)return;
 const ownerId=tempRoomOwners.get(ch.id); const owner=ownerId?await ch.guild.members.fetch(ownerId).catch(()=>null):null; if(!owner)return;
 await msg.edit({embeds:[roomPanelEmbed(ch,owner)],components:roomPanelRows(ch)}).catch(()=>{});
}

function roomIdFromInteraction(i:ButtonInteraction|UserSelectMenuInteraction|ModalSubmitInteraction){if(!i.guild)return undefined;const cid=i.channelId;if(cid&&tempRoomOwners.has(cid))return cid;for(const [roomId,controlId] of tempRoomControls){if(controlId===cid)return roomId;}return undefined;}
function isRoomOwner(i:ButtonInteraction|UserSelectMenuInteraction|ModalSubmitInteraction){const id=roomIdFromInteraction(i);return !!id&&tempRoomOwners.get(id)===i.user.id;}

client.on('interactionCreate',async i=>{try{if(i.isButton())return await button(i);if(i.isStringSelectMenu())return await select(i);if(i.isUserSelectMenu())return await roomUserSelect(i);if(i.isRoleSelectMenu())return await permissionRoleSelect(i);if(i.isModalSubmit())return await roomModal(i);if(!i.isChatInputCommand()||!i.guild)return;const cmd=commands.get(i.commandName);if(!cmd)return;if(!canUseCommand(i.member as GuildMember,cmd))return i.reply({content:'❌ Bu komut için gerekli yetkiye sahip değilsin.',flags:MessageFlags.Ephemeral});try{await cmd.execute({interaction:i,member:i.member as GuildMember,guild:i.guild,args:[]});await log(i.guild,'SLASH KOMUT',`${i.user.tag}: /${i.commandName}`,'command');}catch(e){console.error(e);if(i.replied||i.deferred)i.followUp({content:'❌ Komut çalışırken hata oluştu.',flags:MessageFlags.Ephemeral}).catch(()=>{});else i.reply({content:'❌ Komut çalışırken hata oluştu.',flags:MessageFlags.Ephemeral}).catch(()=>{});}}catch(error){console.error('interactionCreate hatası:',error);if('isRepliable' in i && i.isRepliable() && !i.replied && !i.deferred){await i.reply({content:'❌ İşlem sırasında beklenmeyen bir hata oluştu.',flags:MessageFlags.Ephemeral}).catch(()=>{});}}});
function getHelpDefs(m:GuildMember){
 const defs:[string,string,ButtonStyle, string][]=[['help:general','🌐 Genel',ButtonStyle.Primary,'general'],['help:moderation','🛡️ Moderasyon',ButtonStyle.Danger,'moderation'],['help:management','⚙️ Yönetim',ButtonStyle.Secondary,'management'],['help:stats','📊 Seviye & İstatistik',ButtonStyle.Success,'stats'],['help:economy','💰 Ekonomi',ButtonStyle.Success,'economy'],['help:fun','🎉 Eğlence',ButtonStyle.Primary,'fun']];
 const groups:Record<string,string[]>={general:['ping','help','sunucu','uye','avatar','join','play','queue','nowplaying','pause','resume','skip','stop','volume','loop','shuffle','remove','leave'],moderation:['purge','kick','ban','timeout','untimeout','warn','warnings','slowmode','lock','unlock'],management:['prefix','ignore','level-ignore','seviye-kanal','seviye-sifirla','autorole','rolver','rolal','role-info','channel-info','özel-kanal','tempvoice','custom','yetki','ticket','say','leave-message'],stats:['profil','rank','seviye-top','mesaj-top','ses-top','leaderboard','stats','serverstats','uzmanlasma'],economy:['ekonomi','balance','daily','deposit','withdraw','pay','coinflip','dice','zar','slots','blackjack','zenginler','paraekle'],fun:['anket','öneri','remind','afk','oda']};
 return defs.filter(([, , ,cat])=>groups[cat].some(n=>{const c=commands.get(n);return c&&visibleCommand(m,c);})).map(([id,label,style])=>[id,label,style] as [string,string,ButtonStyle]);
}

async function button(i:ButtonInteraction){if(!i.guild)return;
 if(i.customId.startsWith('spec:cancel:')){
  const sessionId=i.customId.split(':')[2];
  const session=specializationSessions.get(sessionId);
  if(!session||session.guildId!==i.guild.id||session.userId!==i.user.id)
   return i.reply({content:'Bu uzmanlik oturumu gecersiz veya suresi dolmus.',flags:MessageFlags.Ephemeral});
  specializationSessions.delete(sessionId);
  return i.update({content:'Uzmanlik islemi iptal edildi.',embeds:[],components:[]});
 }
 if(i.customId.startsWith('spec:confirm:')){
  const sessionId=i.customId.split(':')[2];
  const session=specializationSessions.get(sessionId);
  if(!session||session.guildId!==i.guild.id||session.userId!==i.user.id)
   return i.reply({content:'Bu uzmanlik oturumu gecersiz veya suresi dolmus.',flags:MessageFlags.Ephemeral});
  if(Date.now()-session.createdAt>120000){
   specializationSessions.delete(sessionId);
   return i.update({content:'Uzmanlik oturumunun suresi doldu. Komutu yeniden kullanabilirsin.',embeds:[],components:[]});
  }
  if(session.processing)
   return i.reply({content:'Uzmanlik islemin zaten isleniyor.',flags:MessageFlags.Ephemeral});
  if(!session.professionId||!session.specializationId)
   return i.reply({content:'Once bir uzmanlik dali secmelisin.',flags:MessageFlags.Ephemeral});
  session.processing=true;
  const wallet=user(i.guild.id,i.user.id);
  const profile=wallet.rpg||{};
  const current=profile.mainSpecialization;
  const count=profile.specializationChangeCount??0;
  if((current?.professionId||null)!==session.expectedProfessionId||
     (current?.specializationId||null)!==session.expectedSpecializationId||
     count!==session.expectedCount){
   specializationSessions.delete(sessionId);
   return i.update({content:'Uzmanlik bilgilerin bu menu acildiktan sonra degismis. Lutfen komutu yeniden kullan.',embeds:[],components:[]});
  }
  const result=changeMainSpecialization(
   wallet,
   session.professionId,
   session.specializationId,
   persist
  );
  specializationSessions.delete(sessionId);
  if(!result.ok){
   const messages={
    invalid_change_count:'Uzmanlik degisiklik sayaci gecersiz.',
    invalid_balance:'Cuzdan bakiyesi gecersiz.',
    insufficient_funds:'Bu uzmanlik degisikligi icin yeterli \u25C8 bakiyen yok.',
    active_battle:'Savas sirasinda uzmanlik degistiremezsin.',
    unknown_profession:'Meslek bulunamadi.',
    unknown_specialization:'Uzmanlik dali bulunamadi.',
    persistence_failed:'Kayit islemi basarisiz oldu. Bakiyen ve uzmanligin geri yuklendi.'
   };
   return i.update({content:messages[result.reason]||'Uzmanlik islemi tamamlanamadi.',embeds:[],components:[]});
  }
  const selected=RPG_PROFESSIONS.find(p=>p.id===session.professionId);
  const branch=selected?.specializations.find(x=>x.id===session.specializationId);
  const message=result.changed
   ? 'Uzmanligin **'+(selected?.name||session.professionId)+' / '+(branch?.name||session.specializationId)+'** olarak ayarlandi.\nOdenen ucret: **'+result.charged.toLocaleString('tr-TR')+' \u25C8**'
   : 'Bu uzmanlik zaten ana uzmanligin. Herhangi bir ucret alinmadi.';
  return i.update({content:message,embeds:[],components:[]});
 }
 if(i.customId.startsWith('levelreset:')){
  const [,action,guildId,adminId,sessionId]=i.customId.split(':');
  const session=levelResetSessions.get(sessionId);
  if(guildId!==i.guild.id||adminId!==i.user.id||!i.memberPermissions?.has(PermissionFlagsBits.Administrator)||!session||session.guildId!==guildId||session.adminId!==adminId)
   return i.reply({content:'Bu onay geçersiz, süresi dolmuş veya daha önce kullanılmış.',flags:MessageFlags.Ephemeral});
  if(action==='cancel'){
   levelResetSessions.delete(sessionId);
   return i.update({content:'Seviye sıfırlama iptal edildi.',embeds:[],components:[]});
  }
  if(action==='confirm'){
   levelResetSessions.delete(sessionId);
   const g=guild(i.guild.id);
   for(const u of Object.values(g.users) as any[]){u.xp=0;u.level=0;u.lastXp=0;}
   g.config.xpMin=2;
   g.config.xpMax=4;
   g.config.cooldown=45000;
   mutate(()=>{});
   return i.update({content:'Sunucudaki tüm üyelerin XP ve seviyeleri sıfırlandı. Diğer kullanıcı verileri korundu.',embeds:[],components:[]});
  }
  return i.reply({content:'Geçersiz işlem.',flags:MessageFlags.Ephemeral});
 }
 if(i.customId.startsWith('perm:back:')){const [, ,where,adminId]=i.customId.split(':');if(adminId!==i.user.id)return i.reply({content:'❌ Bu menü yalnızca onu açan yönetici tarafından kullanılabilir.',flags:MessageFlags.Ephemeral});const s=permissionSessions.get(i.user.id);if(!s)return i.reply({content:'❌ Yetki oturumu bulunamadı.',flags:MessageFlags.Ephemeral});if(where==='target'){return i.update({embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Özel Yetki Yönetimi').setDescription('Özel NEXUS yetkisi vermek veya kaldırmak için hedef türünü seç.')],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:target:user:${i.user.id}`).setLabel('👤 Kullanıcıya Yetki').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId(`perm:target:role:${i.user.id}`).setLabel('🎭 Role Yetki').setStyle(ButtonStyle.Secondary))]});}const menu=new StringSelectMenuBuilder().setCustomId(`permcat:${i.user.id}`).setPlaceholder('Yetki kategorisini seç').addOptions(Object.entries(permissionCategoryTitles).map(([value,label])=>({label,value})));return i.update({embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Yetki Yönetimi').setDescription(`**Hedef:** ${permissionTargetLabel(s)}\n\n➕ / ➖ işlemleri için kategori seç.\n📋 Mevcut ve 📚 verilebilecek tüm yetkileri aşağıdaki butonlardan görebilirsin.`)],components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),permissionOverviewButtons(i.user.id)]});}

 if(i.customId.startsWith('perm:view:')){const [, ,mode,adminId]=i.customId.split(':');if(adminId!==i.user.id)return i.reply({content:'❌ Bu menü yalnızca onu açan yönetici tarafından kullanılabilir.',flags:MessageFlags.Ephemeral});const s=permissionSessions.get(i.user.id);if(!s?.targetId)return i.reply({content:'❌ Önce bir kullanıcı veya rol seçmelisin.',flags:MessageFlags.Ephemeral});return i.update({content:'',embeds:[permissionOverviewEmbed(i.guild.id,s,mode as 'current'|'available')],components:[permissionOverviewButtons(i.user.id)]});}
 if(i.customId.startsWith('perm:target:')){const [, ,targetType,adminId]=i.customId.split(':');if(adminId!==i.user.id)return i.reply({content:'❌ Bu menü yalnızca onu açan yönetici tarafından kullanılabilir.',flags:MessageFlags.Ephemeral});permissionSessions.set(i.user.id,{guildId:i.guild.id,targetType:targetType as 'user'|'role',targetId:'',targetIds:[],action:'add'});if(targetType==='user'){const menu=new UserSelectMenuBuilder().setCustomId(`permuser:${i.user.id}`).setPlaceholder('Yetki verilecek kullanıcı(ları) seç').setMinValues(1).setMaxValues(25);return i.update({content:'',embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Kullanıcı Seç').setDescription('Aynı anda **birden fazla kullanıcı** seçebilirsin (en fazla 25 kişi).')],components:[new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu),new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:back:target:${i.user.id}`).setLabel('↩️ Geri').setStyle(ButtonStyle.Secondary))]});}const menu=new RoleSelectMenuBuilder().setCustomId(`permrole:${i.user.id}`).setPlaceholder('Yetki verilecek rol(leri) seç').setMinValues(1).setMaxValues(25);return i.update({content:'',embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Rol Seç').setDescription('Aynı anda **birden fazla rol** seçebilirsin (en fazla 25 rol).')],components:[new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(menu),new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:back:target:${i.user.id}`).setLabel('↩️ Geri').setStyle(ButtonStyle.Secondary))]});}
 if(i.customId.startsWith('perm:action:')){const [, ,action,adminId]=i.customId.split(':');if(adminId!==i.user.id)return i.reply({content:'❌ Bu menü yalnızca onu açan yönetici tarafından kullanılabilir.',flags:MessageFlags.Ephemeral});const s=permissionSessions.get(i.user.id);if(!s?.targetId||!s.category)return i.reply({content:'❌ Önce hedef ve kategori seçmelisin.',flags:MessageFlags.Ephemeral});s.action=action as any;if(action==='view'){const cfg=guild(i.guild.id).config;const targetMap=s.targetType==='user'?cfg.commandUsers:cfg.commandRoles;const items=permissionCatalog[s.category]||[];const granted=items.filter(x=>(targetMap[x.command]||[]).includes(s.targetId));const desc=granted.length?granted.map(x=>`• ${x.label} — \/${x.command}`).join('\n'):'Bu kategoride hedefe atanmış özel NEXUS yetkisi bulunmuyor.';return i.update({content:'',embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('📋 NEXUS • Yetkileri Gör').setDescription(`**Hedef:** ${s.targetType==='user'?`<@${s.targetId}>`:`<@&${s.targetId}>`}\n**Kategori:** ${permissionCategoryTitles[s.category]}\n\n${desc}`)],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:back:category:${i.user.id}`).setLabel('↩️ Kategoriye Dön').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId(`perm:done:${i.user.id}`).setLabel('✅ Tamamla').setStyle(ButtonStyle.Secondary))]});}const items=permissionCatalog[s.category]||[];const menu=new StringSelectMenuBuilder().setCustomId(`permselect:${i.user.id}`).setPlaceholder(action==='add'?'Verilecek yetkileri seç':'Kaldırılacak yetkileri seç').setMinValues(1).setMaxValues(Math.min(25,items.length)).addOptions(items.slice(0,25).map(x=>({label:x.label.replace(/^.{1,2} /,''),value:x.command,description:`/${x.command}`})));return i.update({content:'',embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Yetki Seç').setDescription(`**Hedef:** ${s.targetType==='user'?`<@${s.targetId}>`:`<@&${s.targetId}>`}\n**Kategori:** ${permissionCategoryTitles[s.category]}\n\n${action==='add'?'Verilecek':'Kaldırılacak'} yetkiyi seç.`)],components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:back:category:${i.user.id}`).setLabel('↩️ Geri').setStyle(ButtonStyle.Secondary))]});}
 if(i.customId==='perm:done:'+i.user.id){permissionSessions.delete(i.user.id);return i.update({embeds:[new EmbedBuilder().setColor(0x57f287).setTitle('✅ NEXUS • İşlem Tamamlandı').setDescription('Özel yetki işlemi başarıyla tamamlandı.')],components:[]});}
 if(i.customId.startsWith('room:')){
  if(!isRoomOwner(i))return i.reply({content:'❌ Bu özel odanın sahibi değilsin.',flags:MessageFlags.Ephemeral});
  const [,action,channelId]=i.customId.split(':'); const ch=i.guild.channels.cache.get(channelId) as VoiceChannel|null;
  if(!ch?.isVoiceBased())return i.reply({content:'❌ Oda artık mevcut değil.',flags:MessageFlags.Ephemeral});
  if(action==='limit'){
   const menu=new StringSelectMenuBuilder().setCustomId(`roomlimit:${channelId}`).setPlaceholder('Yeni kişi sınırını seç').addOptions([0,2,3,4,5,6,8,10,15,20,25,50].map(n=>({label:n===0?'Sınırsız':`${n} kişi`,value:String(n),description:n===0?'Kapasite sınırı kaldırılır':`Maksimum ${n} kişi`})));
   return i.reply({content:'🔢 Odanın yeni kişi sınırını seç:',components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)],flags:MessageFlags.Ephemeral});
  }
  if(action==='visibility'){
   const menu=new StringSelectMenuBuilder().setCustomId(`roomvisibility:${channelId}`).setPlaceholder('Görünürlük seç').addOptions([{label:'Herkese Açık',value:'public',description:'Herkes odayı görebilir ve katılabilir'},{label:'Gizli',value:'private',description:'Herkes odayı göremez; yalnızca izinliler görebilir'}]);
   return i.reply({content:'👁️ Odanın görünürlüğünü seç:',components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)],flags:MessageFlags.Ephemeral});
  }
  if(action==='togglelock'){
   const locked=ch.permissionOverwrites.cache.get(i.guild.roles.everyone.id)?.deny.has(PermissionFlagsBits.Connect);
   await ch.permissionOverwrites.edit(i.guild.roles.everyone,{Connect:locked?true:false});
   await refreshRoomPanel(ch);
   return i.reply({content:locked?'🔓 Oda kilidi açıldı.':'🔒 Oda kilitlendi. Yeni üyeler katılamaz.',flags:MessageFlags.Ephemeral});
  }
  if(action==='members'){
   const menu=new UserSelectMenuBuilder().setCustomId(`roommember:${channelId}`).setPlaceholder('Yönetilecek kullanıcıyı seç').setMinValues(1).setMaxValues(1);
   return i.reply({content:'👥 Kullanıcıyı seç; sonraki menüden izin/engelleme işlemini yapacağız.',components:[new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu)],flags:MessageFlags.Ephemeral});
  }
  if(action==='name'){
   const modal=new ModalBuilder().setCustomId(`roomname:${channelId}`).setTitle('Özel Oda Adını Değiştir');
   const input=new TextInputBuilder().setCustomId('name').setLabel('Yeni oda adı').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(90).setRequired(true).setValue(ch.name);
   return i.showModal(modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input)));
  }
  if(action==='owner'){
   const menu=new UserSelectMenuBuilder().setCustomId(`roomowner:${channelId}`).setPlaceholder('Yeni oda sahibini seç').setMinValues(1).setMaxValues(1);
   return i.reply({content:'👑 Yeni oda sahibini seç:',components:[new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu)],flags:MessageFlags.Ephemeral});
  }
  if(action==='close'){
   await i.reply({content:'🗑️ Özel oda kapatılıyor...',flags:MessageFlags.Ephemeral});
   const controlId=tempRoomControls.get(channelId); if(controlId) await i.guild.channels.cache.get(controlId)?.delete().catch(()=>{}); tempRoomOwners.delete(channelId); tempRoomPanel.delete(channelId); tempRoomControls.delete(channelId); await ch.delete().catch(()=>{}); return;
  }
 }
 if(i.customId.startsWith('profile:stats:')||i.customId.startsWith('profile:ranking:')||i.customId.startsWith('profile:economy:')){const parts=i.customId.split(':'),mode=parts[1],targetId=parts[2]||i.user.id;const target=await i.guild.members.fetch(targetId).catch(()=>null);if(!target)return i.reply({content:'❌ Kullanıcı artık sunucuda değil.',flags:MessageFlags.Ephemeral});const u=user(i.guild.id,target.id),g=guild(i.guild.id);if(mode==='stats')return i.update({embeds:[embed('📊 NEXUS • İSTATİSTİK',`**${target.displayName}**\n\n💬 Mesajlar\n**${u.messages.toLocaleString('tr-TR')}**\n\n🎙️ Ses\n**${formatDuration(u.voiceSeconds)}**\n\n📈 XP\n**${u.xp.toLocaleString('tr-TR')}**\n\n🏅 Seviye\n**${u.level}**`)],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`profile:back:${target.id}`).setLabel('↩️ Profil').setStyle(ButtonStyle.Secondary))]});if(mode==='economy')return i.update({embeds:[economyEmbed('💰 Ekonomi',`**${target.displayName}**\n\n👛 Cüzdan: **${u.coins.toLocaleString('tr-TR')} ${g.config.currency}**\n🏦 Banka: **${u.bank.toLocaleString('tr-TR')} ${g.config.currency}**`)],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`profile:back:${target.id}`).setLabel('↩️ Profil').setStyle(ButtonStyle.Secondary))]});const rows=rankRows(g,'xp'),idx=rows.findIndex(x=>x[0]===target.id)+1;return i.update({embeds:[embed('🏆 NEXUS • SIRALAMA',`**${target.displayName}**\n\nSeviye sıralamasındaki yeri: **#${idx||'-'}**\n\nLv.${u.level} • ${u.xp.toLocaleString('tr-TR')} XP`)],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`profile:back:${target.id}`).setLabel('↩️ Profil').setStyle(ButtonStyle.Secondary))]});}
if(i.customId.startsWith('profile:back:')){const targetId=i.customId.split(':')[2]||i.user.id;const target=await i.guild.members.fetch(targetId).catch(()=>null);if(!target)return i.reply({content:'❌ Kullanıcı artık sunucuda değil.',flags:MessageFlags.Ephemeral});const u=user(i.guild.id,target.id),g=guild(i.guild.id),total=u.xp,progress=levelProgress(u.xp,u.level),next=progress.required,rank=rankRows(g,'xp').findIndex(x=>x[0]===target.id)+1;return i.update({embeds:[new EmbedBuilder().setColor(0x5865f2).setAuthor({name:'⚔️ NEXUS • PROFİL'}).setThumbnail(target.displayAvatarURL({size:256})).setTitle(target.displayName).setDescription(`**${target.user.tag}**\n\n📈 **Seviye ${u.level}**\n${progressBar(progress.current,progress.required)}\n**${progress.current.toLocaleString('tr-TR')} / ${next.toLocaleString('tr-TR')} XP**`).addFields({name:'💬 Mesaj',value:String(u.messages),inline:true},{name:'🎙️ Ses',value:formatDuration(u.voiceSeconds),inline:true},{name:'🏆 Sıra',value:`#${rank||'-'}`,inline:true},{name:'💰 Cüzdan',value:`${u.coins} ${g.config.currency}`,inline:true}).setTimestamp()],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`profile:stats:${target.id}`).setLabel('📊 İstatistikler').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId(`profile:ranking:${target.id}`).setLabel('🏆 Sıralaması').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId(`profile:economy:${target.id}`).setLabel('💰 Ekonomi').setStyle(ButtonStyle.Success))]});}
if(i.customId.startsWith('coin:yazi:')||i.customId.startsWith('coin:tura:')){const parts=i.customId.split(':'),choice=parts[1],uid=parts[2],key=gameKey(i.guild.id,uid,'coinflip');if(uid!==i.user.id)return i.reply({content:'❌ Bu coinflip oyunu sana ait değil veya süresi doldu.',flags:MessageFlags.Ephemeral});const game=coinflipGames.get(key);if(!game)return i.reply({content:'❌ Bu coinflip oyunu zaten tamamlanmış veya süresi dolmuş.',flags:MessageFlags.Ephemeral});if(Date.now()-game.created>=BET_GAME_TIMEOUT){cleanupExpiredBets();const pending=user(i.guild.id,uid).activeBet;return i.reply({content:pending?'⌛ Coinflip süresi doldu ancak bahis güvenli biçimde sonuçlandırılamadı; lütfen yönetime bildir.':'⌛ Coinflip süresi doldu; bahis kaydı sonuçlandırıldı.',flags:MessageFlags.Ephemeral});}const result=Math.random()<.5?'yazi':'tura',win=choice===result,payout=win?game.amount*2:0;try{if(!settleBet(i.guild.id,uid,'coinflip',payout))return i.reply({content:'❌ Bahis sonuçlandırılamadı; oyun artık geçerli değil.',flags:MessageFlags.Ephemeral});}catch(e){console.error('Coinflip bahsi sonuçlandırılamadı:',e);technicalRefundBetKeys.add(betPlayerKey(i.guild.id,uid));return i.reply({content:'❌ Sonuç kaydedilemedi. Lütfen yönetime bildir.',flags:MessageFlags.Ephemeral});}coinflipGames.delete(key);setGameCooldown(key,5000);const u=user(i.guild.id,uid);await i.deferUpdate();await i.editReply({embeds:[economyEmbed('🪙 Coinflip','Para havaya atılıyor...\n\n🎞️ **Sonuç belirleniyor...**')],components:[],files:[new AttachmentBuilder(path.resolve(__dirname,'..','assets','coinflip.gif'),{name:'coinflip.gif'})]}).catch(async e=>{console.error('Coinflip animasyon mesajı güncellenemedi:',e);await i.followUp({content:'Bahsin sonuçlandı; animasyon mesajı güncellenemedi. Sonuç mesajı birazdan güncellenecek.',flags:MessageFlags.Ephemeral}).catch(()=>{});});await new Promise(r=>setTimeout(r,1300));return i.editReply({embeds:[economyEmbed('🪙 Coinflip',`Sonuç: **${result==='yazi'?'Yazı':'Tura'}**\n\n${win?`🎉 **Kazandın! +${game.amount} ◈**`:`💸 **Kaybettin! -${game.amount} ◈**`}\n\nYeni bakiye: **${u.coins} ◈**\n\nYeni oyun için **/coinflip** komutunu kullanabilirsin.`)],components:[],attachments:[]}).catch(async e=>{console.error('Coinflip sonuç mesajı gönderilemedi:',e);await i.followUp({content:'Coinflip bahsin sonuçlandı ancak sonuç mesajı gönderilemedi. Güncel bakiyen: '+u.coins+' ◈.',flags:MessageFlags.Ephemeral}).catch(()=>{});});}
if(i.customId.startsWith('dice:roll:')){const uid=i.customId.split(':')[2],key=gameKey(i.guild.id,uid,'dice'),game=diceGames.get(key);if(!game||uid!==i.user.id)return i.reply({content:'❌ Bu zar oyunu sana ait değil veya süresi doldu.',flags:MessageFlags.Ephemeral});if(Date.now()-game.created>=BET_GAME_TIMEOUT){cleanupExpiredBets();const pending=user(i.guild.id,uid).activeBet;return i.reply({content:pending?'⌛ Zar oyununun süresi doldu ancak bahis güvenli biçimde sonuçlandırılamadı; lütfen yönetime bildir.':'⌛ Zar oyununun süresi doldu; bahis kaydı sonuçlandırıldı.',flags:MessageFlags.Ephemeral});}const a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*6),payout=a>b?game.amount*2:a===b?game.amount:0;try{if(!settleBet(i.guild.id,uid,'dice',payout))return i.reply({content:'❌ Bahis sonuçlandırılamadı; oyun artık geçerli değil.',flags:MessageFlags.Ephemeral});}catch(e){console.error('Zar bahsi sonuçlandırılamadı:',e);technicalRefundBetKeys.add(betPlayerKey(i.guild.id,uid));return i.reply({content:'❌ Sonuç kaydedilemedi. Lütfen yönetime bildir.',flags:MessageFlags.Ephemeral});}diceGames.delete(key);setGameCooldown(key,8000);const u=user(i.guild.id,uid),delta=payout===0?-game.amount:payout-game.amount;await i.deferUpdate();return i.editReply({embeds:[economyEmbed('🎲 Zar Oyunu',`👤 **Sen:** ${diceFace(a)} **${a}**
🎩 **Krupiye:** ${diceFace(b)} **${b}**

${a===b?'🤝 Berabere — bahis iade edildi.':delta>0?`🎉 **Kazandın! +${delta} ◈**`:`💸 **Kaybettin! -${game.amount} ◈**`}

Bakiye: **${u.coins} ◈**`)],components:[]}).catch(async e=>{console.error("Zar sonuç mesajı gönderilemedi:",e);await i.followUp({content:"Zar bahsin sonuçlandı ancak sonuç mesajı gönderilemedi. Güncel bakiyen: "+u.coins+" ◈.",flags:MessageFlags.Ephemeral}).catch(()=>{});});}
if(i.customId.startsWith('bj:')){const parts=i.customId.split(':'),uid=parts[2],key=gameKey(i.guild.id,uid,'blackjack'),game=blackjackGames.get(key),action=parts[1];if(!game||uid!==i.user.id)return i.reply({content:'❌ Bu blackjack oyunu sana ait değil veya süresi doldu.',flags:MessageFlags.Ephemeral});if(Date.now()-game.created>=BET_GAME_TIMEOUT){cleanupExpiredBets();const pending=user(i.guild.id,uid).activeBet;return i.reply({content:pending?'⌛ Blackjack süresi doldu ancak bahis güvenli biçimde sonuçlandırılamadı; lütfen yönetime bildir.':'⌛ Blackjack süresi doldu; bahis kaydı sonuçlandırıldı.',flags:MessageFlags.Ephemeral});}const u=user(i.guild.id,uid);if(action==='hit'){const card=game.deck.pop();if(!card){try{if(!settleBet(i.guild.id,uid,'blackjack',game.bet))throw new Error('Blackjack teknik hata iadesi sonuçlandırılamadı.');}catch(e){console.error('Blackjack teknik hata iadesi başarısız:',e);technicalRefundBetKeys.add(betPlayerKey(i.guild.id,uid));return i.reply({content:'❌ Deste tükendi ve bahis iade edilemedi. Lütfen yönetime bildir.',flags:MessageFlags.Ephemeral});}blackjackGames.delete(key);setGameCooldown(key,5000);return i.reply({content:'❌ Deste tükendi; oyun iptal edildi ve **bahsin iade edildi.**',flags:MessageFlags.Ephemeral});}game.player.push(card);const pv=handValue(game.player);if(pv>21){try{if(!settleBet(i.guild.id,uid,'blackjack',0))throw new Error('Blackjack kaybı sonuçlandırılamadı.');}catch(e){console.error('Blackjack kayıp kaydı başarısız:',e);technicalRefundBetKeys.add(betPlayerKey(i.guild.id,uid));return i.reply({content:'❌ Sonuç kaydedilemedi. Lütfen yönetime bildir.',flags:MessageFlags.Ephemeral});}blackjackGames.delete(key);setGameCooldown(key,5000);return i.update({embeds:[economyEmbed('🃏 Blackjack',`${blackjackText(game,false)}\n\n💥 **21 aştın. -${game.bet} ◈**\nBakiye: **${u.coins} ◈**`)],components:[]});}if(pv!==21)return i.update({embeds:[economyEmbed('🃏 Blackjack',`${blackjackText(game,true)}\n\n🎯 Kart çek veya **Pas** de.`)],components:[gameButtons(i.user.id,[{id:'bj:hit',label:'🃏 Kart Çek',style:ButtonStyle.Primary},{id:'bj:stand',label:'✋ Pas',style:ButtonStyle.Secondary}]) ]});}while(handValue(game.dealer)<17){const card=game.deck.pop();if(!card){try{if(!settleBet(i.guild.id,uid,'blackjack',game.bet))throw new Error('Blackjack krupiye deste hatası iadesi sonuçlandırılamadı.');}catch(e){console.error('Blackjack krupiye deste hatası iadesi başarısız:',e);technicalRefundBetKeys.add(betPlayerKey(i.guild.id,uid));return i.reply({content:'❌ Krupiye destesi tükendi ve bahis iade edilemedi. Lütfen yönetime bildir.',flags:MessageFlags.Ephemeral});}blackjackGames.delete(key);setGameCooldown(key,5000);return i.reply({content:'❌ Krupiye destesi tükendi; oyun iptal edildi ve **bahsin iade edildi.**',flags:MessageFlags.Ephemeral});}game.dealer.push(card);}const pv=handValue(game.player),dv=handValue(game.dealer);let payout=0,result='';if(pv>21){result=`💥 21 aştın. **-${game.bet} ◈**`;}else if(dv>21||pv>dv){payout=game.bet*2;result=`🎉 Kazandın! **+${game.bet} ◈**`;}else if(pv===dv){payout=game.bet;result='🤝 Berabere — bahis iade edildi.';}else{result=`💸 Kaybettin. **-${game.bet} ◈**`;}try{if(!settleBet(i.guild.id,uid,'blackjack',payout))throw new Error('Blackjack sonucu sonuçlandırılamadı.');}catch(e){console.error('Blackjack ödeme kaydı başarısız:',e);technicalRefundBetKeys.add(betPlayerKey(i.guild.id,uid));return i.reply({content:'❌ Sonuç kaydedilemedi. Lütfen yönetime bildir.',flags:MessageFlags.Ephemeral});}blackjackGames.delete(key);setGameCooldown(key,5000);return i.update({embeds:[economyEmbed('🃏 Blackjack',`${blackjackText(game,false)}\n\n${result}\nBakiye: **${u.coins} ◈**`)],components:[]});}
if(i.customId.startsWith('eco:')){const u=user(i.guild.id,i.user.id),g=guild(i.guild.id);if(i.customId==='eco:balance')return i.update({embeds:[economyEmbed('💰 Bakiye',`👛 Cüzdan: **${u.coins.toLocaleString('tr-TR')} ${g.config.currency}**\n🏦 Banka: **${u.bank.toLocaleString('tr-TR')} ${g.config.currency}**`)]});if(i.customId==='eco:ranking'){const rows=Object.entries(g.users).sort((a:any,b:any)=>(b[1].coins+b[1].bank)-(a[1].coins+a[1].bank)).slice(0,10);return i.update({embeds:[economyEmbed('🏆 Zenginler',rows.map(([id,x]:any,n)=>`${['🥇','🥈','🥉'][n]||`**#${n+1}**`} <@${id}> — **${(x.coins+x.bank).toLocaleString('tr-TR')} ${g.config.currency}**`).join('\n\n')||'Henüz veri yok.')]});}return i.update({embeds:[economyEmbed('🎲 Oyunlar','**/coinflip** • **/dice** • **/slots** • **/blackjack** • **/zar**\n\nBahislerini dikkatli yap.') ]});}
if(i.customId.startsWith('help:') && i.customId!=='help:home'){
   const cat=i.customId.slice(5);
   const groups:Record<string,string[]>= {
    general:['ping','help','sunucu','uye','avatar','join','play','queue','nowplaying','pause','resume','skip','stop','volume','loop','shuffle','remove','leave'],
    moderation:['purge','kick','ban','timeout','untimeout','warn','warnings','slowmode','lock','unlock'],
    management:['prefix','ignore','level-ignore','seviye-kanal','seviye-sifirla','autorole','rolver','rolal','role-info','channel-info','özel-kanal','tempvoice','custom','yetki','ticket','say','leave-message'],
    stats:['profil','rank','seviye-top','mesaj-top','ses-top','leaderboard','stats','serverstats','uzmanlasma'],
    economy:['ekonomi','balance','daily','deposit','withdraw','pay','coinflip','dice','zar','slots','blackjack','zenginler'],
    fun:['anket','öneri','remind','afk','oda']
   };
   const titles:Record<string,string>={general:'🌐 Genel Komutlar',moderation:'🛡️ Moderasyon Komutları',management:'⚙️ Yönetim & Yapılandırma',stats:'📊 Seviye & İstatistik',economy:'💰 Ekonomi',fun:'🎉 Eğlence & Topluluk'};
   const lines=(groups[cat]||[]).map(n=>{const cmd=commands.get(n);return cmd&&visibleCommand(i.member as GuildMember,cmd)?`**${cmd.name}** — ${cmd.description}`:null}).filter(Boolean).join('\n');
   const e=new EmbedBuilder().setColor(0x5865f2).setTitle(`⚔️ NEXUS | ${titles[cat]||'Komutlar'}`).setDescription(lines||'Bu kategoride sana gösterilebilecek hazır komut bulunmuyor.').setFooter({text:`Prefix: ${guild(i.guild.id).config.prefix} • /help ile ana menüye dön`}).setTimestamp();
   const back=new ButtonBuilder().setCustomId('help:home').setLabel('↩️ Ana Menü').setStyle(ButtonStyle.Secondary);
   return i.update({embeds:[e],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(back)]});
 }
 if(i.customId==='help:home'){
   const cfg=guild(i.guild.id).config; const defs=getHelpDefs(i.member as GuildMember);
   const e=new EmbedBuilder().setColor(0x5865f2).setTitle('⚔️ NEXUS | Komut Merkezi').setDescription(`Merhaba **${(i.member as GuildMember).displayName}**!\n\nAşağıdaki butonlardan yetkin dahilindeki kategoriyi seçerek NEXUS komutlarını inceleyebilirsin.\n\n**Prefix:** \`${cfg.prefix}\`  •  **Slash:** \/`).addFields({name:'💡 Hızlı Başlangıç',value:`**${cfg.prefix}yardim** ile prefix üzerinden bu menüyü açabilirsin.\n**${cfg.prefix}ping** ile bağlantıyı test edebilirsin.`}).setFooter({text:'NEXUS • Yetkine göre filtrelenen komut merkezi'}).setTimestamp();
   const rows:ActionRowBuilder<ButtonBuilder>[]=[]; for(let x=0;x<defs.length;x+=5)rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...defs.slice(x,x+5).map(([id,label,style])=>new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style))));
   return i.update({embeds:[e],components:rows});
 }
 if(i.customId.startsWith('rr:')){const rid=i.customId.split(':')[1],m=i.member as GuildMember;const r=i.guild.roles.cache.get(rid);if(!r)return i.reply({content:'❌ Rol artık yok.',flags:MessageFlags.Ephemeral});if(m.roles.cache.has(rid)){await m.roles.remove(r);return i.reply({content:`➖ ${r} rolü alındı.`,flags:MessageFlags.Ephemeral});}await m.roles.add(r);return i.reply({content:`➕ ${r} rolü verildi.`,flags:MessageFlags.Ephemeral});}if(i.customId.startsWith('ticket:create:')){const cfg=guild(i.guild.id).config.ticket||{};if(!cfg.category)return i.reply({content:'❌ Ticket sistemi henüz kurulmamış.',flags:MessageFlags.Ephemeral});const type=i.customId.endsWith('complaint')?'complaint':'support';const existing=i.guild.channels.cache.find(x=>x.type===ChannelType.GuildText&&((x as TextChannel).topic?.startsWith(`NEXUS-TICKET|${i.user.id}|`)||x.name===`ticket-${i.user.id}`));if(existing)return i.reply({content:`❌ Zaten açık ticketın var: ${existing}`,flags:MessageFlags.Ephemeral});const roleId=type==='complaint'?cfg.complaintRole:cfg.supportRole;const categoryId=type==='complaint'?(cfg.complaintCategory||cfg.category):(cfg.supportCategory||cfg.category);const ch=await i.guild.channels.create({name:`${i.user.username.toLowerCase().replace(/[^a-z0-9çğıöşü-]/gi,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'kullanici'}-${type==='complaint'?'şikayet':'destek'}-${new Date().toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'}).replace(/\./g,'')}`.slice(0,95),topic:`NEXUS-TICKET|${i.user.id}|${type}`,type:ChannelType.GuildText,parent:categoryId,permissionOverwrites:[{id:i.guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},{id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},{id:i.guild.members.me!.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels]}]});if(roleId)await ch.permissionOverwrites.create(roleId,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true});const close=new ButtonBuilder().setCustomId('ticket:close').setLabel('🔒 Talebi Kapat').setStyle(ButtonStyle.Danger);const claim=new ButtonBuilder().setCustomId('ticket:claim').setLabel('📌 Üstlen').setStyle(ButtonStyle.Secondary);await ch.send({content:`${i.user}${roleId?` <@&${roleId}>`:''}`,allowedMentions:{users:[i.user.id],roles:roleId?[roleId]:[]},embeds:[new EmbedBuilder().setColor(type==='complaint'?0xed4245:0x5865f2).setAuthor({name:'⚔️ NEXUS • TICKET'}).setTitle(type==='complaint'?'⚠️ Şikayet / Bildirim':'🎫 Destek Talebi').setThumbnail(i.guild.iconURL({size:256})||null).setDescription(`Talebin oluşturuldu.\n\n**Açan:** ${i.user}\n**Yetkili ekip:** ${roleId?`<@&${roleId}>`:'Tanımlanmadı'}\n\nBir yetkili en kısa sürede ilgilenecektir.`).setFooter({text:'NEXUS Ticket Sistemi'}).setTimestamp()],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(claim,close)]});return i.reply({embeds:[embed('🎫 Ticket Açıldı',`Talebin oluşturuldu: ${ch}`)],flags:MessageFlags.Ephemeral});}if(i.customId==='ticket:claim'){const cfg=guild(i.guild.id).config.ticket||{};const member=i.member as GuildMember;const ch=i.channel as TextChannel;const isStaffMember=isStaff(member);const topic=ch.topic||'';const type=topic.split('|')[2]||'support';const requiredRole=type==='complaint'?cfg.complaintRole:cfg.supportRole;if(!isStaffMember&&(!requiredRole||!member.roles.cache.has(requiredRole)))return i.reply({content:'❌ Bu işlemi yalnızca ilgili ticket yetkilileri yapabilir.',flags:MessageFlags.Ephemeral});const current=ticketClaims.get(ch.id);if(current&&current!==i.user.id)return i.reply({content:`❌ Bu ticket zaten <@${current}> tarafından üstlenildi.`,flags:MessageFlags.Ephemeral});ticketClaims.set(ch.id,i.user.id);const release=new ButtonBuilder().setCustomId('ticket:release').setLabel('↩️ Üstlenmeyi Bırak').setStyle(ButtonStyle.Secondary);const close=new ButtonBuilder().setCustomId('ticket:close').setLabel('🔒 Talebi Kapat').setStyle(ButtonStyle.Danger);if(requiredRole)await ch.permissionOverwrites.edit(requiredRole,{SendMessages:false}).catch(()=>{});await ch.permissionOverwrites.edit(i.user.id,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true}).catch(()=>{});await i.message.edit({components:[new ActionRowBuilder<ButtonBuilder>().addComponents(release,close)]}).catch(()=>{});return i.reply({embeds:[embed('📌 Ticket Üstlenildi',`${i.user} bu ticketı üstlendi.\n\nArtık yalnızca ticketı üstlenen yetkili ve ticket sahibi mesaj yazabilir.`)],flags:MessageFlags.Ephemeral});}if(i.customId==='ticket:release'){const cfg=guild(i.guild.id).config.ticket||{};const ch=i.channel as TextChannel;const claimer=ticketClaims.get(ch.id);if(!claimer)return i.reply({content:'❌ Bu ticket şu anda üstlenilmiş değil.',flags:MessageFlags.Ephemeral});if(claimer!==i.user.id)return i.reply({content:'❌ Ticketı yalnızca üstlenen yetkili bırakabilir.',flags:MessageFlags.Ephemeral});const topic=ch.topic||'';const type=topic.split('|')[2]||'support';const requiredRole=type==='complaint'?cfg.complaintRole:cfg.supportRole;ticketClaims.delete(ch.id);if(requiredRole)await ch.permissionOverwrites.edit(requiredRole,{SendMessages:true,ViewChannel:true,ReadMessageHistory:true}).catch(()=>{});await ch.permissionOverwrites.delete(i.user.id).catch(()=>{});const claim=new ButtonBuilder().setCustomId('ticket:claim').setLabel('📌 Üstlen').setStyle(ButtonStyle.Secondary);const close=new ButtonBuilder().setCustomId('ticket:close').setLabel('🔒 Talebi Kapat').setStyle(ButtonStyle.Danger);await i.message.edit({components:[new ActionRowBuilder<ButtonBuilder>().addComponents(claim,close)]}).catch(()=>{});return i.reply({content:'↩️ Ticket yeniden ilgili yetkililerin kullanımına açıldı.',flags:MessageFlags.Ephemeral});}if(i.customId==='ticket:close'){const cfg=guild(i.guild.id).config.ticket||{};const member=i.member as GuildMember;const ch=i.channel as TextChannel;const canClose=isStaff(member)||(cfg.supportRole&&member.roles.cache.has(cfg.supportRole))||(cfg.complaintRole&&member.roles.cache.has(cfg.complaintRole))||ch.permissionOverwrites.cache.get(i.user.id)?.allow.has(PermissionFlagsBits.ViewChannel);if(!canClose)return i.reply({content:'❌ Bu ticketı kapatma yetkin yok.',flags:MessageFlags.Ephemeral});await i.reply({content:'İşlem tamamlanıyor…',flags:MessageFlags.Ephemeral});ticketClaims.delete(ch.id);setTimeout(async()=>{if(ch?.isTextBased()){const msgs=await ch.messages.fetch({limit:100}).catch(()=>new Collection<string,Message>());const ordered=[...msgs.values()].reverse();const transcript=ordered.map(m=>`[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content||'[embed/ek dosya]'}`).join('\n');const attachment=new AttachmentBuilder(Buffer.from(transcript||'Ticket içeriği boş.','utf8'),{name:`${ch.name}-transcript.txt`});const logId=guild(i.guild.id).config.logChannels.ticket;const logCh=logId?i.guild.channels.cache.get(logId):undefined;if(logCh?.isTextBased())await (logCh as TextChannel).send({embeds:[new EmbedBuilder().setColor(0x2b2d31).setAuthor({name:'⚔️ NEXUS • Ticket Arşivi',iconURL:i.guild.iconURL({size:128})||undefined}).setTitle(`🎫 ${ch.name} • Arşiv`).setDescription(`**Kapatma işlemini yapan:** ${i.user}\n**Mesaj sayısı:** ${ordered.length}\n**Kapanış:** <t:${Math.floor(Date.now()/1000)}:F>`).setThumbnail(i.guild.iconURL({size:256})||null).setTimestamp()],files:[attachment]}).catch(()=>{});}await ch?.delete().catch(()=>{});},700);}if(i.customId.startsWith('poll:'))return i.reply({content:`✅ Oyunuzu **${i.customId.endsWith('yes')?'Evet':'Hayır'}** olarak kaydettim.`,flags:MessageFlags.Ephemeral});}
async function select(i:StringSelectMenuInteraction){
 if(!i.guild)return;
 if(i.customId.startsWith('spec:profession:')){
  const sessionId=i.customId.split(':')[2];
  const session=specializationSessions.get(sessionId);
  if(!session||session.guildId!==i.guild.id||session.userId!==i.user.id)
   return i.reply({content:'Bu uzmanlik oturumu gecersiz veya suresi dolmus.',flags:MessageFlags.Ephemeral});
  if(Date.now()-session.createdAt>120000){
   specializationSessions.delete(sessionId);
   return i.update({content:'Uzmanlik oturumunun suresi doldu. Komutu yeniden kullanabilirsin.',embeds:[],components:[]});
  }
  const profession=RPG_PROFESSIONS.find(p=>p.id===i.values[0]);
  if(!profession)
   return i.reply({content:'Secilen meslek bulunamadi.',flags:MessageFlags.Ephemeral});
  session.professionId=profession.id;
  const menu=new StringSelectMenuBuilder()
   .setCustomId('spec:branch:'+sessionId)
   .setPlaceholder('Bir uzmanlik dali sec')
   .addOptions(profession.specializations.map(branch=>({
    label:branch.name.slice(0,100),
    value:branch.id,
    description:branch.description.slice(0,100)
   })));
  return i.update({
   embeds:[new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('NEXUS | '+profession.name)
    .setDescription(profession.description+'\n\nUzmanlik dallarindan birini sec.')],
   components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)]
  });
 }
 if(i.customId.startsWith('spec:branch:')){
  const sessionId=i.customId.split(':')[2];
  const session=specializationSessions.get(sessionId);
  if(!session||session.guildId!==i.guild.id||session.userId!==i.user.id)
   return i.reply({content:'Bu uzmanlik oturumu gecersiz veya suresi dolmus.',flags:MessageFlags.Ephemeral});
  if(Date.now()-session.createdAt>120000){
   specializationSessions.delete(sessionId);
   return i.update({content:'Uzmanlik oturumunun suresi doldu. Komutu yeniden kullanabilirsin.',embeds:[],components:[]});
  }
  const profession=RPG_PROFESSIONS.find(p=>p.id===session.professionId);
  const branch=profession?.specializations.find(x=>x.id===i.values[0]);
  if(!profession||!branch)
   return i.reply({content:'Uzmanlik dali bulunamadi.',flags:MessageFlags.Ephemeral});
  const wallet=user(i.guild.id,i.user.id);
  const profile=wallet.rpg||{};
  const current=profile.mainSpecialization;
  const count=profile.specializationChangeCount??0;
  if((current?.professionId||null)!==session.expectedProfessionId||
     (current?.specializationId||null)!==session.expectedSpecializationId||
     count!==session.expectedCount){
   specializationSessions.delete(sessionId);
   return i.update({content:'Uzmanlik bilgilerin menu acildiktan sonra degismis. Lutfen komutu yeniden kullan.',embeds:[],components:[]});
  }
  const same=current?.professionId===profession.id&&current?.specializationId===branch.id;
  const fee=same||!current?0:getSpecializationChangeFee(count);
  if(fee===null){
   specializationSessions.delete(sessionId);
   return i.update({content:'Uzmanlik degisiklik sayaci gecersiz.',embeds:[],components:[]});
  }
  if(wallet.coins<fee){
   specializationSessions.delete(sessionId);
   return i.update({content:'Bu degisiklik icin yeterli \u25C8 bakiyen yok. Gereken: **'+fee.toLocaleString('tr-TR')+' \u25C8**',embeds:[],components:[]});
  }
  session.specializationId=branch.id;
  const buttons=new ActionRowBuilder<ButtonBuilder>().addComponents(
   new ButtonBuilder().setCustomId('spec:confirm:'+sessionId).setLabel('Onayla').setStyle(ButtonStyle.Success),
   new ButtonBuilder().setCustomId('spec:cancel:'+sessionId).setLabel('Vazgec').setStyle(ButtonStyle.Secondary)
  );
  const feeText=same
   ? 'Bu dal zaten ana uzmanligin. Degisiklik yapilmayacak ve ucret alinmayacak.'
   : !current
    ? 'Ilk uzmanlik secimin ucretsizdir.'
    : 'Degisiklik ucreti: **'+fee.toLocaleString('tr-TR')+' ?**';
  return i.update({
   embeds:[new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle('Uzmanlik Secimini Onayla')
    .setDescription('**Meslek:** '+profession.name+'\n**Uzmanlik:** '+branch.name+'\n\n'+branch.description+'\n\n'+feeText+'\n\nDevam etmek istiyor musun?')],
   components:[buttons]
  });
 }
 if(i.customId.startsWith('permcat:')){const adminId=i.customId.split(':')[1];if(adminId!==i.user.id)return i.reply({content:'❌ Bu menü yalnızca onu açan yönetici tarafından kullanılabilir.',flags:MessageFlags.Ephemeral});const s=permissionSessions.get(i.user.id);if(!s)return i.reply({content:'❌ Yetki oturumu bulunamadı.',flags:MessageFlags.Ephemeral});const cat=i.values[0];s.category=cat;const target=s.targetType==='user'?`<@${s.targetId}>`:`<@&${s.targetId}>`;const e=new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Yetki İşlemi').setDescription(`**Hedef:** ${target}\n**Kategori:** ${permissionCategoryTitles[cat]}\n\nİşlemi seç.`);return i.update({content:'',embeds:[e],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:action:add:${i.user.id}`).setLabel('➕ Yetki Ver').setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId(`perm:action:remove:${i.user.id}`).setLabel('➖ Yetki Al').setStyle(ButtonStyle.Danger),new ButtonBuilder().setCustomId(`perm:back:target:${i.user.id}`).setLabel('↩️ Geri').setStyle(ButtonStyle.Secondary)),permissionOverviewButtons(i.user.id)]});}
 if(i.customId.startsWith('permselect:')){const adminId=i.customId.split(':')[1];if(adminId!==i.user.id)return i.reply({content:'❌ Bu menü yalnızca onu açan yönetici tarafından kullanılabilir.',flags:MessageFlags.Ephemeral});const s=permissionSessions.get(i.user.id);if(!s?.action||!s.category)return i.reply({content:'❌ Yetki oturumu bulunamadı.',flags:MessageFlags.Ephemeral});if(s.action==='view'){const cfg=guild(i.guild.id).config;const targetMap=s.targetType==='user'?cfg.commandUsers:cfg.commandRoles;const sections=Object.entries(permissionCatalog).map(([cat,items])=>{const granted=items.filter(x=>(targetMap[x.command]||[]).includes(s.targetId));return granted.length?`**${permissionCategoryTitles[cat]}**\n${granted.map(x=>`• ${x.label}`).join('\n')}`:''}).filter(Boolean).join('\n\n');return i.update({embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('📋 NEXUS • Mevcut Yetkiler').setDescription(`**Hedef:** ${s.targetType==='user'?`<@${s.targetId}>`:`<@&${s.targetId}>`}\n\n${sections||'Bu hedefe atanmış özel NEXUS yetkisi bulunmuyor.'}`)],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:back:category:${i.user.id}`).setLabel('↩️ Kategoriye Dön').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId(`perm:done:${i.user.id}`).setLabel('✅ Tamamla').setStyle(ButtonStyle.Secondary))]});}const cfg=guild(i.guild.id).config;const map=s.targetType==='user'?cfg.commandUsers:cfg.commandRoles;const targets=s.targetIds?.length?s.targetIds:[s.targetId];const commandsSelected=i.values;for(const command of commandsSelected){map[command]??=[];const arr=map[command]!;if(s.action==='add'){for(const target of targets)if(!arr.includes(target))arr.push(target);}else{for(const target of targets){const idx=arr.indexOf(target);if(idx>=0)arr.splice(idx,1);}if(!arr.length)delete map[command];}}mutate(()=>{});const labels=commandsSelected.map(command=>(permissionCatalog[s.category]||[]).find(x=>x.command===command)?.label||command);return i.update({embeds:[new EmbedBuilder().setColor(s.action==='add'?0x57f287:0xed4245).setTitle(s.action==='add'?'🛡️ Özel Yetkiler Verildi':'🗑️ Özel Yetkiler Kaldırıldı').setDescription(`**Hedefler:** ${permissionTargetLabel(s)}\n**İşlem:** ${s.action==='add'?'Yetki verildi':'Yetki kaldırıldı'}\n\n${labels.map(x=>`• ${x}`).join('\n')}`)],components:[new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:back:category:${i.user.id}`).setLabel('↩️ Başka İşlem Yap').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId(`perm:done:${i.user.id}`).setLabel('✅ Tamamla').setStyle(ButtonStyle.Success))]});}

 if(i.customId.startsWith('roomlimit:')){const id=i.customId.split(':')[1];if(tempRoomOwners.get(id)!==i.user.id)return i.reply({content:'❌ Oda sahibi değilsin.',flags:MessageFlags.Ephemeral});const ch=i.guild.channels.cache.get(id) as VoiceChannel|null;if(!ch)return i.reply({content:'❌ Oda bulunamadı.',flags:MessageFlags.Ephemeral});const n=Number(i.values[0]);await ch.setUserLimit(n);await refreshRoomPanel(ch);return i.update({content:`✅ Kişi sınırı **${n===0?'Sınırsız':n}** olarak ayarlandı.`,components:[]});}
 if(i.customId.startsWith('roomvisibility:')){const id=i.customId.split(':')[1];if(tempRoomOwners.get(id)!==i.user.id)return i.reply({content:'❌ Oda sahibi değilsin.',flags:MessageFlags.Ephemeral});const ch=i.guild.channels.cache.get(id) as VoiceChannel|null;if(!ch)return i.reply({content:'❌ Oda bulunamadı.',flags:MessageFlags.Ephemeral});const mode=i.values[0];if(mode==='public')await ch.permissionOverwrites.edit(i.guild.roles.everyone,{ViewChannel:true,Connect:true});else await ch.permissionOverwrites.edit(i.guild.roles.everyone,{ViewChannel:false,Connect:false});await refreshRoomPanel(ch);return i.update({content:`✅ Görünürlük **${mode==='public'?'Herkese Açık':'Gizli'}** olarak ayarlandı.`,components:[]});}
 if(i.customId.startsWith('roommember:')){const id=i.customId.split(':')[1];if(tempRoomOwners.get(id)!==i.user.id)return i.reply({content:'❌ Oda sahibi değilsin.',flags:MessageFlags.Ephemeral});const uid=i.values[0];const menu=new StringSelectMenuBuilder().setCustomId(`roommemberaction:${id}:${uid}`).setPlaceholder('İşlem seç').addOptions([{label:'Odaya İzin Ver',value:'allow',description:'Kullanıcının odayı görmesine ve katılmasına izin verir'},{label:'Odaya Engelle',value:'deny',description:'Kullanıcının odayı görmesini ve katılmasını engeller'}]);return i.update({content:`👤 <@${uid}> için işlem seç:`,components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)]});}
 if(i.customId.startsWith('roommemberaction:')){const [,id,uid]=i.customId.split(':');if(tempRoomOwners.get(id)!==i.user.id)return i.reply({content:'❌ Oda sahibi değilsin.',flags:MessageFlags.Ephemeral});const ch=i.guild.channels.cache.get(id) as VoiceChannel|null;if(!ch)return i.reply({content:'❌ Oda bulunamadı.',flags:MessageFlags.Ephemeral});const action=i.values[0];await ch.permissionOverwrites.edit(uid,action==='allow'?{ViewChannel:true,Connect:true}:{ViewChannel:false,Connect:false});await refreshRoomPanel(ch);return i.update({content:`${action==='allow'?'➕':'🚫'} <@${uid}> için oda erişimi ${action==='allow'?'açıldı':'kapatıldı'}.`,components:[]});}
 return i.reply({content:'Seçimin alındı.',flags:MessageFlags.Ephemeral});
}

async function roomUserSelect(i:UserSelectMenuInteraction){
 if(!i.guild)return;
 if(i.customId.startsWith('permuser:')){const adminId=i.customId.split(':')[1];if(adminId!==i.user.id)return i.reply({content:'❌ Bu menü yalnızca onu açan yönetici tarafından kullanılabilir.',flags:MessageFlags.Ephemeral});const s=permissionSessions.get(i.user.id);if(!s)return i.reply({content:'❌ Yetki oturumu bulunamadı.',flags:MessageFlags.Ephemeral});s.targetIds=[...i.values];s.targetId=i.values[0];const menu=new StringSelectMenuBuilder().setCustomId(`permcat:${i.user.id}`).setPlaceholder('Yetki kategorisini seç').addOptions(Object.entries(permissionCategoryTitles).map(([value,label])=>({label,value})));return i.update({content:'',embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Yetki Yönetimi').setDescription(`👤 **Hedefler:** ${permissionTargetLabel(s)}\n\n➕ / ➖ işlemleri için kategori seç.\n📋 Mevcut ve 📚 verilebilecek yetkileri aşağıdaki butonlardan görebilirsin.`)],components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),permissionOverviewButtons(i.user.id),new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:back:target:${i.user.id}`).setLabel('↩️ Geri').setStyle(ButtonStyle.Secondary))]});}
 if(!i.guild)return; const parts=i.customId.split(':'); const action=parts[0],id=parts[1]; if(tempRoomOwners.get(id)!==i.user.id)return i.reply({content:'❌ Oda sahibi değilsin.',flags:MessageFlags.Ephemeral}); const target=i.values[0]; const ch=i.guild.channels.cache.get(id) as VoiceChannel|null;if(!ch)return i.reply({content:'❌ Oda bulunamadı.',flags:MessageFlags.Ephemeral});
 if(action==='roommember'){const menu=new StringSelectMenuBuilder().setCustomId(`roommemberaction:${id}:${target}`).setPlaceholder('İşlem seç').addOptions([{label:'Odaya İzin Ver',value:'allow'},{label:'Odaya Engelle',value:'deny'}]);return i.update({content:`👤 <@${target}> için işlem seç:`,components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)]});}
 if(action==='roomowner'){const oldOwner=i.user.id;tempRoomOwners.set(id,target);await ch.permissionOverwrites.edit(target,{ViewChannel:true,Connect:true,ManageChannels:true,MoveMembers:true});await ch.permissionOverwrites.edit(oldOwner,{ManageChannels:false,MoveMembers:false});await ch.permissionOverwrites.edit(i.guild.roles.everyone,{ViewChannel:true,Connect:true});const controlId=tempRoomControls.get(id);if(controlId){const control=ch.guild.channels.cache.get(controlId);if(control)await control.permissionOverwrites.edit(target,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true});if(control)await control.permissionOverwrites.edit(oldOwner,{ViewChannel:false,SendMessages:false,ReadMessageHistory:false});}await refreshRoomPanel(ch);return i.update({content:`👑 Odanın yeni sahibi <@${target}> oldu.`,components:[]});}
 return i.reply({content:'❌ Geçersiz işlem.',flags:MessageFlags.Ephemeral});
}

async function permissionRoleSelect(i:RoleSelectMenuInteraction){
 if(!i.guild)return; const adminId=i.customId.split(':')[1];if(adminId!==i.user.id)return i.reply({content:'❌ Bu menü yalnızca onu açan yönetici tarafından kullanılabilir.',flags:MessageFlags.Ephemeral});const s=permissionSessions.get(i.user.id);if(!s)return i.reply({content:'❌ Yetki oturumu bulunamadı.',flags:MessageFlags.Ephemeral});s.targetIds=[...i.values];s.targetId=i.values[0];const menu=new StringSelectMenuBuilder().setCustomId(`permcat:${i.user.id}`).setPlaceholder('Yetki kategorisini seç').addOptions(Object.entries(permissionCategoryTitles).map(([value,label])=>({label,value})));return i.update({content:'',embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ NEXUS • Yetki Yönetimi').setDescription(`🎭 **Hedef roller:** ${permissionTargetLabel(s)}\n\n➕ / ➖ işlemleri için kategori seç.\n📋 Mevcut ve 📚 verilebilecek yetkileri aşağıdaki butonlardan görebilirsin.`)],components:[new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),permissionOverviewButtons(i.user.id),new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`perm:back:target:${i.user.id}`).setLabel('↩️ Geri').setStyle(ButtonStyle.Secondary))]});
}

async function roomModal(i:ModalSubmitInteraction){
 if(!i.guild)return; const parts=i.customId.split(':'); if(parts[0]!=='roomname')return; const id=parts[1]; if(tempRoomOwners.get(id)!==i.user.id)return i.reply({content:'❌ Oda sahibi değilsin.',flags:MessageFlags.Ephemeral}); const ch=i.guild.channels.cache.get(id) as VoiceChannel|null;if(!ch)return i.reply({content:'❌ Oda bulunamadı.',flags:MessageFlags.Ephemeral});const name=i.fields.getTextInputValue('name').trim();await ch.setName(name);const controlId=tempRoomControls.get(id);if(controlId){const control=ch.guild.channels.cache.get(controlId);if(control)await control.setName(`🔧・${name.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ -]/g,'').trim().slice(0,70)||'oda'}-kontrol`).catch(()=>{});}await refreshRoomPanel(ch);return i.reply({content:`✏️ Oda adı **${name}** olarak değiştirildi.`,flags:MessageFlags.Ephemeral});
}

function normalizeCommandJSON(command:any){if(Array.isArray(command.options)){command.options.sort((a:any,b:any)=>Number(!!b.required)-Number(!!a.required));}return command;}
const PREFIX_ONLY_COMMANDS=new Set(['serverstats','leaderboard','zar','welcome','leave-message','nickname','rr','embed','role-info','channel-info','oda','custom','unban','unwarn','warnings','nowplaying','volume','loop','shuffle','remove','join','leave','avatar','say','rank']);
for(const name of PREFIX_ONLY_COMMANDS){const command=commands.get(name);if(command)command.builder=undefined;}
async function registerCommands(){const rest=new REST({version:'10'}).setToken(process.env.DISCORD_TOKEN!);const builders=[...new Map([...commands.values()].filter(c=>typeof c.builder==='function').map(c=>[c.name,normalizeCommandJSON(c.builder!().toJSON())])).values()];if(builders.length>100)throw new Error(`Discord slash komut sınırı aşıldı: ${builders.length}/100`);const invalid=builders.filter((b:any)=>Array.isArray(b?.options)&&b.options.some((o:any,i:number)=>o.required===true&&b.options.slice(0,i).some((p:any)=>p.required!==true)));if(invalid.length)console.warn('Komut seçenek sırası düzeltildi:',invalid.map((b:any)=>b.name).join(', '));try{if(process.env.GUILD_ID)await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!,process.env.GUILD_ID),{body:builders});else await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!),{body:builders});console.log(`${builders.length} slash komut kaydedildi.`);}catch(e){console.error('Komut kayıt hatası:',e);}}

setInterval(async()=>{const now=Date.now();for(const g of client.guilds.cache.values()){const data=guild(g.id);for(const r of [...data.reminders])if(r.at<=now){const ch=g.channels.cache.get(r.channel);if(ch?.isTextBased())await (ch as TextChannel).send(`<@${r.user}> ⏰ Hatırlatma: **${r.text}**`).catch(()=>{});data.reminders.splice(data.reminders.indexOf(r),1);}for(const gw of [...data.giveaways])if(gw.end<=now){const ch=g.channels.cache.get(gw.channel);const msg=ch?.isTextBased()?await (ch as TextChannel).messages.fetch(gw.message).catch(()=>null):null;const reacts=msg?.reactions.cache.get('🎉');const users=reacts?await reacts.users.fetch():new Collection<string,User>();const pool=users.filter(u=>!u.bot).map(u=>u.id);const winners=pool.sort(()=>Math.random()-.5).slice(0,gw.winners);if(msg?.channel.isTextBased())await msg.channel.send(`🎉 Çekiliş bitti! **${gw.prize}** kazananlar: ${winners.map(x=>`<@${x}>`).join(', ')||'Katılım yok.'}`);data.giveaways.splice(data.giveaways.indexOf(gw),1);}mutate(()=>{});} },2000);

process.on('SIGINT',()=>{persist();client.destroy();process.exit(0)});process.on('SIGTERM',()=>{persist();client.destroy();process.exit(0)});
if(!process.env.DISCORD_TOKEN){console.error('DISCORD_TOKEN eksik. .env dosyasını doldur.');process.exit(1);}client.login(process.env.DISCORD_TOKEN);





