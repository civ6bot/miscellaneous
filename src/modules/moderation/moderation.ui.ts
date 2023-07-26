import {ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, EmbedBuilder, User} from "discord.js";
import {UtilsGeneratorEmbed} from "../../utils/generators/utils.generator.embed";
import {ModuleBaseUI} from "../base/base.ui";
import {UtilsGeneratorButton} from "../../utils/generators/utils.generator.button";

export class ModerationUI extends ModuleBaseUI {
    public punishmentEmbed(
        title: string,
        fieldPlayerTitle: string, userID: string,
        fieldDurationOrChangeTitle: string, fieldDurationOrChangeDescription: string,
        fieldReasonTitle: string, fieldReasonDescription: string,
        moderatorBottomText: string, author: User
    ): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(
            title,
            "#F4900C",
            null,
            [
                { name: fieldPlayerTitle, value: `<@${userID}>` },
                { name: fieldDurationOrChangeTitle, value: fieldDurationOrChangeDescription },
                { name: fieldReasonTitle, value: fieldReasonDescription },
            ],
            `${moderatorBottomText} ${author.username}`,
            author.avatarURL()
        );
    }

    public riddanceEmbed(
        title: string,
        fieldPlayerTitle: string, userID: string,
        fieldReasonTitle: string | null, fieldReasonDescription: string | null,
        bottomText: string, author: User | null = null
    ): EmbedBuilder[] {
        let fields: APIEmbedField[] = [
            { name: fieldPlayerTitle, value: `<@${userID}>` }
        ];
        if((fieldReasonTitle !== null) && (fieldReasonDescription !== null))
            fields.push({ name: fieldReasonTitle, value: fieldReasonDescription });

        return UtilsGeneratorEmbed.getSingle(
            title,
            "#9FCFF9",
            null,
            fields,
            author ? `${bottomText} ${author.username}` : bottomText,
            author?.avatarURL() || null
        );
    }

    public riddancePMEmbed(
        title: string, description: string,
        guildName: string, guildAvatar: string | null = null
    ): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(
            title,
            "#9FCFF9",
            description,
            [],
            guildName,
            guildAvatar
        );
    }

    public clearEmbed(title: string): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(title, "#F4900C");
    }

    public banTierResetAllButtons(labels: string[], emojis: string[]): ActionRowBuilder<ButtonBuilder>[] {
        return UtilsGeneratorButton.getList(
            labels,
            emojis,
            [ButtonStyle.Success, ButtonStyle.Danger],
            ["moderation-ban-tier-reset-all-confirm",  "moderation-ban-tier-reset-all-cancel"]
        );
    }

    public banProfile(
        title: string,
        fieldTitles: string[], fieldValues: string[],
        bottomText: string,

        member: User,
        hasActivePunishments: boolean,
        author: User,
        isModerator: boolean = false,
    ): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(
            title,
            (hasActivePunishments) ? "#F4900C" : "#5865F2",
            null,
            fieldTitles.map((_, index) => {return {name: fieldTitles[index], value: fieldValues[index], inline: false}}),
            isModerator ? `${bottomText} ${author.username}` : author.username,
            author.avatarURL(),
            member.avatarURL()
        );
    }
}
