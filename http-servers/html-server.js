const http = require("http");
const fs = require("fs");
const { Transform } = require('stream');

http.createServer()
    .on("request", (req, res) => {
        res.writeHead(200, {
            "Content-Type": "html"
        });
        const messageTr = new Transform({
            transform(chunk, encoding, callback) {
                const chunkStr = chunk.toString();
                const messagePosition = chunkStr.indexOf("​{message}​");
                if (messagePosition !== -1) {
                    const finalChunk = chunkStr.slice(0, messagePosition) + "hello world" + chunkStr.slice(messagePosition + 10);
                    this.push(finalChunk);
                } else {
                    this.push(chunk);
                }
                callback();
            }
          });
        fs.createReadStream(__dirname + "/index.html").pipe(messageTr).pipe(res)
    }).listen(3000);