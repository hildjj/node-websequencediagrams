'use strict';

const {test} = require('node:test');
const assert = require('node:assert');
const FileStream = require('../lib/fileStream');
const fs = require('node:fs/promises');
const path = require('node:path');
const stream = require('node:stream');
const tmp = require('tmp-promise');
tmp.setGracefulCleanup();

const desc = `
title Authentication Sequence

Alice->Bob: Authentication Request
note right of Bob: Bob thinks about it
Bob->Alice: Authentication Response
`;
const files = ['1.wsd', '2.wsd'];

test('fileStream', async t => {
  let context = {};
  t.before(async () => {
    context = await tmp.dir({keep: false});
    context.files = [];
    for (const f of files) {
      const fn = path.join(context.path, f);
      context.files.push(fn);
      await fs.writeFile(fn, desc);
    }
  });

  t.after(async () => {
    for (const f of context.files) {
      await fs.unlink(f);
    }
    context.cleanup();
  });

  await t.test('stdin', async () => {
    const f = new FileStream();
    assert(f instanceof FileStream);
    assert(f.stream instanceof stream.Readable);
    const streams = await FileStream.createAll(['-']);
    assert.equal(streams.length, 1);
    process.stdin.destroy();
  });

  await t.test('all', async () => {
    const streams = await FileStream.createAll([context.path]);
    assert.equal(streams.length, files.length);
    const individuals = await FileStream.createAll(context.files);
    assert.equal(individuals.length, files.length);
  });

  await t.test('read', async () => {
    const streams = await FileStream.createAll([context.path]);
    const bufs = await Promise.all(streams.map(s => s.read()));
    bufs.forEach(b => {
      const s = b.toString('utf8');
      assert.equal(s, desc);
    });
  });

  await t.test('error', async () => {
    const fn = path.join(context.path, 'DOES_NOT_EXIST');
    const f = new FileStream(fn);
    await assert.rejects(() => f.read());
  });
});
