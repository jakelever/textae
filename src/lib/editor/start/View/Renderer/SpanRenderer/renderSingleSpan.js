import createSpanElement from './createSpanElement'
import createSpanRange from './createSpanRange'
import _ from 'underscore'

export default function(span, bigBrother) {
  let targetRange = cerateRangeToSpan(span, bigBrother),
    spanElement = createSpanElement(span)


  targetRange.surroundContents(spanElement)

  _.each(span.ranges, function (r,i) {
    let range = document.createRange()
    let offset = span.lastEnd - spanElement.lastChild.length
    range.setStart(spanElement.lastChild, r.begin - offset)
    range.setEnd(spanElement.lastChild, r.end - offset)

    let element = document.createElement('span')
    element.setAttribute('id', span.id + '_s' + i)
    element.setAttribute('title', span.id)
    element.setAttribute('class', 'textae-editor__subspan')
    element.setAttribute('tabindex', 0)

    range.surroundContents(element)
  })
}

// Get the Range to that new span tag insert.
// This function works well when no child span is rendered.
function cerateRangeToSpan(span, bigBrother) {
  let targetTextNode,
    startOfTextNode

  // The parent of the bigBrother is same with of span, which is a span or the root of spanTree.
  if (bigBrother) {
    // The target text arrounded by span is in a textNode after the bigBrother if bigBrother exists.
    [targetTextNode, startOfTextNode] = getTextNodeFromBigBrother(bigBrother)
  } else {
    // The target text arrounded by span is the first child of parent unless bigBrother exists.
    [targetTextNode, startOfTextNode] = getTextNodeFromParent(span)
  }

  if (!targetTextNode)
    throw new Error('The textNode on to create a span is not found. ' + span.toStringOnlyThis())

  return createSpanRange(targetTextNode, startOfTextNode, span)
}

function getTextNodeFromBigBrother(bigBrother) {
  return [
    document.querySelector('#' + bigBrother.id).nextSibling,
    bigBrother.lastEnd
  ]
}

function getTextNodeFromParent(span) {
  let parentModel = getParentModel(span)

  if (_.has(parentModel,'begin')) {
    return [
      document.querySelector('#' + parentModel.id).firstChild,
      parentModel.begin
    ]
  } else if (_.has(parentModel, 'firstBegin')) {
    return [
      document.querySelector('#' + parentModel.id).firstChild,
      parentModel.firstBegin
    ]
  } else {
    throw new Error('oh dear')
  }
}

function getParentModel(span) {
  if (span.parent) {
    // This span is first child of parent span.
    return span.parent
  } else {
    // The parentElement is paragraph unless parent.
    return span.paragraph
  }
}
