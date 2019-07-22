import getAttributesHeight from './getAttributesHeight'
import getTypeUnitHeght from './getTypeUnitHeight'

export default function(span, typeDefinition, typeGap) {
  const types = span.getTypes()
    .filter(type => !typeDefinition.entity.isBlock(type.name))

  return types.length * getTypeUnitHeght(typeGap) + getAttributesHeight(types)
}