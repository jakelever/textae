import create from './create'
import destroy from './destroy'
import renderClassOfSpan from './renderClassOfSpan'

export default function(annotationData, isBlockFunc, renderEntityFunc, renderAttributeFunc) {
  return {
    render: span => create(
        span,
        annotationData,
        isBlockFunc,
        renderEntityFunc,
        renderAttributeFunc
    ),
    remove: span => destroy(span),
    change: span => renderClassOfSpan(span, isBlockFunc)
  }
}
