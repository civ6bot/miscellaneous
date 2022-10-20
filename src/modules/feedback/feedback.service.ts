import {ModuleBaseService} from "../base/base.service";
import {CommandInteraction, User} from "discord.js";
import {FeedbackUI} from "./feedback.ui";

export class FeedbackService extends ModuleBaseService {
    feedbackUI: FeedbackUI = new FeedbackUI();

    public async about(interaction: CommandInteraction) {
        let textStrings: string[] = await this.getManyText(interaction, [
            "FEEDBACK_ABOUT_TITLE", "FEEDBACK_ABOUT_DESCRIPTION",
            "FEEDBACK_ABOUT_IMAGE_URL"
        ]);
        await interaction.reply({embeds: this.feedbackUI.about(textStrings[0], textStrings[1], textStrings[2])});
    }
}
