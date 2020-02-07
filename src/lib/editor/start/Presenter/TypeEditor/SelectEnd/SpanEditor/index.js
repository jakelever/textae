import delimiterDetectAdjuster from '../../../spanAdjuster/delimiterDetectAdjuster'
import blankSkipAdjuster from '../../../spanAdjuster/blankSkipAdjuster'
import create from './create'
import expand from './expand'
import * as shrink from './shrink'

export default function (editor, annotationData, selectionModel, command, typeContainer, isDetectDelimiterEnable, isReplicateAuto, isAddSubspan) {
  const spanAdjuster = isDetectDelimiterEnable ? delimiterDetectAdjuster : blankSkipAdjuster

  return {
    create: (data) => {

      // Save any currently selected span, or span associated with a selected entity
      var previouslySelectedSpanId = null
      if (selectionModel.span.all().length == 1) {
        var subspanID = selectionModel.span.all()[0]
        previouslySelectedSpanId = subspanID.split("_").slice(0, 4).join("_")
      } else if (selectionModel.entity.all().length == 1) {
        var entityID = selectionModel.entity.all()[0]
        previouslySelectedSpanId = annotationData.entity.get(entityID).span
      }

      selectionModel.clear()  

      create(editor, annotationData, command, typeContainer, spanAdjuster, isDetectDelimiterEnable, isReplicateAuto, isAddSubspan, data.selection, data.spanConfig, previouslySelectedSpanId)
      
    },
    expand: (data) => expand(editor, annotationData, selectionModel, command, spanAdjuster, data.selection, data.spanConfig),
    shrinkCrossTheEar: (data) => shrink.crossTheEar(editor, annotationData, selectionModel, command, spanAdjuster, data.selection, data.spanConfig),
    shrinkPullByTheEar: (data) => shrink.pullByTheEar(editor, annotationData, selectionModel, command, spanAdjuster, data.selection, data.spanConfig)
  }
}
