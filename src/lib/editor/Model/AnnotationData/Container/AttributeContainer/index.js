import AttributeModel from './AttributeModel'
import ContatinerWithEmitter from '../ContatinerWithEmitter'
import mappingFunction from './mappingFunction'

export default class extends ContatinerWithEmitter {
  constructor(emitter) {
    super(emitter, 'attribute', mappingFunction)
  }

  add(attribute) {
    return super.add(new AttributeModel(attribute), () => {
      super.emitter.emit(
        'entity.change',
        super.emitter.entity.get(attribute.subj)
      )
    })
  }

  change(id, newPred, newObj) {
    const model = this.get(id)

    if (newPred) {
      model.pred = newPred
    }

    if (newObj) {
      model.obj = newObj
    }

    super.emitter.emit(`${this.name}.change`, model)
    super.emitter.emit('entity.change', super.emitter.entity.get(model.subj))

    return model
  }

  remove(id) {
    const instance = super.remove(id)

    console.assert(instance, `There are no attribute ${id} to delete!`)

    super.emitter.emit('entity.change', super.emitter.entity.get(instance.subj))

    return instance
  }
}