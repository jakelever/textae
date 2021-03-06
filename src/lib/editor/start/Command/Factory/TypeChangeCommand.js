import BaseCommand from './BaseCommand'
import commandLog from './commandLog'

class TypeChangeCommand extends BaseCommand {
  constructor(editor, annotationData, typeContainer, modelType, id, changeValues, revertDefaultTypeId) {
    super(function() {
      let oldType = typeContainer.getDefinedType(id),
        newType = Object.assign({}, oldType),
        revertChangeValues = {}

      // change config
      Object.keys(changeValues).forEach((key) => {
        if (changeValues[key] === null && typeof oldType[key] !== 'undefined') {
          delete newType[key]
          revertChangeValues[key] = oldType[key]
        } else if (changeValues[key] !== null) {
          newType[key] = changeValues[key]
          revertChangeValues[key] = typeof oldType[key] === 'undefined' ? null : oldType[key]
        }
      })
      typeContainer.changeDefinedType(id, newType)

      // manage default type
      if (newType.default) {
        // remember the current default, because revert command will not understand what type was it.
        revertDefaultTypeId = typeContainer.getDefaultType()
        typeContainer.setDefaultType(newType.id)
      } else if (revertDefaultTypeId) {
        typeContainer.setDefaultType(revertDefaultTypeId)
        revertDefaultTypeId = 'undefined'
      }

      // change annotation
      annotationData[modelType].all().map((model) => {
        if (model.type === oldType.label || model.type === oldType.id) {
          annotationData[modelType].changeType(model.id, newType.id)
        }
      })

      // Set revert
      this.revert = () => new TypeChangeCommand(editor, annotationData, typeContainer, modelType, newType.id, revertChangeValues, revertDefaultTypeId)

      editor.eventEmitter.emit('textae.pallet.update')
      commandLog('change old type:' + JSON.stringify(oldType)
        + ' to new type:' + JSON.stringify(newType)
        + ', default is `' + typeContainer.getDefaultType() + '`')
    })
  }
}

export default TypeChangeCommand
