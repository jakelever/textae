import arrangeGridPositionPromise from './arrangeGridPositionPromise'

export default function(
  domPositionCache,
  typeDefinition,
  annotationData,
  typeGap
) {
  return (
    annotationData.span.all
      // There is at least one type in span that has a grid.
      .filter((span) => span.hasTypes)
      .map((span) => {
        // Cache all span position because alternating between getting offset and setting offset.
        domPositionCache.getSpan(span.id)
        return span
      })
      .map((span) =>
        arrangeGridPositionPromise(
          domPositionCache,
          typeDefinition,
          annotationData,
          typeGap,
          span
        )
      )
  )
}
