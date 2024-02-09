export function getIdOfEntity<T extends {id: string}>(entity: T | string) {
  return typeof entity === "string" ? entity : entity.id;
}
