import source from '../../source'
import customizeqQueryUiAutocomplete from './customize-jquery-ui-autocomplete'
import $ from 'jquery'

customizeqQueryUiAutocomplete()

export default function($dialog, typeContainer, autocompletionWs, done, value1, value2) {
  let $inputs = $dialog.find('input'),
    $labelSpan = $dialog.find('label').eq(1).find('span')

  // Update the source
  $inputs.eq(1)
    .autocomplete({
      source: (request, response) => {
        $labelSpan.text('')
        source(typeContainer, autocompletionWs, request, response)
      },
      minLength: 3,
      select: (event, ui) => select($inputs.eq(1), $labelSpan, ui)
    })

  // Update done handler
  $dialog.done = done

  // Update display value
  $inputs.eq(0).val(value1)
  $inputs.eq(1).val(value2)
  if (typeContainer.getLabel(value2)) {
    $labelSpan.text(typeContainer.getLabel(value2))
  } else {
    $labelSpan.text('')
  }
}

function select($input, $labelSpan, ui) {
  $input.val(ui.item.raw.id)
  $labelSpan.html(ui.item.raw.label)

  return false
}
