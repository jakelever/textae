export default function(
  command,
  presenter,
  daoHandler,
  buttonController,
  view,
  updateLineHeight
) {
  const keyApiMap = new KeyApiMap(command, presenter, daoHandler, buttonController),
    iconApiMap = new IconApiMap(command, presenter, daoHandler, buttonController, updateLineHeight),
    popupApiMap = new PopupApiMap(command, presenter, daoHandler),
    palletApiMap = new PalletApiMap(command, presenter, daoHandler)

  // Update APIs
  return {
    handleKeyInput: (key, value) => handle(keyApiMap, key, value),
    handleButtonClick: (key, value) => handle(iconApiMap, key, value),
    handlePopupClick: (key, value) => handle(popupApiMap, key, value),
    handlePalletClick: (key, value) => handle(palletApiMap, key, value),
    redraw: () => {
      // Positions of grids differ from positions of spans when the Maximize button clicked of the chrome and edge on the windows.
      // They move spans after grids are moved.
      // We move grids twice.
      view.updateDisplay().then(view.updateDisplay)
    },
    // To trigger button state update events on init.
    // Because an inline annotation is readed before a binding the control.
    updateButtons: buttonController.buttonStateHelper.propagate
  }
}

function handle(map, key, value) {
  if (map.has(key)) {
    map.get(key)(value)
  }
}


function KeyApiMap(command, presenter, daoHandler, buttonController) {
  return new Map([
    ['A', command.redo],
    ['B', presenter.event.toggleDetectBoundaryMode],
    ['C', presenter.event.copyEntities],
    ['D', presenter.event.removeSelectedElements],
    ['DEL', presenter.event.removeSelectedElements],
    ['E', presenter.event.createEntity],
    ['F', presenter.event.toggleInstaceRelation],
    ['I', daoHandler.showAccess],
    ['J', buttonController.modeAccordingToButton['add-subspan'].toggle],
    ['M', presenter.event.toggleInstaceRelation],
    ['Q', presenter.event.showPallet],
    ['R', presenter.event.replicate],
    ['S', presenter.event.speculation],
    ['U', daoHandler.showSave],
    ['V', presenter.event.pasteEntities],
    ['W', presenter.event.changeLabel],
    ['X', presenter.event.negation],
    ['Y', command.redo],
    ['Z', command.undo],
    ['ESC', presenter.event.cancelSelect],
    ['LEFT', presenter.event.selectLeft],
    ['RIGHT', presenter.event.selectRight],
    ['UP', presenter.event.selectUp],
    ['DOWN', presenter.event.selectDown]
  ])
}

function IconApiMap(
  command,
  presenter,
  daoHandler,
  buttonController,
  updateLineHeight
) {
  return new Map(
    [
      ['textae.control.button.view.click', presenter.event.toViewMode],
      ['textae.control.button.term.click', presenter.event.toTermMode],
      ['textae.control.button.relation.click', presenter.event.toRelationMode],
      ['textae.control.button.simple.click', presenter.event.toggleSimpleMode],
      ['textae.control.button.read.click', daoHandler.showAccess],
      ['textae.control.button.write.click', daoHandler.showSave],
      ['textae.control.button.undo.click', command.undo],
      ['textae.control.button.redo.click', command.redo],
      ['textae.control.button.replicate.click', presenter.event.replicate],
      ['textae.control.button.replicate_auto.click', buttonController.modeAccordingToButton['replicate-auto'].toggle],
      ['textae.control.button.boundary_detection.click', presenter.event.toggleDetectBoundaryMode],
      ['textae.control.button.add_subspan.click', buttonController.modeAccordingToButton['add-subspan'].toggle],
      ['textae.control.button.entity.click', presenter.event.createEntity],
      ['textae.control.button.change_label.click', presenter.event.changeLabel],
      ['textae.control.button.pallet.click', presenter.event.showPallet],
      ['textae.control.button.negation.click', presenter.event.negation],
      ['textae.control.button.speculation.click', presenter.event.speculation],
      ['textae.control.button.delete.click', presenter.event.removeSelectedElements],
      ['textae.control.button.copy.click', presenter.event.copyEntities],
      ['textae.control.button.paste.click', presenter.event.pasteEntities],
      ['textae.control.button.setting.click', presenter.event.showSettingDialog],
      ['textae.control.button.line_height.click', updateLineHeight]
    ]
  )
}

function PopupApiMap(command, presenter, daoHandler) {
  return new Map([
    ['textae.popup.button.add_attribute.click', presenter.event.createAttribute],
    ['textae.popup.button.change_label.click', presenter.event.changeLabelAndPred]
  ])
}

function PalletApiMap(command, presenter, daoHandler) {
  return new Map([
    ['textae.pallet.button.read.click', daoHandler.showAccessConf],
    ['textae.pallet.button.write.click', daoHandler.showSaveConf]
  ])
}
