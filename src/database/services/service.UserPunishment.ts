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
            {timeBanEnd: LessThanOrEqual(new Date())},
            {timeMuteChatEnd: LessThanOrEqual(new Date())},
            {timeMuteVoiceEnd: LessThanOrEqual(new Date())}
        ]);
    }

    public async getNextExpiringTime(): Promise<Date|null> {
        let dateArray: Date[] = [
            (await this.database.findOne(EntityUserPunishment, {
                where: { timeBanEnd: Not(IsNull()) },
                order: { timeMuteChatEnd: "asc" },
            }))?.timeBanEnd,
            (await this.database.findOne(EntityUserPunishment,{
                where: { timeMuteChatEnd: Not(IsNull()) },
                order: { timeMuteChatEnd: "asc" }
            }))?.timeMuteChatEnd,
            (await this.database.findOne(EntityUserPunishment,{
                where: { timeMuteVoiceEnd: Not(IsNull()) },
                order: { timeMuteVoiceEnd: "asc" }
            }))?.timeMuteVoiceEnd
        ].filter(date => !!date)
            .map((date: Date|null|undefined): Date => date as Date);
        if(dateArray.length === 0)
            return null;
        let timeArray: number[] = dateArray.map(date => date.getTime());
        return dateArray[timeArray.indexOf(Math.min(...timeArray))];
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
