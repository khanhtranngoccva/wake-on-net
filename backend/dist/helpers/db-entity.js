export function getIdOfEntity(entity) {
    return typeof entity === "string" ? entity : entity.id;
}
