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

  // Check if the start is at the beginning of its node
  var beforeStart = (offsetInsideStartNode == 0)
  // Check if the end is at the end of its node
  var afterEnd = (offsetInsideEndNode == endNode.length)

  // Get the set of ancestors (parents, parents' parents, etc) up the DOM tree
  // for the two nodes (excluding themselvess)
  var startAncestors = getAncestors(startNode).slice(1)
  var endAncestors = getAncestors(endNode).slice(1)

  // Find the first common ancestor for the two DOM nodes
  var commonAncestor = _.intersection(startAncestors,endAncestors)[0]

  // Get the corresponding children of the common ancestor that lead to
  // the startNode and endNode
  var commonAncestor_startChild = startAncestors[startAncestors.indexOf(commonAncestor) - 1]
  var commonAncestor_endChild = endAncestors[endAncestors.indexOf(commonAncestor) - 1]

  // If either are null, replace with the start/endNode
  if (!commonAncestor_startChild)
    commonAncestor_startChild = startNode
  if (!commonAncestor_endChild)
    commonAncestor_endChild = endNode

  // Let's start creating the range, but with four possible cases
  let range = document.createRange()
  
  if (beforeStart & afterEnd) {
    // Case 1: We're starting before the start node and after the end node
    range.setStartBefore(commonAncestor_startChild)
    range.setEndAfter(commonAncestor_endChild)
  } else if (beforeStart) {
    // Case 2: Starting before the start node, but cutting into the end node
    range.setStartBefore(commonAncestor_startChild)
    if (endNode.parentNode != commonAncestor) {
      // In order to cut into a node, the start and end nodes must be on the same level in the DOM
      throw new Error("Cannot deal with annotation span that overlaps with another (or there is another error here that I didn't think of)")
    }
    range.setEnd(endNode, offsetInsideEndNode)
  } else if (afterEnd) {
    // Case 3: Cutting in the start node, and ending after the end node
    if (startNode.parentNode != commonAncestor) {
      // In order to cut into a node, the start and end nodes must be on the same level in the DOM
      throw new Error("Cannot deal with annotation span that overlaps with another (or there is another error here that I didn't think of)")
    }
    range.setStart(startNode, offsetInsideStartNode)
    range.setEndAfter(commonAncestor_endChild)
  } else {
    // Case 4: Cutting in the start node and end node
    if (startNode.parentNode != commonAncestor) {
      // In order to cut into a node, the start and end nodes must be on the same level in the DOM
      throw new Error("Cannot deal with annotation span that overlaps with another (or there is another error here that I didn't think of)")
    }
    if (endNode.parentNode != commonAncestor) {
      // In order to cut into a node, the start and end nodes must be on the same level in the DOM
      throw new Error("Cannot deal with annotation span that overlaps with another (or there is another error here that I didn't think of)")
    }
    range.setStart(startNode, offsetInsideStartNode)
    range.setEnd(endNode, offsetInsideEndNode)
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


// From: https://stackoverflow.com/questions/2453742/whats-the-best-way-to-find-the-first-common-parent-of-two-dom-nodes-in-javascri/2453832#2453832
// Get all the ancestors for a DOM node up to document
// (e.g. self, parent, parents' parent)
function getAncestors(node) {
  if (node != document) return [node].concat(getAncestors(node.parentNode));
  else return [node];
}

// Some code to define indexOf for arrays if it's missing
if (Array.prototype.indexOf === undefined) {
  Array.prototype.indexOf = function (element) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] == element) return i;
    }
    return -1;
  };
}
