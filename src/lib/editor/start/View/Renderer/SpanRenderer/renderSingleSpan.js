import createSpanElement from './createSpanElement'
import _ from 'underscore'

export default function (span) {
  // Get the paragraph for the span and calculate the offsets into the span
  var paragraphNode = document.querySelector('#' + span.paragraph.id)
  var rangeStart = span.firstBegin - span.paragraph.begin;
  var rangeEnd = span.lastEnd - span.paragraph.begin;

  // Do some checks to make sure the span is inside this paragraph
  if (rangeStart < 0 || rangeStart > span.paragraph.text.length) {
    throw new Error('Trying to create a span that is outside the provided paragraph')
  } else if (rangeEnd < 0 || rangeEnd > span.paragraph.text.length) {
    throw new Error('Trying to create a span that is outside the provided paragraph')
  } 

  // Create a DOM Range object that spans the appropriate bit of text. A little trickier than it sounds
  var targetRange = createRange(paragraphNode, rangeStart, rangeEnd)

  // Create the span element for the whole span (no subspans yet) and inside it into the range
  var spanElement = createSpanElement(span)
  targetRange.surroundContents(spanElement)

  // Now put in the subspan elements
  _.each(span.ranges, function (r, i) {
    // Adjust the offset to be within the span and create the range
    let offset = span.lastEnd - spanElement.textContent.length
    var range = createRange(spanElement, r.begin - offset, r.end - offset)

    // Create the span DOM element for the subspan
    let element = document.createElement('span')
    element.setAttribute('id', span.id + '_s' + i)
    element.setAttribute('title', span.id)
    element.setAttribute('class', 'textae-editor__subspan')
    element.setAttribute('tabindex', 0)

    // And add it to the document
    range.surroundContents(element)
  })

}

// Given a DOM node, create a range with two offsets from it.
// This may require navigate around the DOM past the current node
// to find the text nodes containing the start and end locations
function createRange(baseNode, begin, end) {
  // Find the node that contains the start location and offset into it
  var startNode, offsetInsideStartNode
  [startNode, offsetInsideStartNode] = getNodeFromOffset(baseNode, begin)

  // Find the node that contains the end location and offset into it
  var endNode, offsetInsideEndNode
  [endNode, offsetInsideEndNode] = getNodeFromOffset(baseNode, end)

  // Check if the start is at the end of its node
  var beforeStart = (offsetInsideStartNode == 0)
  var afterStart = (offsetInsideStartNode == startNode.length)
  // Check if the end is at the end of its node
  var beforeEnd = (offsetInsideEndNode == 0)
  var afterEnd = (offsetInsideEndNode == endNode.length)

  // We need to find all possible locations that the start offset can be at.
  // If it's at the end of a text node, it could also be at the end of other nodes
  // or the beginning of others
  var startOptions = [[startNode, offsetInsideStartNode]]
  if (beforeStart) {
    var startExtension = extendLeft(startNode)
    startOptions.push(...startExtension)
  } else if (afterStart) {
    var startExtension = extendRight(startNode)
    startOptions.push(...startExtension)
  }

  // And do the same for the locations for the end offset
  var endOptions = [[endNode, offsetInsideEndNode]]
  if (beforeEnd) {
    var endExtension = extendLeft(endNode)
    endOptions.push(...endExtension)
  } else if (afterEnd) {
    var endExtension = extendRight(endNode)
    endOptions.push(...endExtension)
  }

  // Now we check all pairs of offset locations to find ones that are valid (e.g. at the
  // same level in the DOM tree)
  var validPairs = []
  for (var i = 0; i < startOptions.length; i++) {
    for (var j = 0; j < endOptions.length; j++) {
      if (startOptions[i][0].parentNode == endOptions[j][0].parentNode) {
        validPairs.push([startOptions[i][0], startOptions[i][1], endOptions[j][0], endOptions[j][1]])
      }
    }
  }

  if (validPairs.length == 0) {
    throw new Error("Could not find a valid way to render a span. Cannot deal with annotation span that overlaps with another")
  }

  // Now we pick the first valid one
  var adjStartNode, adjStartOffset, adjEndNode, adjEndOffset
  [adjStartNode, adjStartOffset, adjEndNode, adjEndOffset] = validPairs[0]

  // Let's start creating the range
  let range = document.createRange()

  // Set the start offset location depending on whether it's at the end of the given node
  if (adjStartOffset == 0) {
    range.setStartBefore(adjStartNode)
  } else if (adjStartOffset == adjStartNode.textContent.length) {
    range.setStartAfter(adjStartNode)
  } else {
    range.setStart(adjStartNode, adjStartOffset)
  }

  // Set the end offset location depending on whether it's at the end of the given node
  if (adjEndOffset == 0) {
    range.setEndBefore(adjEndNode)
  } else if (adjEndOffset == adjEndNode.textContent.length) {
    range.setEndAfter(adjEndNode)
  } else {
    range.setEnd(adjEndNode, adjEndOffset)
  }

  return range
}

