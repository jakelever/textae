export {
  getBeginEnd,
  getAnchorPosition,
  getFocusPosition,
}

function getFocusPosition(annotationData, selection) {
  const position = getPosition(annotationData.paragraph, annotationData.span, selection.focusNode)

  return position + selection.focusOffset
}

function getAnchorPosition(annotationData, selection) {
  const position = getPosition(annotationData.paragraph, annotationData.span, selection.anchorNode)

  return position + selection.anchorOffset
}

function getBeginEnd(annotationData, selection) {
  const anchorPosition = getAnchorPosition(annotationData, selection),
    focusPosition = getFocusPosition(annotationData, selection)

  // switch the position when the selection is made from right to left
  if (anchorPosition > focusPosition) {
    return [focusPosition, anchorPosition]
  }

  return [anchorPosition, focusPosition]
}

function getPosition(paragraph, span, node) {
  return getParentModelBegin(paragraph, span, node) + getOffsetFromParent(node)
}

function getOffsetFromParent(node) {
  const childNodes = node.parentElement.childNodes

  let offset = 0
  for (let i = 0; childNodes[i] !== node; i++) { // until the focus node
    if (childNodes[i].nodeName === "#text") {
      offset += childNodes[i].nodeValue.length
    } else {
      offset += childNodes[i].textContent.length
    }
  }

  return offset
}

function getParentModelBegin(paragraph, span, node) {
  const parent = node.parentElement

  if (parent.classList.contains("textae-editor__body__text-box__paragraph")) {
    return paragraph.get(parent.id).begin
  }

  if (parent.classList.contains("textae-editor__span")) {
    var span_id = parent.id
    return span.get(span_id).firstBegin
  }

  if (parent.classList.contains("textae-editor__subspan")) {
    var span_id = parent.id.split('_').slice(0, 4).join('_')
    var split = parent.id.split('_')
    var subspan_index = parseInt(split[split.length-1].replace('s',''))
    return span.get(span_id).ranges[subspan_index].begin
  }

  throw new Error('Can not get position of a node : ' + node + ' ' + node.data)
}
