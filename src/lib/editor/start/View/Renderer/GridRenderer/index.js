import getAnnotationBox from '../getAnnotationBox'
import createGrid from './createGrid'

export default function(editor, domPositionCache) {
  const container = getAnnotationBox(editor)

  return {
    render: (spanId) => createGrid(editor[0], domPositionCache, container[0], spanId),
    remove: (spanId) => {
      const gridElement = getGridElement(spanId)

      if (gridElement)
        gridElement.parentNode.removeChild(gridElement)

      domPositionCache.gridPositionCache.delete(spanId)
    },
    changeId: ({oldId, newId}) => {
      const gridElement = getGridElement(oldId)

      // Since block span has no grid, there may not be a grid.
      if (gridElement) {
        gridElement.setAttribute('id', `G${newId}`)

        for (const type of gridElement.querySelectorAll('.textae-editor__type, .textae-editor__entity-pane')) {
          type.setAttribute('id', type.getAttribute('id').replace(oldId, newId))
        }

        adaptWidthToSpan(gridElement, domPositionCache, newId)
      }

      domPositionCache.gridPositionCache.delete(oldId)
    },
    updateWidth(spanId) {
      const gridElement = getGridElement(spanId)

      // Since block span has no grid, there may not be a grid.
      if (gridElement) {
        adaptWidthToSpan(gridElement, domPositionCache, spanId)
      }
    }
  }
}

function adaptWidthToSpan(gridElement, domPositionCache, spanId) {
  domPositionCache.reset()
  const spanPosition = domPositionCache.getSpan(spanId)

  gridElement.style.width = spanPosition.width + 'px'
}

function getGridElement(spanId) {
  return document.querySelector(`#G${spanId}`)
}

