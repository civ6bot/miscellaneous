import {Discord, Slash, SlashOption} from "discordx";
import {ApplicationCommandOptionType, CommandInteraction, GuildMember} from "discord.js";
import {FunImagesService} from "./funImages.service";

@Discord()
export abstract class FunImagesInteractions {
    funImagesService: FunImagesService = new FunImagesService();

    @Slash({name: "avatar", description: "Get user avatar" })
    public async avatar(
        @SlashOption({
            name: "user",
            description: "user to get avatar",
            type: ApplicationCommandOptionType.User,
            required: false,
        }) member: GuildMember | null = null,
        interaction: CommandInteraction
    ) { await this.funImagesService.avatar(interaction, member); }

    @Slash({name: "cat", description: "Random cat image" })
    public async cat(
        interaction: CommandInteraction
    ) { await this.funImagesService.cat(interaction); }

    @Slash({name: "dog", description: "Random dog image"})
    public async dog(
        interaction: CommandInteraction
    ) { await this.funImagesService.dog(interaction); }
}
