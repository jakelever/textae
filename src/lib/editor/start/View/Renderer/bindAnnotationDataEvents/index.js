import renderParagraph from './renderParagraph'
import updateModificationButtons from './updateModificationButtons'
import renderModificationOfEntityOrRelation from './renderModificationOfEntityOrRelation'
import updateBlockStyleOfSpan from './updateBlockStyleOfSpan'
import renderAllAnnotations from './renderAllAnnotations'
import updateTextBoxHeight from '../../updateTextBoxHeight'
import setLineHeightToTypeGap from '../../setLineHeightToTypeGap'
import SpanRenderer from './SpanRenderer'

export default function(
  annotationData,
  editor,
  domPositionCache,
  relationRenderer,
  typeGap,
  debouncedUpdateAnnotationPosition,
  gridRenderer,
  entityRenderer,
  buttonStateHelper,
  annotationPosition
) {
  const spanRenderer = new SpanRenderer(annotationData, (entity) =>
    entityRenderer.render(entity)
  )

  annotationData
    .on('all.change', () => {
      renderAllAnnotations(
        editor,
        domPositionCache,
        annotationData,
        spanRenderer,
        relationRenderer
      )
      updateTextBoxHeight(editor[0])
      setLineHeightToTypeGap(editor[0], annotationData, typeGap())
      debouncedUpdateAnnotationPosition()
    })
    .on('paragraph.change', (paragraphs) => renderParagraph(editor, paragraphs))
    .on('span.add', (span) => {
      spanRenderer.render(span)
      // debouncedUpdateAnnotationPosition()
    })
    .on('span.move', () => {
      // Move grids and relations synchronously.
      // If grid and relations move asynchronously,
      // grid positions in cache may be deleted before render relation when moving span frequently.
      // Position of relation depends on position of grid and position of grid is cached for perfermance.
      // If position of grid is not cached, relation can not be rendered.
      annotationPosition.update(typeGap())
    })
    .on('span.remove', (span) => {
      spanRenderer.remove(span)
      gridRenderer.remove(span.id)
      // debouncedUpdateAnnotationPosition()
    })
    .on('entity.add', (entity) => {
      // Add a now entity with a new grid after the span moved.
      updateBlockStyleOfSpan(annotationData, entity, spanRenderer)
      entityRenderer.render(entity)
      debouncedUpdateAnnotationPosition()
    })
    .on('entity.change', (entity) => {
      entityRenderer.change(entity)
      updateBlockStyleOfSpan(annotationData, entity, spanRenderer)
      gridRenderer.updateWidth(entity.span)
      debouncedUpdateAnnotationPosition()
    })
    .on('entity.remove', (entity) => {
      entityRenderer.remove(entity)
      updateBlockStyleOfSpan(annotationData, entity, spanRenderer)
      debouncedUpdateAnnotationPosition()
    })
    .on('relation.add', (relation) => {
      relationRenderer.render(relation)
      debouncedUpdateAnnotationPosition()
    })
    .on('relation.change', (relation) => {
      relationRenderer.change(relation)
    })
    .on('relation.remove', (relation) => {
      relationRenderer.remove(relation)
    })
    .on('modification.add', (modification) => {
      renderModificationOfEntityOrRelation(
        annotationData,
        modification,
        entityRenderer,
        relationRenderer
      )
      updateModificationButtons(annotationData, modification, buttonStateHelper)
    })
    .on('modification.remove', (modification) => {
      renderModificationOfEntityOrRelation(
        annotationData,
        modification,
        entityRenderer,
        relationRenderer
      )
      updateModificationButtons(annotationData, modification, buttonStateHelper)
    })
}
