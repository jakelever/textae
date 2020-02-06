import {
  isBoundaryCrossingWithOtherSpans as isBoundaryCrossingWithOtherSpans
}
from '../../../../../Model/AnnotationData/parseAnnotation/validateAnnotation'
import isAlreadySpaned from '../../../../isAlreadySpaned'
import * as selectPosition from '../selectPosition'

const BLOCK_THRESHOLD = 100

export default function(annotationData, command, typeContainer, spanAdjuster, isDetectDelimiterEnable, isReplicateAuto, selection, spanConfig) {
  const span = getNewSpan(annotationData, spanAdjuster, selection, spanConfig)

  var newSpan = {};
  if (Array.isArray(span)) {
    newSpan.ranges = span;
    newSpan.firstBegin = Math.min.apply(null, _.map(span, s => s.begin));
    newSpan.lastEnd = Math.max.apply(null, _.map(span, s => s.end));
  } else {
    newSpan.ranges = [span];
    newSpan.firstBegin = span.begin;
    newSpan.lastEnd = span.end;
  }

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

  const commands = createCommands(command, typeContainer, newSpan, isReplicateAuto, isDetectDelimiterEnable, spanConfig)

  command.invoke(commands, ['annotation'])
}

function createCommands(command, typeContainer, newSpan, isReplicateAuto, isDetectDelimiterEnable, spanConfig) {
  const commands = [command.factory.spanCreateCommand(
    typeContainer.entity.getDefaultType(), newSpan
  )]

  if (isReplicateAuto && newSpan.lastEnd - newSpan.firstBegin <= BLOCK_THRESHOLD) {
    commands.push(
      command.factory.spanReplicateCommand(newSpan, [typeContainer.entity.getDefaultType()],
        isDetectDelimiterEnable ? spanConfig.isDelimiter : null
      )
    )
  }

  return commands
}

function getNewSpan(annotationData, spanAdjuster, selection, spanConfig) {
  const [begin, end] = selectPosition.getBeginEnd(annotationData, selection)

  return {
    begin: spanAdjuster.backFromBegin(annotationData.sourceDoc, begin, spanConfig),
    end: spanAdjuster.forwardFromEnd(annotationData.sourceDoc, end - 1, spanConfig) + 1
  }
}
