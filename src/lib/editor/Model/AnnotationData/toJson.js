export default function(dataStore) {
  return {
    denotations: toDenotation(dataStore),
    attributions: toAttribution(dataStore),
    relations: toRelation(dataStore),
    modifications: dataStore.modification.all()
  }
}

function toDenotation(dataStore) {
  return dataStore.entity.all()
    // Span may be not exists, because crossing spans are not add to the dataStore.
    .filter((entity) => dataStore.span.get(entity.span))
    .map((entity) => {
      const currentSpan = dataStore.span.get(entity.span)

      if (currentSpan.ranges.length == 1) {

        return {
          id: entity.id,
          span: currentSpan.ranges[0],
          obj: entity.type
        }
      } else {
        return {
          id: entity.id,
          span: currentSpan.ranges,
          obj: entity.type
        }
      }
    })
}

function toAttribution(dataStore) {
  return dataStore.attribute.all().map((attribute) => {
    return {
      id: attribute.id,
      subj: attribute.subj,
      pred: attribute.pred,
      obj: attribute.value,
    }
  })
}

function toRelation(dataStore) {
  return dataStore.relation.all().map((r) => {
    return {
      id: r.id,
      pred: r.type,
      subj: r.subj,
      obj: r.obj
    }
  })
}
