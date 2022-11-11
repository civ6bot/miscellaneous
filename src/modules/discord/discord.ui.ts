import { EmbedBuilder } from "discord.js";
import { UtilsGeneratorEmbed } from "../../utils/generators/utils.generator.embed";
import { ModuleBaseUI } from "../base/base.ui";

export class DiscordUI extends ModuleBaseUI {
    public onGuildCreate(
        title: string,
        description: string
    ): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(
            title,
            "#FFAA00",
            description,
            [],
            null,
            null,
            "https://media.discordapp.net/attachments/1022446755532525608/1040630186481299556/miscellaneous-neon-circled.png"
        );
    }
}
