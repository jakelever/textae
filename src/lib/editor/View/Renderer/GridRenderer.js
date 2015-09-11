import getAnnotationBox from './getAnnotationBox'

export default function(editor, domPositionCache) {
  let container = getAnnotationBox(editor)

  return {
    render: (spanId) => createGrid(domPositionCache, container, spanId),
    remove: (spanId) => {
      $(document.querySelector(`#G${spanId}`)).remove()
      domPositionCache.gridPositionCache.delete(spanId)
    }
  }
}

function createGrid(domPositionCache, container, spanId) {
  let spanPosition = domPositionCache.getSpan(spanId),
    element = document.createElement('div')

  element.setAttribute('id', `G${spanId}`)
  element.classList.add('textae-editor__grid')
  element.classList.add('hidden')
  element.style.width = spanPosition.width + 'px'

  //append to the annotation area.
  container.append(element)

  return element
}
