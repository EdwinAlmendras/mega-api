"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.b2s = exports.s2b = void 0;
/* import through from 'through' */
const stream_1 = require("stream");
function s2b(stream) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const chunks = [];
        let complete;
        stream.on('data', function (d) {
            chunks.push(d);
        });
        stream.on('end', function () {
            if (!complete) {
                complete = true;
                resolve(Buffer.concat(chunks));
            }
        });
        stream.on('error', function (e) {
            reject(e);
        });
    }));
}
exports.s2b = s2b;
function b2s(binary) {
    const readableInstanceStream = new stream_1.Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
    return readableInstanceStream;
}
exports.b2s = b2s;
/* export function chunkSizeSafe (size) {
  let last
  return through(function (d) {
    if (last) d = Buffer.concat([last, d])

    const end = Math.floor(d.length / size) * size

    if (!end) {
      last = last ? Buffer.concat([last, d]) : d
    } else if (d.length > end) {
      last = d.slice(end)
      this.emit('data', d.slice(0, end))
    } else {
      last = undefined
      this.emit('data', d)
    }
  }, function () {
    if (last) this.emit('data', last)
    this.emit('end')
  })
}
 */
/* export function detectSize (cb) {
  const chunks = []
  let size = 0

  return through((d) => {
    chunks.push(d)
    size += d.length
  }, function () {
    // function IS needed
    cb(size)
    chunks.forEach(this.emit.bind(this, 'data'))
    this.emit('end')
  })
}

 */ 
