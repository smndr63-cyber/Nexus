import type { RpgItemInstance, RpgProfileData } from './types';
import { getRpgItem } from './data/items';
import { countItem, removeItem, addItem } from './inventory-service';
export interface RpgMarketListing { id:string; sellerId:string; itemId:string; quantity:number; unitPrice:number; createdAt:number; expiresAt:number; }
export type MarketResult = {ok:true; listing?:RpgMarketListing; total?:number} | {ok:false;reason:string};
export function createListing(listings: Record<string,RpgMarketListing>, sellerId:string, profile:RpgProfileData, itemId:string, quantity:number, unitPrice:number, now=Date.now()):MarketResult {
 const item=getRpgItem(itemId);
 if(!item?.tradeable)return {ok:false,reason:'not_tradeable'};
 if(!Number.isSafeInteger(quantity)||quantity<1||quantity>999||!Number.isSafeInteger(unitPrice)||unitPrice<1||unitPrice>10_000_000)return {ok:false,reason:'invalid_listing'};
 if(Object.values(listings).filter(listing=>listing.sellerId===sellerId&&listing.expiresAt>now).length>=10)return {ok:false,reason:'listing_limit'};
 const matching=(profile.itemInstances||[]).filter(item=>item.definitionId===itemId);if(matching.some(item=>item.bound||item.tradeable===false))return {ok:false,reason:'bound_item'};
 if(countItem(profile,itemId)<quantity)return {ok:false,reason:'insufficient_items'};
 const removed=removeItem(profile,itemId,quantity); if(!removed.ok)return {ok:false,reason:removed.reason};
 const id=`${now.toString(36)}-${sellerId}-${Math.random().toString(36).slice(2,7)}`;
 const listing={id,sellerId,itemId,quantity,unitPrice,createdAt:now,expiresAt:now+7*24*60*60_000}; listings[id]=listing;
 return {ok:true,listing};
}
export function buyListing(listings:Record<string,RpgMarketListing>, listingId:string, buyerId:string, buyer:RpgProfileData, buyerCoins:number, now=Date.now()):MarketResult {
 const listing=listings[listingId]; if(!listing)return {ok:false,reason:'listing_not_found'};
 if(listing.sellerId===buyerId)return {ok:false,reason:'own_listing'};
 if(listing.expiresAt<=now){delete listings[listingId];return {ok:false,reason:'listing_expired'};}
 const total=listing.quantity*listing.unitPrice;
 if(!Number.isSafeInteger(total)||buyerCoins<total)return {ok:false,reason:'insufficient_coins'};
 const added=addItem(buyer,listing.itemId,listing.quantity,'player_market'); if(!added.ok)return {ok:false,reason:added.reason};
 delete listings[listingId]; return {ok:true,total};
}
export function cancelListing(listings:Record<string,RpgMarketListing>, listingId:string, sellerId:string, seller:RpgProfileData):MarketResult {
 const listing=listings[listingId]; if(!listing)return {ok:false,reason:'listing_not_found'};
 if(listing.sellerId!==sellerId)return {ok:false,reason:'not_owner'};
 const added=addItem(seller,listing.itemId,listing.quantity,'market_return'); if(!added.ok)return {ok:false,reason:added.reason};
 delete listings[listingId]; return {ok:true};
}
