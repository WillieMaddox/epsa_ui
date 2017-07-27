/**
 * Created by maddoxw on 11/1/16.
 */

'use strict'
import defaultCameras from '../../../data/default_cameras.json'

const result = function (callback) {
  if (defaultCameras) {
    callback(defaultCameras)
  }
}

export default result
