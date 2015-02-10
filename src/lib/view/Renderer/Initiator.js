import renderSourceDocument from './renderSourceDocument';
import getAnnotationBox from './getAnnotationBox';
import RenderAll from './RenderAll';
import renderModification from './renderModification';
import {
    EventEmitter as EventEmitter
}
from 'events';
import TypeStyle from '../TypeStyle';

export default function(domPositionCaChe, spanRenderer, gridRenderer, entityRenderer, relationRenderer, buttonStateHelper, typeGap) {
    var emitter = new EventEmitter();

    entityRenderer.on('render', entity => entityRenderer.getTypeDom(entity).css(new TypeStyle(typeGap())));

    return (editor, annotationData, selectionModel) => {
        var renderAll = new RenderAll(editor, domPositionCaChe, spanRenderer, relationRenderer),
            renderSpanOfEntity = _.compose(
                spanRenderer.change,
                entity => annotationData.span.get(entity.span)
            ),
            renderModificationEntityOrRelation = modification => {
                renderModification(annotationData, 'relation', modification, relationRenderer, buttonStateHelper);
                renderModification(annotationData, 'entity', modification, entityRenderer, buttonStateHelper);
            };

        initChildren(editor, gridRenderer, relationRenderer);

        var eventHandlers = [
            ['text.change', params => renderSourceDocument(editor, params.sourceDoc, params.paragraphs)],
            ['all.change', annotationData => {
                renderAll(annotationData);
                selectionModel.clear();
            }],
            ['span.add', span => spanRenderer.render(span)],
            ['span.remove', span => {
                spanRenderer.remove(span);
                selectionModel.span.remove(modelToId(span));
            }],
            ['entity.add', entity => {
                // Add a now entity with a new grid after the span moved.
                spanRenderer.change(
                    annotationData.span.get(entity.span),
                    domPositionCaChe.reset
                );
                entityRenderer.render(entity);
            }],
            ['entity.change', entity => {
                entityRenderer.change(entity);
                renderSpanOfEntity(entity);
            }],
            ['entity.remove', entity => {
                entityRenderer.remove(entity);
                renderSpanOfEntity(entity);
                selectionModel.entity.remove(modelToId(entity));
            }],
            ['relation.add', relation => {
                relationRenderer.render(relation);
                emitter.emit('relation.add', relation);
            }],
            ['relation.change', relationRenderer.change],
            ['relation.remove', relation => {
                relationRenderer.remove(relation);
                selectionModel.relation.remove(modelToId(relation));
            }],
            ['modification.add', renderModificationEntityOrRelation],
            ['modification.remove', renderModificationEntityOrRelation]
        ];

        eventHandlers.forEach(eventHandler => bindeToModelEvent(emitter, annotationData, eventHandler[0], eventHandler[1]));

        return emitter;
    };
}

function initChildren(editor, gridRenderer, relationRenderer) {
    var container = getAnnotationBox(editor);
    gridRenderer.init(container);
    relationRenderer.init(container);
}

function modelToId(modelElement) {
    return modelElement.id;
}

function bindeToModelEvent(emitter, annotationData, eventName, handler) {
    annotationData.on(eventName, param => {
        handler(param);
        emitter.emit(eventName);
    });
}
