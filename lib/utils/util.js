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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.b2s = exports.s2b = void 0;
/* import through from 'through' */
var stream_1 = require("stream");
function s2b(stream) {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var chunks, complete;
        return __generator(this, function (_a) {
            chunks = [];
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
            return [2 /*return*/];
        });
    }); });
}
exports.s2b = s2b;
function b2s(binary) {
    var readableInstanceStream = new stream_1.Readable({
        read: function () {
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
