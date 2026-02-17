'use strict';

const {Buffer} = require('node:buffer');
const {test} = require('node:test');
const assert = require('node:assert');
const nock = require('nock');
const path = require('node:path');
const wsd = require('../lib/wsd');

const desc = `
title Authentication Sequence

Alice->Bob: Authentication Request
note right of Bob: Bob thinks about it
Bob->Alice: Authentication Response
`;

test('wsd', async t => {
  const state = {};
  t.before(async () => {
    nock.back.fixtures = path.join(__dirname, 'fixtures');
    if (!process.env.NOCK_BACK_MODE) {
      nock.back.setMode('lockdown');
    }
    const title = escape(path.basename(__filename));
    const {nockDone, context} = await nock.back(`${title}.json`);
    if (context.scopes.length === 0) {
      // Set the NOCK_BACK_MODE variable to "record" when needed
      if (process.env.NOCK_BACK_MODE !== 'record') {
        // eslint-disable-next-line no-console
        console.error(`WARNING: Nock recording needed for "${title}".
Set NOCK_BACK_MODE=record`);
      }
    }
    state.nockDone = nockDone;
  });

  t.after(() => {
    state.nockDone();
    assert(nock.isDone());
  });

  await t.test('url', async () => {
    const u = await wsd.diagramURL(desc, 'default', 'png');
    assert.match(u, /^https:\/\/www.websequencediagrams.com\/\?png=.+/);
  });

  await t.test('url buffer', async () => {
    const u = await wsd.diagramURL(Buffer.from(desc), 'earth');
    assert.match(u, /^https:\/\/www.websequencediagrams.com\/\?png=.+/);
  });

  await t.test('bad style', async () => {
    await assert.rejects(
      () => wsd.diagramURL(desc, 'snoopy', 'png'),
      {message: 'Unknown style: snoopy'}
    );
  });

  await t.test('bad type', async () => {
    await assert.rejects(
      () => wsd.diagramURL(desc, 'default', 'snoopy'),
      {message: 'Unknown format: snoopy'}
    );
  });

  await t.test('pdf requires account', async () => {
    await assert.rejects(
      () => wsd.diagramURL('Alice\n', undefined, 'pdf'),
      {message: '402 Payment Required: API Key Required for PDF'}
    );
  });

  await t.test('diagram', async () => {
    const [buf, typ] = await wsd.diagram(desc);
    assert(Buffer.isBuffer(buf));
    assert.equal(typ, 'image/png');
  });

  await t.test('invalid wsd', async () => {
    await assert.rejects(
      () => wsd.diagramURL('Alice->'),
      {message: 'Line 1: Syntax error.'}
    );
  });
});
