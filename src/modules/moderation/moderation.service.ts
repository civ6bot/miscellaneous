import {ButtonInteraction, CommandInteraction, EmbedBuilder, Guild, GuildMember, TextChannel} from "discord.js";
import {ModuleBaseService} from "../base/base.service";
import {ModerationUI} from "./moderation.ui";
import {DatabaseServiceUserPunishment} from "../../database/services/service.UserPunishment";
import {DatabaseServiceUserProfile} from "../../database/services/service.UserProfile";
import {UtilsServiceUsers} from "../../utils/services/utils.service.users";
import {EntityUserPunishment} from "../../database/entities/entity.UserPunishment";
import {EntityUserProfile} from "../../database/entities/entity.UserProfile";
import {discordClient} from "../../discord/discord.client";
import {UtilsServiceTime} from "../../utils/services/utils.service.time";
import {UtilsGeneratorTimestamp} from "../../utils/generators/utils.generator.timestamp";

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

        console.log("punishmentTimeout call");
        for(let entityUserPunishment of entitiesUserPunishment) {
            console.log("for cycle, entityUserPunishment: ", entityUserPunishment);
            let channelID: string = await moderationService.getOneSettingString(
                entityUserPunishment.guildID, "MODERATION_CHANNEL_ID"
            );
            let guild: Guild | undefined = discordClient.guilds.cache.get(entityUserPunishment.guildID);
            let channel: TextChannel | undefined = guild?.channels.cache.get(channelID) as (TextChannel | undefined);
            let member: GuildMember | undefined = guild?.members.cache.get(entityUserPunishment.userID);
            let fameDifference: number = 0;
            console.log("guild, channel, member: ", !!guild, !!channel, !!member);

            if((entityUserPunishment.timeBanEnd !== null) && (entityUserPunishment.timeBanEnd.getTime() <= Date.now())) {
                fameDifference += 2*Math.round(
                    (entityUserPunishment.timeBanEnd.getTime()-(entityUserPunishment.timeBanStart?.getTime() as number))/(UtilsServiceTime.getMs(1, "h"))
                );
                entityUserPunishment.timeBanStart = null;
                entityUserPunishment.timeBanEnd = null;
                entityUserPunishment.reasonBan = null;
                entityUserPunishment.timeBanTierLastChange = new Date();

                if(member !== undefined) {
                    try {
                        await member.roles.remove(
                            await moderationService.getOneSettingString(
                                entityUserPunishment.guildID, "MODERATION_ROLE_BAN_ID"
                            )
                        );
                    } catch {}
                }
                if(channel !== undefined) {
                    console.log("try to send in channel");
                    let textStrings: string[] = await moderationService.getManyText(entityUserPunishment.guildID, [
                        "MODERATION_UNBAN_TITLE", "MODERATION_FIELD_USER_TITLE",
                        "MODERATION_BOTTOM_TIMEOUT"
                    ]);
                    try {
                        await channel.send({
                            embeds: moderationService.moderationUI.riddanceEmbed(
                                textStrings[0], textStrings[1], entityUserPunishment.userID,
                                null, null, textStrings[2], null
                            )
                        });
                    } catch {}
                }
            }

            if((entityUserPunishment.timeMuteChatEnd !== null) && (entityUserPunishment.timeMuteChatEnd.getTime() <= Date.now())) {
                fameDifference += Math.round(
                    (entityUserPunishment.timeMuteChatEnd.getTime()-(entityUserPunishment.timeMuteChatStart?.getTime() as number))/(UtilsServiceTime.getMs(1, "h"))
                );
                entityUserPunishment.timeMuteChatStart = null;
                entityUserPunishment.timeMuteChatEnd = null;
                entityUserPunishment.reasonMuteChat = null;

                if(member !== undefined) {
                    try {
                        await member.roles.remove(
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
                        await channel.send({embeds: moderationService.moderationUI.riddanceEmbed(
                                textStrings[0], textStrings[1], entityUserPunishment.userID,
                                null, null, textStrings[2], null
                            )});
                    } catch {}
                }
            }

            if((entityUserPunishment.timeMuteVoiceEnd !== null) && (entityUserPunishment.timeMuteVoiceEnd.getTime() <= Date.now())) {
                fameDifference += Math.round(
                    (entityUserPunishment.timeMuteVoiceEnd.getTime()-(entityUserPunishment.timeMuteVoiceStart?.getTime() as number))/(UtilsServiceTime.getMs(1, "h"))
                );
                entityUserPunishment.timeMuteVoiceStart = null;
                entityUserPunishment.timeMuteVoiceEnd = null;
                entityUserPunishment.reasonMuteVoice = null;

                if(member !== undefined) {
                    try {
                        await member.roles.remove(
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
                        await channel.send({embeds: moderationService.moderationUI.riddanceEmbed(
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
        await ModerationService.updatePunishmentTimeout();
    }

    public static async updatePunishmentTimeout(): Promise<void> {
        console.log("updatePunishmentTimeout call");
        if(this.punishmentTimeoutID !== null) {
            clearTimeout(this.punishmentTimeoutID);
            this.punishmentTimeoutID = null;
        }
        let databaseServiceUserPunishment: DatabaseServiceUserPunishment = new DatabaseServiceUserPunishment();

        let nextTime: Date|null = await databaseServiceUserPunishment.getNextExpiringTime();
        console.log("current time:", new Date());
        console.log("next time: ", nextTime);
        if(nextTime !== null) {
            console.log("elapsed time, ms: ", nextTime.getTime() - Date.now());
            ModerationService.punishmentTimeoutID = setTimeout(
                ModerationService.punishmentTimeout,
                Math.max(500, nextTime.getTime()-Date.now())  // 500 ms для тестов
            );
        }
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
            if(Date.now()-(entitiesUserPunishment[i].timeBanTierLastChange?.getTime() as number) > UtilsServiceTime.getMs(daysForDecreasingTier, "d")) {
                entitiesUserPunishment[i].banTier = Math.max(entitiesUserPunishment[i].banTier-1, 0);
                entitiesUserPunishment[i].timeBanTierLastChange = new Date();
                changedEntitiesUserPunishment.push(entitiesUserPunishment[i]);
            }
        }
        await databaseServiceUserPunishment.insert(changedEntitiesUserPunishment);
    }

    private async isModerator(interaction: CommandInteraction | ButtonInteraction): Promise<boolean> {
        let member: GuildMember = interaction.member as GuildMember;
        if(UtilsServiceUsers.isAdmin(member))
            return true;
        let moderationRolesID: string[] = (await this.getOneSettingString(
            interaction, "MODERATION_ROLE_MODERATORS_ID"
        )).split(" ");
        return member.roles.cache.some((value, key) => (moderationRolesID.indexOf(key) !== -1));
    }

    private async replyNoPermission(interaction: CommandInteraction | ButtonInteraction): Promise<void> {
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

    private async tryKickFromVoice(member: GuildMember): Promise<boolean> {
        try {
            await member.voice.disconnect();
            return true;
        } catch {
            return false;
        }
    }

    private async trySendToModerationChannel(interaction: CommandInteraction, embed: EmbedBuilder[]): Promise<void> {
        let channelID: string = await this.getOneSettingString(
            interaction.guild?.id as string, "MODERATION_CHANNEL_ID"
        );
        let channel: TextChannel | undefined = interaction.guild?.channels.cache.get(channelID) as (TextChannel | undefined);
        if(channel !== undefined) {
            try {
                await channel.send({embeds: embed});
            } catch {}
        }
    }

    private async addRole(member: GuildMember, roleID: string): Promise<boolean> {
        if(roleID === "")
            return false;
        try {
            await member.roles.add(roleID);
            return true;
        } catch {
            return false;
        }
    }

    private async removeRole(member: GuildMember, roleID: string): Promise<boolean> {
        if(roleID === "")
            return false;
        try {
            await member.roles.remove(roleID);
            return true;
        } catch {
            return false;
        }
    }

    public async ban(
        interaction: CommandInteraction,
        member: GuildMember,
        timeType: string,
        timeAmount: number,
        reason: string
    ) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let roleID: string = await this.getOneSettingString(interaction, "MODERATION_ROLE_BAN_ID");
        console.log(roleID);
        if(!await this.addRole(member, roleID))
            return await this.replyRoleMissing(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guild?.id as string, userID
        );
        let hasPunishment: boolean = (entityUserPunishment.timeBanEnd !== null);
        if(hasPunishment) {
            entityUserPunishment.timeBanEnd = new Date(entityUserPunishment.timeBanEnd?.getTime() as number + UtilsServiceTime.getMs(timeAmount, timeType));
        } else {
            entityUserPunishment.timeBanStart = new Date();
            console.log("UtilsServiceTime.getMs: ", timeAmount, timeType, UtilsServiceTime.getMs(timeAmount, timeType));
            entityUserPunishment.timeBanEnd = new Date(Date.now() + UtilsServiceTime.getMs(timeAmount, timeType));
        }
        let textStrings: string[] = await this.getManyText(interaction, [
            hasPunishment ? "MODERATION_BAN_EXTENSION_TITLE" : "MODERATION_BAN_TITLE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_DURATION_TITLE", "MODERATION_FIELD_REASON_TITLE",
            "MODERATION_FIELD_REASON_DESCRIPTION_NONE", "MODERATION_BOTTOM_AUTHOR"
        ]);
        entityUserPunishment.reasonBan = (reason === "") ? textStrings[4] : reason;
        await this.databaseServiceUserPunishment.insert(entityUserPunishment);

        let embed: EmbedBuilder[] = this.moderationUI.punishmentEmbed(
            textStrings[0], textStrings[1],
            userID, textStrings[2],
            UtilsGeneratorTimestamp.getFormattedDate(entityUserPunishment.timeBanEnd), textStrings[3],
            entityUserPunishment.reasonBan, textStrings[5], interaction.user
        );
        await interaction.reply({embeds: embed});
        await this.trySendToModerationChannel(interaction, embed);
        await ModerationService.updatePunishmentTimeout();
    }

    public async banTierBan(interaction: CommandInteraction, member: GuildMember, reason: string) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guild?.id as string, userID
        );
        let banTierLevels: number[] = (await this.getOneSettingString(interaction, "MODERATION_BAN_TIERS"))
            .split(" ")
            .map((str: string): number => Number(str));
        if(entityUserPunishment.banTier >= banTierLevels.length) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "MODERATION_ERROR_BAN_TIER_MAX"
            ], [null, [banTierLevels.length]]);
            return await interaction.reply({
                embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let roleID: string = await this.getOneSettingString(interaction, "MODERATION_ROLE_BAN_ID");
        if(!await this.addRole(member, roleID))
            return await this.replyRoleMissing(interaction);

        if(entityUserPunishment.timeBanEnd !== null) {
            entityUserPunishment.timeBanEnd = new Date(entityUserPunishment.timeBanEnd?.getTime() as number + UtilsServiceTime.getMs(banTierLevels[entityUserPunishment.banTier], "d"));
        } else {
            entityUserPunishment.timeBanStart = new Date();
            entityUserPunishment.timeBanEnd = new Date(Date.now() + UtilsServiceTime.getMs(banTierLevels[entityUserPunishment.banTier], "d"));
        }
        entityUserPunishment.banTier++;
        let textStrings: string[] = await this.getManyText(interaction, [
            "MODERATION_BAN_TIER_TITLE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_DURATION_TITLE", "MODERATION_FIELD_REASON_TITLE",
            "MODERATION_FIELD_REASON_DESCRIPTION_NONE", "MODERATION_BOTTOM_AUTHOR"
        ], [
            [entityUserPunishment.banTier]
        ]);
        entityUserPunishment.reasonBan = (reason === "") ? textStrings[4] : reason;
        await this.databaseServiceUserPunishment.insert(entityUserPunishment);

        let embed: EmbedBuilder[] = this.moderationUI.punishmentEmbed(
            textStrings[0], textStrings[1],
            userID, textStrings[2],
            UtilsGeneratorTimestamp.getFormattedDate(entityUserPunishment.timeBanEnd), textStrings[3],
            entityUserPunishment.reasonBan, textStrings[5], interaction.user
        );
        await interaction.reply({embeds: embed});
        await this.trySendToModerationChannel(interaction, embed);
        await ModerationService.updatePunishmentTimeout();
    }

    public async banTierSet(interaction: CommandInteraction, member: GuildMember, banTier: number, reason: string) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);
        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let maxTierLevel: number = (await this.getOneSettingString(interaction, "MODERATION_BAN_TIERS"))
            .split(" ")
            .length;
        if((banTier < 0) || banTier > maxTierLevel) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "MODERATION_ERROR_BAN_TIER_BOUNDS"
            ], [null, [maxTierLevel]]);
            return await interaction.reply({
                embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guild?.id as string, userID
        );
        if(entityUserPunishment.banTier === banTier) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "MODERATION_ERROR_BAN_TIER_SAME"
            ]);
            return await interaction.reply({
                embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let banTierBefore: number = entityUserPunishment.banTier;
        entityUserPunishment.banTier = banTier;
        await this.databaseServiceUserPunishment.insert(entityUserPunishment);
        let textStrings: string[] = await this.getManyText(interaction, [
            "MODERATION_BAN_TIER_CHANGE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_BAN_TIER_CHANGE_TITLE", "MODERATION_FIELD_BAN_TIER_CHANGE_DESCRIPTION",
            "MODERATION_FIELD_REASON_TITLE", "MODERATION_FIELD_REASON_DESCRIPTION_NONE",
            "MODERATION_BOTTOM_AUTHOR",
        ], [
            null, null,
            null, [banTierBefore, banTier]
        ]);
        let embed: EmbedBuilder[] = this.moderationUI.punishmentEmbed(
            textStrings[0], textStrings[1], userID, textStrings[2], textStrings[3], textStrings[4],
            (reason === "") ? textStrings[5] : reason,
            textStrings[6], interaction.user
        );
        await interaction.reply({embeds: embed});
        await this.trySendToModerationChannel(interaction, embed);
    }

    public async banTierResetUser(interaction: CommandInteraction, member: GuildMember, reason: string) {
        await this.banTierSet(interaction, member, 0, reason);
    }

    public async banTierResetAll(interaction: CommandInteraction) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let entityUsersBanTier: EntityUserPunishment[] = await this.databaseServiceUserPunishment.getAllWithBanTier();
        if(entityUsersBanTier.length === 0) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "MODERATION_ERROR_BAN_TIER_RESET_ALL_NO_USERS"
            ]);
            return await interaction.reply({
                embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let textStrings: string[] = await this.getManyText(interaction, [
            "MODERATION_BAN_TIER_RESET_ALL_TITLE", "MODERATION_BAN_TIER_RESET_ALL_DESCRIPTION",
            "MODERATION_BAN_TIER_RESET_ALL_BUTTON_CONFIRM", "MODERATION_BAN_TIER_RESET_ALL_BUTTON_CANCEL",
        ], [
            null, [entityUsersBanTier.length]
        ]);
        let emojis: string[] = await this.getManySettingString(interaction,
            "BASE_EMOJI_YES", "BASE_EMOJI_NO"
        );
        await interaction.reply({
            embeds: this.moderationUI.notify(textStrings[0], textStrings[1]),
            components: this.moderationUI.banTierResetAllButtons(
                [textStrings[2], textStrings[3]],
                emojis
            )
        });
    }

    public async banTierResetAllButtonConfirm(interaction: ButtonInteraction) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        await interaction.deferUpdate();
        let entityUsersBanTier: EntityUserPunishment[] = await this.databaseServiceUserPunishment.getAllWithBanTier();
        entityUsersBanTier.forEach(entity => entity.banTier = 0);
        await this.databaseServiceUserPunishment.insert(entityUsersBanTier);
        let textStrings: string[] = await this.getManyText(interaction, [
            "MODERATION_BAN_TIER_RESET_ALL_TITLE", "MODERATION_BAN_TIER_RESET_ALL_DESCRIPTION_SUCCESS",
        ], [null, [entityUsersBanTier.length]]);
        await interaction.message.edit({
            components: [],
            embeds: this.moderationUI.notify(textStrings[0], textStrings[1])
        });
    }

    public async banTierResetAllButtonCancel(interaction: ButtonInteraction) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);
        await interaction.message.delete();
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
        let embed: EmbedBuilder[] = this.moderationUI.riddanceEmbed(
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
        let fetchedMessagesAmount: number = Array.from(fetchedMessages.keys()).length;
        try {
            await channel.bulkDelete(fetchedMessages);
        } catch {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "MODERATION_ERROR_BOT_NO_PERMISSION"
            ], [null, [clearAmountMax]]);
            return await interaction.reply({
                embeds: this.moderationUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let title: string = await this.getOneText(interaction, "MODERATION_CLEAR_TITLE", fetchedMessagesAmount);
        await interaction.editReply({embeds: this.moderationUI.clearEmbed(title)});
    }

    public async muteVoice(
        interaction: CommandInteraction,
        member: GuildMember,
        timeType: string,
        timeAmount: number,
        reason: string
    ) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let roleID: string = await this.getOneSettingString(interaction, "MODERATION_ROLE_MUTE_VOICE_ID");
        if(!await this.addRole(member, roleID))
            return await this.replyRoleMissing(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guild?.id as string, userID
        );
        let hasPunishment: boolean = (entityUserPunishment.timeMuteVoiceEnd !== null);
        if(hasPunishment) {
            entityUserPunishment.timeMuteVoiceEnd = new Date(entityUserPunishment.timeMuteVoiceEnd?.getTime() as number + UtilsServiceTime.getMs(timeAmount, timeType));
        } else {
            entityUserPunishment.timeMuteVoiceStart = new Date();
            entityUserPunishment.timeMuteVoiceEnd = new Date(Date.now() + UtilsServiceTime.getMs(timeAmount, timeType));
        }
        let textStrings: string[] = await this.getManyText(interaction, [
            hasPunishment ? "MODERATION_MUTE_VOICE_EXTENSION_TITLE" : "MODERATION_MUTE_VOICE_TITLE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_DURATION_TITLE", "MODERATION_FIELD_REASON_TITLE",
            "MODERATION_FIELD_REASON_DESCRIPTION_NONE", "MODERATION_BOTTOM_AUTHOR"
        ]);
        entityUserPunishment.reasonMuteVoice = (reason === "") ? textStrings[4] : reason;
        await this.databaseServiceUserPunishment.insert(entityUserPunishment);

        let embed: EmbedBuilder[] = this.moderationUI.punishmentEmbed(
            textStrings[0], textStrings[1],
            userID, textStrings[2],
            UtilsGeneratorTimestamp.getFormattedDate(entityUserPunishment.timeMuteVoiceEnd), textStrings[3],
            entityUserPunishment.reasonMuteVoice, textStrings[5], interaction.user
        );
        await interaction.reply({embeds: embed});
        await this.trySendToModerationChannel(interaction, embed);
        await ModerationService.updatePunishmentTimeout();
        await this.tryKickFromVoice(member);
    }

    public async muteChat(
        interaction: CommandInteraction,
        member: GuildMember,
        timeType: string,
        timeAmount: number,
        reason: string
    ) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let roleID: string = await this.getOneSettingString(interaction, "MODERATION_ROLE_MUTE_CHAT_ID");
        if(!await this.addRole(member, roleID))
            return await this.replyRoleMissing(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guild?.id as string, userID
        );
        let hasPunishment: boolean = (entityUserPunishment.timeMuteChatEnd !== null);
        if(hasPunishment) {
            entityUserPunishment.timeMuteChatEnd = new Date(entityUserPunishment.timeMuteChatEnd?.getTime() as number + UtilsServiceTime.getMs(timeAmount, timeType));
        } else {
            entityUserPunishment.timeMuteChatStart = new Date();
            entityUserPunishment.timeMuteChatEnd = new Date(Date.now() + UtilsServiceTime.getMs(timeAmount, timeType));
        }
        let textStrings: string[] = await this.getManyText(interaction, [
            hasPunishment ? "MODERATION_MUTE_CHAT_EXTENSION_TITLE" : "MODERATION_MUTE_CHAT_TITLE", "MODERATION_FIELD_USER_TITLE",
            "MODERATION_FIELD_DURATION_TITLE", "MODERATION_FIELD_REASON_TITLE",
            "MODERATION_FIELD_REASON_DESCRIPTION_NONE", "MODERATION_BOTTOM_AUTHOR"
        ]);
        entityUserPunishment.reasonMuteChat = (reason === "") ? textStrings[4] : reason;
        await this.databaseServiceUserPunishment.insert(entityUserPunishment);

        let embed: EmbedBuilder[] = this.moderationUI.punishmentEmbed(
            textStrings[0], textStrings[1],
            userID, textStrings[2],
            UtilsGeneratorTimestamp.getFormattedDate(entityUserPunishment.timeMuteChatEnd), textStrings[3],
            entityUserPunishment.reasonMuteChat, textStrings[5], interaction.user
        );
        await interaction.reply({embeds: embed});
        await this.trySendToModerationChannel(interaction, embed);
        await ModerationService.updatePunishmentTimeout();
    }

    public async unban(interaction: CommandInteraction, member: GuildMember, reason: string) {
        if(!await this.isModerator(interaction))
            return await this.replyNoPermission(interaction);

        let userID: string|undefined = member?.user.id;
        if(userID === undefined)
            return await this.replyUserNotFound(interaction);

        let entityUserPunishment: EntityUserPunishment = await this.databaseServiceUserPunishment.getOne(
            interaction.guild?.id as string, userID
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
        let embed: EmbedBuilder[] = this.moderationUI.riddanceEmbed(
            textStrings[0], textStrings[1],
            entityUserPunishment.userID, textStrings[2],
            (reason === "") ? textStrings[3] : reason, textStrings[4],
            interaction.user
        );
        await interaction.reply({embeds: embed});
        await this.trySendToModerationChannel(interaction, embed);
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
        let embed: EmbedBuilder[] = this.moderationUI.riddanceEmbed(
            textStrings[0], textStrings[1],
            entityUserPunishment.userID, textStrings[2],
            (reason === "") ? textStrings[3] : reason, textStrings[4],
            interaction.user
        );
        await interaction.reply({embeds: embed});
        await this.trySendToModerationChannel(interaction, embed);
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
        let embed: EmbedBuilder[] = this.moderationUI.riddanceEmbed(
            textStrings[0], textStrings[1],
            entityUserPunishment.userID, textStrings[2],
            (reason === "") ? textStrings[3] : reason, textStrings[4],
            interaction.user
        );
        await interaction.reply({embeds: embed});
        await this.trySendToModerationChannel(interaction, embed);
        await ModerationService.updatePunishmentTimeout();
    }
}
