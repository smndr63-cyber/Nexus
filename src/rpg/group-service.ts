export interface RpgGroupMember { userId: string; joinedAt: number; }
export interface RpgGroupInvite { userId: string; invitedAt: number; expiresAt: number; }
export interface RpgGroup { id: string; guildId: string; leaderId: string; members: RpgGroupMember[]; invites: RpgGroupInvite[]; createdAt: number; }
export const RPG_GROUP_MAX_SIZE = 4;
export const RPG_GROUP_INVITE_TTL = 120_000;
export type GroupResult = { ok:true; group:RpgGroup } | { ok:false; reason:string };
export function createGroup(groups: Record<string,RpgGroup>, guildId: string, leaderId: string, now = Date.now()): GroupResult {
 if (Object.values(groups).some(g => g.guildId === guildId && g.members.some(m => m.userId === leaderId))) return { ok:false, reason:'already_in_group' };
 const id = `${now.toString(36)}-${leaderId}`;
 const group: RpgGroup = { id, guildId, leaderId, members:[{userId:leaderId,joinedAt:now}], invites:[], createdAt:now };
 groups[id] = group; return { ok:true, group };
}
export function inviteToGroup(group: RpgGroup, inviterId: string, targetId: string, now = Date.now()): GroupResult {
 group.invites = group.invites.filter(invite => invite.expiresAt > now);
 if (group.leaderId !== inviterId) return { ok:false, reason:'leader_only' };
 if (group.members.length >= RPG_GROUP_MAX_SIZE) return { ok:false, reason:'group_full' };
 if (group.members.some(member => member.userId === targetId)) return { ok:false, reason:'already_member' };
 if (group.invites.some(invite => invite.userId === targetId)) return { ok:false, reason:'invite_exists' };
 group.invites.push({userId:targetId,invitedAt:now,expiresAt:now+RPG_GROUP_INVITE_TTL}); return {ok:true,group};
}
export function acceptGroupInvite(groups: Record<string,RpgGroup>, groupId: string, userId: string, now = Date.now()): GroupResult {
 const group = groups[groupId]; if (!group) return {ok:false,reason:'group_not_found'};
 if (Object.values(groups).some(g => g.id !== groupId && g.guildId === group.guildId && g.members.some(m => m.userId === userId))) return {ok:false,reason:'already_in_group'};
 const invite = group.invites.find(item => item.userId === userId);
 if (!invite || invite.expiresAt <= now) { group.invites = group.invites.filter(item => item.userId !== userId); return {ok:false,reason:'invite_expired'}; }
 if (group.members.length >= RPG_GROUP_MAX_SIZE) return {ok:false,reason:'group_full'};
 group.members.push({userId,joinedAt:now}); group.invites = group.invites.filter(item => item.userId !== userId);
 return {ok:true,group};
}
export function leaveGroup(groups: Record<string,RpgGroup>, groupId: string, userId: string): GroupResult {
 const group = groups[groupId]; if (!group || !group.members.some(m => m.userId === userId)) return {ok:false,reason:'not_in_group'};
 group.members = group.members.filter(m => m.userId !== userId);
 if (!group.members.length) delete groups[groupId];
 else if (group.leaderId === userId) group.leaderId = group.members[0].userId;
 return {ok:true,group};
}
