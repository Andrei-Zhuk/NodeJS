const program = require("commander");
const util = require("util");
const fs = require("fs");
const through = require("through2")

const fsReaddir = util.promisify(fs.readdir);
const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);
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

const requiringArgs = {
    file: ['outputFile', 'convertFromFile', 'convertToFile'],
    path: ['cssBundler'],
  };

const helpOption = process.argv.findIndex((o) => o === '-h' || o === '--help')
if (helpOption !== -1 && helpOption !== 2) {
    process.argv.splice(helpOption, 1)
}

program
    .option("-a, --action <name>", "Dispatch an action")
    .option("-f, --file <url>", "Provide file")
    .option("-p, --path <path>", "Provide path")
    .parse(process.argv);

const actions = {
    reverse,
    transform,
    outputFile,
    convertFromFile,
    convertToFile,
    cssBundler,
};

const args = [];

if (process.argv.length === 2 || !actions[program.action]) {
    console.log("There is no such action")
    program.help()
}

Object.keys(requiringArgs).forEach(key => {
    const isRequired = requiringArgs[key].includes(program.action);
        
    if (isRequired) {
        if (!program[key]) {
            throw new Error(`Argument ${key} is required but not provided`);
        } else {
            args.push(program[key]);
        }
    }
});
  
actions[program.action](...args);

function reverse() {
    const stream = through(function (buffer, encoding, next) {
        const str = buffer.toString();
        const lineEnd = str.match(/\s*$/)[0];
        const reverseStr = str.replace(lineEnd, '').split('').reverse().join('');
        this.push(reverseStr + lineEnd);
        next();
    })

    process.stdin.pipe(stream).pipe(process.stdout);
}

function transform() {
    const stream = through(function (buffer, encoding, next) {
        this.push(buffer.toString().toUpperCase());
        next();
    })

    process.stdin.pipe(stream).pipe(process.stdout);
}

function outputFile(filePath) {
    const isFileExists = fs.existsSync(filePath);
    if (!isFileExists) {
        return console.log("such file does not exist")
    }
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
    const isFileExists = fs.existsSync(filepath);
    if (!isFileExists) {
        return console.log("such file does not exist")
    }
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
    const isFileExists = fs.existsSync(filePath);
    if (!isFileExists) {
        return console.log("such file does not exist")
    }
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
            const bundleData = [...dataArr, cssStatic].join("\n");
            return fsWriteFile(`${path}/bundle.css`, bundleData);
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
