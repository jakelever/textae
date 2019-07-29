import getElement from './getElement'
import getEditorBody from './getEditorBody'
import _ from 'underscore'

// Get the display area for denotations and relations.
export default _.compose(
  _.partial(getElement, 'div', 'textae-editor__body__annotation-box'),
  getEditorBody
)
