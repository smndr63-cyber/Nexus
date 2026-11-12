import type { RpgInjury, RpgProfileData } from './types';
import { removeItem } from './inventory-service';

export function getActiveInjuries(profile:RpgProfileData,now=Date.now()):RpgInjury[] {
  profile.injuries=(profile.injuries||[]).filter(injury=>injury.expiresAt>now);
  return profile.injuries;
}
export function applyBattleInjury(profile:RpgProfileData,now=Date.now()):RpgInjury {
  const active=getActiveInjuries(profile,now);
  if(active.length>=2){const existing=active[0];existing.expiresAt=Math.max(existing.expiresAt,now+30*60_000);return existing;}
  const severity: RpgInjury['severity']=active.length>=1?'severe':'moderate';
  const injury:RpgInjury={id:`injury-${now.toString(36)}`,name:severity==='severe'?'Ağır Savaş Yaralanması':'Savaş Yaralanması',description:severity==='severe'?'Ağır yara, savaş gücünü belirgin biçimde düşürür.':'Savaşta alınan darbeler hareket ve saldırı gücünü azaltır.',severity,startedAt:now,expiresAt:now+(severity==='severe'?90:30)*60_000,effects:severity==='severe'?{attack:-0.25,defense:-0.15}:{attack:-0.12,defense:-0.08},treatmentItemId:severity==='severe'?'sifa_ozu':'saglik_iksiri'};
  profile.injuries=(profile.injuries||[]).concat(injury);return injury;
}
export function treatInjury(profile:RpgProfileData,injuryId:string,itemId:string):{ok:true;removed:RpgInjury}|{ok:false;reason:string} {
  const injury=profile.injuries?.find(item=>item.id===injuryId);if(!injury)return {ok:false,reason:'injury_not_found'};
  if(injury.treatmentItemId!==itemId)return {ok:false,reason:'wrong_treatment'};
  const removed=removeItem(profile,itemId,1);if(!removed.ok)return {ok:false,reason:'treatment_item_missing'};
  profile.injuries=profile.injuries!.filter(item=>item.id!==injuryId);return {ok:true,removed:injury};
}
export function getInjuryModifiers(profile:RpgProfileData,now=Date.now()) {
  return getActiveInjuries(profile,now).reduce((total,injury)=>{for(const [key,value] of Object.entries(injury.effects))total[key]=(total[key]||0)+value;return total;},{} as Record<string,number>);
}
