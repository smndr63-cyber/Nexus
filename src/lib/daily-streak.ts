export interface DailyStreakAccount { coins:number; lastDaily:number; dailyStreak?:number; }
export type DailyStreakResult =
 | {ok:true;streak:number;reward:number;baseReward:number;milestoneBonus:number;balance:number;nextAt:number}
 | {ok:false;reason:'cooldown'|'invalid_balance'|'balance_overflow';nextAt?:number;streak?:number};
const DAY=86_400_000;
export function claimDailyStreak(account:DailyStreakAccount,now=Date.now()):DailyStreakResult {
 if(!Number.isSafeInteger(account.coins)||account.coins<0||!Number.isFinite(account.lastDaily)||account.lastDaily<0)return {ok:false,reason:'invalid_balance'};
 if(account.lastDaily&&now-account.lastDaily<DAY)return {ok:false,reason:'cooldown',nextAt:account.lastDaily+DAY,streak:account.dailyStreak||0};
 const streak=account.lastDaily&&now-account.lastDaily<=2*DAY?((Math.max(0,account.dailyStreak||0)%7)+1):1;
 const baseReward=250+(streak-1)*25;const milestoneBonus=streak===7?500:0;const reward=baseReward+milestoneBonus;
 if(!Number.isSafeInteger(account.coins+reward))return {ok:false,reason:'balance_overflow'};
 account.coins+=reward;account.lastDaily=now;account.dailyStreak=streak;
 return {ok:true,streak,reward,baseReward,milestoneBonus,balance:account.coins,nextAt:now+DAY};
}
