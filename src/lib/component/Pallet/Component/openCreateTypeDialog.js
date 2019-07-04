import EditTypeDialog from "../EditTypeDialog"
import triggerUpdatePallet from "./triggerUpdatePallet"

export default function(elementEditor, e, typeContainer, editor, autocompletionWs) {
  const handler = elementEditor.getHandlerForPallet()
  const defaultColor = typeContainer[handler.modelType].getDefaultColor()
  const done = (newId, newLabel, newColor, newDefault) => {
    if (newId === '') {
      return
    }

    const newType = {
      id: newId,
      color: newColor
    }

    if (newLabel !== '') {
      newType.label = newLabel
    }

    if (newDefault) {
      newType.default = newDefault
    }

    handler.command.invoke([handler.addType(newType)], ['configuration'])
    triggerUpdatePallet(editor)
  }
  const dialog = new EditTypeDialog(editor, handler.typeContainer, done, autocompletionWs, 'Please create a new type')
  dialog.update(null, '', defaultColor, false)
  dialog.open()
}
