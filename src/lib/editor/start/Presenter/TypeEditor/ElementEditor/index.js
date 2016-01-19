import EditRelation from './EditRelation'
import EditEntity from './EditEntity'
import unbindAllEventhandler from './unbindAllEventhandler'
import DefaultHandler from './DefaultHandler'

// Provide handlers to edit elements according to an edit mode.
export default function(editor, model, spanConfig, command, modeAccordingToButton, typeContainer, canselHandler) {
  let handler = new DefaultHandler(),
    editRelation = new EditRelation(editor, model.selectionModel, model.annotationData, command, typeContainer, canselHandler),
    editEntity = new EditEntity(editor, model, command, modeAccordingToButton, typeContainer, spanConfig, canselHandler)

  return {
    getHandler: () => handler,
    start: {
      noEdit: () => {
        unbindAllEventhandler(editor)
        handler = new DefaultHandler()
      },
      editEntity: () => {
        unbindAllEventhandler(editor)

        editEntity.init()
        handler = editEntity.handlers
      },
      editRelation: () => {
        unbindAllEventhandler(editor)

        editRelation.init()
        handler = editRelation.handlers
      }
    }
  }
}