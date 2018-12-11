const fs = require("fs");
const util = require('util');

export default class Importer {
    import(pathArr) {
        const fsReadFile = util.promisify(fs.readFile);

        return new Promise((resolve, reject) => {
            const promises = [];

            pathArr.forEach((path) => {
                const reader = fsReadFile(path).then((data) => {
                    return csvJSON(data.toString());
                }).catch((err) => {
                    reject(err)
                })
                promises.push(reader)
            })
            resolve(Promise.all(promises))
        });
    }

    importSync(pathArr) {
        const filesData = [];

        pathArr.forEach((path) => {
            const fileData = fs.readFileSync(path)
            filesData.push(csvJSON(fileData.toString()))
        })

        return filesData;
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