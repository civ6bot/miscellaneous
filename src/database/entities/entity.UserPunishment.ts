import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class EntityUserPunishment {
    @PrimaryColumn()
    guildID!: string;
    @PrimaryColumn()
    userID!: string;

    @Column({default: 0})
    banTier!: number;
    @Column({type: "timestamp", nullable: true, default: null})
    timeBanTierLastChange!: Date | null;

    @Column({type: "timestamp", nullable: true, default: null})
    timeBanStart!: Date | null;
    @Column({type: "timestamp", nullable: true, default: null})
    timeBanEnd!: Date | null;
    @Column({type: "text", charset: "utf8mb4", nullable: true, default: null})
    reasonBan!: string | null;

    @Column({type: "timestamp", nullable: true, default: null})
    timeMuteChatStart!: Date | null;
    @Column({type: "timestamp", nullable: true, default: null})
    timeMuteChatEnd!: Date | null;
    @Column({type: "text", charset: "utf8mb4", nullable: true, default: null})
    reasonMuteChat!: string | null;

    @Column({type: "timestamp", nullable: true, default: null})
    timeMuteVoiceStart!: Date | null;
    @Column({type: "timestamp", nullable: true, default: null})
    timeMuteVoiceEnd!: Date | null;
    @Column({type: "text", charset: "utf8mb4", nullable: true, default: null})
    reasonMuteVoice!: string | null;
}
