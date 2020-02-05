import idFactory from '../../../idFactory'
import ModelContainer from './ModelContainer'
import _ from 'underscore'

// Expected an entity like {id: "E21", span: "editor2__S50_54", type: "Protein"}.
var toModel = function (editor, entity) {
  var newSpan = {};
  if (Array.isArray(entity.span)) {
    newSpan.ranges = entity.span;
    newSpan.firstBegin = Math.min.apply(null, _.map(entity.span, s => s.begin));
    newSpan.lastEnd = Math.max.apply(null, _.map(entity.span, s => s.end));
  } else {
    newSpan.ranges = [entity.span];
    newSpan.firstBegin = entity.span.begin;
    newSpan.lastEnd = entity.span.end;
  }

    return {
      id: entity.id,
      span: idFactory.makeSpanId(editor, newSpan),
      type: entity.obj,
    }
  },
  mappingFunction = function(editor, denotations) {
    denotations = denotations || []
    return denotations.map(_.partial(toModel, editor))
  },
  EntityContainer = function(editor, emitter, relation) {
    var entityContainer = new ModelContainer(
        emitter,
        'entity',
        _.partial(mappingFunction, editor),
        'T'
      ),
      add = _.compose(
        entityContainer.add,
        function(entity) {
          if (entity.span) return entity
          throw new Error('entity has no span! ' + JSON.stringify(entity))
        }
      ),
      assosicatedRelations = function(entityId) {
        return relation.all()
          .filter(function(r) {
            return r.obj === entityId || r.subj === entityId
          })
          .map(function(r) {
            return r.id
          })
      },
      api = _.extend(
        entityContainer, {
          add: add,
          assosicatedRelations: assosicatedRelations
        }
      )

    return api
  }

module.exports = EntityContainer