// Navigate through the DOM tree to find the node containing text
// given a text offset from a starting node.
function getNodeFromOffset(curNode, offset) {
  var found = false

  // Loop until we find a text node that has enough text to contain the remaining amount of offset
  while (!found) {
    if (curNode.nodeType == curNode.TEXT_NODE) {
      if (offset <= curNode.length) {
        // We've found a text node that has enough text to contain the offset location
        found = true
        break
      } else {
        // We've found a text node but the offset isn't here.
        // We subtract the text length that we've found and will continue looking.
        offset -= curNode.length
      }
    }

    // We're going to navigate through the DOM tree
    if (curNode.firstChild) {
      // First we will check children and navigate down the tree
      curNode = curNode.firstChild
    } else {
      // And if there are no children, we will navigate across or up the tree using this
      // function to find a sibling, or parent sibling, or parents' parent sibling, etc.
      // It returns null if it gets up to the DOM root and can't find a text node that
      // contains the offset
      var nextSibling = getNextSiblingAcrossTree(curNode)
      if (nextSibling) {
        curNode = nextSibling
      } else {
        throw new Error('Unable to find text node that is an offset from a given node')
      }
    }
  }

  // We pass back the node, with the remaining offset into this node.
  return [curNode,offset]
}

// For a node, find a next sibling in the node or in its parents up the tree
function getNextSiblingAcrossTree(node) {
  while (!node.nextSibling) {
    if (node.parent == document)
      return null;
    else
      node = node.parentNode
  }
  return node.nextSibling
}

// For a text offset at the end of a text node, we need to find all
// possible other locations that represent the same offset. These could be
// the end of nodes further up the tree, or the beginning of other nodes
// across the tree (assuming there is no text in between)
function extendRight(node) {
  var extension = []

  // We first move up the tree and gather any nodes that "contain" the offset
  // as the end of the node
  var seniorParent = node
  while (isFinalNonEmptyChild(seniorParent)) {
    seniorParent = seniorParent.parentNode
    extension.push( [seniorParent,seniorParent.textContent.length] )
  }

  // Next we'll move to the next sibling of the final parent we moved
  // up the tree to and start going back down the tree, collecting
  // all nodes that represent the offset at the beginning of the node
  var uncle = getNextNonEmptySibling(seniorParent)

  var child = uncle
  while (child) {
    extension.push( [child,0] )
    child = getFirstNonEmptyChild(child)
  }

  return extension
}

function extendLeft(node) {
  var extension = []

  // We first move up the tree and gather any nodes that "contain" the offset
  // as the beginning of the node
  var seniorParent = node
  while (isFirstNonEmptyChild(seniorParent)) {
    seniorParent = seniorParent.parentNode
    extension.push([seniorParent, 0])
  }

  // Next we'll move to the previous sibling of the final parent we moved
  // up the tree to and start going back down the tree, collecting
  // all nodes that represent the offset at the end of the node
  var uncle = getPrevNonEmptySibling(seniorParent)

  var child = uncle
  while (child) {
    extension.push([child, 0])
    child = getLastNonEmptyChild(child)
  }

  return extension
}


function getNextNonEmptySibling(node) {
  var sibling = node.nextSibling
  while (sibling) {
    if (sibling.textContent.length > 0)
      return sibling
    sibling = node.nextSibling
  }
  return sibling
}

function getFirstNonEmptyChild(node) {
  if (node.firstChild) {
    if (node.firstChild.textContent.length > 0) {
        return node.firstChild
    } else {
      return getNextNonEmptySibling(node.firstChild)
    }
  } else {
    return null
  }
}

function isFinalNonEmptyChild(node) {
  var sibling = getNextNonEmptySibling(node)
  return sibling == null
}



function getPrevNonEmptySibling(node) {
  var sibling = node.previousSibling
  while (sibling) {
    if (sibling.textContent.length > 0)
      return sibling
    sibling = node.previousSibling
  }
  return sibling
}

function getLastNonEmptyChild(node) {
  if (node.lastChild) {
    if (node.lastChild.textContent.length > 0) {
      return node.lastChild
    } else {
      return getPrevNonEmptySibling(node.lastChild)
    }
  } else {
    return null
  }
}

function isFirstNonEmptyChild(node) {
  var sibling = getPrevNonEmptySibling(node)
  return sibling == null
}

