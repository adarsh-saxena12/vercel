import { commandOptions, createClient } from "redis";
import { downloadS3Folder } from "./aws";
import { buildProject } from "./utils";
import { copyFinalDist } from "./aws";
import path from "path"

const subscriber = createClient();

subscriber.connect();

const publisher = createClient();
publisher.connect();

const main = async () => {
    while(true){

        const response = await subscriber.brPop(
            commandOptions({ isolated : true }),
            'build-queue',
            0
        );
        
        console.log("build-queue:", response);
        
       
        const id = response?.element;
        if (!id) continue;

        
        await downloadS3Folder(`output/${id}/`)

        // here we want to build the project inside eks cluster
        await buildProject(id!);
        
        // copy build code (HTML, CSS, JS)
        copyFinalDist(id!);

        publisher.hSet("status", id!, "deployed")
        console.log("downloaded");
        
    }
}

main();