export class EnvironmentError extends Error {
  constructor(key: string|number|symbol) {
    super(`Environment ${String(key)} is missing or invalid`);
  }
}
