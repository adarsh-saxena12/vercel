import { S3 } from "aws-sdk";
import fs from "fs";
import path, { dirname } from "path";
// import { getAllFiles, uploadFile } from "./files"
// // import { uploadFile } from "./files"

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
})

export async function downloadS3Folder(prefix: string) {

    console.log(__dirname);
    
    console.log("downloadS3Folder: ", "prefix:",prefix);

    const allFiles = await s3.listObjectsV2({
        Bucket: "bucket-for-vercel",
        Prefix: prefix,
    }).promise();

    console.log(allFiles);
    
    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            console.log(dirName);
            
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            s3.getObject({
                Bucket: "bucket-for-vercel",
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));

}

// copy final build code to s3
export const copyFinalDist = async (buildId : string) => {
     const folderPath = path.join(__dirname, `output/${buildId}/dist`);
     console.log('folderpath: ', folderPath);
     
     const allFiles = getAllFiles(folderPath);
     console.log(allFiles);
         
     allFiles.forEach(async (file) => {
        console.log(file);
        
        await uploadFile(`dist/${buildId}/` + file.slice(folderPath.length + 1), file);
     })

}

// get all the files from final path
const getAllFiles = (folderPath: string) => {
    let response: string[] = [];
    console.log('before');
    const allFilesAndFolders = fs.readdirSync(folderPath);
    console.log('after');
  
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);

        console.log(fullFilePath);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}


const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "bucket-for-vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}












