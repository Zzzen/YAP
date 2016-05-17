import fs = require("fs");


export function writeUserData(data: Object) {
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
    return new Promise<string>((resolve, reject) => {
        fs.readFile("userData.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

