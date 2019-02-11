const http = require("http");

http.createServer()
    .on("request", (req, res) => {
        res.writeHead(200, {
            "Content-Type": "plain text"
        });
        res.end("Hello World")
    }).listen(3000);