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
  command,
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
    command,
    annotationData,
    selectionModel,
    buttonController.pushButtons,
    spanConfig
  )
  const clipBoardHandler = new ClipBoardHandler(
    command,
    annotationData,
    selectionModel,
    clipBoard
  )
  const modificationHandler = new ModificationHandler(
    command,
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
      removeSelectedElements(command, selectHandler),
    createEntity: () =>
      createEntityHandler(
        command,
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
    createAttribute: () => createAttribute(command),
    showSettingDialog
  }
  Object.assign(event, selectHandler)
  extendToggleButtonHandler(buttonController, editMode, event)
  extendModeButtonHandlers(editMode, event)
  return event
}
