declare module "wake_on_lan" {
  export function wake(macAddress: string, callback?: (error?: Error) => void | Promise<void>): void;
}