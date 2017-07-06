/**
 * Created by maddoxw on 11/1/16.
 */

'use strict'
import $ from 'jquery'

export default function (callback) {
  $.getJSON({
    url: 'data/default_sensors.json'
  }).done(function (data) {
    if (callback) {
      callback(data)
    }
  })
}

