import {ButtonInteraction, CommandInteraction, Guild, GuildMember, Role} from "discord.js";
import {ModuleBaseService} from "../base/base.service";
import {RolesUI} from "./roles.ui";
import {UtilsServiceUsers} from "../../utils/services/utils.service.users";
import emojiRegex from "emoji-regex"

export class RolesService extends ModuleBaseService {
    private rolesUI: RolesUI = new RolesUI();

    private async addRole(member: GuildMember, roleID: string): Promise<boolean> {
        if(roleID === "")
            return false;
        try {
            await member.roles.add(roleID);
            return true;
        } catch {
            return false;
        }
    }

    private async removeRole(member: GuildMember, roleID: string): Promise<boolean> {
        if(roleID === "")
            return false;
        try {
            await member.roles.remove(roleID);
            return true;
        } catch {
            return false;
        }
    }

    public async roles(interaction: CommandInteraction, rolesString: string) {
        if(!UtilsServiceUsers.isAdmin(interaction.member as GuildMember)) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "ROLES_ERROR_NO_PERMISSION"
            ]);
            return await interaction.reply({
                embeds: this.rolesUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let roles: Role[] = rolesString
            .replace(",", " ")
            .replace("<@&", " ")
            .replace(">", " ")
            .split(" ")
            .filter(id => id !== "")
            .map(id => (interaction.guild as Guild).roles.cache.get(id))
            .filter(role => !!role)
            .map(role => role as Role);

        if((roles.length === 0) || (roles.length > 25)) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "ROLES_ERROR_BOUNDS"
            ]);
            return await interaction.reply({
                embeds: this.rolesUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let regex: RegExp = emojiRegex();
        let labels: string[] = roles.map(role => role.name);
        let emojisRoleName: string[] = roles.map((role): string => {
            if(role.unicodeEmoji !== null)
                return role.unicodeEmoji;
            let emoji: string = "";
            for(let match of role.name.matchAll(regex))
                emoji = match[0];
            return emoji;
        });
        emojisRoleName.forEach((value, index) => {
            if(value !== "") {
                let emojiIndex: number = labels[index].indexOf(value);
                if (emojiIndex !== -1)
                    labels[index] = (
                        labels[index].slice(0, emojiIndex).trim()
                        + " "
                        + labels[index].slice(emojiIndex + value.length).trim()
                    ).trim();
            }
        });

        let textStrings: string[] = await this.getManyText(interaction, [
            "ROLES_TITLE", "ROLES_DESCRIPTION"
        ]);
        try {
            await interaction.channel?.send({
                embeds: this.rolesUI.rolesEmbed(textStrings[0], textStrings[1]),
                components: this.rolesUI.rolesButtons(labels, emojisRoleName, roles.map(role => `roles-${role.id}`))
            });
        } catch {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "ROLES_ERROR_BOT_MESSAGE_NO_PERMISSION"
            ]);
            return await interaction.reply({
                embeds: this.rolesUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        textStrings = await this.getManyText(interaction, [
            "BASE_NOTIFY_TITLE", "ROLES_NOTIFY_DESCRIPTION"
        ]);
        await interaction.reply({
            embeds: this.rolesUI.notify(textStrings[0], textStrings[1]),
            ephemeral: true
        });
    }

    public async roleButton(interaction: ButtonInteraction) {
        let roleID: string = interaction.customId.slice(interaction.customId.indexOf("-") + 1)
        let member: GuildMember = interaction.member as GuildMember;
        if(!(interaction.guild as Guild).roles.cache.has(roleID)) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "ROLES_ERROR_BOT_ROLE_NO_PERMISSION"
            ]);
            return await interaction.reply({
                embeds: this.rolesUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let hasRole: boolean = member.roles.cache.has(roleID);
        if(hasRole ? !await this.removeRole(member, roleID) : !await this.addRole(member, roleID)) {
            let textStrings: string[] = await this.getManyText(interaction, [
                "BASE_ERROR_TITLE", "ROLES_ERROR_BOT_ROLE_NO_PERMISSION"
            ]);
            return await interaction.reply({
                embeds: this.rolesUI.error(textStrings[0], textStrings[1]),
                ephemeral: true
            });
        }

        let textStrings: string[] = await this.getManyText(interaction, [
            "BASE_NOTIFY_TITLE", hasRole ? "ROLES_REMOVE_DESCRIPTION" : "ROLES_ADD_DESCRIPTION"
        ], [null, [roleID]]);
        await interaction.reply({
            embeds: this.rolesUI.notify(textStrings[0], textStrings[1]),
            ephemeral: true
        });
    }
}
