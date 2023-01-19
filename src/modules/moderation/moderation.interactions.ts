import {Discord, Slash, SlashChoice, SlashGroup, SlashOption, ButtonComponent} from "discordx";
import {ApplicationCommandOptionType, ButtonInteraction, CommandInteraction, GuildMember} from "discord.js";
import {ModerationService} from "./moderation.service";

@Discord()
export abstract class ModerationInteractions{
    private moderationService: ModerationService = new ModerationService();

    @Slash({name: "ban", description: "Temporary ban user"})
    public async ban(
        @SlashOption({
            name: "user",
            description: "user to ban",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashChoice({name: "minutes", value: "m"})
        @SlashChoice({name: "hours", value: "h"})
        @SlashChoice({name: "days", value: "d"})
        @SlashOption({
            name: "time-unit",
            description: "time unit",
            type: ApplicationCommandOptionType.String,
            required: true
        }) timeType: string,
        @SlashOption({
            name: "amount",
            description: "time units amount",
            type: ApplicationCommandOptionType.Number,
            required: true
        }) timeAmount: number,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ){ this.moderationService.ban(interaction, member, timeType, timeAmount, reason) }

    @Slash({name: "ban-tier", description: "Ban user by time tiers"})
    async banTier(
        @SlashOption({
            name: "user",
            description: "user to ban",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ){ this.moderationService.banTierBan(interaction, member, reason) }

    @Slash({name: "unban", description: "Unban user"})
    async unban(
        @SlashOption({
            name: "user",
            description: "user to unmute",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ) { this.moderationService.unban(interaction, member, reason) }

    @Slash({name: "pardon", description: "Remove all restrictions of user"})
    async pardon(
        @SlashOption({
            name: "user",
            description: "user to pardon",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ) { this.moderationService.pardon(interaction, member, reason) }

    @Slash({name: "clear", description: "delete last messages"})
    async clear(
        @SlashOption({
            name: "amount",
            description: "messages amount",
            type: ApplicationCommandOptionType.Number,
            required: true
        }) clearAmount: number,
        interaction: CommandInteraction
    ) { this.moderationService.clear(interaction, clearAmount) }

    @ButtonComponent({id: "moderation-ban-tier-reset-all-confirm"})
    async banTierResetAllButtonConfirm(
        interaction: ButtonInteraction
    ) { this.moderationService.banTierResetAllButtonConfirm(interaction) }

    @ButtonComponent({id: "moderation-ban-tier-reset-all-cancel"})
    async banTierResetAllButtonCancel(
        interaction: ButtonInteraction
    ) { this.moderationService.banTierResetAllButtonCancel(interaction) }
}

@Discord()
@SlashGroup({name: "ban-tier-levels", description: "Ban tier commands"})
@SlashGroup("ban-tier-levels")
export abstract class ModerationBanTierInteractions {
    private moderationService: ModerationService = new ModerationService();

    @Slash({name: "set", description: "Set new ban tier for user"})
    async banTierSet(
        @SlashOption({
            name: "user",
            description: "user to ban",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashOption({
            name: "tier-value",
            description: "new ban tier",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }) banTier: number,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ) { this.moderationService.banTierSet(interaction, member, banTier, reason) }
}

@Discord()
@SlashGroup({
    name: "reset",
    description: "Reset ban tier for specify user or all users",
    root: "ban-tier-levels"
})
@SlashGroup("reset", "ban-tier-levels")
export abstract class ModerationBanTierResetInteractions {
    private moderationService: ModerationService = new ModerationService();

    @Slash({ name: "user", description: "Reset ban tier for specify user" })
    async banTierResetUser(
        @SlashOption({
            name: "user",
            description: "user to ban",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ) { this.moderationService.banTierResetUser(interaction, member, reason) }

    @Slash({ name: "all", description: "Reset ban tier for all users" })
    async banTierResetAll(
        interaction: CommandInteraction
    ) { this.moderationService.banTierResetAll(interaction) }
}

@Discord()
@SlashGroup({name: "mute", description: "Mute user"})
@SlashGroup("mute")
export abstract class ModerationMuteInteractions {
    private moderationService: ModerationService = new ModerationService();

    @Slash({name: "voice", description: "Disable voice for user"})
    public async voice(
        @SlashOption({
            name: "user",
            description: "user to mute",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashChoice({name: "minutes", value: "m"})
        @SlashChoice({name: "hours", value: "h"})
        @SlashChoice({name: "days", value: "d"})
        @SlashOption({
            name: "time-unit",
            description: "time unit",
            type: ApplicationCommandOptionType.String,
            required: true
        }) timeType: string,
        @SlashOption({
            name: "amount",
            description: "time units amount",
            type: ApplicationCommandOptionType.Number,
            required: true
        }) timeAmount: number,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ){ this.moderationService.muteVoice(interaction, member, timeType, timeAmount, reason) }

    @Slash({name: "chat", description: "Disable chat for user"})
    public async chat(
        @SlashOption({
            name: "user",
            description: "user to mute",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashChoice({name: "minutes", value: "m"})
        @SlashChoice({name: "hours", value: "h"})
        @SlashChoice({name: "days", value: "d"})
        @SlashOption({
            name: "time-unit",
            description: "time unit",
            type: ApplicationCommandOptionType.String,
            required: true
        }) timeType: string,
        @SlashOption({
            name: "amount",
            description: "time units amount",
            type: ApplicationCommandOptionType.Number,
            required: true
        }) timeAmount: number,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ){ this.moderationService.muteChat(interaction, member, timeType, timeAmount, reason) }
}

@Discord()
@SlashGroup({name: "unmute", description: "Unmute user"})
@SlashGroup("unmute")
export abstract class ModerationUnmuteInteractions {
    private moderationService: ModerationService = new ModerationService();

    @Slash({name: "voice", description: "Unmute voice for user"})
    public async voice(
        @SlashOption({
            name: "user",
            description: "user to unmute",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ){ this.moderationService.unmuteVoice(interaction, member, reason) }

    @Slash({name: "chat", description: "Unmute chat for user"})
    public async chat(
        @SlashOption({
            name: "user",
            description: "user to unmute",
            type: ApplicationCommandOptionType.User,
            required: true,
        }) member: GuildMember,
        @SlashOption({
            name: "reason",
            description: "description",
            type: ApplicationCommandOptionType.String,
            required: false
        }) reason: string = "",
        interaction: CommandInteraction
    ){ this.moderationService.unmuteChat(interaction, member, reason) }
}
