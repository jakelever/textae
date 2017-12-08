import ModificationRenderer from '../ModificationRenderer'
import getAnnotationBox from '../getAnnotationBox'
import DomPositionCache from '../../DomPositionCache'
import Connect from './Connect'
import arrangePositionAll from './arrangePositionAll'
import determineCurviness from './determineCurviness'
import jsPlumbArrowOverlayUtil from './jsPlumbArrowOverlayUtil'
import getEntityDom from '../../../getEntityDom'
import makeJsPlumbInstance from './makeJsPlumbInstance'
import LabelOverlay from './LabelOverlay'
import LABEL from './LABEL'
import _ from 'underscore'
import $ from 'jquery'

const POINTUP_LINE_WIDTH = 3

module.exports = function(editor, annotationData, selectionModel, typeContainer) {
  // Init a jsPlumb instance.
  const modification = new ModificationRenderer(annotationData),
    domPositionCaChe = new DomPositionCache(editor, annotationData.entity),
    ConnectorStrokeStyle = function() {
      const converseHEXinotRGBA = function(color, opacity) {
        const c = color.slice(1),
          r = parseInt(c.substr(0, 2), 16),
          g = parseInt(c.substr(2, 2), 16),
          b = parseInt(c.substr(4, 2), 16)

        return 'rgba(' + r + ', ' + g + ', ' + b + ', 1)'
      }

      return function(relationId) {
        const type = annotationData.relation.get(relationId).type,
          colorHex = typeContainer.relation.getColor(type)

        return {
          lineWidth: 1,
          strokeStyle: converseHEXinotRGBA(colorHex, 1)
        }
      }
    }(),
    // Cache a connect instance.
    cache = function(connect) {
      const relationId = connect.relationId
      const domPositionCaChe = new DomPositionCache(editor, annotationData.entity)
      domPositionCaChe.connectCache.set(relationId, connect)

      return connect
    },
    isGridPrepared = function(relationId) {
      if (!annotationData.relation.get(relationId))
        return undefined

      const domPositionCaChe = new DomPositionCache(editor, annotationData.entity),
        relation = annotationData.relation.get(relationId)

      return domPositionCaChe.gridPositionCache.isGridPrepared(relation.subj) &&
        domPositionCaChe.gridPositionCache.isGridPrepared(relation.obj)
    },
    filterGridExists = function(connect) {
      // The grid may be destroyed when the spans was moved repetitively by undo or redo.
      if (!isGridPrepared(connect.relationId)) {
        return undefined
      }
      return connect
    },
    render = function() {
      const deleteRender = function(relation) {
          delete relation.render
          return relation
        },
        createJsPlumbConnect = function(relation) {
          // Make a connect by jsPlumb.
          return jsPlumbInstance.connect({
            source: $(getEntityDom(editor[0], relation.subj)),
            target: $(getEntityDom(editor[0], relation.obj)),
            anchors: ['TopCenter', "TopCenter"],
            connector: ['Bezier', {
              curviness: determineCurviness(editor, annotationData, relation)
            }],
            paintStyle: new ConnectorStrokeStyle(relation.id),
            parameters: {
              id: relation.id,
            },
            cssClass: 'textae-editor__relation',
            overlays: [
              ['Arrow', jsPlumbArrowOverlayUtil.NORMAL_ARROW],
              ['Label', _.extend({}, LABEL, {
                label: '[' + relation.id + '] ' + relation.type,
                cssClass: LABEL.cssClass + ' ' + modification.getClasses(relation.id).join(' ')
              })]
            ]
          })
        },
        create = function(relation) {
          return _.extend(createJsPlumbConnect(relation), {
            relationId: relation.id
          })
        },
        extendPointup = function() {
          const Pointupable = function() {
            const hoverupLabel = function(connect) {
                new LabelOverlay(connect).addClass('hover')
                return connect
              },
              hoverdownLabel = function(connect) {
                new LabelOverlay(connect).removeClass('hover')
                return connect
              },
              selectLabel = function(connect) {
                new LabelOverlay(connect).addClass('ui-selected')
                return connect
              },
              deselectLabel = function(connect) {
                new LabelOverlay(connect).removeClass('ui-selected')
                return connect
              },
              hoverupLine = function(connect) {
                connect.addClass('hover')
                return connect
              },
              hoverdownLine = function(connect) {
                connect.removeClass('hover')
                return connect
              },
              selectLine = function(connect) {
                connect.addClass('ui-selected')

                // Before creation of e a relation the souce entity is selected. And that entity is deselected at that relation creation.
                // When entities or spans is deselected thier HTML element is blured.
                // Focus the editor manually to prevent the editor lose focus and lose capability of keyboard shortcut.
                editor.focus()
                return connect
              },
              deselectLine = function(connect) {
                connect.removeClass('ui-selected')
                return connect
              },
              hasClass = function(connect, className) {
                return connect.connector.canvas.classList.contains(className)
              },
              unless = function(connect, predicate, func) {
                // Evaluate lazily to use with _.delay.
                return function() {
                  if (!predicate(connect)) func(connect)
                }
              },
              pointupLine = function(getStrokeStyle, connect) {
                connect.setPaintStyle(_.extend(getStrokeStyle(), {
                  lineWidth: POINTUP_LINE_WIDTH
                }))
                return connect
              },
              pointdownLine = function(getStrokeStyle, connect) {
                connect.setPaintStyle(getStrokeStyle())
                return connect
              }

            return function(relationId, connect) {
              const getStrokeStyle = _.partial(ConnectorStrokeStyle, relationId),
                pointupLineColor = _.partial(pointupLine, getStrokeStyle),
                pointdownLineColor = _.partial(pointdownLine, getStrokeStyle),
                unlessSelect = _.partial(unless, connect, function(connect) {
                  return hasClass(connect, 'ui-selected')
                }),
                unlessDead = _.partial(unless, connect, function(connect) {
                  return connect.dead
                }),
                hoverup = _.compose(
                  hoverupLine,
                  hoverupLabel,
                  pointupLineColor,
                  jsPlumbArrowOverlayUtil.showBigArrow
                ),
                hoverdown = _.compose(
                  hoverdownLine,
                  hoverdownLabel,
                  pointdownLineColor,
                  jsPlumbArrowOverlayUtil.hideBigArrow
                ),
                select = _.compose(
                  selectLine,
                  selectLabel,
                  hoverdownLine,
                  hoverdownLabel,
                  pointupLineColor,
                  jsPlumbArrowOverlayUtil.showBigArrow
                ),
                deselect = _.compose(
                  deselectLine,
                  deselectLabel,
                  pointdownLineColor,
                  jsPlumbArrowOverlayUtil.hideBigArrow
                )

              return {
                pointup: unlessSelect(hoverup),
                pointdown: unlessSelect(hoverdown),
                select: unlessDead(select),
                deselect: unlessDead(deselect)
              }
            }
          }()

          return function(connect) {
            const relationId = connect.relationId
            return _.extend(
              connect,
              new Pointupable(relationId, connect)
            )
          }
        }(),
        // Set hover action.
        hoverize = function() {
          const bindHoverAction = function(jsPlumbElement, onMouseOver, onMouseRemove) {
              jsPlumbElement.bind('mouseenter', onMouseOver).bind('mouseexit', onMouseRemove)
            },
            pointup = function(connect) {
              connect.pointup()
            },
            pointdown = function(connect) {
              connect.pointdown()
            },
            toComponent = function(label) {
              return label.component
            },
            bindConnect = function(connect) {
              bindHoverAction(connect, pointup, pointdown)
              return connect
            },
            bindLabel = function(connect) {
              bindHoverAction(
                new LabelOverlay(connect),
                _.compose(pointup, toComponent),
                _.compose(pointdown, toComponent)
              )
              return connect
            }

          return _.compose(bindLabel, bindConnect)
        }(),
        extendApi = function() {
          // Extend module for jsPlumb.Connection.
          const Api = function(connect) {
            const bindClickAction = function(onClick) {
              this.bind('click', onClick)
              this.getOverlay(LABEL.id).bind('click', function(label, event) {
                onClick(label.component, event)
              })
            }

            return _.extend({
              bindClickAction: bindClickAction
            })
          }

          return function(connect) {
            return _.extend(
              connect,
              new Api(connect)
            )
          }
        }(),
        // Notify to controller that a new jsPlumbConnection is added.
        notify = function(connect) {
          editor.trigger('textae.editor.jsPlumbConnection.add', connect)
          return connect
        }

      return _.compose(
        cache,
        notify,
        extendApi,
        hoverize,
        extendPointup,
        create,
        deleteRender
      )
    }(),
    // Create a dummy relation when before moving grids after creation grids.
    // Because a jsPlumb error occurs when a relation between same points.
    // And entities of same length spans was same point before moving grids.
    renderLazy = function() {
      const extendRelationId = function(relation) {
          return _.extend(relation, {
            relationId: relation.id
          })
        },
        renderIfGridExists = function(relation) {
          if (filterGridExists(relation) && relation.render) {
            render(relation)
          }
        },
        extendDummyApiToCreateRlationWhenGridMoved = function(relation) {
          const render = function() {
            return new Promise(function(resolve, reject) {
              _.defer(function() {
                try {
                  renderIfGridExists(relation)
                  resolve(relation)
                } catch (error) {
                  reject(error)
                }
              })
            })
          }

          return _.extend(relation, {
            render: render
          })
        }

      return _.compose(cache, extendDummyApiToCreateRlationWhenGridMoved, extendRelationId)
    }(),
    changeType = function(relation) {
      const connect = new Connect(editor, annotationData, relation.id),
        strokeStyle = new ConnectorStrokeStyle(relation.id)

      // The connect may be an object for lazyRender instead of jsPlumb.Connection.
      // This occurs when changing types and deletes was reverted.
      if (connect instanceof jsPlumb.Connection) {
        if (selectionModel.relation.has(relation.id)) {
          // Re-set style of the line and arrow if selected.
          strokeStyle.lineWidth = POINTUP_LINE_WIDTH
        }
        connect.setPaintStyle(strokeStyle)

        new LabelOverlay(connect).setLabel('[' + relation.id + '] ' + relation.type)
      }
    },
    changeJsModification = function(relation) {
      const connect = new Connect(editor, annotationData, relation.id)

      // A connect may be an object before it rendered.
      if (connect instanceof jsPlumb.Connection) {
        modification.update(new LabelOverlay(connect).getElement(), relation.id)
      }
    },
    jsPlumbInstance = makeJsPlumbInstance(getAnnotationBox(editor))

  return {
    arrangePositionAll: () => arrangePositionAll(editor, annotationData, selectionModel, jsPlumbInstance),
    reset: function() {
      jsPlumbInstance.reset()
      domPositionCaChe.connectCache.clear()
    },
    render: renderLazy,
    change: changeType,
    changeAll: () => {
      annotationData.relation.all().map((relation) => {
        changeType(relation)
      })
    },
    changeModification: changeJsModification,
    remove: (relation) => removeRelation(editor, annotationData, relation, jsPlumbInstance, domPositionCaChe)
  }
}

function removeRelation(editor, annotationData, relation, jsPlumbInstance, domPositionCaChe) {
  const connect = new Connect(editor, annotationData, relation.id)
  jsPlumbInstance.detach(connect)
  domPositionCaChe.connectCache.delete(relation.id)

  // Set the flag dead already to delay selection.
  connect.dead = true

  // Set a flag to extract relations from target to move relations asynchronously.
  relation.removed = true
}
