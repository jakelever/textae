import {
  CreateCommand
}
from './commandTemplate'
import idFactory from '../../../idFactory'
import spanRemoveCommand from './spanRemoveCommand'
import executeCompositCommand from './executeCompositCommand'
import _ from 'underscore'

export default function subspanAddCommand(editor, annotationData, selectionModel, spanId, newSpan) {
  const spanCreateCommand = (span) => new CreateCommand(editor, annotationData, selectionModel, 'span', true, span),
    entityCreateCommand = (entity) => new CreateCommand(editor, annotationData, selectionModel, 'entity', true, entity),
    relationCreateCommand = (relation) => new CreateCommand(editor, annotationData, selectionModel, 'relation', false, relation),
    d = annotationData

  let subCommands = []

  var oldSpan = annotationData.span.get(spanId)
  var mergedSpan = { ranges: oldSpan.ranges.concat(newSpan.ranges) }
  mergedSpan.firstBegin = Math.min.apply(null, _.map(mergedSpan.ranges, s => s.begin));
  mergedSpan.lastEnd = Math.max.apply(null, _.map(mergedSpan.ranges, s => s.end));
  var mergedSpanId = idFactory.makeSpanId(editor, mergedSpan)

  if (!d.span.get(mergedSpanId)) {

    subCommands.push(spanRemoveCommand(editor, annotationData, selectionModel, spanId))
    subCommands.push(spanCreateCommand(mergedSpan))
    d.span.get(spanId).getTypes().forEach(function(type) {
      type.entities.forEach(function(id) {
        subCommands.push(entityCreateCommand({
          id: id,
          span: mergedSpanId,
          type: type.name
        }))

        subCommands = subCommands.concat(
          d.entity.assosicatedRelations(id)
          .map(d.relation.get)
          .map(function(relation) {
            return relationCreateCommand(relation)
          })
        )
      })
    })
  }

  return {
    execute: function() {
      executeCompositCommand('span', this, 'move', spanId, subCommands)
    }
  }
}
