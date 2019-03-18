'use strict'

const url = require('url')
const fetch = require('node-fetch')

const root = 'http://www.websequencediagrams.com'
const styles = [
  'default',
  'earth',
  'modern-blue',
  'mscgen',
  'omegapple',
  'qsd',
  'rose',
  'roundgreen',
  'napkin',
  'magazine',
  'vs2010',
  'patent']

class WSD {
  static async diagramURL (message, style = 'default', format = 'png', apikey = null) {
    if (message instanceof Buffer) {
      message = message.toString('utf8')
    }
    if (WSD.styles.indexOf(style) === -1) {
      throw new Error('Unknown style: ' + style)
    }
    if (['png', 'pdf', 'svg'].indexOf(format) === -1) {
      throw new Error('Unknown format: ' + format)
    }

    const query = new url.URLSearchParams(apikey ? {
      apiVersion: '1',
      message,
      style,
      format,
      apikey
    } : {
      apiVersion: '1',
      message,
      style,
      format
    })
    const res = await fetch(`${WSD.root}/index.php`, {
      method: 'POST',
      body: query
    })
    if (res.status !== 200) {
      throw new Error(`HTTP Error: ${res.status}`)
    }
    const jres = await res.json()
    if (!jres.errors) {
      throw new Error('Invalid JSON response: ' + jres)
    }
    if (jres.errors.length > 0) {
      throw new Error(jres.errors.join(', '))
    }
    return `${WSD.root}/${jres.img}`
  }

  static async diagram (description, style, format, apikey) {
    const u = await WSD.diagramURL(description, style, format, apikey)
    const res = await fetch(u)
    const ct = res.headers.get('content-type')
    const buf = await res.buffer()
    return [buf, ct]
  }
}
WSD.styles = styles
WSD.root = root

module.exports = WSD
