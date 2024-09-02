# Three.js Journey

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```


The tone mapping intends to convert High Dynamic Range (HDR) values to Low Dynamic Range (LDR) values.

While we are indeed talking about the same HDR as for the environment map, tone mapping in Three.js will actually fake the process of converting LDR to HDR even if the colors aren’t HDR resulting in a very realistic render.


We call aliasing an artifact that might appear in some situations where we can see a stair-like effect, usually on the edge of the geometries. （锯齿状）
also depends on the pixel ratio
