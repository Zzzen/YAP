import fs = require("fs");
import http = require("http");
import url = require("url");
import path = require("path");

const MIMETypes = new Map<string, string>();
MIMETypes.set(".flv", "video/x-flv").set(".mp4", "video/mp4").set(".avi", "video/x-msvideo");

export interface Req {
    path: string;
    getStream: string;
}

export const server = http.createServer((req, res) => {
    const query: Req = url.parse(req.url, true).query;

    if (!query.path) {
        res.end("Empty query");
    } else if (query.path && !query.getStream) {
        // return a page.
        res.end(`
<head>
  <link href="http://vjs.zencdn.net/5.9.2/video-js.css" rel="stylesheet">
</head>
<body>
  <video id="my-video" class="video-js" controls preload="auto" width="640" height="264" data-setup="{}">
    <source src="http://localhost:8080/?getStream=true&path=${query.path}" type='${MIMETypes.get(path.extname(query.path))}'>
  </video>
  <script src="http://vjs.zencdn.net/5.9.2/video.js"></script>
</body>`);

    } else {
        const mimetype = MIMETypes.get(path.extname(query.path));

        fs.stat(query.path, (err, stats) => {
            if (err) {
                console.log("fail to read file stat", err);
                res.end(JSON.stringify(query));
            } else {

                const range: string = req.headers.range;

                if (!range) {

                    res.writeHead(206, {
                        "Accept-Ranges": "bytes",
                        "Content-Length": stats.size,
                        "Content-Type": mimetype
                    });
                    const stream = fs.createReadStream(query.path);
                    stream.pipe(res);

                } else {
                    const positions = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(positions[0], 10);
                    const total = stats.size;
                    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
                    const chunksize = (end - start) + 1;

                    res.writeHead(206, {
                        "Content-Range": "bytes " + start + "-" + end + "/" + total,
                        "Accept-Ranges": "bytes",
                        "Content-Length": chunksize,
                        "Content-Type": mimetype
                    });

                    const stream = fs.createReadStream(query.path, { start: start, end: end })
                        .on("open", function () {
                            stream.pipe(res);
                        }).on("error", function (err: any) {
                            res.end(err);
                        });
                }
            }
        });
    }
});

server.listen(8080, "localhost");
