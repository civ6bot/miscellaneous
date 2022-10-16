import {CommandInteraction} from "discord.js";
import {ModuleBaseService} from "../base/base.service";
import {FunImagesUI} from "./funImagesUI";
import {RequestsCat} from "../../requests/requests.cat";
import {RequestsDog} from "../../requests/requests.dog";

export class FunImagesService extends ModuleBaseService {
    private funImagesUI: FunImagesUI = new FunImagesUI();

    private requestsCat: RequestsCat = new RequestsCat();
    private requestsDog: RequestsDog = new RequestsDog();

    private specialCatImageURL: string = "https://i.imgur.com/9Wpk54U.png";

    public async cat(interaction: CommandInteraction) {
        let imageURL: string|null = (Math.random() > 0.03)
            ? await this.requestsCat.getCatURL()
            : this.specialCatImageURL;
        if(imageURL === null) {
            let textStrings: string[] = await this.getManyText(
                interaction,
                ["BASE_ERROR_TITLE", "FUN_IMAGES_ERROR_NO_IMAGE"],
            );
            await interaction.reply({embeds: this.funImagesUI.error(textStrings[0], textStrings[1]), ephemeral: true});
            return;
        }
        let textStrings: string[] = await this.getManyText(
            interaction,
            ["FUN_IMAGES_CAT_TITLE", "FUN_IMAGES_CAT_DESCRIPTION"],
        );
        await interaction.reply({embeds: this.funImagesUI.cat(textStrings[0], textStrings[1], imageURL)});
    }

    public async dog(interaction: CommandInteraction) {
        let imageURL: string|null = await this.requestsDog.getDogURL();
        if(imageURL === null) {
            let textStrings: string[] = await this.getManyText(
                interaction,
                ["BASE_ERROR_TITLE", "FUN_IMAGES_ERROR_NO_IMAGE"],
            );
            await interaction.reply({embeds: this.funImagesUI.error(textStrings[0], textStrings[1]), ephemeral: true});
            return;
        }
        let textStrings: string[] = await this.getManyText(
            interaction,
            ["FUN_IMAGES_DOG_TITLE", "FUN_IMAGES_DOG_DESCRIPTION"],
        );
        await interaction.reply({embeds: this.funImagesUI.dog(textStrings[0], textStrings[1], imageURL)});
    }
}
