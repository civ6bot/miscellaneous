import {EntityUserProfile} from "../entities/entity.UserProfile";
import {EntityManager, MoreThan} from "typeorm";
import {outerDataSource} from "../database.datasources";

export class DatabaseServiceUserProfile {
    protected database: EntityManager = outerDataSource.manager;

    private async create(guildID: string, userID: string): Promise<EntityUserProfile> {
        let newEntity: EntityUserProfile = new EntityUserProfile();
        newEntity.guildID = guildID;
        newEntity.userID = userID;
        return await this.database.save(newEntity);
    }

    public async insert(entityUserProfile: EntityUserProfile|EntityUserProfile[]): Promise<EntityUserProfile|EntityUserProfile[]> {
        return await this.database.save(entityUserProfile);
    }

    public async getOne(guildID: string, userID: string): Promise<EntityUserProfile> {
        let getEntity: EntityUserProfile|null = await this.database.findOneBy(EntityUserProfile,
            {guildID: guildID, userID: userID}
        );
        return (getEntity !== null) ? getEntity : await this.create(guildID, userID);
    }

    public async getBestFame(guildID: string, amount: number): Promise<EntityUserProfile[]> {
        return (await this.database.find(EntityUserProfile, {
            where: {guildID: guildID, fame: MoreThan(0)},
            order: {fame: "desc"},
        })).slice(0, amount);
    }

    public async getBestMoney(guildID: string, amount: number): Promise<EntityUserProfile[]> {
        return (await this.database.find(EntityUserProfile, {
            where: {guildID: guildID, money: MoreThan(0)},
            order: {fame: "desc"},
        })).slice(0, amount);
    }

    public async getClanAdmin(clanID: string): Promise<EntityUserProfile|null>  {
        return await this.database.findOne(EntityUserProfile, {
            where: {
                clanID: clanID,
                clanStatus: 2,
            }
        });
    }

    public async getClanModerators(clanID: string): Promise<EntityUserProfile[]> {
        return await this.database.find(EntityUserProfile, {
            where: {
                clanID: clanID,
                clanStatus: MoreThan(0)
            }
        });
    }

    public async getClanUsersAmount(clanID: string): Promise<number> {
        return (await this.database.find(EntityUserProfile, {
            where: {
                clanID: clanID,
                clanStatus: MoreThan(0)
            }
        })).length;
    }

    public async deleteUsersClan(clanID: string): Promise<EntityUserProfile[]> {
        let entitiesUserProfile: EntityUserProfile[] = (await this.database.find(EntityUserProfile, {
            where: {clanID: clanID}
        }));
        entitiesUserProfile.map(entity => {
            entity.clanID = null;
            entity.clanStatus = 0;
        });
        await this.database.save(entitiesUserProfile);
        return entitiesUserProfile;
    }
}
