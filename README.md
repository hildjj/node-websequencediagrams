Call the WebSequenceDiagram.com API.

## Command Line

    wsd_get [options] [input file...]

    Generate a diagram with websequencediagrams.com

    Options:
    -h, --help    Show help
    -f, --format  Format for output (one of [png, pdf, svg])  [default: "png"]
    -o, --output  Output file (defaults to wsd.[png, pdf, svg])
    -s, --style   Output style (one of: [default, earth, modern-blue, mscgen,
                  omegapple, qsd, rose, roundgreen, napkin, magazine, vs2010,
                  patent])
    -r, --root    The base URL for the service, which defaults to
                  "http://www.websequencediagrams.com".  It can be modified
                  to suit your needs, if you have a private installation.
    -k, --key     WebSequenceDiagrams API key.  Key can also be specified with
                  the WSD_APIKEY environment variable.  Requires a premium
                  account.  See https://www.websequencediagrams.com/order.html

## API

Example:

```js
const wsd = require('websequencediagrams');
const fs = require('node:fs');

(async() => {
  const [buf, typ] = await wsd.diagram('Alice->Bob: message', 'modern-blue', 'png');
  console.log('Received MIME type:', typ);
  fs.writeFile('my.png', buf);
})();
```

### .diagram(text, style, output_type)
Takes the text to turn into a diagram, the style name, and the output type.

Valid output types include "png", "svg", and "pdf".

Returns a promise for an array containing a Buffer and a MIME type.

### .diagramURL(text, style, output_type)
Takes the text to turn into a diagram, the style name, and the output type.

Valid output types include "png", "svg", and "pdf".

Returns a promise for a string containing the URL where the diagram can be found.

### .styles
.styles is an array of all of the currently-known style types.

### .root
.root is the URL for the service, which defaults to "http://www.websequencediagrams.com".  It can be modified to suit your needs.

### License
This code is licensed under the [Apache Software License, 2.0](http://www.apache.org/licenses/LICENSE-2.0)

[![Tests](https://github.com/hildjj/node-websequencediagrams/actions/workflows/node.js.yml/badge.svg)](https://github.com/hildjj/node-websequencediagrams/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/hildjj/node-websequencediagrams/badge.svg?branch=main)](https://coveralls.io/github/hildjj/node-websequencediagrams?branch=main)
