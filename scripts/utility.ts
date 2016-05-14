import fs = require("fs");

export function decompositionFullpath(fullpath: string) {
    const reg = /^(.+)\/([^\/]+)$/;
    const matches = fullpath.match(reg);
    return { path: matches[1], filename: matches[2] };
}

export function isSimilar(a: string, b: string) {
    return Math.abs(a.length - b.length) < Math.max(a.length, b.length) / 5 &&
        getLevenshteinDistance(a, b) < Math.max(a.length, b.length) / 5;
}

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


// see https://en.wikipedia.org/wiki/Levenshtein_distance#Definition
function getLevenshteinDistance(a: string, b: string) {

    function iter(i: number, j: number): number {
        if (Math.min(i, j) < 0) {
            return Math.max(i, j) + 1;
        } else {
            return Math.min(
                iter(i - 1, j) + 1,
                iter(i, j - 1) + 1,
                iter(i - 1, j - 1) + (a[i] === b[j] ? 0 : 1)
            );
        }
    }

    return iter(a.length - 1, b.length - 1);
}

