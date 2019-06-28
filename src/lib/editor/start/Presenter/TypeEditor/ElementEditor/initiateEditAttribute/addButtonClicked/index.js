import createAttribute from './createAttribute'

export default function(command, selectionModel, typeContainer, e) {
  const entityId = e.target.parentNode.querySelector('.textae-editor__entity').getAttribute('title')
  selectionModel.clear()
  selectionModel.entity.add(entityId)
  createAttribute(command, selectionModel, typeContainer.attribute)
}
