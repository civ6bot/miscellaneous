import {EntityClan} from "../entities/entity.Clan";
import {EntityManager} from "typeorm";
import {outerDataSource} from "../database.datasources";

export class DatabaseServiceClan {
    protected database: EntityManager = outerDataSource.manager;

    public async insertOne(entityClan: EntityClan): Promise<EntityClan> {
        return await this.database.save(entityClan);
    }

    public async getOne(clanID: string): Promise<EntityClan|null> {
        return await this.database.findOne(EntityClan, {
            where: {roleID: clanID}
        });
    }

    public async remove(entityClan: EntityClan): Promise<EntityClan> {
        return await this.database.remove(entityClan);
    }
}
