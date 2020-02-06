import delimiterDetectAdjuster from '../../../spanAdjuster/delimiterDetectAdjuster'
import blankSkipAdjuster from '../../../spanAdjuster/blankSkipAdjuster'
import create from './create'
import expand from './expand'
import * as shrink from './shrink'

export default function (editor, annotationData, selectionModel, command, typeContainer, isDetectDelimiterEnable, isReplicateAuto, isAddSubspan) {
  const spanAdjuster = isDetectDelimiterEnable ? delimiterDetectAdjuster : blankSkipAdjuster

  return {
    create: (data) => {

      // We only deselect the current selection if we're not adding subspans
      // In that case, we need to know the current selection (to know which)
      // span to add a subspan too.
      if (!(isAddSubspan && selectionModel.span.all()))
        selectionModel.clear()  
      create(editor, annotationData, selectionModel, command, typeContainer, spanAdjuster, isDetectDelimiterEnable, isReplicateAuto, isAddSubspan, data.selection, data.spanConfig)
      
    },
    expand: (data) => expand(editor, annotationData, selectionModel, command, spanAdjuster, data.selection, data.spanConfig),
    shrinkCrossTheEar: (data) => shrink.crossTheEar(editor, annotationData, selectionModel, command, spanAdjuster, data.selection, data.spanConfig),
    shrinkPullByTheEar: (data) => shrink.pullByTheEar(editor, annotationData, selectionModel, command, spanAdjuster, data.selection, data.spanConfig)
  }
}
