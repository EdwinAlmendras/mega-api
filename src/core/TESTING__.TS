
  /*

IN PROGRESSS...
  async import({ nodeId, url }: { nodeId?: string; url: string }) {
    const self = this;
    function prepareRequest(source: Schema$File, ph = false) {
      const cipher = getCipher(source.key);
      const packedProperties = Properties.pack(source.properties);
      const publicHandle = source.downloadId;
      const req: any = {
        h: Array.isArray(publicHandle) ? publicHandle[1] : publicHandle,
        t: source.isDir ? 1 : 0,
        a: base64.encrypt(cipher.encrypt.CBC(packedProperties)),
        k: base64.encrypt(self.KEY_AES.encrypt.ECB(source.key)),
      };
      ph && (req.h = req.ph);
      return req;
    }
    const urlData = Url.parse(url);
    const source = await this.loadAttributes(urlData);
    console.log(urlData);
    const request: any = urlData.isDir ? {
      a: "p",
      t: nodeId || this.ID_ROOT_FOLDER,
      n: source.map((file: Schema$File) => prepareRequest(file)),
      sm: 1,
      v: 3,
    } : {
      a: "p",
      t: nodeId || this.ID_ROOT_FOLDER,
      n: prepareRequest(source, true),
    };

    if (this.shareKeys && this.shareKeys.length) {
      request.cr = makeCryptoRequest(this, source[0]);
    }


    console.log(request);
    await this.api.request(request);
  } */










/*
GETS THE PREVIEW
a: "ufa"
fah: "tL53iM1pHnU"
r: 1
ssl: 1

{a: "ufa", fah: "lAUvN1dBIJ0", ssl: 1, r: 1}
1: {a: "ufa", fah: "O9zP63lZa0s", ssl: 1, r: 1}



: {s: 11127884,…}
at: "nOWrSasCLFjjmDNG8JWhlGXIF6MZC6mOl0WT3FFWmQRbgjRGkPcqq3Q6hiJ0n1DFzFvxIGsE8qsw1_YuyLTe7A"
fa: "835:0*O9zP63lZa0s/889:1*tL53iM1pHnU"
g: [,…]
ip: ["94.24.36.32", "2a0b:e44:1::32", "185.206.27.37", "2a0b:e43:1::37", "89.44.168.234",…]
0: "94.24.36.32"
1: "2a0b:e44:1::32"
2: "185.206.27.37"
3: "2a0b:e43:1::37"
4: "89.44.168.234"
5: "2001:67c:1998:201::196"
6: "185.206.24.62"
7: "2a0b:e40:1::62"
8: "185.206.26.38"
9: "2a0b:e42:1::38"
10: "94.24.37.10"
11: "2a0b:e45:1::10"
msd: 1
pfa: 1
s: 11127884
tl: 0

*/



 /*
  https://gfs270n075.userstorage.mega.co.nz/dl/Yp-H9qmmVgPHKwJe6p0SCR-05g-YZsIaltDB-nITbFlGrYj3dQtMXAIpPgRDdPcHkz6w6TW_caJZJN-P31WLUpkU0a0KLEIisUUVV_o9SsGjjDLdXfLYaQ/0-121832

  https://gfs270n080.userstorage.mega.co.nz/ul/bLGqPVtfD48PhAJVJ79WubAfmXrJ58NPulkYWUyTV3uT_NZV8P1bYtEy6dXlaagrt0l7FJm4NtTmfwYwQqvF8A/0?c=YMHzpw_K4YHxQ826
  first uplaod

thumbnail preview
  [{"a":"ufa","s":6416,"ssl":1},{"a":"ufa","s":53504,"ssl":1},{"a":"ping"}]


  0: {,…}
p: "https://gfs270n861.userstorage.mega.co.nz/OgS-QwtYiVKHngfB2B6RuopFq2pP8W9Sc_cA68yLpzGSpSvnW7kenkhW25P4oBaex73B6g"
1: {,…}
p: "https://gfs270n896.userstorage.mega.co.nz/6OICka10omb1LQfT6IDpJ9m2fV4lNW8mI5QX3VIxS5lvMgYzsvycmVn07Me8jsSZzGzkdA"
2: -2

  POST THE RECEIVE THE URLS FOR UPLOAD THUMB AND PREV
  https://gfs270n861.userstorage.mega.co.nz/OgS-QwtYiVKHngfB2B6RuopFq2pP8W9Sc_cA68yLpzGSpSvnW7kenkhW25P4oBaex73B6g ADD 0
  https://gfs270n861.userstorage.mega.co.nz/OgS-QwtYiVKHngfB2B6RuopFq2pP8W9Sc_cA68yLpzGSpSvnW7kenkhW25P4oBaex73B6g/0

  ADD 1 https://gfs270n896.userstorage.mega.co.nz/6OICka10omb1LQfT6IDpJ9m2fV4lNW8mI5QX3VIxS5lvMgYzsvycmVn07Me8jsSZzGzkdA/1


  0: {a: "p", t: "3WIFyQ7R", n: [{t: 0, h: "DFpjFKYf1I4MJUoETsyflihopVBhzh03WGHgesFbrSNjb0wB",…}],…}
a: "p"
i: "bOw2uhtJjh"
n: [{t: 0, h: "DFpjFKYf1I4MJUoETsyflihopVBhzh03WGHgesFbrSNjb0wB",…}]
0: {t: 0, h: "DFpjFKYf1I4MJUoETsyflihopVBhzh03WGHgesFbrSNjb0wB",…}
a: "KMwLcFzyeiLkrTYPUMQi0N7G2igGr2vljN6cWZIEL9OOi7nd7MwRwxh-E8Dbkq7sLR_QAKlmuNaqVkvvy13Ai-4XWAIkbErKVy0u14BpcE0"
fa: false
h: "DFpjFKYf1I4MJUoETsyflihopVBhzh03WGHgesFbrSNjb0wB"
k: "5EThrZvP5HhAKZBRCPrDhsah7pDwWOeWX31vxTrwd5M"
t: 0
t: "3WIFyQ7R" */
