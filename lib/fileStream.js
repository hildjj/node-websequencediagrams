'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const {Buffer} = require('buffer')
const stat = util.promisify(fs.stat)
const readdir = util.promisify(fs.readdir)

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
    this.name = name
    if (name === '-') {
      this.stream = process.stdin
      process.stdin.resume()
    } else {
      this.stream = fs.createReadStream(name)
    }
  }

  /**
   * Read the entire file.
   *
   * @returns {Promise<Buffer>} The contents of the file.
   */
  read() {
    return new Promise((resolve, reject) => {
      const bufs = []
      this.stream.on('error', er => {
        console.error(`error opening file ${this.name}`)
        reject(er)
      })
      this.stream.on('data', data => bufs.push(data))
      this.stream.on('end', () => resolve(Buffer.concat(bufs)))
    })
  }

  /**
   * Create a FileStream for each file in names.  If one of the names is a
   * directory, read all of the `.wsd` files in that directory.
   *
   * @param {string[]} names File or directory names.
   * @returns {Promise<Buffer[]>} File contents.
   */
  static async createAll(names) {
    const streams = await Promise.all(names.map(async n => {
      if (n === '-') {
        // Prevent stat() throwing
        return new FileStream()
      }
      const stats = await stat(n)
      if (stats.isDirectory()) {
        const dir = await readdir(n)
        return dir
          .filter(f => f.endsWith('.wsd'))
          .map(fn => new FileStream(path.join(n, fn)))
      }
      return new FileStream(n)
    }))
    return streams.flat()
  }
}

module.exports = FileStream
