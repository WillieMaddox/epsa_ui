/**
 * Created by maddoxw on 11/1/16.
 */

'use strict'
import defaultRadios from '../../../data/default_radios.json'

const result = function (callback) {
  if (defaultRadios) {
    callback(defaultRadios)
  }
}

export default result
