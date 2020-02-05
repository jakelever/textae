// A span its range is coross over with other spans are not able to rendered.
// Because spans are renderd with span tag. Html tags can not be cross over.
export default function(spans, candidateSpan) {
  return spans
    .filter(existSpan => isBoundaryCrossing(candidateSpan, existSpan))
    .length > 0
}

function isBoundaryCrossing(candidateSpan, existSpan) {
  let isStartOfCandidateSpanBetweenExistsSpan = existSpan.firstBegin < candidateSpan.firstBegin &&
    candidateSpan.firstBegin < existSpan.lastEnd &&
    existSpan.lastEnd < candidateSpan.lastEnd,
    isEndOfCandidateSpanBetweenExistSpan = candidateSpan.firstBegin < existSpan.firstBegin &&
      existSpan.firstBegin < candidateSpan.lastEnd &&
      candidateSpan.lastEnd < existSpan.lastEnd


  return isStartOfCandidateSpanBetweenExistsSpan || isEndOfCandidateSpanBetweenExistSpan
}
