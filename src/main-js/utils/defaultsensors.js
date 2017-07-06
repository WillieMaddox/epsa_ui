/**
 * Created by maddoxw on 11/1/16.
 */

'use strict'
// import $ from 'jquery'
import defaultSensorsData from '../../data/default_sensors.json'

const result = function (callback) {
  if (defaultSensorsData) {
    callback(defaultSensorsData)
  }
  // $.getJSON({
  //   url: 'data/default_sensors.json'
  // }).done(function (data) {
  //   if (callback) {
  //     callback(data)
  //   }
  // })
}

export default result
