import {CommandInteraction, GuildMember} from "discord.js";
import {ModuleBaseService} from "../base/base.service";
import {FunImagesUI} from "./funImages.ui";
import {RequestsCat} from "../../requests/requests.cat";
import {RequestsDog} from "../../requests/requests.dog";

export class FunImagesService extends ModuleBaseService {
    private funImagesUI: FunImagesUI = new FunImagesUI();

    private requestsCat: RequestsCat = new RequestsCat();
    private requestsDog: RequestsDog = new RequestsDog();

    private specialCatImageURL: string = "https://i.imgur.com/9Wpk54U.png";
    private specialCatChance: number = 0.03;

    public async avatar(interaction: CommandInteraction, member: GuildMember | null) {
        let currentMember: GuildMember = member || interaction.member as GuildMember;
        let imageURL: string | null = currentMember.user.avatarURL({size: 2048});
        if(imageURL === null) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "FUN_IMAGES_ERROR_NO_AVATAR"
            ]);
            return interaction.reply({embeds: this.funImagesUI.error(textStrings[0], textStrings[1]), ephemeral: true});
        }
        let title: string = await this.getOneText(interaction, "FUN_IMAGES_AVATAR_TITLE", currentMember.user.tag);
        interaction.reply({embeds: this.funImagesUI.avatar(title, imageURL)});
    }

    public async cat(interaction: CommandInteraction) {
        let imageURL: string|null = (Math.random() > this.specialCatChance)
            ? await this.requestsCat.getCatURL()
            : this.specialCatImageURL;
        if(imageURL === null) {
            let textStrings: string[] = await this.getManyText(
                interaction,
                ["BASE_ERROR_TITLE", "FUN_IMAGES_ERROR_NO_IMAGE"],
            );
            return interaction.reply({embeds: this.funImagesUI.error(textStrings[0], textStrings[1]), ephemeral: true});
        }
        let textStrings: string[] = await this.getManyText(
            interaction,
            ["FUN_IMAGES_CAT_TITLE", "FUN_IMAGES_CAT_DESCRIPTION"],
        );
        interaction.reply({embeds: this.funImagesUI.cat(textStrings[0], textStrings[1], imageURL)});
    }

    public async dog(interaction: CommandInteraction) {
        let imageURL: string|null = await this.requestsDog.getDogURL();
        if(imageURL === null) {
            let textStrings: string[] = await this.getManyText(
                interaction,
                ["BASE_ERROR_TITLE", "FUN_IMAGES_ERROR_NO_IMAGE"],
            );
            return interaction.reply({embeds: this.funImagesUI.error(textStrings[0], textStrings[1]), ephemeral: true});
        }
        let textStrings: string[] = await this.getManyText(
            interaction,
            ["FUN_IMAGES_DOG_TITLE", "FUN_IMAGES_DOG_DESCRIPTION"],
        );
        interaction.reply({embeds: this.funImagesUI.dog(textStrings[0], textStrings[1], imageURL)});
    }
}
