import CursorChanger from '../../../util/CursorChanger'
import Selector from '../Selector'
import Hover from './Hover'
import AnnotationPosition from './AnnotationPosition'
import bindSelectionModelEvents from './bindSelectionModelEvents'
import updateTextBoxHeight from './updateTextBoxHeight'
import bindTypeGapEvents from './bindTypeGapEvents'
import bindAnnotaitonPositionEvents from './bindAnnotaitonPositionEvents'
import Renderer from './Renderer'

const BODY = `
<div class="textae-editor__body">
    <div class="textae-editor__body__annotation-box"></div>
    <div class="textae-editor__body__text-box"></div>
</div>
`

export default class {
  constructor(
    editor,
    annotationData,
    selectionModel,
    buttonStateHelper,
    typeGap,
    typeDefinition
  ) {
    // The editor itself has a "white-space: pre" style for processing text that contains a series of whitespace.
    // In this case, HTML line breaks are included in the editor's height calculation.
    // Remove CRLF so that it is not included in the height calculation.
    editor[0].innerHTML = BODY.replace(/[\n\r]+/g, '')

    bindSelectionModelEvents(
      selectionModel,
      new Selector(editor, annotationData),
      buttonStateHelper
    )

    const annotationPosition = new AnnotationPosition(editor, annotationData)
    bindTypeGapEvents(typeGap, editor, annotationData, annotationPosition)
    bindAnnotaitonPositionEvents(annotationPosition, new CursorChanger(editor))

    new Renderer(
      editor,
      annotationData,
      selectionModel,
      buttonStateHelper,
      typeDefinition,
      typeGap,
      annotationPosition
    )

    this._hoverRelation = new Hover(editor, annotationData.entity)
    this._editor = editor
    this._typeGap = typeGap
    this._annotationPosition = annotationPosition
  }

  get hoverRelation() {
    return this._hoverRelation
  }

  updateDisplay() {
    updateTextBoxHeight(this._editor[0])
    this._annotationPosition.update(this._typeGap())
  }
}
