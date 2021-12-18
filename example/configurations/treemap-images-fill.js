import treemapImages from 'customcharts/treemap-images'
import data from '../datasets/photos-twitter-base64.csv'

export default {
  chart: treemapImages,
  data,
  dataTypes: {
    Likes: 'number',
    Category: 'string',
    base64: 'string',
    Photo: 'string',
  },
  mapping: {
    hierarchy: { value: ['Category', 'Photo'] },
    color: {
      value: ['Photo'],
      config: { aggregation: ['csvDistinct'] },
    },
    size: {
      value: ['Likes'],
      config: { aggregation: ['sum'] },
    },
    textures: {
      value: ['base64'],
      config: { aggregation: ['csvDistinct'] },
    },
    label: {
      value: ['Category', 'Photo'],
      config: { aggregation: ['csvDistinct', 'sum', 'csvDistinct'] },
    },
  },
  visualOptions: {
    width: 500,
    height: 500,
    drawHierarchy: true,
    showLabelsOutline: true,
    showHierarchyLabels: false,
    padding: 2,
    fillArea: true,
    texturesStrokeSize: 10
  },
}
