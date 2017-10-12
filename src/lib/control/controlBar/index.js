import BUTTON_MAP from '../buttonMap'
import makeButtons from './makeButtons'
import toButtonList from '../toButtonList'
import * as cssUtil from '../iconCssUtil'
import updateButtons from '../updateButtons'
import $ from 'jquery'

// Buttons that always eanable.
const ALWAYS_ENABLES = {
  read: true,
  help: true
}

// The control is a control bar in an editor.
export default function() {
  const $control = $(createElement()),
    buttonList = toButtonList(BUTTON_MAP)

  // Public API
  $control.updateAllButtonEnableState = enableButtons => updateAllButtonEnableState(
    $control,
    buttonList,
    enableButtons
  )
  $control.updateButtonPushState = (buttonType, isPushed) => updateButtonPushState(
    $control,
    buttonType,
    isPushed
  )

  return $control
}

function createElement() {
  const el = document.createElement('div')
  el.classList.add('textae-control')
  el.classList.add('textae-control-bar')
  makeButtons(el, BUTTON_MAP)

  return el
}

function updateAllButtonEnableState($control, buttonList, enableButtons) {
  // Make buttons in a enableButtons enabled, and other buttons in the buttonList disabled.
  const enables = Object.assign({}, buttonList, ALWAYS_ENABLES, enableButtons)

  // A function to enable/disable button.
  updateButtons($control, buttonList, enables)
}

function updateButtonPushState($control, buttonType, isPushed) {
  if (isPushed) {
    cssUtil.push($control, buttonType)
  } else {
    cssUtil.unpush($control, buttonType)
  }
}
