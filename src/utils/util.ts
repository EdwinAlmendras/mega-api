/* import through from 'through' */
import { Readable, Stream } from "stream"
import { pipeline as pipe } from "stream";
export function s2b(stream): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {

    const chunks = []
    let complete
    stream.on('data', function (d) {
      chunks.push(d)
    })
    stream.on('end', function () {
      if (!complete) {
        complete = true
        resolve(Buffer.concat(chunks))
      }
    })
    stream.on('error', function (e) {
      reject(e)
    })
  })

}


export function b2s(binary): Stream {

  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    }
  });

  return readableInstanceStream;
}


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