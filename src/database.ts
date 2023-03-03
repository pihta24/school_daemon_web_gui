import fs from 'fs';
import * as path from "path";
export const users: Array<User> = require("./data/users.json");
export const corpus: Array<Corpus> = require("./data/corpus.json");
export const privateKey = fs.readFileSync(path.resolve("src", "private.pem"), { encoding: "utf8" });
export type User = {
    username: string,
    password: string,
    role: string
    access: {
        [corpus: string]: {
            broadcast: boolean,
            cabinets: {
                [cabinet: string]: {
                    broadcast: boolean,
                    computers: [string]
                }
            }
        }
    }
}
export type Corpus = {
    "name": string,
    "rus_name": string,
    "start_ip": string,
    "end_ip": string,
    "cabinets": {
        [cabinet: string]: [string]
    }
}


export function saveUsers(users: any) {
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, 4));
}