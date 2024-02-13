export function* objectEntries<T extends {}>(obj: T): Generator<[keyof T, T[keyof T]]> {
  for (let [key, value] of Object.entries(obj)) {
    yield [key as keyof T, value as T[keyof T]];
  }
}