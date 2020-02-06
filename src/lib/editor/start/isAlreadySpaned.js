export default function (allSpans, candidateSpan) {
  // TODO: Deal with subspans here in some way
  return allSpans.filter((existSpan) => {
    return existSpan.firstBegin === candidateSpan.firstBegin &&
      existSpan.lastEnd === candidateSpan.lastEnd
  }).length > 0
}
