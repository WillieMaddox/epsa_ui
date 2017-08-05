/**
 * Created by maddoxw on 11/1/16.
 */

'use strict'
import default_cameras from '../../../data/default_cameras.json'

const result = function (callback) {
  if (default_cameras) {
    callback(default_cameras)
  }
}

export default result
