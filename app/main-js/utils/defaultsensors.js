/**
 * Created by maddoxw on 11/1/16.
 */

'use strict'

const $ = require('jquery')
module.exports = function (callback) {
  $.getJSON({
    url: 'data/default_sensors.json'
  }).done(function (data) {
    if(callback) callback(data)
  })
}

