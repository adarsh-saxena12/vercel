import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path"
import getAllFiles from "./files"
import { uploadFile } from "./aws";
import { Queue } from "./queue";
import { createClient } from "redis";

const subscriber = createClient();
subscriber.connect();

const publisher = createClient();

publisher.connect();

const app = express();

app.use(cors());
app.use(express.json());

// test using POSTMAN 
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate(); //wf43d
    // await simpleGit().clone(repoUrl, `output/${id}`)
    console.log("uploadId: ", id);
    
    // await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    files.forEach(async file => {
        // (/users/dell/vercel/dist/output/gdf23/app.js).slice 
        // -> output/gdf23/app.js
        console.log(file);
        
        await uploadFile(file.slice(__dirname.length + 1), file);
    })

    console.log(files);
    console.log(repoUrl);

    // push id into the redis queue
    await new Promise((resolve) => setTimeout(resolve, 15000))
    Queue(id)

    res.json({
        id: id
    })

} )

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(3000);
