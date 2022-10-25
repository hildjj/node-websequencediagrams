'use strict'

const test = require('ava')
const wsd = require('../lib/wsd')
const path = require('path')
const {Buffer} = require('buffer')

const desc = `
title Authentication Sequence

Alice->Bob: Authentication Request
note right of Bob: Bob thinks about it
Bob->Alice: Authentication Response
`

const nock = require('nock')

test.before(async t => {
  nock.back.fixtures = path.join(__dirname, 'fixtures')
  if (!process.env.NOCK_BACK_MODE) {
    nock.back.setMode('lockdown')
  }
  const title = escape(path.basename(__filename))
  const {nockDone, context} = await nock.back(`${title}.json`)
  if (context.scopes.length === 0) {
    // Set the NOCK_BACK_MODE variable to "record" when needed
    if (process.env.NOCK_BACK_MODE !== 'record') {
      // eslint-disable-next-line no-console
      console.error(`WARNING: Nock recording needed for "${title}".
Set NOCK_BACK_MODE=record`)
    }
  }
  t.context.nockDone = nockDone
})

test.after(t => {
  t.context.nockDone()
  t.truthy(nock.isDone())
})

test('url', async t => {
  const u = await wsd.diagramURL(desc, 'default', 'png')
  t.regex(u, /^http:\/\/www.websequencediagrams.com\/\?png=.+/)
})

test('url buffer', async t => {
  const u = await wsd.diagramURL(Buffer.from(desc))
  t.regex(u, /^http:\/\/www.websequencediagrams.com\/\?png=.+/)
})

test('bad style', async t => {
  await t.throwsAsync(
    () => wsd.diagramURL(desc, 'snoopy', 'png'),
    {message: 'Unknown style: snoopy'}
  )
})

test('bad type', async t => {
  await t.throwsAsync(
    () => wsd.diagramURL(desc, 'default', 'snoopy'),
    {message: 'Unknown format: snoopy'}
  )
})

test('pdf requires account', async t => {
  await t.throwsAsync(
    () => wsd.diagramURL('Alice\n', undefined, 'pdf'),
    {message: 'HTTP Error: 402'}
  )
})

test('diagram', async t => {
  const [buf, typ] = await wsd.diagram(desc)
  t.truthy(Buffer.isBuffer(buf))
  t.is(typ, 'image/png')
})

test('invalid wsd', async t => {
  await t.throwsAsync(
    () => wsd.diagramURL('Alice->'),
    {message: 'Line 1: Syntax error.'}
  )
})
