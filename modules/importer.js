const fs = require("fs");

export default class Importer {
    import(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) throw reject(err);
                let convertedData = csvJSON(data.toString())
                return resolve(convertedData)
            });
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