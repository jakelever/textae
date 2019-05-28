module.exports = function(editor, contextMenu, handleControlButtonClick) {
  // add context menu
  editor[0].appendChild(contextMenu[0])
  editor.eventEmitter
    .on('textae.control.button.push', (data) => contextMenu.updateButtonPushState(data.buttonName, data.state))
    .on('textae.control.buttons.change', (enableButtons) => contextMenu.updateAllButtonEnableState(enableButtons))
    .on('textae.key.input', () => contextMenu.hide())

  contextMenu.$control
    .on('textae.control.button.click', (e, ...rest) => handleControlButtonClick(...rest))

  contextMenu[0].addEventListener('mousedown', (e) => {
    // Should prevent because mousedown events bubble to the editor.
    e.preventDefault()
  })

  // Close ContextMenu when another editor is clicked
  window.addEventListener('click', (e) => {
    // In Firefox, the right button of mouse fires a 'click' event.
    // https://stackoverflow.com/questions/43144995/mouse-right-click-on-firefox-triggers-click-event
    // In Fireforx, MoesueEvent has a 'which' property, which is 3 when the right button is clicked.
    // https://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event
    if (e.which === 3) {
      return
    }

    contextMenu.hide()
  })

  window.addEventListener('contextmenu', (e) => {
    // Close ContextMenu when another editor is clicked.
    contextMenu.hide()

    // Open ContextMenu when selected editor is clicked.
    if (e.target.closest('.textae-editor') === editor[0]) {
      // Prevent show browser default context menu
      e.preventDefault()

      // The context menu is `position:absolute` in the editor.
      // I want the coordinates where you right-click with the mouse, starting from the upper left of the editor.
      // So the Y coordinate is pageY minus the editor's offsetTop.
      contextMenu.show(e.pageY - editor[0].offsetTop, e.pageX)
    }
  })
}
