import treemapImages from 'customcharts/treemap-images'
import data from '../datasets/sample-photos-base64.csv'

export default {
  chart: treemapImages,
  data,
  dataTypes: {
    id: 'string',
    username: 'string',
    account: 'string',
    category: 'string',
    likes: 'number',
    url: 'string',
    base64: 'string',
  },
  mapping: {
    hierarchy: { value: ['category', 'username', 'id'] },
    color: {
      value: ['category'],
      config: { aggregation: ['csvDistinct'] },
    },
    size: {
      value: ['likes'],
      config: { aggregation: ['sum'] },
    },
    images: {
      value: ['url'],
      config: { aggregation: ['csvDistinct'] },
    },
    label: {
      value: ['id'],
      config: { aggregation: ['csvDistinct', 'sum', 'csvDistinct'] },
    },
  },
  visualOptions: {
    width: 500,
    height: 500,
    drawHierarchy: true,
    showLabelsOutline: true,
    showHierarchyLabels: false,
    padding: 0,
    fillArea: false,
    imagesStrokeSize: 2,
  },
}
