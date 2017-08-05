/**
 * Created by maddoxw on 7/21/17.
 */

'use strict'

import $ from 'jquery'
import Name from '../nodes/name'
import Type from '../nodes/featuretype'
import Hole from '../nodes/hole'
import Measure from '../nodes/measure'
import OSMFire_Core from 'MainCore'
import polygon_templates from '../polygontemplates'

const form_elements = {}

const PolygonWidget = function (sandBox) {

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
      sandBox.addEventHandlerToParent('click', this.handleMainContainerClicked)
      this.registerForCustomEvents()
      sandBox.contextObj = this
      sandBox.log(1, 'featuretype constructor() called...', 'blue')

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
      for (let node of this.form_nodes) {
        node.styleNode()
      }
    }
    activateForm (feature) {
      for (let node of this.form_nodes) {
        node.activateNode(feature)
      }
    }
    loadFeature (feature) {
      for (let node of this.form_nodes) {
        node.loadFeature(feature)
      }
    }
    deactivateForm () {
      for (let node of this.form_nodes) {
        node.deactivateNode()
      }
    }
  }
  return Polygon

}

OSMFire_Core.registerComponent('mainPageContainer', 'notificationWidget', PolygonWidget)

// export default result
