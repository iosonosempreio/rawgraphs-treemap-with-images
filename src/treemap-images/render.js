import * as d3 from 'd3'
import { legend } from '@rawgraphs/rawgraphs-core'
import '../d3-styles.js'

export function render(
  svgNode,
  data,
  visualOptions,
  mapping,
  originalData,
  styles
) {
  const {
    // artboard
    width,
    height,
    background,
    // margins
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    // legend
    showLegend,
    legendWidth,
    // colors
    colorScale,
    // chart options
    tiling,
    padding,
    // labels
    showLabelsOutline,
    showHierarchyLabels,
    labelStyles,
    fillArea,
    imagesStrokeSize,
  } = visualOptions

  const margin = {
    top: marginTop,
    right: marginRight,
    bottom: marginBottom,
    left: marginLeft,
  }

  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // create the hierarchical structure
  const nest = d3.rollup(
    data,
    (v) => v[0],
    ...mapping.hierarchy.value.map((level) => (d) => d.hierarchy.get(level))
  )

  const hierarchy = d3
    .hierarchy(nest)
    .sum((d) => (d[1] instanceof Map ? 0 : d[1].size)) // since maps have a .size porperty in native javascript, sum only values for leaves, and not for Maps

  //@TODO: understand how to handle empty values

  const treemap = d3
    .treemap()
    .tile(d3[tiling])
    .size([chartWidth, chartHeight])
    .padding(padding)
    .round(true)

  if (showHierarchyLabels) {
    treemap.paddingTop(12)
  }

  const root = treemap(hierarchy)

  // add background
  d3.select(svgNode)
    .append('rect')
    .attr('width', showLegend ? width + legendWidth : width)
    .attr('height', height)
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', background)
    .attr('id', 'backgorund')

  if (!fillArea) {
    d3.select(svgNode)
      .append('filter')
      .attr('id', 'blurImages')
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', 3)
  }

  const svg = d3
    .select(svgNode)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('id', 'viz')

  // if selected, draw a rectangle for each level in the hierarchy

  if (showHierarchyLabels) {
    const ancestorData = root.descendants().filter((d) => d.children)
    const depthScale = d3.scaleLinear().domain([0, root.leaves()[0].depth + 1])
    const ancestors = svg
      .append('g')
      .attr('id', 'ancestors')
      .selectAll('rect')
      .data(ancestorData)
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`)

    ancestors
      .append('rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('id', (d, i) => 'path_ancestor' + i)
      .attr('fill', '#ccc')
      .attr('fill-opacity', (d) => depthScale(d.depth))
      .attr('stroke', '#ccc')
      .attr('stroke-opacity', (d) => depthScale(d.depth) + 0.1)

    if (showHierarchyLabels) {
      ancestors
        .append('clipPath')
        .attr('id', (d, i) => 'clip_ancestor' + i)
        .append('use')
        .attr('xlink:href', (d, i) => '#path_ancestor' + i)

      ancestors
        .append('text')
        .attr('x', padding)
        .attr('y', 2)
        .attr('clip-path', (d, i) => 'url(#clip_ancestor' + i + ')')
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', 8)
        .attr('dominant-baseline', 'text-before-edge')
        .attr('class', 'txt')
        .text((d) => {
          return d.depth === 0 && !d.data[0] ? 'Root' : d.data[0]
        })
    }
  }

  const leaves = svg
    .append('g')
    .attr('id', 'leaves')
    .selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('transform', (d) => `translate(${d.x0},${d.y0})`)

  leaves
    .append('rect')
    .attr('id', (d, i) => 'path' + i)
    .attr('fill', (d) => {
      let value = colorScale(d.data[1].color)
      if (mapping.images.value) {
        value = 'white'
      }
      return value
    })
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)

  leaves
    .append('clipPath')
    .attr('id', (d, i) => 'clip' + i)
    .append('use')
    .attr('xlink:href', (d, i) => '#path' + i)

  // images
  if (mapping.images.value) {
    if (!fillArea) {
      const blurPadding = 10
      leaves
        .append('image')
        .attr('id', (d, i) => 'image-blurred' + i)
        .attr('xlink:href', (d) => d.data[1].images)
        .attr('width', (d) => d.x1 - d.x0 + blurPadding)
        .attr('height', (d) => d.y1 - d.y0 + blurPadding)
        .attr('x', -blurPadding / 2)
        .attr('y', -blurPadding / 2)
        .attr('preserveAspectRatio', `xMidYMid ${fillArea ? 'slice' : 'slice'}`)
        .attr('clip-path', (d, i) => 'url(#clip' + i + ')')
        .attr('filter', 'url(#blurImages)')
        .attr('opacity', 0.6)
    }

    leaves
      .append('image')
      .attr('id', (d, i) => 'image' + i)
      .attr('xlink:href', (d) => d.data[1].images)
      .attr('width', (d) => Math.max(0, d.x1 - d.x0 - imagesStrokeSize * 2))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0 - imagesStrokeSize * 2))
      .attr('x', imagesStrokeSize)
      .attr('y', imagesStrokeSize)
      .attr('preserveAspectRatio', `xMidYMid ${fillArea ? 'slice' : 'meet'}`)
      .attr('clip-path', (d, i) => 'url(#clip' + i + ')')

    leaves
      .append('rect')
      .attr('id', (d, i) => 'image-border' + i)
      .attr('width', (d) => Math.max(1, d.x1 - d.x0 - imagesStrokeSize))
      .attr('height', (d) => Math.max(1, d.y1 - d.y0 - imagesStrokeSize))
      .attr('x', Math.max(0, imagesStrokeSize / 2))
      .attr('y', Math.max(0, imagesStrokeSize / 2))
      .attr('fill', 'none')
      .attr('stroke', (d) => colorScale(d.data[1].color))
      .attr('stroke-width', imagesStrokeSize)
      .attr('clip-path', (d, i) => 'url(#clip' + i + ')')
  }

  const labels = leaves
    .append('text')
    .attr('clip-path', (d, i) => 'url(#clip' + i + ')')
    .attr('font-family', 'Arial, sans-serif')
    .attr('font-size', 10)
    .attr('class', 'txt')
    .attr('x', 3)
    .attr('y', 12)

  labels
    .selectAll('tspan')
    .data((d, i, a) => {
      return Array.isArray(d.data[1].label)
        ? d.data[1].label
        : [d.data[1].label]
    })
    .join('tspan')
    .attr('x', 3)
    .attr('dy', (d, i) => (i === 0 ? 0 : 12))
    .text((d, i) => {
      if (d && mapping.label.dataType[i].type === 'date') {
        return d3.timeFormat(dateFormats[mapping.label.dataType[i].dateFormat])(
          d
        )
      } else {
        return d
      }
    })
    .styles((d, i) => styles[labelStyles[i]])

  if (showLabelsOutline) {
    d3.selectAll('.txt').styles(styles.labelOutline)
    const outlines = labels
      .clone(true)
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
    labels.raise()
  }

  if (showLegend) {
    const legendLayer = d3
      .select(svgNode)
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${width},${marginTop})`)

    const chartLegend = legend().legendWidth(legendWidth)

    if (mapping.color.value) {
      chartLegend.addColor(mapping.color.value, colorScale)
    }

    legendLayer.call(chartLegend)
  }
}
