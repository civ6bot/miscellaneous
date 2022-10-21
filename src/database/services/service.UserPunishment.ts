import {EntityUserPunishment} from "../entities/entity.UserPunishment";
import {EntityManager, IsNull, LessThanOrEqual, MoreThan, Not} from "typeorm";
import {outerDataSource} from "../database.datasources";

export class DatabaseServiceUserPunishment {
    protected database: EntityManager = outerDataSource.manager;

    private async create(guildID: string, userID: string): Promise<EntityUserPunishment> {
        let newEntity: EntityUserPunishment = new EntityUserPunishment();
        newEntity.guildID = guildID;
        newEntity.userID = userID;
        return await this.database.save(newEntity);
    }

    public async insert(entityUserProfile: EntityUserPunishment|EntityUserPunishment[]): Promise<EntityUserPunishment|EntityUserPunishment[]> {
        return await this.database.save(entityUserProfile);
    }

    public async getOne(guildID: string, userID: string): Promise<EntityUserPunishment> {
        let getEntity: EntityUserPunishment|null = await this.database.findOneBy(EntityUserPunishment,
            {guildID: guildID, userID: userID}
        );
        return (getEntity !== null) ? getEntity : await this.create(guildID, userID);
    }

    public async getAllExpired(): Promise<EntityUserPunishment[]> {
        return await this.database.findBy(EntityUserPunishment, [
            {timeBanEnd: LessThanOrEqual(Date.now())},
            {timeMuteChatEnd: LessThanOrEqual(Date.now())},
            {timeMuteVoiceEnd: LessThanOrEqual(Date.now())}
        ]);
    }

    public async getNextExpiringTime(): Promise<number|null> {
        let nextExpiringEntities: (EntityUserPunishment|null)[] = [
            await this.database.findOne(EntityUserPunishment,{order: { timeBanEnd: "asc" }}),
            await this.database.findOne(EntityUserPunishment,{order: { timeMuteChatEnd: "asc" }}),
            await this.database.findOne(EntityUserPunishment,{order: { timeMuteVoiceEnd: "asc" }}),
        ];
        let minTime: (number|null)[] = [
            nextExpiringEntities[0]?.timeBanEnd || null,
            nextExpiringEntities[0]?.timeMuteChatEnd || null,
            nextExpiringEntities[0]?.timeMuteVoiceEnd || null,
        ];
        return (minTime.every(time => time === null))
            ? null
            : minTime[
                minTime.indexOf(
                    Math.min(
                        ...minTime
                            .filter((time: number|null): boolean => (time !== null))
                            .map((time: number|null): number => time as number)
                    )
                )
            ];
    }

    public async getAllWithBanTier(): Promise<EntityUserPunishment[]> {
        return await this.database.findBy(EntityUserPunishment, {
            banTier: MoreThan(0)
        });
    }

    public async getAllForTierDecreasing(): Promise<EntityUserPunishment[]> {
        return await this.database.findBy(EntityUserPunishment, {
            banTier: MoreThan(0),
            timeBanStart: IsNull(),
            timeBanTierLastChange: Not(IsNull())
        });
    }
}
