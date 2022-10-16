import axios from "axios";
import {DecorateAll} from "decorate-all";
import {SafeRequest} from "../utils/decorators/utils.decorators.SafeRequest";
import {JSONCat} from "../types/type.JSON.Cat";

@DecorateAll(SafeRequest)
export class RequestsCat {
    private randomCatURL: string = "https://aws.random.cat/meow";

    public async getCatURL(): Promise<string|null>{
        let {data, status} = await axios.get<JSONCat>(this.randomCatURL);
        return data.file;
    }
}
