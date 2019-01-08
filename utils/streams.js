const program = require("commander");
const util = require("util");
const fs = require("fs");
const through = require("through2")

const fsReaddir = util.promisify(fs.readdir);
const fsReadFile = util.promisify(fs.readFile);
const cssStatic = `
.ngmp18 {
    background-color: #fff;
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;
  }
  
.ngmp18__hw3 {
    color: #333;
}
  
.ngmp18__hw3--t7 {
    font-weight: bold;
}`;

program.option("-a, --action <name>", "Dispatch an action").option("-f, --file <url>", "Provide file").option("-p, --path <path>", "Provide path").parse(process.argv)

if (program.action == "reverse") {
    const stream = through(function (buffer, encoding, next) {
        this.push(reverse(buffer.toString()))
        next();
    })

    process.stdin.pipe(stream).pipe(process.stdout);
} else if (program.action == "transform") {
    const stream = through(function (buffer, encoding, next) {
        this.push(transform(buffer.toString()))
        next();
    })

    process.stdin.pipe(stream).pipe(process.stdout);
} else if (program.action == "outputFile") {
    if (!program.file) {
        throw new Error("file is not provided");
    }
    outputFile(program.file)
} else if (program.action == "convertFromFile") {
    if (!program.file) {
        throw new Error("file is not provided");
    }
    convertFromFile(program.file)
} else if (program.action == "convertToFile") {
    if (!program.file) {
        throw new Error("file is not provided");
    }
    convertToFile(program.file)
} else if (program.action == "cssBundler") {
    if (!program.path) {
        throw new Error("path is not provided");
    }
    cssBundler(program.path);
} else {
    throw new Error("there is no such action, use --help to get an information about available actions")
}

function reverse(str) {
    // console.log(str)
    let reverseStr = str.slice(0, -2).split('').reverse().join('');
    return reverseStr + str.slice(-2);
}

function transform(str) {
    return str.toUpperCase()
}

function outputFile(filePath) {
    let readStream = fs.createReadStream(filePath)

    readStream.on('data', (chunk) => {
        if (chunk !== null) {
            process.stdout.write(chunk);
        }
    });

    readStream.on('error', (err) => {
        console.error(err)
    })
}

function convertFromFile(filepath) {
    let readStream = fs.createReadStream(filepath);
    readStream.setEncoding('utf8');
    let csvData = "";

    readStream.on('data', (chunk) => {
        csvData += chunk;
    });

    readStream.on('error', (err) => {
        console.error(err)
    })

    readStream.on('end', () => {
        process.stdout.write(JSON.stringify(csvJSON(csvData)))
    })
}

function convertToFile(filePath) {
    const outputFileName = filePath.slice(0, -3) + "json";
    let readStream = fs.createReadStream(filePath);
    let writeStream = fs.createWriteStream(outputFileName);
    readStream.setEncoding('utf8');
    let csvData = "";

    readStream.on('data', (chunk) => {
        csvData += chunk;
    });

    readStream.on('error', (err) => {
        console.error(err)
    })

    readStream.on('end', () => {
        writeStream.write(JSON.stringify(csvJSON(csvData)))
    })
}

function cssBundler(path) {
    const pathType = fs.lstatSync(path);
    if (pathType.isDirectory()) {
        fsReaddir(path).then((files) => {
            const promises = files.map((file) => {
                const completePath = `${path}/${file}`;
                return fsReadFile(completePath).then((data) => {
                    return data.toString();
                }).catch((err) => {
                    console.error(err)
                })
            });

            return Promise.all(promises);
        }).then((dataArr) => {
            const bundleData = [...dataArr, cssStatic].join("\n")
            fs.writeFile(`${path}/bundle.css`, bundleData, function (err) {
                if (err) throw err;
                console.log('Saved!');
              });
        }).catch((err) => console.error(err));
    } else {
        throw new Error("provide path to a directory")
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
