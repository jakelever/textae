import $ from 'jquery'

const getAreaIn = function($parent) {
  let $area = $parent.find(
    '.textae-editor__footer .textae-editor__footer__message'
  )
  if ($area.length === 0) {
    $area = $('<div>').addClass('textae-editor__footer__message')
    const $footer = $('<div>')
      .addClass('textae-editor__footer')
      .append($area)
    $parent.append($footer)
  }

  return $area
}

module.exports = function(editor) {
  const status = function(message) {
    if (message !== '') {
      getAreaIn(editor).html(`Source: ${message}`)
    }
  }

  return {
    status
  }
}
