import 'openlayers'

interface FeatureInterface {
  destroy(a: string);
  createForm();
  addFormRow(labels: string[]);
  styleForm();
  loadFeature(feature: ol.Feature);
  saveFeature(feature: ol.Feature);
  registerForEvents();
}

export default FeatureInterface
