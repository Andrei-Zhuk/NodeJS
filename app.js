import { DirWatcher, Importer } from "./modules";

const dirWatcher = new DirWatcher();
const importer = new Importer()

dirWatcher.on("changed", (changedFiles) => {
    console.log("changed");
    importer.import(changedFiles).then((data) => {
        console.log(data)
    })
    const data = importer.importSync(changedFiles)
    console.log(data)
})

dirWatcher.watch(__dirname + "/data", 1000)
