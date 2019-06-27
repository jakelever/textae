import SelectEnd from '../../SelectEnd'
import SelectSpan from './SelectSpan'
import EditEntityHandler from './EditEntityHandler'
import init from './init'

export default function(editor, annotationData, selectionModel, command, modeAccordingToButton, typeContainer, spanConfig, cancelSelect) {
  const selectEnd = new SelectEnd(editor, annotationData, selectionModel, command, modeAccordingToButton, typeContainer)
  const selectSpan = new SelectSpan(editor, annotationData, selectionModel, typeContainer)

  const entityHandler = () => new EditEntityHandler(typeContainer, command, annotationData, selectionModel)

  return {
    init: () => init(editor, cancelSelect, selectEnd, spanConfig, selectSpan, selectionModel),
    entityHandler: entityHandler
  }
}
