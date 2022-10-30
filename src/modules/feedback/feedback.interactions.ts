import {Discord, Slash} from "discordx";
import {ApplicationCommandOptionType, CommandInteraction} from "discord.js";
import {FeedbackService} from "./feedback.service";

@Discord()
export abstract class FeedbackInteractions{
    feedbackService: FeedbackService = new FeedbackService();

    @Slash({ name: "about", description: "Bot information" })
    public async about(
        interaction: CommandInteraction
    ) { await this.feedbackService.about(interaction); }
}
