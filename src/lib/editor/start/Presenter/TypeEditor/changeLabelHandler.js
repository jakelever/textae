import editIdDialog from '../../../../component/editIdDialog'

// An handler is get on runtime, because it is changed by the edit mode.
export default function(editor, getHandler, autocompletionWs) {
  if (getHandler().getSelectedIdEditable().length > 0) {
    const currentType = getHandler().getSelectedType(),
      done = (id, label) => {
        let commands = []

        if (label) {
          const command = getHandler().changeLabelOfId(id, label)

          if (command) {
            commands.push(command)
          }
        }

        if (id) {
          commands = commands.concat(getHandler().changeTypeOfSelectedElement(id))
          getHandler().command.invoke(commands)
        }
      }

    editIdDialog(editor, currentType, getHandler().typeContainer, done, autocompletionWs)
  }
}
