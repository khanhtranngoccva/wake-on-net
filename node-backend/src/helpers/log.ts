import console from "console";

export const log = (...args: any[]) => {
  console.log(new Date(), "[NODE_BACKEND]", ...args);
}
