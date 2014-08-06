var getElement = function($parent, tagName, className) {
        var $area = $parent.find('.' + className);
        if ($area.length === 0) {
            $area = $('<' + tagName + '>').addClass(className);
            $parent.append($area);
        }
        return $area;
    },
    modelToId = function(modelElement) {
        return modelElement.id;
    },
    capitalize = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

module.exports = function(editor, model, viewModel) {
    var // Make the display area for text, spans, denotations, relations.
        displayArea = _.partial(getElement, editor, 'div', 'textae-editor__body'),
        // Get the display area for denotations and relations.
        getAnnotationArea = function() {
            return getElement(displayArea(), 'div', 'textae-editor__body__annotation-box');
        },
        renderSourceDocument = function() {
            // Get the display area for text and spans.
            var getSourceDocArea = function() {
                    return getElement(displayArea(), 'div', 'textae-editor__body__text-box');
                },
                // the Souce document has multi paragraphs that are splited by '\n'.
                createTaggedSourceDoc = function(params) {
                    //set sroucedoc tagged <p> per line.
                    return params.sourceDoc.split("\n").map(function(content, index) {
                        return '<p class="textae-editor__body__text-box__paragraph-margin">' +
                            '<span class="textae-editor__body__text-box__paragraph" id="' +
                            params.paragraphs[index].id +
                            '" >' +
                            content +
                            '</span></p>';
                    }).join("\n");
                };

            return function(params) {
                // Render the source document
                getSourceDocArea().html(createTaggedSourceDoc(params));
            };
        }(),
        domPositionUtils = require('../DomPositionCache')(editor, model),
        reset = function() {
            var renderAllSpan = function(annotationData) {
                    // For tuning
                    // var startTime = new Date();

                    annotationData.span.topLevel().forEach(function(span) {
                        rendererImpl.span.render(span);
                    });

                    // For tuning
                    // var endTime = new Date();
                    // console.log('render all span : ', endTime.getTime() - startTime.getTime() + 'ms');
                },
                renderAllRelation = function(annotationData) {
                    rendererImpl.relation.reset();
                    annotationData.relation.all().forEach(rendererImpl.relation.render);
                };

            return function(annotationData) {
                // Render annotations
                getAnnotationArea().empty();
                domPositionUtils.gridPositionCache.clear();
                renderAllSpan(annotationData);

                // Render relations
                renderAllRelation(annotationData);
            };
        }(),
        rendererImpl = function() {
            var gridRenderer = function() {
                    var domUtil = require('../../util/DomUtil')(editor),
                        createGrid = function(container, spanId) {
                            var spanPosition = domPositionUtils.getSpan(spanId);
                            var $grid = $('<div>')
                                .attr('id', 'G' + spanId)
                                .addClass('textae-editor__grid')
                                .addClass('hidden')
                                .css({
                                    'width': spanPosition.width
                                });

                            //append to the annotation area.
                            container.append($grid);

                            return $grid;
                        },
                        destroyGrid = function(spanId) {
                            domUtil.selector.grid.get(spanId).remove();
                            domPositionUtils.gridPositionCache.remove(spanId);
                        },
                        init = function(container) {
                            gridRenderer.render = _.partial(createGrid, container);
                        };

                    return {
                        init: init,
                        // The render is set at init.
                        render: null,
                        remove: destroyGrid
                    };
                }(),
                modificationRenderer = function() {
                    var getClasses = function(objectId) {
                        return model.annotationData.getModificationOf(objectId)
                            .map(function(m) {
                                return 'textae-editor__' + m.pred.toLowerCase();
                            }).join(' ');
                    };

                    return {
                        getClasses: getClasses,
                        update: function() {
                            var allModificationClasses = 'textae-editor__negation textae-editor__speculation';

                            return function(domElement, objectId) {
                                domElement.removeClass(allModificationClasses);
                                domElement.addClass(getClasses(objectId));
                            };
                        }(),
                    };
                }(),
                entityRenderer = require('./EntityRenderer')(editor, model, viewModel, gridRenderer, modificationRenderer),
                spanRenderer = require('./SpanRenderer')(editor, model, viewModel, entityRenderer, gridRenderer),
                relationRenderer = require('./RelationRenderer')(editor, model, viewModel, modificationRenderer);

            return {
                init: function(container) {
                    gridRenderer.init(container);
                    relationRenderer.init(container);
                },
                span: spanRenderer,
                entity: entityRenderer,
                relation: relationRenderer
            };
        }(),
        triggerChange = function() {
            api.trigger('change');
        },
        updateDisplayAfter = _.partial(_.compose, triggerChange),
        updateSpanAfter = function() {
            var entityToSpan = function(entity) {
                return model.annotationData.span.get(entity.span);
            };

            return _.partial(_.compose, triggerChange, rendererImpl.span.change, entityToSpan);
        }(),
        renderModificationEntityOrRelation = function() {
            var renderModification = function(modelType, modification) {
                    var target = model.annotationData[modelType].get(modification.obj);
                    if (target) {
                        rendererImpl[modelType].changeModification(target);
                        viewModel.buttonStateHelper['updateBy' + capitalize(modelType)]();
                    }

                    return modification;
                },
                renderModificationOfEntity = _.partial(renderModification, 'entity'),
                renderModificationOfRelation = _.partial(renderModification, 'relation');

            return _.compose(renderModificationOfEntity, renderModificationOfRelation);
        }(),
        api = require('../../util/extendBindable')({
            setModelHandler: function() {
                rendererImpl.init(getAnnotationArea());

                model.annotationData
                    .bind('change-text', renderSourceDocument)
                    .bind('all.change', _.compose(model.selectionModel.clear, reset))
                    .bind('span.add', updateDisplayAfter(rendererImpl.span.render))
                    .bind('span.remove', updateDisplayAfter(rendererImpl.span.remove))
                    .bind('span.remove', _.compose(model.selectionModel.span.remove, modelToId))
                    .bind('entity.add', updateSpanAfter(rendererImpl.entity.render))
                    .bind('entity.change', updateSpanAfter(rendererImpl.entity.change))
                    .bind('entity.remove', updateSpanAfter(rendererImpl.entity.remove))
                    .bind('entity.remove', _.compose(model.selectionModel.entity.remove, modelToId))
                    .bind('relation.add', rendererImpl.relation.render)
                    .bind('relation.change', rendererImpl.relation.change)
                    .bind('relation.remove', rendererImpl.relation.remove)
                    .bind('relation.remove', _.compose(model.selectionModel.relation.remove, modelToId))
                    .bind('modification.add', renderModificationEntityOrRelation)
                    .bind('modification.remove', renderModificationEntityOrRelation);
            }
        });

    return api;
};