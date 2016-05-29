import fs = require("fs");

export function readDir(path: string) {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

export function stat(path: string) {
    return new Promise<fs.Stats>((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats);
            }
        });
    });
}

export function readFileAsString(path: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path, "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export function writeStringToFile(path: string, text: string) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path, text, { encoding: "utf-8" }, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}