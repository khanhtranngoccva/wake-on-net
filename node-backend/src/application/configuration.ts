import * as fs from "fs";
import {z} from "zod";
import {registerNode} from "@/application/setup.js";
import {attemptConnection} from "@/application/socket.js";
import {delay} from "@/helpers/timing.js";
import * as console from "console";

const NODE_CONFIG_PATH = "/var/data/node.json";

async function load(): Promise<Application.NodeConfig> {
  const data = JSON.parse((await fs.promises.readFile(NODE_CONFIG_PATH)).toString());
  return {
    id: z.string().cuid().parse(data.id),
    userId: z.string().nullable().parse(data.userId),
    totp: {
      id: z.string().cuid().parse(data.totp.id),
      digits: z.number().int().positive().parse(data.totp.digits),
      algorithm: z.string().parse(data.totp.algorithm),
      secret: z.string().parse(data.totp.secret),
      interval: z.number().int().positive().parse(data.totp.interval),
    }
  }
}

async function save(node: Application.NodeConfig) {
  await fs.promises.writeFile(NODE_CONFIG_PATH, JSON.stringify(node));
}

// Load configuration or register a new configuration if not found.
export let loadedConfig: Application.NodeConfig;
try {
  loadedConfig = await load();
} catch (e) {
  while (true) {
    try {
      loadedConfig = await registerNode();
      await save(loadedConfig);
      break;
    } catch (e) {
      console.error(e.message);
      await delay(5);
    }
  }
}

attemptConnection(loadedConfig);

// Change configuration on the fly, useful for importing.
export async function changeNodeConfig(config: Application.NodeConfig) {
  loadedConfig = config;
  await save(config);
  attemptConnection(config);
}

export async function regenerateConfig() {
  await changeNodeConfig(await registerNode());
}



