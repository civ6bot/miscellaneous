import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class EntityUserPunishment {
    @PrimaryColumn()
    guildID!: string;
    @PrimaryColumn()
    userID!: string;

    @Column({type: "number", default: 0})
    banTier!: number;
    @Column({type: "number", nullable: true, default: null})
    timeBanEndLast!: number | null;

    @Column({type: "number", nullable: true, default: null})
    timeBanStart!: number | null;
    @Column({type: "number", nullable: true, default: null})
    timeBanEnd!: number | null;
    @Column({type: "text", charset: "utf8mb4", nullable: true, default: null})
    reasonBan!: string | null;

    @Column({type: "number", nullable: true, default: null})
    timeMuteChatStart!: number | null;
    @Column({type: "number", nullable: true, default: null})
    timeMuteChatEnd!: number | null;
    @Column({type: "text", charset: "utf8mb4", nullable: true, default: null})
    reasonMuteChat!: string | null;

    @Column({type: "number", nullable: true, default: null})
    timeMuteVoiceStart!: number | null;
    @Column({type: "number", nullable: true, default: null})
    timeMuteVoiceEnd!: number | null;
    @Column({type: "text", charset: "utf8mb4", nullable: true, default: null})
    reasonMuteVoice!: string | null;
}
