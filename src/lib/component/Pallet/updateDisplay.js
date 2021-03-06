import toRows from './toRows'
import CLASS_NAMES from './className'

export default function(pallet, history, typeContainer, point, handlerType) {
  if (typeContainer) {
    clear(pallet)
    appendRows(pallet, typeContainer)
    updateLockState(pallet, typeContainer.isLock())
    updateTitle(pallet, handlerType)
    updateNoConfigText(pallet, handlerType)
    updateBGColorClass(pallet, handlerType)
    show(pallet)
    setWidthWithinWindow(pallet)
    setHeightWithinWindow(pallet)
    setWriteButtonState(history, pallet)

    if (point) {
      moveIntoWindow(pallet, point)
    }
  }
}

function clear(pallet) {
  pallet.querySelector('table').innerHTML = ''
  pallet.style.height = ''
}

function updateLockState(pallet, isLock) {
  let lockIcon = pallet.querySelector('.' + CLASS_NAMES.lockIcon),
    lockNodes = pallet.querySelectorAll('.' + CLASS_NAMES.hideWhenLocked),
    hideClassName = CLASS_NAMES.hideWhenLockedHide

  if (isLock) {
    lockIcon.style.display = 'inline-block'
    Array.prototype.forEach.call(lockNodes, (lockNode) => {
      lockNode.classList.add(hideClassName)
    })
  } else {
    lockIcon.style.display = 'none'
    Array.prototype.forEach.call(lockNodes, (lockNode) => {
      lockNode.classList.remove(hideClassName)
    })
  }
}

function updateTitle(pallet, handlerType) {
  let titleText = pallet.querySelector('.' + CLASS_NAMES.titleText)
  titleText.innerText = handlerType.charAt(0).toUpperCase() + handlerType.slice(1) + ' configuration'
}

function updateNoConfigText(pallet, handlerType) {
  let noConfigText = pallet.querySelector('.' + CLASS_NAMES.noConfig)
  if (noConfigText) {
    noConfigText.innerText = 'There is no ' + handlerType + ' definition.'
  }
}

function updateBGColorClass(pallet, handlerType) {
  if (handlerType === 'entity') {
    pallet.classList.remove(CLASS_NAMES.baseRelation)
    pallet.classList.add(CLASS_NAMES.baseEntity)
  } else if (handlerType === 'relation') {
    pallet.classList.add(CLASS_NAMES.baseRelation)
    pallet.classList.remove(CLASS_NAMES.baseEntity)
  }
}

function appendRows(pallet, typeContainer) {
  pallet.querySelector('table').innerHTML = toRows(typeContainer)
}

function show(pallet) {
  pallet.style.display = 'block'
}

function setWidthWithinWindow(pallet) {
  pallet.style.width = 'auto'
  if (window.innerWidth - 2 <= pallet.offsetWidth) {
    pallet.style.width = window.innerWidth - 4 + 'px'
  }
}

function setHeightWithinWindow(pallet) {
  if (window.innerHeight - 2 <= pallet.offsetHeight) {
    pallet.style.height = window.innerHeight - 2 + 'px'
  }
}

function setWriteButtonState(history, pallet) {
  if (history.hasAnythingToSave('configuration')) {
    pallet.querySelector('.' + CLASS_NAMES.buttonWrite).classList.add(CLASS_NAMES.buttonWriteTransit)
  } else {
    pallet.querySelector('.' + CLASS_NAMES.buttonWrite).classList.remove(CLASS_NAMES.buttonWriteTransit)
  }
}

function moveIntoWindow(pallet, point) {
  // Pull left the pallet when the pallet protrudes from right of the window.
  if (pallet.offsetWidth + point.left > window.innerWidth) {
    point.left = window.innerWidth - pallet.offsetWidth - 2
  }

  // Pull up the pallet when the pallet protrudes from bottom of the window.
  if (pallet.offsetHeight + point.top > window.innerHeight) {
    point.top = window.innerHeight - pallet.offsetHeight - 1
  }

  pallet.style.top = point.top + 'px'
  pallet.style.left = point.left + 'px'
}
