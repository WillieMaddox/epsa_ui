/**
 * Created by maddoxw on 7/21/17.
 */

'use strict'

import $ from 'jquery'
import Name from '../nodes/name'
import Type from '../nodes/featuretype'
import Measure from '../nodes/measure'
import linestring_templates from '../linestringtemplates'

const form_elements = {}

class LineString {
  constructor () {
    this.type = 'linestring'
    this.form_nodes = {
      'name': new Name(linestring_templates),
      'type': new Type(linestring_templates),
      'measure': new Measure('LineString')
    }
    this.form_node_labels = [
      ['name'],
      ['measure'],
      ['type']
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
  loadFeature (feature) {
    for (let label in this.form_nodes) {
      this.form_nodes[label].loadFeature(feature)
    }
  }
  saveFeature (feature) {
    for (let label in this.form_nodes) {
      this.form_nodes[label].saveFeature(feature)
    }
  }
  deactivateForm () {
    for (let label in this.form_nodes) {
      this.form_nodes[label].deactivateNode()
    }
  }
}

export default LineString
