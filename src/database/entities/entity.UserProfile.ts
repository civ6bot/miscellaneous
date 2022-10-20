import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class EntityUserProfile {
    @PrimaryColumn()
    guildID!: string;
    @PrimaryColumn()
    userID!: string;

    @Column({default: 0})
    fame!: number;
    @Column({default: 0})
    money!: number;
    @Column({default: 0})
    likes!: number;
    @Column({default: 0})
    dislikes!: number;
    @Column({default: 0})
    bonusStreak!: number;

    @Column({type: "text", nullable: true, default: null})
    description!: string | null;
    @Column({type: "varchar", nullable: true, default: null})
    profileAvatarURL!: string | null;

    @Column({type: "varchar", nullable: true, default: null})
    clanID!: string | null;
    @Column({default: 0})
    clanStatus!: number;
}
