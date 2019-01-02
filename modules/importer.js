import fs from "fs";
import util from 'util';
import { emitter, changedEvent } from './emitter.js';

const fsReadFile = util.promisify(fs.readFile);

export default class Importer {
    import(pathArr) {
        return Promise.all(pathArr.map((path) => {
            return fsReadFile(path).then((data) => {
                return csvJSON(data.toString());
            })
        }))
    }

    importSync(pathArr) {
        const filesData = [];

        pathArr.forEach((path) => {
            const fileData = fs.readFileSync(path)
            filesData.push(csvJSON(fileData.toString()))
        })

        return filesData;
    }

    addListener(callback = () => {}) {
        emitter.on(changedEvent, (changedFiles) => {
            console.log(changedEvent);
            this.import(changedFiles).then((data) => {
                callback(data)
            })
            const data = this.importSync(changedFiles)
            callback(data)
        })
    }
}

function csvJSON(csv){
    let adjustedCsv = csv.split("\r").join("");

    let lines=adjustedCsv.split("\n");
  
    let result = [];
  
    let headers=lines[0].split(";");
  
    for(let i=1;i<lines.length;i++){
  
        let obj = {};
        let currentline=lines[i].split(";");
  
        for(let j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
  
    }

    return result;
  }