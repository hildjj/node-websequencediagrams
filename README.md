Call the WebSequenceDiagram.com API.

Example:

    var wsd = require('websequencediagrams');
    var fs = require('fs');
    wsd.diagram("Alice->Bob: message", "modern-blue", "png", function(er, buf, typ) {
    	if (er) {
    		console.error(er);    		
    	} else {
    		console.log("Received MIME type:", typ);
    		fs.writeFile("my.png", buf);
    	}
    });

### .diagram(text, style, output_type, callback)
Takes the text to turn into a diagram, the style name, the output type, and a callback.

Valid output types include "png", "svg", and "pdf".

The callback takes an error, a Buffer, and a MIME type

### .styles
.styles is an array of all of the currently-known style types.

### .root
.root is the URL for the service, which defaults to "http://www.websequencediagrams.com".  It can be modified to suit your needs.

### License
This code is licensed under the [Apache Software License, 2.0](http://www.apache.org/licenses/LICENSE-2.0)
