import {
  CreateCommand,
  RemoveCommand
}
from './commandTemplate'
import ChangeTypeCommand from './ChangeTypeCommand'
import spanAndTypesCreateCommand from './spanAndTypesCreateCommand'
import spanReplicateCommand from './spanReplicateCommand'
import spanRemoveCommand from './spanRemoveCommand'
import spanMoveCommand from './spanMoveCommand'
import subspanAddCommand from './subspanAddCommand'
import entityChangeTypeRemoveRelationCommand from './entityChangeTypeRemoveRelationCommand'
import entityRemoveAndSpanRemeveIfNoEntityRestCommand from './entityRemoveAndSpanRemeveIfNoEntityRestCommand'
import relationAndAssociatesRemoveCommand from './relationAndAssociatesRemoveCommand'
import TypeCreateCommand from './TypeCreateCommand'
import TypeChangeCommand from './TypeChangeCommand'
import TypeRemoveCommand from './TypeRemoveCommand'
import AttributeChangeCommand from "./AttributeChangeCommand"

export default function Factory(editor, annotationData, selectionModel) {
  // The relaitonId is optional set only when revert of the relationRemoveCommand.
  // Set the css class lately, because jsPlumbConnector is no applyed that css class immediately after create.
  const relationCreateCommand = (relation) => new CreateCommand(editor, annotationData, selectionModel, 'relation', true, relation),
    factory = {
      spanCreateCommand: (type, span) => spanAndTypesCreateCommand(editor, annotationData, selectionModel, span, [type]),
      spanRemoveCommand: (id) => spanRemoveCommand(editor, annotationData, selectionModel, id),
      spanMoveCommand: (spanId, newSpan) => spanMoveCommand(editor, annotationData, selectionModel, spanId, newSpan),
      spanReplicateCommand: (span, types, detectBoundaryFunc) => spanReplicateCommand(editor, annotationData, selectionModel, span, types, detectBoundaryFunc),
      subspanAddCommand: (spanId, newSpan) => subspanAddCommand(editor, annotationData, selectionModel, spanId, newSpan),
      entityCreateCommand: (entity) => new CreateCommand(editor, annotationData, selectionModel, 'entity', true, entity),
      entityRemoveCommand: (ids) => entityRemoveAndSpanRemeveIfNoEntityRestCommand(editor, annotationData, selectionModel, ids),
      entityChangeTypeCommand: (id, newType, isRemoveRelations) => entityChangeTypeRemoveRelationCommand(editor, annotationData, selectionModel, id, newType, isRemoveRelations),
      attributeCreateCommand: (attribute) => new CreateCommand(editor, annotationData, selectionModel, 'attribute', true, attribute),
      attributeRemoveCommand: (id) => new RemoveCommand(editor, annotationData, selectionModel, 'attribute', id),
      attributeChangeCommand: (id, newPred, newValue) => new AttributeChangeCommand(annotationData, 'attribute', id, newPred, newValue),
      relationCreateCommand: relationCreateCommand,
      relationRemoveCommand: (id) => relationAndAssociatesRemoveCommand(editor, annotationData, selectionModel, id),
      relationChangeTypeCommand: (id, newType) => new ChangeTypeCommand(editor, annotationData, 'relation', id, newType),
      modificationCreateCommand: (modification) => new CreateCommand(editor, annotationData, selectionModel, 'modification', false, modification),
      modificationRemoveCommand: (modification) => new RemoveCommand(editor, annotationData, selectionModel, 'modification', modification),
      typeCreateCommand: (typeContainer, newType) => new TypeCreateCommand(editor, typeContainer, newType),
      typeChangeCommand: (typeContainer, modelType, id, newType) => new TypeChangeCommand(editor, annotationData, typeContainer, modelType, id, newType, null),
      typeRemoveCommand: (typeContainer, removeType) => new TypeRemoveCommand(editor, typeContainer, removeType),
    }

  return factory
}
