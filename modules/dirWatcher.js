const EventEmitter = require('events');
const csvToJson = require('convert-csv-to-json');
const fs = require("fs");

export default class DirWatcher extends EventEmitter {
    constructor() {
        super();
        this.listeners = {}
    }

    watch(path, delay) {
        fs.readFile(path, (err, data) => {
            if (err) throw err;
            this.listeners[path] = data.toString();
            this.emit("changed");
        });
        setInterval(() => {
            fs.readFile(path, (err, data) => {
                if (err) throw err;
                if (this.listeners[path] !== data.toString()) {
                    this.emit("changed");
                    this.listeners[path] = data.toString();
                }
            });
        }, delay)
    }
}