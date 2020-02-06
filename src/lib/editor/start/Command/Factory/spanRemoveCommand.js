import _ from 'underscore'

import {
  RemoveCommand
}
from './commandTemplate'
import entityAndAssociatesRemoveCommand from './entityAndAssociatesRemoveCommand'
import executeCompositCommand from './executeCompositCommand'

export default function (editor, annotationData, selectionModel, subspan_id) {

  // The subspan ID (e.g. editor0__S70_83_s0) needs to be trimmed to the span ID (e.g. editor0__S70_83)
  // This is because the subspan is what is selected, but we need to deal with the full span.
  var span_id = subspan_id.split('_').slice(0, 4).join('_')

  var span = annotationData.span.get(span_id);

  // removeSubspans = _.map(span.ranges, (r, i) => new RemoveCommand(editor, annotationData, selectionModel, 'subspan', span_id + '_s' + i)),
  var removeSpan = new RemoveCommand(editor, annotationData, selectionModel, 'span', span_id),
    
  removeEntity = _.flatten(span.getTypes().map(function(type) {
      return type.entities.map(function(entityId) {
        return entityAndAssociatesRemoveCommand(editor, annotationData, selectionModel, entityId)
      })
    })),
    subCommands = removeEntity.concat(removeSpan)//.concat(removeSubspans)

  return {
    execute: function() {
      executeCompositCommand('span', this, 'remove', span_id, subCommands)
    }
  }
}
