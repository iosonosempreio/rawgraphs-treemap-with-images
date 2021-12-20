# Treemap with images
A custom model for RAWGraphs 2.0 that allows to produce treemaps with images.

Use this example [dataset](example/datasets/photos-twitter-base64.csv), with the following data mapping:

![Texture fills each area](docs/mapping.png)

### Textures visual options
#### Fill area
| `true` | `false` |
| --- | --- |
| ![Texture fills each area](docs/stroke-0-fill.png) | ![Texture is entirely visible, plus blur](docs/stroke-0.png) |
| Each image fills the available area and is clipped to it, similarly to the CSS property `background-size: cover`. | Each image is contained and centered into the available area. The uncovered space is filled with a blur. |

#### Stroke size
Controls the size of the stroke around images.
| value = 2 | value = 5 | value = 10 | value = 0 |
| - | - | - | - |
| ![stroke 2](docs/stroke-2.png) | ![stroke](docs/stroke-5.png) | ![stroke](docs/stroke-10.png) | ![stroke](docs/stroke-0.png) |


### Test the chart

The custom chart [comes as a js file](docs/images-treemap.v0.2.umd.js) that you can load into RAWGraphs. Currently is an experimental feature, use this [nightly build](https://rawcustom.sandbox.inmagik.com/) to test:

- load the dataset
- load and select the custom model
- map the data
- <button>profit!</button>

### Compile your dataset

Create a dataset with a column where images are stored as base64 strings. Similar files can consume quite a lot of storage, but  allow to preserve images even if they go offline at some point in the future. Such datasets can be created with a tool like [this one](https://observablehq.com/@iosonosempreio/images-table-to-base64).

| category-1  | category-2 | textures |
| ------------- | ------------- | ------------- |
| User  | Post  | "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..." |

### Create your custom visual model

Fork this [template](https://github.com/gffuma/custom-rawcharts-template-test) by [@gffuma](https://github.com/gffumar).

