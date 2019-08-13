import ModelContainer from '../ModelContainer'
import toSpanModel from './toSpanModel'
import mappingFunction from './mappingFunction'
import createSpanTree from './createSpanTree'
import spanComparator from './spanComparator'
import updateSpanIdOfEntities from './updateSpanIdOfEntities'

export default class extends ModelContainer {
  constructor(editor, emitter, paragraph) {
    super(emitter, 'span', (denotations) =>
      mappingFunction(editor, emitter, paragraph, denotations)
    )
    this.editor = editor
    this.emitter = emitter
    this.paragraph = paragraph
    this.spanTopLevel = []
  }

  // private
  updateSpanTree() {
    // the spanTree has parent-child structure.
    const spanTree = createSpanTree(this, this.editor, super.all)

    // this for debug.
    spanTree.toString = function() {
      return this.map((span) => span.toString()).join('\n')
    }
    //  console.log(spanTree.toString())

    return spanTree
  }

  // expected span is like { "begin": 19, "end": 49 }
  add(span) {
    if (span)
      return super.add(
        toSpanModel(this.editor, this.emitter, this.paragraph, span),
        () => {
          this.spanTopLevel = this.updateSpanTree()
        }
      )
    throw new Error('span is undefined.')
  }

  addSource(spans) {
    super.addSource(spans)
    this.spanTopLevel = this.updateSpanTree()
  }

  get(spanId) {
    return super.get(spanId)
  }

  range(firstId, secondId) {
    let first = super.get(firstId)
    let second = super.get(secondId)

    // switch if seconfId before firstId
    if (spanComparator(first, second) > 0) {
      const temp = first
      first = second
      second = temp
    }

    return super.all
      .filter((span) => first.begin <= span.begin && span.end <= second.end)
      .map((span) => span.id)
  }

  topLevel() {
    return this.spanTopLevel
  }

  multiEntities() {
    return super.all.filter((span) => {
      const multiEntitiesTypes = span
        .getTypes()
        .filter((type) => type.entities.length > 1)

      return multiEntitiesTypes.length > 0
    })
  }

  remove(id) {
    const span = super.remove(id)
    this.spanTopLevel = this.updateSpanTree()
    return span
  }

  clear() {
    super.clear()
    this.spanTopLevel = []
  }

  move(id, newSpan) {
    const oldOne = super.remove(id)
    const newOne = super.add(
      toSpanModel(this.editor, this.emitter, this.paragraph, newSpan),
      (newOne) => {
        this.spanTopLevel = this.updateSpanTree()
        // Span.getTypes function depends on the property of the entity.
        // We can not distinguish the span is block span or not unless the span ID of the entity is updated.
        // Span DOM element is rendered by 'span.add' event.
        // We need to update the span ID of the entity before 'span.add' event.
        updateSpanIdOfEntities(this.emitter.entity.all, id, newOne)
      }
    )

    this.emitter.emit('span.move')

    return [
      {
        begin: oldOne.begin,
        end: oldOne.end
      },
      newOne.id
    ]
  }
}
