import {importx} from "@discordx/importer";
import {discordClient} from "./client/client";
import {localDataSource, outerDataSource} from "./database/database.datasources";
import {DatabaseServiceText} from "./database/services/service.Text";
import {loadTextEntities} from "./utils/loaders/utils.loader.text";
import {DatabaseServiceConfig} from "./database/services/service.Config";
import {loadDefaultConfigs} from "./utils/loaders/utils.loader.config";
import {ModerationService} from "./modules/moderation/moderation.service";
import {UtilsServiceTime} from "./utils/services/utils.service.time";
import * as dotenv from "dotenv";
dotenv.config({path: 'miscellaneous.env'});

importx(
    __dirname + "/modules/*/*.{events,interactions}.{js,ts}",
).then(() => {
    discordClient.login(((process.env.TEST_MODE === '1') ? process.env.TEST_BOT_TOKEN : process.env.BOT_TOKEN) as string).then(() => {
        console.log((process.env.TEST_MODE === '1') ? "Civilization VI – Test started" : "Civilization VI – Miscellaneous started");
    });
});

localDataSource.initialize().then(async () => {
    let databaseServiceText: DatabaseServiceText = new DatabaseServiceText();
    let databaseServiceConfig: DatabaseServiceConfig = new DatabaseServiceConfig();

    await databaseServiceText.clearAll();
    await databaseServiceConfig.clearAll();

    await databaseServiceText.insertAll(loadTextEntities());
    await databaseServiceConfig.insertAll(loadDefaultConfigs());

    console.log(`Local database started`);
});

outerDataSource.initialize().then(async () => {
    console.log(`Outer database connected`);

    // midnight function
    setTimeout(async () => {
        await ModerationService.banTierDecreaseTimeout();
        setInterval(ModerationService.banTierDecreaseTimeout, UtilsServiceTime.getMs(1, "d"));
    }, new Date().setHours(0, 0, 0, 0)+UtilsServiceTime.getMs(1, "d")-Date.now());

    await ModerationService.punishmentTimeout();
    console.log("Moderation service timeouts initialized")
});

process.on('uncaughtException', error => {
    console.error(error);
});
