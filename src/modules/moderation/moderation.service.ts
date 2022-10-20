import {CommandInteraction, Guild, GuildChannel, GuildMember, GuildTextChannelResolvable, Role} from "discord.js";
import {ModuleBaseService} from "../base/base.service";
import {ModerationUI} from "./moderation.ui";
import {DatabaseServiceUserPunishment} from "../../database/services/service.UserPunishment";
import {DatabaseServiceUserProfile} from "../../database/services/service.UserProfile";
import {UtilsServiceUsers} from "../../utils/services/utils.service.users";
import {EntityUserPunishment} from "../../database/entities/entity.UserPunishment";
import {EntityUserProfile} from "../../database/entities/entity.UserProfile";
import {discordClient} from "../../discord/discord.client";

export class ModerationService extends ModuleBaseService {
    private moderationUI: ModerationUI = new ModerationUI();
    private databaseServiceUserPunishment: DatabaseServiceUserPunishment = new DatabaseServiceUserPunishment();

    public static punishmentTimeoutID: NodeJS.Timeout | number | null = null;

    public static async punishmentTimeout(): Promise<void> {
        let moderationService: ModerationService = new ModerationService();
        let databaseServiceUserPunishment: DatabaseServiceUserPunishment = new DatabaseServiceUserPunishment();
        let databaseServiceUserProfile: DatabaseServiceUserProfile = new DatabaseServiceUserProfile();

        let entitiesUserPunishment: EntityUserPunishment[] = await databaseServiceUserPunishment.getAllExpired();
        let entitiesUserProfile: EntityUserProfile[] = [];

        for(let entityUserPunishment of entitiesUserPunishment) {
            let channelID: string = await moderationService.getOneSettingString(
                entityUserPunishment.guildID,
                "MODERATION_CHANNEL_ID"
            );
            let guild: Guild | undefined = discordClient.guilds.cache.get(entityUserPunishment.guildID);
            let channel: GuildTextChannelResolvable | undefined = guild?.channels.cache.get(channelID) as GuildTextChannelResolvable;
            let member: GuildMember | undefined = guild?.members.cache.get(entityUserPunishment.userID);
            let fameDifference: number = 0;

            if((entityUserPunishment.timeBanEnd !== null) && (entityUserPunishment.timeBanEnd <= Date.now())) {
                fameDifference += 2*Math.round(
                    (entityUserPunishment.timeBanEnd-(entityUserPunishment.timeBanStart as number))/(1000*3600)
                );
                entityUserPunishment.timeBanStart = null;
                entityUserPunishment.timeBanEnd = null;
                entityUserPunishment.reasonBan = null;
                entityUserPunishment.timeBanEndLast = Date.now();

                try {
                    await member?.roles.remove(
                        await moderationService.getOneSettingString(
                            entityUserPunishment.guildID, "MODERATION_CHANNEL_ID"
                        )
                    );
                } catch {}
                try {

                } catch {}
            }

            if((entityUserPunishment.timeMuteChatEnd !== null) && (entityUserPunishment.timeMuteChatEnd <= Date.now())) {
                fameDifference += Math.round(
                    (entityUserPunishment.timeMuteChatEnd-(entityUserPunishment.timeMuteChatStart as number))/(1000*60)
                );
                entityUserPunishment.timeMuteChatStart = null;
                entityUserPunishment.timeMuteChatEnd = null;
                entityUserPunishment.reasonMuteChat = null;
            }

            if((entityUserPunishment.timeMuteVoiceEnd !== null) && (entityUserPunishment.timeMuteVoiceEnd <= Date.now())) {
                fameDifference += Math.round(
                    (entityUserPunishment.timeMuteVoiceEnd-(entityUserPunishment.timeMuteVoiceStart as number))/(1000*60)
                );
                entityUserPunishment.timeMuteVoiceStart = null;
                entityUserPunishment.timeMuteVoiceEnd = null;
                entityUserPunishment.reasonMuteVoice = null;
            }

            let entityUserProfile: EntityUserProfile = await databaseServiceUserProfile.getOne(
                entityUserPunishment.guildID, entityUserPunishment.userID
            );
            entityUserProfile.fame = Math.max(entityUserProfile.fame-fameDifference, 0);
            entitiesUserProfile.push(entityUserProfile);
        }

        await databaseServiceUserPunishment.insert(entitiesUserPunishment);
        await databaseServiceUserProfile.insert(entitiesUserProfile);
        await this.updatePunishmentTimeout();
    }

    public static async updatePunishmentTimeout(): Promise<void> {
        if(this.punishmentTimeoutID !== null) {
            clearTimeout(this.punishmentTimeoutID);
            this.punishmentTimeoutID = null;
        }
        let databaseServiceUserPunishment: DatabaseServiceUserPunishment = new DatabaseServiceUserPunishment();

        let nextTime: number|null = await databaseServiceUserPunishment.getNextExpiringTime();
        if(nextTime !== null)
            ModerationService.punishmentTimeoutID = setTimeout(
                ModerationService.punishmentTimeout,
                Math.min(50, nextTime-Date.now())
            );
    }

    private async isModerator(interaction: CommandInteraction): Promise<boolean> {
        let member: GuildMember = interaction.member as GuildMember;
        if(UtilsServiceUsers.isAdmin(member))
            return true;
        let moderationRolesID: string[] = (await this.getOneSettingString(
            interaction, "MODERATION_ROLE_MODERATORS_ID"
        )).split(" ");
        return member.roles.cache.some((value, key) => (moderationRolesID.indexOf(key) !== -1));
    }

    public async ban(
        interaction: CommandInteraction,
        member: GuildMember,
        timeType: string,
        timeAmount: number,
        reason: string
    ) {

    }

    public async banTierBan(interaction: CommandInteraction, member: GuildMember, reason: string) {

    }

    public async banTierSet(interaction: CommandInteraction, member: GuildMember, banTier: number, reason: string) {

    }

    public async banTierResetUser(interaction: CommandInteraction, member: GuildMember, reason: string) {

    }

    public async banTierResetAll(interaction: CommandInteraction) {

    }

    public async pardon(interaction: CommandInteraction, member: GuildMember, reason: string) {

    }

    public async clear(interaction: CommandInteraction, clearAmount: number) {

    }

    public async muteVoice(
        interaction: CommandInteraction,
        member: GuildMember,
        timeType: string,
        timeAmount: number,
        reason: string
    ) {

    }

    public async muteChat(
        interaction: CommandInteraction,
        member: GuildMember,
        timeType: string,
        timeAmount: number,
        reason: string
    ) {

    }

    public async unban(interaction: CommandInteraction, member: GuildMember, reason: string) {

    }

    public async unmuteVoice(interaction: CommandInteraction, member: GuildMember, reason: string) {

    }

    public async unmuteChat(interaction: CommandInteraction, member: GuildMember, reason: string) {

    }
}
