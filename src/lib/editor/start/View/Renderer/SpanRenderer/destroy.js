import _ from 'underscore'

export default function (span) {
  _.map(span.ranges, (r, i) => destroySpanDOMNode(span.id + '_s' + i))

  destroySpanDOMNode(span.id)
}

function destroySpanDOMNode(nodeId) {
  var spanElement = document.querySelector('#' + nodeId),
    parent = spanElement.parentNode

  // Move the textNode wrapped this span in front of this span.
  while (spanElement.firstChild) {
    parent.insertBefore(spanElement.firstChild, spanElement)
  }

  parent.removeChild(spanElement)
  parent.normalize()
}