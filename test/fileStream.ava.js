'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const stream = require('node:stream');
const test = require('ava');
const tmp = require('tmp-promise');
const FileStream = require('../lib/fileStream');
tmp.setGracefulCleanup();

const desc = `
title Authentication Sequence

Alice->Bob: Authentication Request
note right of Bob: Bob thinks about it
Bob->Alice: Authentication Response
`;
const files = ['1.wsd', '2.wsd'];

test.before(async t => {
  t.context = await tmp.dir({keep: false});
  t.context.files = [];
  for (const f of files) {
    const fn = path.join(t.context.path, f);
    t.context.files.push(fn);
    await fs.writeFile(fn, desc);
  }
});

test.after(async t => {
  for (const f of t.context.files) {
    await fs.unlink(f);
  }
  t.context.cleanup();
});

test('stdin', async t => {
  const f = new FileStream();
  t.truthy(f instanceof FileStream);
  t.truthy(f.stream instanceof stream.Readable);
  const streams = await FileStream.createAll(['-']);
  t.is(streams.length, 1);
  process.stdin.destroy();
});

test('all', async t => {
  const streams = await FileStream.createAll([t.context.path]);
  t.is(streams.length, files.length);
  const individuals = await FileStream.createAll(t.context.files);
  t.is(individuals.length, files.length);
});

test('read', async t => {
  const streams = await FileStream.createAll([t.context.path]);
  const bufs = await Promise.all(streams.map(s => s.read()));
  bufs.forEach(b => {
    const s = b.toString('utf8');
    t.is(s, desc);
  });
});

test('error', async t => {
  const fn = path.join(t.context.path, 'DOES_NOT_EXIST');
  const f = new FileStream(fn);
  await t.throwsAsync(() => f.read());
});
