import fs = require("fs");
import http = require("http");
import url = require("url");

export interface Req {
    path: string;
}

export const server = http.createServer((req, res) => {
    const query: Req = url.parse(req.url, true).query;

    if (!query || !query.path) {
        res.end(`<head>
  <link href="http://vjs.zencdn.net/5.9.2/video-js.css" rel="stylesheet">

</head>

<body>
  <video id="my-video" class="video-js" controls preload="auto" width="640" height="264" data-setup="{}">
    <source src="http://localhost:8080/?path=E:/1.mp4" type='video/mp4'>
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a web browser that
      <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
  </video>
  <script src="http://vjs.zencdn.net/5.9.2/video.js"></script>
</body>`);

        return;
    }

    fs.readdir(".");

    fs.stat(query.path, (err, stats) => {
        if (err) {
            console.log("fail to read file stat", err);
            res.end(JSON.stringify(query));
        } else {

            const range: string = req.headers.range;

            if (!range) {
                res.setHeader("Content-Length", String(stats.size));
                res.setHeader('Content-disposition', 'attachment; filename=' + "cao.flv");

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
                    "Content-Type": "video/mp4"
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
});

server.listen(8080, "localhost");
