import type { RpgProfileData } from './types';
import { getRpgItem } from './data/items';
import { addItem, countItem, removeItem } from './inventory-service';
export interface RpgNpcShopStock { stock:Record<string,{quantity:number;restockAt:number}>; }
export type NpcMarketResult={ok:true;quantity:number;unitPrice:number;total:number;stock:number|null}|{ok:false;reason:string};
const RESTOCK_MS=24*60*60_000;
function stockKey(regionId:string,itemId:string){return `${regionId}:${itemId}`;}
function stockLimit(rarity:string){if(rarity==='rare')return 20;if(rarity==='epic')return 5;if(rarity==='legendary'||rarity==='mythic')return 1;return null;}
function getStock(state:RpgNpcShopStock,regionId:string,itemId:string,now:number){
 const definition=getRpgItem(itemId);if(!definition)return null;const limit=stockLimit(definition.rarity);if(limit===null)return {quantity:null as number|null,limit:null as number|null};
 const key=stockKey(regionId,itemId);let entry=state.stock[key];if(!entry||now>=entry.restockAt){entry={quantity:limit,restockAt:now+RESTOCK_MS};state.stock[key]=entry;}return {quantity:entry.quantity,limit};
}
export function createNpcShopState():RpgNpcShopStock{return {stock:{}};}
export function buyFromNpc(state:RpgNpcShopStock,profile:RpgProfileData,account:{coins:number},regionId:string,itemId:string,quantity:number,now=Date.now()):NpcMarketResult{
 const item=getRpgItem(itemId);if(!item)return {ok:false,reason:'unknown_item'};if(!item.tradeable)return {ok:false,reason:'not_tradeable'};
 if(!Number.isSafeInteger(quantity)||quantity<=0||quantity>100)return {ok:false,reason:'invalid_quantity'};
 const unitPrice=Math.max(1,Math.floor(item.basePrice||1));const total=unitPrice*quantity;if(!Number.isSafeInteger(total))return {ok:false,reason:'price_overflow'};
 if(!Number.isSafeInteger(account.coins)||account.coins<total)return {ok:false,reason:'insufficient_coins'};
 const stock=getStock(state,regionId,itemId,now);if(!stock)return {ok:false,reason:'unknown_item'};if(stock.quantity!==null&&stock.quantity<quantity)return {ok:false,reason:'out_of_stock'};
 const added=addItem(profile,itemId,quantity,`npc_shop:${regionId}`,now);if(!added.ok)return added;
 account.coins-=total;if(stock.quantity!==null){const entry=state.stock[stockKey(regionId,itemId)];entry.quantity-=quantity;}
 return {ok:true,quantity,unitPrice,total,stock:stock.quantity===null?null:stock.quantity-quantity};
}
export function sellToNpc(state:RpgNpcShopStock,profile:RpgProfileData,account:{coins:number},regionId:string,itemId:string,quantity:number,now=Date.now()):NpcMarketResult{
 const item=getRpgItem(itemId);if(!item)return {ok:false,reason:'unknown_item'};if(!item.tradeable)return {ok:false,reason:'not_tradeable'};
 if(!Number.isSafeInteger(quantity)||quantity<=0||quantity>100)return {ok:false,reason:'invalid_quantity'};
 if(countItem(profile,itemId)<quantity)return {ok:false,reason:'insufficient_items'};
 const stock=getStock(state,regionId,itemId,now);if(!stock)return {ok:false,reason:'unknown_item'};if(stock.quantity!==null&&stock.quantity+quantity>stock.limit!)return {ok:false,reason:'stock_full'};
 const unitPrice=Math.max(1,Math.floor((item.basePrice||1)*0.5));const total=unitPrice*quantity;if(!Number.isSafeInteger(account.coins+total))return {ok:false,reason:'balance_overflow'};
 const removed=removeItem(profile,itemId,quantity);if(!removed.ok)return removed;
 account.coins+=total;if(stock.quantity!==null){const entry=state.stock[stockKey(regionId,itemId)];entry.quantity+=quantity;}
 return {ok:true,quantity,unitPrice,total,stock:stock.quantity===null?null:stock.quantity+quantity};
}
