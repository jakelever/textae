import create from './create'
import createAttributePopupEditorElement from './createAttributePopupEditorElement'

export default function(editor, annotationData, selectionModel, typeContainer, gridRenderer) {
  return {
    render: (attribute) => {
      create(
        editor,
        annotationData.namespace,
        typeContainer,
        gridRenderer,
        attribute
      )
    },
    change: (attribute) => changeAttributeElement(editor, typeContainer, attribute),
    changeModification: () => {},
    remove: (attribute) => removeAttributeElement(editor, attribute),
    updateLabel: () => {}
  }
}

function changeAttributeElement(editor, typeContainer, attribute) {
  const attributeDom = getAttributeDom(editor[0], attribute.id)

  if (attributeDom) {
    attributeDom.setAttribute('title', 'id: ' + attribute.id + ', pred: ' + attribute.pred + ', value: ' + attribute.value)
    attributeDom.setAttribute('type', attribute.value)
    attributeDom.setAttribute('pred', attribute.pred)
    attributeDom.innerText = attribute.value
    attributeDom.appendChild(createAttributePopupEditorElement(editor, typeContainer, attribute))
  }

  return null
}

function removeAttributeElement(editor, attribute) {
  const attributeDom = getAttributeDom(editor[0], attribute.id)

  if (attributeDom) {
    attributeDom.remove()
  }

  return null
}

function getAttributeDom(editor, attributeId) {
  return editor.querySelector(`[origin-id="${attributeId}"]`)
}
