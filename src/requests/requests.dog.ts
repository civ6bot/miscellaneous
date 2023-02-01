import axios from "axios";
import {SafeRequest} from "../utils/decorators/utils.decorators.SafeRequest";
import {JSONDog} from "../types/type.JSON.Dog";

export class RequestsDog {
    private randomDogURL: string = "https://dog.ceo/api/breeds/image/random";

    @SafeRequest
    public async getDogURL(): Promise<string|null>{
        let {data, status} = await axios.get<JSONDog>(this.randomDogURL);
        return data.message;
    }
}
