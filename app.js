import { DirWatcher, Importer } from "./modules";

const dirWatcher = new DirWatcher();
const importer = new Importer()

dirWatcher.on("changed", () => {
    console.log("changed");
    importer.import(__dirname + "/data/index.csv").then((data) => {
        console.log(data)
    })
})

dirWatcher.watch(__dirname + "/data/index.csv", 1000)
