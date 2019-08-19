import commandLog from './commandLog'
import AnnotationCommand from './AnnotationCommand'
import idFactory from '../../../idFactory'

export default class SpanMoveCommand extends AnnotationCommand {
  constructor(editor, annotationData, spanId, newSpan) {
    console.assert(
      spanId !== idFactory.makeSpanId(editor, newSpan),
      `Do not need move span:  ${spanId} ${newSpan}`
    )

    super()
    this.editor = editor
    this.annotationData = annotationData
    this.spanId = spanId
    this.newSpan = newSpan
  }

  execute() {
    // Update model
    const [oldSpan, newId] = this.annotationData.span.move(
      this.spanId,
      this.newSpan
    )

    this.oldSpan = oldSpan
    this.newId = newId

    commandLog(
      `move span: ${this.spanId} to {begin: ${this.newSpan.begin}, end: ${this.newSpan.end}}`
    )
  }

  revert() {
    return new SpanMoveCommand(
      this.editor,
      this.annotationData,
      this.newId,
      this.oldSpan
    )
  }
}
