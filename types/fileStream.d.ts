/// <reference types="node" />
/// <reference types="node" />
export = FileStream;
/**
 * Promisified stream for a file.  Can be replaced with fs.promises one day.
 */
declare class FileStream {
    /**
     * Create a FileStream for each file in names.  If one of the names is a
     * directory, read all of the `.wsd` files in that directory.
     *
     * @param {string[]} names File or directory names.
     * @returns {Promise<FileStream[]>} File contents.
     */
    static createAll(names: string[]): Promise<FileStream[]>;
    /**
     * Creates an instance of FileStream.
     *
     * @param {string} [name='-'] File name, or '-' for stdin.
     */
    constructor(name?: string);
    name: string;
    stream: (NodeJS.ReadStream & {
        fd: 0;
    }) | fs.ReadStream;
    /**
     * Read the entire file.
     *
     * @returns {Promise<Buffer>} The contents of the file.
     */
    read(): Promise<Buffer>;
}
import fs = require("fs");
import { Buffer } from "buffer";
