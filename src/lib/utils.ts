import {Channel, GuildMember, PermissionFlagsBits, TextChannel} from 'discord.js';
import {guild} from './db';
export const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export function ignored(member:GuildMember,channelId:string,kind='general'){const c=guild(member.guild.id).config;if(c.ignoredChannels.includes(channelId)||member.roles.cache.some(r=>c.ignoredRoles.includes(r.id)))return true;if(kind==='level'&&(c.levelIgnoredChannels.includes(channelId)||member.roles.cache.some(r=>c.levelIgnoredRoles.includes(r.id))))return true;return false;}
export function isStaff(m:GuildMember){return m.permissions.has(PermissionFlagsBits.ManageGuild)||m.permissions.has(PermissionFlagsBits.Administrator);}
export function mentionChannel(ch:Channel|null){return ch?.isTextBased()?`<#${ch.id}>`:String(ch?.id||'');}
export function formatDuration(sec:number){const d=Math.floor(sec/86400);sec%=86400;const h=Math.floor(sec/3600);sec%=3600;const m=Math.floor(sec/60);const s=sec%60;return [d?`${d}g`:'' ,h?`${h}s`:'' ,m?`${m}dk`:'' ,`${s}sn`].filter(Boolean).join(' ');}
export function parseDuration(v:string){const m=v.match(/^(\d+)\s*(s|sn|m|dk|h|sa|d|g|w|hf)$/i);if(!m)return Number(v)||0;const n=Number(m[1]);return n*({s:1000,sn:1000,m:60000,dk:60000,h:3600000,sa:3600000,d:86400000,g:86400000,w:604800000,hf:604800000} as any)[m[2].toLowerCase()];}
export function clean(text:string){return text.replace(/@everyone|@here/g,'');}
