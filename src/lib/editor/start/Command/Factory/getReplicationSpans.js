import not from 'not'
import isAlreadySpaned from '../../isAlreadySpaned'
import {
  isBoundaryCrossingWithOtherSpans as isBoundaryCrossingWithOtherSpans
}
from '../../../Model/AnnotationData/parseAnnotation/validateAnnotation'
import _ from 'underscore'

// Check replications are word or not if spanConfig is set.
export default function(dataStore, originSpan, detectBoundaryFunc) {
  let allSpans = dataStore.span.all(),
    wordFilter = detectBoundaryFunc ?
    _.partial(isWord, dataStore.sourceDoc, detectBoundaryFunc) :
    _.identity

  return getSpansTheirStringIsSameWith(dataStore.sourceDoc, originSpan)
    .filter(span =>
      // The candidateSpan is a same span when begin is same.
      // Because string of each others are same. End of them are same too.
      span.firstBegin !== originSpan.firstBegin
    )
    .filter(wordFilter)
    .filter(
      not(
        _.partial(isAlreadySpaned, allSpans)
      )
    )
    .filter(
      not(
        _.partial(isBoundaryCrossingWithOtherSpans, allSpans)
      )
    )
}

// Get spans their stirng is same with the originSpan from sourceDoc.
function getSpansTheirStringIsSameWith(sourceDoc, originSpan) {
  let findStrings = []

  // Replication only works on spans with a single subspan.
  // So no non - contigious entities can be replicated!
  if (originSpan.ranges.length == 1) {
    let getNextStringIndex = String.prototype.indexOf.bind(
      sourceDoc,
      sourceDoc.substring(originSpan.firstBegin, originSpan.lastEnd)
    ),
      length = originSpan.lastEnd - originSpan.firstBegin,
      offset = 0

    for (let index = getNextStringIndex(offset); index !== -1; index = getNextStringIndex(offset)) {
      findStrings.push({
        firstBegin: index,
        lastEnd: index + length,
        ranges: [{ begin: index, end: index + length}]
      })

      offset = index + length
    }
  }

  return findStrings
}

// The preceding charactor and the following of a word charactor are delimiter.
// For example, 't' ,a part of 'that', is not same with an origin span when it is 't'.
function isWord(sourceDoc, detectBoundaryFunc, candidateSpan) {
  let precedingChar = sourceDoc.charAt(candidateSpan.firstBegin - 1),
    followingChar = sourceDoc.charAt(candidateSpan.lastEnd)

  return detectBoundaryFunc(precedingChar) && detectBoundaryFunc(followingChar)
}
