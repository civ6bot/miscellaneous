import axios from "axios";
import {SafeRequest} from "../utils/decorators/utils.decorators.SafeRequest";
import {JSONCat} from "../types/type.JSON.Cat";

export class RequestsCat {
    private randomCatURL: string = "https://cataas.com";

    @SafeRequest
    public async getCatURL(): Promise<string|null>{
        let {data, status} = await axios.get<JSONCat>(this.randomCatURL + "/cat?json=true");
        return this.randomCatURL + "/cat/" + data._id;
    }
}
