import {importx} from "@discordx/importer";
import {discordClient} from "./client/client";
import {dataSource} from "./database/database.datasource";
import {DatabaseServiceText} from "./database/services/service.Text";
import {loadTextEntities} from "./utils/loaders/utils.loader.text";
import {DatabaseServiceConfig} from "./database/services/service.Config";
import {loadDefaultConfigs} from "./utils/loaders/utils.loader.config";
import {ModerationService} from "./modules/moderation/moderation.service";
import {UtilsServiceTime} from "./utils/services/utils.service.time";
import * as dotenv from "dotenv";
dotenv.config({path: 'miscellaneous.env'});

importx(
    __dirname + "/modules/*/*.interactions.{js,ts}",
).then(async () => {
    await discordClient.login(((process.env.TEST_MODE === '1') 
        ? process.env.TEST_BOT_TOKEN 
        : process.env.BOT_TOKEN
    ) as string);
    console.log((process.env.TEST_MODE === '1') 
        ? "Civ6Bot Test started" 
        : "Civ6Bot Miscellaneous started"
    );
});

dataSource.initialize().then(async () => {
    let databaseServiceText: DatabaseServiceText = new DatabaseServiceText();
    let databaseServiceConfig: DatabaseServiceConfig = new DatabaseServiceConfig();

    await databaseServiceText.insertAll(loadTextEntities());
    await databaseServiceConfig.insertAll(loadDefaultConfigs());

    console.log(`Database connected`);

    // В полночь понижать уровни банов.
    // Сначала подождать до полуночи,
    // потом каждые 24 часа, начиная с полуночи.
    setTimeout(async () => {
        await ModerationService.banTierDecreaseTimeout();
        setInterval(ModerationService.banTierDecreaseTimeout, UtilsServiceTime.getMs(1, "d"));
    }, new Date().setHours(0, 0, 0, 0)+UtilsServiceTime.getMs(1, "d")-Date.now());

    // Каждую минуту поднимать очередь на разбан, потому что работает плохо.
    // Здесь не будет многократно растущего одновременного
    // вызова одной и той же функции, потому что вызов следующий:
    //
    // setInterval > punishmentTimeout > { ... DB changes ... } >
    // > updatePunishmentTimeout > clearTimeout >
    // > if(nextTime !== null) setTimeout > punishmentTimeout > ...
    //
    // В результате обновляется время следующего вызова punishmentTimeout.
    setInterval(async () => {
        await ModerationService.punishmentTimeout();
    }, UtilsServiceTime.getMs(1, "m"));
    
    console.log("Moderation service initialized");
});

process.on('uncaughtException', error => {
    console.error(error);
});
