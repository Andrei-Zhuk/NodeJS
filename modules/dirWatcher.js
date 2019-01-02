import EventEmitter from 'events';
import fs from "fs";
import util from 'util';
import { emitter, changedEvent } from './emitter.js';

const fsReadFile = util.promisify(fs.readFile);

export default class DirWatcher extends EventEmitter {
    constructor() {
        super();
        this.watchers = {}
    }

    watch(path, delay) {
        const pathType = fs.lstatSync(path);

        if (pathType.isDirectory()) {
            fs.readdir(path, (err, files) => {
                if (err) throw err;

                const promises = files.map((file) => {
                    const completePath = `${path}/${file}`;
                    const reader = fsReadFile(completePath).then((data) => {
                        this.watchers[completePath] = data.toString();
                    }).catch((err) => {
                        console.error(err)
                    })
                    return reader;
                })
                Promise.all(promises).then(() => {
                    emitter.emit(changedEvent, Object.keys(this.watchers));
                })
            });

            setInterval(() => {
                const promises = [];
                for(let path in this.watchers) {
                    const reader = fsReadFile(path).then((data) => {
                        const isChanged = this.watchers[path] !== data.toString();
                        if (isChanged) {
                            this.watchers[path] = data.toString();
                            return path;
                        }
                        return null;
                    }).catch((err) => {
                        console.error(err)
                    })
                    promises.push(reader)
                }

                Promise.all(promises).then((data) => {
                    let changedFiles = data.filter((file) => file !== null);
                    if (changedFiles.length !== 0) {
                        emitter.emit(changedEvent, changedFiles);
                    }
                })
            }, delay)
        } else if (pathType.isFile()) {
            fs.readFile(path, (err, data) => {
                if (err) throw err;
                this.watchers[path] = data.toString();
                emitter.emit(changedEvent, [path]);
            });
            setInterval(() => {
                fs.readFile(path, (err, data) => {
                    if (err) throw err;
                    if (this.watchers[path] !== data.toString()) {
                        emitter.emit(changedEvent, [path]);
                        this.watchers[path] = data.toString();
                    }
                });
            }, delay)
        } else {
            throw new Error()
        }
    }
}