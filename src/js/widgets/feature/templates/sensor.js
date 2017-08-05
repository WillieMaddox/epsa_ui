/**
 * Created by maddoxw on 7/18/17.
 */

'use strict'

const sensor_properties = {
  source_height: {
    units: 'meter',
    value: 3
  },
  target_height: {
    units: 'meter',
    value: 1
  },
  isotropic: true,
  min_range: {
    units: 'meter',
    value: 0
  },
  max_range: {
    units: 'meter',
    value: 1000
  },
  pan: {
    wrt: 'north',
    units: 'degree',
    value: 0
  },
  tilt: {
    units: 'degree',
    value: 0
  }
}

export default sensor_properties
