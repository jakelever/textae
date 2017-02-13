import getAnnotationBox from './getAnnotationBox'
import {
  getRightElement
}
from '../../getNextElement'

export default function(editor, domPositionCache) {
  let container = getAnnotationBox(editor)

  return {
    render: (spanId) => createGrid(editor[0], domPositionCache, container[0], spanId),
    remove: (spanId) => {
      let grid = document.querySelector(`#G${spanId}`)

      if (grid)
        grid.parentNode.removeChild(grid)

      domPositionCache.gridPositionCache.delete(spanId)
    }
  }
}

function createGrid(editorDom, domPositionCache, container, spanId) {
  let spanPosition = domPositionCache.getSpan(spanId),
    element = document.createElement('div')

  element.setAttribute('id', `G${spanId}`)
  element.classList.add('textae-editor__grid')
  element.classList.add('hidden')
  element.style.width = spanPosition.width + 'px'

  const rightGrid = getRightGrid(editorDom, spanId)
  if (rightGrid) {
    container.insertBefore(element, rightGrid)
  } else {
    // append to the annotation area.
    container.appendChild(element)
  }

  return element
}

// Block spans have no grid.
// Travers the next span if the right span is a block span.
function getRightGrid(editorDom, spanId) {
  let [rightSpan, grid] = getRightSpanAndGrid(editorDom, spanId)
  if (!rightSpan) {
    return null
  }

  if (grid) {
    return grid
  }

  while (rightSpan) {
    [rightSpan, grid] = getRightSpanAndGrid(editorDom, rightSpan.id)
    if (grid) {
      return grid
    }
  }
}

function getRightSpanAndGrid(editorDom, spanId) {
  const rightSpan = getRightElement(editorDom, document.querySelector(`#${spanId}`))
  if (!rightSpan) {
    return [null, null]
  }

  const grid = document.querySelector(`#G${rightSpan.id}`)
  if (grid) {
    return [rightSpan, grid]
  }

  return [rightSpan, null]
}
