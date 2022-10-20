import {Discord, Slash} from "discordx";
import {FeedbackService} from "./feedback.service";
import {ApplicationCommandOptionType, CommandInteraction} from "discord.js";

@Discord()
export abstract class FeedbackInteractions{
    feedbackService: FeedbackService = new FeedbackService();

    @Slash({ name: "about", description: "Bot information" })
    public async about(
        interaction: CommandInteraction
    ) { await this.feedbackService.about(interaction); }
}
