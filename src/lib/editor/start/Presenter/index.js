import SettingDialog from '../../../component/SettingDialog'
import TypeEditor from './TypeEditor'
import EditMode from './EditMode'
import DisplayInstance from './DisplayInstance'
import ClipBoardHandler from './handlers/ClipBoardHandler'
import DefaultEntityHandler from './handlers/DefaultEntityHandler'
import DefaultAttributeHandler from './handlers/DefaultAttributeHandler'
import removeSelectedElements from './handlers/removeSelectedElements'
import ModificationHandler from './handlers/ModificationHandler'
import SelectHandler from './handlers/SelectHandler'
import ToggleButtonHandler from './handlers/ToggleButtonHandler'
import ModeButtonHandlers from './handlers/ModeButtonHandlers'
import transitSaveButton from './transitSaveButton'
import bindModelChange from './bindModelChange'

export default function(
  editor,
  history,
  annotationData,
  selectionModel,
  view,
  command,
  spanConfig,
  clipBoard,
  buttonController,
  typeGap,
  typeContainer,
  writable,
  autocompletionWs,
  mode
) {
  const typeEditor = new TypeEditor(
      editor,
      history,
      annotationData,
      selectionModel,
      spanConfig,
      command,
      buttonController.modeAccordingToButton,
      typeContainer,
      autocompletionWs
    ),
    editMode = new EditMode(
      editor,
      annotationData,
      selectionModel,
      typeEditor,
      buttonController.buttonStateHelper
    ),
    displayInstance = new DisplayInstance(
      typeGap,
      editMode
    ),
    defaultEntityHandler = new DefaultEntityHandler(
      command,
      annotationData,
      selectionModel,
      buttonController.modeAccordingToButton,
      spanConfig,
      typeContainer.entity
    ),
    defaultAttributeHandler = new DefaultAttributeHandler(
      annotationData,
      command,
      selectionModel,
      typeContainer.attribute
    ),
    clipBoardHandler = new ClipBoardHandler(
      command,
      annotationData,
      selectionModel,
      clipBoard
    ),
    modificationHandler = new ModificationHandler(
      command,
      annotationData,
      buttonController.modeAccordingToButton,
      typeEditor
    ),
    toggleButtonHandler = new ToggleButtonHandler(
      buttonController.modeAccordingToButton,
      editMode
    ),
    modeButtonHandlers = new ModeButtonHandlers(
      editMode
    ),
    selectHandler = new SelectHandler(
      editor[0],
      selectionModel
    ),
    showSettingDialog = new SettingDialog(
      editor,
      typeContainer,
      displayInstance
    ),
    event = {
      editorSelected,
      editorUnselected,
      copyEntities: clipBoardHandler.copyEntities,
      removeSelectedElements: () => removeSelectedElements(
        command,
        selectionModel,
        selectHandler
      ),
      createEntity: defaultEntityHandler.createEntity,
      createAttribute: defaultAttributeHandler.createAttribute,
      showPallet: typeEditor.showPallet,
      replicate: defaultEntityHandler.replicate,
      pasteEntities: clipBoardHandler.pasteEntities,
      changeLabel: typeEditor.changeLabel,
      changeLabelAndPred: typeEditor.changeLabelAndPred,
      cancelSelect,
      negation: modificationHandler.negation,
      speculation: modificationHandler.speculation,
      showSettingDialog: showSettingDialog
    }

  Object.assign(event, selectHandler)
  Object.assign(event, toggleButtonHandler)
  Object.assign(event, modeButtonHandlers)

  transitSaveButton(writable, editMode, buttonController)

  // The jsPlumbConnetion has an original event mecanism.
  // We can only bind the connection directory.
  editor
    .on('textae.editor.jsPlumbConnection.add', (event, jsPlumbConnection) => {
      jsPlumbConnection.bindClickAction(typeEditor.jsPlumbConnectionClicked)
    })

  defaultEntityHandler.on('createEntity', displayInstance.notifyNewInstance)

  bindModelChange(annotationData, writable, editMode, mode)

  return {
    event
  }

  function editorSelected() {
    editor.eventEmitter.emit('textae.editor.select')
    buttonController.buttonStateHelper.propagate()
  }

  function editorUnselected() {
    typeEditor.hidePallet()
    editor.eventEmitter.emit('textae.editor.unselect')

    // Do not cancelSelect, because mouse up events occurs before blur events.
  }

  function cancelSelect() {
    typeEditor.cancelSelect()

    // Foucs the editor for ESC key
    editor.focus()
  }
}
