import {ModuleBaseUI} from "../base/base.ui";
import {APIEmbedField, EmbedBuilder} from "discord.js";
import {UtilsGeneratorEmbed} from "../../utils/generators/utils.generator.embed";

export class FeedbackUI extends ModuleBaseUI {
    public about(title: string, description: string, imageURL: string): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(
            title,
            "#FD91FF",
            description,
            [],
            null,
            undefined,
            null,
            imageURL
        );
    }
}
