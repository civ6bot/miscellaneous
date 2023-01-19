import {ButtonComponent, Discord, Slash, SlashOption} from "discordx";
import {ApplicationCommandOptionType, ButtonInteraction, CommandInteraction} from "discord.js";
import {RolesService} from "./roles.service";

@Discord()
export abstract class RolesInteractions {
    rolesService: RolesService = new RolesService();

    @Slash({name: "roles", description: "create message to manage free roles" })
    public async roles(
        @SlashOption({
            name: "role-mentions",
            description: "write mention there",
            type: ApplicationCommandOptionType.String,
            required: true,
        }) rolesID: string,
        interaction: CommandInteraction
    ) { this.rolesService.roles(interaction, rolesID); }

    @ButtonComponent({id: /roles-\d+/})
    public async roleButton(
        interaction: ButtonInteraction
    ) { this.rolesService.roleButton(interaction); }
}
