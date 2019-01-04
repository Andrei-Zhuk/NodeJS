const program = require("commander");
const repl = require("repl");
const fs = require("fs");

program.option("-a, --action <name>", "Dispatch an action").option("-f, --file <url>", "Provide file").parse(process.argv)

if (program.action == "reverse") {
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
        if (chunk !== null) {
            process.stdout.write(reverse(chunk));
        } else {
            console.log('null')
        }
    });
}

if (program.action == "transform") {
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
        if (chunk !== null) {
            process.stdout.write(transform(chunk));
        } else {
            console.log('null')
        }
    });
}

if (program.action == "outputFile" && program.file) {
    let readStream = fs.createReadStream(program.file)

    readStream.on('data', (chunk) => {
        if (chunk !== null) {
            process.stdout.write(chunk);
        } else {
            console.log('null')
        }
    });

    readStream.on('error', (err) => {
        console.error(err)
    })
}

if (program.action == "convertFromFile" && program.file) {
    let readStream = fs.createReadStream(program.file);
    readStream.setEncoding('utf8');
    let numChunks = 0;
    let csvData = "";

    readStream.on('data', (chunk) => {
        numChunks++;
        csvData += chunk;
        if (chunk !== null) {
            // process.stdout.write(chunk);
        } else {
            console.log('null')
        }
    });

    readStream.on('error', (err) => {
        console.error(err)
    })

    readStream.on('end', () => {
        process.stdout.write(JSON.stringify(csvJSON(csvData)))
    })
}

if (program.action == "convertToFile" && program.file) {
    let readStream = fs.createReadStream(program.file);
    readStream.setEncoding('utf8');
    let numChunks = 0;
    let csvData = "";

    readStream.on('data', (chunk) => {
        numChunks++;
        csvData += chunk;
        if (chunk !== null) {
            // process.stdout.write(chunk);
        } else {
            console.log('null')
        }
    });

    readStream.on('error', (err) => {
        console.error(err)
    })

    readStream.on('end', () => {
        process.stdout.write(JSON.stringify(csvJSON(csvData)))
    })
}

function reverse(str) {
    let reverseStr = str.slice(0, -2).split('').reverse().join('');
    return reverseStr + str.slice(-2);
}

function transform(str) {
    return str.toUpperCase()
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
