import setAnnotation from './setAnnotation'

export default function(spanConfig, typeDefinition, annotationData, statusBar, params, dataAccessObject) {
  const annotation = params.get('annotation')
  const config = params.get('config')

  if (annotation) {
    if (annotation.has('inlineAnnotation')) {
      // Set an inline annotation.
      const originalAnnotation = JSON.parse(annotation.get('inlineAnnotation'))
      setAnnotation(spanConfig, typeDefinition, annotationData, originalAnnotation, config)
      statusBar.status('inline')

      return originalAnnotation
    } else if (annotation.has('url')) {
      // Load an annotation from server.
      dataAccessObject.getAnnotationFromServer(annotation.get('url'))
    } else {
      throw new Error('annotation text is empty.')
    }
  }

  if (config) {
    dataAccessObject.getConfigurationFromServer(config)
  }
}