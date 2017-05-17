'use strict';

const test = require('ava');
const wsd = require('../lib/wsd');

const desc = `
title Authentication Sequence

Alice->Bob: Authentication Request
note right of Bob: Bob thinks about it
Bob->Alice: Authentication Response
`;

const nock = require('nock');
nock.back.fixtures = __dirname + '/fixtures';
//nock.back.setMode('record');
nock.back.setMode('lockdown');

function nb(t, cb) {
  nock.back(t.title.replace(/\s+/g, '-') + '.json', cb);
}

test.afterEach(t => {
  if (!nock.isDone()) {
    throw new Error('Nock NOT DONE');
  }
});

test.cb('url', t => {
  nb(t, nockDone => {
    wsd.diagram_url(desc, 'default', 'png', (er, u) => {
      nockDone();
      t.ifError(er);
      t.regex(u, /^http:\/\/www.websequencediagrams.com\/\?png=.+/);
      t.end();
    });
  });
});

test.cb('url buffer', t => {
  nb(t, nockDone => {
    wsd.diagram_url(new Buffer(desc), null, null, (er, u) => {
      nockDone();
      t.ifError(er);
      t.regex(u, /^http:\/\/www.websequencediagrams.com\/\?png=.+/);
      t.end();
    });
  });
});

test.cb('bad style', t => {
  wsd.diagram_url(desc, 'snoopy', 'png', (er, u) => {
    t.truthy(er);
    t.is(er.message, 'Unknown style: snoopy');
    t.end();
  });
});

test.cb('bad type', t => {
  wsd.diagram_url(desc, 'default', 'snoopy', (er, u) => {
    t.truthy(er);
    t.is(er.message, 'Unknown format: snoopy');
    t.end();
  });
});

test('no cb', t => {
  t.throws(() => wsd.diagram_url(desc));
  t.throws(() => wsd.diagram(desc));
});

test.cb('pdf requires account', t => {
  nb(t, nockDone => {
    wsd.diagram_url('Alice\n', null, 'pdf', (er, u) => {
      nockDone();
      t.truthy(er);
      t.is(er.message, 'HTTP Error: 402');
      t.end();
    });
  })
});

test.serial.cb('diagram', t => {
  nb(t, nockDone => {
    wsd.diagram(desc, null, null, (er, buf, typ) => {
      nockDone();
      t.ifError(er);
      t.truthy(Buffer.isBuffer(buf));
      t.is(typ, 'image/png');
      t.end();
    })
  })
});

test.cb('invalid content-length', t => {
  nock('http://www.websequencediagrams.com')
    .post('/index.php')
    .reply(200, {
      img: '?png=mscv6AKVv',
      errors: []
    }, {
      "Content-Length": 2
    });
  wsd.diagram_url(desc, null, null, (er, u) => {
    t.truthy(er);
    t.is(er.message, 'Invalid response size: 2 expected, 36 received')
    t.end();
  })
});

test.cb('invalid mime type', t => {
  nock('http://www.websequencediagrams.com')
    .post('/index.php')
    .reply(200, {
      img: '?png=mscv6AKVv',
      errors: []
    }, {
      "Content-Type": "foo",
      "Content-Length": 36
    });
  wsd.diagram_url(desc, null, null, (er, u) => {
    t.truthy(er);
    t.is(er.message, 'Invalid MIME type for JSON: foo');
    t.end();
  })
});

test.cb('invalid json', t => {
  nock('http://www.websequencediagrams.com')
    .post('/index.php')
    .reply(200, "{", {
      "Content-Type": "application/x-json",
      "Content-Length": 1
    });
  wsd.diagram_url(desc, null, null, (er, u) => {
    t.truthy(er);
    t.is(er.message, 'Unexpected end of JSON input');
    t.end();
  })
});

test.cb('invalid wsd', t => {
  nb(t, nockDone => {
    wsd.diagram_url('Alice->', null, null, (er, u) => {
      nockDone();
      t.truthy(er);
      t.is(er.message, 'Line 1: Syntax error.');
      t.end();
    });
  });
});