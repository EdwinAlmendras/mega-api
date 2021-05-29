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
donwload({ nodeId, filePath, options }, { nodeId: string, filePath: string, options: { silent: boolean, highWaterMark: number } });
Promise < string > {
    return: new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        options || (options = {
            silent: true,
            highWaterMark: 128 * 1024,
        });
        const { highWaterMark, silent } = options;
        let progress = 0;
        const stream = yield this.getData({ nodeId });
        const { properties, size } = this.get({ nodeId });
        const dirPath = path.join(__dirname, "..", "..", "downloads");
        filePath || (filePath = `${dirPath}/${properties.name}`);
        const writable = createWriteStream(filePath, { highWaterMark });
        stream
            .pipe(writable)
            .on("end", () => {
            resolve(filePath);
        })
            .on("error", (err) => {
            reject(err);
        })
            .on("data", (d) => {
            progress += d.length;
            if (process.stdout.isTTY) {
                if (!silent) {
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Downloaded ${progress} bytes`);
                }
                this.emit("progress", {
                    donwloaded: progress,
                    totalSize: size,
                    porcentageDownloaded: (progress * 100) / Number(size),
                });
            }
        });
    }))
};
upload(params);
Promise < Schema$File > {
    return: new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let { path, stream, properties, name, url, targetId, key, thumbnail, preview, size, options, } = params;
        // eslint-disable-next-line prefer-promise-reject-errors
        if (stream) {
            if (!name)
                return Promise.reject(new Error("Filename is required for upload streams"));
        }
        else if (path) {
            stream = createReadStream(path);
            name || (name = properties.name || path.basename(path));
        }
        else if (url) {
            stream = yield axios.get(url, {
                responseType: "stream",
            });
            name || (name = (yield axios.get(url)).headers["content-disposition"].split("filename=")[1]);
        }
        properties || (properties = {
            name,
        });
        key || (key = randomBytes(24));
        const encrypter = createEncrypterStream(key, { start: 0 });
        const folder = this.get({ nodeId: targetId });
        if (thumbnail) {
            const type = TYPE_FILE_DATA["thumbnail"];
            const hash = yield this._uploadAttributes({ type,
                data: thumbnail,
                key });
            finishUpload(hash, type);
        }
        if (preview) {
            const type = TYPE_FILE_DATA["preview"];
            const hash = yield this._uploadAttributes({ type,
                data: preview,
                key });
            finishUpload(hash, type);
        }
        const passtrougth = new PassThrough();
        stream.pipe(encrypter).pipe(passtrougth);
        const { hash, type } = yield this._upload({
            stream: passtrougth,
            size,
            options,
            type: TYPE_FILE_DATA.indexOf("file"),
        });
        finishUpload(hash, type);
        // eslint-disable-next-line require-jsdoc
        function finishUpload(hash, type) {
            return __awaiter(this, void 0, void 0, function* () {
                const checkError = Number(hash.toString());
                if (checkError < 0)
                    reject(new Error('Server returned error ' + checkError + ' while uploading'));
                hashes[type] = hash;
                if (thumbnail && !hashes[TYPE_FILE_DATA.indexOf("thumbnail")])
                    return;
                if (preview && !hashes[TYPE_FILE_DATA.indexOf("preview")])
                    return;
                if (!hashes[TYPE_FILE_DATA.indexOf("file")])
                    return;
                const propertiesPacked = Properties.pack(properties);
                getCipher(key).encrypt.cbc(propertiesPacked);
                const storedKey = Buffer.from(key);
                const fileObject = {
                    h: base64.encrypt(hashes[0]),
                    t: TYPE_FILE_DATA.indexOf["file"],
                    a: base64.encrypt(propertiesPacked),
                    k: base64.encrypt(this.KEY_AES.encrypt.ecb(storedKey)),
                };
                if (hashes.length !== 1) {
                    fileObject.fa = hashes
                        .slice(1)
                        .map((hash, index) => index + '*' + base64.encrypt(hash)).filter((e) => e).join('/');
                }
                const request = {
                    a: 'p',
                    t: folder.nodeId,
                    n: [fileObject],
                };
                const shares = getShares(this.shareKeys, folder);
                if (shares.length > 0) {
                    request.cr = makeCryptoRequest(this.storage, [{
                            nodeId: fileObject.h,
                            key: key,
                        }], shares);
                }
                const response = yield this.api.request(request);
                const file = this.compose(response.f[0]);
                this.emit('add', file);
                stream.emit('complete', file);
                resolve(file);
            });
        }
    }))
};
_upload({ stream, size, options, type }, {
    stream: Stream, size: number, options: any, type: number
});
Promise < { hash: string, type: string } > {
    return: new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const ssl = options.forceHttps ? 2 : 0;
        let { initialChunkSize, chunkSizeIncrement, maxChunkSize, maxConnections } = options;
        initialChunkSize || (initialChunkSize = type === 0 ? 128 * 1024 : size);
        initialChunkSize || (initialChunkSize = 128 * 1024);
        maxChunkSize || (maxChunkSize = 1024 * 1024);
        maxConnections || (maxConnections = 4);
        let currentChunkSize = initialChunkSize;
        let activeConnections = 0;
        let isReading = false;
        let position = 0;
        let remainingBuffer;
        let uploadBuffer;
        let chunkSize;
        let chunkPos;
        const urlRequqest = type === 0 ?
            {
                a: 'u',
                ssl,
                s: size,
                ms: 0,
                r: 0,
                e: 0,
                v: 2,
            } :
            {
                a: 'ufa',
                ssl,
                s: size,
            };
        if (options.handle)
            urlRequqest.h = options.handle;
        const response = yield this.api.request(urlRequqest);
        const uploadURL = response.p;
        yield handleChunk();
        // eslint-disable-next-line require-jsdoc
        function handleChunk() {
            return __awaiter(this, void 0, void 0, function* () {
                chunkSize = Math.min(currentChunkSize, size - position);
                uploadBuffer = Buffer.alloc(chunkSize);
                activeConnections++;
                if (currentChunkSize < maxChunkSize)
                    currentChunkSize += chunkSizeIncrement;
                chunkPos = 0;
                if (remainingBuffer) {
                    remainingBuffer.copy(uploadBuffer);
                    chunkPos = Math.min(remainingBuffer.length, chunkSize);
                    remainingBuffer = remainingBuffer.length > chunkSize ?
                        remainingBuffer.slice(chunkSize) :
                        null;
                }
                // It happens when the remaining buffer contains the entire chunk
                if (chunkPos === chunkSize) {
                    sendChunk();
                }
                else {
                    isReading = true;
                }
            });
        }
        // eslint-disable-next-line require-jsdoc
        function sendChunk() {
            return __awaiter(this, void 0, void 0, function* () {
                let response;
                try {
                    response = yield this.api.axios({
                        url: uploadURL + '/' + (type === 0 ? position : (type - 1)),
                        method: "POST",
                        data: uploadBuffer,
                    });
                }
                catch (error) {
                    reject(error);
                }
                const { status } = response;
                if (status !== 200)
                    stream.emit('error', Error('MEGA returned a ' + response.statusCode + ' status code'));
                uploadBuffer = null;
                position += chunkSize;
                console.log("data", response.data);
                const hash = response.data;
                if (hash.length > 0) {
                    resolve(hash);
                }
                else if (position < size && !isReading) {
                    handleChunk();
                }
                if (position < size && !isReading && activeConnections < maxConnections) {
                    handleChunk();
                }
            });
        }
        let sizeCheck = 0;
        stream.on('data', (data) => {
            sizeCheck += data.length;
            stream.emit('progress', {
                bytesLoaded: sizeCheck,
                bytesTotal: size,
            });
            data.copy(uploadBuffer, chunkPos);
            chunkPos += data.length;
            if (chunkPos >= chunkSize) {
                isReading = false;
                remainingBuffer = data.slice(data.length - (chunkPos - chunkSize));
                sendChunk();
            }
        });
        stream.on('end', () => {
            if (size && sizeCheck !== size) {
                stream.emit('error', Error('Specified data size does not match: ' + size + ' !== ' + sizeCheck));
            }
        });
    }))
};
async;
_uploadAttributes({ type, data, key }, GenericObject);
Promise < { hash: string, type: string } > {
    if(data) { }, : .pipe === "function", data = await s2b(data),
    const: len = data.length,
    const: rest = Math.ceil(len / 16) * 16 - len,
    if(rest) { }
} !== 0;
{
    data = Buffer.concat([data, Buffer.alloc(rest)]);
}
const encrypter = getCipher(key);
encrypter.encrypt.cbc(data);
const { hash } = await this._upload({
    stream: data,
    size: data.length,
    type,
});
return ({
    hash,
    type,
});
/**
 * Uploads image preview or thumbnail for file
 * @param param0
 * @returns
 */
async;
uploadImageAttribute({
    thumbnail, preview, nodeId,
}, GenericObject);
Promise < boolean > {
    const: fileHandle = this.get({ nodeId }),
    try: {
        if(preview) {
            yield this._uploadAttributes({ type: 1,
                data: preview,
                key: fileHandle.key });
        },
        if(thumbnail) {
            yield this._uploadAttributes({
                type: 1,
                data: preview,
                key: fileHandle.key,
            });
        },
        return: Promise.resolve(true)
    },
    catch(error) {
        return Promise.reject(new Error("Something wrong uploading aattribute please try again"));
    }
};
