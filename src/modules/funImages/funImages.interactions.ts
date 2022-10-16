import {Discord, Slash} from "discordx";
import {ApplicationCommandOptionType, CommandInteraction} from "discord.js";
import {FunImagesService} from "./funImages.service";

@Discord()
export abstract class FunImagesInteractions {
    funImagesService: FunImagesService = new FunImagesService();

    @Slash({name: "cat", description: "Random cat image" })
    public async cat(
        interaction: CommandInteraction
    ) { await this.funImagesService.cat(interaction); }

    @Slash({name: "dog", description: "Random dog image"})
    public async dog(
        interaction: CommandInteraction
    ) { await this.funImagesService.dog(interaction); }
}
