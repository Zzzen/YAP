import fs = require("fs");
import {RootList} from "./models";

export function writeUserData(data: RootList) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile("userData.json", JSON.stringify(data, undefined, 4), { encoding: "utf-8" }, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function getUserData() {
    return new Promise<RootList>((resolve, reject) => {
        fs.readFile("userData.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

