// start-pod.js
import fs from "fs";
import yaml from "yaml";
import path from "path";
import { KubeConfig, CoreV1Api, AppsV1Api } from "@kubernetes/client-node";

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);

// Load and parse YAML with injected replId
const loadYamlWithReplId = (filePath: string, replId: string) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return yaml.parseAllDocuments(fileContent).map((doc) => {
        let docString = doc.toString();
        docString = docString.replace(/{{service_name}}/g, replId);
        return yaml.parse(docString);
    });
};

export const startPod = async (replId: string) => {
    const namespace = "default";
    const kubeManifests = loadYamlWithReplId(path.join(__dirname, "service.yaml"), replId);

    try {
        for (const manifest of kubeManifests) {
            switch (manifest.kind) {
                case "Deployment":
                    await appsV1Api.createNamespacedDeployment(namespace, manifest);
                    break;
                case "Service":
                    await coreV1Api.createNamespacedService(namespace, manifest);
                    break;
                default:
                    console.log(`Unsupported kind: ${manifest.kind}`);
            }
        }
        console.log("Resources created successfully for replId:", replId);
        return { message: "Resources created successfully" };
    } catch (error) {
        console.error("Failed to create resources", error);
        throw new Error("Failed to create resources");
    }
};
