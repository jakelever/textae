import invokeCommand from './invokeCommand'
import Factory from './Factory'

// A command is an operation by user that is saved as history, and can undo and redo.
// Users can edit model only via commands.
export default function(editor, annotationData, selectionModel, history) {
  return {
    invoke: (commands, kinds) => {
      if (typeof kinds === 'undefined') {
        throw new Error('Please set the second argument ―― it describes what kind of type the invoking command.')
      }

      if (commands && commands.length > 0) {
        invokeCommand.invoke(commands)
        history.push(commands, kinds)
        editor.eventEmitter.emit('textae.pallet.update')
      }
    },
    undo: () => {
      if (history.hasAnythingToUndo()) {
        // Focus the editor.
        // Focus is lost when undo a creation.
        selectionModel.clear()
        editor.focus()
        invokeCommand.invokeRevert(history.prev())
        editor.eventEmitter.emit('textae.pallet.update')
      }
    },
    redo: () => {
      if (history.hasAnythingToRedo()) {
        // Select only new element when redo a creation.
        selectionModel.clear()

        invokeCommand.invoke(history.next())
        editor.eventEmitter.emit('textae.pallet.update')
      }
    },
    factory: new Factory(editor, annotationData, selectionModel)
  }
}
