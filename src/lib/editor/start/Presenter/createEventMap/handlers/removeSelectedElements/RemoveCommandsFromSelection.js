export default function(command, selectionModel) {
  let spanIds = selectionModel.span.all(),
    entityIds = selectionModel.entity.all(),
    relationIds = selectionModel.relation.all()

  return getAll(command, spanIds, entityIds, relationIds)
}

function getAll(command, spanIds, entityIds, relationIds) {
  return []
    .concat(
      toRemoveRelationCommands(relationIds, command),
      toRemoveEntityCommands(entityIds, command),
      toRomeveSpanCommands(spanIds, command)
    )
}

function toRomeveSpanCommands(spanIds, command) {
  return spanIds.map(command.factory.spanRemoveCommand)
}

function toRemoveEntityCommands(entityIds, command) {
  return command.factory.entityRemoveCommand(entityIds)
}

function toRemoveRelationCommands(relationIds, command) {
  return relationIds.map(command.factory.relationRemoveCommand)
}
