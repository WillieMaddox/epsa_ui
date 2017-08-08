import 'openlayers'

import $ from 'jquery'

const form_elements = {}

// const PolygonWidget = function (sandBox) {

class FeatureClass {
  constructor () {
    this.form_nodes = {}
    this.form_node_labels = {}
  }
  destroy (removeComponent) {
    // sandBox.unsubscribeFromAllCustomEvents()
    // if (removeComponent) {
    //   sandBox.removeComponent('featureeditor')
    // }
    // sandBox.logMessage(1, 'Content component has been destroyed...', "blue")
  }
  createForm () {
    //TODO: use this when calling registerComponent
    const $form = $("<form id='featureproperties'>")
    for (let [label, node] of Object.entries(this.form_nodes)) {
      form_elements[label] = node.createNode()
    }
    for (let row_node_labels of this.form_node_labels) {
      $form.append(this.addFormRow(row_node_labels))
    }
    return $form
  }
  addFormRow (labels) {
    const $formRow = $("<div class='form-row'>")
    for (let label of labels) {
      $formRow.append(form_elements[label])
    }
    return $formRow
  }
  styleForm () {
    for (let node of Object.values(this.form_nodes)) {
      node.styleNode()
    }
  }
  loadFeature (feature) {
    for (let node of Object.values(this.form_nodes)) {
      node.loadFeature(feature)
    }
  }
  saveFeature (feature) {
    for (let node of Object.values(this.form_nodes)) {
      node.saveFeature(feature)
    }
  }
  registerForEvents () {
    for (let node of Object.values(this.form_nodes)) {
      node.registerForEvents()
    }
  }
}
// return Polygon

// }

// OSMFire_Core.registerComponent('featureeditor', 'polygonproperties', PolygonWidget)

export default FeatureClass
