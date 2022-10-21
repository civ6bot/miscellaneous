import {ButtonInteraction, CommandInteraction, EmbedBuilder, Guild, GuildMember, TextChannel} from "discord.js";
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
                entityUserPunishment.guildID, "MODERATION_CHANNEL_ID"
            );
            let channel: TextChannel | undefined = discordClient.channels.cache.get(channelID) as TextChannel;
            let guild: Guild | undefined = discordClient.guilds.cache.get(entityUserPunishment.guildID);
            let member: GuildMember | undefined = guild?.members.cache.get(entityUserPunishment.userID);
            let fameDifference: number = 0;

            if((entityUserPunishment.timeBanEnd !== null) && (entityUserPunishment.timeBanEnd <= Date.now())) {
                fameDifference += 2*Math.round(
                    (entityUserPunishment.timeBanEnd-(entityUserPunishment.timeBanStart as number))/(1000*3600)
                );
                entityUserPunishment.timeBanStart = null;
                entityUserPunishment.timeBanEnd = null;
                entityUserPunishment.reasonBan = null;
                entityUserPunishment.timeBanTierLastChange = Date.now();

                if(member !== undefined) {
                    try {
                        member.roles.remove(
                            await moderationService.getOneSettingString(
                                entityUserPunishment.guildID, "MODERATION_ROLE_BAN_ID"
                            )
                        );
                    } catch {}
                }
                if(channel !== undefined) {
                    try {
                        let textStrings: string[] = await moderationService.getManyText(entityUserPunishment.guildID, [
                            "MODERATION_UNBAN_TITLE", "MODERATION_FIELD_USER_TITLE",
                            "MODERATION_BOTTOM_TIMEOUT"
                        ]);
                        channel.send({embeds: moderationService.moderationUI.riddance(
                                textStrings[0], textStrings[1], entityUserPunishment.userID,
                                null, null, textStrings[2], null
                            )});
                    } catch {}
                }
            }

            if((entityUserPunishment.timeMuteChatEnd !== null) && (entityUserPunishment.timeMuteChatEnd <= Date.now())) {
                fameDifference += Math.round(
                    (entityUserPunishment.timeMuteChatEnd-(entityUserPunishment.timeMuteChatStart as number))/(1000*60)
                );
                entityUserPunishment.timeMuteChatStart = null;
                entityUserPunishment.timeMuteChatEnd = null;
                entityUserPunishment.reasonMuteChat = null;

                if(member !== undefined) {
                    try {
                        member.roles.remove(
                            await moderationService.getOneSettingString(
                                entityUserPunishment.guildID, "MODERATION_ROLE_MUTE_CHAT_ID"
                            )
                        );
                    } catch {}
                }
                if(channel !== undefined) {
                    try {
                        let textStrings: string[] = await moderationService.getManyText(entityUserPunishment.guildID, [
                            "MODERATION_UNMUTE_CHAT_TITLE", "MODERATION_FIELD_USER_TITLE",
                            "MODERATION_BOTTOM_TIMEOUT"
                        ]);
                        channel.send({embeds: moderationService.moderationUI.riddance(
                                textStrings[0], textStrings[1], entityUserPunishment.userID,
                                null, null, textStrings[2], null
                            )});
                    } catch {}
                }
            }

            if((entityUserPunishment.timeMuteVoiceEnd !== null) && (entityUserPunishment.timeMuteVoiceEnd <= Date.now())) {
                fameDifference += Math.round(
                    (entityUserPunishment.timeMuteVoiceEnd-(entityUserPunishment.timeMuteVoiceStart as number))/(1000*60)
                );
                entityUserPunishment.timeMuteVoiceStart = null;
                entityUserPunishment.timeMuteVoiceEnd = null;
                entityUserPunishment.reasonMuteVoice = null;

                if(member !== undefined) {
                    try {
                        member.roles.remove(
                            await moderationService.getOneSettingString(
                                entityUserPunishment.guildID, "MODERATION_ROLE_MUTE_VOICE_ID"
                            )
                        );
                    } catch {}
                }
                if(channel !== undefined) {
                    try {
                        let textStrings: string[] = await moderationService.getManyText(entityUserPunishment.guildID, [
                            "MODERATION_UNMUTE_VOICE_TITLE", "MODERATION_FIELD_USER_TITLE",
                            "MODERATION_BOTTOM_TIMEOUT"
                        ]);
                        channel.send({embeds: moderationService.moderationUI.riddance(
                                textStrings[0], textStrings[1], entityUserPunishment.userID,
                                null, null, textStrings[2], null
                            )});
                    } catch {}
                }
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

    public static async banTierDecreaseTimeout(): Promise<void> {
        let moderationService: ModerationService = new ModerationService();
        let databaseServiceUserPunishment: DatabaseServiceUserPunishment = new DatabaseServiceUserPunishment();

        let entitiesUserPunishment: EntityUserPunishment[] = await databaseServiceUserPunishment.getAllForTierDecreasing();
        let changedEntitiesUserPunishment: EntityUserPunishment[] = [];

        for(let i in entitiesUserPunishment) {
            let daysForDecreasingTier: number = await moderationService.getOneSettingNumber(
                entitiesUserPunishment[i].guildID, "MODERATION_BAN_TIER_DECREASE_DAYS"
            );
            if(Date.now()-(entitiesUserPunishment[i].timeBanTierLastChange as number) > daysForDecreasingTier*1000*60*60*24) {
                entitiesUserPunishment[i].banTier = Math.max(entitiesUserPunishment[i].banTier-1, 0);
                entitiesUserPunishment[i].timeBanTierLastChange = Date.now();
                changedEntitiesUserPunishment.push(entitiesUserPunishment[i]);
            }
        }

        await databaseServiceUserPunishment.insert(changedEntitiesUserPunishment);
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

    private async replyNoPermission(interaction: CommandInteraction): Promise<void> {
        let textStrings: string[] = await this.getManyText(interaction, [
            "BASE_ERROR_TITLE", "MODERATION_ERROR_NO_PERMISSION"
        ]);
        await interaction.reply({
            embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
            ephemeral: true
        });
    }

    private async replyRoleMissing(interaction: CommandInteraction): Promise<void> {
        let textStrings: string[] = await this.getManyText(interaction, [
            "BASE_ERROR_TITLE", "MODERATION_ERROR_ROLE_MISSING_CONFIG"
        ]);
        await interaction.reply({
            embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
            ephemeral: true
        });
    }

    private async replyUserNotFound(interaction: CommandInteraction): Promise<void> {
        let textStrings: string[] = await this.getManyText(interaction, [
            "BASE_ERROR_TITLE", "MODERATION_ERROR_USER_NOT_FOUND"
        ]);
        await interaction.reply({
            embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
            ephemeral: true
        });
    }

    private async replyUserNotPunished(interaction: CommandInteraction): Promise<void> {
        let textStrings: string[] = await this.getManyText(interaction, [
            "BASE_ERROR_TITLE", "MODERATION_ERROR_NOT_PUNISHED"
        ]);
        await interaction.reply({
            embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
            ephemeral: true
        });
    }

    private async addRole(member: GuildMember, roleID: string): Promise<boolean> {
        if(roleID !== "") {
            try {
                await member.roles.add(roleID);
                return true;
            } catch {
                return false;
            }
        } else
            return false;
    }

    private async removeRole(member: GuildMember, roleID: string): Promise<boolean> {
        if(roleID !== "") {
            try {
                await member.roles.remove(roleID);
                return true;
            } catch {
                return false;
            }
        } else
            return false;
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

    public async banTierResetAllButtonConfirm(interaction: ButtonInteraction) {

    }

    public async banTierResetAllButtonCancel(interaction: ButtonInteraction) {

    }

    public async pardon(interaction: CommandInteraction, member: GuildMember, reason: string) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guildId as string, userID
        );

        if((entityUserPunishment.timeBanStart === null)
            && (entityUserPunishment.timeMuteChatStart === null)
            && (entityUserPunishment.timeMuteVoiceStart === null)
        ) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "MODERATION_ERROR_NOT_PUNISHED_ANY"
            ]);
            return await interaction.reply({
                embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        entityUserPunishment.timeBanStart = null;
        entityUserPunishment.timeBanEnd = null;
        entityUserPunishment.reasonBan = null;

        entityUserPunishment.timeMuteChatStart = null;
        entityUserPunishment.timeMuteChatEnd = null;
        entityUserPunishment.reasonMuteChat = null;

        entityUserPunishment.timeMuteVoiceStart = null;
        entityUserPunishment.timeMuteVoiceEnd = null;
        entityUserPunishment.reasonMuteVoice = null;

        await this.databaseServiceUserPunishment.insert(entityUserPunishment);

        let rolesID: string[] = await this.getManySettingString(interaction,
            "MODERATION_ROLE_BAN_ID", "MODERATION_ROLE_MUTE_CHAT_ID",
            "MODERATION_ROLE_MUTE_VOICE_ID"
        );
        for(let roleID of rolesID)
            await this.removeRole(member, roleID);

        let textStrings: string[] = await this.getManyText(entityUserPunishment.guildID, [
            "MODERATION_PARDON_TITLE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_REASON_TITLE", "MODERATION_FIELD_REASON_DESCRIPTION_NONE",
            "MODERATION_BOTTOM_AUTHOR"
        ]);
        let embed: EmbedBuilder[] = this.moderationUI.riddance(
            textStrings[0], textStrings[1],
            entityUserPunishment.userID, textStrings[2],
            (reason === "") ? textStrings[3] : reason, textStrings[4],
            interaction.user
        );
        await interaction.reply({embeds: embed});

        let channelID: string = await this.getOneSettingString(
            entityUserPunishment.guildID, "MODERATION_CHANNEL_ID"
        );
        let channel: TextChannel | undefined = interaction.guild?.channels.cache.get(channelID) as TextChannel;
        if(channel !== undefined) {
            try {
                await channel.send({embeds: embed});
            } catch {}
        }
    }

    public async clear(interaction: CommandInteraction, clearAmount: number) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);
        let clearAmountMax: number = await this.getOneSettingNumber(interaction, "MODERATION_CLEAR_MAX");
        if((clearAmount > clearAmountMax) || (clearAmount < 1)) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "MODERATION_ERROR_CLEAR_BOUNDS"
            ], [null, [clearAmountMax]]);
            return await interaction.reply({
                embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        await interaction.deferReply({ephemeral: true});
        let channel: TextChannel = interaction.channel as TextChannel;
        let fetchedMessages = await channel.messages.fetch({limit: clearAmount});
        await channel.bulkDelete(fetchedMessages);
        let fetchedMessagesAmount: number = Array.from(fetchedMessages.keys()).length;

        let title: string = await this.getOneText(interaction, "MODERATION_CLEAR_TITLE", fetchedMessagesAmount);
        await interaction.editReply({embeds: this.moderationUI.clear(title)});
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
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guildId as string, userID
        );
        if(entityUserPunishment.timeBanStart === null)
            return await this.replyUserNotPunished(interaction);
        entityUserPunishment.timeBanStart = null;
        entityUserPunishment.timeBanEnd = null;
        entityUserPunishment.reasonBan = null;
        await this.databaseServiceUserPunishment.insert(entityUserPunishment);

        let roleID: string = await this.getOneSettingString(interaction, "MODERATION_ROLE_BAN_ID");
        await this.removeRole(member, roleID);

        let textStrings: string[] = await this.getManyText(entityUserPunishment.guildID, [
            "MODERATION_UNBAN_TITLE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_REASON_TITLE", "MODERATION_FIELD_REASON_DESCRIPTION_NONE",
            "MODERATION_BOTTOM_AUTHOR"
        ]);
        let embed: EmbedBuilder[] = this.moderationUI.riddance(
            textStrings[0], textStrings[1],
            entityUserPunishment.userID, textStrings[2],
            (reason === "") ? textStrings[3] : reason, textStrings[4],
            interaction.user
        );
        await interaction.reply({embeds: embed});

        let channelID: string = await this.getOneSettingString(
            entityUserPunishment.guildID, "MODERATION_CHANNEL_ID"
        );
        let channel: TextChannel | undefined = interaction.guild?.channels.cache.get(channelID) as TextChannel;
        if(channel !== undefined) {
            try {
                await channel.send({embeds: embed});
            } catch {}
        }

        await ModerationService.updatePunishmentTimeout();
    }

    public async unmuteChat(interaction: CommandInteraction, member: GuildMember, reason: string) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guildId as string, userID
        );
        if(entityUserPunishment.timeMuteChatStart === null)
            return await this.replyUserNotPunished(interaction);
        entityUserPunishment.timeMuteChatStart = null;
        entityUserPunishment.timeMuteChatEnd = null;
        entityUserPunishment.reasonMuteChat = null;
        await this.databaseServiceUserPunishment.insert(entityUserPunishment);
        let roleID: string = await this.getOneSettingString(interaction, "MODERATION_ROLE_MUTE_CHAT_ID");
        await this.removeRole(member, roleID);

        let textStrings: string[] = await this.getManyText(entityUserPunishment.guildID, [
            "MODERATION_UNMUTE_CHAT_TITLE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_REASON_TITLE", "MODERATION_FIELD_REASON_DESCRIPTION_NONE",
            "MODERATION_BOTTOM_AUTHOR"
        ]);
        let embed: EmbedBuilder[] = this.moderationUI.riddance(
            textStrings[0], textStrings[1],
            entityUserPunishment.userID, textStrings[2],
            (reason === "") ? textStrings[3] : reason, textStrings[4],
            interaction.user
        );
        await interaction.reply({embeds: embed});

        let channelID: string = await this.getOneSettingString(
            entityUserPunishment.guildID, "MODERATION_CHANNEL_ID"
        );
        let channel: TextChannel | undefined = interaction.guild?.channels.cache.get(channelID) as TextChannel;
        if(channel !== undefined) {
            try {
                await channel.send({embeds: embed});
            } catch {}
        }

        await ModerationService.updatePunishmentTimeout();
    }

    public async unmuteVoice(interaction: CommandInteraction, member: GuildMember, reason: string) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guildId as string, userID
        );
        if(entityUserPunishment.timeMuteVoiceStart === null)
            return await this.replyUserNotPunished(interaction);
        entityUserPunishment.timeMuteVoiceStart = null;
        entityUserPunishment.timeMuteVoiceEnd = null;
        entityUserPunishment.reasonMuteVoice = null;
        await this.databaseServiceUserPunishment.insert(entityUserPunishment);
        let roleID: string = await this.getOneSettingString(interaction, "MODERATION_ROLE_MUTE_VOICE_ID");
        await this.removeRole(member, roleID);

        let textStrings: string[] = await this.getManyText(entityUserPunishment.guildID, [
            "MODERATION_UNMUTE_VOICE_TITLE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_REASON_TITLE", "MODERATION_FIELD_REASON_DESCRIPTION_NONE",
            "MODERATION_BOTTOM_AUTHOR"
        ]);
        let embed: EmbedBuilder[] = this.moderationUI.riddance(
            textStrings[0], textStrings[1],
            entityUserPunishment.userID, textStrings[2],
            (reason === "") ? textStrings[3] : reason, textStrings[4],
            interaction.user
        );
        await interaction.reply({embeds: embed});

        let channelID: string = await this.getOneSettingString(
            entityUserPunishment.guildID, "MODERATION_CHANNEL_ID"
        );
        let channel: TextChannel | undefined = interaction.guild?.channels.cache.get(channelID) as TextChannel;
        if(channel !== undefined) {
            try {
                await channel.send({embeds: embed});
            } catch {}
        }

        await ModerationService.updatePunishmentTimeout();
    }
}
