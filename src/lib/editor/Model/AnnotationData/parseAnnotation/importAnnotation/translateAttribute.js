let setIdPrefixIfExist = require('./setIdPrefixIfExist')
import _ from 'underscore'

// Expected denotations is an Array of object like { "id": "A1", "subj": "T1", "pred": "example_predicate_1", "obj": "attr1" }.
export default function(prefix, src) {
  prefix = prefix || ''
  return _.extend({}, src, {
    id: setIdPrefixIfExist(src, prefix),
    subj: prefix + src.subj,
    obj: prefix + src.obj
  })
}
