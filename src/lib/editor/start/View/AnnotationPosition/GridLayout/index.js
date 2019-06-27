import DomPositionCache from '../../DomPositionCache'
import genArrangeAllGridPositionPromises from './genArrangeAllGridPositionPromises'
import arrangeGridPosition from './arrangeGridPosition'

// Management position of annotation components.
export default class {
  constructor(editor, annotationData, typeContainer) {
    this.editor = editor
    this.annotationData = annotationData
    this.typeContainer = typeContainer
    this.domPositionCache = new DomPositionCache(editor, annotationData.entity)
  }

  arrangePosition(typeGap) {
    this.domPositionCache.reset()

    // There is at least one type in span that has a grid.
    const targetSpans = this.annotationData.span.all().filter((span) => span.getTypes().length > 0)

    for (const span of targetSpans) {
      // Cache all span position because alternating between getting offset and setting offset.
      this.domPositionCache.getSpan(span.id)

      arrangeGridPosition(this.domPositionCache, this.typeContainer, this.annotationData, typeGap, span)
    }
  }

  arrangePositionAsync(typeGap) {
    this.domPositionCache.reset()

    return Promise.all(
      genArrangeAllGridPositionPromises(this.domPositionCache, this.typeContainer, this.annotationData, typeGap)
    )
  }
}