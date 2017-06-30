/**
 * Created by maddoxw on 7/23/16.
 */


const tobjectTemplates = {
  aor: {
    geometry_type: 'Polygon'
    // properties: {}
  },
  building: {
    geometry_type: 'Polygon',
    height: 10
    // properties: {
    //     height: 10
    // }
  },
  herbage: {
    geometry_type: 'Polygon',
    height: 10
    // properties: {
    //     height: 10
    // }
  },
  water: {
    geometry_type: 'Polygon'
    // properties: {}
  },
  wall: {
    geometry_type: 'LineString',
    height: 10,
    thickness: 10
    // properties: {
    //     height: 10,
    //     thickness: 10
    // }
  },
  road: {
    geometry_type: 'LineString',
    thickness: 10
    // properties: {
    //     thickness: 10
    // }
  },
  generic: {
    // properties: {}
  }
}

const tobjectColor = {
  'aor': [0, 0, 0],
  'building': [128, 128, 128],
  'herbage': [0, 200, 0],
  'water': [0, 0, 200],
  'wall': [64, 64, 64],
  'road': [192, 51, 52],
  'generic': [218, 188, 163]
}


for (let template in tobjectTemplates) {
  if (tobjectTemplates.hasOwnProperty(template)) {
    tobjectTemplates[template].color = tobjectColor[template]
    tobjectTemplates[template].fillopacity = template === 'aor' ? 0 : 0.5
  }
}

module.exports = tobjectTemplates

