// index.js
import { createClient, commandOptions } from "redis";
import { startPod } from "./start-pod"; // Import the function directly

const subscriber = createClient();
const publisher = createClient();

subscriber.connect();
publisher.connect();

const buildQueueName = 'build-queue';

const main = async () => {
    while (true) {
        try {
            const response = await subscriber.brPop(
                commandOptions({ isolated: true }),
                buildQueueName,
                0
            );
            console.log("Received task from build-queue:", response);

            const replId = response?.element;
            if (!replId) continue;

            await startPod(replId); // Directly call the function
            await publisher.hSet("status", replId, "deployed");
            console.log(`Status set to deployed for replId: ${replId}`);
        } catch (error) {
            console.error("Error processing queue:", error);
        }
    }
};

main();
