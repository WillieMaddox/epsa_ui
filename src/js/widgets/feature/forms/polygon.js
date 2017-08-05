/**
 * Created by maddoxw on 7/21/17.
 */

'use strict'

import $ from 'jquery'
import Name from '../nodes/name'
import Type from '../nodes/featuretype'
import Hole from '../nodes/hole'
import Measure from '../nodes/measure'
import polygon_templates from '../polygontemplates'

const form_elements = {}

class Polygon {
  constructor () {
    this.type = 'polygon'
    this.form_nodes = {
      'name': new Name(polygon_templates),
      'type': new Type(polygon_templates),
      'measure': new Measure('Polygon'),
      'hole': new Hole()
    }
    this.form_node_labels = [
      ['name'],
      ['measure'],
      ['type', 'hole']
    ]
  }
  createForm () {
    const $form = $("<form id='featureproperties' class='form'>")
    for (let label in this.form_nodes) {
      form_elements[label] = this.form_nodes[label].createNode()
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
    for (let label in this.form_nodes) {
      this.form_nodes[label].styleNode()
    }
  }
  activateForm (feature) {
    $('#featureproperties').show()
    for (let label in this.form_nodes) {
      this.form_nodes[label].activateNode(feature)
    }
  }
  changeFeatureType (feature_type) {
    // name.changeFeatureType(feature_type)
    // featuretype.changeFeatureType(feature_type)
    return this
  }
  loadFeature (feature) {
    for (let label in this.form_nodes) {
      this.form_nodes[label].loadFeature(feature)
    }
  }
  deactivateForm () {
    for (let label in this.form_nodes) {
      this.form_nodes[label].deactivateNode()
    }
    $('.form-label').addClass('disabled')
  }
}

export default Polygon
