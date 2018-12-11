const EventEmitter = require('events');
const fs = require("fs");
const util = require('util');

export default class DirWatcher extends EventEmitter {
    constructor() {
        super();
        this.watchers = {}
    }

    watch(path, delay) {
        const pathType = fs.lstatSync(path);
        const fsReadFile = util.promisify(fs.readFile);

        if (pathType.isDirectory()) {
            fs.readdir(path, (err, files) => {
                if (err) throw err;
                const promises = [];

                files.forEach((file) => {
                    const completePath = `${path}/${file}`;
                    const reader = fsReadFile(completePath).then((data) => {
                        this.watchers[completePath] = data.toString();
                    }).catch((err) => {
                        console.error(err)
                    })
                    promises.push(reader)
                })
                Promise.all(promises).then(() => {
                    this.emit("changed", Object.keys(this.watchers));
                })
            });

            setInterval(() => {
                const promises = [];
                for(let path in this.watchers) {
                    const reader = fsReadFile(path).then((data) => {
                        const isChanged = this.watchers[path] !== data.toString();
                        if (isChanged) {
                            this.watchers[path] = data.toString();
                        }
                        return isChanged ? path : null;
                    }).catch((err) => {
                        console.error(err)
                    })
                    promises.push(reader)
                }

                Promise.all(promises).then((data) => {
                    let changedFiles = data.filter((file) => file !== null);
                    if (changedFiles.length !== 0) {
                        this.emit("changed", changedFiles);
                    }
                })
            }, delay)
        } else if (pathType.isFile()) {
            fs.readFile(path, (err, data) => {
                if (err) throw err;
                this.watchers[path] = data.toString();
                this.emit("changed", [path]);
            });
            setInterval(() => {
                fs.readFile(path, (err, data) => {
                    if (err) throw err;
                    if (this.watchers[path] !== data.toString()) {
                        this.emit("changed", [path]);
                        this.watchers[path] = data.toString();
                    }
                });
            }, delay)
        } else {
            throw new Error()
        }
    }
}