import axios from "axios";
import {DecorateAll} from "decorate-all";
import {SafeRequest} from "../utils/decorators/utils.decorators.SafeRequest";
import {JSONDog} from "../types/type.JSON.Dog";

@DecorateAll(SafeRequest)
export class RequestsDog {
    private randomDogURL: string = "https://dog.ceo/api/breeds/image/random";

    public async getDogURL(): Promise<string|null>{
        let {data, status} = await axios.get<JSONDog>(this.randomDogURL);
        return data.message;
    }
}
