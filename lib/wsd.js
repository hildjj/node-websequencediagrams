'use strict'

const fetch = require('node-fetch')
const {Buffer} = require('buffer')

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
  'patent',
]

/**
 * API for WebSequenceDiagrams.
 *
 * @see https://www.websequencediagrams.com/embedding.html
 */
class WSD {
  /**
   * Get the URL for a given diagram.
   *
   * @param {string|Buffer} message The diagram description.
   * @param {string} [style='default'] Style of the diagram.  Valid styles
   *   include: 'default', 'earth', 'modern-blue', 'mscgen', 'omegapple', 'qsd',
   *   'rose', 'roundgreen', 'napkin', 'magazine', 'vs2010', or 'patent'.
   * @param {string} [format='png'] Format for the output.  Valid output formats
   *   include: 'png', 'svg', or 'pdf'.  'pdf' requires a paid account.
   * @param {string} [apikey] API key for non-free usage.
   * @returns {Promise<string>} The URL for the diagram.
   */
  static async diagramURL(message, style = 'default', format = 'png', apikey = null) {
    if (message instanceof Buffer) {
      message = message.toString('utf8')
    }
    if (WSD.styles.indexOf(style) === -1) {
      throw new Error(`Unknown style: ${style}`)
    }
    if (['png', 'pdf', 'svg'].indexOf(format) === -1) {
      throw new Error(`Unknown format: ${format}`)
    }

    const query = new URLSearchParams(apikey ?
      {
        apiVersion: '1',
        message,
        style,
        format,
        apikey,
      } :
      {
        apiVersion: '1',
        message,
        style,
        format,
      })
    const res = await fetch(`${WSD.root}/index.php`, {
      method: 'POST',
      body: query,
    })
    if (res.status !== 200) {
      throw new Error(`HTTP Error: ${res.status}`)
    }
    const jres = await res.json()
    if (!jres.errors) {
      throw new Error(`Invalid JSON response: ${jres}`)
    }
    if (jres.errors.length > 0) {
      throw new Error(jres.errors.join(', '))
    }
    return `${WSD.root}/${jres.img}`
  }

  /**
   * Retrieve a diagram.
   *
   * @param {string} description The diagram description.
   * @param {string} [style='default'] Style of the diagram.  Valid styles
   *   include: 'default', 'earth', 'modern-blue', 'mscgen', 'omegapple',
   *   'qsd', 'rose', 'roundgreen', 'napkin', 'magazine', 'vs2010', or
   *   'patent'.
   * @param {string} [format='png'] Format for the output.  Valid output
   *   formats include: 'png', 'svg', or 'pdf'.  'pdf' requires a paid
   *   account.
   * @param {string} [apikey] API key for non-free usage.
   * @returns {Promise<Array>} Array with the contents of the diagram as the
   *   first item and the MIME type of the response as the second item.
   */
  static async diagram(description, style, format, apikey) {
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
