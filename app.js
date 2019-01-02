import { DirWatcher, Importer } from "./modules";

const dirWatcher = new DirWatcher();
const importer = new Importer()

importer.addListener(console.log)

dirWatcher.watch(__dirname + "/data", 1000)
