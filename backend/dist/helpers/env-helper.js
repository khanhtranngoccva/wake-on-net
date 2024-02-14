import dotenv from "dotenv";
import * as process from "process";
import { EnvironmentError } from "../helpers/errors.js";
class EnvHelper {
    constructor() {
        dotenv.config({
            path: "./.env"
        });
    }
    get(key) {
        const res = process.env[key];
        if (!res) {
            throw new EnvironmentError(`Environment variable ${key} not found. Please add a value.`);
        }
        return res;
    }
}
const helper = new EnvHelper();
export default helper;
