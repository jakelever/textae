import { CreateCommand } from './commandTemplate'
import SpanAndTypesCreateCommand from './SpanAndTypesCreateCommand'
import SpanReplicateCommand from './SpanReplicateCommand'
import SpanRemoveCommand from './SpanRemoveCommand'
import SpanMoveCommand from './SpanMoveCommand'
import EntitiesRemoveAndSpanRemeveIfNoEntityRestCommand from './EntitiesRemoveAndSpanRemeveIfNoEntityRestCommand'
import RelationAndAssociatesRemoveCommand from './RelationAndAssociatesRemoveCommand'
import TypeDefinitionCreateCommand from './TypeDefinitionCreateCommand'
import TypeDefinitionChangeAndRefectInstancesCommand from './TypeDefinitionChangeAndRefectInstancesCommand'
import TypeDefinitionRemoveCommand from './TypeDefinitionRemoveCommand'
import ChangeAttributesOfSelectedEntitiesCommand from './ChangeAttributesOfSelectedEntitiesCommand'
import RemoveAttributesOfSelectedEntitiesCommand from './RemoveAttributesOfSelectedEntitiesCommand'
import AttatchModificationsToSelectedCommand from './AttatchModificationsToSelectedCommand'
import RemoveModificationsFromSelectedCommand from './RemoveModificationsFromSelectedCommand'
import TypeModel from '../../../Model/AnnotationData/Container/SpanContainer/TypeModel'
import ChangeTypeRemoveRelationOfSelectedEntitiesCommand from './ChangeTypeRemoveRelationOfSelectedEntitiesCommand'
import ChangeTypeOfSelectedRelationsCommand from './ChangeTypeOfSelectedRelationsCommand'
import RemoveSelectedCommand from './RemoveSelectedCommand'
import CreateDefaultTypeEntityToSelectedSpans from './CreateDefaultTypeEntityToSelectedSpans'
import PasteTypesToSelectedSpansCommand from './PasteTypesToSelectedSpansCommand'
import CreateDefaultAttributeToSelectedEntitiesCommand from './CreateDefaultAttributeToSelectedEntitiesCommand'
import ChangeEntityLabelCommand from './ChangeEntityLabelCommand'
import ChangeRelationLabelCommand from './ChangeRelationLabelCommand'

export default class {
  constructor(editor, annotationData, selectionModel) {
    this._editor = editor
    this._annotationData = annotationData
    this._selectionModel = selectionModel
  }

  spanCreateCommand(typeName, span) {
    return new SpanAndTypesCreateCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      span,
      [new TypeModel(typeName)]
    )
  }

  spanRemoveCommand(id) {
    return new SpanRemoveCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      id
    )
  }

  spanMoveCommand(spanId, newSpan) {
    return new SpanMoveCommand(
      this._editor,
      this._annotationData,
      spanId,
      newSpan
    )
  }

  spanReplicateCommand(span, types, detectBoundaryFunc) {
    return new SpanReplicateCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      span,
      types,
      detectBoundaryFunc
    )
  }

  entitiesRemoveCommand(selectedElements) {
    return new EntitiesRemoveAndSpanRemeveIfNoEntityRestCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      selectedElements
    )
  }

  changeTypeRemoveRelationOfSelectedEntitiesCommand(
    newType,
    isRemoveRelations
  ) {
    return new ChangeTypeRemoveRelationOfSelectedEntitiesCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      newType,
      isRemoveRelations
    )
  }

  changeEntityLabelCommand(label, value, typeContainer) {
    return new ChangeEntityLabelCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      label,
      value,
      typeContainer
    )
  }

  createDefaultTypeEntityToSelectedSpansCommand(typeDefinition) {
    return new CreateDefaultTypeEntityToSelectedSpans(
      this._editor,
      this._annotationData,
      this._selectionModel,
      typeDefinition
    )
  }

  pasteTypesToSelectedSpansCommand(types) {
    return new PasteTypesToSelectedSpansCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      types
    )
  }

  attributeCreateCommand(attribute) {
    return new CreateCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      'attribute',
      true,
      attribute
    )
  }

  attributeRemoveCommand(selectedEntities, pred, obj) {
    return new RemoveAttributesOfSelectedEntitiesCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      selectedEntities,
      pred,
      obj
    )
  }

  attributeChangeCommand(
    id,
    selectedEntities,
    oldPred,
    oldObj,
    newPred,
    newObj
  ) {
    return new ChangeAttributesOfSelectedEntitiesCommand(
      this._annotationData,
      id,
      selectedEntities,
      oldPred,
      oldObj,
      newPred,
      newObj
    )
  }

  createDefaultAttributeToSelectedEntitiesCommand() {
    return new CreateDefaultAttributeToSelectedEntitiesCommand(
      this._editor,
      this._annotationData,
      this._selectionModel
    )
  }

  // The relaitonId is optional set only when revert of the relationRemoveCommand.
  // Set the css class lately, because jsPlumbConnector is no applyed that css class immediately after create.
  relationCreateCommand(relation) {
    return new CreateCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      'relation',
      true,
      relation
    )
  }

  relationRemoveCommand(id) {
    return new RelationAndAssociatesRemoveCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      id
    )
  }

  changeRelationLabelCommand(label, value, typeContainer) {
    return new ChangeRelationLabelCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      label,
      value,
      typeContainer
    )
  }

  changeTypeOfSelectedRelationsCommand(selectedElements, newType) {
    return new ChangeTypeOfSelectedRelationsCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      selectedElements,
      newType
    )
  }

  removeSelectedComand() {
    return new RemoveSelectedCommand(
      this._editor,
      this._annotationData,
      this._selectionModel
    )
  }

  modificationCreateCommand(modificationType, typeEditor) {
    return new AttatchModificationsToSelectedCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      modificationType,
      typeEditor
    )
  }

  modificationRemoveCommand(modificationType, typeEditor) {
    return new RemoveModificationsFromSelectedCommand(
      this._editor,
      this._annotationData,
      this._selectionModel,
      modificationType,
      typeEditor
    )
  }

  typeDefinitionCreateCommand(typeDefinition, newType) {
    return new TypeDefinitionCreateCommand(
      this._editor,
      typeDefinition,
      newType
    )
  }

  typeDefinitionChangeCommand(
    typeDefinition,
    modelType,
    id,
    changedProperties
  ) {
    return new TypeDefinitionChangeAndRefectInstancesCommand(
      this._editor,
      this._annotationData,
      typeDefinition,
      modelType,
      id,
      changedProperties
    )
  }

  typeDefinitionRemoveCommand(typeDefinition, removeType) {
    return new TypeDefinitionRemoveCommand(
      this._editor,
      typeDefinition,
      removeType
    )
  }
}