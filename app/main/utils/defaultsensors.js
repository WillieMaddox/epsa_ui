/**
 * Created by maddoxw on 11/1/16.
 */

define(function (require) {
  'use strict'

  const $ = require('jquery')
  return function (callback) {
    $.getJSON({
      url: 'data/default_sensors.json'
    }).done(function (data) {
      if(callback) callback(data)
    })
  }
})