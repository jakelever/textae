import Handlebars from 'handlebars'
import idFactory from '../../../../../../../idFactory'
import getLabel from '../../../getLabel'
import getUri from '../../../getUri'


// A Type element has an entity_pane elment that has a label and will have entities.
const source = `
<div id="{{id}}" class="textae-editor__type">
  <div id="P-{{id}}" class="textae-editor__entity-pane"></div>
  <div class="textae-editor__type-label" tabindex="0" style="background-color: {{color}}">
    {{#if href}}
      <a target="_blank"/ href="{{href}}">{{label}}</a>
    {{else}}
      {{label}}
    {{/if}}
  </div>
  <div class="textae-editor__attribute-button textae-editor__attribute-button--add" title="Add a new attribute to this entity."></div>
</div>
`
const template = Handlebars.compile(source)

export default function(spanId, namespace, typeDefinition, type) {
  const id = idFactory.makeTypeId(spanId, type)
  const label = getLabel(namespace, typeDefinition, type)
  const href = getUri(namespace, typeDefinition, type)
  const color = typeDefinition.getColor(type)

  return template({id, label, href, color})
}