'use strict';

const {Buffer} = require('node:buffer');
const {version} = require('../package.json');

const defaultRoot = 'https://www.websequencediagrams.com';
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
];

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
   *   include: 'default', 'earth', 'modern-blue', 'mscgen', 'omegapple',
   *   'qsd', 'rose', 'roundgreen', 'napkin', 'magazine', 'vs2010', or
   *   'patent'.
   * @param {string} [format='png'] Format for the output.  Valid output
   *   formats include: 'png', 'svg', or 'pdf'.  'pdf' requires a paid
   *   account.
   * @param {string} [apikey] API key for non-free usage.
   * @param {string} [root='https://www.websequencediagrams.com'] Root URL for
   *   the service.
   * @returns {Promise<string>} The URL for the diagram.
   */
  // eslint-disable-next-line max-params
  static async diagramURL(
    message,
    style = 'default',
    format = 'png',
    apikey = null,
    root = defaultRoot
  ) {
    const msg = Buffer.isBuffer(message) ? message.toString('utf8') : message;
    if (WSD.styles.indexOf(style) === -1) {
      throw new Error(`Unknown style: ${style}`);
    }
    if (['png', 'pdf', 'svg'].indexOf(format) === -1) {
      throw new Error(`Unknown format: ${format}`);
    }

    const query = new URLSearchParams({
      apiVersion: '1',
      message: msg,
      style,
      format,
      ...(apikey ? {apikey} : {}),
    });

    const u = new URL('index.php', root);
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const res = await fetch(u, {
      method: 'POST',
      body: query,
      redirect: 'error',
      headers: {
        'user-agent': `node-websequencediagrams/${version}`,
      },
    });
    if (res.status !== 200) {
      throw new Error(`${res.status} ${res.statusText}: ${res.headers.get('status')}`);
    }
    const jres = await res.json();
    if (jres.errors?.length > 0) {
      throw new Error(jres.errors.join(', '));
    }
    return new URL(jres.img, root).toString();
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
   * @param {string} [root] Root URL for the service.
   * @returns {Promise<Array>} Array with the contents of the diagram as the
   *   first item and the MIME type of the response as the second item.
   */
  // eslint-disable-next-line max-params
  static async diagram(description, style, format, apikey, root) {
    const u = await WSD.diagramURL(description, style, format, apikey, root);
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const res = await fetch(u);
    const ct = res.headers.get('content-type');
    const buf = await res.arrayBuffer();
    return [Buffer.from(buf), ct];
  }
}
WSD.styles = styles;

module.exports = WSD;
