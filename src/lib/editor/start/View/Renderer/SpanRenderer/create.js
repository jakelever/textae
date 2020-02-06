import renderSingleSpan from './renderSingleSpan'
import renderClassOfSpan from './renderClassOfSpan'
import renderEntitiesOfSpan from './renderEntitiesOfSpan'
import renderAttributesOfSpan from './renderAttributesOfSpan'
import destroyChildrenSpan from './destroyChildrenSpan'

export default create

// Destroy children spans to wrap a TextNode with <span> tag when new span over exists spans.
function create(span, annotationData, isBlockFunc, renderEntityFunc, renderAttributeFunc) {
  destroyChildrenSpan(span)

  renderSingleSpan(span)

  renderClassOfSpan(
      span,
      isBlockFunc
  )

  renderEntitiesOfSpan(
      span,
      annotationData.entity.get,
      renderEntityFunc
  )

  renderChildresnSpan(
      span,
      span => create(span, annotationData, isBlockFunc, renderEntityFunc, renderAttributeFunc)
  )
}

function renderChildresnSpan(span, create) {
  span.children
      .forEach(create)

  return span
}
