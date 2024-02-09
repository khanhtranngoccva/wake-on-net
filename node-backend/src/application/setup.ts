import api from "@/helpers/api.js";

export async function registerNode() {
  return api.post<Api.Response<Application.NodeConfig>>("/node/register").then(res => res.data.data);
}

export async function getNode(params: {
  nodeId: string,
  totp: string,
}) {
  return api.get<Api.Response<Application.NodeConfig>>("/node/current-node", {
    headers: {
      Authorization: Buffer.from(JSON.stringify(params), "utf-8").toString("base64"),
    }
  }).then(res => res.data.data);
}
