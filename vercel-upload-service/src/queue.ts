import { createClient } from "redis";

const publisher = createClient();

publisher.connect();

export const Queue = async (uploadId : string ) => {
     
     publisher.lPush("build-queue", uploadId);
     publisher.hSet("status", uploadId, "uploaded");

}