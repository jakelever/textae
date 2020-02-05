import createRange from './createRange'

export default function(textNode, startOfTextNode, span) {
  let offset = getOffset(span, startOfTextNode)

  if (!validateOffset(textNode, offset)) {
    throw new Error('oh my god! I cannot render this span. ' + span.toStringOnlyThis() + ', textNode ' + textNode.textContent)
  }

  return createRange(textNode, offset)
}

function getOffset(span, startOfTextNode) {
  let startOffset = span.firstBegin - startOfTextNode,
    endOffset = span.lastEnd - startOfTextNode

  return {
    start: startOffset,
    end: endOffset
  }
}

function validateOffset(textNode, offset) {
  return 0 <= offset.start && offset.end <= textNode.length
}
