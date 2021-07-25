
const request = [
  {
    a: "ufa",
    fah: "c3celUG0hUs", //WHAT IS THE FAH
    ssl: 1,
    r: 1
  },
  {
    a: "ufa",
    fah: "mtDPaCzaUJc",
    ssl: 1,
    r: 1
  },
  {
    a: "ufa",
    fah: "I7OHW2DGcaY",
    ssl: 1,
    r: 1
  },
  {
    a: "uq",
    strg: 1,
    qc: 1
  }];
const response =
{
  p:
    "https://gfs270n861.userstorage.mega.co.nz/.Y_Qm4TQ3g2Oi8wcfTxJXkdLGjqNJrBgEC_9_Katy4drzvBotNzdtlecM-LgCIUXIkVY63w",
}

// https://gfs270n861.userstorage.mega.co.nz/.Y_Qm4TQ3g2Oi8wcfTxJXkdLGjqNJrBgEC_9_Katy4drzvBotNzdtlecM-LgCIUXIkVY63w/0
// WITH PAYLOAD -----
//SUPORTS MULTIPLE REQUQEST7



function api_fareq(res, ctx, xhr) {
  else if (typeof res === 'object' && res.p) {
    var data;
    var slot, i, t;
    var p, pp = [res.p],
      m;

    for (i = 0; p = res['p' + i]; i++) {
      pp.push(p);
    }

    if (ctx.p && pp.length > 1) {
      dd = ctx.p.length / pp.length;
    }

    for (m = pp.length; m--;) {
      for (slot = 0; ; slot++) {
        if (!faxhrs[slot]) {
          faxhrs[slot] = getxhr();
          break;
        }

        if (faxhrs[slot].readyState === XMLHttpRequest.DONE) {
          break;
        }
      }
      faxhrs[slot].fah = new fa_handler(faxhrs[slot], ctx);
      if (ctx.p) {
        var dp = 8 * Math.floor(m / pp.length * ctx.p.length / 8);
        var dl = 8 * Math.floor((m + 1) / pp.length * ctx.p.length / 8) - dp;

        if (dl) {
          data = new Uint8Array(dl);

          for (i = dl; i--;) {
            data[i] = ctx.p.charCodeAt(dp + i);
          }


          data = data.buffer;
        }
        else {
          data = false;
        }
      }
      else {
        data = ctx.data;
      }

      if (data) {
        t = -1;

        pp[m] += '/' + ctx.type;

        pp[m] = "URL OF THUMBNAIL RESPONSE"
        if (t < 0) {
          t = pp[m].length - 1;
        }

        faxhrs[slot].fa_host = hostname(pp[m].substr(0, t + 1));
        faxhrs[slot].open('POST', pp[m].substr(0, t + 1), true);



        faxhrs[slot].startTime = Date.now();
        faxhrs[slot].send(data);
      }
    }
  }
}
