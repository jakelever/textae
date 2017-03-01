import LesserMap from './LesserMap'
import _ from 'underscore'

export default function(entityModel) {
  // The chache for position of grids.
  // This is updated at arrange position of grids.
  // This is referenced at create or move relations.
  let map = new LesserMap()

  return _.extend(map, {
    isGridPrepared: entityId => isGridPrepared(entityModel, map, entityId)
  })
}

function isGridPrepared(entityModel, map, entityId) {
  let spanId = entityModel.get(entityId).span
  return map.get(spanId)
}
