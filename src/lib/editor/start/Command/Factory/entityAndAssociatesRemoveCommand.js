import { RemoveCommand } from './commandTemplate'
import executeCompositCommand from './executeCompositCommand'
import relationAndAssociatesRemoveCommand from './relationAndAssociatesRemoveCommand'

export default function(editor, annotationData, selectionModel, id) {
  const entityRemoveCommand = (entity) =>
    new RemoveCommand(editor, annotationData, selectionModel, 'entity', entity)
  const removeEntity = entityRemoveCommand(id)
  const removeRelation = annotationData.entity
    .assosicatedRelations(id)
    .map((id) =>
      relationAndAssociatesRemoveCommand(
        editor,
        annotationData,
        selectionModel,
        id
      )
    )
  const removeModification = annotationData
    .getModificationOf(id)
    .map((modification) => modification.id)
    .map(
      (id) =>
        new RemoveCommand(
          editor,
          annotationData,
          selectionModel,
          'modification',
          id
        )
    )
  const subCommands = removeRelation
    .concat(removeModification)
    .concat(removeEntity)

  return {
    execute() {
      executeCompositCommand('entity', this, 'remove', id, subCommands)
    }
  }
}
