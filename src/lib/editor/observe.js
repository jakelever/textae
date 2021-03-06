import showVilidationDialog from '../component/showVilidationDialog'
import KINDS from './start/Command/Factory/kinds'
import toastr from 'toastr'

export function observeModelChange(annotationData, history, writable) {
  annotationData
    .on('all.change', (annotationData, multitrack, reject) => {
      resetAllHistories(history, KINDS)
      showVilidationDialog(self, reject)
    })
    .on('config.change', () => {
      history.reset(KINDS.conf)
    })
}

export function observeHistoryChange(history, buttonStateHelper, leaveMessage, writable) {
  history.on('change', function(state) {
    // change button state
    buttonStateHelper.enabled("undo", state.hasAnythingToUndo)
    buttonStateHelper.enabled("redo", state.hasAnythingToRedo)

    // change leaveMessage show
    window.onbeforeunload = state.hasAnythingToSaveAnnotation ? function() {
      return leaveMessage
    } : null

    writable.update(state.hasAnythingToSaveAnnotation)
  })
}

export function observeDataSave(editor, dataAccessObject, history, writable) {
  dataAccessObject
    .on('save', function() {
      resetAllHistories(history, KINDS)
      writable.forceModified(false)
      editor.eventEmitter.emit('textae.pallet.update')
      toastr.success("annotation saved")
    })
    .on('save--config', function() {
      history.saved(KINDS.conf)
      editor.eventEmitter.emit('textae.pallet.update')
      toastr.success("configuration saved")
    })
    .on('save error', function() {
      toastr.error("could not save")
    })
}

function resetAllHistories(history, kinds) {
  Object.keys(kinds).forEach((kind) => {
    history.reset(kinds[kind])
  })
}
