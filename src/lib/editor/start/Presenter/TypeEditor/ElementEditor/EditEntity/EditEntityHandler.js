import DefaultHandler from '../DefaultHandler'

export default class extends DefaultHandler {
  constructor(typeContainer, command, annotationData, selectionModel) {
    super('entity')
    this.typeContainer = typeContainer.entity
    this.command = command
    this.annotationData = annotationData.entity
    this.selectionModel = selectionModel.entity
  }
  changeTypeOfSelectedElement(newType) {
    return this.getEditTarget(newType)
      .map((id) => this.command.factory.entityChangeTypeCommand(
        id,
        newType,
        this.typeContainer.isBlock(newType)
      ))
  }
}
