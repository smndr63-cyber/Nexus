import type { RpgProfileData } from './types';
export type CharacterAttribute='strength'|'vitality'|'agility'|'intelligence';
export type AttributeResult={ok:true;attribute:CharacterAttribute;allocated:number;remaining:number}|{ok:false;reason:'invalid_attribute'|'invalid_amount'|'insufficient_points'|'attribute_cap'};
export function allocateStatPoints(profile:RpgProfileData,attribute:string,amount:number):AttributeResult {
 if(!['strength','vitality','agility','intelligence'].includes(attribute))return {ok:false,reason:'invalid_attribute'};
 if(!Number.isSafeInteger(amount)||amount<=0||amount>100)return {ok:false,reason:'invalid_amount'};
 profile.stats=profile.stats||{strength:5,vitality:5,agility:5,intelligence:5,points:0};
 if(profile.stats.points<amount)return {ok:false,reason:'insufficient_points'};
 const key=attribute as CharacterAttribute;if(profile.stats[key]+amount>500)return {ok:false,reason:'attribute_cap'};
 profile.stats[key]+=amount;profile.stats.points-=amount;
 return {ok:true,attribute:key,allocated:amount,remaining:profile.stats.points};
}
