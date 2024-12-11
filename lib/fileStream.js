'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const {Buffer} = require('node:buffer');

/**
 * Promisified stream for a file.  Can be replaced with fs.promises one day.
 */
class FileStream {
  /**
   * Creates an instance of FileStream.
   *
   * @param {string} [name='-'] File name, or '-' for stdin.
   */
  constructor(name = '-') {
    this.name = name;
    if (name === '-') {
      this.stream = process.stdin;
      process.stdin.resume();
    } else {
      this.stream = fs.createReadStream(name);
    }
  }

  /**
   * Read the entire file.
   *
   * @returns {Promise<Buffer>} The contents of the file.
   */
  read() {
    return new Promise((resolve, reject) => {
      const bufs = /** @type {Buffer[]} */([]);
      this.stream.on('error', reject);
      this.stream.on('data', (/** @type {Buffer} */ data) => bufs.push(data));
      this.stream.on('end', () => resolve(Buffer.concat(bufs)));
    });
  }

  /**
   * Create a FileStream for each file in names.  If one of the names is a
   * directory, read all of the `.wsd` files in that directory.
   *
   * @param {string[]} names File or directory names.
   * @returns {Promise<FileStream[]>} File contents.
   */
  static async createAll(names) {
    const streams = await Promise.all(names.map(async n => {
      if (n === '-') {
        // Prevent stat() throwing
        return new FileStream();
      }
      const stats = await fsp.stat(n);
      if (stats.isDirectory()) {
        const dir = await fsp.readdir(n);
        return dir
          .filter(f => f.endsWith('.wsd'))
          .map(fn => new FileStream(path.join(n, fn)));
      }
      return new FileStream(n);
    }));
    return streams.flat();
  }
}

module.exports = FileStream;
