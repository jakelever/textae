import {
  isBoundaryCrossingWithOtherSpans as isBoundaryCrossingWithOtherSpans
}
from '../../../../../Model/AnnotationData/parseAnnotation/validateAnnotation'
import isAlreadySpaned from '../../../../isAlreadySpaned'
import * as selectPosition from '../selectPosition'
import spanRemoveCommand from '../../../../Command/Factory/spanRemoveCommand'
import _ from 'underscore'

const BLOCK_THRESHOLD = 100

export default function (editor, annotationData, selectionModel, command, typeContainer, spanAdjuster, isDetectDelimiterEnable, isReplicateAuto, isAddSubspan, selection, spanConfig) {
  const newSpan = getNewSpan(annotationData, spanAdjuster, selection, spanConfig)
  
  // The span cross exists spans.
  if (isBoundaryCrossingWithOtherSpans(
      annotationData.span.all(),
      newSpan
    )) {
    return
  }

  // The span exists already.
  if (isAlreadySpaned(annotationData.span.all(), newSpan)) {
    return
  }

  const commands = createCommands(editor, annotationData, selectionModel, command, typeContainer, newSpan, isReplicateAuto, isAddSubspan, isDetectDelimiterEnable, spanConfig)

  command.invoke(commands, ['annotation'])
}

function createCommands(editor, annotationData, selectionModel, command, typeContainer, newSpan, isReplicateAuto, isAddSubspan, isDetectDelimiterEnable, spanConfig) {
  var previouslySelected = selectionModel.span.all()
  if (previouslySelected.length > 0)
    previouslySelected = previouslySelected[0]
  else
    previouslySelected = null

  var commands = []

  if (isAddSubspan && previouslySelected) {
    var span_id = previouslySelected.split('_').slice(0, 4).join('_')
    /*var subspan_id = span_id + '_s0'
    var oldSpan = annotationData.span.get(span_id)

    var mergedSpan = { ranges: oldSpan.ranges.concat(newSpan.ranges) }
    mergedSpan.firstBegin = Math.min.apply(null, _.map(mergedSpan.ranges, s => s.begin));
    mergedSpan.lastEnd = Math.max.apply(null, _.map(mergedSpan.ranges, s => s.end));

    var entityType = oldSpan.getTypes()[0].name*/

    /*commands = [spanRemoveCommand(editor, annotationData, selectionModel, subspan_id),
      command.factory.spanCreateCommand(
        entityType, mergedSpan
      )]*/
    commands = [command.factory.subspanAddCommand(span_id,newSpan)]
  } else {
    commands = [command.factory.spanCreateCommand(
      typeContainer.entity.getDefaultType(), newSpan
    )]

    if (isReplicateAuto && newSpan.lastEnd - newSpan.firstBegin <= BLOCK_THRESHOLD) {
      commands.push(
        command.factory.spanReplicateCommand(newSpan, [typeContainer.entity.getDefaultType()],
          isDetectDelimiterEnable ? spanConfig.isDelimiter : null
        )
      )
    }
  }

  return commands
}

function getNewSpan(annotationData, spanAdjuster, selection, spanConfig) {
  const [begin, end] = selectPosition.getBeginEnd(annotationData, selection)

  var adjustedBegin = spanAdjuster.backFromBegin(annotationData.sourceDoc, begin, spanConfig)
  var adjustedEnd = spanAdjuster.forwardFromEnd(annotationData.sourceDoc, end - 1, spanConfig) + 1

  return {
    firstBegin: adjustedBegin,
    lastEnd: adjustedEnd,
    ranges: [{ begin: adjustedBegin, end: adjustedEnd }]
  }
}
