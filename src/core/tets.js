public async thumbnail({ nodeId }): Promise<string> {
  const file = this.get({ nodeId });

  const id = file.thumbs.split("/")[0].split("*")[1];
  const res = await this.api.request({
    a: "ufa",
    fah: id,
    r: 1,
    ssl: 1,
  });


  const b64 = base64.decrypt(id)
  const vv = Buffer.from(id, "base64")

console.log(b64, "+" , vv)

console.log(b64.toString("utf8"))
console.log(vv.toString("utf8"))

  const data = base64.decrypt(id);
  const url = "https://gfs270n891.userstorage.mega.co.nz/.vH1zxJsT52kFoQJ-0_QV2OuMvv2XNZkhA4kt8-S_zFF1DUBv78OA8oy-dcNu1464zI-qEA/0" || `${res.p}/0`
  ;

  const urlObject = new URL(url);
  const hostName = urlObject.hostname;

  const headers = {
    "Host": hostName,
    "Content-Type": "application/octet-stream",
    "Origin": "https://mega.nz",
    "User-Agent": "Mozilla/ 5.0(Linux; Android 10; SM - M115F) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 88.0.4324.152 Mobile Safari / 537.36",
    "Accept": "*/*",
    "Referer": "https://mega.nz/",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "es-ES,es;q=0.9",
    "Content-Length": Buffer.byteLength(data),
  };


  console.log(headers)
/*
  const respx = await axios.post(url, data, { headers });
  console.log(respx); */

  const resp = await fetch(url, {
    method: 'POST',
    body: data,
    headers,
  }, (err, res) => {
    console.log(err, res);
  });
  return Promise.resolve("OK");
}
