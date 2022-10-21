import {APIEmbedField, EmbedBuilder, User} from "discord.js";
import {UtilsGeneratorEmbed} from "../../utils/generators/utils.generator.embed";
import {ModuleBaseUI} from "../base/base.ui";

export class ModerationUI extends ModuleBaseUI {
    public punishment(
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
            `${moderatorBottomText} ${author.tag}`,
            author.avatarURL()
        );
    }

    public riddance(
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
            (author !== null) ? `${bottomText} ${author.tag}` : bottomText,
            author?.avatarURL() || null
        );
    }

    public clear(title: string): EmbedBuilder[] {
        return UtilsGeneratorEmbed.getSingle(title, "#F4900C");
    }
}
