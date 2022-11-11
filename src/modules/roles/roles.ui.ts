import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from "discord.js";
import {UtilsGeneratorEmbed} from "../../utils/generators/utils.generator.embed";
import {ModuleBaseUI} from "../base/base.ui";
import {UtilsServiceRandom} from "../../utils/services/utils.service.random";
import {UtilsGeneratorButton} from "../../utils/generators/utils.generator.button";

export class RolesUI extends ModuleBaseUI {
    public rolesEmbed(title: string, description: string): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(
            title,
            UtilsServiceRandom.getBrightColor(),
            description
        );
    }

    public rolesButtons(labels: string[], emojis: string[], ids: string[]): ActionRowBuilder<ButtonBuilder>[] {
        return UtilsGeneratorButton.getList(labels, emojis, [], ids);
    }
}
