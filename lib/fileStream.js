'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const stat = util.promisify(fs.stat)
const readdir = util.promisify(fs.readdir)

class FileStream {
  constructor (name = '-') {
    this.name = name
    if (name === '-') {
      this.stream = process.stdin
      process.stdin.resume()
    } else {
      this.stream = fs.createReadStream(name)
    }
  }
  read () {
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
  static async createAll (names) {
    let streams = await Promise.all(names.map(async n => {
      if (n === '-') {
        // stat() would throw
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
    // streams.flat()
    return streams.reduce((prev, s) => {
      if (Array.isArray(s)) {
        return prev.concat(s)
      } else {
        prev.push(s)
        return prev
      }
    }, [])
  }
}

module.exports = FileStream
