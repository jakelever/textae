import {
  isBoundaryCrossingWithOtherSpans as isBoundaryCrossingWithOtherSpans
}
from '../../../../../../Model/AnnotationData/parseAnnotation/validateAnnotation'
import deferAlert from '../../deferAlert'
import idFactory from '../../../../../../idFactory'
import moveSpan from './../moveSpan'
import * as selectPosition from '../../selectPosition'
import _ from 'underscore'

export default function(editor, annotationData, command, spanAdjuster, spanId, selection, spanConfig) {
  const newSpan = getNewSpan(annotationData, spanAdjuster, spanId, selection, spanConfig)

  // The span cross exists spans.
  if (isBoundaryCrossingWithOtherSpans(
      annotationData.span.all(),
      newSpan
    )) {
    deferAlert('A span cannot be shrinked to make a boundary crossing.')
    return false
  }

  const newSpanId = idFactory.makeSpanId(editor, newSpan),
    sameSpan = annotationData.span.get(newSpanId)

  if (newSpan.firstBegin < newSpan.lastEnd && !sameSpan) {
    command.invoke(moveSpan(editor, command, spanId, newSpan), ['annotation'])
  } else {
    command.invoke(removeSpan(command, spanId), ['annotation'])
    return true
  }

  return false
}

function getNewSpan(annotationData, spanAdjuster, spanId, selection, spanConfig) {
  const anchorPosition = selectPosition.getAnchorPosition(annotationData, selection),
    focusPosition = selectPosition.getFocusPosition(annotationData, selection)

  return getNewShortSpan(annotationData, spanAdjuster, spanId, anchorPosition, focusPosition, spanConfig)
}

function removeSpan(command, spanId) {
  return [command.factory.spanRemoveCommand(spanId)]
}

function getNewShortSpan(annotationData, spanAdjuster, spanId, anchorPosition, focusPosition, spanConfig) {
  const span = annotationData.span.get(spanId)
  var newRanges = []

  if (anchorPosition < focusPosition) {
    // shorten the left boundary

    if (span.lastEnd === focusPosition) {
      // Is this ever used?
      newRanges = { begin: span.lastEnd, end: span.lastEnd }
    } else {

      var adjustedFocusPosition = spanAdjuster.forwardFromBegin(annotationData.sourceDoc, focusPosition, spanConfig)
      _.map(span.ranges, function (r) {
        if (adjustedFocusPosition < r.begin)
          newRanges.push(r)
        else if (adjustedFocusPosition < r.end)
          newRanges.push({
            begin: adjustedFocusPosition,
            end: r.end
          })
      })
    }
  } else {
    
    if (span.firstBegin === focusPosition) {
      // shorten the right boundary
      newRanges = { begin: span.firstBegin, end: span.firstBegin }
    } else {
      var adjustedFocusPosition = spanAdjuster.backFromEnd(annotationData.sourceDoc, focusPosition - 1, spanConfig) + 1

      _.map(span.ranges, function (r) {
        if (r.end < adjustedFocusPosition)
          newRanges.push(r)
        else if (r.begin < adjustedFocusPosition)
          newRanges.push({
            begin: r.begin,
            end: adjustedFocusPosition
          })
      })

    }
  }

  newRanges = _.filter(newRanges, r => (r.end > r.begin))
  var newSpan = { ranges: newRanges }
  if (newRanges.length > 0) {
    newSpan.firstBegin = Math.min.apply(null, _.map(newSpan.ranges, s => s.begin))
    newSpan.lastEnd = Math.max.apply(null, _.map(newSpan.ranges, s => s.end))
  } else {
    newSpan.firstBegin = -1
    newSpan.lastEnd = -1
  }
  return newSpan
}
