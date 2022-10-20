import {EmbedBuilder} from "discord.js";
import {UtilsGeneratorEmbed} from "../../utils/generators/utils.generator.embed";
import {ModuleBaseUI} from "../base/base.ui";
import {UtilsServiceRandom} from "../../utils/services/utils.service.random";

export class FunImagesUI extends ModuleBaseUI {
    avatar(title: string, imageURL: string): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(
            title,
            UtilsServiceRandom.getBrightColor(),
            null,
            [],
            null,
            null,
            null,
            imageURL
        );
    }

    cat(title: string, description: string, imageURL: string): EmbedBuilder[] {
        let catEmojis = ["😼", "😹", "🙀", "😾", "😿", "😻", "😺", "😸", "😽", "🐱", "🐈"];
        return UtilsGeneratorEmbed.getSingle(
            `${catEmojis[Math.floor(Math.random()*catEmojis.length)]} ${title}`,
            UtilsServiceRandom.getBrightColor(),
            description,
            [],
            null,
            null,
            null,
            imageURL
        );
    }

    dog(title: string, description: string, imageURL: string): EmbedBuilder[] {
        let dogEmojis = ["🐶", "🦮", "🐕‍🦺", "🐕", "🐺"];
        return UtilsGeneratorEmbed.getSingle(
            `${dogEmojis[Math.floor(Math.random()*dogEmojis.length)]} ${title}`,
            UtilsServiceRandom.getBrightColor(),
            description,
            [],
            null,
            null,
            null,
            imageURL
        );
    }
}
