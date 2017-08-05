/**
 * Created by maddoxw on 11/1/16.
 */

'use strict'
import default_radios from '../../../data/default_radios.json'

const result = function (callback) {
  if (default_radios) {
    callback(default_radios)
  }
}

export default result
