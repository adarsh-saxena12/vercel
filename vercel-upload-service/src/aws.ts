import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path"; // 

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

export const uploadFile = async (fileName : string, locaFilePath : string) => {
     
     console.log("called");

     const fileContent = fs.readFileSync(locaFilePath);
     const response = await s3.upload({
        Body: fileContent,
        Bucket: "bucket-for-vercel",
        Key: path.posix.join(...fileName.split(path.sep))
        ,
     }).promise();
    console.log(response);
     
}