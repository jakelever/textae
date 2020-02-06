import createSpanElement from './createSpanElement'
import createSpanRange from './createSpanRange'
import _ from 'underscore'

export default function(span, bigBrother) {

  var baseNode = document.querySelector('#' + span.paragraph.id)

  /*var targetRange = document.createRange()
  var startNode, offsetInsideStartNode
  [startNode, offsetInsideStartNode] = getNodeFromOffset(baseNode, span.firstBegin)
  targetRange.setStart(startNode, offsetInsideStartNode)

  var endNode, offsetInsideEndNode
  [endNode, offsetInsideEndNode] = getNodeFromOffset(baseNode, span.lastEnd)
  targetRange.setEnd(endNode, offsetInsideEndNode)*/

  var rangeStart = span.firstBegin - span.paragraph.begin;
  var rangeEnd = span.lastEnd - span.paragraph.begin;

  if (rangeStart < 0 || rangeStart > span.paragraph.text.length) {
    throw new Error('Trying to create a span that is outside the provided paragraph')
  } else if (rangeEnd < 0 || rangeEnd > span.paragraph.text.length) {
    throw new Error('Trying to create a span that is outside the provided paragraph')
  } 

  var targetRange = anotherCreateRange(baseNode, rangeStart, rangeEnd)

    //let targetRange = cerateRangeToSpan(span, bigBrother)
 
  var spanElement = createSpanElement(span)

  targetRange.surroundContents(spanElement)

  _.each(span.ranges, function (r, i) {
    //let range = document.createRange()
    let offset = span.lastEnd - spanElement.textContent.length

    /*var startNode, offsetInsideStartNode
    [startNode, offsetInsideStartNode] = getNodeFromOffset(spanElement, r.begin - offset)
    range.setStart(startNode, offsetInsideStartNode)

    var endNode, offsetInsideEndNode
    [endNode, offsetInsideEndNode] = getNodeFromOffset(spanElement, r.end - offset)
    range.setEnd(endNode, offsetInsideEndNode)*/


    var range = anotherCreateRange(spanElement, r.begin - offset, r.end - offset)

    let element = document.createElement('span')
    element.setAttribute('id', span.id + '_s' + i)
    element.setAttribute('title', span.id)
    element.setAttribute('class', 'textae-editor__subspan')
    element.setAttribute('tabindex', 0)

    range.surroundContents(element)
  })

  
}

function anotherCreateRange(baseNode, begin, end) {
  var startNode, offsetInsideStartNode
  [startNode, offsetInsideStartNode] = getNodeFromOffset(baseNode, begin)

  var endNode, offsetInsideEndNode
  [endNode, offsetInsideEndNode] = getNodeFromOffset(baseNode, end)

  var beforeStart = (offsetInsideStartNode == 0)
  var afterEnd = (offsetInsideEndNode == endNode.length)

  //var commonAncestor = findFirstCommonAncestor(startNode, endNode)
  var startAncestors = getAncestors(startNode).slice(1)
  var endAncestors = getAncestors(endNode).slice(1)

  var commonAncestor = _.intersection(startAncestors,endAncestors)[0]

  var commonAncestor_startChild = startAncestors[startAncestors.indexOf(commonAncestor) - 1]
  var commonAncestor_endChild = endAncestors[endAncestors.indexOf(commonAncestor) - 1]

  if (!commonAncestor_startChild)
    commonAncestor_startChild = startNode
  if (!commonAncestor_endChild)
    commonAncestor_endChild = endNode

  let range = document.createRange()
  if (beforeStart & afterEnd) {
    range.setStartBefore(commonAncestor_startChild)
    range.setEndAfter(commonAncestor_endChild)
  } else if (beforeStart) {
    range.setStartBefore(commonAncestor_startChild)
    if (endNode.parentNode != commonAncestor) {
      throw new Error("Cannot deal with annotation span that overlaps with another (or there is another error here that I didn't think of)")
    }
    range.setEnd(endNode, offsetInsideEndNode)
  } else if (afterEnd) {
    if (startNode.parentNode != commonAncestor) {
      throw new Error("Cannot deal with annotation span that overlaps with another (or there is another error here that I didn't think of)")
    }
    range.setStart(startNode, offsetInsideStartNode)
    range.setEndAfter(commonAncestor_endChild)
  } else {
    if (startNode.parentNode != commonAncestor) {
      throw new Error("Cannot deal with annotation span that overlaps with another (or there is another error here that I didn't think of)")
    }
    if (endNode.parentNode != commonAncestor) {
      throw new Error("Cannot deal with annotation span that overlaps with another (or there is another error here that I didn't think of)")
    }
    range.setStart(startNode, offsetInsideStartNode)
    range.setEnd(endNode, offsetInsideEndNode)
  }

  //range.setStart(startNode, offsetInsideStartNode)
  //range.setEnd(endNode, offsetInsideEndNode)

  return range
}



function getNodeFromOffset(startNode, offset) {
  var curNode = startNode
  var found = false

  while (!found) {
    if (curNode.nodeType == curNode.TEXT_NODE) {
      if (offset <= curNode.length) {
        found = true
        break
      } else {
        offset -= curNode.length
      }
    }

    // Children
    if (curNode.firstChild)
      curNode = curNode.firstChild
    // Siblings and uncles, etc
    else if (curNode.nextSibling)
      curNode = curNode.nextSibling
    else if (curNode.parentNode.nextSibling)
      curNode = curNode.parentNode.nextSibling
    else if (curNode.parentNode.parentNode.nextSibling)
      curNode = curNode.parentNode.parentNode.nextSibling
    else if (curNode.parentNode.parentNode.parentNode.nextSibling)
      curNode = curNode.parentNode.parentNode.parentNode.nextSibling
    else if (curNode.parentNode.parentNode.parentNode.parentNode.nextSibling)
      curNode = curNode.parentNode.parentNode.parentNode.parentNode.nextSibling

  }

  return [curNode,offset]
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




// From: https://stackoverflow.com/questions/2453742/whats-the-best-way-to-find-the-first-common-parent-of-two-dom-nodes-in-javascri/2453832#2453832

function findFirstCommonAncestor(nodeA, nodeB, ancestorsB) {
  var ancestorsB = ancestorsB || getAncestors(nodeB);
  if (ancestorsB.length == 0) return null;
  else if (ancestorsB.indexOf(nodeA) > -1) return nodeA;
  else if (nodeA == document) return null;
  else return findFirstCommonAncestor(nodeA.parentNode, nodeB, ancestorsB);
}

function getAncestors(node) {
  if (node != document) return [node].concat(getAncestors(node.parentNode));
  else return [node];
}

if (Array.prototype.indexOf === undefined) {
  Array.prototype.indexOf = function (element) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] == element) return i;
    }
    return -1;
  };
}