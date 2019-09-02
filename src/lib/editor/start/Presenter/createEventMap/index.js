import SettingDialog from '../../../../component/SettingDialog'
import ClipBoardHandler from './handlers/ClipBoardHandler'
import createEntityHandler from './handlers/createEntityHandler'
import ReplicateHandler from './handlers/ReplicateHandler'
import removeSelectedElements from './handlers/removeSelectedElements'
import ModificationHandler from './handlers/ModificationHandler'
import SelectHandler from './handlers/SelectHandler'
import cancelSelect from './cancelSelect'
import extendModeButtonHandlers from './extendModeButtonHandlers'
import extendToggleButtonHandler from './extendToggleButtonHandler'
import createAttribute from '../createAttribute'

export default function(
  commander,
  selectionModel,
  typeDefinition,
  displayInstance,
  annotationData,
  buttonController,
  spanConfig,
  clipBoard,
  typeEditor,
  editor,
  editMode
) {
  const replicateHandler = new ReplicateHandler(
    commander,
    annotationData,
    selectionModel,
    buttonController.pushButtons,
    spanConfig
  )
  const clipBoardHandler = new ClipBoardHandler(
    commander,
    annotationData,
    selectionModel,
    clipBoard
  )
  const modificationHandler = new ModificationHandler(
    commander,
    buttonController.pushButtons,
    typeEditor
  )
  const selectHandler = new SelectHandler(editor[0], selectionModel)
  const showSettingDialog = new SettingDialog(
    editor,
    typeDefinition,
    displayInstance
  )
  const event = {
    copyEntities: () => clipBoardHandler.copyEntities(),
    removeSelectedElements: () =>
      removeSelectedElements(commander, selectHandler),
    createEntity: () =>
      createEntityHandler(
        commander,
        typeDefinition,
        displayInstance.notifyNewInstance
      ),
    showPallet: typeEditor.showPallet,
    replicate: replicateHandler,
    pasteEntities: () => clipBoardHandler.pasteEntities(),
    changeLabel: typeEditor.changeLabel,
    changeLabelAndPred: typeEditor.changeLabelAndPred,
    cancelSelect: () => cancelSelect(typeEditor, editor),
    negation: modificationHandler.negation,
    speculation: modificationHandler.speculation,
    createAttribute: () => createAttribute(commander),
    showSettingDialog
  }
  Object.assign(event, selectHandler)
  extendToggleButtonHandler(buttonController, editMode, event)
  extendModeButtonHandlers(editMode, event)
  return event
}
