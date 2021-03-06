import BaseCommand from './BaseCommand'
import commandLog from './commandLog'
import TypeRemoveCommand from './TypeRemoveCommand'

class TypeCreateCommand extends BaseCommand {
  constructor(editor, typeContainer, newType) {
    super(function() {
      let revertDefaultTypeId

      Object.keys(newType).forEach((key) => {
        if (newType[key] === '' || (key === 'default' && !newType[key])) {
          delete newType[key]
        }
      })
      typeContainer.setDefinedType(newType)

      // manage default type
      if (newType.default) {
        // remember the current default, because revert command will not understand what type was it.
        revertDefaultTypeId = typeContainer.getDefaultType()
        typeContainer.setDefaultType(newType.id)
      }

      this.revert = () => new TypeRemoveCommand(editor, typeContainer, newType, revertDefaultTypeId)

      editor.eventEmitter.emit('textae.pallet.update')
      commandLog('create a new type:' + JSON.stringify(newType)
        + ', default is `' + typeContainer.getDefaultType() + '`')
    })
  }
}

export default TypeCreateCommand
