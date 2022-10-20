import {Column, Entity, PrimaryColumn} from "typeorm";
import {HexColorString} from "discord.js";

@Entity()
export class EntityClan {
    @PrimaryColumn()
    guildID!: string;
    @PrimaryColumn()
    roleID!: string;

    @Column()
    channelID!: string;

    @Column({type: "text", nullable: true, default: null})
    description!: string | null;
    @Column({type: "varchar", nullable: true, default: null})
    profileAvatarURL!: string | null;
    @Column({type: "varchar", nullable: true, default: null})
    colorHex!: HexColorString;

    @Column({default: 0})
    money!: number;
}
