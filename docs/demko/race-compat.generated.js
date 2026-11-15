import * as wasi_snapshot_preview1 from './wasi.js';

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
    return uint8Array;
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 65540, "CgAAAA8AAAAFAAAA+P////L////8////CQAAAA0AAAAAAAAA9P////r///8tKyAgIDBYMHgALTBYKzBYIDBYLTB4KzB4IDB4AHZlY3RvcgBuYW4AaW5mAGJhZF9hcnJheV9uZXdfbGVuZ3RoIHdhcyB0aHJvd24gaW4gLWZuby1leGNlcHRpb25zIG1vZGUAYmFkX2FsbG9jIHdhcyB0aHJvd24gaW4gLWZuby1leGNlcHRpb25zIG1vZGUATkFOAElORgAuAChudWxsKQBsZW5ndGhfZXJyb3Igd2FzIHRocm93biBpbiAtZm5vLWV4Y2VwdGlvbnMgbW9kZSB3aXRoIG1lc3NhZ2UgIiVzIgBsaWJjKythYmk6IABTdXBwb3J0IGZvciBmb3JtYXR0aW5nIGxvbmcgZG91YmxlIHZhbHVlcyBpcyBjdXJyZW50bHkgZGlzYWJsZWQuClRvIGVuYWJsZSBpdCwgYWRkIC1sYy1wcmludHNjYW4tbG9uZy1kb3VibGUgdG8gdGhlIGxpbmsgY29tbWFuZC4K");
  base64DecodeToExistingUint8Array(bufferView, 65968, "AwAAAAQAAAAEAAAABgAAAIP5ogBETm4A/CkVANFXJwDdNPUAYtvAADyZlQBBkEMAY1H+ALveqwC3YcUAOm4kANJNQgBJBuAACeouAByS0QDrHf4AKbEcAOg+pwD1NYIARLsuAJzphAC0JnAAQX5fANaROQBTgzkAnPQ5AItfhAAo+b0A+B87AN7/lwAPmAUAES/vAApaiwBtH20Az342AAnLJwBGT7cAnmY/AC3qXwC6J3UA5evHAD178QD3OQcAklKKAPtr6gAfsV8ACF2NADADVgB7/EYA8KtrACC8zwA29JoA46kdAF5hkQAIG+YAhZllAKAUXwCNQGgAgNj/ACdzTQAGBjEAylYVAMmocwB74mAAa4zAABnERwDNZ8MACejcAFmDKgCLdsQAphyWAESv3QAZV9EApT4FAAUH/wAzfj8AwjLoAJhP3gC7fTIAJj3DAB5r7wCf+F4ANR86AH/yygDxhx0AfJAhAGokfADVbvoAMC13ABU7QwC1FMYAwxmdAK3EwgAsTUEADABdAIZ9RgDjcS0Am8aaADNiAAC00nwAtKeXADdV1QDXPvYAoxAYAE12/ABknSoAcNerAGN8+AB6sFcAFxXnAMBJVgA71tkAp4Q4ACQjywDWincAWlQjAAAfuQDxChsAGc7fAJ8x/wBmHmoAmVdhAKz7RwB+f9gAImW3ADLoiQDmv2AA78TNAGw2CQBdP9QAFt7XAFg73gDem5IA0iIoACiG6ADiWE0AxsoyAAjjFgDgfcsAF8BQAPMdpwAY4FsALhM0AIMSYgCDSAEA9Y5bAK2wfwAe6fIASEpDABBn0wCq3dgArl9CAGphzgAKKKQA05m0AAam8gBcd38Ao8KDAGE8iACKc3gAr4xaAG/XvQAtpmMA9L/LAI2B7wAmwWcAVcpFAMrZNgAoqNIAwmGNABLJdwAEJhQAEkabAMRZxADIxUQATbKRAAAX8wDUQ60AKUnlAP3VEAAAvvwAHpTMAHDO7gATPvUA7PGAALPnwwDH+CgAkwWUAMFxPgAuCbMAC0XzAIgSnACrIHsALrWfAEeSwgB7Mi8ADFVtAHKnkABr5x8AMcuWAHkWSgBBeeIA9N+JAOiUlwDi5oQAmTGXAIjtawBfXzYAu/0OAEiatABnpGwAcXJCAI1dMgCfFbgAvOUJAI0xJQD3dDkAMAUcAA0MAQBLCGgALO5YAEeqkAB05wIAvdYkAPd9pgBuSHIAnxbvAI6UpgC0kfYA0VNRAM8K8gAgmDMA9Ut+ALJjaADdPl8AQF0DAIWJfwBVUikAN2TAAG3YEAAySDIAW0x1AE5x1ABFVG4ACwnBACr1aQAUZtUAJwedAF0EUAC0O9sA6nbFAIf5FwBJa30AHSe6AJZpKQDGzKwArRRUAJDiagCI2YkALHJQAASkvgB3B5QA8zBwAAD8JwDqcagAZsJJAGTgPQCX3YMAoz+XAEOU/QANhowAMUHeAJI5nQDdcIwAF7fnAAjfOwAVNysAXICgAFqAkwAQEZIAD+jYAGyArwDb/0sAOJAPAFkYdgBipRUAYcu7AMeJuQAQQL0A0vIEAEl1JwDrtvYA2yK7AAoUqgCJJi8AZIN2AAk7MwAOlBoAUTqqAB2jwgCv7a4AXCYSAG3CTQAtepwAwFaXAAM/gwAJ8PYAK0CMAG0xmQA5tAcADCAVANjDWwD1ksQAxq1LAE7KpQCnN80A5qk2AKuSlADdQmgAGWPeAHaM7wBoi1IA/Ns3AK6hqwDfFTEAAK6hAAz72gBkTWYA7QW3ACllMABXVr8AR/86AGr5uQB1vvMAKJPfAKuAMABmjPYABMsVAPoiBgDZ5B0APbOkAFcbjwA2zQkATkLpABO+pAAzI7UA8KoaAE9lqADSwaUACz8PAFt4zQAj+XYAe4sEAIkXcgDGplMAb27iAO/rAACbSlgAxNq3AKpmugB2z88A0QIdALHxLQCMmcEAw613AIZI2gD3XaAAxoD0AKzwLwDd7JoAP1y8ANDebQCQxx8AKtu2AKMlOgAAr5oArVOTALZXBAApLbQAS4B+ANoHpwB2qg4Ae1mhABYSKgDcty0A+uX9AInb/gCJvv0A5HZsAAap/AA+gHAAhW4VAP2H/wAoPgcAYWczACoYhgBNveoAs+evAI9tbgCVZzkAMb9bAITXSAAw3xYAxy1DACVhNQDJcM4AMMu4AL9s/QCkAKIABWzkAFrdoAAhb0cAYhLSALlchABwYUkAa1bgAJlSAQBQVTcAHtW3ADPxxAATbl8AXTDkAIUuqQAdssMAoTI2AAi3pADqsdQAFvchAI9p5AAn/3cADAOAAI1ALQBPzaAAIKWZALOi0wAvXQoAtPlCABHaywB9vtAAm9vBAKsXvQDKooEACGpcAC5VFwAnAFUAfxTwAOEHhgAUC2QAlkGNAIe+3gDa/SoAayW2AHuJNAAF8/4Aub+eAGhqTwBKKqgAT8RaAC34vADXWpgA9MeVAA1NjQAgOqYApFdfABQ/sQCAOJUAzCABAHHdhgDJ3rYAv2D1AE1lEQABB2sAjLCsALLA0ABRVUgAHvsOAJVywwCjBjsAwEA1AAbcewDgRcwATin6ANbKyADo80EAfGTeAJtk2ADZvjEApJfDAHdY1ABp48UA8NoTALo6PABGGEYAVXVfANK99QBuksYArC5dAA5E7QAcPkIAYcSHACn96QDn1vMAInzKAG+RNQAI4MUA/9eNAG5q4gCw/cYAkwjBAHxddABrrbIAzW6dAD5yewDGEWoA98+pAClz3wC1yboAtwBRAOKyDQB0uiQA5X1gAHTYigANFSwAgRgMAH5mlAABKRYAn3p2AP39vgBWRe8A2X42AOzZEwCLurkAxJf8ADGoJwDxbsMAlMU2ANioVgC0qLUAz8wOABKJLQBvVzQALFaJAJnO4wDWILkAa16qAD4qnAARX8wA/QtKAOH0+wCOO20A4oYsAOnUhAD8tKkA7+7RAC41yQAvOWEAOCFEABvZyACB/AoA+0pqAC8c2ABTtIQATpmMAFQizAAqVdwAwMbWAAsZlgAacLgAaZVkACZaYAA/Uu4AfxEPAPS1EQD8y/UANLwtADS87gDoXcwA3V5gAGeOmwCSM+8AyRe4AGFYmwDhV7wAUYPGANg+EADdcUgALRzdAK8YoQAhLEYAWfPXANl6mACeVMAAT4b6AFYG/ADlea4AiSI2ADitIgBnk9wAVeiqAIImOADK55sAUQ2kAJkzsQCp1w4AaQVIAGWy8AB/iKcAiEyXAPnRNgAhkrMAe4JKAJjPIQBAn9wA3EdVAOF0OgBn60IA/p3fAF7UXwB7Z6QAuqx6AFX2ogAriCMAQbpVAFluCAAhKoYAOUeDAInj5gDlntQASftAAP9W6QAcD8oAxVmKAJT6KwDTwcUAD8XPANtargBHxYYAhUNiACGGOwAseZQAEGGHACpMewCALBoAQ78SAIgmkAB4PIkAqMTkAOXbewDEOsIAJvTqAPdnigANkr8AZaMrAD2TsQC9fAsApFHcACfdYwBp4d0AmpQZAKgplQBozigACe20AESfIABOmMoAcIJjAH58IwAPuTIAp/WOABRW5wAh8QgAtZ0qAG9+TQClGVEAtfmrAILf1gCW3WEAFjYCAMQ6nwCDoqEAcu1tADmNegCCuKkAazJcAEYnWwAANO0A0gB3APz0VQABWU0A4HGA");
  base64DecodeToExistingUint8Array(bufferView, 68755, "QPsh+T8AAAAALUR0PgAAAICYRvg8AAAAYFHMeDsAAACAgxvwOQAAAEAgJXo4AAAAgCKC4zYAAAAAHfNpNf6CK2VHFWdAAAAAAAAAOEMAAPr+Qi52vzo7nrya9wy9vf3/////3z88VFVVVVXFP5ErF89VVaU/F9CkZxERgT8AAAAAAADIQu85+v5CLuY/JMSC/72/zj+19AzXCGusP8xQRtKrsoM/hDpOm+DXVT8=");
  base64DecodeToExistingUint8Array(bufferView, 68942, "8D9uv4gaTzubPDUz+6k99u8/XdzYnBNgcbxhgHc+muzvP9FmhxB6XpC8hX9u6BXj7z8T9mc1UtKMPHSFFdOw2e8/+o75I4DOi7ze9t0pa9DvP2HI5mFO92A8yJt1GEXH7z+Z0zNb5KOQPIPzxso+vu8/bXuDXaaalzwPiflsWLXvP/zv/ZIatY4890dyK5Ks7z/RnC9wPb4+PKLR0zLso+8/C26QiTQDarwb0/6vZpvvPw69LypSVpW8UVsS0AGT7z9V6k6M74BQvMwxbMC9iu8/FvTVuSPJkbzgLamumoLvP69VXOnj04A8UY6lyJh67z9Ik6XqFRuAvHtRfTy4cu8/PTLeVfAfj7zqjYw4+WrvP79TEz+MiYs8dctv61tj7z8m6xF2nNmWvNRcBITgW+8/YC86PvfsmjyquWgxh1TvP504hsuC54+8Hdn8IlBN7z+Nw6ZEQW+KPNaMYog7Ru8/fQTksAV6gDyW3H2RST/vP5SoqOP9jpY8OGJ1bno47z99SHTyGF6HPD+msk/OMe8/8ucfmCtHgDzdfOJlRSvvP14IcT97uJa8gWP14d8k7z8xqwlt4feCPOHeH/WdHu8/+r9vGpshPbyQ2drQfxjvP7QKDHKCN4s8CwPkpoUS7z+Py86JkhRuPFYvPqmvDO8/tquwTXVNgzwVtzEK/gbvP0x0rOIBQoY8MdhM/HAB7z9K+NNdOd2PPP8WZLII/O4/BFuOO4Cjhrzxn5JfxfbuP2hQS8ztSpK8y6k6N6fx7j+OLVEb+AeZvGbYBW2u7O4/0jaUPujRcbz3n+U02+fuPxUbzrMZGZm85agTwy3j7j9tTCqnSJ+FPCI0Ekym3u4/imkoemASk7wcgKwERdruP1uJF0iPp1i8Ki73IQrW7j8bmklnmyx8vJeoUNn10e4/EazCYO1jQzwtiWFgCM7uP+9kBjsJZpY8VwAd7UHK7j95A6Ha4cxuPNA8wbWixu4/MBIPP47/kzze09fwKsPuP7CvervOkHY8Jyo21dq/7j934FTrvR2TPA3d/ZmyvO4/jqNxADSUj7ynLJ12srnuP0mjk9zM3oe8QmbPotq27j9fOA+9xt54vIJPnVYrtO4/9lx77EYShrwPkl3KpLHuP47X/RgFNZM82ie1Nkev7j8Fm4ovt5h7PP3Hl9QSre4/CVQc4uFjkDwpVEjdB6vuP+rGGVCFxzQ8t0ZZiiap7j81wGQr5jKUPEghrRVvp+4/n3aZYUrkjLwJ3Ha54aXuP6hN7zvFM4y8hVU6sH6k7j+u6SuJeFOEvCDDzDRGo+4/WFhWeN3Ok7wlIlWCOKLuP2QZfoCqEFc8c6lM1FWh7j8oIl6/77OTvM07f2aeoO4/grk0h60Sary/2gt1EqDuP+6pbbjvZ2O8LxplPLKf7j9RiOBUPdyAvISUUfl9n+4/zz5afmQfeLx0X+zodZ/uP7B9i8BK7oa8dIGlSJqf7j+K5lUeMhmGvMlnQlbrn+4/09QJXsuckDw/Xd5PaaDuPx2lTbncMnu8hwHrcxSh7j9rwGdU/eyUPDLBMAHtoe4/VWzWq+HrZTxiTs8286LuP0LPsy/FoYi8Eho+VCek7j80NzvxtmmTvBPOTJmJpe4/Hv8ZOoRegLytxyNGGqfuP25XcthQ1JS87ZJEm9mo7j8Aig5bZ62QPJlmitnHqu4/tOrwwS+3jTzboCpC5azuP//nxZxgtmW8jES1FjKv7j9EX/NZg/Z7PDZ3FZmuse4/gz0epx8Jk7zG/5ELW7TuPykebIu4qV285cXNsDe37j9ZuZB8+SNsvA9SyMtEuu4/qvn0IkNDkrxQTt6fgr3uP0uOZtdsyoW8ugfKcPHA7j8nzpEr/K9xPJDwo4KRxO4/u3MK4TXSbTwjI+MZY8juP2MiYiIExYe8ZeVde2bM7j/VMeLjhhyLPDMtSuyb0O4/Fbu809G7kbxdJT6yA9XuP9Ix7pwxzJA8WLMwE57Z7j+zWnNuhGmEPL/9eVVr3u4/tJ2Ol83fgrx689O/a+PuP4czy5J3Gow8rdNamZ/o7j/62dFKj3uQvGa2jSkH7u4/uq7cVtnDVbz7FU+4ovPuP0D2pj0OpJC8OlnljXL57j80k6049NZovEde+/J2/+4/NYpYa+LukbxKBqEwsAXvP83dXwrX/3Q80sFLkB4M7z+smJL6+72RvAke11vCEu8/swyvMK5uczycUoXdmxnvP5T9n1wy4448etD/X6sg7z+sWQnRj+CEPEvRVy7xJ+8/ZxpOOK/NYzy15waUbS/vP2gZkmwsa2c8aZDv3CA37z/StcyDGIqAvPrDXVULP+8/b/r/P12tj7x8iQdKLUfvP0mpdTiuDZC88okNCIdP7z+nBz2mhaN0PIek+9wYWO8/DyJAIJ6RgryYg8kW42DvP6ySwdVQWo48hTLbA+Zp7z9LawGsWTqEPGC0AfMhc+8/Hz60ByHVgrxfm3szl3zvP8kNRzu5Kom8KaH1FEaG7z/TiDpgBLZ0PPY/i+cukO8/cXKdUezFgzyDTMf7UZrvP/CR048S94+82pCkoq+k7z99dCPimK6NvPFnji1Ir+8/CCCqQbzDjjwnWmHuG7rvPzLrqcOUK4Q8l7prNyvF7z/uhdExqWSKPEBFblt20O8/7eM75Lo3jrwUvpyt/dvvP53NkU07iXc82JCegcHn7z+JzGBBwQVTPPFxjyvC8+8/ADj6/kIu5j8wZ8eTV/MuPQAAAAAAAOC/YFVVVVVV5b8GAAAAAADgP05VWZmZmek/eqQpVVVV5b/pRUibW0nyv8M/JosrAPA/AAAAAACg9j8=");
  base64DecodeToExistingUint8Array(bufferView, 71065, "yLnygizWv4BWNygktPo8AAAAAACA9j8=");
  base64DecodeToExistingUint8Array(bufferView, 71097, "CFi/vdHVvyD34NgIpRy9AAAAAABg9j8=");
  base64DecodeToExistingUint8Array(bufferView, 71129, "WEUXd3bVv21QttWkYiO9AAAAAABA9j8=");
  base64DecodeToExistingUint8Array(bufferView, 71161, "+C2HrRrVv9VnsJ7khOa8AAAAAAAg9j8=");
  base64DecodeToExistingUint8Array(bufferView, 71193, "eHeVX77Uv+A+KZNpGwS9AAAAAAAA9j8=");
  base64DecodeToExistingUint8Array(bufferView, 71225, "YBzCi2HUv8yETEgv2BM9AAAAAADg9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71257, "qIaGMATUvzoLgu3zQtw8AAAAAADA9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71289, "SGlVTKbTv2CUUYbGsSA9AAAAAACg9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71321, "gJia3UfTv5KAxdRNWSU9AAAAAACA9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71353, "IOG64ujSv9grt5keeyY9AAAAAABg9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71385, "iN4TWonSvz+wz7YUyhU9AAAAAABg9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71417, "iN4TWonSvz+wz7YUyhU9AAAAAABA9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71449, "eM/7QSnSv3baUygkWha9AAAAAAAg9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71481, "mGnBmMjRvwRU52i8rx+9AAAAAAAA9T8=");
  base64DecodeToExistingUint8Array(bufferView, 71513, "qKurXGfRv/CogjPGHx89AAAAAADg9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71545, "SK75iwXRv2ZaBf3EqCa9AAAAAADA9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71577, "kHPiJKPQvw4D9H7uawy9AAAAAACg9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71609, "0LSUJUDQv38t9J64NvC8AAAAAACg9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71641, "0LSUJUDQv38t9J64NvC8AAAAAACA9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71673, "QF5tGLnPv4c8masqVw09AAAAAABg9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71705, "YNzLrfDOvySvhpy3Jis9AAAAAABA9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71737, "8CpuByfOvxD/P1RPLxe9AAAAAAAg9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71769, "wE9rIVzNvxtoyruRuiE9AAAAAAAA9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71801, "oJrH94/MvzSEn2hPeSc9AAAAAAAA9D8=");
  base64DecodeToExistingUint8Array(bufferView, 71833, "oJrH94/MvzSEn2hPeSc9AAAAAADg8z8=");
  base64DecodeToExistingUint8Array(bufferView, 71865, "kC10hsLLv4+3izGwThk9AAAAAADA8z8=");
  base64DecodeToExistingUint8Array(bufferView, 71897, "wIBOyfPKv2aQzT9jTro8AAAAAACg8z8=");
  base64DecodeToExistingUint8Array(bufferView, 71929, "sOIfvCPKv+rBRtxkjCW9AAAAAACg8z8=");
  base64DecodeToExistingUint8Array(bufferView, 71961, "sOIfvCPKv+rBRtxkjCW9AAAAAACA8z8=");
  base64DecodeToExistingUint8Array(bufferView, 71993, "UPScWlLJv+PUwQTZ0Sq9AAAAAABg8z8=");
  base64DecodeToExistingUint8Array(bufferView, 72025, "0CBloH/Ivwn623+/vSs9AAAAAABA8z8=");
  base64DecodeToExistingUint8Array(bufferView, 72057, "4BACiavHv1hKU3KQ2ys9AAAAAABA8z8=");
  base64DecodeToExistingUint8Array(bufferView, 72089, "4BACiavHv1hKU3KQ2ys9AAAAAAAg8z8=");
  base64DecodeToExistingUint8Array(bufferView, 72121, "0BnnD9bGv2bisqNq5BC9AAAAAAAA8z8=");
  base64DecodeToExistingUint8Array(bufferView, 72153, "kKdwMP/FvzlQEJ9Dnh69AAAAAAAA8z8=");
  base64DecodeToExistingUint8Array(bufferView, 72185, "kKdwMP/FvzlQEJ9Dnh69AAAAAADg8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72217, "sKHj5SbFv49bB5CL3iC9AAAAAADA8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72249, "gMtsK03Evzx4NWHBDBc9AAAAAADA8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72281, "gMtsK03Evzx4NWHBDBc9AAAAAACg8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72313, "kB4g/HHDvzpUJ02GePE8AAAAAACA8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72345, "8B/4UpXCvwjEcRcwjSS9AAAAAABg8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72377, "YC/VKrfBv5ajERikgC69AAAAAABg8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72409, "YC/VKrfBv5ajERikgC69AAAAAABA8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72441, "kNB8ftfAv/Rb6IiWaQo9AAAAAABA8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72473, "kNB8ftfAv/Rb6IiWaQo9AAAAAAAg8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72505, "4Nsxkey/v/Izo1xUdSW9AAAAAAAA8j8=");
  base64DecodeToExistingUint8Array(bufferView, 72538, "K24HJ76/PADwKiw0Kj0AAAAAAADyPw==");
  base64DecodeToExistingUint8Array(bufferView, 72570, "K24HJ76/PADwKiw0Kj0AAAAAAODxPw==");
  base64DecodeToExistingUint8Array(bufferView, 72601, "wFuPVF68vwa+X1hXDB29AAAAAADA8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72633, "4Eo6bZK6v8iqW+g1OSU9AAAAAADA8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72665, "4Eo6bZK6v8iqW+g1OSU9AAAAAACg8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72697, "oDHWRcO4v2hWL00pfBM9AAAAAACg8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72729, "oDHWRcO4v2hWL00pfBM9AAAAAACA8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72761, "YOWK0vC2v9pzM8k3lya9AAAAAABg8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72793, "IAY/Bxu1v1dexmFbAh89AAAAAABg8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72825, "IAY/Bxu1v1dexmFbAh89AAAAAABA8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72857, "4BuW10Gzv98T+czaXiw9AAAAAABA8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72889, "4BuW10Gzv98T+czaXiw9AAAAAAAg8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72921, "gKPuNmWxvwmjj3ZefBQ9AAAAAAAA8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72953, "gBHAMAqvv5GONoOeWS09AAAAAAAA8T8=");
  base64DecodeToExistingUint8Array(bufferView, 72985, "gBHAMAqvv5GONoOeWS09AAAAAADg8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73017, "gBlx3UKrv0xw1uV6ghw9AAAAAADg8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73049, "gBlx3UKrv0xw1uV6ghw9AAAAAADA8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73081, "wDL2WHSnv+6h8jRG/Cy9AAAAAADA8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73113, "wDL2WHSnv+6h8jRG/Cy9AAAAAACg8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73145, "wP65h56jv6r+JvW3AvU8AAAAAACg8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73177, "wP65h56jv6r+JvW3AvU8AAAAAACA8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73210, "eA6bgp+/5Al+fCaAKb0AAAAAAIDwPw==");
  base64DecodeToExistingUint8Array(bufferView, 73242, "eA6bgp+/5Al+fCaAKb0AAAAAAGDwPw==");
  base64DecodeToExistingUint8Array(bufferView, 73273, "gNUHG7mXvzmm+pNUjSi9AAAAAABA8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73306, "/LCowI+/nKbT9nwe37wAAAAAAEDwPw==");
  base64DecodeToExistingUint8Array(bufferView, 73338, "/LCowI+/nKbT9nwe37wAAAAAACDwPw==");
  base64DecodeToExistingUint8Array(bufferView, 73370, "EGsq4H+/5EDaDT/iGb0AAAAAACDwPw==");
  base64DecodeToExistingUint8Array(bufferView, 73402, "EGsq4H+/5EDaDT/iGb0AAAAAAADwPw==");
  base64DecodeToExistingUint8Array(bufferView, 73454, "8D8=");
  base64DecodeToExistingUint8Array(bufferView, 73485, "wO8/");
  base64DecodeToExistingUint8Array(bufferView, 73498, "iXUVEIA/6CudmWvHEL0AAAAAAIDvPw==");
  base64DecodeToExistingUint8Array(bufferView, 73529, "gJNYViCQP9L34gZb3CO9AAAAAABA7z8=");
  base64DecodeToExistingUint8Array(bufferView, 73562, "ySglSZg/NAxaMrqgKr0AAAAAAADvPw==");
  base64DecodeToExistingUint8Array(bufferView, 73593, "QOeJXUGgP1PX8VzAEQE9AAAAAADA7j8=");
  base64DecodeToExistingUint8Array(bufferView, 73626, "LtSuZqQ/KP29dXMWLL0AAAAAAIDuPw==");
  base64DecodeToExistingUint8Array(bufferView, 73657, "wJ8UqpSoP30mWtCVeRm9AAAAAABA7j8=");
  base64DecodeToExistingUint8Array(bufferView, 73689, "wN3Nc8usPwco2EfyaBq9AAAAAAAg7j8=");
  base64DecodeToExistingUint8Array(bufferView, 73721, "wAbAMequP3s7yU8+EQ69AAAAAADg7T8=");
  base64DecodeToExistingUint8Array(bufferView, 73753, "YEbRO5exP5ueDVZdMiW9AAAAAACg7T8=");
  base64DecodeToExistingUint8Array(bufferView, 73785, "4NGn9b2zP9dO26VeyCw9AAAAAABg7T8=");
  base64DecodeToExistingUint8Array(bufferView, 73817, "oJdNWum1Px4dXTwGaSy9AAAAAABA7T8=");
  base64DecodeToExistingUint8Array(bufferView, 73849, "wOoK0wC3PzLtnamNHuw8AAAAAAAA7T8=");
  base64DecodeToExistingUint8Array(bufferView, 73881, "QFldXjO5P9pHvTpcESM9AAAAAADA7D8=");
  base64DecodeToExistingUint8Array(bufferView, 73913, "YK2NyGq7P+Vo9yuAkBO9AAAAAACg7D8=");
  base64DecodeToExistingUint8Array(bufferView, 73945, "QLwBWIi8P9OsWsbRRiY9AAAAAABg7D8=");
  base64DecodeToExistingUint8Array(bufferView, 73977, "IAqDOce+P+BF5q9owC29AAAAAABA7D8=");
  base64DecodeToExistingUint8Array(bufferView, 74009, "4Ns5kei/P/0KoU/WNCW9AAAAAAAA7D8=");
  base64DecodeToExistingUint8Array(bufferView, 74041, "4CeCjhfBP/IHLc547yE9AAAAAADg6z8=");
  base64DecodeToExistingUint8Array(bufferView, 74073, "8CN+K6rBPzSZOESOpyw9AAAAAACg6z8=");
  base64DecodeToExistingUint8Array(bufferView, 74105, "gIYMYdHCP6G0gctsnQM9AAAAAACA6z8=");
  base64DecodeToExistingUint8Array(bufferView, 74137, "kBWw/GXDP4lySyOoL8Y8AAAAAABA6z8=");
  base64DecodeToExistingUint8Array(bufferView, 74169, "sDODPZHEP3i2/VR5gyU9AAAAAAAg6z8=");
  base64DecodeToExistingUint8Array(bufferView, 74201, "sKHk5SfFP8d9aeXoMyY9AAAAAADg6j8=");
  base64DecodeToExistingUint8Array(bufferView, 74233, "EIy+TlfGP3guPCyLzxk9AAAAAADA6j8=");
  base64DecodeToExistingUint8Array(bufferView, 74265, "cHWLEvDGP+EhnOWNESW9AAAAAACg6j8=");
  base64DecodeToExistingUint8Array(bufferView, 74297, "UESFjYnHPwVDkXAQZhy9AAAAAABg6j8=");
  base64DecodeToExistingUint8Array(bufferView, 74330, "Oeuvvsg/0SzpqlQ9B70AAAAAAEDqPw==");
  base64DecodeToExistingUint8Array(bufferView, 74362, "99xaWsk/b/+gWCjyBz0AAAAAAADqPw==");
  base64DecodeToExistingUint8Array(bufferView, 74393, "4Io87ZPKP2khVlBDcii9AAAAAADg6T8=");
  base64DecodeToExistingUint8Array(bufferView, 74425, "0FtX2DHLP6rhrE6NNQy9AAAAAADA6T8=");
  base64DecodeToExistingUint8Array(bufferView, 74457, "4Ds4h9DLP7YSVFnESy29AAAAAACg6T8=");
  base64DecodeToExistingUint8Array(bufferView, 74489, "EPDG+2/MP9IrlsVy7PG8AAAAAABg6T8=");
  base64DecodeToExistingUint8Array(bufferView, 74521, "kNSwPbHNPzWwFfcq/yq9AAAAAABA6T8=");
  base64DecodeToExistingUint8Array(bufferView, 74553, "EOf/DlPOPzD0QWAnEsI8AAAAAAAg6T8=");
  base64DecodeToExistingUint8Array(bufferView, 74586, "3eSt9c4/EY67ZRUhyrwAAAAAAADpPw==");
  base64DecodeToExistingUint8Array(bufferView, 74617, "sLNsHJnPPzDfDMrsyxs9AAAAAADA6D8=");
  base64DecodeToExistingUint8Array(bufferView, 74649, "WE1gOHHQP5FO7RbbnPg8AAAAAACg6D8=");
  base64DecodeToExistingUint8Array(bufferView, 74681, "YGFnLcTQP+nqPBaLGCc9AAAAAACA6D8=");
  base64DecodeToExistingUint8Array(bufferView, 74713, "6CeCjhfRPxzwpWMOISy9AAAAAABg6D8=");
  base64DecodeToExistingUint8Array(bufferView, 74745, "+KzLXGvRP4EWpffNmis9AAAAAABA6D8=");
  base64DecodeToExistingUint8Array(bufferView, 74777, "aFpjmb/RP7e9R1Htpiw9AAAAAAAg6D8=");
  base64DecodeToExistingUint8Array(bufferView, 74809, "uA5tRRTSP+q6Rrrehwo9AAAAAADg5z8=");
  base64DecodeToExistingUint8Array(bufferView, 74841, "kNx88L7SP/QEUEr6nCo9AAAAAADA5z8=");
  base64DecodeToExistingUint8Array(bufferView, 74873, "YNPh8RTTP7g8IdN64ii9AAAAAACg5z8=");
  base64DecodeToExistingUint8Array(bufferView, 74905, "EL52Z2vTP8h38bDNbhE9AAAAAACA5z8=");
  base64DecodeToExistingUint8Array(bufferView, 74937, "MDN3UsLTP1y9BrZUOxg9AAAAAABg5z8=");
  base64DecodeToExistingUint8Array(bufferView, 74969, "6NUjtBnUP53gkOw25Ag9AAAAAABA5z8=");
  base64DecodeToExistingUint8Array(bufferView, 75001, "yHHCjXHUP3XWZwnOJy+9AAAAAAAg5z8=");
  base64DecodeToExistingUint8Array(bufferView, 75033, "MBee4MnUP6TYChuJIC69AAAAAAAA5z8=");
  base64DecodeToExistingUint8Array(bufferView, 75065, "oDgHriLVP1nHZIFwvi49AAAAAADg5j8=");
  base64DecodeToExistingUint8Array(bufferView, 75097, "0MhT93vVP+9AXe7trR89AAAAAADA5j8=");
  base64DecodeToExistingUint8Array(bufferView, 75129, "YFnfvdXVP9xlpAgqCwq9MC4BAFN1Y2Nlc3MASWxsZWdhbCBieXRlIHNlcXVlbmNlAERvbWFpbiBlcnJvcgBSZXN1bHQgbm90IHJlcHJlc2VudGFibGUATm90IGEgdHR5AFBlcm1pc3Npb24gZGVuaWVkAE9wZXJhdGlvbiBub3QgcGVybWl0dGVkAE5vIHN1Y2ggZmlsZSBvciBkaXJlY3RvcnkATm8gc3VjaCBwcm9jZXNzAEZpbGUgZXhpc3RzAFZhbHVlIHRvbyBsYXJnZSBmb3IgZGF0YSB0eXBlAE5vIHNwYWNlIGxlZnQgb24gZGV2aWNlAE91dCBvZiBtZW1vcnkAUmVzb3VyY2UgYnVzeQBJbnRlcnJ1cHRlZCBzeXN0ZW0gY2FsbABSZXNvdXJjZSB0ZW1wb3JhcmlseSB1bmF2YWlsYWJsZQBJbnZhbGlkIHNlZWsAQ3Jvc3MtZGV2aWNlIGxpbmsAUmVhZC1vbmx5IGZpbGUgc3lzdGVtAERpcmVjdG9yeSBub3QgZW1wdHkAQ29ubmVjdGlvbiByZXNldCBieSBwZWVyAE9wZXJhdGlvbiB0aW1lZCBvdXQAQ29ubmVjdGlvbiByZWZ1c2VkAEhvc3QgaXMgdW5yZWFjaGFibGUAQWRkcmVzcyBpbiB1c2UAQnJva2VuIHBpcGUASS9PIGVycm9yAE5vIHN1Y2ggZGV2aWNlIG9yIGFkZHJlc3MATm8gc3VjaCBkZXZpY2UATm90IGEgZGlyZWN0b3J5AElzIGEgZGlyZWN0b3J5AFRleHQgZmlsZSBidXN5AEV4ZWMgZm9ybWF0IGVycm9yAEludmFsaWQgYXJndW1lbnQAQXJndW1lbnQgbGlzdCB0b28gbG9uZwBTeW1ib2xpYyBsaW5rIGxvb3AARmlsZW5hbWUgdG9vIGxvbmcAVG9vIG1hbnkgb3BlbiBmaWxlcyBpbiBzeXN0ZW0ATm8gZmlsZSBkZXNjcmlwdG9ycyBhdmFpbGFibGUAQmFkIGZpbGUgZGVzY3JpcHRvcgBObyBjaGlsZCBwcm9jZXNzAEJhZCBhZGRyZXNzAEZpbGUgdG9vIGxhcmdlAFRvbyBtYW55IGxpbmtzAE5vIGxvY2tzIGF2YWlsYWJsZQBSZXNvdXJjZSBkZWFkbG9jayB3b3VsZCBvY2N1cgBTdGF0ZSBub3QgcmVjb3ZlcmFibGUAUHJldmlvdXMgb3duZXIgZGllZABPcGVyYXRpb24gY2FuY2VsZWQARnVuY3Rpb24gbm90IGltcGxlbWVudGVkAE5vIG1lc3NhZ2Ugb2YgZGVzaXJlZCB0eXBlAElkZW50aWZpZXIgcmVtb3ZlZABMaW5rIGhhcyBiZWVuIHNldmVyZWQAUHJvdG9jb2wgZXJyb3IAQmFkIG1lc3NhZ2UATm90IGEgc29ja2V0AERlc3RpbmF0aW9uIGFkZHJlc3MgcmVxdWlyZWQATWVzc2FnZSB0b28gbGFyZ2UAUHJvdG9jb2wgd3JvbmcgdHlwZSBmb3Igc29ja2V0AFByb3RvY29sIG5vdCBhdmFpbGFibGUAUHJvdG9jb2wgbm90IHN1cHBvcnRlZABOb3Qgc3VwcG9ydGVkAEFkZHJlc3MgZmFtaWx5IG5vdCBzdXBwb3J0ZWQgYnkgcHJvdG9jb2wAQWRkcmVzcyBub3QgYXZhaWxhYmxlAE5ldHdvcmsgaXMgZG93bgBOZXR3b3JrIHVucmVhY2hhYmxlAENvbm5lY3Rpb24gcmVzZXQgYnkgbmV0d29yawBDb25uZWN0aW9uIGFib3J0ZWQATm8gYnVmZmVyIHNwYWNlIGF2YWlsYWJsZQBTb2NrZXQgaXMgY29ubmVjdGVkAFNvY2tldCBub3QgY29ubmVjdGVkAE9wZXJhdGlvbiBhbHJlYWR5IGluIHByb2dyZXNzAE9wZXJhdGlvbiBpbiBwcm9ncmVzcwBTdGFsZSBmaWxlIGhhbmRsZQBRdW90YSBleGNlZWRlZABNdWx0aWhvcCBhdHRlbXB0ZWQAQ2FwYWJpbGl0aWVzIGluc3VmZmljaWVudAAAAAAAAAB1Ak4A1gHiBLkEGAGOBe0CFgTyAJcDAQM4Ba8BggFPAy8EHgDUBaIAEgMeA8IB3gMIAKwFAAFkAvEBZQU0AowCzwItA0wE4wWfAvgEHAUIBbECSwUVAngAUgI8A/ED5ADDA30EzACqA3kFJAJuAW0DIgSrBEQA+wGuAIMDYADlAQcElAReBCsAWAE5AZIAwgWbAUMCRgH2BQAAAAAAABkACwAZGRkAAAAABQAAAAAAAAkAAAAACwAAAAAAAAAAGQAKChkZGQMKBwABGwkLGAAACQYLAAALAAYZAAAAGRkZ");
  base64DecodeToExistingUint8Array(bufferView, 76945, "DgAAAAAAAAAAGQALDRkZGQANAAACAAkOAAAACQAOAAAO");
  base64DecodeToExistingUint8Array(bufferView, 77003, "DA==");
  base64DecodeToExistingUint8Array(bufferView, 77015, "EwAAAAATAAAAAAkMAAAAAAAMAAAM");
  base64DecodeToExistingUint8Array(bufferView, 77061, "EA==");
  base64DecodeToExistingUint8Array(bufferView, 77073, "DwAAAAQPAAAAAAkQAAAAAAAQAAAQ");
  base64DecodeToExistingUint8Array(bufferView, 77119, "Eg==");
  base64DecodeToExistingUint8Array(bufferView, 77131, "EQAAAAARAAAAAAkSAAAAAAASAAASAAAaAAAAGhoa");
  base64DecodeToExistingUint8Array(bufferView, 77186, "GgAAABoaGgAAAAAAAAk=");
  base64DecodeToExistingUint8Array(bufferView, 77235, "FA==");
  base64DecodeToExistingUint8Array(bufferView, 77247, "FwAAAAAXAAAAAAkUAAAAAAAUAAAU");
  base64DecodeToExistingUint8Array(bufferView, 77293, "Fg==");
  base64DecodeToExistingUint8Array(bufferView, 77305, "FQAAAAAVAAAAAAkWAAAAAAAWAAAWAAAwMTIzNDU2Nzg5QUJDREVG");
  base64DecodeToExistingUint8Array(bufferView, 77354, "AgAAAAAABQ==");
  base64DecodeToExistingUint8Array(bufferView, 77372, "Aw==");
  base64DecodeToExistingUint8Array(bufferView, 77392, "BAAAAAUAAAAMMwE=");
  base64DecodeToExistingUint8Array(bufferView, 77416, "Ag==");
  base64DecodeToExistingUint8Array(bufferView, 77432, "/////w==");
}

  var scratchBuffer = new ArrayBuffer(16);
  var i32ScratchView = new Int32Array(scratchBuffer);
  var f32ScratchView = new Float32Array(scratchBuffer);
  var f64ScratchView = new Float64Array(scratchBuffer);

  function wasm2js_scratch_load_i32(index) {
    return i32ScratchView[index];
  }

  function wasm2js_scratch_store_i32(index, value) {
    i32ScratchView[index] = value;
  }

  function wasm2js_scratch_load_f64() {
    return f64ScratchView[0];
  }

  function wasm2js_scratch_store_f64(value) {
    f64ScratchView[0] = value;
  }
      function wasm2js_trap() { throw new Error('abort'); }

  function wasm2js_memory_fill(dest, value, size) {
    dest = dest >>> 0;
    size = size >>> 0;
    if (dest + size > bufferView.length) throw "trap: invalid memory.fill";
    bufferView.fill(value, dest, dest + size);
  }

  function wasm2js_memory_copy(dest, source, size) {
    // TODO: traps on invalid things
    bufferView.copyWithin(dest, source, source + size);
  }

function asmFunc(imports) {
 var buffer = new ArrayBuffer(131072);
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var wasi_snapshot_preview1 = imports.wasi_snapshot_preview1;
 var fimport$3 = wasi_snapshot_preview1.fd_write;
 var global$0 = 65536;
 var i64toi32_i32$HIGH_BITS = 0;
 function $1() {
  if (HEAP32[19372]) {
   wasm2js_trap()
  }
  HEAP32[19372] = 1;
  $2(77496);
  $153(1);
  $153(2);
 }

 function $2($0) {
  var $1_1 = 0, $2_1 = 0, $3 = 0, $4_1 = 0, $5 = 0, $6 = 0, $7_1 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0.0, $12 = 0;
  $1_1 = global$0 - 128 | 0;
  global$0 = $1_1;
  wasm2js_memory_fill($0, 0, 40);
  HEAP32[$0 + 56 >> 2] = 0;
  HEAP32[$0 + 60 >> 2] = 1079574528;
  HEAP32[$0 + 48 >> 2] = 0;
  HEAP32[$0 + 52 >> 2] = 0;
  HEAP32[$0 + 40 >> 2] = 0;
  HEAP32[$0 + 44 >> 2] = 1078067200;
  wasm2js_memory_fill($0 - -64 | 0, 0, 60);
  HEAP16[$0 + 144 >> 1] = 0;
  HEAP32[$0 + 140 >> 2] = 3;
  HEAP32[$0 + 132 >> 2] = 7;
  HEAP32[$0 + 136 >> 2] = 0;
  HEAP32[$0 + 124 >> 2] = 3;
  HEAP32[$0 + 128 >> 2] = 2;
  wasm2js_memory_fill($0 + 152 | 0, 0, 288);
  $4_1 = 176;
  while (1) {
   $2_1 = $0 + $4_1 | 0;
   HEAP32[$2_1 + 16 >> 2] = 0;
   HEAP32[$2_1 + 20 >> 2] = 0;
   HEAP32[$2_1 + 8 >> 2] = 0;
   HEAP32[$2_1 + 12 >> 2] = 0;
   HEAP32[$2_1 >> 2] = 0;
   HEAP32[$2_1 + 4 >> 2] = 0;
   $4_1 = $4_1 + 48 | 0;
   if (($4_1 | 0) != 464) {
    continue
   }
   break;
  };
  HEAP32[$1_1 + 124 >> 2] = 3;
  HEAP16[$1_1 + 104 >> 1] = 1;
  HEAP32[$1_1 + 96 >> 2] = 0;
  HEAP32[$1_1 + 100 >> 2] = 1075838976;
  HEAP32[$1_1 + 88 >> 2] = 0;
  HEAP32[$1_1 + 92 >> 2] = 1081016320;
  HEAP32[$1_1 + 80 >> 2] = 0;
  HEAP32[$1_1 + 84 >> 2] = 1076756480;
  HEAP16[$1_1 + 72 >> 1] = 1;
  HEAP32[$1_1 + 64 >> 2] = 0;
  HEAP32[$1_1 + 68 >> 2] = 1074266112;
  HEAP32[$1_1 + 56 >> 2] = 0;
  HEAP32[$1_1 + 60 >> 2] = 1080229888;
  HEAP32[$1_1 + 48 >> 2] = 0;
  HEAP32[$1_1 + 52 >> 2] = 1076101120;
  HEAP16[$1_1 + 40 >> 1] = 0;
  HEAP32[$1_1 + 32 >> 2] = 0;
  HEAP32[$1_1 + 36 >> 2] = 1075576832;
  HEAP32[$1_1 + 24 >> 2] = 0;
  HEAP32[$1_1 + 28 >> 2] = 1078722560;
  HEAP32[$1_1 + 16 >> 2] = 0;
  HEAP32[$1_1 + 20 >> 2] = 0;
  $4_1 = $1_1 + 16 | 0;
  HEAP32[$1_1 + 120 >> 2] = $4_1;
  $2_1 = HEAP32[$1_1 + 124 >> 2];
  HEAP32[$1_1 + 8 >> 2] = HEAP32[$1_1 + 120 >> 2];
  HEAP32[$1_1 + 12 >> 2] = $2_1;
  $2_1 = $0 + 440 | 0;
  HEAP32[$2_1 + 8 >> 2] = 0;
  HEAP32[$2_1 >> 2] = 0;
  HEAP32[$2_1 + 4 >> 2] = 0;
  $3 = $1_1 + 8 | 0;
  $6 = HEAP32[$3 >> 2];
  $3 = HEAP32[$3 + 4 >> 2];
  $8 = $6 + ($3 << 5) | 0;
  if ($3) {
   if ($3 >>> 0 >= 134217728) {
    $48();
    wasm2js_trap();
   }
   $5 = $49($3);
   HEAP32[$2_1 + 8 >> 2] = $3;
   HEAP32[$2_1 + 4 >> 2] = 0;
   HEAP32[$2_1 >> 2] = $5;
   $3 = $8 - $6 | 0;
   $5 = HEAP32[$2_1 >> 2];
   $9 = $5 + (HEAP32[$2_1 + 4 >> 2] << 5) | 0;
   $12 = $3 + $9 | 0;
   if (($6 | 0) != ($8 | 0)) {
    $3 = $3 - 6 | 0;
    if ($3) {
     wasm2js_memory_copy($9, $6, $3)
    }
    $5 = HEAP32[$2_1 >> 2];
   }
   HEAP32[$2_1 + 4 >> 2] = $12 - $5 >> 5;
  }
  wasm2js_memory_fill($0 + 452 | 0, 0, 36);
  HEAP32[$1_1 + 56 >> 2] = 0;
  HEAP32[$1_1 + 60 >> 2] = 1074266112;
  HEAP32[$1_1 + 48 >> 2] = 0;
  HEAP32[$1_1 + 52 >> 2] = -1073217536;
  HEAP32[$1_1 + 40 >> 2] = 0;
  HEAP32[$1_1 + 44 >> 2] = 1076363264;
  HEAP32[$1_1 + 32 >> 2] = 0;
  HEAP32[$1_1 + 36 >> 2] = -1071120384;
  HEAP32[$1_1 + 24 >> 2] = 0;
  HEAP32[$1_1 + 28 >> 2] = 1075314688;
  HEAP32[$1_1 + 16 >> 2] = 0;
  HEAP32[$1_1 + 20 >> 2] = -1072168960;
  while (1) {
   if (($7_1 | 0) == 6) {
    global$0 = $1_1 + 128 | 0
   } else {
    $2_1 = $0 + $10 | 0;
    $3 = $2_1 + 176 | 0;
    HEAP32[$3 >> 2] = 0;
    HEAP32[$3 + 4 >> 2] = 0;
    HEAPF64[$2_1 + 168 >> 3] = $11 * .8 + 37.0;
    HEAPF64[$2_1 + 152 >> 3] = HEAPF64[$4_1 >> 3];
    $3 = $2_1 + 184 | 0;
    HEAP32[$3 >> 2] = 0;
    HEAP32[$3 + 4 >> 2] = 0;
    $3 = $2_1 + 192 | 0;
    HEAP32[$3 >> 2] = 0;
    HEAP32[$3 + 4 >> 2] = 0;
    HEAPF64[$2_1 + 160 >> 3] = Math_imul($7_1 >>> 1 | 0, 10) + 9 >>> 0;
    $10 = $10 + 48 | 0;
    $4_1 = $4_1 + 8 | 0;
    $7_1 = $7_1 + 1 | 0;
    $11 = $11 + 1.0;
    continue;
   }
   break;
  };
  return $0;
 }

 function $4($0) {
  $0 = $0 | 0;
  wasm2js_trap();
 }

 function $7($0) {
  var $1_1 = 0, $2_1 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  HEAP32[$1_1 + 12 >> 2] = $0;
  $0 = HEAP32[$1_1 + 12 >> 2];
  $2_1 = HEAP32[$0 >> 2];
  if ($2_1) {
   HEAP32[$0 + 4 >> 2] = 0;
   $214($2_1);
  }
  global$0 = $1_1 + 16 | 0;
 }

 function $13() {
  var $0 = 0, $1_1 = 0, $2_1 = 0, $3 = 0, $4_1 = 0;
  $4_1 = global$0 - 496 | 0;
  global$0 = $4_1;
  $1_1 = $2($4_1 + 8 | 0);
  wasm2js_memory_copy(77496, $1_1, 440);
  $0 = HEAP32[19484];
  if ($0) {
   HEAP32[19485] = 0;
   $214($0);
   HEAP32[19486] = 0;
   HEAP32[19484] = 0;
   HEAP32[19485] = 0;
  }
  $57(77936, $1_1 + 440 | 0);
  $16(77948, $1_1 + 452 | 0);
  $16(77960, $1_1 + 464 | 0);
  $0 = HEAP32[19493];
  if ($0) {
   HEAP32[19494] = 0;
   $214($0);
   HEAP32[19495] = 0;
   HEAP32[19493] = 0;
   HEAP32[19494] = 0;
  }
  $0 = $1_1 + 476 | 0;
  $57(77972, $0);
  $3 = global$0 - 16 | 0;
  global$0 = $3;
  HEAP32[$3 + 12 >> 2] = $0;
  $2_1 = HEAP32[$3 + 12 >> 2];
  $0 = HEAP32[$2_1 >> 2];
  if ($0) {
   HEAP32[$2_1 + 4 >> 2] = 0;
   $214($0);
  }
  global$0 = $3 + 16 | 0;
  $7($1_1 + 464 | 0);
  $7($1_1 + 452 | 0);
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[$2_1 + 12 >> 2] = $1_1 + 440;
  $0 = HEAP32[$2_1 + 12 >> 2];
  $1_1 = HEAP32[$0 >> 2];
  if ($1_1) {
   HEAP32[$0 + 4 >> 2] = 0;
   $214($1_1);
  }
  global$0 = $2_1 + 16 | 0;
  global$0 = $4_1 + 496 | 0;
 }

 function $16($0, $1_1) {
  var $2_1 = 0;
  $2_1 = HEAP32[$0 >> 2];
  if ($2_1) {
   HEAP32[$0 + 4 >> 2] = 0;
   $214($2_1);
   HEAP32[$0 + 8 >> 2] = 0;
   HEAP32[$0 >> 2] = 0;
   HEAP32[$0 + 4 >> 2] = 0;
  }
  $57($0, $1_1);
 }

 function $19() {
  return 1152.0;
 }

 function $20($0) {
  $0 = +$0;
  var $1_1 = 0.0, $2_1 = 0.0;
  $0 = $0 * 6.283185307179586 / 1152.0;
  $1_1 = $169($0 * 3.0);
  $2_1 = $169($0 + $0 + .8);
  return +($169($0 * 6.0 + -.6) * 4.0 + ($1_1 * 17.0 + $2_1 * 10.0));
 }

 function $22($0) {
  $0 = +$0;
  return +$23($0);
 }

 function $23($0) {
  var $1_1 = 0.0, $2_1 = 0.0;
  $0 = $0 * 6.283185307179586 / 1152.0;
  $1_1 = $158($0 * 3.0);
  $2_1 = $158($0 + $0 + .8);
  return ($158($0 * 6.0 + -.6) * 24.0 + ($1_1 * 51.0 + $2_1 * 20.0)) * .00545415391248228;
 }

 function $24($0) {
  $0 = $0 | 0;
  $25(($0 | 0) != 0);
 }

 function $25($0) {
  var $1_1 = 0, $2_1 = 0;
  $1_1 = global$0 - 32 | 0;
  global$0 = $1_1;
  block1 : {
   block2 : {
    if ($0) {
     $2_1 = HEAP32[19406];
     if (!$2_1 | HEAPF64[9696] > 0.0) {
      break block1
     }
     HEAP32[19392] = -858993459;
     HEAP32[19393] = 1071959244;
     HEAP32[19406] = $2_1 - 1;
     break block2;
    }
    if (HEAPF64[9695] > 0.0) {
     break block1
    }
    HEAP32[19390] = -1717986918;
    HEAP32[19391] = 1070176665;
   }
   HEAP8[$1_1 + 25 | 0] = 0;
   HEAP8[$1_1 + 24 | 0] = $0;
   HEAPF64[$1_1 + 8 >> 3] = HEAPF64[9689];
   HEAPF64[$1_1 + 16 >> 3] = HEAPF64[9687] + 2.0;
   $2_1 = $1_1 + 8 | 0;
   $26(77948, $2_1);
   HEAP32[$1_1 + 8 >> 2] = $0;
   $27($2_1);
  }
  global$0 = $1_1 + 32 | 0;
 }

 function $26($0, $1_1) {
  var $2_1 = 0, $3 = 0, $4_1 = 0, $5 = 0, $6 = 0, $7_1 = 0, $8 = 0;
  $6 = global$0 - 48 | 0;
  global$0 = $6;
  $2_1 = HEAP32[$0 + 4 >> 2];
  HEAP32[$6 + 12 >> 2] = HEAP32[$0 >> 2] + Math_imul($2_1, 24);
  $4_1 = HEAP32[$0 + 8 >> 2];
  HEAP32[$6 + 20 >> 2] = $0;
  HEAP32[$6 + 16 >> 2] = $1_1;
  HEAP32[$6 + 40 >> 2] = $0;
  HEAP32[$6 + 36 >> 2] = $1_1;
  $1_1 = $6 + 12 | 0;
  HEAP32[$6 + 24 >> 2] = $1_1;
  HEAP32[$6 + 32 >> 2] = $1_1;
  block1 : {
   if (($2_1 | 0) != ($4_1 | 0)) {
    $3 = $6 + 16 | 0;
    $2_1 = HEAP32[$3 >> 2];
    $8 = HEAP32[$2_1 + 20 >> 2];
    $4_1 = HEAP32[$3 + 4 >> 2];
    $1_1 = HEAP32[$4_1 >> 2] + Math_imul(HEAP32[$4_1 + 4 >> 2], 24) | 0;
    HEAP32[$1_1 + 16 >> 2] = HEAP32[$2_1 + 16 >> 2];
    HEAP32[$1_1 + 20 >> 2] = $8;
    $8 = HEAP32[$2_1 + 12 >> 2];
    HEAP32[$1_1 + 8 >> 2] = HEAP32[$2_1 + 8 >> 2];
    HEAP32[$1_1 + 12 >> 2] = $8;
    $8 = HEAP32[$2_1 + 4 >> 2];
    HEAP32[$1_1 >> 2] = HEAP32[$2_1 >> 2];
    HEAP32[$1_1 + 4 >> 2] = $8;
    $2_1 = HEAP32[$4_1 >> 2];
    $3 = HEAP32[$3 + 8 >> 2];
    HEAP32[$3 >> 2] = HEAP32[$3 >> 2] + 24;
    HEAP32[$4_1 + 4 >> 2] = (($1_1 - $2_1 | 0) + 24 | 0) / 24;
    break block1;
   }
   $8 = $6 + 32 | 0;
   $2_1 = HEAP32[$8 + 8 >> 2];
   $4_1 = HEAP32[$8 + 4 >> 2];
   $1_1 = global$0 - 16 | 0;
   global$0 = $1_1;
   $3 = HEAP32[$2_1 + 4 >> 2] + 1 | 0;
   if ($3 >>> 0 >= 178956971) {
    $48();
    wasm2js_trap();
   }
   $5 = HEAP32[$2_1 + 8 >> 2];
   $7_1 = $5 << 1;
   $3 = $5 >>> 0 >= 89478485 ? 178956970 : $3 >>> 0 < $7_1 >>> 0 ? $7_1 : $3;
   $7_1 = HEAP32[$2_1 + 4 >> 2];
   $5 = 0;
   HEAP32[$1_1 + 8 >> 2] = 0;
   HEAP32[$1_1 + 12 >> 2] = 0;
   HEAP32[$1_1 >> 2] = 0;
   HEAP32[$1_1 + 4 >> 2] = 0;
   if ($3) {
    if ($3 >>> 0 >= 178956971) {
     $51();
     wasm2js_trap();
    }
    $5 = $149(Math_imul($3, 24));
    HEAP32[$1_1 >> 2] = $5;
   }
   HEAP32[$1_1 + 12 >> 2] = $3;
   HEAP32[$1_1 + 8 >> 2] = 0;
   HEAP32[$1_1 + 4 >> 2] = Math_imul($7_1, 24) + $5;
   $5 = HEAP32[$4_1 + 12 >> 2];
   $7_1 = HEAP32[$1_1 + 8 >> 2];
   $3 = HEAP32[$1_1 + 4 >> 2] + Math_imul($7_1, 24) | 0;
   HEAP32[$3 + 8 >> 2] = HEAP32[$4_1 + 8 >> 2];
   HEAP32[$3 + 12 >> 2] = $5;
   $5 = HEAP32[$4_1 + 4 >> 2];
   HEAP32[$3 >> 2] = HEAP32[$4_1 >> 2];
   HEAP32[$3 + 4 >> 2] = $5;
   $5 = HEAP32[$4_1 + 20 >> 2];
   HEAP32[$3 + 16 >> 2] = HEAP32[$4_1 + 16 >> 2];
   HEAP32[$3 + 20 >> 2] = $5;
   HEAP32[$1_1 + 8 >> 2] = $7_1 + 1;
   $5 = $2_1 + 4 | 0;
   $7_1 = HEAP32[$5 >> 2];
   $4_1 = HEAP32[$1_1 + 4 >> 2] + Math_imul($7_1, -24) | 0;
   $7_1 = Math_imul($7_1, 24);
   if ($7_1) {
    wasm2js_memory_copy($4_1, HEAP32[$2_1 >> 2], $7_1)
   }
   HEAP32[$1_1 + 8 >> 2] = ((HEAP32[$1_1 + 4 >> 2] + Math_imul(HEAP32[$1_1 + 8 >> 2], 24) | 0) - $4_1 | 0) / 24;
   HEAP32[$1_1 + 4 >> 2] = $4_1;
   HEAP32[$5 >> 2] = 0;
   $75($1_1, $2_1, $5, $2_1 + 8 | 0);
   HEAP32[$1_1 >> 2] = HEAP32[$1_1 + 4 >> 2];
   $4_1 = Math_imul(HEAP32[$1_1 + 8 >> 2], 24);
   $2_1 = ($4_1 + HEAP32[$1_1 + 4 >> 2] | 0) - HEAP32[$1_1 + 4 >> 2] | 0;
   HEAP32[$1_1 + 8 >> 2] = (((($2_1 >>> 0) % 24 | 0) - $2_1 | 0) + $4_1 | 0) / 24;
   $2_1 = HEAP32[$1_1 >> 2];
   if ($2_1) {
    $214($2_1)
   }
   global$0 = $1_1 + 16 | 0;
   HEAP32[HEAP32[$8 >> 2] >> 2] = $3 + 24;
  }
  HEAP32[$0 + 4 >> 2] = (HEAP32[$6 + 12 >> 2] - HEAP32[$0 >> 2] | 0) / 24;
  global$0 = $6 + 48 | 0;
 }

 function $27($0) {
  var $1_1 = 0, $2_1 = 0, $3 = 0, $4_1 = 0, $5 = 0, $6 = 0, $7_1 = 0;
  $3 = global$0 - 48 | 0;
  global$0 = $3;
  $1_1 = HEAP32[19494];
  HEAP32[$3 + 12 >> 2] = HEAP32[19493] + ($1_1 << 2);
  $2_1 = HEAP32[19495];
  HEAP32[$3 + 20 >> 2] = 77972;
  HEAP32[$3 + 16 >> 2] = $0;
  HEAP32[$3 + 40 >> 2] = 77972;
  HEAP32[$3 + 36 >> 2] = $0;
  $0 = $3 + 12 | 0;
  HEAP32[$3 + 24 >> 2] = $0;
  HEAP32[$3 + 32 >> 2] = $0;
  block1 : {
   if (($1_1 | 0) != ($2_1 | 0)) {
    $0 = $3 + 16 | 0;
    $1_1 = HEAP32[$0 + 4 >> 2];
    $2_1 = HEAP32[$1_1 + 4 >> 2];
    HEAP32[$1_1 + 4 >> 2] = $2_1 + 1;
    $6 = HEAP32[$0 >> 2];
    $1_1 = HEAP32[$1_1 >> 2];
    $0 = HEAP32[$0 + 8 >> 2];
    HEAP32[$0 >> 2] = HEAP32[$0 >> 2] + 4;
    HEAP32[$1_1 + ($2_1 << 2) >> 2] = HEAP32[$6 >> 2];
    break block1;
   }
   $6 = $3 + 32 | 0;
   $1_1 = HEAP32[$6 + 8 >> 2];
   $7_1 = HEAP32[$6 + 4 >> 2];
   $0 = global$0 - 16 | 0;
   global$0 = $0;
   $2_1 = HEAP32[$1_1 + 4 >> 2] + 1 | 0;
   if ($2_1 >>> 0 >= 1073741824) {
    $48();
    wasm2js_trap();
   }
   $4_1 = HEAP32[$1_1 + 8 >> 2];
   $5 = $4_1 << 1;
   $2_1 = $4_1 >>> 0 >= 536870911 ? 1073741823 : $2_1 >>> 0 < $5 >>> 0 ? $5 : $2_1;
   $5 = HEAP32[$1_1 + 4 >> 2];
   $4_1 = 0;
   HEAP32[$0 + 8 >> 2] = 0;
   HEAP32[$0 + 12 >> 2] = 0;
   HEAP32[$0 >> 2] = 0;
   HEAP32[$0 + 4 >> 2] = 0;
   if ($2_1) {
    if ($2_1 >>> 0 >= 1073741824) {
     $51();
     wasm2js_trap();
    }
    $4_1 = $149($2_1 << 2);
    HEAP32[$0 >> 2] = $4_1;
   }
   HEAP32[$0 + 12 >> 2] = $2_1;
   HEAP32[$0 + 8 >> 2] = 0;
   HEAP32[$0 + 4 >> 2] = ($5 << 2) + $4_1;
   $2_1 = HEAP32[$0 + 8 >> 2];
   HEAP32[$0 + 8 >> 2] = $2_1 + 1;
   $5 = HEAP32[$0 + 4 >> 2] + ($2_1 << 2) | 0;
   HEAP32[$5 >> 2] = HEAP32[$7_1 >> 2];
   $4_1 = $1_1 + 4 | 0;
   $7_1 = HEAP32[$4_1 >> 2] << 2;
   $2_1 = HEAP32[$0 + 4 >> 2] - $7_1 | 0;
   if ($7_1) {
    wasm2js_memory_copy($2_1, HEAP32[$1_1 >> 2], $7_1)
   }
   HEAP32[$0 + 8 >> 2] = (HEAP32[$0 + 4 >> 2] + (HEAP32[$0 + 8 >> 2] << 2) | 0) - $2_1 >> 2;
   HEAP32[$0 + 4 >> 2] = $2_1;
   HEAP32[$4_1 >> 2] = 0;
   $75($0, $1_1, $4_1, $1_1 + 8 | 0);
   HEAP32[$0 >> 2] = HEAP32[$0 + 4 >> 2];
   $1_1 = HEAP32[$0 + 8 >> 2] << 2;
   HEAP32[$0 + 8 >> 2] = $1_1 - ((HEAP32[$0 + 4 >> 2] + $1_1 | 0) - HEAP32[$0 + 4 >> 2] & -4) >> 2;
   $1_1 = HEAP32[$0 >> 2];
   if ($1_1) {
    $214($1_1)
   }
   global$0 = $0 + 16 | 0;
   HEAP32[HEAP32[$6 >> 2] >> 2] = $5 + 4;
  }
  HEAP32[19494] = HEAP32[$3 + 12 >> 2] - HEAP32[19493] >> 2;
  global$0 = $3 + 48 | 0;
 }

 function $28($0, $1_1, $2_1, $3, $4_1) {
  $0 = +$0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3 = $3 | 0;
  $4_1 = $4_1 | 0;
  var $5 = 0.0, $6 = 0, $7_1 = 0, $8 = 0, $9 = 0.0, $10 = 0.0, $11 = 0, $12 = 0.0, $13_1 = 0, $14 = 0.0, $15 = 0, $16_1 = 0.0, $17 = 0, $18 = 0.0, $19_1 = 0, $20_1 = 0, $21 = 0.0, $22_1 = 0.0, $23_1 = 0.0, $24_1 = 0, $25_1 = 0.0, $26_1 = 0, $27_1 = 0.0, $28_1 = 0.0, $29 = 0, $30 = 0, $31_1 = 0.0, $32 = 0, $33 = 0, $34 = 0, $35_1 = 0.0, $36_1 = 0.0, $37_1 = 0.0, $38 = 0.0, $39 = 0, $40_1 = 0, $41_1 = 0.0, $42_1 = 0.0, $43_1 = 0, wasm2js_i32$0 = 0, wasm2js_f64$0 = 0.0;
  $20_1 = global$0 - 16 | 0;
  global$0 = $20_1;
  $39 = ($3 | 0) != 0;
  $40_1 = ($2_1 | 0) != 0;
  while (1) {
   if ($0 > 1.0e-06) {
    if ($4_1) {
     $25(0)
    }
    HEAP8[$20_1 + 13 | 0] = $39;
    HEAP8[$20_1 + 12 | 0] = $40_1;
    HEAP32[$20_1 + 8 >> 2] = $1_1;
    $2_1 = HEAP32[$20_1 + 12 >> 2];
    HEAP32[$20_1 >> 2] = HEAP32[$20_1 + 8 >> 2];
    HEAP32[$20_1 + 4 >> 2] = $2_1;
    $2_1 = 0;
    $17 = global$0 - 32 | 0;
    global$0 = $17;
    $16_1 = $0 > .011111111111111112 ? .011111111111111112 : $0;
    HEAPF64[9688] = $16_1 + HEAPF64[9688];
    HEAP32[$17 + 16 >> 2] = 77584;
    HEAP32[$17 + 12 >> 2] = 77592;
    HEAP32[$17 + 8 >> 2] = 77576;
    HEAP32[$17 + 4 >> 2] = 77568;
    HEAP32[$17 >> 2] = 77560;
    while (1) {
     if (($2_1 | 0) == 20) {
      __inlined_func$29$15 : {
       $14 = 0.0;
       $11 = 0;
       $24_1 = 0;
       $13_1 = global$0 - 32 | 0;
       global$0 = $13_1;
       HEAP8[77640] = 0;
       $41_1 = 1.0 - $162($16_1 * -2.0);
       label0 : while (1) {
        if (($11 | 0) != 6) {
         $25_1 = HEAPF64[9687];
         $2_1 = Math_imul($11, 48) + 77496 | 0;
         $18 = HEAPF64[$2_1 + 160 >> 3];
         $5 = $23($18 + 28.0);
         $9 = $23(HEAPF64[$2_1 + 160 >> 3] + -4.0);
         $3 = ~~Math_ceil((HEAPF64[$2_1 + 160 >> 3] + -56.0) / 96.0);
         $3 = ($3 | 0) > 0 ? $3 : 0;
         $31($13_1, $3);
         $23_1 = $5 - $9;
         $9 = $18 * 6.283185307179586 / 1152.0;
         $5 = $23_1 * 19.0 + ($169($9 + $9 + $14 * 1.6) * 8.0 + $169($9 * 5.0 + $14) * 5.0);
         $5 = $5 < -15.0 ? -15.0 : $5 > 15.0 ? 15.0 : $5;
         $18 = $18 - $25_1;
         $18 = Math_floor($18 / 1152.0 + .5) * -1152.0 + $18;
         $25_1 = HEAPF64[$2_1 + 160 >> 3];
         $28_1 = HEAPF64[$13_1 + 8 >> 3] - $25_1;
         if (!(!($28_1 < 40.0) | !(($3 + $11 >>> 0) % 3 | 0))) {
          $5 = (HEAPF64[$13_1 >> 3] - $5) * ($28_1 / -40.0 + 1.0) + $5
         }
         $3 = $2_1 + 152 | 0;
         block2 : {
          if (!($18 < 2.0) | !($18 > -17.0)) {
           break block2
          }
          $21 = HEAPF64[$3 >> 3];
          $10 = HEAPF64[9689];
          if (!(Math_abs($21 - $10) < 3.5)) {
           break block2
          }
          $5 = $10 + ($10 <= $21 ? 5.0 : -5.0);
          $5 = $5 < -16.0 ? -16.0 : $5 > 16.0 ? 16.0 : $5;
         }
         $2_1 = 0;
         while (1) if (($2_1 | 0) == 288) {
          $10 = HEAPF64[$3 + 32 >> 3] - $16_1;
          $30 = $10 > 0.0;
          HEAPF64[$3 + 32 >> 3] = $30 ? $10 : 0.0;
          $31_1 = HEAPF64[$3 + 40 >> 3];
          $10 = $31_1 - $16_1;
          HEAPF64[$3 + 40 >> 3] = $10 > 0.0 ? $10 : 0.0;
          $10 = HEAPF64[$3 >> 3];
          $5 = ($5 - $10) * 1.5;
          $5 = $5 < -10.0 ? -10.0 : $5 > 10.0 ? 10.0 : $5;
          HEAPF64[$3 + 24 >> 3] = $5 * -.035;
          $5 = $10 + $5 * $16_1;
          $21 = $5 < -16.4 ? -16.4 : $5 > 16.4 ? 16.4 : $5;
          HEAPF64[$3 >> 3] = $21;
          $42_1 = Math_abs($23_1) * -8.0;
          $5 = $169($9 * 4.0 + $14 * 1.9);
          $9 = $5 > 0.0 ? $5 : 0.0;
          $8 = 0;
          wasm2js_scratch_store_f64(6.0);
          $7_1 = wasm2js_scratch_load_i32(1) | 0;
          $15 = wasm2js_scratch_load_i32(0) | 0;
          $32 = $7_1 >>> 20 & 2047;
          $33 = $32 - 1086 | 0;
          wasm2js_scratch_store_f64(+$9);
          $2_1 = wasm2js_scratch_load_i32(1) | 0;
          $6 = wasm2js_scratch_load_i32(0) | 0;
          $29 = $2_1 >>> 20 | 0;
          __inlined_func$165$16 : {
           block3 : {
            block1 : {
             if ($33 >>> 0 > 4294967167 & $29 - 2047 >>> 0 >= 4294965250) {
              break block1
             }
             $8 = $7_1 << 1 | $15 >>> 31;
             $19_1 = $8 - 1 | 0;
             $43_1 = $19_1 + 1 | 0;
             $26_1 = $19_1;
             $19_1 = $15 << 1;
             $34 = $19_1 - 1 | 0;
             $26_1 = ($34 | 0) != -1 ? $43_1 : $26_1;
             if (!(($26_1 | 0) == -2097153 & ($34 | 0) != -1 | $26_1 >>> 0 < 4292870143)) {
              $5 = 1.0;
              if (!($8 | $19_1) | !$6 & ($2_1 | 0) == 1072693248) {
               break block3
              }
              $2_1 = $2_1 << 1 | $6 >>> 31;
              $6 = $6 << 1;
              $12 = $9 + 6.0;
              if (!(!(($2_1 | 0) == -2097152 & ($6 | 0) != 0 | $2_1 >>> 0 > 4292870144) & (!$19_1 & ($8 | 0) == -2097152 | $8 >>> 0 < 4292870144))) {
               break __inlined_func$165$16
              }
              if (!$6 & ($2_1 | 0) == 2145386496) {
               break block3
              }
              $12 = ($7_1 | 0) < 0 ^ $2_1 >>> 0 < 2145386496 ? 0.0 : 36.0;
              break __inlined_func$165$16;
             }
             $8 = ($2_1 << 1 | $6 >>> 31) - 1 | 0;
             $26_1 = $8 + 1 | 0;
             $19_1 = $8;
             $8 = ($6 << 1) - 1 | 0;
             $19_1 = ($8 | 0) != -1 ? $26_1 : $19_1;
             if (!(($19_1 | 0) == -2097153 & ($8 | 0) != -1 | $19_1 >>> 0 < 4292870143)) {
              $5 = $9 * $9;
              if (($2_1 | 0) < 0) {
               $5 = ($166($15, $7_1) | 0) == 1 ? -$5 : $5
              }
              if (($7_1 | 0) >= 0) {
               break block3
              }
              $12 = 1.0 / $5;
              break __inlined_func$165$16;
             }
             $8 = 0;
             if (($2_1 | 0) < 0) {
              $2_1 = $166($15, $7_1);
              if (!$2_1) {
               $5 = $9 - $9;
               $12 = $5 / $5;
               break __inlined_func$165$16;
              }
              $8 = ($2_1 | 0) == 1 ? 262144 : 0;
              $29 = $29 & 2047;
              wasm2js_scratch_store_f64(+$9);
              $2_1 = wasm2js_scratch_load_i32(1) | 0;
              $6 = wasm2js_scratch_load_i32(0) | 0;
              $2_1 = $2_1 & 2147483647;
             }
             if ($33 >>> 0 <= 4294967167) {
              $5 = 1.0;
              $8 = ($2_1 | 0) == 1072693248;
              if ($8 & !$6 | $32 >>> 0 < 958) {
               break block3
              }
              if ((($6 | 0) != 0 & $8 | $2_1 >>> 0 > 1072693248) != (($7_1 | 0) < 0 | 0)) {
               $12 = $161(0);
               break __inlined_func$165$16;
              }
              $12 = $160(0);
              break __inlined_func$165$16;
             }
             if ($29) {
              break block1
             }
             wasm2js_scratch_store_f64(+($9 * 4503599627370496.0));
             $2_1 = wasm2js_scratch_load_i32(1) | 0;
             $6 = wasm2js_scratch_load_i32(0) | 0;
             $2_1 = ($2_1 & 2147483647) - 54525952 | 0;
            }
            wasm2js_scratch_store_i32(0, $15 & -134217728);
            wasm2js_scratch_store_i32(1, $7_1 | 0);
            $23_1 = +wasm2js_scratch_load_f64();
            $7_1 = $2_1;
            $2_1 = $2_1 - 1072076117 | 0;
            $7_1 = $7_1 - ($2_1 & -1048576) | 0;
            $15 = $6 - -2147483648 >>> 0 < 2147483648 ? $7_1 + 1 | 0 : $7_1;
            wasm2js_scratch_store_i32(0, 0);
            wasm2js_scratch_store_i32(1, $15 | 0);
            $9 = +wasm2js_scratch_load_f64();
            $15 = ($2_1 >>> 13 & 127) << 5;
            $10 = HEAPF64[$15 + 71048 >> 3];
            $5 = $9 * $10 + -1.0;
            $12 = HEAPF64[8874];
            $22_1 = $5 * $12;
            $35_1 = $5 * $22_1;
            $36_1 = +($2_1 >> 20 >>> 0) + +($2_1 >> 31) * 4294967296.0;
            $37_1 = $36_1 * HEAPF64[8872] + HEAPF64[$15 + 71064 >> 3];
            wasm2js_scratch_store_i32(0, $6 | 0);
            wasm2js_scratch_store_i32(1, $7_1 | 0);
            $38 = $10 * (+wasm2js_scratch_load_f64() - $9);
            $5 = $5 + $38;
            $27_1 = $37_1 + $5;
            $9 = $35_1 + $27_1;
            $12 = $12 * $5;
            $10 = $5 * $12;
            $27_1 = $35_1 + ($27_1 - $9) + ($38 * ($22_1 + $12) + ($36_1 * HEAPF64[8873] + HEAPF64[$15 + 71072 >> 3] + ($5 + ($37_1 - $27_1)))) + $5 * $10 * ($10 * ($10 * ($5 * HEAPF64[8880] + HEAPF64[8879]) + ($5 * HEAPF64[8878] + HEAPF64[8877])) + ($5 * HEAPF64[8876] + HEAPF64[8875]));
            $5 = $9 + $27_1;
            wasm2js_scratch_store_f64(+$5);
            $2_1 = wasm2js_scratch_load_i32(1) | 0;
            wasm2js_scratch_store_i32(0, wasm2js_scratch_load_i32(0) & -134217728);
            wasm2js_scratch_store_i32(1, $2_1 | 0);
            $10 = +wasm2js_scratch_load_f64();
            $22_1 = $23_1 * $10;
            wasm2js_scratch_store_f64(+$22_1);
            $6 = wasm2js_scratch_load_i32(1) | 0;
            wasm2js_scratch_load_i32(0) | 0;
            block12 : {
             $2_1 = $6 >>> 20 & 2047;
             if ($2_1 - 969 >>> 0 < 63) {
              break block12
             }
             $12 = $8 ? -1.0 : 1.0;
             if ($2_1 >>> 0 <= 968) {
              break __inlined_func$165$16
             }
             $7_1 = $2_1 >>> 0 < 1033;
             $2_1 = 0;
             if ($7_1) {
              break block12
             }
             if (($6 | 0) < 0) {
              $12 = $160($8);
              break __inlined_func$165$16;
             }
             $12 = $161($8);
             break __inlined_func$165$16;
            }
            $12 = (6.0 - $23_1) * $10 + ($27_1 + ($9 - $5) + ($5 - $10)) * 6.0;
            $5 = HEAPF64[8603];
            $10 = $22_1 * HEAPF64[8602] + $5;
            $5 = $10 - $5;
            $5 = $12 + ($5 * HEAPF64[8605] + ($5 * HEAPF64[8604] + $22_1));
            $9 = $5 * $5;
            $12 = $9 * $9 * ($5 * HEAPF64[8609] + HEAPF64[8608]);
            $9 = $9 * ($5 * HEAPF64[8607] + HEAPF64[8606]);
            wasm2js_scratch_store_f64(+$10);
            wasm2js_scratch_load_i32(1) | 0;
            $15 = wasm2js_scratch_load_i32(0) | 0;
            $7_1 = $15 << 4 & 2032;
            $5 = $12 + ($9 + (HEAPF64[$7_1 + 68928 >> 3] + $5));
            $6 = HEAP32[$7_1 + 68936 >> 2];
            $7_1 = HEAP32[$7_1 + 68940 >> 2] + ($8 + $15 << 13) | 0;
            if (!$2_1) {
             __inlined_func$167$132 : {
              if (!($15 & -2147483648)) {
               $2_1 = $7_1 - 1058013184 | 0;
               wasm2js_scratch_store_i32(0, $6 | 0);
               wasm2js_scratch_store_i32(1, $2_1 | 0);
               $9 = +wasm2js_scratch_load_f64();
               $12 = ($9 * $5 + $9) * 5486124068793688683255936.0e279;
               break __inlined_func$167$132;
              }
              $2_1 = $7_1 + 1071644672 | 0;
              wasm2js_scratch_store_i32(0, $6 | 0);
              wasm2js_scratch_store_i32(1, $2_1 | 0);
              $9 = +wasm2js_scratch_load_f64();
              $23_1 = $9 * $5;
              $5 = $23_1 + $9;
              if (Math_abs($5) < 1.0) {
               $2_1 = $2_1 & -2147483648;
               wasm2js_scratch_store_i32(0, 0);
               wasm2js_scratch_store_i32(1, $2_1 | 0);
               $12 = +wasm2js_scratch_load_f64();
               $10 = $5 < 0.0 ? -1.0 : 1.0;
               $22_1 = $5 + $10;
               $5 = $22_1 + ($23_1 + ($9 - $5) + ($5 + ($10 - $22_1))) - $10;
               $5 = $5 == 0.0 ? $12 : $5;
              }
              $12 = $5 * 2.2250738585072014e-308;
             }
             break __inlined_func$165$16;
            }
            wasm2js_scratch_store_i32(0, $6 | 0);
            wasm2js_scratch_store_i32(1, $7_1 | 0);
            $9 = +wasm2js_scratch_load_f64();
            $5 = $9 * $5 + $9;
           }
           $12 = $5;
          }
          $5 = (HEAPF64[9687] - $25_1) * .19;
          $5 = $42_1 + ($12 * 8.0 + ($14 * 1.1 + 46.0) + ($31_1 > 0.0 ? 12.0 : 0.0)) + ($5 < -14.0 ? -14.0 : $5 > 16.0 ? 16.0 : $5);
          $9 = HEAPF64[$3 + 16 >> 3];
          if (!(!(Math_abs($21 - HEAPF64[$13_1 >> 3]) < 3.0) | (!($28_1 >= 0.0) | !($28_1 < $16_1 * $9)))) {
           HEAP32[$3 + 40 >> 2] = 858993459;
           HEAP32[$3 + 44 >> 2] = 1072902963;
          }
          $5 = (($30 ? $5 * .53 : $5) - $9) * $41_1 + $9;
          HEAPF64[$3 + 16 >> 3] = $5;
          HEAPF64[$3 + 8 >> 3] = $5 * $16_1 + $25_1;
          if (!(!(Math_abs($21 - HEAPF64[9689]) < 2.3) | (!($18 > 3.0) | !($18 < 22.0)))) {
           HEAP8[77640] = 1
          }
          $24_1 = $24_1 + 48 | 0;
          $11 = $11 + 1 | 0;
          $14 = $14 + 1.0;
          continue label0;
         } else {
          block6 : {
           if (($2_1 | 0) == ($24_1 | 0)) {
            break block6
           }
           $6 = $2_1 + 77496 | 0;
           $10 = HEAPF64[$6 + 160 >> 3] - $25_1;
           $10 = Math_floor($10 / 1152.0 + .5) * -1152.0 + $10;
           if (!($10 > 0.0) | !($10 < 9.0)) {
            break block6
           }
           $10 = HEAPF64[$6 + 152 >> 3];
           $21 = HEAPF64[$3 >> 3];
           if (!(Math_abs($10 - $21) < 2.5)) {
            break block6
           }
           $5 = $5 + ($10 <= $21 ? 3.0 : -3.0);
          }
          $2_1 = $2_1 + 48 | 0;
          continue;
         };
        }
        break;
       };
       global$0 = $13_1 + 32 | 0;
       $5 = $23(HEAPF64[9687] + 16.0);
       $9 = $23(HEAPF64[9687] + -8.0);
       $2_1 = HEAPU8[$20_1 + 5 | 0];
       $9 = $5 - $9;
       $18 = HEAPF64[9692];
       $5 = HEAPF64[9690];
       $14 = +(Math_imul(HEAP32[$20_1 >> 2], $2_1 ? 29 : 22) | 0) - $9 * $18 * ($2_1 ? .28 : .75) - $5;
       $5 = $5 + $14 * (1.0 - $162($16_1 * -7.0));
       HEAPF64[9690] = $5;
       $14 = $5 * $16_1 + HEAPF64[9689];
       $14 = $14 < -18.0 ? -18.0 : $14 > 18.0 ? 18.0 : $14;
       HEAPF64[9689] = $14;
       $10 = $9 * -.44;
       if (!(Math_abs($14) >= 18.0) | !($5 * $14 > 0.0) | HEAPF64[9699] != 0.0) {
        $12 = $5
       } else {
        HEAP32[19398] = -858993459;
        HEAP32[19399] = 1072483532;
        HEAPF64[9690] = $5 * .15;
        HEAPF64[9692] = $18 * .82;
        HEAP32[$17 >> 2] = 5;
        $27($17);
        $12 = HEAPF64[9690];
       }
       $5 = HEAPF64[9691];
       $14 = $10 + $12 * -.027 - $5;
       (wasm2js_i32$0 = 77528, wasm2js_f64$0 = $5 + $14 * (1.0 - $162($16_1 * -8.0))), HEAPF64[wasm2js_i32$0 >> 3] = wasm2js_f64$0;
       $3 = HEAPU8[$20_1 + 4 | 0];
       $5 = HEAPF64[9694];
       block31 : {
        if (!($2_1 | ($3 | 0) != 1 | (HEAPU8[77641] | !($5 > 0.0)))) {
         $5 = $16_1 * -22.0 + $5;
         $14 = $5 > 0.0 ? $5 : 0.0;
         HEAPF64[9694] = $14;
         $5 = 1.0;
         if ($14 != 0.0) {
          break block31
         }
         HEAP8[77641] = 1;
         break block31;
        }
        $5 = (HEAPU8[77640] ? 24.0 : 10.0) * $16_1 + $5;
        $5 = $5 < 100.0 ? $5 : 100.0;
        HEAPF64[9694] = $5;
        if (!$3 | $5 > 30.0) {
         HEAP8[77641] = 0
        }
        $5 = HEAPF64[9698] > 0.0 ? 1.0 : 0.0;
       }
       $12 = $5;
       $5 = HEAPF64[9693];
       $14 = $12 - $5;
       $5 = $5 + $14 * (1.0 - $162($16_1 * -6.0));
       HEAPF64[9693] = $5;
       if ($2_1) {
        $12 = 29.0
       } else {
        $12 = $5 * 24.0 + 39.0 + (HEAPU8[77640] ? 6.0 : 0.0)
       }
       $5 = HEAPF64[9692];
       $14 = $12 - $5;
       $5 = $5 + $14 * (1.0 - $162($16_1 * -2.4));
       HEAPF64[9692] = $5;
       $14 = HEAPF64[9687];
       $12 = $16_1 * $5;
       $5 = $9 * HEAPF64[9689] / -24.0 + 1.0;
       $18 = $12 / ($5 < .87 ? .87 : $5 > 1.13 ? 1.13 : $5);
       $5 = $14 + $18;
       HEAPF64[9687] = $5;
       while (1) {
        $2_1 = HEAP32[19409];
        if (+(Math_imul($2_1, 96) | 0) < $5 + 210.0) {
         HEAP32[19409] = $2_1 + 1;
         $31($17, $2_1);
         $3 = global$0 - 48 | 0;
         global$0 = $3;
         $2_1 = HEAP32[19485];
         HEAP32[$3 + 12 >> 2] = HEAP32[19484] + ($2_1 << 5);
         $6 = HEAP32[19486];
         HEAP32[$3 + 20 >> 2] = 77936;
         HEAP32[$3 + 16 >> 2] = $17;
         HEAP32[$3 + 40 >> 2] = 77936;
         HEAP32[$3 + 36 >> 2] = $17;
         $7_1 = $3 + 12 | 0;
         HEAP32[$3 + 24 >> 2] = $7_1;
         HEAP32[$3 + 32 >> 2] = $7_1;
         block13 : {
          if (($2_1 | 0) != ($6 | 0)) {
           $8 = $3 + 16 | 0;
           $6 = HEAP32[$8 >> 2];
           $11 = HEAP32[$6 + 28 >> 2];
           $7_1 = HEAP32[$8 + 4 >> 2];
           $2_1 = HEAP32[$7_1 >> 2] + (HEAP32[$7_1 + 4 >> 2] << 5) | 0;
           HEAP32[$2_1 + 24 >> 2] = HEAP32[$6 + 24 >> 2];
           HEAP32[$2_1 + 28 >> 2] = $11;
           $11 = HEAP32[$6 + 20 >> 2];
           HEAP32[$2_1 + 16 >> 2] = HEAP32[$6 + 16 >> 2];
           HEAP32[$2_1 + 20 >> 2] = $11;
           $11 = HEAP32[$6 + 12 >> 2];
           HEAP32[$2_1 + 8 >> 2] = HEAP32[$6 + 8 >> 2];
           HEAP32[$2_1 + 12 >> 2] = $11;
           $11 = HEAP32[$6 + 4 >> 2];
           HEAP32[$2_1 >> 2] = HEAP32[$6 >> 2];
           HEAP32[$2_1 + 4 >> 2] = $11;
           $6 = HEAP32[$7_1 >> 2];
           $8 = HEAP32[$8 + 8 >> 2];
           HEAP32[$8 >> 2] = HEAP32[$8 >> 2] + 32;
           HEAP32[$7_1 + 4 >> 2] = ($2_1 - $6 | 0) + 32 >> 5;
           break block13;
          }
          $11 = $3 + 32 | 0;
          $8 = HEAP32[$11 + 8 >> 2];
          $6 = HEAP32[$11 + 4 >> 2];
          $2_1 = global$0 - 16 | 0;
          global$0 = $2_1;
          $7_1 = HEAP32[$8 + 4 >> 2] + 1 | 0;
          if ($7_1 >>> 0 >= 134217728) {
           $48();
           wasm2js_trap();
          }
          $13_1 = HEAP32[$8 + 8 >> 2];
          $15 = $13_1 << 1;
          $7_1 = $13_1 >>> 0 >= 67108863 ? 134217727 : $7_1 >>> 0 < $15 >>> 0 ? $15 : $7_1;
          $15 = HEAP32[$8 + 4 >> 2];
          $13_1 = 0;
          HEAP32[$2_1 + 8 >> 2] = 0;
          HEAP32[$2_1 + 12 >> 2] = 0;
          HEAP32[$2_1 >> 2] = 0;
          HEAP32[$2_1 + 4 >> 2] = 0;
          if ($7_1) {
           $13_1 = $49($7_1);
           HEAP32[$2_1 >> 2] = $13_1;
          }
          HEAP32[$2_1 + 12 >> 2] = $7_1;
          HEAP32[$2_1 + 8 >> 2] = 0;
          HEAP32[$2_1 + 4 >> 2] = ($15 << 5) + $13_1;
          $13_1 = HEAP32[$6 + 12 >> 2];
          $15 = HEAP32[$2_1 + 8 >> 2];
          $7_1 = HEAP32[$2_1 + 4 >> 2] + ($15 << 5) | 0;
          HEAP32[$7_1 + 8 >> 2] = HEAP32[$6 + 8 >> 2];
          HEAP32[$7_1 + 12 >> 2] = $13_1;
          $13_1 = HEAP32[$6 + 4 >> 2];
          HEAP32[$7_1 >> 2] = HEAP32[$6 >> 2];
          HEAP32[$7_1 + 4 >> 2] = $13_1;
          $13_1 = HEAP32[$6 + 20 >> 2];
          HEAP32[$7_1 + 16 >> 2] = HEAP32[$6 + 16 >> 2];
          HEAP32[$7_1 + 20 >> 2] = $13_1;
          $13_1 = HEAP32[$6 + 28 >> 2];
          HEAP32[$7_1 + 24 >> 2] = HEAP32[$6 + 24 >> 2];
          HEAP32[$7_1 + 28 >> 2] = $13_1;
          HEAP32[$2_1 + 8 >> 2] = $15 + 1;
          $13_1 = $8 + 4 | 0;
          $15 = HEAP32[$13_1 >> 2] << 5;
          $6 = HEAP32[$2_1 + 4 >> 2] - $15 | 0;
          if ($15) {
           wasm2js_memory_copy($6, HEAP32[$8 >> 2], $15)
          }
          HEAP32[$2_1 + 8 >> 2] = (HEAP32[$2_1 + 4 >> 2] + (HEAP32[$2_1 + 8 >> 2] << 5) | 0) - $6 >> 5;
          HEAP32[$2_1 + 4 >> 2] = $6;
          HEAP32[$13_1 >> 2] = 0;
          $75($2_1, $8, $13_1, $8 + 8 | 0);
          HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 4 >> 2];
          $6 = HEAP32[$2_1 + 8 >> 2] << 5;
          HEAP32[$2_1 + 8 >> 2] = $6 - ((HEAP32[$2_1 + 4 >> 2] + $6 | 0) - HEAP32[$2_1 + 4 >> 2] & -32) >> 5;
          $6 = HEAP32[$2_1 >> 2];
          if ($6) {
           $214($6)
          }
          global$0 = $2_1 + 16 | 0;
          HEAP32[HEAP32[$11 >> 2] >> 2] = $7_1 + 32;
         }
         HEAP32[19485] = HEAP32[$3 + 12 >> 2] - HEAP32[19484] >> 5;
         global$0 = $3 + 48 | 0;
         $5 = HEAPF64[9687];
         continue;
        }
        break;
       };
       $2_1 = HEAP32[19484];
       $8 = $2_1 + (HEAP32[19485] << 5) | 0;
       $7_1 = global$0 - 16 | 0;
       global$0 = $7_1;
       HEAP32[$7_1 + 12 >> 2] = 77496;
       $3 = global$0 - 16 | 0;
       global$0 = $3;
       global$0 = $3 + 16 | 0;
       $3 = HEAP32[$7_1 + 12 >> 2];
       while (1) {
        if (!(($2_1 | 0) == ($8 | 0) | HEAPF64[$2_1 + 8 >> 3] <= HEAPF64[$3 >> 3] + -30.0)) {
         $2_1 = $2_1 + 32 | 0;
         continue;
        }
        break;
       };
       block : {
        $6 = $2_1;
        if (($2_1 | 0) == ($8 | 0)) {
         break block
        }
        $11 = HEAP32[$7_1 + 12 >> 2];
        while (1) {
         $3 = $2_1 + 32 | 0;
         if (($3 | 0) == ($8 | 0)) {
          break block
         }
         $13_1 = $2_1 + 40 | 0;
         $2_1 = $3;
         if (HEAPF64[$13_1 >> 3] <= HEAPF64[$11 >> 3] + -30.0) {
          continue
         }
         HEAP16[$6 + 24 >> 1] = HEAPU16[$2_1 + 24 >> 1];
         $3 = HEAP32[$2_1 + 20 >> 2];
         HEAP32[$6 + 16 >> 2] = HEAP32[$2_1 + 16 >> 2];
         HEAP32[$6 + 20 >> 2] = $3;
         $3 = HEAP32[$2_1 + 12 >> 2];
         HEAP32[$6 + 8 >> 2] = HEAP32[$2_1 + 8 >> 2];
         HEAP32[$6 + 12 >> 2] = $3;
         $3 = HEAP32[$2_1 + 4 >> 2];
         HEAP32[$6 >> 2] = HEAP32[$2_1 >> 2];
         HEAP32[$6 + 4 >> 2] = $3;
         $6 = $6 + 32 | 0;
         continue;
        };
       }
       global$0 = $7_1 + 16 | 0;
       $3 = HEAP32[19485] << 5;
       $2_1 = $3 + HEAP32[19484] | 0;
       if (($2_1 | 0) != ($6 | 0)) {
        $7_1 = HEAP32[19484];
        $8 = ($7_1 - $2_1 | 0) + $3 | 0;
        $19_1 = $8 + $6 | 0;
        if (($3 | 0) != ($2_1 - $7_1 | 0)) {
         $3 = $8 - 6 | 0;
         if ($3) {
          wasm2js_memory_copy($6, ($2_1 - $6 | 0) + $6 | 0, $3)
         }
         $7_1 = HEAP32[19484];
        }
        HEAP32[19485] = $19_1 - $7_1 >> 5;
       }
       $3 = HEAP32[19485] << 5;
       $2_1 = HEAP32[19484];
       while (1) {
        if (!$3) {
         $2_1 = 0;
         while (1) {
          if (($2_1 | 0) == 288) {
           $7_1 = global$0 + -64 | 0;
           global$0 = $7_1;
           $8 = HEAP32[19487];
           $13_1 = $8 + Math_imul(HEAP32[19488], 24) | 0;
           label16 : while (1) {
            block17 : {
             if (($8 | 0) == ($13_1 | 0)) {
              $2_1 = HEAP32[19487];
              $8 = $2_1 + Math_imul(HEAP32[19488], 24) | 0;
              $6 = global$0 - 16 | 0;
              global$0 = $6;
              HEAP32[$6 + 12 >> 2] = 77496;
              $3 = global$0 - 16 | 0;
              global$0 = $3;
              global$0 = $3 + 16 | 0;
              $3 = HEAP32[$6 + 12 >> 2];
              while (1) {
               if (!(HEAPU8[$2_1 + 17 | 0] | ($2_1 | 0) == ($8 | 0) | HEAPF64[$2_1 + 8 >> 3] >= HEAPF64[$3 >> 3] + 143.0)) {
                $2_1 = $2_1 + 24 | 0;
                continue;
               }
               break;
              };
              block7 : {
               if (($2_1 | 0) == ($8 | 0)) {
                break block7
               }
               $11 = HEAP32[$6 + 12 >> 2];
               $3 = $2_1;
               while (1) {
                $3 = $3 + 24 | 0;
                if (($3 | 0) == ($8 | 0)) {
                 break block7
                }
                if (HEAPU8[$3 + 17 | 0] == 1 | HEAPF64[$3 + 8 >> 3] >= HEAPF64[$11 >> 3] + 143.0) {
                 continue
                }
                HEAP16[$2_1 + 16 >> 1] = HEAPU16[$3 + 16 >> 1];
                $13_1 = HEAP32[$3 + 12 >> 2];
                HEAP32[$2_1 + 8 >> 2] = HEAP32[$3 + 8 >> 2];
                HEAP32[$2_1 + 12 >> 2] = $13_1;
                $13_1 = HEAP32[$3 + 4 >> 2];
                HEAP32[$2_1 >> 2] = HEAP32[$3 >> 2];
                HEAP32[$2_1 + 4 >> 2] = $13_1;
                $2_1 = $2_1 + 24 | 0;
                continue;
               };
              }
              global$0 = $6 + 16 | 0;
              $6 = Math_imul(HEAP32[19488], 24);
              $3 = $6 + HEAP32[19487] | 0;
              if (($3 | 0) != ($2_1 | 0)) {
               $8 = HEAP32[19487];
               $11 = ($8 - $3 | 0) + $6 | 0;
               $19_1 = $11 + $2_1 | 0;
               if (($6 | 0) != ($3 - $8 | 0)) {
                $6 = $11 - 6 | 0;
                if ($6) {
                 wasm2js_memory_copy($2_1, ($3 - $2_1 | 0) + $2_1 | 0, $6)
                }
                $8 = HEAP32[19487];
               }
               HEAP32[19488] = ($19_1 - $8 | 0) / 24;
              }
              $11 = Math_imul(HEAP32[19491], 24);
              $2_1 = HEAP32[19490];
              break block17;
             }
             $5 = HEAPF64[$8 + 8 >> 3];
             $9 = $16_1 * (HEAPU8[$8 + 16 | 0] ? 126.0 : 116.0) + $5;
             HEAPF64[$8 + 8 >> 3] = $9;
             HEAPF64[$7_1 + 56 >> 3] = $5;
             HEAPF64[$7_1 + 48 >> 3] = $9 + 2.0;
             HEAP32[$7_1 + 40 >> 2] = $8;
             HEAP32[$7_1 + 44 >> 2] = $7_1 + 48;
             HEAP32[$7_1 + 36 >> 2] = $7_1 + 56;
             $5 = 0.0;
             $3 = 0;
             $2_1 = 0;
             while (1) {
              if (($2_1 | 0) == 288) {
               $11 = HEAP32[19485] << 5;
               $2_1 = HEAP32[19484];
               $6 = 0;
               block4 : {
                block69 : {
                 while (1) {
                  block5 : {
                   if (!$11) {
                    if (!($3 | $6)) {
                     break block4
                    }
                    if (!$3) {
                     break block5
                    }
                    HEAPF64[$3 + 32 >> 3] = HEAPU8[$8 + 16 | 0] ? 2.4 : 1.0;
                    break block69;
                   }
                   block79 : {
                    if (HEAPU8[$2_1 + 24 | 0] != 1) {
                     break block79
                    }
                    $15 = $2_1 + 16 | 0;
                    $24_1 = $2_1 + 8 | 0;
                    if (!$93($7_1 + 36 | 0, HEAPF64[$15 >> 3], HEAPF64[$24_1 >> 3] + -17.0)) {
                     break block79
                    }
                    HEAPF64[$7_1 + 48 >> 3] = HEAPF64[$24_1 >> 3] + -17.0;
                    $5 = HEAPF64[$15 >> 3];
                    $3 = 0;
                    $6 = $2_1;
                   }
                   $11 = $11 - 32 | 0;
                   $2_1 = $2_1 + 32 | 0;
                   continue;
                  }
                  break;
                 };
                 HEAP8[$6 + 24 | 0] = 0;
                }
                HEAP8[$8 + 17 | 0] = 1;
                HEAPF64[$7_1 + 8 >> 3] = $5;
                HEAP32[$7_1 + 24 >> 2] = 0;
                HEAP32[$7_1 + 28 >> 2] = 0;
                HEAPF64[$7_1 + 16 >> 3] = HEAPF64[$7_1 + 48 >> 3];
                $2_1 = $7_1 + 8 | 0;
                $26(77960, $2_1);
                HEAP32[$7_1 + 8 >> 2] = 2;
                $27($2_1);
               }
               $8 = $8 + 24 | 0;
               continue label16;
              }
              $11 = $2_1 + 77496 | 0;
              $6 = $11 + 152 | 0;
              $14 = HEAPF64[$7_1 + 56 >> 3];
              $9 = HEAPF64[$11 + 160 >> 3] - $14;
              $9 = $14 + (Math_floor($9 / 1152.0 + .5) * -1152.0 + $9);
              if ($93($7_1 + 36 | 0, HEAPF64[$6 >> 3], $9)) {
               HEAPF64[$7_1 + 48 >> 3] = $9;
               $5 = HEAPF64[$6 >> 3];
               $3 = $6;
              }
              $2_1 = $2_1 + 48 | 0;
              continue;
             };
            }
            break;
           };
           while (1) {
            if ($11) {
             HEAPF64[$2_1 + 16 >> 3] = $16_1 + HEAPF64[$2_1 + 16 >> 3];
             $11 = $11 - 24 | 0;
             $2_1 = $2_1 + 24 | 0;
             continue;
            }
            break;
           };
           $2_1 = HEAP32[19490];
           $8 = $2_1 + Math_imul(HEAP32[19491], 24) | 0;
           $11 = global$0 - 16 | 0;
           global$0 = $11;
           while (1) {
            if (!(($2_1 | 0) == ($8 | 0) | HEAPF64[$2_1 + 16 >> 3] >= .45)) {
             $2_1 = $2_1 + 24 | 0;
             continue;
            }
            break;
           };
           block14 : {
            $6 = $2_1;
            if (($2_1 | 0) == ($8 | 0)) {
             break block14
            }
            while (1) {
             $3 = $2_1 + 24 | 0;
             if (($3 | 0) == ($8 | 0)) {
              break block14
             }
             $13_1 = $2_1 + 40 | 0;
             $2_1 = $3;
             if (HEAPF64[$13_1 >> 3] >= .45) {
              continue
             }
             $3 = HEAP32[$2_1 + 20 >> 2];
             HEAP32[$6 + 16 >> 2] = HEAP32[$2_1 + 16 >> 2];
             HEAP32[$6 + 20 >> 2] = $3;
             $3 = HEAP32[$2_1 + 12 >> 2];
             HEAP32[$6 + 8 >> 2] = HEAP32[$2_1 + 8 >> 2];
             HEAP32[$6 + 12 >> 2] = $3;
             $3 = HEAP32[$2_1 + 4 >> 2];
             HEAP32[$6 >> 2] = HEAP32[$2_1 >> 2];
             HEAP32[$6 + 4 >> 2] = $3;
             $6 = $6 + 24 | 0;
             continue;
            };
           }
           global$0 = $11 + 16 | 0;
           $3 = Math_imul(HEAP32[19491], 24);
           $2_1 = $3 + HEAP32[19490] | 0;
           if (($2_1 | 0) != ($6 | 0)) {
            $3 = $3 + (HEAP32[19490] - $2_1 | 0) | 0;
            if ($3) {
             wasm2js_memory_copy($6, ($2_1 - $6 | 0) + $6 | 0, $3)
            }
            HEAP32[19491] = (($3 + $6 | 0) - HEAP32[19490] | 0) / 24;
           }
           global$0 = $7_1 - -64 | 0;
           HEAP32[19407] = 1;
           $5 = HEAPF64[9687];
           $2_1 = 160;
           $3 = 1;
           while (1) {
            if (($2_1 | 0) == 448) {
             $2_1 = HEAP32[19404];
             if (($2_1 | 0) < (~~Math_floor($5 / 1152.0) | 0)) {
              $2_1 = $2_1 + 1 | 0;
              HEAP32[19404] = $2_1;
              $9 = HEAPF64[9700];
              $5 = HEAPF64[9688] - $16_1 * ($5 + +($2_1 | 0) * -1152.0) / $18;
              HEAPF64[9700] = $5;
              HEAPF64[9701] = $5 - $9;
              HEAP32[$17 >> 2] = 7;
              $27($17);
             }
             global$0 = $17 + 32 | 0;
             break __inlined_func$29$15;
            }
            if (HEAPF64[$2_1 + 77496 >> 3] > $5) {
             $3 = $3 + 1 | 0;
             HEAP32[19407] = $3;
            }
            $2_1 = $2_1 + 48 | 0;
            continue;
           };
          }
          $3 = $2_1 + 77496 | 0;
          $5 = HEAPF64[$3 + 160 >> 3] - HEAPF64[9687];
          block1313 : {
           if (!(Math_abs(Math_floor($5 / 1152.0 + .5) * -1152.0 + $5) < 1.8)) {
            break block1313
           }
           $6 = $3 + 152 | 0;
           if (!(Math_abs(HEAPF64[9689] - HEAPF64[$6 >> 3]) < 2.0) | HEAPF64[9697] != 0.0) {
            break block1313
           }
           $35();
           $3 = $3 + 184 | 0;
           HEAP32[$3 >> 2] = 1717986918;
           HEAP32[$3 + 4 >> 2] = 1072064102;
           HEAPF64[9690] = HEAPF64[9690] + (HEAPF64[9689] >= HEAPF64[$6 >> 3] ? 7.0 : -7.0);
          }
          $2_1 = $2_1 + 48 | 0;
          continue;
         };
        }
        $6 = $2_1 + 24 | 0;
        block1416 : {
         if (HEAPU8[$6 | 0] != 1) {
          break block1416
         }
         $5 = HEAPF64[$2_1 + 8 >> 3] + -17.0;
         if (!($5 > $14) | !($5 <= HEAPF64[9687])) {
          break block1416
         }
         HEAP8[$6 | 0] = 0;
         if (!(Math_abs(HEAPF64[$2_1 + 16 >> 3] - HEAPF64[9689]) < 1.55)) {
          break block1416
         }
         $35();
        }
        $6 = $2_1 + 25 | 0;
        block15 : {
         if (HEAPU8[$6 | 0]) {
          break block15
         }
         $5 = HEAPF64[$2_1 + 8 >> 3];
         if (!($5 > $14) | !($5 <= HEAPF64[9687])) {
          break block15
         }
         HEAP8[$6 | 0] = 1;
         if (!(Math_abs(HEAPF64[$2_1 >> 3] - HEAPF64[9689]) < 2.9)) {
          break block15
         }
         HEAP32[19396] = -858993459;
         HEAP32[19397] = 1072745676;
         $6 = HEAP32[19408];
         HEAP32[19408] = $6 + 1;
         $5 = HEAPF64[9694] + 24.0;
         HEAPF64[9694] = $5 < 100.0 ? $5 : 100.0;
         if ($6 & 1) {
          $6 = HEAP32[19406];
          HEAP32[19406] = (($6 | 0) >= 2 ? 2 : $6) + 1;
         }
         $6 = HEAP32[19405];
         HEAP32[19405] = (($6 | 0) >= 2 ? 2 : $6) + 1;
         HEAP32[$17 >> 2] = 4;
         $27($17);
        }
        $3 = $3 - 32 | 0;
        $2_1 = $2_1 + 32 | 0;
        continue;
       };
      }
     } else {
      $3 = HEAP32[$2_1 + $17 >> 2];
      $5 = HEAPF64[$3 >> 3] - $16_1;
      HEAPF64[$3 >> 3] = $5 > 0.0 ? $5 : 0.0;
      $2_1 = $2_1 + 4 | 0;
      continue;
     }
     break;
    };
    $0 = $0 - $16_1;
    continue;
   }
   break;
  };
  global$0 = $20_1 + 16 | 0;
 }

 function $31($0, $1_1) {
  var $2_1 = 0.0;
  HEAP8[$0 + 25 | 0] = 0;
  HEAP8[$0 + 24 | 0] = (($1_1 | 0) % 3 | 0) != 0;
  HEAPF64[$0 + 8 >> 3] = +(Math_imul($1_1, 96) | 0) + 56.0;
  $1_1 = ($1_1 | 0) % 12 | 0;
  $2_1 = +HEAP32[($1_1 << 2) + 65536 >> 2];
  HEAPF64[$0 >> 3] = $2_1;
  HEAPF64[$0 + 16 >> 3] = (1 << $1_1 & 398 ? -7.0 : 7.0) + $2_1;
 }

 function $35() {
  var $0 = 0, $1_1 = 0, $2_1 = 0.0;
  $0 = global$0 - 16 | 0;
  global$0 = $0;
  block : {
   if (HEAPF64[9697] > 0.0) {
    break block
   }
   HEAP32[19394] = 858993459;
   HEAP32[19395] = 1072902963;
   HEAPF64[9692] = HEAPF64[9692] * .75;
   $1_1 = HEAP32[19405] - 1 | 0;
   HEAP32[19405] = $1_1;
   if (!$1_1) {
    HEAP32[19405] = 3;
    HEAP32[19394] = 0;
    HEAP32[19395] = 1073741824;
    HEAP32[19384] = 0;
    HEAP32[19385] = 1077149696;
    $2_1 = HEAPF64[9694] * .5;
    HEAPF64[9694] = $2_1 > 25.0 ? $2_1 : 25.0;
    HEAP32[$0 + 12 >> 2] = 6;
    $27($0 + 12 | 0);
    break block;
   }
   HEAP32[$0 + 8 >> 2] = 3;
   $27($0 + 8 | 0);
  }
  global$0 = $0 + 16 | 0;
 }

 function $36() {
  var $0 = 0, $1_1 = 0, $2_1 = 0;
  HEAP32[19526] = 0;
  HEAP32[19527] = 1075314688;
  HEAPF64[9760] = HEAPF64[9701];
  HEAPF64[9759] = HEAPF64[9700];
  HEAPF64[9755] = HEAPF64[9694];
  HEAPF64[9754] = HEAPF64[9693];
  HEAPF64[9753] = HEAPF64[9691];
  HEAPF64[9752] = HEAPF64[9689];
  HEAPF64[9751] = HEAPF64[9688];
  HEAPF64[9750] = HEAPF64[9687];
  HEAPF64[9762] = HEAPU8[77640];
  HEAPF64[9761] = HEAP32[19406];
  HEAPF64[9758] = HEAP32[19404];
  HEAPF64[9757] = HEAP32[19405];
  HEAPF64[9756] = HEAP32[19407];
  wasm2js_memory_fill(78112, 0, 96);
  $0 = 77648;
  $2_1 = 288;
  $1_1 = 78120;
  while (1) {
   if ($2_1) {
    HEAPF64[$1_1 - 8 >> 3] = HEAPF64[$0 >> 3];
    HEAPF64[$1_1 >> 3] = HEAPF64[$0 + 8 >> 3];
    $1_1 = $1_1 + 16 | 0;
    $2_1 = $2_1 - 48 | 0;
    $0 = $0 + 48 | 0;
    continue;
   } else {
    $0 = 78e3
   }
   break;
  };
  return $0 | 0;
 }

 function $37() {
  var $0 = 0, $1_1 = 0, $2_1 = 0, $3 = 0.0, $4_1 = 0, $5 = 0, $6 = 0.0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5 = $4_1 + 4 | 0;
  $0 = $5;
  HEAP32[$0 + 8 >> 2] = 0;
  HEAP32[$0 >> 2] = 0;
  HEAP32[$0 + 4 >> 2] = 0;
  HEAPF64[$2_1 + 8 >> 3] = +HEAP32[19404] * 1152.0;
  HEAP32[$2_1 >> 2] = $0;
  $0 = 77648;
  HEAP32[$2_1 + 4 >> 2] = $2_1 + 8;
  $1_1 = 6;
  while (1) {
   __inlined_func$38$23 : {
    if (($1_1 | 0) == 12) {
     $1_1 = HEAP32[19485] << 5;
     $0 = HEAP32[19484];
     while (1) {
      block2 : {
       if (!$1_1) {
        $1_1 = Math_imul(HEAP32[19488], 24);
        $0 = HEAP32[19487];
        break block2;
       }
       block3 : {
        if (HEAPU8[$0 + 25 | 0]) {
         break block3
        }
        $3 = HEAPF64[$0 + 8 >> 3];
        if (!($3 < HEAPF64[9687] + 153.0)) {
         break block3
        }
        $40($2_1, HEAPF64[$0 >> 3], $3, 0, 0.0);
       }
       block4 : {
        if (HEAPU8[$0 + 24 | 0] != 1) {
         break block4
        }
        $3 = HEAPF64[$0 + 8 >> 3] + -17.0;
        if (!($3 < HEAPF64[9687] + 145.0)) {
         break block4
        }
        $40($2_1, HEAPF64[$0 + 16 >> 3], $3, 1, 0.0);
       }
       $1_1 = $1_1 - 32 | 0;
       $0 = $0 + 32 | 0;
       continue;
      }
      break;
     };
     while (1) {
      if ($1_1) {
       $40($2_1, HEAPF64[$0 >> 3], HEAPF64[$0 + 8 >> 3], HEAPU8[$0 + 16 | 0] ? 3 : 2, 0.0);
       $1_1 = $1_1 - 24 | 0;
       $0 = $0 + 24 | 0;
       continue;
      }
      break;
     };
     $1_1 = Math_imul(HEAP32[19491], 24);
     $0 = HEAP32[19490];
     while (1) {
      if (!$1_1) {
       global$0 = $2_1 + 16 | 0;
       break __inlined_func$38$23;
      }
      $40($2_1, HEAPF64[$0 >> 3], HEAPF64[$0 + 8 >> 3], 5, HEAPF64[$0 + 16 >> 3]);
      $1_1 = $1_1 - 24 | 0;
      $0 = $0 + 24 | 0;
      continue;
     };
    }
    $6 = HEAPF64[9687];
    $3 = HEAPF64[$0 + 8 >> 3] - $6;
    $3 = Math_floor($3 / 1152.0 + .5) * -1152.0 + $3;
    if (!(!($3 > -10.0) | !($3 < 158.0))) {
     $40($2_1, HEAPF64[$0 >> 3], $6 + $3, $1_1, HEAPF64[$0 + 24 >> 3])
    }
    $1_1 = $1_1 + 1 | 0;
    $0 = $0 + 48 | 0;
    continue;
   }
   break;
  };
  $0 = HEAP32[19496];
  if ($0) {
   HEAP32[19497] = 0;
   $214($0);
   HEAP32[19498] = 0;
   HEAP32[19496] = 0;
   HEAP32[19497] = 0;
  }
  $57(77984, $5);
  $0 = global$0 - 16 | 0;
  global$0 = $0;
  HEAP32[$0 + 12 >> 2] = $5;
  $1_1 = HEAP32[$0 + 12 >> 2];
  $2_1 = HEAP32[$1_1 >> 2];
  if ($2_1) {
   HEAP32[$1_1 + 4 >> 2] = 0;
   $214($2_1);
  }
  global$0 = $0 + 16 | 0;
  global$0 = $4_1 + 16 | 0;
  return HEAP32[19497];
 }

 function $40($0, $1_1, $2_1, $3, $4_1) {
  var $5 = 0, $6 = 0, $7_1 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13_1 = 0, $14 = 0;
  $11 = global$0 - 16 | 0;
  global$0 = $11;
  $12 = HEAP32[$0 >> 2];
  HEAPF32[$11 >> 2] = $1_1;
  HEAPF32[$11 + 12 >> 2] = $4_1;
  HEAPF32[$11 + 8 >> 2] = $3 | 0;
  HEAPF32[$11 + 4 >> 2] = $2_1 - HEAPF64[HEAP32[$0 + 4 >> 2] >> 3];
  $7_1 = global$0 - 48 | 0;
  global$0 = $7_1;
  $0 = HEAP32[$12 + 4 >> 2];
  HEAP32[$7_1 + 12 >> 2] = HEAP32[$12 >> 2] + ($0 << 4);
  $3 = HEAP32[$12 + 8 >> 2];
  HEAP32[$7_1 + 20 >> 2] = $12;
  HEAP32[$7_1 + 16 >> 2] = $11;
  HEAP32[$7_1 + 40 >> 2] = $12;
  HEAP32[$7_1 + 36 >> 2] = $11;
  $10 = $7_1 + 12 | 0;
  HEAP32[$7_1 + 24 >> 2] = $10;
  HEAP32[$7_1 + 32 >> 2] = $10;
  block1 : {
   if (($0 | 0) != ($3 | 0)) {
    $5 = $7_1 + 16 | 0;
    $3 = HEAP32[$5 >> 2];
    $8 = HEAP32[$3 + 12 >> 2];
    $10 = HEAP32[$5 + 4 >> 2];
    $0 = HEAP32[$10 >> 2] + (HEAP32[$10 + 4 >> 2] << 4) | 0;
    HEAP32[$0 + 8 >> 2] = HEAP32[$3 + 8 >> 2];
    HEAP32[$0 + 12 >> 2] = $8;
    $8 = HEAP32[$3 + 4 >> 2];
    HEAP32[$0 >> 2] = HEAP32[$3 >> 2];
    HEAP32[$0 + 4 >> 2] = $8;
    $3 = HEAP32[$10 >> 2];
    $5 = HEAP32[$5 + 8 >> 2];
    HEAP32[$5 >> 2] = HEAP32[$5 >> 2] + 16;
    HEAP32[$10 + 4 >> 2] = ($0 - $3 | 0) + 16 >> 4;
    break block1;
   }
   $13_1 = $7_1 + 32 | 0;
   $8 = HEAP32[$13_1 + 4 >> 2];
   $10 = global$0 - 16 | 0;
   global$0 = $10;
   $0 = $10;
   $3 = HEAP32[$13_1 + 8 >> 2];
   $5 = HEAP32[$3 + 4 >> 2] + 1 | 0;
   if ($5 >>> 0 >= 268435456) {
    $48();
    wasm2js_trap();
   }
   $6 = HEAP32[$3 + 8 >> 2];
   $9 = $6 << 1;
   $5 = $6 >>> 0 >= 134217727 ? 268435455 : $5 >>> 0 < $9 >>> 0 ? $9 : $5;
   $9 = HEAP32[$3 + 4 >> 2];
   $6 = 0;
   HEAP32[$0 + 8 >> 2] = 0;
   HEAP32[$0 + 12 >> 2] = 0;
   HEAP32[$0 >> 2] = 0;
   HEAP32[$0 + 4 >> 2] = 0;
   if ($5) {
    if ($5 >>> 0 >= 268435456) {
     $51();
     wasm2js_trap();
    }
    $6 = $149($5 << 4);
    HEAP32[$0 >> 2] = $6;
   }
   HEAP32[$0 + 12 >> 2] = $5;
   HEAP32[$0 + 8 >> 2] = 0;
   HEAP32[$0 + 4 >> 2] = ($9 << 4) + $6;
   $9 = HEAP32[$8 + 12 >> 2];
   $5 = $0;
   $6 = HEAP32[$0 + 4 >> 2] + (HEAP32[$0 + 8 >> 2] << 4) | 0;
   HEAP32[$6 + 8 >> 2] = HEAP32[$8 + 8 >> 2];
   HEAP32[$6 + 12 >> 2] = $9;
   $9 = HEAP32[$8 + 4 >> 2];
   HEAP32[$6 >> 2] = HEAP32[$8 >> 2];
   HEAP32[$6 + 4 >> 2] = $9;
   $14 = $6 + 16 | 0;
   HEAP32[$0 + 8 >> 2] = $14 - HEAP32[$0 + 4 >> 2] >> 4;
   $6 = $3 + 4 | 0;
   $9 = HEAP32[$6 >> 2] << 4;
   $8 = HEAP32[$0 + 4 >> 2] - $9 | 0;
   if ($9) {
    wasm2js_memory_copy($8, HEAP32[$3 >> 2], $9)
   }
   HEAP32[$0 + 8 >> 2] = (HEAP32[$0 + 4 >> 2] + (HEAP32[$0 + 8 >> 2] << 4) | 0) - $8 >> 4;
   HEAP32[$0 + 4 >> 2] = $8;
   HEAP32[$6 >> 2] = 0;
   $75($0, $3, $6, $3 + 8 | 0);
   HEAP32[$0 >> 2] = HEAP32[$0 + 4 >> 2];
   $3 = HEAP32[$0 + 8 >> 2] << 4;
   HEAP32[$5 + 8 >> 2] = $3 - ((HEAP32[$0 + 4 >> 2] + $3 | 0) - HEAP32[$0 + 4 >> 2] & -16) >> 4;
   $0 = HEAP32[$0 >> 2];
   if ($0) {
    $214($0)
   }
   global$0 = $10 + 16 | 0;
   HEAP32[HEAP32[$13_1 >> 2] >> 2] = $14;
  }
  HEAP32[$12 + 4 >> 2] = HEAP32[$7_1 + 12 >> 2] - HEAP32[$12 >> 2] >> 4;
  global$0 = $7_1 + 48 | 0;
  global$0 = $11 + 16 | 0;
 }

 function $41() {
  return HEAP32[19496];
 }

 function $42() {
  return HEAP32[19494];
 }

 function $43($0) {
  $0 = $0 | 0;
  return HEAP32[HEAP32[19493] + ($0 << 2) >> 2];
 }

 function $44() {
  HEAP32[19494] = 0;
 }

 function $48() {
  var $0 = 0;
  $0 = global$0 - 16 | 0;
  global$0 = $0;
  HEAP32[$0 >> 2] = 65613;
  $146(65746, $0);
  wasm2js_trap();
 }

 function $49($0) {
  if ($0 >>> 0 >= 134217728) {
   $51();
   wasm2js_trap();
  }
  return $149($0 << 5);
 }

 function $51() {
  $146(65628, 0);
  wasm2js_trap();
 }

 function $57($0, $1_1) {
  var $2_1 = 0;
  HEAP32[$0 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
  $2_1 = HEAP32[$1_1 + 4 >> 2];
  HEAP32[$0 >> 2] = HEAP32[$1_1 >> 2];
  HEAP32[$0 + 4 >> 2] = $2_1;
  HEAP32[$1_1 + 8 >> 2] = 0;
  HEAP32[$1_1 >> 2] = 0;
  HEAP32[$1_1 + 4 >> 2] = 0;
 }

 function $75($0, $1_1, $2_1, $3) {
  var $4_1 = 0;
  $4_1 = HEAP32[$0 + 8 >> 2];
  HEAP32[$0 + 8 >> 2] = HEAP32[$2_1 >> 2];
  HEAP32[$2_1 >> 2] = $4_1;
  $2_1 = HEAP32[$0 + 4 >> 2];
  HEAP32[$0 + 4 >> 2] = HEAP32[$1_1 >> 2];
  $4_1 = HEAP32[$0 + 12 >> 2];
  HEAP32[$0 + 12 >> 2] = HEAP32[$3 >> 2];
  HEAP32[$1_1 >> 2] = $2_1;
  HEAP32[$3 >> 2] = $4_1;
 }

 function $93($0, $1_1, $2_1) {
  var $3 = 0, $4_1 = 0;
  block : {
   if (!(HEAPF64[HEAP32[$0 >> 2] >> 3] + -1.0 <= $2_1)) {
    break block
   }
   $3 = HEAP32[$0 + 4 >> 2];
   if (!(HEAPF64[$3 + 8 >> 3] + 1.0 >= $2_1) | !(HEAPF64[HEAP32[$0 + 8 >> 2] >> 3] > $2_1)) {
    break block
   }
   $4_1 = Math_abs($1_1 - HEAPF64[$3 >> 3]) < (HEAPU8[$3 + 16 | 0] ? 4.0 : 1.55);
  }
  return $4_1;
 }

 function $146($0, $1_1) {
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[$2_1 + 12 >> 2] = $1_1;
  $204(HEAP32[18786], $0, $1_1);
  wasm2js_trap();
 }

 function $149($0) {
  var $1_1 = 0, $2_1 = 0, $3 = 0;
  $0 = $0 >>> 0 <= 1 ? 1 : $0;
  block1 : {
   while (1) {
    $1_1 = $211($0);
    if (!$1_1) {
     $1_1 = HEAP32[19552];
     if (!$1_1) {
      break block1
     }
     FUNCTION_TABLE[$1_1 | 0]();
     continue;
    }
    break;
   };
   return $1_1;
  }
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  $0 = HEAP32[18786];
  $179(65812, 11, 1, $0);
  HEAP32[$1_1 + 12 >> 2] = 0;
  $204($0, 65684, 0);
  __inlined_func$177$56 : {
   block : {
    if (HEAP32[$0 + 72 >> 2] == 10) {
     break block
    }
    $1_1 = HEAP32[$0 + 20 >> 2];
    if (($1_1 | 0) == HEAP32[$0 + 16 >> 2]) {
     break block
    }
    HEAP32[$0 + 20 >> 2] = $1_1 + 1;
    HEAP8[$1_1 | 0] = 10;
    break __inlined_func$177$56;
   }
   $1_1 = global$0 - 16 | 0;
   global$0 = $1_1;
   HEAP8[$1_1 + 15 | 0] = 10;
   $2_1 = HEAP32[$0 + 16 >> 2];
   block2 : {
    if ($2_1) {
     $3 = $2_1
    } else {
     if ($175($0)) {
      break block2
     }
     $3 = HEAP32[$0 + 16 >> 2];
    }
    $2_1 = HEAP32[$0 + 20 >> 2];
    if (!(($3 | 0) == ($2_1 | 0) | HEAP32[$0 + 72 >> 2] == 10)) {
     HEAP32[$0 + 20 >> 2] = $2_1 + 1;
     HEAP8[$2_1 | 0] = 10;
     break block2;
    }
    if ((FUNCTION_TABLE[HEAP32[$0 + 32 >> 2]]($0, $1_1 + 15 | 0, 1) | 0) != 1) {
     break block2
    }
   }
   global$0 = $1_1 + 16 | 0;
  }
  wasm2js_trap();
 }

 function $153($0) {
  var $1_1 = 0, $2_1 = 0, $3 = 0;
  block : {
   if (HEAPU8[78220]) {
    break block
   }
   $1_1 = HEAP32[19553];
   if (!$1_1) {
    HEAP32[19553] = 78224;
    $1_1 = 78224;
   }
   $2_1 = HEAP32[19554];
   if (($2_1 | 0) == 32) {
    $2_1 = _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE(260, 0, 1);
    $3 = !$2_1;
    $1_1 = $211($2_1);
    if (!($3 | (!$1_1 | !(HEAPU8[$1_1 - 4 | 0] & 3)))) {
     wasm2js_memory_fill($1_1, 0, $2_1)
    }
    if (!$1_1) {
     break block
    }
    HEAP32[$1_1 >> 2] = HEAP32[19553];
    HEAP32[19553] = $1_1;
    $2_1 = 0;
   }
   HEAP32[19554] = $2_1 + 1;
   $1_1 = ($2_1 << 2) + $1_1 | 0;
   HEAP32[$1_1 + 132 >> 2] = 0;
   HEAP32[$1_1 + 4 >> 2] = $0;
  }
 }

 function $154($0, $1_1) {
  var $2_1 = 0.0, $3 = 0.0, $4_1 = 0.0, $5 = 0.0;
  $2_1 = $0 * $0;
  $3 = $2_1 * .5;
  $4_1 = 1.0 - $3;
  $5 = 1.0 - $4_1 - $3;
  $3 = $2_1 * $2_1;
  return $4_1 + ($5 + ($2_1 * ($2_1 * ($2_1 * ($2_1 * 2.480158728947673e-05 + -.001388888888887411) + .0416666666666666) + $3 * $3 * ($2_1 * ($2_1 * -1.1359647557788195e-11 + 2.087572321298175e-09) + -2.7557314351390663e-07)) - $0 * $1_1));
 }

 function $156($0, $1_1) {
  var $2_1 = 0, $3 = 0, $4_1 = 0, $5 = 0, $6 = 0.0, $7_1 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13_1 = 0, $14 = 0, $15 = 0, $16_1 = 0.0, $17 = 0, $18 = 0, $19_1 = 0.0, $20_1 = 0, $21 = 0, $22_1 = 0, $23_1 = 0, $24_1 = 0, $25_1 = 0, $26_1 = 0, $27_1 = 0, $28_1 = 0, $29 = 0, $30 = 0, $31_1 = 0, $32 = 0, $33 = 0, $34 = 0, $35_1 = 0;
  $12 = global$0 - 48 | 0;
  global$0 = $12;
  wasm2js_scratch_store_f64(+$0);
  $18 = wasm2js_scratch_load_i32(1) | 0;
  $3 = wasm2js_scratch_load_i32(0) | 0;
  block4 : {
   block10 : {
    $2_1 = $18 & 2147483647;
    block1 : {
     if ($2_1 >>> 0 <= 1074752122) {
      if (($18 & 1048575) == 598523) {
       break block1
      }
      if ($2_1 >>> 0 <= 1073928572) {
       if (($18 | 0) >= 0) {
        $0 = $0 + -1.5707963267341256;
        $6 = $0 + -6.077100506506192e-11;
        HEAPF64[$1_1 >> 3] = $6;
        HEAPF64[$1_1 + 8 >> 3] = $0 - $6 + -6.077100506506192e-11;
        $3 = 1;
        break block4;
       }
       $0 = $0 + 1.5707963267341256;
       $6 = $0 + 6.077100506506192e-11;
       HEAPF64[$1_1 >> 3] = $6;
       HEAPF64[$1_1 + 8 >> 3] = $0 - $6 + 6.077100506506192e-11;
       $3 = -1;
       break block4;
      }
      if (($18 | 0) >= 0) {
       $0 = $0 + -3.1415926534682512;
       $6 = $0 + -1.2154201013012384e-10;
       HEAPF64[$1_1 >> 3] = $6;
       HEAPF64[$1_1 + 8 >> 3] = $0 - $6 + -1.2154201013012384e-10;
       $3 = 2;
       break block4;
      }
      $0 = $0 + 3.1415926534682512;
      $6 = $0 + 1.2154201013012384e-10;
      HEAPF64[$1_1 >> 3] = $6;
      HEAPF64[$1_1 + 8 >> 3] = $0 - $6 + 1.2154201013012384e-10;
      $3 = -2;
      break block4;
     }
     if ($2_1 >>> 0 <= 1075594811) {
      if ($2_1 >>> 0 <= 1075183036) {
       if (($2_1 | 0) == 1074977148) {
        break block1
       }
       if (($18 | 0) >= 0) {
        $0 = $0 + -4.712388980202377;
        $6 = $0 + -1.8231301519518578e-10;
        HEAPF64[$1_1 >> 3] = $6;
        HEAPF64[$1_1 + 8 >> 3] = $0 - $6 + -1.8231301519518578e-10;
        $3 = 3;
        break block4;
       }
       $0 = $0 + 4.712388980202377;
       $6 = $0 + 1.8231301519518578e-10;
       HEAPF64[$1_1 >> 3] = $6;
       HEAPF64[$1_1 + 8 >> 3] = $0 - $6 + 1.8231301519518578e-10;
       $3 = -3;
       break block4;
      }
      if (($2_1 | 0) == 1075388923) {
       break block1
      }
      if (($18 | 0) >= 0) {
       $0 = $0 + -6.2831853069365025;
       $6 = $0 + -2.430840202602477e-10;
       HEAPF64[$1_1 >> 3] = $6;
       HEAPF64[$1_1 + 8 >> 3] = $0 - $6 + -2.430840202602477e-10;
       $3 = 4;
       break block4;
      }
      $0 = $0 + 6.2831853069365025;
      $6 = $0 + 2.430840202602477e-10;
      HEAPF64[$1_1 >> 3] = $6;
      HEAPF64[$1_1 + 8 >> 3] = $0 - $6 + 2.430840202602477e-10;
      $3 = -4;
      break block4;
     }
     if ($2_1 >>> 0 > 1094263290) {
      break block10
     }
    }
    $19_1 = $0 * .6366197723675814 + 6755399441055744.0 + -6755399441055744.0;
    $6 = $0 + $19_1 * -1.5707963267341256;
    $16_1 = $19_1 * 6.077100506506192e-11;
    $0 = $6 - $16_1;
    HEAPF64[$1_1 >> 3] = $0;
    $3 = $2_1 >>> 20 | 0;
    wasm2js_scratch_store_f64(+$0);
    $2_1 = wasm2js_scratch_load_i32(1) | 0;
    wasm2js_scratch_load_i32(0) | 0;
    block11 : {
     if (($3 - ($2_1 >>> 20 & 2047) | 0) < 17) {
      break block11
     }
     $16_1 = $6;
     $0 = $19_1 * 6.077100506303966e-11;
     $6 = $6 - $0;
     $16_1 = $19_1 * 2.0222662487959506e-21 - ($16_1 - $6 - $0);
     $0 = $6 - $16_1;
     HEAPF64[$1_1 >> 3] = $0;
     wasm2js_scratch_store_f64(+$0);
     $2_1 = wasm2js_scratch_load_i32(1) | 0;
     wasm2js_scratch_load_i32(0) | 0;
     if (($3 - ($2_1 >>> 20 & 2047) | 0) < 50) {
      break block11
     }
     $16_1 = $6;
     $0 = $19_1 * 2.0222662487111665e-21;
     $6 = $6 - $0;
     $16_1 = $19_1 * 8.4784276603689e-32 - ($16_1 - $6 - $0);
     $0 = $6 - $16_1;
     HEAPF64[$1_1 >> 3] = $0;
    }
    $3 = ~~$19_1;
    HEAPF64[$1_1 + 8 >> 3] = $6 - $0 - $16_1;
    break block4;
   }
   if ($2_1 >>> 0 >= 2146435072) {
    $0 = $0 - $0;
    HEAPF64[$1_1 >> 3] = $0;
    HEAPF64[$1_1 + 8 >> 3] = $0;
    $3 = 0;
    break block4;
   }
   $7_1 = $18 & 1048575 | 1096810496;
   wasm2js_scratch_store_i32(0, $3 | 0);
   wasm2js_scratch_store_i32(1, $7_1 | 0);
   $0 = +wasm2js_scratch_load_f64();
   $6 = +(~~$0 | 0);
   HEAPF64[$12 + 16 >> 3] = $6;
   $0 = ($0 - $6) * 16777216.0;
   $6 = +(~~$0 | 0);
   HEAPF64[$12 + 24 >> 3] = $6;
   HEAPF64[$12 + 32 >> 3] = ($0 - $6) * 16777216.0;
   $3 = $12 + 32 | 0;
   $9 = 4;
   while (1) {
    $9 = $9 - 1 | 0;
    $0 = HEAPF64[$3 >> 3];
    $3 = $3 - 8 | 0;
    if ($0 == 0.0) {
     continue
    }
    break;
   };
   $17 = $12 + 16 | 0;
   $8 = global$0 - 560 | 0;
   global$0 = $8;
   $3 = ($2_1 >>> 20 | 0) - 1046 | 0;
   $2_1 = ($3 - 3 | 0) / 24 | 0;
   $10 = ($2_1 | 0) > 0 ? $2_1 : 0;
   $21 = Math_imul($10, -24) + $3 | 0;
   $14 = HEAP32[16493];
   $22_1 = $9 - 1 | 0;
   $2_1 = $14 + $22_1 | 0;
   block : {
    if (($2_1 | 0) < 0) {
     break block
    }
    $3 = $10 - $22_1 | 0;
    if ($2_1) {
     $2_1 = $9 + $14 | 0;
     $7_1 = $2_1 & 1;
     $5 = (($10 << 2) - ($9 << 2) | 0) + 65992 | 0;
     $11 = $2_1 & -2;
     $2_1 = $8 + 320 | 0;
     while (1) {
      $20_1 = $3 + $4_1 | 0;
      HEAPF64[$2_1 >> 3] = ($20_1 | 0) >= 0 ? +HEAP32[$5 - 4 >> 2] : 0.0;
      HEAPF64[$2_1 + 8 >> 3] = ($20_1 | 0) >= -1 ? +HEAP32[$5 >> 2] : 0.0;
      $2_1 = $2_1 + 16 | 0;
      $5 = $5 + 8 | 0;
      $4_1 = $4_1 + 2 | 0;
      if (($11 | 0) != ($4_1 | 0)) {
       continue
      }
      break;
     };
     if (!$7_1) {
      break block
     }
     $3 = $3 + $4_1 | 0;
    }
    HEAPF64[($8 + 320 | 0) + ($4_1 << 3) >> 3] = ($3 | 0) < 0 ? 0.0 : +HEAP32[($3 << 2) + 65984 >> 2];
   }
   $11 = $21 - 24 | 0;
   $2_1 = 0;
   $20_1 = ($14 | 0) > 0 ? $14 : 0;
   $15 = $9 & 2147483646;
   $13_1 = $9 & 1;
   $7_1 = ($8 + ($9 << 3) | 0) + 304 | 0;
   while (1) {
    $3 = $2_1;
    block7 : {
     if (($9 | 0) <= 0) {
      $0 = 0.0;
      break block7;
     }
     $5 = 0;
     $0 = 0.0;
     if ($22_1) {
      $2_1 = $7_1;
      $4_1 = $17;
      while (1) {
       $0 = HEAPF64[$4_1 + 8 >> 3] * HEAPF64[$2_1 >> 3] + (HEAPF64[$4_1 >> 3] * HEAPF64[$2_1 + 8 >> 3] + $0);
       $2_1 = $2_1 - 16 | 0;
       $4_1 = $4_1 + 16 | 0;
       $5 = $5 + 2 | 0;
       if (($15 | 0) != ($5 | 0)) {
        continue
       }
       break;
      };
      if (!$13_1) {
       break block7
      }
     }
     $0 = HEAPF64[($5 << 3) + $17 >> 3] * HEAPF64[($8 + 320 | 0) + (($3 + $22_1 | 0) - $5 << 3) >> 3] + $0;
    }
    HEAPF64[($3 << 3) + $8 >> 3] = $0;
    $7_1 = $7_1 + 8 | 0;
    $2_1 = $3 + 1 | 0;
    if (($3 | 0) != ($20_1 | 0)) {
     continue
    }
    break;
   };
   $26_1 = $9 & 2147483646;
   $27_1 = $9 & 1;
   $28_1 = 47 - $21 | 0;
   $24_1 = 48 - $21 | 0;
   $3 = $8 + 480 | 0;
   $25_1 = $3 - 4 | 0;
   $20_1 = $25_1 + ($14 << 2) | 0;
   $29 = ($10 << 2) + 65984 | 0;
   $30 = $8 + 312 | 0;
   $31_1 = $3 - 16 | 0;
   $32 = $8 - 16 | 0;
   $33 = $11 - 1 | 0;
   $3 = $14;
   block36 : {
    while (1) {
     $2_1 = $3 << 3;
     $0 = HEAPF64[$2_1 + $8 >> 3];
     block9 : {
      if (($3 | 0) <= 0) {
       break block9
      }
      $5 = 0;
      if (($3 | 0) == 1) {
       $2_1 = $3
      } else {
       $7_1 = $3 & 1;
       $10 = $3 & 2147483646;
       $2_1 = $2_1 + $32 | 0;
       $4_1 = $8 + 480 | 0;
       while (1) {
        $6 = +(~~($0 * 5.9604644775390625e-08) | 0);
        HEAP32[$4_1 >> 2] = ~~($6 * -16777216.0 + $0);
        $0 = HEAPF64[$2_1 + 8 >> 3] + $6;
        $6 = +(~~($0 * 5.9604644775390625e-08) | 0);
        HEAP32[$4_1 + 4 >> 2] = ~~($6 * -16777216.0 + $0);
        $0 = HEAPF64[$2_1 >> 3] + $6;
        $4_1 = $4_1 + 8 | 0;
        $2_1 = $2_1 - 16 | 0;
        $5 = $5 + 2 | 0;
        if (($10 | 0) != ($5 | 0)) {
         continue
        }
        break;
       };
       if (!$7_1) {
        break block9
       }
       $2_1 = $3 - $5 | 0;
      }
      $6 = +(~~($0 * 5.9604644775390625e-08) | 0);
      HEAP32[($8 + 480 | 0) + ($5 << 2) >> 2] = ~~($6 * -16777216.0 + $0);
      $0 = HEAPF64[(($2_1 << 3) + $8 | 0) - 8 >> 3] + $6;
     }
     $0 = $168($0, $11);
     $0 = Math_floor($0 * .125) * -8.0 + $0;
     $15 = ~~$0;
     $0 = $0 - +($15 | 0);
     block15 : {
      block16 : {
       block14 : {
        $10 = ($11 | 0) <= 0;
        block13 : {
         if (!$10) {
          $7_1 = ($8 + ($3 << 2) | 0) + 476 | 0;
          $4_1 = HEAP32[$7_1 >> 2];
          $2_1 = $4_1 >> $24_1;
          $13_1 = $7_1;
          $7_1 = $4_1 - ($2_1 << $24_1) | 0;
          HEAP32[$13_1 >> 2] = $7_1;
          $15 = $2_1 + $15 | 0;
          $13_1 = $7_1 >> $28_1;
          break block13;
         }
         if ($11) {
          break block14
         }
         $13_1 = HEAP32[($8 + ($3 << 2) | 0) + 476 >> 2] >> 23;
        }
        if (($13_1 | 0) <= 0) {
         break block15
        }
        break block16;
       }
       $13_1 = 2;
       if ($0 >= .5) {
        break block16
       }
       $13_1 = 0;
       break block15;
      }
      $4_1 = 1;
      block17 : {
       if (($3 | 0) <= 0) {
        break block17
       }
       $5 = 0;
       $7_1 = 0;
       if (($3 | 0) != 1) {
        $34 = $3 & 1;
        $35_1 = $3 & 2147483646;
        $2_1 = $8 + 480 | 0;
        while (1) {
         $4_1 = HEAP32[$2_1 >> 2];
         block22 : {
          block21 : {
           if ($7_1) {
            $7_1 = 16777215
           } else {
            if (!$4_1) {
             break block21
            }
            $7_1 = 16777216;
           }
           HEAP32[$2_1 >> 2] = $7_1 - $4_1;
           $4_1 = 0;
           break block22;
          }
          $4_1 = 1;
         }
         $23_1 = $2_1 + 4 | 0;
         $7_1 = HEAP32[$23_1 >> 2];
         block26 : {
          block25 : {
           if ($4_1) {
            if (!$7_1) {
             break block25
            }
            $4_1 = 16777216;
           } else {
            $4_1 = 16777215
           }
           HEAP32[$23_1 >> 2] = $4_1 - $7_1;
           $7_1 = 1;
           $4_1 = 0;
           break block26;
          }
          $7_1 = 0;
          $4_1 = 1;
         }
         $2_1 = $2_1 + 8 | 0;
         $5 = $5 + 2 | 0;
         if (($35_1 | 0) != ($5 | 0)) {
          continue
         }
         break;
        };
        if (!$34) {
         break block17
        }
       }
       $4_1 = ($8 + 480 | 0) + ($5 << 2) | 0;
       $2_1 = HEAP32[$4_1 >> 2];
       $23_1 = $4_1;
       if ($7_1) {
        $4_1 = 16777215
       } else {
        $4_1 = 1;
        if (!$2_1) {
         break block17
        }
        $4_1 = 16777216;
       }
       HEAP32[$23_1 >> 2] = $4_1 - $2_1;
       $4_1 = 0;
      }
      block29 : {
       if ($10) {
        break block29
       }
       $2_1 = 8388607;
       block30 : {
        switch ($33 | 0) {
        case 1:
         $2_1 = 4194303;
         break;
        case 0:
         break block30;
        default:
         break block29;
        };
       }
       $7_1 = ($8 + ($3 << 2) | 0) + 476 | 0;
       HEAP32[$7_1 >> 2] = HEAP32[$7_1 >> 2] & $2_1;
      }
      $15 = $15 + 1 | 0;
      if (($13_1 | 0) != 2) {
       break block15
      }
      $0 = 1.0 - $0;
      $13_1 = 2;
      if ($4_1) {
       break block15
      }
      $0 = $0 - $168(1.0, $11);
     }
     if ($0 == 0.0) {
      block33 : {
       if (($3 | 0) <= ($14 | 0)) {
        break block33
       }
       $2_1 = $3 - $14 | 0;
       $5 = $2_1 & 3;
       $4_1 = 0;
       $7_1 = $3;
       block35 : {
        if ($14 - $3 >>> 0 <= 4294967292) {
         $10 = $2_1 & -4;
         $2_1 = ($3 << 2) + $31_1 | 0;
         while (1) {
          $4_1 = HEAP32[$2_1 >> 2] | (HEAP32[$2_1 + 4 >> 2] | (HEAP32[$2_1 + 8 >> 2] | (HEAP32[$2_1 + 12 >> 2] | $4_1)));
          $2_1 = $2_1 - 16 | 0;
          $7_1 = $7_1 - 4 | 0;
          $10 = $10 - 4 | 0;
          if ($10) {
           continue
          }
          break;
         };
         if (!$5) {
          break block35
         }
        }
        $2_1 = ($7_1 << 2) + $25_1 | 0;
        while (1) {
         $4_1 = HEAP32[$2_1 >> 2] | $4_1;
         $2_1 = $2_1 - 4 | 0;
         $5 = $5 - 1 | 0;
         if ($5) {
          continue
         }
         break;
        };
       }
       if (!$4_1) {
        break block33
       }
       $2_1 = ($8 + ($3 << 2) | 0) + 476 | 0;
       while (1) {
        $3 = $3 - 1 | 0;
        $11 = $11 - 24 | 0;
        $7_1 = HEAP32[$2_1 >> 2];
        $2_1 = $2_1 - 4 | 0;
        if (!$7_1) {
         continue
        }
        break;
       };
       break block36;
      }
      $2_1 = $20_1;
      $7_1 = $3;
      while (1) {
       $7_1 = $7_1 + 1 | 0;
       $4_1 = HEAP32[$2_1 >> 2];
       $2_1 = $2_1 - 4 | 0;
       if (!$4_1) {
        continue
       }
       break;
      };
      $10 = ($3 + $9 << 3) + $30 | 0;
      while (1) {
       $15 = $3 + $9 | 0;
       $3 = $3 + 1 | 0;
       HEAPF64[($8 + 320 | 0) + ($15 << 3) >> 3] = HEAP32[$29 + ($3 << 2) >> 2];
       block38 : {
        if (($9 | 0) <= 0) {
         $0 = 0.0;
         break block38;
        }
        $5 = 0;
        $0 = 0.0;
        if ($22_1) {
         $2_1 = $10;
         $4_1 = $17;
         while (1) {
          $0 = HEAPF64[$4_1 + 8 >> 3] * HEAPF64[$2_1 >> 3] + (HEAPF64[$4_1 >> 3] * HEAPF64[$2_1 + 8 >> 3] + $0);
          $2_1 = $2_1 - 16 | 0;
          $4_1 = $4_1 + 16 | 0;
          $5 = $5 + 2 | 0;
          if (($26_1 | 0) != ($5 | 0)) {
           continue
          }
          break;
         };
         if (!$27_1) {
          break block38
         }
        }
        $0 = HEAPF64[($5 << 3) + $17 >> 3] * HEAPF64[($8 + 320 | 0) + ($15 - $5 << 3) >> 3] + $0;
       }
       HEAPF64[($3 << 3) + $8 >> 3] = $0;
       $10 = $10 + 8 | 0;
       if (($3 | 0) < ($7_1 | 0)) {
        continue
       }
       break;
      };
      $3 = $7_1;
      continue;
     }
     break;
    };
    $0 = $168($0, 24 - $21 | 0);
    block41 : {
     if ($0 >= 16777216.0) {
      $2_1 = ~~($0 * 5.9604644775390625e-08);
      HEAP32[($8 + 480 | 0) + ($3 << 2) >> 2] = ~~(+($2_1 | 0) * -16777216.0 + $0);
      $3 = $3 + 1 | 0;
      $11 = $21;
      break block41;
     }
     $2_1 = ~~$0;
    }
    HEAP32[($8 + 480 | 0) + ($3 << 2) >> 2] = $2_1;
   }
   if (($3 | 0) >= 0) {
    $0 = $168(1.0, $11);
    if ($3 & 1) {
     $7_1 = $3
    } else {
     HEAPF64[($3 << 3) + $8 >> 3] = $0 * +HEAP32[($8 + 480 | 0) + ($3 << 2) >> 2];
     $0 = $0 * 5.9604644775390625e-08;
     $7_1 = $3 - 1 | 0;
    }
    if ($3) {
     $5 = $7_1 + 1 | 0;
     $2_1 = ($8 + ($7_1 << 2) | 0) + 476 | 0;
     $4_1 = (($7_1 << 3) + $8 | 0) - 8 | 0;
     while (1) {
      $6 = $0 * 5.9604644775390625e-08;
      HEAPF64[$4_1 >> 3] = $6 * +HEAP32[$2_1 >> 2];
      HEAPF64[$4_1 + 8 >> 3] = $0 * +HEAP32[$2_1 + 4 >> 2];
      $2_1 = $2_1 - 8 | 0;
      $4_1 = $4_1 - 16 | 0;
      $0 = $6 * 5.9604644775390625e-08;
      $5 = $5 - 2 | 0;
      if ($5) {
       continue
      }
      break;
     };
    }
    $17 = ($3 << 3) + $8 | 0;
    $2_1 = $3;
    while (1) {
     $4_1 = $2_1;
     $11 = $3 - $2_1 | 0;
     $2_1 = ($11 | 0) > ($14 | 0) ? $14 : $11;
     block47 : {
      if (($2_1 | 0) < 0) {
       $0 = 0.0;
       break block47;
      }
      $9 = $2_1 + 1 | 0;
      $5 = $9 & 3;
      block49 : {
       if ($2_1 >>> 0 < 3) {
        $0 = 0.0;
        $2_1 = 0;
        break block49;
       }
       $7_1 = 0;
       $10 = 0 - ($9 & -4) | 0;
       $0 = 0.0;
       $2_1 = 0;
       while (1) {
        $9 = $2_1 + $17 | 0;
        $0 = HEAPF64[$2_1 + 68776 >> 3] * HEAPF64[$9 + 24 >> 3] + (HEAPF64[$2_1 + 68768 >> 3] * HEAPF64[$9 + 16 >> 3] + (HEAPF64[$2_1 + 68760 >> 3] * HEAPF64[$9 + 8 >> 3] + (HEAPF64[$2_1 + 68752 >> 3] * HEAPF64[$9 >> 3] + $0)));
        $2_1 = $2_1 + 32 | 0;
        $7_1 = $7_1 - 4 | 0;
        if (($10 | 0) != ($7_1 | 0)) {
         continue
        }
        break;
       };
       if (!$5) {
        break block47
       }
       $2_1 = 0 - $7_1 | 0;
      }
      $2_1 = $2_1 << 3;
      while (1) {
       $0 = HEAPF64[$2_1 + 68752 >> 3] * HEAPF64[$2_1 + $17 >> 3] + $0;
       $2_1 = $2_1 + 8 | 0;
       $5 = $5 - 1 | 0;
       if ($5) {
        continue
       }
       break;
      };
     }
     HEAPF64[($8 + 160 | 0) + ($11 << 3) >> 3] = $0;
     $17 = $17 - 8 | 0;
     $2_1 = $4_1 - 1 | 0;
     if (($4_1 | 0) > 0) {
      continue
     }
     break;
    };
   }
   block62 : {
    if (($3 | 0) < 0) {
     $0 = 0.0;
     break block62;
    }
    $5 = $3 + 1 & 3;
    block64 : {
     if (!$5) {
      $0 = 0.0;
      $4_1 = $3;
      break block64;
     }
     $2_1 = ($8 + 160 | 0) + ($3 << 3) | 0;
     $0 = 0.0;
     $4_1 = $3;
     while (1) {
      $4_1 = $4_1 - 1 | 0;
      $0 = $0 + HEAPF64[$2_1 >> 3];
      $2_1 = $2_1 - 8 | 0;
      $5 = $5 - 1 | 0;
      if ($5) {
       continue
      }
      break;
     };
    }
    if ($3 >>> 0 < 3) {
     break block62
    }
    $5 = $4_1 + 1 | 0;
    $2_1 = ($8 + ($4_1 << 3) | 0) + 136 | 0;
    while (1) {
     $0 = $0 + HEAPF64[$2_1 + 24 >> 3] + HEAPF64[$2_1 + 16 >> 3] + HEAPF64[$2_1 + 8 >> 3] + HEAPF64[$2_1 >> 3];
     $2_1 = $2_1 - 32 | 0;
     $5 = $5 - 4 | 0;
     if ($5) {
      continue
     }
     break;
    };
   }
   HEAPF64[$12 >> 3] = $13_1 ? -$0 : $0;
   $0 = HEAPF64[$8 + 160 >> 3] - $0;
   block65 : {
    if (($3 | 0) <= 0) {
     break block65
    }
    $4_1 = $3 & 3;
    $7_1 = $8 + 160 | 0;
    if ($3 - 1 >>> 0 >= 3) {
     $3 = $3 & 2147483644;
     $2_1 = $8 + 192 | 0;
     $5 = 0;
     while (1) {
      $0 = $0 + HEAPF64[$2_1 - 24 >> 3] + HEAPF64[$2_1 - 16 >> 3] + HEAPF64[$2_1 - 8 >> 3] + HEAPF64[$2_1 >> 3];
      $2_1 = $2_1 + 32 | 0;
      $5 = $5 + 4 | 0;
      if (($3 | 0) != ($5 | 0)) {
       continue
      }
      break;
     };
     if (!$4_1) {
      break block65
     }
     $3 = $5 + 1 | 0;
    } else {
     $3 = 1
    }
    $2_1 = $7_1 + ($3 << 3) | 0;
    while (1) {
     $0 = $0 + HEAPF64[$2_1 >> 3];
     $2_1 = $2_1 + 8 | 0;
     $4_1 = $4_1 - 1 | 0;
     if ($4_1) {
      continue
     }
     break;
    };
   }
   HEAPF64[$12 + 8 >> 3] = $13_1 ? -$0 : $0;
   global$0 = $8 + 560 | 0;
   $3 = $15 & 7;
   $0 = HEAPF64[$12 >> 3];
   if (($18 | 0) < 0) {
    HEAPF64[$1_1 >> 3] = -$0;
    HEAPF64[$1_1 + 8 >> 3] = -HEAPF64[$12 + 8 >> 3];
    $3 = 0 - $3 | 0;
    break block4;
   }
   HEAPF64[$1_1 >> 3] = $0;
   HEAPF64[$1_1 + 8 >> 3] = HEAPF64[$12 + 8 >> 3];
  }
  global$0 = $12 + 48 | 0;
  return $3;
 }

 function $157($0, $1_1, $2_1) {
  var $3 = 0.0, $4_1 = 0.0, $5 = 0.0;
  $3 = $0 * $0;
  $5 = $3 * ($3 * $3) * ($3 * 1.58969099521155e-10 + -2.5050760253406863e-08) + ($3 * ($3 * 2.7557313707070068e-06 + -1.984126982985795e-04) + .00833333333332249);
  $4_1 = $0 * $3;
  if (!$2_1) {
   return $4_1 * ($3 * $5 + -.16666666666666632) + $0
  }
  return $0 - ($3 * ($1_1 * .5 - $4_1 * $5) - $1_1 + $4_1 * .16666666666666632);
 }

 function $158($0) {
  var $1_1 = 0.0, $2_1 = 0, $3 = 0;
  $3 = global$0 - 16 | 0;
  global$0 = $3;
  wasm2js_scratch_store_f64(+$0);
  $2_1 = wasm2js_scratch_load_i32(1) | 0;
  wasm2js_scratch_load_i32(0) | 0;
  $2_1 = $2_1 & 2147483647;
  block1 : {
   if ($2_1 >>> 0 <= 1072243195) {
    $1_1 = 1.0;
    if ($2_1 >>> 0 < 1044816030) {
     break block1
    }
    $1_1 = $154($0, 0.0);
    break block1;
   }
   $1_1 = $0 - $0;
   if ($2_1 >>> 0 >= 2146435072) {
    break block1
   }
   $2_1 = $156($0, $3);
   $0 = HEAPF64[$3 + 8 >> 3];
   $1_1 = HEAPF64[$3 >> 3];
   block6 : {
    switch (($2_1 & 3) - 1 | 0) {
    default:
     $1_1 = $154($1_1, $0);
     break block1;
    case 0:
     $1_1 = -$157($1_1, $0, 1);
     break block1;
    case 1:
     $1_1 = -$154($1_1, $0);
     break block1;
    case 2:
     break block6;
    };
   }
   $1_1 = $157($1_1, $0, 1);
  }
  global$0 = $3 + 16 | 0;
  return $1_1;
 }

 function $159($0, $1_1) {
  return $1_1 * ($0 ? -$1_1 : $1_1);
 }

 function $160($0) {
  return $159($0, 1.2882297539194267e-231);
 }

 function $161($0) {
  return $159($0, 3105036184601417870297958.0e207);
 }

 function $162($0) {
  var $1_1 = 0.0, $2_1 = 0, $3 = 0, $4_1 = 0, $5 = 0.0, $6 = 0.0, $7_1 = 0;
  wasm2js_scratch_store_f64(+$0);
  $2_1 = wasm2js_scratch_load_i32(1) | 0;
  $4_1 = wasm2js_scratch_load_i32(0) | 0;
  block1 : {
   $3 = $2_1 >>> 20 & 2047;
   if ($3 - 969 >>> 0 < 63) {
    $7_1 = $3;
    break block1;
   }
   if ($3 >>> 0 < 969) {
    return 1.0
   }
   if ($3 >>> 0 < 1033) {
    break block1
   }
   if (!(($4_1 | 0) != 0 | ($2_1 | 0) != -1048576)) {
    return 0.0
   }
   if (($3 | 0) == 2047) {
    return $0 + 1.0
   }
   if (($2_1 | 0) < 0) {
    return $160(0)
   }
   return $161(0);
  }
  $1_1 = HEAPF64[8603];
  $5 = $0 * HEAPF64[8602] + $1_1;
  $1_1 = $5 - $1_1;
  $0 = $1_1 * HEAPF64[8605] + ($1_1 * HEAPF64[8604] + $0);
  $1_1 = $0 * $0;
  $6 = $1_1 * $1_1 * ($0 * HEAPF64[8609] + HEAPF64[8608]);
  $1_1 = $1_1 * ($0 * HEAPF64[8607] + HEAPF64[8606]);
  wasm2js_scratch_store_f64(+$5);
  wasm2js_scratch_load_i32(1) | 0;
  $4_1 = wasm2js_scratch_load_i32(0) | 0;
  $2_1 = $4_1 << 4 & 2032;
  $0 = $6 + ($1_1 + (HEAPF64[$2_1 + 68928 >> 3] + $0));
  $3 = HEAP32[$2_1 + 68936 >> 2];
  $2_1 = HEAP32[$2_1 + 68940 >> 2] + ($4_1 << 13) | 0;
  if (!$7_1) {
   __inlined_func$163$63 : {
    if (!($4_1 & -2147483648)) {
     $2_1 = $2_1 - 1058013184 | 0;
     wasm2js_scratch_store_i32(0, $3 | 0);
     wasm2js_scratch_store_i32(1, $2_1 | 0);
     $1_1 = +wasm2js_scratch_load_f64();
     $0 = ($1_1 * $0 + $1_1) * 5486124068793688683255936.0e279;
     break __inlined_func$163$63;
    }
    $2_1 = $2_1 + 1071644672 | 0;
    wasm2js_scratch_store_i32(0, $3 | 0);
    wasm2js_scratch_store_i32(1, $2_1 | 0);
    $1_1 = +wasm2js_scratch_load_f64();
    $5 = $1_1 * $0;
    $0 = $5 + $1_1;
    if ($0 < 1.0) {
     $6 = $0 + 1.0;
     $0 = $6 + ($5 + ($1_1 - $0) + ($0 + (1.0 - $6))) + -1.0;
    }
    $0 = $0 * 2.2250738585072014e-308;
   }
   return $0;
  }
  wasm2js_scratch_store_i32(0, $3 | 0);
  wasm2js_scratch_store_i32(1, $2_1 | 0);
  $1_1 = +wasm2js_scratch_load_f64();
  return $1_1 * $0 + $1_1;
 }

 function $166($0, $1_1) {
  var $2_1 = 0, $3 = 0, $4_1 = 0, $5 = 0, $6 = 0;
  $2_1 = $1_1 >>> 20 & 2047;
  block : {
   if ($2_1 >>> 0 < 1023) {
    break block
   }
   $5 = 2;
   if ($2_1 >>> 0 > 1075) {
    break block
   }
   $5 = 0;
   $2_1 = 1075 - $2_1 | 0;
   $3 = $2_1 & 31;
   if (($2_1 & 63) >>> 0 >= 32) {
    $2_1 = 1 << $3;
    $4_1 = 0;
   } else {
    $4_1 = 1 << $3;
    $2_1 = $4_1 - 1 & 1 >>> 32 - $3;
   }
   $3 = $2_1 - 1 | 0;
   $6 = $4_1 - 1 | 0;
   $3 = ($6 | 0) != -1 ? $3 + 1 | 0 : $3;
   if ($0 & $6 | $1_1 & $3) {
    break block
   }
   $5 = $0 & $4_1 | $1_1 & $2_1 ? 1 : 2;
  }
  return $5;
 }

 function $168($0, $1_1) {
  block2 : {
   if (($1_1 | 0) >= 1024) {
    $0 = $0 * 8988465674311579538646525.0e283;
    if ($1_1 >>> 0 < 2047) {
     $1_1 = $1_1 - 1023 | 0;
     break block2;
    }
    $0 = $0 * 8988465674311579538646525.0e283;
    $1_1 = ($1_1 >>> 0 >= 3069 ? 3069 : $1_1) - 2046 | 0;
    break block2;
   }
   if (($1_1 | 0) > -1023) {
    break block2
   }
   $0 = $0 * 2.004168360008973e-292;
   if ($1_1 >>> 0 > 4294965304) {
    $1_1 = $1_1 + 969 | 0;
    break block2;
   }
   $0 = $0 * 2.004168360008973e-292;
   $1_1 = ($1_1 >>> 0 <= 4294964336 ? -2960 : $1_1) + 1938 | 0;
  }
  $1_1 = $1_1 + 1023 << 20;
  wasm2js_scratch_store_i32(0, 0);
  wasm2js_scratch_store_i32(1, $1_1 | 0);
  return $0 * +wasm2js_scratch_load_f64();
 }

 function $169($0) {
  var $1_1 = 0, $2_1 = 0, $3 = 0.0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  wasm2js_scratch_store_f64(+$0);
  $1_1 = wasm2js_scratch_load_i32(1) | 0;
  wasm2js_scratch_load_i32(0) | 0;
  $1_1 = $1_1 & 2147483647;
  block1 : {
   if ($1_1 >>> 0 <= 1072243195) {
    if ($1_1 >>> 0 < 1045430272) {
     break block1
    }
    $0 = $157($0, 0.0, 0);
    break block1;
   }
   if ($1_1 >>> 0 >= 2146435072) {
    $0 = $0 - $0;
    break block1;
   }
   $1_1 = $156($0, $2_1);
   $0 = HEAPF64[$2_1 + 8 >> 3];
   $3 = HEAPF64[$2_1 >> 3];
   block6 : {
    switch (($1_1 & 3) - 1 | 0) {
    default:
     $0 = $157($3, $0, 1);
     break block1;
    case 0:
     $0 = $154($3, $0);
     break block1;
    case 1:
     $0 = -$157($3, $0, 1);
     break block1;
    case 2:
     break block6;
    };
   }
   $0 = -$154($3, $0);
  }
  global$0 = $2_1 + 16 | 0;
  return $0;
 }

 function $173($0) {
  var $1_1 = 0, $2_1 = 0, $3 = 0, $4_1 = 0;
  $1_1 = HEAP32[$0 + 68 >> 2];
  if (HEAP32[19622] != 78488) {
   HEAP32[19622] = 78488;
   HEAP32[19636] = 0;
   HEAP32[19635] = 65536;
   HEAP32[19634] = 65536;
   HEAP32[19625] = HEAP32[19621];
   HEAP32[19338] = 65536;
   HEAP32[19624] = 78488;
   HEAP32[19623] = 78488;
  }
  $3 = HEAP32[19627];
  block1 : {
   if (($3 | 0) == ($1_1 & -1073741825)) {
    break block1
   }
   $1_1 = $0 + 68 | 0;
   $0 = HEAP32[$1_1 >> 2];
   HEAP32[$1_1 >> 2] = $0 ? $0 : $3;
   $2_1 = 1;
   if (!$0) {
    break block1
   }
   $0 = HEAP32[$1_1 >> 2];
   $4_1 = $3 | 1073741824;
   HEAP32[$1_1 >> 2] = $0 ? $0 : $4_1;
   if (!$0) {
    break block1
   }
   while (1) {
    block3 : {
     if (!($0 & 1073741824)) {
      $3 = $0 | 1073741824;
      $2_1 = HEAP32[$1_1 >> 2];
      HEAP32[$1_1 >> 2] = ($0 | 0) == ($2_1 | 0) ? $3 : $2_1;
      $2_1 = ($0 | 0) != ($2_1 | 0);
      $0 = $3;
      if ($2_1) {
       break block3
      }
     }
     $3 = global$0 - 16 | 0;
     global$0 = $3;
     $2_1 = -100;
     block : {
      while (1) {
       if (HEAP32[$1_1 >> 2] != ($0 | 0)) {
        break block
       }
       HEAP32[$3 + 12 >> 2] = 0;
       if (HEAP32[$1_1 >> 2] != ($0 | 0)) {
        break block
       }
       HEAP32[$3 + 12 >> 2] = 0;
       if (HEAP32[$1_1 >> 2] != ($0 | 0)) {
        break block
       }
       HEAP32[$3 + 12 >> 2] = 0;
       if (HEAP32[$1_1 >> 2] != ($0 | 0)) {
        break block
       }
       HEAP32[$3 + 12 >> 2] = 0;
       $2_1 = $2_1 + 4 | 0;
       if ($2_1) {
        continue
       }
       break;
      };
      if (HEAP32[$1_1 >> 2] != ($0 | 0)) {
       break block
      }
      while (1) {
       $2_1 = global$0 - 16 | 0;
       global$0 = $2_1;
       if (!($1_1 & 3 | ($0 | 0) != HEAP32[$1_1 >> 2])) {
        wasm2js_trap()
       }
       global$0 = $2_1 + 16 | 0;
       if (HEAP32[$1_1 >> 2] == ($0 | 0)) {
        continue
       }
       break;
      };
     }
     global$0 = $3 + 16 | 0;
    }
    $0 = HEAP32[$1_1 >> 2];
    HEAP32[$1_1 >> 2] = $0 ? $0 : $4_1;
    if ($0) {
     continue
    }
    break;
   };
   $2_1 = 1;
  }
  return $2_1;
 }

 function $174($0) {
  var $1_1 = 0, $2_1 = 0;
  $0 = $0 + 68 | 0;
  while (1) {
   $1_1 = HEAP32[$0 >> 2];
   $2_1 = HEAP32[$0 >> 2];
   HEAP32[$0 >> 2] = ($1_1 | 0) != ($2_1 | 0) ? $1_1 : 0;
   if (($1_1 | 0) != ($2_1 | 0)) {
    continue
   }
   break;
  };
 }

 function $175($0) {
  var $1_1 = 0;
  $1_1 = HEAP32[$0 + 64 >> 2];
  HEAP32[$0 + 64 >> 2] = $1_1 - 1 | $1_1;
  $1_1 = HEAP32[$0 >> 2];
  if ($1_1 & 8) {
   HEAP32[$0 >> 2] = $1_1 | 32;
   return -1;
  }
  HEAP32[$0 + 4 >> 2] = 0;
  HEAP32[$0 + 8 >> 2] = 0;
  $1_1 = HEAP32[$0 + 40 >> 2];
  HEAP32[$0 + 24 >> 2] = $1_1;
  HEAP32[$0 + 20 >> 2] = $1_1;
  HEAP32[$0 + 16 >> 2] = $1_1 + HEAP32[$0 + 44 >> 2];
  return 0;
 }

 function $178($0, $1_1, $2_1) {
  var $3 = 0, $4_1 = 0, $5 = 0;
  block1 : {
   $3 = HEAP32[$2_1 + 16 >> 2];
   if (!$3) {
    if ($175($2_1)) {
     break block1
    }
    $3 = HEAP32[$2_1 + 16 >> 2];
   }
   $5 = HEAP32[$2_1 + 20 >> 2];
   if ($1_1 >>> 0 > $3 - $5 >>> 0) {
    FUNCTION_TABLE[HEAP32[$2_1 + 32 >> 2]]($2_1, $0, $1_1) | 0;
    return;
   }
   block3 : {
    if (!$1_1 | HEAP32[$2_1 + 72 >> 2] < 0) {
     break block3
    }
    $4_1 = $0 + $1_1 | 0;
    $3 = 0;
    block4 : {
     while (1) {
      if (HEAPU8[($3 + $4_1 | 0) - 1 | 0] == 10) {
       break block4
      }
      $3 = $3 - 1 | 0;
      if ($3 + $1_1 | 0) {
       continue
      }
      break;
     };
     break block3;
    }
    $4_1 = $1_1 + $3 | 0;
    if (FUNCTION_TABLE[HEAP32[$2_1 + 32 >> 2]]($2_1, $0, $4_1) >>> 0 < $4_1 >>> 0) {
     break block1
    }
    $0 = $0 + $4_1 | 0;
    $1_1 = 0 - $3 | 0;
    $5 = HEAP32[$2_1 + 20 >> 2];
   }
   if ($1_1) {
    wasm2js_memory_copy($5, $0, $1_1)
   }
   HEAP32[$2_1 + 20 >> 2] = HEAP32[$2_1 + 20 >> 2] + $1_1;
  }
 }

 function $179($0, $1_1, $2_1, $3) {
  var $4_1 = 0, $5 = 0, $6 = 0;
  if (HEAP32[$3 + 68 >> 2] < 0) {
   $4_1 = 0
  } else {
   $4_1 = $173($3)
  }
  $6 = !$4_1;
  $1_1 = Math_imul($1_1, $2_1);
  $2_1 = HEAP32[$3 + 16 >> 2];
  block3 : {
   if (!$2_1) {
    if ($175($3)) {
     break block3
    }
    $2_1 = HEAP32[$3 + 16 >> 2];
   }
   $4_1 = HEAP32[$3 + 20 >> 2];
   if ($1_1 >>> 0 > $2_1 - $4_1 >>> 0) {
    FUNCTION_TABLE[HEAP32[$3 + 32 >> 2]]($3, $0, $1_1) | 0;
    break block3;
   }
   block6 : {
    if (!$1_1) {
     break block6
    }
    $2_1 = 0;
    if (HEAP32[$3 + 72 >> 2] < 0) {
     break block6
    }
    $5 = $0 + $1_1 | 0;
    block8 : {
     while (1) {
      if (HEAPU8[($2_1 + $5 | 0) - 1 | 0] == 10) {
       break block8
      }
      $2_1 = $2_1 - 1 | 0;
      if ($2_1 + $1_1 | 0) {
       continue
      }
      break;
     };
     $5 = 0;
     break block6;
    }
    $5 = $1_1 + $2_1 | 0;
    $4_1 = FUNCTION_TABLE[HEAP32[$3 + 32 >> 2]]($3, $0, $5) | 0;
    if ($4_1 >>> 0 < $5 >>> 0) {
     break block3
    }
    $0 = $0 + $5 | 0;
    $4_1 = HEAP32[$3 + 20 >> 2];
    $1_1 = 0 - $2_1 | 0;
   }
   $2_1 = $1_1;
   if ($2_1) {
    wasm2js_memory_copy($4_1, $0, $2_1)
   }
   HEAP32[$3 + 20 >> 2] = HEAP32[$3 + 20 >> 2] + $2_1;
  }
  if (!$6) {
   $174($3)
  }
 }

 function $186($0) {
  $0 = $0 | 0;
  wasm2js_trap();
 }

 function $187($0, $1_1, $2_1) {
  var $3 = 0, $4_1 = 0;
  $3 = global$0 - 16 | 0;
  global$0 = $3;
  $4_1 = -1;
  block1 : {
   if (($2_1 | 0) < 0) {
    HEAP32[19648] = 28;
    break block1;
   }
   HEAP32[$3 + 12 >> 2] = 0;
   $0 = fimport$3($0 | 0, $1_1 | 0, $2_1 | 0, $3 + 12 | 0) & 65535;
   if ($0) {
    HEAP32[19648] = $0;
    break block1;
   }
   $4_1 = HEAP32[$3 + 12 >> 2];
  }
  global$0 = $3 + 16 | 0;
  return $4_1;
 }

 function $188($0, $1_1, $2_1) {
  $0 = $0 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3 = 0, $4_1 = 0, $5 = 0, $6 = 0, $7_1 = 0, $8 = 0, $9 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[$4_1 + 12 >> 2] = $2_1;
  HEAP32[$4_1 + 8 >> 2] = $1_1;
  $1_1 = HEAP32[$0 + 24 >> 2];
  HEAP32[$4_1 >> 2] = $1_1;
  $3 = HEAP32[$0 + 20 >> 2];
  $5 = $3 - $1_1 | 0;
  HEAP32[$4_1 + 4 >> 2] = $5;
  $1_1 = ($1_1 | 0) == ($3 | 0);
  $3 = $1_1 ? $4_1 | 8 : $4_1;
  $6 = $1_1 ? 1 : 2;
  $1_1 = $187(HEAP32[$0 + 56 >> 2], $3, $6);
  $8 = $2_1 + $5 | 0;
  block2 : {
   if (($1_1 | 0) != ($8 | 0)) {
    while (1) {
     if (($1_1 | 0) < 0) {
      HEAP32[$0 + 24 >> 2] = 0;
      HEAP32[$0 + 16 >> 2] = 0;
      HEAP32[$0 + 20 >> 2] = 0;
      HEAP32[$0 >> 2] = HEAP32[$0 >> 2] | 32;
      $1_1 = 0;
      if (($6 | 0) == 2) {
       break block2
      }
      $1_1 = $2_1 - HEAP32[$3 + 4 >> 2] | 0;
      break block2;
     }
     $7_1 = HEAP32[$3 + 4 >> 2];
     $9 = $7_1 >>> 0 < $1_1 >>> 0;
     $5 = ($9 ? 8 : 0) + $3 | 0;
     $7_1 = $1_1 - ($9 ? $7_1 : 0) | 0;
     HEAP32[$5 >> 2] = $7_1 + HEAP32[$5 >> 2];
     $3 = ($9 ? 12 : 4) + $3 | 0;
     HEAP32[$3 >> 2] = HEAP32[$3 >> 2] - $7_1;
     $8 = $8 - $1_1 | 0;
     $3 = $5;
     $6 = $6 - $9 | 0;
     $1_1 = $187(HEAP32[$0 + 56 >> 2], $3, $6);
     if (($8 | 0) != ($1_1 | 0)) {
      continue
     }
     break;
    }
   }
   $1_1 = HEAP32[$0 + 40 >> 2];
   HEAP32[$0 + 24 >> 2] = $1_1;
   HEAP32[$0 + 20 >> 2] = $1_1;
   HEAP32[$0 + 16 >> 2] = $1_1 + HEAP32[$0 + 44 >> 2];
   $1_1 = $2_1;
  }
  global$0 = $4_1 + 16 | 0;
  return $1_1 | 0;
 }

 function $190($0, $1_1, $2_1, $3) {
  $0 = $0 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3 = $3 | 0;
  wasm2js_trap();
 }

 function $201($0, $1_1) {
  var $2_1 = 0;
  if (!$0) {
   return 0
  }
  if ($0) {
   __inlined_func$200$73 : {
    if ($1_1 >>> 0 <= 127) {
     HEAP8[$0 | 0] = $1_1;
     $0 = 1;
     break __inlined_func$200$73;
    }
    $2_1 = HEAP32[19659];
    if (!$2_1) {
     HEAP32[19659] = 78612;
     $2_1 = 78612;
    }
    block5 : {
     if (!HEAP32[$2_1 >> 2]) {
      if (($1_1 & -128) != 57216) {
       break block5
      }
      HEAP8[$0 | 0] = $1_1;
      $0 = 1;
      break __inlined_func$200$73;
     }
     if ($1_1 >>> 0 <= 2047) {
      HEAP8[$0 + 1 | 0] = $1_1 & 63 | 128;
      HEAP8[$0 | 0] = $1_1 >>> 6 | 192;
      $0 = 2;
      break __inlined_func$200$73;
     }
     if (!(($1_1 & -8192) != 57344 & $1_1 >>> 0 >= 55296)) {
      HEAP8[$0 + 2 | 0] = $1_1 & 63 | 128;
      HEAP8[$0 | 0] = $1_1 >>> 12 | 224;
      HEAP8[$0 + 1 | 0] = $1_1 >>> 6 & 63 | 128;
      $0 = 3;
      break __inlined_func$200$73;
     }
     if ($1_1 - 65536 >>> 0 <= 1048575) {
      HEAP8[$0 + 3 | 0] = $1_1 & 63 | 128;
      HEAP8[$0 | 0] = $1_1 >>> 18 | 240;
      HEAP8[$0 + 2 | 0] = $1_1 >>> 6 & 63 | 128;
      HEAP8[$0 + 1 | 0] = $1_1 >>> 12 & 63 | 128;
      $0 = 4;
      break __inlined_func$200$73;
     }
    }
    HEAP32[19648] = 25;
    $0 = -1;
   }
  } else {
   $0 = 1
  }
  return $0;
 }

 function $202($0, $1_1) {
  var $2_1 = 0, $3 = 0, $4_1 = 0;
  wasm2js_scratch_store_f64(+$0);
  $3 = wasm2js_scratch_load_i32(1) | 0;
  $4_1 = wasm2js_scratch_load_i32(0) | 0;
  $2_1 = $3 >>> 20 & 2047;
  if (($2_1 | 0) != 2047) {
   if (!$2_1) {
    if ($0 == 0.0) {
     HEAP32[$1_1 >> 2] = 0;
     return $0;
    }
    $0 = $202($0 * 18446744073709551615.0, $1_1);
    HEAP32[$1_1 >> 2] = HEAP32[$1_1 >> 2] + -64;
    return $0;
   }
   HEAP32[$1_1 >> 2] = $2_1 - 1022;
   $1_1 = $3 & -2146435073 | 1071644672;
   wasm2js_scratch_store_i32(0, $4_1 | 0);
   wasm2js_scratch_store_i32(1, $1_1 | 0);
   $0 = +wasm2js_scratch_load_f64();
  }
  return $0;
 }

 function $204($0, $1_1, $2_1) {
  var $3 = 0, $4_1 = 0, $5 = 0, $6 = 0;
  $3 = global$0 - 208 | 0;
  global$0 = $3;
  HEAP32[$3 + 204 >> 2] = $2_1;
  HEAP32[$3 + 192 >> 2] = 0;
  HEAP32[$3 + 196 >> 2] = 0;
  HEAP32[$3 + 184 >> 2] = 0;
  HEAP32[$3 + 188 >> 2] = 0;
  HEAP32[$3 + 176 >> 2] = 0;
  HEAP32[$3 + 180 >> 2] = 0;
  HEAP32[$3 + 168 >> 2] = 0;
  HEAP32[$3 + 172 >> 2] = 0;
  HEAP32[$3 + 160 >> 2] = 0;
  HEAP32[$3 + 164 >> 2] = 0;
  HEAP32[$3 + 200 >> 2] = $2_1;
  block1 : {
   if (($205(0, $1_1, $3 + 200 | 0, $3 + 80 | 0, $3 + 160 | 0) | 0) < 0) {
    break block1
   }
   if (HEAP32[$0 + 68 >> 2] < 0) {
    $2_1 = 0
   } else {
    $2_1 = $173($0)
   }
   $6 = !$2_1;
   $4_1 = HEAP32[$0 >> 2];
   HEAP32[$0 >> 2] = $4_1 & -33;
   block7 : {
    block6 : {
     block5 : {
      if (!HEAP32[$0 + 44 >> 2]) {
       HEAP32[$0 + 44 >> 2] = 80;
       HEAP32[$0 + 24 >> 2] = 0;
       HEAP32[$0 + 16 >> 2] = 0;
       HEAP32[$0 + 20 >> 2] = 0;
       $5 = HEAP32[$0 + 40 >> 2];
       HEAP32[$0 + 40 >> 2] = $3;
       break block5;
      }
      if (HEAP32[$0 + 16 >> 2]) {
       break block6
      }
     }
     $2_1 = -1;
     if ($175($0)) {
      break block7
     }
    }
    $2_1 = $205($0, $1_1, $3 + 200 | 0, $3 + 80 | 0, $3 + 160 | 0);
   }
   if ($5) {
    FUNCTION_TABLE[HEAP32[$0 + 32 >> 2]]($0, 0, 0) | 0;
    HEAP32[$0 + 44 >> 2] = 0;
    HEAP32[$0 + 40 >> 2] = $5;
    HEAP32[$0 + 24 >> 2] = 0;
    HEAP32[$0 + 16 >> 2] = 0;
    HEAP32[$0 + 20 >> 2] = 0;
    $2_1 = 0;
   }
   HEAP32[$0 >> 2] = HEAP32[$0 >> 2] | $4_1 & 32;
   if ($6) {
    break block1
   }
   $174($0);
  }
  global$0 = $3 + 208 | 0;
 }

 function $205($0, $1_1, $2_1, $3, $4_1) {
  var $5 = 0, $6 = 0, $7_1 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13_1 = 0, $14 = 0, $15 = 0, $16_1 = 0.0, $17 = 0, $18 = 0, $19_1 = 0, $20_1 = 0, $21 = 0, $22_1 = 0, $23_1 = 0, $24_1 = 0, $25_1 = 0, $26_1 = 0.0, $27_1 = 0, $28_1 = 0, $29 = 0, $30 = 0, $31_1 = 0, $32 = 0, $33 = 0, $34 = 0, $35_1 = 0, $36_1 = 0, $37_1 = 0, $38 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  $9 = global$0 - 864 | 0;
  global$0 = $9;
  $34 = $9 + 44 | 0;
  $6 = $9 + 564 | 0;
  $35_1 = -10 - $6 | 0;
  $36_1 = $9 + 41 | 0;
  $37_1 = $9 + 39 | 0;
  $5 = $9 + 576 | 0;
  $38 = $5 - 1 | 0;
  $31_1 = $5 | 9;
  $33 = $6 + 10 | 0;
  $28_1 = $6 + 12 | 0;
  $25_1 = $9 + 40 | 0;
  block19 : {
   block44 : {
    label8 : while (1) {
     $5 = 0;
     label1 : while (1) {
      block : {
       $6 = $1_1;
       if (($19_1 ^ 2147483647) < ($5 | 0)) {
        break block
       }
       $19_1 = $5 + $19_1 | 0;
       block75 : {
        block76 : {
         block101 : {
          block15 : {
           block17 : {
            $5 = HEAPU8[$6 | 0];
            if ($5) {
             while (1) {
              block3 : {
               $5 = $5 & 255;
               block4 : {
                if ($5) {
                 if (($5 | 0) != 37) {
                  break block3
                 }
                 $5 = $1_1;
                 while (1) {
                  if (HEAPU8[$1_1 + 1 | 0] != 37) {
                   break block4
                  }
                  $5 = $5 + 1 | 0;
                  $1_1 = $1_1 + 2 | 0;
                  if (HEAPU8[$1_1 | 0] == 37) {
                   continue
                  }
                  break;
                 };
                 break block4;
                }
                $5 = $1_1;
               }
               $5 = $5 - $6 | 0;
               $22_1 = $19_1 ^ 2147483647;
               if (($5 | 0) > ($22_1 | 0)) {
                break block
               }
               if (!(!$0 | HEAPU8[$0 | 0] & 32)) {
                $178($6, $5, $0)
               }
               if ($5) {
                continue label1
               }
               $7_1 = $1_1 + 1 | 0;
               $11 = -1;
               $10 = HEAP8[$1_1 + 1 | 0];
               $5 = $10 - 48 | 0;
               if (!(HEAPU8[$1_1 + 2 | 0] != 36 | $5 >>> 0 > 9)) {
                $10 = HEAP8[$1_1 + 3 | 0];
                $29 = 1;
                $11 = $5;
                $7_1 = $1_1 + 3 | 0;
               }
               $12 = 0;
               $1_1 = $10 - 32 | 0;
               block8 : {
                if ($1_1 >>> 0 > 31) {
                 $1_1 = $7_1;
                 break block8;
                }
                $5 = 1 << $1_1;
                if (!($5 & 75913)) {
                 $1_1 = $7_1;
                 break block8;
                }
                $7_1 = $7_1 + 1 | 0;
                while (1) {
                 $12 = $5 | $12;
                 $1_1 = $7_1;
                 $10 = HEAP8[$7_1 | 0];
                 $5 = $10 - 32 | 0;
                 if ($5 >>> 0 >= 32) {
                  break block8
                 }
                 $7_1 = $7_1 + 1 | 0;
                 $5 = 1 << $5;
                 if ($5 & 75913) {
                  continue
                 }
                 break;
                };
               }
               if (($10 | 0) == 42) {
                $5 = HEAP8[$1_1 + 1 | 0] - 48 | 0;
                block14 : {
                 if (!(HEAPU8[$1_1 + 2 | 0] != 36 | $5 >>> 0 > 9)) {
                  $1_1 = $1_1 + 3 | 0;
                  $29 = 1;
                  block13 : {
                   if (!$0) {
                    HEAP32[($5 << 2) + $4_1 >> 2] = 10;
                    $5 = 0;
                    break block13;
                   }
                   $5 = HEAP32[($5 << 3) + $3 >> 2];
                  }
                  break block14;
                 }
                 if ($29) {
                  break block15
                 }
                 $1_1 = $1_1 + 1 | 0;
                 if (!$0) {
                  $29 = 0;
                  $14 = 0;
                  break block17;
                 }
                 $5 = HEAP32[$2_1 >> 2];
                 HEAP32[$2_1 >> 2] = $5 + 4;
                 $29 = 0;
                 $5 = HEAP32[$5 >> 2];
                }
                $14 = $5;
                if (($14 | 0) >= 0) {
                 break block17
                }
                $14 = 0 - $14 | 0;
                $12 = $12 | 8192;
                break block17;
               }
               $14 = 0;
               $7_1 = $10 - 48 | 0;
               if ($7_1 >>> 0 > 9) {
                break block17
               }
               $5 = $1_1;
               while (1) {
                if ($14 >>> 0 <= 214748364) {
                 $1_1 = Math_imul($14, 10);
                 $8 = ($1_1 ^ 2147483647) >>> 0 < $7_1 >>> 0;
                 $14 = $8 ? -1 : $1_1 + $7_1 | 0;
                 $7_1 = HEAP8[$5 + 1 | 0];
                 $1_1 = $5 + 1 | 0;
                 $5 = $1_1;
                 $7_1 = $7_1 - 48 | 0;
                 if ($7_1 >>> 0 < 10) {
                  continue
                 }
                 if ($8) {
                  break block
                 }
                 break block17;
                }
                $1_1 = HEAP8[$5 + 1 | 0];
                $14 = -1;
                $5 = $5 + 1 | 0;
                $7_1 = $1_1 - 48 | 0;
                if ($7_1 >>> 0 < 10) {
                 continue
                }
                break;
               };
               break block;
              }
              $1_1 = $1_1 + 1 | 0;
              $5 = HEAPU8[$1_1 | 0];
              continue;
             }
            }
            if ($0) {
             break block19
            }
            if (!$29) {
             $19_1 = 0;
             break block19;
            }
            block22 : {
             $0 = HEAP32[$4_1 + 4 >> 2];
             if (!$0) {
              $1_1 = 1;
              break block22;
             }
             $206($3 + 8 | 0, $0, $2_1);
             $0 = HEAP32[$4_1 + 8 >> 2];
             if (!$0) {
              $1_1 = 2;
              break block22;
             }
             $206($3 + 16 | 0, $0, $2_1);
             $0 = HEAP32[$4_1 + 12 >> 2];
             if (!$0) {
              $1_1 = 3;
              break block22;
             }
             $206($3 + 24 | 0, $0, $2_1);
             $0 = HEAP32[$4_1 + 16 >> 2];
             if (!$0) {
              $1_1 = 4;
              break block22;
             }
             $206($3 + 32 | 0, $0, $2_1);
             $0 = HEAP32[$4_1 + 20 >> 2];
             if (!$0) {
              $1_1 = 5;
              break block22;
             }
             $206($3 + 40 | 0, $0, $2_1);
             $0 = HEAP32[$4_1 + 24 >> 2];
             if (!$0) {
              $1_1 = 6;
              break block22;
             }
             $206($3 + 48 | 0, $0, $2_1);
             $0 = HEAP32[$4_1 + 28 >> 2];
             if (!$0) {
              $1_1 = 7;
              break block22;
             }
             $206($3 + 56 | 0, $0, $2_1);
             $0 = HEAP32[$4_1 + 32 >> 2];
             if (!$0) {
              $1_1 = 8;
              break block22;
             }
             $206($3 - -64 | 0, $0, $2_1);
             $0 = HEAP32[$4_1 + 36 >> 2];
             if (!$0) {
              $1_1 = 9;
              break block22;
             }
             $206($3 + 72 | 0, $0, $2_1);
             $19_1 = 1;
             break block19;
            }
            $1_1 = $1_1 << 2;
            while (1) {
             if (HEAP32[$1_1 + $4_1 >> 2]) {
              break block15
             }
             $1_1 = $1_1 + 4 | 0;
             if (($1_1 | 0) != 40) {
              continue
             }
             break;
            };
            $19_1 = 1;
            break block19;
           }
           $5 = 0;
           block32 : {
            if (HEAPU8[$1_1 | 0] != 46) {
             $10 = -1;
             $17 = 0;
             break block32;
            }
            $7_1 = HEAP8[$1_1 + 1 | 0];
            if (($7_1 | 0) == 42) {
             $7_1 = HEAP8[$1_1 + 2 | 0] - 48 | 0;
             if (!(HEAPU8[$1_1 + 3 | 0] != 36 | $7_1 >>> 0 > 9)) {
              if (!$0) {
               HEAP32[($7_1 << 2) + $4_1 >> 2] = 10;
               $10 = 0;
               $1_1 = $1_1 + 4 | 0;
               $17 = 1;
               break block32;
              }
              $1_1 = $1_1 + 4 | 0;
              $10 = HEAP32[($7_1 << 3) + $3 >> 2];
              $17 = ($10 | 0) >= 0;
              break block32;
             }
             if ($29) {
              break block15
             }
             $1_1 = $1_1 + 2 | 0;
             if (!$0) {
              $10 = 0;
              $17 = 1;
              break block32;
             }
             $7_1 = HEAP32[$2_1 >> 2];
             HEAP32[$2_1 >> 2] = $7_1 + 4;
             $10 = HEAP32[$7_1 >> 2];
             $17 = ($10 | 0) >= 0;
             break block32;
            }
            $1_1 = $1_1 + 1 | 0;
            $13_1 = $7_1 - 48 | 0;
            if ($13_1 >>> 0 > 9) {
             $17 = 1;
             $10 = 0;
             break block32;
            }
            $7_1 = 0;
            while (1) {
             $10 = -1;
             $17 = 1;
             if ($7_1 >>> 0 <= 214748364) {
              $7_1 = Math_imul($7_1, 10);
              $10 = ($7_1 ^ 2147483647) >>> 0 < $13_1 >>> 0 ? -1 : $7_1 + $13_1 | 0;
             }
             $7_1 = $10;
             $1_1 = $1_1 + 1 | 0;
             $13_1 = HEAP8[$1_1 | 0] - 48 | 0;
             if ($13_1 >>> 0 < 10) {
              continue
             }
             break;
            };
           }
           while (1) {
            $7_1 = $5;
            $8 = HEAP8[$1_1 | 0];
            if ($8 - 123 >>> 0 < 4294967238) {
             break block15
            }
            $1_1 = $1_1 + 1 | 0;
            $5 = HEAPU8[($8 + Math_imul($5, 58) | 0) + 76799 | 0];
            if (($5 - 1 & 255) >>> 0 < 8) {
             continue
            }
            break;
           };
           block42 : {
            if (($5 | 0) != 27) {
             if (!$5) {
              break block15
             }
             if (($11 | 0) >= 0) {
              if (!$0) {
               HEAP32[($11 << 2) + $4_1 >> 2] = $5;
               continue label8;
              }
              $5 = ($11 << 3) + $3 | 0;
              $8 = HEAP32[$5 + 4 >> 2];
              HEAP32[$9 + 40 >> 2] = HEAP32[$5 >> 2];
              HEAP32[$9 + 44 >> 2] = $8;
              break block42;
             }
             if (!$0) {
              $19_1 = 0;
              break block19;
             }
             $206($9 + 40 | 0, $5, $2_1);
             break block42;
            }
            if (($11 | 0) >= 0) {
             break block15
            }
            $5 = 0;
            if (!$0) {
             continue
            }
           }
           $11 = HEAP32[$0 >> 2];
           if ($11 & 32) {
            break block44
           }
           $13_1 = $12 & -65537;
           $18 = $12 & 8192 ? $13_1 : $12;
           block46 : {
            block45 : {
             block81 : {
              block80 : {
               block78 : {
                block48 : {
                 block47 : {
                  block77 : {
                   block56 : {
                    block52 : {
                     block50 : {
                      block67 : {
                       block58 : {
                        block51 : {
                         block54 : {
                          block49 : {
                           block55 : {
                            block53 : {
                             block57 : {
                              $8 = HEAPU8[$1_1 - 1 | 0];
                              $5 = $8 << 24 >> 24;
                              $20_1 = $7_1 ? (($8 & 15) == 3 ? $5 & -45 : $5) : $5;
                              switch ($20_1 - 65 | 0) {
                              case 0:
                              case 4:
                              case 5:
                              case 6:
                              case 32:
                              case 36:
                              case 37:
                              case 38:
                               break block45;
                              case 2:
                               break block47;
                              case 18:
                               break block48;
                              case 23:
                              case 55:
                               break block49;
                              case 34:
                               break block50;
                              case 35:
                              case 40:
                               break block51;
                              case 44:
                               break block52;
                              case 45:
                               break block53;
                              case 46:
                               break block54;
                              case 47:
                               break block55;
                              case 50:
                               break block56;
                              case 52:
                               break block57;
                              default:
                               break block46;
                              };
                             }
                             $11 = 0;
                             $7_1 = HEAP32[$9 + 40 >> 2];
                             $8 = HEAP32[$9 + 44 >> 2];
                             $15 = 65584;
                             break block58;
                            }
                            $5 = 0;
                            block65 : {
                             switch ($7_1 | 0) {
                             case 0:
                              HEAP32[HEAP32[$9 + 40 >> 2] >> 2] = $19_1;
                              continue;
                             case 1:
                              HEAP32[HEAP32[$9 + 40 >> 2] >> 2] = $19_1;
                              continue;
                             case 2:
                              $6 = HEAP32[$9 + 40 >> 2];
                              HEAP32[$6 >> 2] = $19_1;
                              HEAP32[$6 + 4 >> 2] = $19_1 >> 31;
                              continue;
                             case 3:
                              HEAP16[HEAP32[$9 + 40 >> 2] >> 1] = $19_1;
                              continue;
                             case 4:
                              HEAP8[HEAP32[$9 + 40 >> 2]] = $19_1;
                              continue;
                             case 6:
                              HEAP32[HEAP32[$9 + 40 >> 2] >> 2] = $19_1;
                              continue;
                             case 7:
                              break block65;
                             default:
                              continue;
                             };
                            }
                            $6 = HEAP32[$9 + 40 >> 2];
                            HEAP32[$6 >> 2] = $19_1;
                            HEAP32[$6 + 4 >> 2] = $19_1 >> 31;
                            continue;
                           }
                           $10 = $10 >>> 0 <= 8 ? 8 : $10;
                           $18 = $18 | 8;
                           $20_1 = 120;
                          }
                          $11 = 0;
                          $15 = 65584;
                          $6 = HEAP32[$9 + 44 >> 2];
                          $7_1 = $6;
                          $12 = HEAP32[$9 + 40 >> 2];
                          if (!($6 | $12)) {
                           $6 = $25_1;
                           break block67;
                          }
                          $5 = $20_1 & 32;
                          $6 = $25_1;
                          while (1) {
                           $6 = $6 - 1 | 0;
                           HEAP8[$6 | 0] = $5 | HEAPU8[($12 & 15) + 77328 | 0];
                           $12 = ($7_1 & 15) << 28 | $12 >>> 4;
                           $7_1 = $7_1 >>> 4 | 0;
                           if ($12 | $7_1) {
                            continue
                           }
                           break;
                          };
                          if (!($18 & 8)) {
                           break block67
                          }
                          $15 = ($20_1 >>> 4 | 0) + 65584 | 0;
                          $11 = 2;
                          break block67;
                         }
                         $6 = $25_1;
                         $5 = HEAP32[$9 + 44 >> 2];
                         $7_1 = $5;
                         $12 = HEAP32[$9 + 40 >> 2];
                         if ($5 | $12) {
                          while (1) {
                           $6 = $6 - 1 | 0;
                           HEAP8[$6 | 0] = $12 & 7 | 48;
                           $12 = ($7_1 & 7) << 29 | $12 >>> 3;
                           $7_1 = $7_1 >>> 3 | 0;
                           if ($12 | $7_1) {
                            continue
                           }
                           break;
                          }
                         }
                         $11 = 0;
                         $15 = 65584;
                         if (!($18 & 8)) {
                          break block67
                         }
                         $5 = $36_1 - $6 | 0;
                         $10 = ($5 | 0) < ($10 | 0) ? $10 : $5;
                         break block67;
                        }
                        $7_1 = HEAP32[$9 + 40 >> 2];
                        $6 = HEAP32[$9 + 44 >> 2];
                        $8 = $6;
                        if (($6 | 0) < 0) {
                         $6 = 0 - ((($7_1 | 0) != 0) + $6 | 0) | 0;
                         $8 = $6;
                         $7_1 = 0 - $7_1 | 0;
                         HEAP32[$9 + 40 >> 2] = $7_1;
                         HEAP32[$9 + 44 >> 2] = $6;
                         $11 = 1;
                         $15 = 65584;
                         break block58;
                        }
                        if ($18 & 2048) {
                         $11 = 1;
                         $15 = 65585;
                         break block58;
                        }
                        $11 = $18 & 1;
                        $15 = $11 ? 65586 : 65584;
                       }
                       block72 : {
                        if (!(($8 | 0) == 1 | $8 >>> 0 > 1)) {
                         $6 = $25_1;
                         break block72;
                        }
                        $6 = $25_1;
                        while (1) {
                         $6 = $6 - 1 | 0;
                         $5 = $7_1;
                         $12 = $8;
                         $7_1 = _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E($5, $8, 10);
                         $8 = i64toi32_i32$HIGH_BITS;
                         (wasm2js_i32$0 = $6, wasm2js_i32$1 = $5 - _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE($7_1, $8, 10) | 48), HEAP8[wasm2js_i32$0 | 0] = wasm2js_i32$1;
                         if ($12 >>> 0 > 9) {
                          continue
                         }
                         break;
                        };
                       }
                       if (!(!$8 & $7_1 >>> 0 < 10)) {
                        while (1) {
                         $5 = $7_1;
                         $7_1 = ($5 >>> 0) / 10 | 0;
                         $6 = $6 - 1 | 0;
                         HEAP8[$6 | 0] = $5 - Math_imul($7_1, 10) | 48;
                         if ($5 >>> 0 > 99) {
                          continue
                         }
                         break;
                        }
                       }
                       if (!$7_1) {
                        break block67
                       }
                       $6 = $6 - 1 | 0;
                       HEAP8[$6 | 0] = $7_1 | 48;
                      }
                      if (($10 | 0) < 0 & $17) {
                       break block
                      }
                      $13_1 = $17 ? $18 & -65537 : $18;
                      block74 : {
                       $5 = HEAP32[$9 + 40 >> 2];
                       $7_1 = HEAP32[$9 + 44 >> 2];
                       if ($5 | $7_1) {
                        break block74
                       }
                       $12 = 0;
                       if ($10) {
                        break block74
                       }
                       $6 = $25_1;
                       $5 = $6;
                       break block75;
                      }
                      $5 = !($5 | $7_1) + ($25_1 - $6 | 0) | 0;
                      $12 = ($5 | 0) < ($10 | 0) ? $10 : $5;
                      $5 = $25_1;
                      break block75;
                     }
                     $5 = HEAPU8[$9 + 40 | 0];
                     break block76;
                    }
                    $6 = HEAP32[19648];
                    if (!HEAP32[19659]) {
                     HEAP32[19659] = 78612
                    }
                    $6 = HEAPU16[(($6 >>> 0 <= 76 ? $6 : 0) << 1) + 76704 >> 1] + 75148 | 0;
                    break block77;
                   }
                   $6 = HEAP32[$9 + 40 >> 2];
                   $6 = $6 ? $6 : 65739;
                  }
                  $8 = $10 >>> 0 >= 2147483647 ? 2147483647 : $10;
                  $11 = ($8 | 0) != 0;
                  __inlined_func$198$72 : {
                   block40 : {
                    block2 : {
                     block31 : {
                      if (!(!($6 & 3) | !$8)) {
                       if (!HEAPU8[$6 | 0]) {
                        $5 = $6;
                        $7_1 = $8;
                        break block2;
                       }
                       $7_1 = $8 - 1 | 0;
                       $11 = ($7_1 | 0) != 0;
                       $5 = $6 + 1 | 0;
                       if (!($5 & 3) | !$7_1) {
                        break block31
                       }
                       if (!HEAPU8[$5 | 0]) {
                        break block2
                       }
                       $7_1 = $8 - 2 | 0;
                       $11 = ($7_1 | 0) != 0;
                       $5 = $6 + 2 | 0;
                       if (!($5 & 3) | !$7_1) {
                        break block31
                       }
                       if (!HEAPU8[$5 | 0]) {
                        break block2
                       }
                       $7_1 = $8 - 3 | 0;
                       $11 = ($7_1 | 0) != 0;
                       $5 = $6 + 3 | 0;
                       if (!($5 & 3) | !$7_1) {
                        break block31
                       }
                       if (!HEAPU8[$5 | 0]) {
                        break block2
                       }
                       $5 = $6 + 4 | 0;
                       $7_1 = $8 - 4 | 0;
                       $11 = ($7_1 | 0) != 0;
                       break block31;
                      }
                      $7_1 = $8;
                      $5 = $6;
                     }
                     if (!$11) {
                      break block40
                     }
                     if (!(!HEAPU8[$5 | 0] | $7_1 >>> 0 < 4)) {
                      while (1) {
                       $11 = HEAP32[$5 >> 2];
                       if (((16843008 - $11 | $11) & -2139062144) != -2139062144) {
                        break block2
                       }
                       $5 = $5 + 4 | 0;
                       $7_1 = $7_1 - 4 | 0;
                       if ($7_1 >>> 0 > 3) {
                        continue
                       }
                       break;
                      }
                     }
                     if (!$7_1) {
                      break block40
                     }
                    }
                    while (1) {
                     if (!HEAPU8[$5 | 0]) {
                      break __inlined_func$198$72
                     }
                     $5 = $5 + 1 | 0;
                     $7_1 = $7_1 - 1 | 0;
                     if ($7_1) {
                      continue
                     }
                     break;
                    };
                   }
                   $5 = 0;
                  }
                  $12 = $5 ? $5 - $6 | 0 : $8;
                  $5 = $6 + $12 | 0;
                  $11 = 0;
                  $15 = 65584;
                  if (!HEAPU8[$5 | 0] | ($10 | 0) >= 0) {
                   break block75
                  }
                  break block;
                 }
                 $6 = HEAP32[$9 + 40 >> 2];
                 if ($6 | HEAP32[$9 + 44 >> 2]) {
                  break block78
                 }
                 $5 = 0;
                 break block76;
                }
                $6 = HEAP32[$9 + 40 >> 2];
                if ($10) {
                 break block80
                }
                $5 = 0;
                $207($0, 32, $14, 0, $18);
                break block81;
               }
               HEAP32[$9 + 12 >> 2] = 0;
               HEAP32[$9 + 8 >> 2] = $6;
               $6 = $9 + 8 | 0;
               HEAP32[$9 + 40 >> 2] = $6;
               $10 = -1;
              }
              $7_1 = $6;
              $5 = 0;
              $6 = $7_1;
              while (1) {
               block82 : {
                $8 = HEAP32[$6 >> 2];
                if (!$8) {
                 break block82
                }
                $8 = $201($9 + 4 | 0, $8);
                if (($8 | 0) < 0) {
                 break block44
                }
                if ($8 >>> 0 > $10 - $5 >>> 0) {
                 break block82
                }
                $6 = $6 + 4 | 0;
                $5 = $5 + $8 | 0;
                if ($10 >>> 0 > $5 >>> 0) {
                 continue
                }
               }
               break;
              };
              if (($5 | 0) < 0) {
               break block
              }
              $207($0, 32, $14, $5, $18);
              if (!$5) {
               $5 = 0;
               break block81;
              }
              $6 = 0;
              while (1) {
               $8 = HEAP32[$7_1 >> 2];
               if (!$8) {
                break block81
               }
               $11 = $9 + 4 | 0;
               $8 = $201($11, $8);
               $6 = $8 + $6 | 0;
               if ($6 >>> 0 > $5 >>> 0) {
                break block81
               }
               if (!(HEAPU8[$0 | 0] & 32)) {
                $178($11, $8, $0)
               }
               $7_1 = $7_1 + 4 | 0;
               if ($5 >>> 0 > $6 >>> 0) {
                continue
               }
               break;
              };
             }
             $207($0, 32, $14, $5, $18 ^ 8192);
             $5 = ($5 | 0) < ($14 | 0) ? $14 : $5;
             continue;
            }
            $6 = ($10 | 0) < 0;
            if ($6 & $17) {
             break block
            }
            $16_1 = HEAPF64[$9 + 40 >> 3];
            HEAP32[$9 + 604 >> 2] = 0;
            wasm2js_scratch_store_f64(+$16_1);
            $5 = wasm2js_scratch_load_i32(1) | 0;
            wasm2js_scratch_load_i32(0) | 0;
            block86 : {
             if (($5 | 0) < 0) {
              $16_1 = -$16_1;
              $22_1 = 1;
              $30 = 65594;
              $5 = 0;
              break block86;
             }
             if ($18 & 2048) {
              $22_1 = 1;
              $30 = 65597;
              $5 = 0;
              break block86;
             }
             $22_1 = $18 & 1;
             $30 = $22_1 ? 65600 : 65595;
             $5 = !$22_1;
            }
            $32 = $5;
            if (!($16_1 < Infinity)) {
             $6 = $22_1 + 3 | 0;
             block89 : {
              if ($18 & 8192 | $6 >>> 0 >= $14 >>> 0) {
               break block89
              }
              $5 = $14 - $6 | 0;
              $7_1 = $5 >>> 0 < 256;
              $8 = $7_1 ? $5 : 256;
              if ($8) {
               wasm2js_memory_fill($9 + 608 | 0, 32, $8)
              }
              if (!$7_1) {
               while (1) {
                if (!(HEAPU8[$0 | 0] & 32)) {
                 $178($9 + 608 | 0, 256, $0)
                }
                $5 = $5 - 256 | 0;
                if ($5 >>> 0 > 255) {
                 continue
                }
                break;
               };
               $11 = HEAP32[$0 >> 2];
              }
              if ($11 & 32) {
               break block89
              }
              $178($9 + 608 | 0, $5, $0);
              $11 = HEAP32[$0 >> 2];
             }
             if (!($11 & 32)) {
              $178($30, $22_1, $0);
              $11 = HEAP32[$0 >> 2];
             }
             if (!($11 & 32)) {
              $5 = $20_1 & 32;
              $178($16_1 != $16_1 ? ($5 ? 65620 : 65729) : $5 ? 65624 : 65733, 3, $0);
             }
             block95 : {
              if (($18 & 73728) != 8192 | $6 >>> 0 >= $14 >>> 0) {
               break block95
              }
              $5 = $14 - $6 | 0;
              $7_1 = $5 >>> 0 < 256;
              $8 = $7_1 ? $5 : 256;
              if ($8) {
               wasm2js_memory_fill($9 + 608 | 0, 32, $8)
              }
              if (!$7_1) {
               while (1) {
                if (!(HEAPU8[$0 | 0] & 32)) {
                 $178($9 + 608 | 0, 256, $0)
                }
                $5 = $5 - 256 | 0;
                if ($5 >>> 0 > 255) {
                 continue
                }
                break;
               }
              }
              if (HEAPU8[$0 | 0] & 32) {
               break block95
              }
              $178($9 + 608 | 0, $5, $0);
             }
             $5 = $6 >>> 0 < $14 >>> 0 ? $14 : $6;
             continue;
            }
            block102 : {
             block100 : {
              $16_1 = $202($16_1, $9 + 604 | 0);
              $16_1 = $16_1 + $16_1;
              if ($16_1 != 0.0) {
               $5 = HEAP32[$9 + 604 >> 2];
               HEAP32[$9 + 604 >> 2] = $5 - 1;
               $13_1 = $20_1 | 32;
               if (($13_1 | 0) != 97) {
                break block100
               }
               break block101;
              }
              $13_1 = $20_1 | 32;
              if (($13_1 | 0) == 97) {
               break block101
              }
              $7_1 = HEAP32[$9 + 604 >> 2];
              break block102;
             }
             $7_1 = $5 - 29 | 0;
             HEAP32[$9 + 604 >> 2] = $7_1;
             $16_1 = $16_1 * 268435456.0;
            }
            $11 = $6 ? 6 : $10;
            $27_1 = ($7_1 | 0) < 0;
            $15 = ($9 + 48 | 0) + ($27_1 ? 0 : 488) | 0;
            $6 = $15;
            while (1) {
             $5 = ~~$16_1 >>> 0;
             HEAP32[$6 >> 2] = $5;
             $6 = $6 + 4 | 0;
             $16_1 = ($16_1 - +($5 >>> 0)) * 1.0e9;
             if ($16_1 != 0.0) {
              continue
             }
             break;
            };
            block104 : {
             if (($7_1 | 0) <= 0) {
              $5 = $6;
              $8 = $15;
              break block104;
             }
             $8 = $15;
             while (1) {
              $17 = $7_1 >>> 0 >= 29 ? 29 : $7_1;
              $5 = $6 - 4 | 0;
              block105 : {
               if ($8 >>> 0 > $5 >>> 0) {
                break block105
               }
               $12 = 0;
               $7_1 = 0;
               while (1) {
                $21 = HEAP32[$5 >> 2];
                $10 = $17 & 31;
                if (($17 & 63) >>> 0 >= 32) {
                 $24_1 = $21 << $10;
                 $10 = 0;
                } else {
                 $24_1 = (1 << $10) - 1 & $21 >>> 32 - $10;
                 $10 = $21 << $10;
                }
                $10 = $10 + $12 | 0;
                $7_1 = $7_1 + $24_1 | 0;
                $21 = $10 >>> 0 < $12 >>> 0 ? $7_1 + 1 | 0 : $7_1;
                $12 = _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E($10, $21, 1e9);
                $7_1 = i64toi32_i32$HIGH_BITS;
                (wasm2js_i32$0 = $5, wasm2js_i32$1 = $10 - _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE($12, $7_1, 1e9) | 0), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
                $5 = $5 - 4 | 0;
                if ($8 >>> 0 <= $5 >>> 0) {
                 continue
                }
                break;
               };
               if (!$21 & $10 >>> 0 < 1e9) {
                break block105
               }
               $8 = $8 - 4 | 0;
               HEAP32[$8 >> 2] = $12;
              }
              while (1) {
               $5 = $6;
               if ($5 >>> 0 > $8 >>> 0) {
                $6 = $5 - 4 | 0;
                if (!HEAP32[$6 >> 2]) {
                 continue
                }
               }
               break;
              };
              $7_1 = HEAP32[$9 + 604 >> 2] - $17 | 0;
              HEAP32[$9 + 604 >> 2] = $7_1;
              $6 = $5;
              if (($7_1 | 0) > 0) {
               continue
              }
              break;
             };
            }
            if (($7_1 | 0) < 0) {
             $12 = (($11 + 25 >>> 0) / 9 | 0) + 1 | 0;
             $23_1 = ($13_1 | 0) == 102;
             while (1) {
              $6 = 0 - $7_1 | 0;
              $10 = $6 >>> 0 >= 9 ? 9 : $6;
              block109 : {
               if ($5 >>> 0 <= $8 >>> 0) {
                $6 = HEAP32[$8 >> 2] ? 0 : 4;
                break block109;
               }
               $17 = 1e9 >>> $10 | 0;
               $21 = -1 << $10 ^ -1;
               $7_1 = 0;
               $6 = $8;
               while (1) {
                $24_1 = HEAP32[$6 >> 2];
                HEAP32[$6 >> 2] = $7_1 + ($24_1 >>> $10 | 0);
                $7_1 = Math_imul($17, $21 & $24_1);
                $6 = $6 + 4 | 0;
                if ($6 >>> 0 < $5 >>> 0) {
                 continue
                }
                break;
               };
               $6 = HEAP32[$8 >> 2] ? 0 : 4;
               if (!$7_1) {
                break block109
               }
               HEAP32[$5 >> 2] = $7_1;
               $5 = $5 + 4 | 0;
              }
              $7_1 = $10 + HEAP32[$9 + 604 >> 2] | 0;
              HEAP32[$9 + 604 >> 2] = $7_1;
              $8 = $6 + $8 | 0;
              $6 = $23_1 ? $15 : $8;
              $5 = ($12 | 0) < $5 - $6 >> 2 ? $6 + ($12 << 2) | 0 : $5;
              if (($7_1 | 0) < 0) {
               continue
              }
              break;
             };
            }
            $10 = 0;
            block110 : {
             if ($5 >>> 0 <= $8 >>> 0) {
              break block110
             }
             $10 = Math_imul($15 - $8 >> 2, 9);
             $7_1 = HEAP32[$8 >> 2];
             if ($7_1 >>> 0 < 10) {
              break block110
             }
             $6 = 10;
             while (1) {
              $10 = $10 + 1 | 0;
              $6 = Math_imul($6, 10);
              if ($7_1 >>> 0 >= $6 >>> 0) {
               continue
              }
              break;
             };
            }
            $17 = ($13_1 | 0) == 103;
            $6 = ($11 - (($13_1 | 0) != 102 ? $10 : 0) | 0) - ($17 & ($11 | 0) != 0) | 0;
            if (($6 | 0) < (Math_imul($5 - $15 >> 2, 9) - 9 | 0)) {
             $7_1 = $6 + 9216 | 0;
             $12 = ($7_1 | 0) / 9 | 0;
             $21 = $12 << 2;
             $24_1 = $27_1 ? -4092 : -3604;
             $13_1 = $21 + ($24_1 + ($9 + 48 | 0) | 0) | 0;
             $6 = 10;
             $12 = $7_1 - Math_imul($12, 9) | 0;
             block112 : {
              if (($12 | 0) > 7) {
               break block112
              }
              $23_1 = 8 - $12 | 0;
              $7_1 = $23_1 & 7;
              if ($12 - 1 >>> 0 >= 7) {
               $12 = $23_1 & -8;
               while (1) {
                $6 = Math_imul($6, 1e8);
                $12 = $12 - 8 | 0;
                if ($12) {
                 continue
                }
                break;
               };
               if (!$7_1) {
                break block112
               }
              }
              while (1) {
               $6 = Math_imul($6, 10);
               $7_1 = $7_1 - 1 | 0;
               if ($7_1) {
                continue
               }
               break;
              };
             }
             $12 = HEAP32[$13_1 >> 2];
             $23_1 = ($12 >>> 0) / ($6 >>> 0) | 0;
             $7_1 = $12 - Math_imul($6, $23_1) | 0;
             $27_1 = $13_1 + 4 | 0;
             block115 : {
              if (!$7_1 & ($27_1 | 0) == ($5 | 0)) {
               break block115
              }
              block117 : {
               if (!($23_1 & 1)) {
                $16_1 = 9007199254740992.0;
                if (!(HEAP8[$13_1 - 4 | 0] & 1) | (($6 | 0) != 1e9 | $8 >>> 0 >= $13_1 >>> 0)) {
                 break block117
                }
               }
               $16_1 = 9007199254740994.0;
              }
              $26_1 = ($5 | 0) == ($27_1 | 0) ? 1.0 : 1.5;
              $27_1 = $6 >>> 1 | 0;
              $26_1 = $7_1 >>> 0 < $27_1 >>> 0 ? .5 : ($27_1 | 0) == ($7_1 | 0) ? $26_1 : 1.5;
              if (!(HEAPU8[$30 | 0] != 45 | $32)) {
               $26_1 = -$26_1;
               $16_1 = -$16_1;
              }
              $7_1 = $12 - $7_1 | 0;
              HEAP32[$13_1 >> 2] = $7_1;
              if ($16_1 + $26_1 == $16_1) {
               break block115
              }
              $6 = $6 + $7_1 | 0;
              HEAP32[$13_1 >> 2] = $6;
              if ($6 >>> 0 >= 1e9) {
               $6 = ($21 + $24_1 | 0) + $34 | 0;
               while (1) {
                HEAP32[$6 + 4 >> 2] = 0;
                if ($6 >>> 0 < $8 >>> 0) {
                 $8 = $8 - 4 | 0;
                 HEAP32[$8 >> 2] = 0;
                }
                $7_1 = HEAP32[$6 >> 2] + 1 | 0;
                HEAP32[$6 >> 2] = $7_1;
                $6 = $6 - 4 | 0;
                if ($7_1 >>> 0 > 999999999) {
                 continue
                }
                break;
               };
               $13_1 = $6 + 4 | 0;
              }
              $10 = Math_imul($15 - $8 >> 2, 9);
              $7_1 = HEAP32[$8 >> 2];
              if ($7_1 >>> 0 < 10) {
               break block115
              }
              $6 = 10;
              while (1) {
               $10 = $10 + 1 | 0;
               $6 = Math_imul($6, 10);
               if ($7_1 >>> 0 >= $6 >>> 0) {
                continue
               }
               break;
              };
             }
             $6 = $13_1 + 4 | 0;
             $5 = $5 >>> 0 > $6 >>> 0 ? $6 : $5;
            }
            $6 = $5 - $15 | 0;
            while (1) {
             block121 : {
              $7_1 = $6;
              $12 = $5;
              $13_1 = $5 >>> 0 <= $8 >>> 0;
              if ($13_1) {
               break block121
              }
              $6 = $6 - 4 | 0;
              $5 = $5 - 4 | 0;
              if (!HEAP32[$5 >> 2]) {
               continue
              }
             }
             break;
            };
            block123 : {
             if (!$17) {
              $17 = $18 & 8;
              break block123;
             }
             $6 = $11 ? $11 : 1;
             $5 = ($6 | 0) > ($10 | 0) & ($10 | 0) > -5;
             $11 = ($5 ? $10 ^ -1 : -1) + $6 | 0;
             $20_1 = ($5 ? -1 : -2) + $20_1 | 0;
             $17 = $18 & 8;
             if ($17) {
              break block123
             }
             $5 = -9;
             block124 : {
              if ($13_1) {
               break block124
              }
              $13_1 = HEAP32[$12 - 4 >> 2];
              if (!$13_1) {
               break block124
              }
              $5 = 0;
              if (($13_1 >>> 0) % 10 | 0) {
               break block124
              }
              $6 = 10;
              while (1) {
               $5 = $5 - 1 | 0;
               $6 = Math_imul($6, 10);
               if (!(($13_1 >>> 0) % ($6 >>> 0) | 0)) {
                continue
               }
               break;
              };
             }
             $6 = Math_imul($7_1 >> 2, 9);
             if (($20_1 & -33) == 70) {
              $17 = 0;
              $6 = ($5 + $6 | 0) - 9 | 0;
              $6 = ($6 | 0) > 0 ? $6 : 0;
              $11 = ($6 | 0) > ($11 | 0) ? $11 : $6;
              break block123;
             }
             $17 = 0;
             $6 = (($6 + $10 | 0) + $5 | 0) - 9 | 0;
             $6 = ($6 | 0) > 0 ? $6 : 0;
             $11 = ($6 | 0) > ($11 | 0) ? $11 : $6;
            }
            $21 = $11 | $17;
            if ((($21 ? 2147483645 : 2147483646) | 0) < ($11 | 0)) {
             break block
            }
            $13_1 = ((($21 | 0) != 0) + $11 | 0) + 1 | 0;
            $24_1 = ($20_1 & -33) != 70;
            block127 : {
             if (!$24_1) {
              if (($13_1 ^ 2147483647) < ($10 | 0)) {
               break block
              }
              $5 = ($10 | 0) > 0 ? $10 : 0;
              break block127;
             }
             $6 = $10 >> 31;
             $7_1 = ($6 ^ $10) - $6 | 0;
             block129 : {
              if ($7_1 >>> 0 < 10) {
               $6 = $28_1;
               break block129;
              }
              $6 = $28_1;
              while (1) {
               $5 = $7_1;
               $7_1 = ($5 >>> 0) / 10 | 0;
               $6 = $6 - 1 | 0;
               HEAP8[$6 | 0] = $5 - Math_imul($7_1, 10) | 48;
               if ($5 >>> 0 > 99) {
                continue
               }
               break;
              };
             }
             if ($7_1) {
              $6 = $6 - 1 | 0;
              HEAP8[$6 | 0] = $7_1 | 48;
             }
             if (($28_1 - $6 | 0) <= 1) {
              $6 = $6 + $35_1 | 0;
              if ($6) {
               wasm2js_memory_fill($33, 48, $6)
              }
              $6 = $33;
             }
             $23_1 = $6 - 2 | 0;
             HEAP8[$23_1 | 0] = $20_1;
             HEAP8[$6 - 1 | 0] = ($10 | 0) < 0 ? 45 : 43;
             $5 = $28_1 - $23_1 | 0;
             if (($5 | 0) > ($13_1 ^ 2147483647)) {
              break block
             }
            }
            $6 = $5 + $13_1 | 0;
            if (($6 | 0) > ($22_1 ^ 2147483647)) {
             break block
            }
            $13_1 = $18 & 73728;
            $10 = $6 + $22_1 | 0;
            block133 : {
             if ($13_1 | ($10 | 0) >= ($14 | 0)) {
              break block133
             }
             $5 = $14 - $10 | 0;
             $6 = $5 >>> 0 < 256;
             $7_1 = $6 ? $5 : 256;
             if ($7_1) {
              wasm2js_memory_fill($9 + 608 | 0, 32, $7_1)
             }
             if (!$6) {
              while (1) {
               if (!(HEAPU8[$0 | 0] & 32)) {
                $178($9 + 608 | 0, 256, $0)
               }
               $5 = $5 - 256 | 0;
               if ($5 >>> 0 > 255) {
                continue
               }
               break;
              }
             }
             if (HEAPU8[$0 | 0] & 32) {
              break block133
             }
             $178($9 + 608 | 0, $5, $0);
            }
            if (!(HEAPU8[$0 | 0] & 32)) {
             $178($30, $22_1, $0)
            }
            block138 : {
             if (($13_1 | 0) != 65536 | ($10 | 0) >= ($14 | 0)) {
              break block138
             }
             $5 = $14 - $10 | 0;
             $6 = $5 >>> 0 < 256;
             $7_1 = $6 ? $5 : 256;
             if ($7_1) {
              wasm2js_memory_fill($9 + 608 | 0, 48, $7_1)
             }
             if (!$6) {
              while (1) {
               if (!(HEAPU8[$0 | 0] & 32)) {
                $178($9 + 608 | 0, 256, $0)
               }
               $5 = $5 - 256 | 0;
               if ($5 >>> 0 > 255) {
                continue
               }
               break;
              }
             }
             if (HEAPU8[$0 | 0] & 32) {
              break block138
             }
             $178($9 + 608 | 0, $5, $0);
            }
            block158 : {
             if (!$24_1) {
              $18 = $8 >>> 0 > $15 >>> 0 ? $15 : $8;
              $7_1 = $18;
              while (1) {
               $6 = 9;
               $8 = HEAP32[$7_1 >> 2];
               if ($8 >>> 0 >= 10) {
                while (1) {
                 $5 = $8;
                 $8 = ($5 >>> 0) / 10 | 0;
                 $6 = $6 - 1 | 0;
                 HEAP8[$6 + ($9 + 576 | 0) | 0] = $5 - Math_imul($8, 10) | 48;
                 if ($5 >>> 0 > 99) {
                  continue
                 }
                 break;
                }
               }
               if ($8) {
                $6 = $6 - 1 | 0;
                HEAP8[$6 + ($9 + 576 | 0) | 0] = $8 | 48;
               }
               $8 = $9 + 576 | 0;
               $5 = $8 + $6 | 0;
               block146 : {
                if (($7_1 | 0) != ($18 | 0)) {
                 if (($6 | 0) <= 0) {
                  break block146
                 }
                 $32 = $5;
                 $6 = $6 + $38 | 0;
                 $5 = $6 >>> 0 > $8 >>> 0 ? $8 : $6;
                 $6 = $32 - $5 | 0;
                 if (!$6) {
                  break block146
                 }
                 wasm2js_memory_fill($5, 48, $6);
                 break block146;
                }
                if (($6 | 0) != 9) {
                 break block146
                }
                $5 = $5 - 1 | 0;
                HEAP8[$5 | 0] = 48;
               }
               if (!(HEAPU8[$0 | 0] & 32)) {
                $178($5, $31_1 - $5 | 0, $0)
               }
               $7_1 = $7_1 + 4 | 0;
               if ($15 >>> 0 >= $7_1 >>> 0) {
                continue
               }
               break;
              };
              if (!(!$21 | HEAPU8[$0 | 0] & 32)) {
               $178(65737, 1, $0)
              }
              block150 : {
               if (($11 | 0) <= 0) {
                $5 = $11;
                break block150;
               }
               if ($7_1 >>> 0 >= $12 >>> 0) {
                $5 = $11;
                break block150;
               }
               while (1) {
                $8 = HEAP32[$7_1 >> 2];
                block153 : {
                 if ($8 >>> 0 < 10) {
                  $6 = $31_1;
                  break block153;
                 }
                 $6 = $31_1;
                 while (1) {
                  $5 = $8;
                  $8 = ($5 >>> 0) / 10 | 0;
                  $6 = $6 - 1 | 0;
                  HEAP8[$6 | 0] = $5 - Math_imul($8, 10) | 48;
                  if ($5 >>> 0 > 99) {
                   continue
                  }
                  break;
                 };
                }
                if ($8) {
                 $6 = $6 - 1 | 0;
                 HEAP8[$6 | 0] = $8 | 48;
                }
                $5 = $9 + 576 | 0;
                if ($6 >>> 0 > $5 >>> 0) {
                 $6 = $6 - $5 | 0;
                 if ($6) {
                  wasm2js_memory_fill($5, 48, $6)
                 }
                 $6 = $9 + 576 | 0;
                }
                if (!(HEAPU8[$0 | 0] & 32)) {
                 $178($6, $11 >>> 0 >= 9 ? 9 : $11, $0)
                }
                $5 = $11 - 9 | 0;
                $7_1 = $7_1 + 4 | 0;
                if ($12 >>> 0 <= $7_1 >>> 0) {
                 break block150
                }
                $6 = ($11 | 0) > 9;
                $11 = $5;
                if ($6) {
                 continue
                }
                break;
               };
              }
              $207($0, 48, $5 + 9 | 0, 9, 0);
              break block158;
             }
             block159 : {
              if (($11 | 0) < 0) {
               break block159
              }
              $15 = $8 >>> 0 < $12 >>> 0 ? $12 : $8 + 4 | 0;
              $12 = $8;
              while (1) {
               $6 = 9;
               $7_1 = HEAP32[$12 >> 2];
               if ($7_1 >>> 0 >= 10) {
                while (1) {
                 $5 = $7_1;
                 $7_1 = ($5 >>> 0) / 10 | 0;
                 $6 = $6 - 1 | 0;
                 HEAP8[$6 + ($9 + 576 | 0) | 0] = $5 - Math_imul($7_1, 10) | 48;
                 if ($5 >>> 0 > 99) {
                  continue
                 }
                 break;
                }
               }
               if ($7_1) {
                $6 = $6 - 1 | 0;
                HEAP8[$6 + ($9 + 576 | 0) | 0] = $7_1 | 48;
               }
               $5 = ($9 + 576 | 0) + $6 | 0;
               if (($6 | 0) == 9) {
                $5 = $5 - 1 | 0;
                HEAP8[$5 | 0] = 48;
               }
               block164 : {
                if (($8 | 0) != ($12 | 0)) {
                 $6 = $9 + 576 | 0;
                 if ($6 >>> 0 >= $5 >>> 0) {
                  break block164
                 }
                 $5 = $5 - $6 | 0;
                 if ($5) {
                  wasm2js_memory_fill($6, 48, $5)
                 }
                 $5 = $9 + 576 | 0;
                 break block164;
                }
                if (!(HEAPU8[$0 | 0] & 32)) {
                 $178($5, 1, $0)
                }
                $5 = $5 + 1 | 0;
                if (!($11 | $17) | HEAPU8[$0 | 0] & 32) {
                 break block164
                }
                $178(65737, 1, $0);
               }
               $6 = $31_1 - $5 | 0;
               if (!(HEAPU8[$0 | 0] & 32)) {
                $178($5, ($6 | 0) < ($11 | 0) ? $6 : $11, $0)
               }
               $11 = $11 - $6 | 0;
               $12 = $12 + 4 | 0;
               if ($15 >>> 0 <= $12 >>> 0) {
                break block159
               }
               if (($11 | 0) >= 0) {
                continue
               }
               break;
              };
             }
             $207($0, 48, $11 + 18 | 0, 18, 0);
             if (HEAPU8[$0 | 0] & 32) {
              break block158
             }
             $178($23_1, $28_1 - $23_1 | 0, $0);
            }
            block168 : {
             if (($13_1 | 0) != 8192 | ($10 | 0) >= ($14 | 0)) {
              break block168
             }
             $5 = $14 - $10 | 0;
             $6 = $5 >>> 0 < 256;
             $7_1 = $6 ? $5 : 256;
             if ($7_1) {
              wasm2js_memory_fill($9 + 608 | 0, 32, $7_1)
             }
             if (!$6) {
              while (1) {
               if (!(HEAPU8[$0 | 0] & 32)) {
                $178($9 + 608 | 0, 256, $0)
               }
               $5 = $5 - 256 | 0;
               if ($5 >>> 0 > 255) {
                continue
               }
               break;
              }
             }
             if (HEAPU8[$0 | 0] & 32) {
              break block168
             }
             $178($9 + 608 | 0, $5, $0);
            }
            $5 = ($10 | 0) < ($14 | 0) ? $14 : $10;
            continue;
           }
           $11 = 0;
           $15 = 65584;
           $5 = $25_1;
           $13_1 = $18;
           $12 = $10;
           break block75;
          }
          HEAP32[19648] = 28;
          break block44;
         }
         $11 = ($20_1 << 26 >> 31 & 9) + $30 | 0;
         block172 : {
          if ($10 >>> 0 > 12) {
           break block172
          }
          $26_1 = $168(1.0, 52 - ($10 << 2) | 0);
          if (HEAPU8[$11 | 0] == 45) {
           $16_1 = -($26_1 + (-$16_1 - $26_1));
           break block172;
          }
          $16_1 = $16_1 + $26_1 - $26_1;
         }
         $6 = 12;
         $7_1 = HEAP32[$9 + 604 >> 2];
         $5 = $7_1 >> 31;
         $8 = ($5 ^ $7_1) - $5 | 0;
         if ($8 >>> 0 >= 10) {
          while (1) {
           $5 = $8;
           $8 = ($5 >>> 0) / 10 | 0;
           $6 = $6 - 1 | 0;
           HEAP8[$6 + ($9 + 564 | 0) | 0] = $5 - Math_imul($8, 10) | 48;
           if ($5 >>> 0 > 99) {
            continue
           }
           break;
          }
         }
         if ($8) {
          $6 = $6 - 1 | 0;
          HEAP8[$6 + ($9 + 564 | 0) | 0] = $8 | 48;
         }
         $5 = ($9 + 564 | 0) + $6 | 0;
         if (($6 | 0) == 12) {
          $5 = $5 - 1 | 0;
          HEAP8[$5 | 0] = 48;
         }
         $12 = $20_1 & 32;
         $8 = $5 - 2 | 0;
         HEAP8[$8 | 0] = $20_1 + 15;
         HEAP8[$5 - 1 | 0] = ($7_1 | 0) < 0 ? 45 : 43;
         $7_1 = !($18 & 8) & ($10 | 0) <= 0;
         $6 = $9 + 576 | 0;
         while (1) {
          $5 = $6;
          $15 = ~~$16_1;
          HEAP8[$5 | 0] = $12 | HEAPU8[$15 + 77328 | 0];
          $16_1 = ($16_1 - +($15 | 0)) * 16.0;
          $6 = $5 + 1 | 0;
          if (!($7_1 & $16_1 == 0.0 | ($6 - ($9 + 576 | 0) | 0) != 1)) {
           HEAP8[$5 + 1 | 0] = 46;
           $6 = $5 + 2 | 0;
          }
          if ($16_1 != 0.0) {
           continue
          }
          break;
         };
         $12 = $28_1 - $8 | 0;
         if ((2147483643 - ($12 + $22_1 | 0) | 0) < ($10 | 0)) {
          break block
         }
         $15 = $18 & 73728;
         $7_1 = $6 - ($9 + 576 | 0) | 0;
         $13_1 = $10 ? (($7_1 - 2 | 0) < ($10 | 0) ? $10 + 2 | 0 : $7_1) : $7_1;
         $18 = $22_1 | 2;
         $6 = $13_1 + ($12 + $18 | 0) | 0;
         block178 : {
          if ($15 | ($6 | 0) >= ($14 | 0)) {
           break block178
          }
          $5 = $14 - $6 | 0;
          $10 = $5 >>> 0 < 256;
          $17 = $10 ? $5 : 256;
          if ($17) {
           wasm2js_memory_fill($9 + 608 | 0, 32, $17)
          }
          if (!$10) {
           while (1) {
            if (!(HEAPU8[$0 | 0] & 32)) {
             $178($9 + 608 | 0, 256, $0)
            }
            $5 = $5 - 256 | 0;
            if ($5 >>> 0 > 255) {
             continue
            }
            break;
           }
          }
          if (HEAPU8[$0 | 0] & 32) {
           break block178
          }
          $178($9 + 608 | 0, $5, $0);
         }
         if (!(HEAPU8[$0 | 0] & 32)) {
          $178($11, $18, $0)
         }
         block183 : {
          if (($15 | 0) != 65536 | ($6 | 0) >= ($14 | 0)) {
           break block183
          }
          $5 = $14 - $6 | 0;
          $11 = $5 >>> 0 < 256;
          $10 = $11 ? $5 : 256;
          if ($10) {
           wasm2js_memory_fill($9 + 608 | 0, 48, $10)
          }
          if (!$11) {
           while (1) {
            if (!(HEAPU8[$0 | 0] & 32)) {
             $178($9 + 608 | 0, 256, $0)
            }
            $5 = $5 - 256 | 0;
            if ($5 >>> 0 > 255) {
             continue
            }
            break;
           }
          }
          if (HEAPU8[$0 | 0] & 32) {
           break block183
          }
          $178($9 + 608 | 0, $5, $0);
         }
         if (!(HEAPU8[$0 | 0] & 32)) {
          $178($9 + 576 | 0, $7_1, $0)
         }
         $5 = $13_1 - $7_1 | 0;
         block188 : {
          if (($5 | 0) <= 0) {
           break block188
          }
          $7_1 = $5 >>> 0 < 256;
          $11 = $7_1 ? $5 : 256;
          if ($11) {
           wasm2js_memory_fill($9 + 608 | 0, 48, $11)
          }
          if (!$7_1) {
           while (1) {
            if (!(HEAPU8[$0 | 0] & 32)) {
             $178($9 + 608 | 0, 256, $0)
            }
            $5 = $5 - 256 | 0;
            if ($5 >>> 0 > 255) {
             continue
            }
            break;
           }
          }
          if (HEAPU8[$0 | 0] & 32) {
           break block188
          }
          $178($9 + 608 | 0, $5, $0);
         }
         if (!(HEAPU8[$0 | 0] & 32)) {
          $178($8, $12, $0)
         }
         block193 : {
          if (($15 | 0) != 8192 | ($6 | 0) >= ($14 | 0)) {
           break block193
          }
          $5 = $14 - $6 | 0;
          $7_1 = $5 >>> 0 < 256;
          $8 = $7_1 ? $5 : 256;
          if ($8) {
           wasm2js_memory_fill($9 + 608 | 0, 32, $8)
          }
          if (!$7_1) {
           while (1) {
            if (!(HEAPU8[$0 | 0] & 32)) {
             $178($9 + 608 | 0, 256, $0)
            }
            $5 = $5 - 256 | 0;
            if ($5 >>> 0 > 255) {
             continue
            }
            break;
           }
          }
          if (HEAPU8[$0 | 0] & 32) {
           break block193
          }
          $178($9 + 608 | 0, $5, $0);
         }
         $5 = ($6 | 0) < ($14 | 0) ? $14 : $6;
         continue;
        }
        HEAP8[$9 + 39 | 0] = $5;
        $11 = 0;
        $15 = 65584;
        $12 = 1;
        $6 = $37_1;
        $5 = $25_1;
       }
       $10 = $5 - $6 | 0;
       $18 = ($10 | 0) < ($12 | 0) ? $12 : $10;
       if (($18 | 0) > ($11 ^ 2147483647)) {
        break block
       }
       $7_1 = $11 + $18 | 0;
       $5 = ($7_1 | 0) < ($14 | 0) ? $14 : $7_1;
       if ($22_1 >>> 0 < $5 >>> 0) {
        break block
       }
       $13_1 = $13_1 & 73728;
       block197 : {
        if ($13_1 | ($7_1 | 0) >= ($14 | 0)) {
         break block197
        }
        $8 = $5 - $7_1 | 0;
        $17 = $8 >>> 0 < 256;
        $20_1 = $17 ? $8 : 256;
        if ($20_1) {
         wasm2js_memory_fill($9 + 48 | 0, 32, $20_1)
        }
        if (!$17) {
         while (1) {
          if (!(HEAPU8[$0 | 0] & 32)) {
           $178($9 + 48 | 0, 256, $0)
          }
          $8 = $8 - 256 | 0;
          if ($8 >>> 0 > 255) {
           continue
          }
          break;
         }
        }
        if (HEAPU8[$0 | 0] & 32) {
         break block197
        }
        $178($9 + 48 | 0, $8, $0);
       }
       if (!(HEAPU8[$0 | 0] & 32)) {
        $178($15, $11, $0)
       }
       block202 : {
        if (($13_1 | 0) != 65536 | ($7_1 | 0) >= ($14 | 0)) {
         break block202
        }
        $8 = $5 - $7_1 | 0;
        $11 = $8 >>> 0 < 256;
        $15 = $11 ? $8 : 256;
        if ($15) {
         wasm2js_memory_fill($9 + 48 | 0, 48, $15)
        }
        if (!$11) {
         while (1) {
          if (!(HEAPU8[$0 | 0] & 32)) {
           $178($9 + 48 | 0, 256, $0)
          }
          $8 = $8 - 256 | 0;
          if ($8 >>> 0 > 255) {
           continue
          }
          break;
         }
        }
        if (HEAPU8[$0 | 0] & 32) {
         break block202
        }
        $178($9 + 48 | 0, $8, $0);
       }
       block206 : {
        if (($10 | 0) >= ($12 | 0)) {
         break block206
        }
        $8 = $18 - $10 | 0;
        $11 = $8 >>> 0 < 256;
        $12 = $11 ? $8 : 256;
        if ($12) {
         wasm2js_memory_fill($9 + 48 | 0, 48, $12)
        }
        if (!$11) {
         while (1) {
          if (!(HEAPU8[$0 | 0] & 32)) {
           $178($9 + 48 | 0, 256, $0)
          }
          $8 = $8 - 256 | 0;
          if ($8 >>> 0 > 255) {
           continue
          }
          break;
         }
        }
        if (HEAPU8[$0 | 0] & 32) {
         break block206
        }
        $178($9 + 48 | 0, $8, $0);
       }
       if (!(HEAPU8[$0 | 0] & 32)) {
        $178($6, $10, $0)
       }
       if (($13_1 | 0) != 8192 | ($7_1 | 0) >= ($14 | 0)) {
        continue
       }
       $6 = $5 - $7_1 | 0;
       $7_1 = $6 >>> 0 < 256;
       $8 = $7_1 ? $6 : 256;
       if ($8) {
        wasm2js_memory_fill($9 + 48 | 0, 32, $8)
       }
       if (!$7_1) {
        while (1) {
         if (!(HEAPU8[$0 | 0] & 32)) {
          $178($9 + 48 | 0, 256, $0)
         }
         $6 = $6 - 256 | 0;
         if ($6 >>> 0 > 255) {
          continue
         }
         break;
        }
       }
       if (HEAPU8[$0 | 0] & 32) {
        continue
       }
       $178($9 + 48 | 0, $6, $0);
       continue;
      }
      break;
     };
     break;
    };
    HEAP32[19648] = 61;
   }
   $19_1 = -1;
  }
  global$0 = $9 + 864 | 0;
  return $19_1;
 }

 function $206($0, $1_1, $2_1) {
  folding_inner4 : {
   folding_inner3 : {
    folding_inner2 : {
     switch ($1_1 - 9 | 0) {
     case 6:
      $1_1 = HEAP32[$2_1 >> 2];
      HEAP32[$2_1 >> 2] = $1_1 + 4;
      $1_1 = HEAP16[$1_1 >> 1];
      HEAP32[$0 >> 2] = $1_1;
      break folding_inner3;
     case 7:
      $1_1 = HEAP32[$2_1 >> 2];
      HEAP32[$2_1 >> 2] = $1_1 + 4;
      HEAP32[$0 >> 2] = HEAPU16[$1_1 >> 1];
      break folding_inner4;
     case 8:
      $1_1 = HEAP32[$2_1 >> 2];
      HEAP32[$2_1 >> 2] = $1_1 + 4;
      $1_1 = HEAP8[$1_1 | 0];
      HEAP32[$0 >> 2] = $1_1;
      break folding_inner3;
     case 9:
      $1_1 = HEAP32[$2_1 >> 2];
      HEAP32[$2_1 >> 2] = $1_1 + 4;
      HEAP32[$0 >> 2] = HEAPU8[$1_1 | 0];
      break folding_inner4;
     case 16:
      $1_1 = HEAP32[$2_1 >> 2] + 7 & -8;
      HEAP32[$2_1 >> 2] = $1_1 + 8;
      HEAPF64[$0 >> 3] = HEAPF64[$1_1 >> 3];
      return;
     case 17:
      $0 = 65820;
      $1_1 = 65819;
      while (1) {
       $1_1 = $1_1 + 4 | 0;
       $0 = $0 + 4 | 0;
       $2_1 = HEAP32[$0 >> 2];
       if (((16843008 - $2_1 | $2_1) & -2139062144) == -2139062144) {
        continue
       }
       break;
      };
      while (1) {
       $1_1 = $1_1 + 1 | 0;
       $2_1 = HEAPU8[$0 | 0];
       $0 = $0 + 1 | 0;
       if ($2_1) {
        continue
       }
       break;
      };
      $179(65824, 1, $1_1 - 65824 | 0, 77360);
      wasm2js_trap();
     case 0:
      $1_1 = HEAP32[$2_1 >> 2];
      HEAP32[$2_1 >> 2] = $1_1 + 4;
      HEAP32[$0 >> 2] = HEAP32[$1_1 >> 2];
     default:
      return;
     case 1:
     case 4:
     case 14:
      $1_1 = HEAP32[$2_1 >> 2];
      HEAP32[$2_1 >> 2] = $1_1 + 4;
      $1_1 = HEAP32[$1_1 >> 2];
      HEAP32[$0 >> 2] = $1_1;
      break folding_inner3;
     case 2:
     case 5:
     case 11:
     case 15:
      $1_1 = HEAP32[$2_1 >> 2];
      HEAP32[$2_1 >> 2] = $1_1 + 4;
      HEAP32[$0 >> 2] = HEAP32[$1_1 >> 2];
      break folding_inner4;
     case 3:
     case 10:
     case 12:
     case 13:
      break folding_inner2;
     };
    }
    $1_1 = HEAP32[$2_1 >> 2] + 7 & -8;
    HEAP32[$2_1 >> 2] = $1_1 + 8;
    $2_1 = HEAP32[$1_1 + 4 >> 2];
    HEAP32[$0 >> 2] = HEAP32[$1_1 >> 2];
    HEAP32[$0 + 4 >> 2] = $2_1;
    return;
   }
   HEAP32[$0 + 4 >> 2] = $1_1 >> 31;
   return;
  }
  HEAP32[$0 + 4 >> 2] = 0;
 }

 function $207($0, $1_1, $2_1, $3, $4_1) {
  var $5 = 0;
  $5 = global$0 - 256 | 0;
  global$0 = $5;
  block : {
   if ($4_1 & 73728 | ($2_1 | 0) <= ($3 | 0)) {
    break block
   }
   $3 = $2_1 - $3 | 0;
   $2_1 = $3 >>> 0 < 256;
   $4_1 = $2_1 ? $3 : 256;
   if ($4_1) {
    wasm2js_memory_fill($5, $1_1, $4_1)
   }
   if (!$2_1) {
    while (1) {
     if (!(HEAPU8[$0 | 0] & 32)) {
      $178($5, 256, $0)
     }
     $3 = $3 - 256 | 0;
     if ($3 >>> 0 > 255) {
      continue
     }
     break;
    }
   }
   if (HEAPU8[$0 | 0] & 32) {
    break block
   }
   $178($5, $3, $0);
  }
  global$0 = $5 + 256 | 0;
 }

 function $209($0) {
  var $1_1 = 0;
  if (!$0) {
   return __wasm_memory_size() << 16
  }
  $1_1 = $0 >>> 16 | 0;
  if (!($0 - ($1_1 << 16) | ($0 | 0) < 0)) {
   $0 = __wasm_memory_grow($1_1 | 0);
   if (($0 | 0) == -1) {
    HEAP32[19648] = 48;
    return -1;
   }
   return $0 << 16;
  }
  wasm2js_trap();
 }

 function $211($0) {
  var $1_1 = 0, $2_1 = 0, $3 = 0, $4_1 = 0, $5 = 0, $6 = 0, $7_1 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  $10 = global$0 - 16 | 0;
  global$0 = $10;
  $6 = HEAP32[19666];
  if (!$6) {
   $1_1 = HEAP32[19778];
   if (!$1_1) {
    HEAP32[19780] = 65536;
    HEAP32[19781] = -1;
    HEAP32[19782] = -1;
    HEAP32[19779] = 65536;
    $1_1 = $10 + 8 & -16 ^ 1431655768;
    HEAP32[19778] = $1_1;
    HEAP32[19783] = 0;
    HEAP32[19771] = 0;
   }
   HEAP32[19772] = 79136;
   HEAP32[19664] = 79136;
   HEAP32[19669] = $1_1;
   HEAP32[19668] = -1;
   HEAP32[19773] = 51936;
   HEAP32[19769] = 51936;
   HEAP32[19768] = 51936;
   $1_1 = -256;
   while (1) {
    $2_1 = $1_1 + 78944 | 0;
    HEAP32[$1_1 + 78956 >> 2] = $2_1;
    $4_1 = $1_1 + 78936 | 0;
    HEAP32[$2_1 >> 2] = $4_1;
    HEAP32[$1_1 + 78948 >> 2] = $4_1;
    $4_1 = $1_1 + 78952 | 0;
    HEAP32[$1_1 + 78964 >> 2] = $4_1;
    HEAP32[$4_1 >> 2] = $2_1;
    $2_1 = $1_1 + 78960 | 0;
    HEAP32[$1_1 + 78972 >> 2] = $2_1;
    HEAP32[$2_1 >> 2] = $4_1;
    HEAP32[$1_1 + 78968 >> 2] = $2_1;
    $1_1 = $1_1 + 32 | 0;
    if ($1_1) {
     continue
    }
    break;
   };
   HEAP32[32755] = 56;
   HEAP32[19667] = HEAP32[19782];
   HEAP32[19666] = 79144;
   HEAP32[19663] = 51872;
   HEAP32[19787] = 51873;
   $6 = 79144;
  }
  block7 : {
   block18 : {
    block31 : {
     block68 : {
      block57 : {
       block52 : {
        block44 : {
         block48 : {
          block53 : {
           block34 : {
            block21 : {
             block8 : {
              if ($0 >>> 0 <= 236) {
               $3 = HEAP32[19660];
               $7_1 = $0 >>> 0 < 11 ? 16 : $0 + 19 & 496;
               $0 = $7_1 >>> 3 | 0;
               $1_1 = $3 >>> $0 | 0;
               if ($1_1 & 3) {
                $5 = ($0 | $1_1 & 1) ^ 1;
                $0 = $5 << 3;
                $1_1 = $0 + 78680 | 0;
                $2_1 = HEAP32[$0 + 78688 >> 2];
                $4_1 = HEAP32[$2_1 + 8 >> 2];
                block6 : {
                 if (($1_1 | 0) == ($4_1 | 0)) {
                  (wasm2js_i32$0 = 78640, wasm2js_i32$1 = __wasm_rotl_i32($5) & $3), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
                  break block6;
                 }
                 HEAP32[$1_1 + 8 >> 2] = $4_1;
                 HEAP32[$4_1 + 12 >> 2] = $1_1;
                }
                $1_1 = $2_1 + 8 | 0;
                HEAP32[$2_1 + 4 >> 2] = $0 | 3;
                $0 = $0 + $2_1 | 0;
                HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] | 1;
                break block7;
               }
               $8 = HEAP32[19662];
               if ($8 >>> 0 >= $7_1 >>> 0) {
                break block8
               }
               if ($1_1) {
                $2_1 = 2 << $0;
                $5 = __wasm_ctz_i32((0 - $2_1 | $2_1) & $1_1 << $0);
                $1_1 = $5 << 3;
                $2_1 = $1_1 + 78680 | 0;
                $0 = HEAP32[$1_1 + 78688 >> 2];
                $4_1 = HEAP32[$0 + 8 >> 2];
                block11 : {
                 if (($2_1 | 0) == ($4_1 | 0)) {
                  $3 = __wasm_rotl_i32($5) & $3;
                  HEAP32[19660] = $3;
                  break block11;
                 }
                 HEAP32[$2_1 + 8 >> 2] = $4_1;
                 HEAP32[$4_1 + 12 >> 2] = $2_1;
                }
                HEAP32[$0 + 4 >> 2] = $7_1 | 3;
                $4_1 = $1_1 - $7_1 | 0;
                HEAP32[$0 + $1_1 >> 2] = $4_1;
                $5 = $0 + $7_1 | 0;
                HEAP32[$5 + 4 >> 2] = $4_1 | 1;
                if ($8) {
                 $1_1 = ($8 & -8) + 78680 | 0;
                 $2_1 = HEAP32[19665];
                 $6 = 1 << ($8 >>> 3);
                 block14 : {
                  if (!($6 & $3)) {
                   HEAP32[19660] = $3 | $6;
                   $3 = $1_1;
                   break block14;
                  }
                  $3 = HEAP32[$1_1 + 8 >> 2];
                 }
                 HEAP32[$3 + 12 >> 2] = $2_1;
                 HEAP32[$1_1 + 8 >> 2] = $2_1;
                 HEAP32[$2_1 + 12 >> 2] = $1_1;
                 HEAP32[$2_1 + 8 >> 2] = $3;
                }
                $1_1 = $0 + 8 | 0;
                HEAP32[19665] = $5;
                HEAP32[19662] = $4_1;
                break block7;
               }
               $11 = HEAP32[19661];
               if (!$11) {
                break block8
               }
               $0 = HEAP32[(__wasm_ctz_i32($11) << 2) + 78944 >> 2];
               $5 = (HEAP32[$0 + 4 >> 2] & -8) - $7_1 | 0;
               $2_1 = $0;
               while (1) {
                block16 : {
                 $1_1 = HEAP32[$0 + 16 >> 2];
                 if (!$1_1) {
                  $1_1 = HEAP32[$0 + 20 >> 2];
                  if (!$1_1) {
                   break block16
                  }
                 }
                 $4_1 = (HEAP32[$1_1 + 4 >> 2] & -8) - $7_1 | 0;
                 $0 = $4_1 >>> 0 < $5 >>> 0;
                 $5 = $0 ? $4_1 : $5;
                 $2_1 = $0 ? $1_1 : $2_1;
                 $0 = $1_1;
                 continue;
                }
                break;
               };
               $9 = HEAP32[$2_1 + 24 >> 2];
               $1_1 = HEAP32[$2_1 + 12 >> 2];
               if (($1_1 | 0) != ($2_1 | 0)) {
                $0 = HEAP32[$2_1 + 8 >> 2];
                HEAP32[$0 + 12 >> 2] = $1_1;
                HEAP32[$1_1 + 8 >> 2] = $0;
                break block18;
               }
               $0 = HEAP32[$2_1 + 20 >> 2];
               if ($0) {
                $4_1 = $2_1 + 20 | 0
               } else {
                $0 = HEAP32[$2_1 + 16 >> 2];
                if (!$0) {
                 break block21
                }
                $4_1 = $2_1 + 16 | 0;
               }
               while (1) {
                $6 = $4_1;
                $1_1 = $0;
                $4_1 = $0 + 20 | 0;
                $0 = HEAP32[$0 + 20 >> 2];
                if ($0) {
                 continue
                }
                $4_1 = $1_1 + 16 | 0;
                $0 = HEAP32[$1_1 + 16 >> 2];
                if ($0) {
                 continue
                }
                break;
               };
               HEAP32[$6 >> 2] = 0;
               break block18;
              }
              $7_1 = -1;
              if ($0 >>> 0 > 4294967231) {
               break block8
              }
              $1_1 = $0 + 19 | 0;
              $7_1 = $1_1 & -16;
              $8 = HEAP32[19661];
              if (!$8) {
               break block8
              }
              $9 = 31;
              $5 = 0 - $7_1 | 0;
              if ($0 >>> 0 <= 16777196) {
               $0 = Math_clz32($1_1 >>> 8 | 0);
               $9 = (($7_1 >>> 38 - $0 & 1) - ($0 << 1) | 0) + 62 | 0;
              }
              $0 = HEAP32[($9 << 2) + 78944 >> 2];
              block28 : {
               block26 : {
                block24 : {
                 if (!$0) {
                  $1_1 = 0;
                  $4_1 = 0;
                  break block24;
                 }
                 $1_1 = 0;
                 $2_1 = $7_1 << (($9 | 0) != 31 ? 25 - ($9 >>> 1 | 0) | 0 : 0);
                 $4_1 = 0;
                 while (1) {
                  block25 : {
                   $3 = (HEAP32[$0 + 4 >> 2] & -8) - $7_1 | 0;
                   if ($3 >>> 0 >= $5 >>> 0) {
                    break block25
                   }
                   $4_1 = $0;
                   $5 = $3;
                   if ($3) {
                    break block25
                   }
                   $5 = 0;
                   $1_1 = $0;
                   break block26;
                  }
                  $3 = HEAP32[$0 + 20 >> 2];
                  $0 = HEAP32[(($2_1 >>> 29 & 4) + $0 | 0) + 16 >> 2];
                  $1_1 = $3 ? (($0 | 0) == ($3 | 0) ? $1_1 : $3) : $1_1;
                  $2_1 = $2_1 << 1;
                  if ($0) {
                   continue
                  }
                  break;
                 };
                }
                if (!($1_1 | $4_1)) {
                 $4_1 = 0;
                 $0 = 2 << $9;
                 $0 = (0 - $0 | $0) & $8;
                 if (!$0) {
                  break block8
                 }
                 $1_1 = HEAP32[(__wasm_ctz_i32($0) << 2) + 78944 >> 2];
                }
                if (!$1_1) {
                 break block28
                }
               }
               while (1) {
                $2_1 = (HEAP32[$1_1 + 4 >> 2] & -8) - $7_1 | 0;
                $0 = $2_1 >>> 0 < $5 >>> 0;
                $5 = $0 ? $2_1 : $5;
                $4_1 = $0 ? $1_1 : $4_1;
                $0 = HEAP32[$1_1 + 16 >> 2];
                if (!$0) {
                 $0 = HEAP32[$1_1 + 20 >> 2]
                }
                $1_1 = $0;
                if ($1_1) {
                 continue
                }
                break;
               };
              }
              if (!$4_1 | HEAP32[19662] - $7_1 >>> 0 <= $5 >>> 0) {
               break block8
              }
              $6 = HEAP32[$4_1 + 24 >> 2];
              $1_1 = HEAP32[$4_1 + 12 >> 2];
              if (($1_1 | 0) != ($4_1 | 0)) {
               $0 = HEAP32[$4_1 + 8 >> 2];
               HEAP32[$0 + 12 >> 2] = $1_1;
               HEAP32[$1_1 + 8 >> 2] = $0;
               break block31;
              }
              $0 = HEAP32[$4_1 + 20 >> 2];
              if ($0) {
               $2_1 = $4_1 + 20 | 0
              } else {
               $0 = HEAP32[$4_1 + 16 >> 2];
               if (!$0) {
                break block34
               }
               $2_1 = $4_1 + 16 | 0;
              }
              while (1) {
               $3 = $2_1;
               $1_1 = $0;
               $2_1 = $0 + 20 | 0;
               $0 = HEAP32[$0 + 20 >> 2];
               if ($0) {
                continue
               }
               $2_1 = $1_1 + 16 | 0;
               $0 = HEAP32[$1_1 + 16 >> 2];
               if ($0) {
                continue
               }
               break;
              };
              HEAP32[$3 >> 2] = 0;
              break block31;
             }
             $4_1 = HEAP32[19662];
             if ($7_1 >>> 0 <= $4_1 >>> 0) {
              $1_1 = HEAP32[19665];
              $0 = $4_1 - $7_1 | 0;
              block37 : {
               if ($0 >>> 0 >= 16) {
                $2_1 = $1_1 + $7_1 | 0;
                HEAP32[$2_1 + 4 >> 2] = $0 | 1;
                HEAP32[$1_1 + $4_1 >> 2] = $0;
                HEAP32[$1_1 + 4 >> 2] = $7_1 | 3;
                break block37;
               }
               HEAP32[$1_1 + 4 >> 2] = $4_1 | 3;
               $0 = $1_1 + $4_1 | 0;
               HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] | 1;
               $0 = 0;
               $2_1 = 0;
              }
              HEAP32[19662] = $0;
              HEAP32[19665] = $2_1;
              $1_1 = $1_1 + 8 | 0;
              break block7;
             }
             $2_1 = HEAP32[19663];
             if ($7_1 >>> 0 < $2_1 >>> 0) {
              $0 = $7_1 + $6 | 0;
              $1_1 = $2_1 - $7_1 | 0;
              HEAP32[$0 + 4 >> 2] = $1_1 | 1;
              HEAP32[19666] = $0;
              HEAP32[19663] = $1_1;
              HEAP32[$6 + 4 >> 2] = $7_1 | 3;
              $1_1 = $6 + 8 | 0;
              break block7;
             }
             $1_1 = 0;
             if (HEAP32[19778]) {
              $0 = HEAP32[19780]
             } else {
              HEAP32[19780] = 65536;
              HEAP32[19781] = -1;
              HEAP32[19782] = -1;
              HEAP32[19779] = 65536;
              HEAP32[19778] = $10 + 12 & -16 ^ 1431655768;
              HEAP32[19783] = 0;
              HEAP32[19771] = 0;
              $0 = 65536;
             }
             $4_1 = $7_1 + 71 | 0;
             $3 = $0 + $4_1 | 0;
             $5 = 0 - $0 | 0;
             $0 = $3 & $5;
             if ($7_1 >>> 0 >= $0 >>> 0) {
              HEAP32[19648] = 48;
              break block7;
             }
             block42 : {
              $8 = HEAP32[19770];
              if (!$8) {
               break block42
              }
              $9 = HEAP32[19768];
              $1_1 = $9 + $0 | 0;
              if ($1_1 >>> 0 <= $8 >>> 0 & $1_1 >>> 0 > $9 >>> 0) {
               break block42
              }
              $1_1 = 0;
              HEAP32[19648] = 48;
              break block7;
             }
             if (HEAPU8[79084] & 4) {
              break block44
             }
             $1_1 = 79088;
             block51 : {
              block47 : {
               while (1) {
                $8 = HEAP32[$1_1 >> 2];
                if ($6 >>> 0 >= $8 >>> 0 & $8 + HEAP32[$1_1 + 4 >> 2] >>> 0 > $6 >>> 0) {
                 break block47
                }
                $1_1 = HEAP32[$1_1 + 8 >> 2];
                if ($1_1) {
                 continue
                }
                break;
               };
               $2_1 = $209(0);
               if (($2_1 | 0) == -1) {
                break block48
               }
               $3 = $0;
               $1_1 = HEAP32[19779];
               $5 = $1_1 - 1 | 0;
               if ($5 & $2_1) {
                $3 = ($0 - $2_1 | 0) + ($2_1 + $5 & 0 - $1_1) | 0
               }
               if ($3 >>> 0 <= $7_1 >>> 0 | $3 >>> 0 > 2147483646) {
                break block48
               }
               $1_1 = HEAP32[19770];
               if ($1_1) {
                $6 = $1_1;
                $1_1 = HEAP32[19768];
                $5 = $1_1 + $3 | 0;
                if ($6 >>> 0 < $5 >>> 0 | $1_1 >>> 0 >= $5 >>> 0) {
                 break block48
                }
               }
               $1_1 = $209($3);
               if (($2_1 | 0) != ($1_1 | 0)) {
                break block51
               }
               break block52;
              }
              $3 = $5 & $3 - $2_1;
              if ($3 >>> 0 > 2147483646) {
               break block48
              }
              $2_1 = $209($3);
              if (($2_1 | 0) == (HEAP32[$1_1 >> 2] + HEAP32[$1_1 + 4 >> 2] | 0)) {
               break block53
              }
              $1_1 = $2_1;
             }
             if (!(($1_1 | 0) == -1 | $7_1 + 72 >>> 0 <= $3 >>> 0)) {
              $2_1 = HEAP32[19780];
              $2_1 = $2_1 + ($4_1 - $3 | 0) & 0 - $2_1;
              if ($2_1 >>> 0 > 2147483646) {
               $2_1 = $1_1;
               break block52;
              }
              if (($209($2_1) | 0) != -1) {
               $3 = $2_1 + $3 | 0;
               $2_1 = $1_1;
               break block52;
              }
              $209(0 - $3 | 0);
              break block48;
             }
             $2_1 = $1_1;
             if (($1_1 | 0) != -1) {
              break block52
             }
             break block48;
            }
            $1_1 = 0;
            break block18;
           }
           $1_1 = 0;
           break block31;
          }
          if (($2_1 | 0) != -1) {
           break block52
          }
         }
         HEAP32[19771] = HEAP32[19771] | 4;
        }
        if ($0 >>> 0 > 2147483646) {
         break block57
        }
        $2_1 = $209($0);
        $1_1 = ($2_1 | 0) == -1;
        $0 = $209(0);
        if ($1_1 | ($0 | 0) == -1 | $0 >>> 0 <= $2_1 >>> 0) {
         break block57
        }
        $3 = $0 - $2_1 | 0;
        if ($3 >>> 0 <= $7_1 + 56 >>> 0) {
         break block57
        }
       }
       $0 = HEAP32[19768] + $3 | 0;
       HEAP32[19768] = $0;
       if (HEAPU32[19769] < $0 >>> 0) {
        HEAP32[19769] = $0
       }
       block64 : {
        block61 : {
         block60 : {
          $5 = HEAP32[19666];
          if ($5) {
           $1_1 = 79088;
           while (1) {
            $0 = HEAP32[$1_1 >> 2];
            $4_1 = HEAP32[$1_1 + 4 >> 2];
            if (($0 + $4_1 | 0) == ($2_1 | 0)) {
             break block60
            }
            $1_1 = HEAP32[$1_1 + 8 >> 2];
            if ($1_1) {
             continue
            }
            break;
           };
           break block61;
          }
          $0 = HEAP32[19664];
          if (!(!!$0 & $0 >>> 0 <= $2_1 >>> 0)) {
           HEAP32[19664] = $2_1
          }
          HEAP32[19773] = $3;
          HEAP32[19772] = $2_1;
          HEAP32[19668] = -1;
          HEAP32[19669] = HEAP32[19778];
          HEAP32[19775] = 0;
          $1_1 = -256;
          while (1) {
           $0 = $1_1 + 78944 | 0;
           HEAP32[$1_1 + 78956 >> 2] = $0;
           $4_1 = $1_1 + 78936 | 0;
           HEAP32[$0 >> 2] = $4_1;
           HEAP32[$1_1 + 78948 >> 2] = $4_1;
           $4_1 = $1_1 + 78952 | 0;
           HEAP32[$1_1 + 78964 >> 2] = $4_1;
           HEAP32[$4_1 >> 2] = $0;
           $0 = $1_1 + 78960 | 0;
           HEAP32[$1_1 + 78972 >> 2] = $0;
           HEAP32[$0 >> 2] = $4_1;
           HEAP32[$1_1 + 78968 >> 2] = $0;
           $1_1 = $1_1 + 32 | 0;
           if ($1_1) {
            continue
           }
           break;
          };
          $0 = -8 - $2_1 & 15;
          $1_1 = $0 + $2_1 | 0;
          $4_1 = $3 - 56 | 0;
          $0 = $4_1 - $0 | 0;
          HEAP32[$1_1 + 4 >> 2] = $0 | 1;
          HEAP32[19667] = HEAP32[19782];
          HEAP32[19663] = $0;
          HEAP32[19666] = $1_1;
          HEAP32[($2_1 + $4_1 | 0) + 4 >> 2] = 56;
          break block64;
         }
         if (HEAP32[$1_1 + 12 >> 2] & 8 | ($2_1 >>> 0 <= $5 >>> 0 | $0 >>> 0 > $5 >>> 0)) {
          break block61
         }
         $0 = -8 - $5 & 15;
         $2_1 = $0 + $5 | 0;
         $6 = HEAP32[19663] + $3 | 0;
         $0 = $6 - $0 | 0;
         HEAP32[$2_1 + 4 >> 2] = $0 | 1;
         HEAP32[$1_1 + 4 >> 2] = $3 + $4_1;
         HEAP32[19667] = HEAP32[19782];
         HEAP32[19663] = $0;
         HEAP32[19666] = $2_1;
         HEAP32[($5 + $6 | 0) + 4 >> 2] = 56;
         break block64;
        }
        if ($2_1 >>> 0 < HEAPU32[19664]) {
         HEAP32[19664] = $2_1
        }
        $4_1 = $2_1 + $3 | 0;
        $1_1 = 79088;
        block67 : {
         while (1) {
          $0 = HEAP32[$1_1 >> 2];
          if (($4_1 | 0) != ($0 | 0)) {
           $1_1 = HEAP32[$1_1 + 8 >> 2];
           if ($1_1) {
            continue
           }
           break block67;
          }
          break;
         };
         if (!(HEAPU8[$1_1 + 12 | 0] & 8)) {
          break block68
         }
        }
        $1_1 = 79088;
        while (1) {
         block70 : {
          $0 = HEAP32[$1_1 >> 2];
          if ($5 >>> 0 >= $0 >>> 0) {
           $4_1 = $0 + HEAP32[$1_1 + 4 >> 2] | 0;
           if ($4_1 >>> 0 > $5 >>> 0) {
            break block70
           }
          }
          $1_1 = HEAP32[$1_1 + 8 >> 2];
          continue;
         }
         break;
        };
        $0 = -8 - $2_1 & 15;
        $1_1 = $0 + $2_1 | 0;
        $6 = $3 - 56 | 0;
        $8 = $6 - $0 | 0;
        HEAP32[$1_1 + 4 >> 2] = $8 | 1;
        HEAP32[($2_1 + $6 | 0) + 4 >> 2] = 56;
        $0 = ($4_1 + (55 - $4_1 & 15) | 0) - 63 | 0;
        $0 = $0 >>> 0 < $5 + 16 >>> 0 ? $5 : $0;
        HEAP32[$0 + 4 >> 2] = 35;
        HEAP32[19667] = HEAP32[19782];
        HEAP32[19663] = $8;
        HEAP32[19666] = $1_1;
        $1_1 = HEAP32[19775];
        HEAP32[$0 + 16 >> 2] = HEAP32[19774];
        HEAP32[$0 + 20 >> 2] = $1_1;
        $1_1 = HEAP32[19773];
        HEAP32[$0 + 8 >> 2] = HEAP32[19772];
        HEAP32[$0 + 12 >> 2] = $1_1;
        HEAP32[19774] = $0 + 8;
        HEAP32[19773] = $3;
        HEAP32[19772] = $2_1;
        HEAP32[19775] = 0;
        $1_1 = $0 + 36 | 0;
        while (1) {
         HEAP32[$1_1 >> 2] = 7;
         $1_1 = $1_1 + 4 | 0;
         if ($4_1 >>> 0 > $1_1 >>> 0) {
          continue
         }
         break;
        };
        if (($0 | 0) == ($5 | 0)) {
         break block64
        }
        HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] & -2;
        $2_1 = $0 - $5 | 0;
        HEAP32[$0 >> 2] = $2_1;
        HEAP32[$5 + 4 >> 2] = $2_1 | 1;
        block74 : {
         if ($2_1 >>> 0 <= 255) {
          $1_1 = ($2_1 & 248) + 78680 | 0;
          $0 = HEAP32[19660];
          $2_1 = 1 << ($2_1 >>> 3);
          block73 : {
           if (!($0 & $2_1)) {
            HEAP32[19660] = $0 | $2_1;
            $0 = $1_1;
            break block73;
           }
           $0 = HEAP32[$1_1 + 8 >> 2];
          }
          HEAP32[$0 + 12 >> 2] = $5;
          HEAP32[$1_1 + 8 >> 2] = $5;
          $4_1 = 8;
          $2_1 = 12;
          break block74;
         }
         $1_1 = 31;
         if ($2_1 >>> 0 <= 16777215) {
          $0 = Math_clz32($2_1 >>> 8 | 0);
          $1_1 = ($2_1 >>> 38 - $0 & 1 | $0 << 1) ^ 62;
         }
         HEAP32[$5 + 28 >> 2] = $1_1;
         HEAP32[$5 + 16 >> 2] = 0;
         HEAP32[$5 + 20 >> 2] = 0;
         $0 = ($1_1 << 2) + 78944 | 0;
         block78 : {
          $4_1 = HEAP32[19661];
          $3 = 1 << $1_1;
          block77 : {
           if (!($4_1 & $3)) {
            HEAP32[$0 >> 2] = $5;
            HEAP32[19661] = $3 | $4_1;
            break block77;
           }
           $1_1 = $2_1 << (($1_1 | 0) != 31 ? 25 - ($1_1 >>> 1 | 0) | 0 : 0);
           $4_1 = HEAP32[$0 >> 2];
           while (1) {
            $0 = $4_1;
            if (($2_1 | 0) == (HEAP32[$0 + 4 >> 2] & -8)) {
             break block78
            }
            $4_1 = $1_1 >>> 29 | 0;
            $1_1 = $1_1 << 1;
            $3 = ($4_1 & 4) + $0 | 0;
            $4_1 = HEAP32[$3 + 16 >> 2];
            if ($4_1) {
             continue
            }
            break;
           };
           HEAP32[$3 + 16 >> 2] = $5;
          }
          HEAP32[$5 + 24 >> 2] = $0;
          $4_1 = 12;
          $0 = $5;
          $1_1 = $0;
          $2_1 = 8;
          break block74;
         }
         $1_1 = HEAP32[$0 + 8 >> 2];
         HEAP32[$0 + 8 >> 2] = $5;
         HEAP32[$1_1 + 12 >> 2] = $5;
         HEAP32[$5 + 8 >> 2] = $1_1;
         $1_1 = 0;
         $4_1 = 12;
         $2_1 = 24;
        }
        HEAP32[$5 + $4_1 >> 2] = $0;
        HEAP32[$2_1 + $5 >> 2] = $1_1;
       }
       $1_1 = HEAP32[19663];
       if ($1_1 >>> 0 <= $7_1 >>> 0) {
        break block57
       }
       $0 = HEAP32[19666];
       $2_1 = $0 + $7_1 | 0;
       $1_1 = $1_1 - $7_1 | 0;
       HEAP32[$2_1 + 4 >> 2] = $1_1 | 1;
       HEAP32[19663] = $1_1;
       HEAP32[19666] = $2_1;
       HEAP32[$0 + 4 >> 2] = $7_1 | 3;
       $1_1 = $0 + 8 | 0;
       break block7;
      }
      $1_1 = 0;
      HEAP32[19648] = 48;
      break block7;
     }
     HEAP32[$1_1 >> 2] = $2_1;
     HEAP32[$1_1 + 4 >> 2] = HEAP32[$1_1 + 4 >> 2] + $3;
     $8 = (-8 - $2_1 & 15) + $2_1 | 0;
     HEAP32[$8 + 4 >> 2] = $7_1 | 3;
     $5 = (-8 - $0 & 15) + $0 | 0;
     $3 = $7_1 + $8 | 0;
     $6 = $5 - $3 | 0;
     block1 : {
      if (($5 | 0) == HEAP32[19666]) {
       HEAP32[19666] = $3;
       $0 = HEAP32[19663] + $6 | 0;
       HEAP32[19663] = $0;
       HEAP32[$3 + 4 >> 2] = $0 | 1;
       break block1;
      }
      if (($5 | 0) == HEAP32[19665]) {
       HEAP32[19665] = $3;
       $0 = HEAP32[19662] + $6 | 0;
       HEAP32[19662] = $0;
       HEAP32[$3 + 4 >> 2] = $0 | 1;
       HEAP32[$0 + $3 >> 2] = $0;
       break block1;
      }
      $2_1 = HEAP32[$5 + 4 >> 2];
      if (($2_1 & 3) == 1) {
       $9 = $2_1 & -8;
       $1_1 = HEAP32[$5 + 12 >> 2];
       block62 : {
        if ($2_1 >>> 0 <= 255) {
         $0 = HEAP32[$5 + 8 >> 2];
         if (($1_1 | 0) == ($0 | 0)) {
          (wasm2js_i32$0 = 78640, wasm2js_i32$1 = HEAP32[19660] & __wasm_rotl_i32($2_1 >>> 3 | 0)), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
          break block62;
         }
         HEAP32[$1_1 + 8 >> 2] = $0;
         HEAP32[$0 + 12 >> 2] = $1_1;
         break block62;
        }
        $7_1 = HEAP32[$5 + 24 >> 2];
        block83 : {
         if (($1_1 | 0) != ($5 | 0)) {
          $0 = HEAP32[$5 + 8 >> 2];
          HEAP32[$0 + 12 >> 2] = $1_1;
          HEAP32[$1_1 + 8 >> 2] = $0;
          break block83;
         }
         block114 : {
          $2_1 = HEAP32[$5 + 20 >> 2];
          if ($2_1) {
           $0 = $5 + 20 | 0
          } else {
           $2_1 = HEAP32[$5 + 16 >> 2];
           if (!$2_1) {
            break block114
           }
           $0 = $5 + 16 | 0;
          }
          while (1) {
           $4_1 = $0;
           $1_1 = $2_1;
           $0 = $1_1 + 20 | 0;
           $2_1 = HEAP32[$1_1 + 20 >> 2];
           if ($2_1) {
            continue
           }
           $0 = $1_1 + 16 | 0;
           $2_1 = HEAP32[$1_1 + 16 >> 2];
           if ($2_1) {
            continue
           }
           break;
          };
          HEAP32[$4_1 >> 2] = 0;
          break block83;
         }
         $1_1 = 0;
        }
        if (!$7_1) {
         break block62
        }
        $0 = HEAP32[$5 + 28 >> 2];
        $2_1 = $0 << 2;
        block13 : {
         if (($5 | 0) == HEAP32[$2_1 + 78944 >> 2]) {
          HEAP32[$2_1 + 78944 >> 2] = $1_1;
          if ($1_1) {
           break block13
          }
          (wasm2js_i32$0 = 78644, wasm2js_i32$1 = HEAP32[19661] & __wasm_rotl_i32($0)), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
          break block62;
         }
         block15 : {
          if (($5 | 0) == HEAP32[$7_1 + 16 >> 2]) {
           HEAP32[$7_1 + 16 >> 2] = $1_1;
           break block15;
          }
          HEAP32[$7_1 + 20 >> 2] = $1_1;
         }
         if (!$1_1) {
          break block62
         }
        }
        HEAP32[$1_1 + 24 >> 2] = $7_1;
        $0 = HEAP32[$5 + 16 >> 2];
        if ($0) {
         HEAP32[$1_1 + 16 >> 2] = $0;
         HEAP32[$0 + 24 >> 2] = $1_1;
        }
        $0 = HEAP32[$5 + 20 >> 2];
        if (!$0) {
         break block62
        }
        HEAP32[$1_1 + 20 >> 2] = $0;
        HEAP32[$0 + 24 >> 2] = $1_1;
       }
       $6 = $6 + $9 | 0;
       $5 = $5 + $9 | 0;
       $2_1 = HEAP32[$5 + 4 >> 2];
      }
      HEAP32[$5 + 4 >> 2] = $2_1 & -2;
      HEAP32[$3 + $6 >> 2] = $6;
      HEAP32[$3 + 4 >> 2] = $6 | 1;
      if ($6 >>> 0 <= 255) {
       $0 = ($6 & 248) + 78680 | 0;
       $1_1 = HEAP32[19660];
       $2_1 = 1 << ($6 >>> 3);
       block19 : {
        if (!($1_1 & $2_1)) {
         HEAP32[19660] = $1_1 | $2_1;
         $1_1 = $0;
         break block19;
        }
        $1_1 = HEAP32[$0 + 8 >> 2];
       }
       HEAP32[$1_1 + 12 >> 2] = $3;
       HEAP32[$0 + 8 >> 2] = $3;
       HEAP32[$3 + 12 >> 2] = $0;
       HEAP32[$3 + 8 >> 2] = $1_1;
       break block1;
      }
      $1_1 = 31;
      if ($6 >>> 0 <= 16777215) {
       $0 = Math_clz32($6 >>> 8 | 0);
       $1_1 = ($6 >>> 38 - $0 & 1 | $0 << 1) ^ 62;
      }
      HEAP32[$3 + 28 >> 2] = $1_1;
      HEAP32[$3 + 16 >> 2] = 0;
      HEAP32[$3 + 20 >> 2] = 0;
      $0 = ($1_1 << 2) + 78944 | 0;
      $2_1 = HEAP32[19661];
      $4_1 = 1 << $1_1;
      if (!($2_1 & $4_1)) {
       HEAP32[$0 >> 2] = $3;
       HEAP32[19661] = $2_1 | $4_1;
       HEAP32[$3 + 24 >> 2] = $0;
       HEAP32[$3 + 8 >> 2] = $3;
       HEAP32[$3 + 12 >> 2] = $3;
       break block1;
      }
      $1_1 = $6 << (($1_1 | 0) != 31 ? 25 - ($1_1 >>> 1 | 0) | 0 : 0);
      $0 = HEAP32[$0 >> 2];
      block22 : {
       while (1) {
        $2_1 = $0;
        if ((HEAP32[$0 + 4 >> 2] & -8) == ($6 | 0)) {
         break block22
        }
        $0 = $1_1 >>> 29 | 0;
        $1_1 = $1_1 << 1;
        $4_1 = $2_1 + ($0 & 4) | 0;
        $0 = HEAP32[$4_1 + 16 >> 2];
        if ($0) {
         continue
        }
        break;
       };
       HEAP32[$4_1 + 16 >> 2] = $3;
       HEAP32[$3 + 24 >> 2] = $2_1;
       HEAP32[$3 + 12 >> 2] = $3;
       HEAP32[$3 + 8 >> 2] = $3;
       break block1;
      }
      $0 = HEAP32[$2_1 + 8 >> 2];
      HEAP32[$0 + 12 >> 2] = $3;
      HEAP32[$2_1 + 8 >> 2] = $3;
      HEAP32[$3 + 24 >> 2] = 0;
      HEAP32[$3 + 12 >> 2] = $2_1;
      HEAP32[$3 + 8 >> 2] = $0;
     }
     $1_1 = $8 + 8 | 0;
     break block7;
    }
    block79 : {
     if (!$6) {
      break block79
     }
     $0 = HEAP32[$4_1 + 28 >> 2];
     $2_1 = $0 << 2;
     block81 : {
      if (($4_1 | 0) == HEAP32[$2_1 + 78944 >> 2]) {
       HEAP32[$2_1 + 78944 >> 2] = $1_1;
       if ($1_1) {
        break block81
       }
       $8 = __wasm_rotl_i32($0) & $8;
       HEAP32[19661] = $8;
       break block79;
      }
      block8315 : {
       if (($4_1 | 0) == HEAP32[$6 + 16 >> 2]) {
        HEAP32[$6 + 16 >> 2] = $1_1;
        break block8315;
       }
       HEAP32[$6 + 20 >> 2] = $1_1;
      }
      if (!$1_1) {
       break block79
      }
     }
     HEAP32[$1_1 + 24 >> 2] = $6;
     $0 = HEAP32[$4_1 + 16 >> 2];
     if ($0) {
      HEAP32[$1_1 + 16 >> 2] = $0;
      HEAP32[$0 + 24 >> 2] = $1_1;
     }
     $0 = HEAP32[$4_1 + 20 >> 2];
     if (!$0) {
      break block79
     }
     HEAP32[$1_1 + 20 >> 2] = $0;
     HEAP32[$0 + 24 >> 2] = $1_1;
    }
    block86 : {
     if ($5 >>> 0 <= 15) {
      $0 = $5 | $7_1;
      HEAP32[$4_1 + 4 >> 2] = $0 | 3;
      $0 = $0 + $4_1 | 0;
      HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] | 1;
      break block86;
     }
     $3 = $4_1 + $7_1 | 0;
     HEAP32[$3 + 4 >> 2] = $5 | 1;
     HEAP32[$4_1 + 4 >> 2] = $7_1 | 3;
     HEAP32[$3 + $5 >> 2] = $5;
     if ($5 >>> 0 <= 255) {
      $0 = ($5 & 248) + 78680 | 0;
      $1_1 = HEAP32[19660];
      $2_1 = 1 << ($5 >>> 3);
      block89 : {
       if (!($1_1 & $2_1)) {
        HEAP32[19660] = $1_1 | $2_1;
        $1_1 = $0;
        break block89;
       }
       $1_1 = HEAP32[$0 + 8 >> 2];
      }
      HEAP32[$1_1 + 12 >> 2] = $3;
      HEAP32[$0 + 8 >> 2] = $3;
      HEAP32[$3 + 12 >> 2] = $0;
      HEAP32[$3 + 8 >> 2] = $1_1;
      break block86;
     }
     $1_1 = 31;
     if ($5 >>> 0 <= 16777215) {
      $0 = Math_clz32($5 >>> 8 | 0);
      $1_1 = ($5 >>> 38 - $0 & 1 | $0 << 1) ^ 62;
     }
     HEAP32[$3 + 28 >> 2] = $1_1;
     HEAP32[$3 + 16 >> 2] = 0;
     HEAP32[$3 + 20 >> 2] = 0;
     $0 = ($1_1 << 2) + 78944 | 0;
     $2_1 = 1 << $1_1;
     if (!($2_1 & $8)) {
      HEAP32[$0 >> 2] = $3;
      HEAP32[19661] = $2_1 | $8;
      HEAP32[$3 + 24 >> 2] = $0;
      HEAP32[$3 + 8 >> 2] = $3;
      HEAP32[$3 + 12 >> 2] = $3;
      break block86;
     }
     $1_1 = $5 << (($1_1 | 0) != 31 ? 25 - ($1_1 >>> 1 | 0) | 0 : 0);
     $0 = HEAP32[$0 >> 2];
     block92 : {
      while (1) {
       $2_1 = $0;
       if ((HEAP32[$0 + 4 >> 2] & -8) == ($5 | 0)) {
        break block92
       }
       $6 = $1_1 >>> 29 | 0;
       $1_1 = $1_1 << 1;
       $6 = $0 + ($6 & 4) | 0;
       $0 = HEAP32[$6 + 16 >> 2];
       if ($0) {
        continue
       }
       break;
      };
      HEAP32[$6 + 16 >> 2] = $3;
      HEAP32[$3 + 24 >> 2] = $2_1;
      HEAP32[$3 + 12 >> 2] = $3;
      HEAP32[$3 + 8 >> 2] = $3;
      break block86;
     }
     $0 = HEAP32[$2_1 + 8 >> 2];
     HEAP32[$0 + 12 >> 2] = $3;
     HEAP32[$2_1 + 8 >> 2] = $3;
     HEAP32[$3 + 24 >> 2] = 0;
     HEAP32[$3 + 12 >> 2] = $2_1;
     HEAP32[$3 + 8 >> 2] = $0;
    }
    $1_1 = $4_1 + 8 | 0;
    break block7;
   }
   block93 : {
    if (!$9) {
     break block93
    }
    $0 = HEAP32[$2_1 + 28 >> 2];
    $4_1 = $0 << 2;
    block95 : {
     if (($2_1 | 0) == HEAP32[$4_1 + 78944 >> 2]) {
      HEAP32[$4_1 + 78944 >> 2] = $1_1;
      if ($1_1) {
       break block95
      }
      (wasm2js_i32$0 = 78644, wasm2js_i32$1 = __wasm_rotl_i32($0) & $11), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
      break block93;
     }
     block97 : {
      if (($2_1 | 0) == HEAP32[$9 + 16 >> 2]) {
       HEAP32[$9 + 16 >> 2] = $1_1;
       break block97;
      }
      HEAP32[$9 + 20 >> 2] = $1_1;
     }
     if (!$1_1) {
      break block93
     }
    }
    HEAP32[$1_1 + 24 >> 2] = $9;
    $0 = HEAP32[$2_1 + 16 >> 2];
    if ($0) {
     HEAP32[$1_1 + 16 >> 2] = $0;
     HEAP32[$0 + 24 >> 2] = $1_1;
    }
    $0 = HEAP32[$2_1 + 20 >> 2];
    if (!$0) {
     break block93
    }
    HEAP32[$1_1 + 20 >> 2] = $0;
    HEAP32[$0 + 24 >> 2] = $1_1;
   }
   block100 : {
    if ($5 >>> 0 <= 15) {
     $0 = $5 | $7_1;
     HEAP32[$2_1 + 4 >> 2] = $0 | 3;
     $0 = $0 + $2_1 | 0;
     HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] | 1;
     break block100;
    }
    $4_1 = $2_1 + $7_1 | 0;
    HEAP32[$4_1 + 4 >> 2] = $5 | 1;
    HEAP32[$2_1 + 4 >> 2] = $7_1 | 3;
    HEAP32[$5 + $4_1 >> 2] = $5;
    if ($8) {
     $0 = ($8 & -8) + 78680 | 0;
     $1_1 = HEAP32[19665];
     $6 = 1 << ($8 >>> 3);
     block103 : {
      if (!($6 & $3)) {
       HEAP32[19660] = $3 | $6;
       $3 = $0;
       break block103;
      }
      $3 = HEAP32[$0 + 8 >> 2];
     }
     HEAP32[$3 + 12 >> 2] = $1_1;
     HEAP32[$0 + 8 >> 2] = $1_1;
     HEAP32[$1_1 + 12 >> 2] = $0;
     HEAP32[$1_1 + 8 >> 2] = $3;
    }
    HEAP32[19665] = $4_1;
    HEAP32[19662] = $5;
   }
   $1_1 = $2_1 + 8 | 0;
  }
  global$0 = $10 + 16 | 0;
  return $1_1;
 }

 function $214($0) {
  var $1_1 = 0, $2_1 = 0, $3 = 0, $4_1 = 0, $5 = 0, $6 = 0, $7_1 = 0, $8 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  block : {
   if (!$0) {
    break block
   }
   $3 = $0 - 8 | 0;
   $1_1 = HEAP32[$0 - 4 >> 2];
   $0 = $1_1 & -8;
   $5 = $3 + $0 | 0;
   block1 : {
    if ($1_1 & 1) {
     break block1
    }
    if (!($1_1 & 2)) {
     break block
    }
    $1_1 = HEAP32[$3 >> 2];
    $3 = $3 - $1_1 | 0;
    if ($3 >>> 0 < HEAPU32[19664]) {
     break block
    }
    $0 = $0 + $1_1 | 0;
    block6 : {
     block9 : {
      block4 : {
       if (($3 | 0) != HEAP32[19665]) {
        $2_1 = HEAP32[$3 + 12 >> 2];
        if ($1_1 >>> 0 <= 255) {
         $4_1 = HEAP32[$3 + 8 >> 2];
         if (($4_1 | 0) != ($2_1 | 0)) {
          break block4
         }
         (wasm2js_i32$0 = 78640, wasm2js_i32$1 = HEAP32[19660] & __wasm_rotl_i32($1_1 >>> 3 | 0)), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
         break block1;
        }
        $7_1 = HEAP32[$3 + 24 >> 2];
        if (($2_1 | 0) != ($3 | 0)) {
         $1_1 = HEAP32[$3 + 8 >> 2];
         HEAP32[$1_1 + 12 >> 2] = $2_1;
         HEAP32[$2_1 + 8 >> 2] = $1_1;
         break block6;
        }
        $1_1 = HEAP32[$3 + 20 >> 2];
        if ($1_1) {
         $4_1 = $3 + 20 | 0
        } else {
         $1_1 = HEAP32[$3 + 16 >> 2];
         if (!$1_1) {
          break block9
         }
         $4_1 = $3 + 16 | 0;
        }
        while (1) {
         $6 = $4_1;
         $2_1 = $1_1;
         $4_1 = $1_1 + 20 | 0;
         $1_1 = HEAP32[$1_1 + 20 >> 2];
         if ($1_1) {
          continue
         }
         $4_1 = $2_1 + 16 | 0;
         $1_1 = HEAP32[$2_1 + 16 >> 2];
         if ($1_1) {
          continue
         }
         break;
        };
        HEAP32[$6 >> 2] = 0;
        break block6;
       }
       $1_1 = HEAP32[$5 + 4 >> 2];
       if (($1_1 & 3) != 3) {
        break block1
       }
       HEAP32[$5 + 4 >> 2] = $1_1 & -2;
       HEAP32[19662] = $0;
       HEAP32[$5 >> 2] = $0;
       HEAP32[$3 + 4 >> 2] = $0 | 1;
       return;
      }
      HEAP32[$2_1 + 8 >> 2] = $4_1;
      HEAP32[$4_1 + 12 >> 2] = $2_1;
      break block1;
     }
     $2_1 = 0;
    }
    if (!$7_1) {
     break block1
    }
    $1_1 = HEAP32[$3 + 28 >> 2];
    $4_1 = $1_1 << 2;
    block11 : {
     if (($3 | 0) == HEAP32[$4_1 + 78944 >> 2]) {
      HEAP32[$4_1 + 78944 >> 2] = $2_1;
      if ($2_1) {
       break block11
      }
      (wasm2js_i32$0 = 78644, wasm2js_i32$1 = HEAP32[19661] & __wasm_rotl_i32($1_1)), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
      break block1;
     }
     block13 : {
      if (($3 | 0) == HEAP32[$7_1 + 16 >> 2]) {
       HEAP32[$7_1 + 16 >> 2] = $2_1;
       break block13;
      }
      HEAP32[$7_1 + 20 >> 2] = $2_1;
     }
     if (!$2_1) {
      break block1
     }
    }
    HEAP32[$2_1 + 24 >> 2] = $7_1;
    $1_1 = HEAP32[$3 + 16 >> 2];
    if ($1_1) {
     HEAP32[$2_1 + 16 >> 2] = $1_1;
     HEAP32[$1_1 + 24 >> 2] = $2_1;
    }
    $1_1 = HEAP32[$3 + 20 >> 2];
    if (!$1_1) {
     break block1
    }
    HEAP32[$2_1 + 20 >> 2] = $1_1;
    HEAP32[$1_1 + 24 >> 2] = $2_1;
   }
   if ($3 >>> 0 >= $5 >>> 0) {
    break block
   }
   $1_1 = HEAP32[$5 + 4 >> 2];
   if (!($1_1 & 1)) {
    break block
   }
   block26 : {
    block20 : {
     block22 : {
      block25 : {
       if (!($1_1 & 2)) {
        if (HEAP32[19666] == ($5 | 0)) {
         HEAP32[19666] = $3;
         $0 = HEAP32[19663] + $0 | 0;
         HEAP32[19663] = $0;
         HEAP32[$3 + 4 >> 2] = $0 | 1;
         if (HEAP32[19665] != ($3 | 0)) {
          break block
         }
         HEAP32[19662] = 0;
         HEAP32[19665] = 0;
         return;
        }
        $8 = HEAP32[19665];
        if (($5 | 0) == ($8 | 0)) {
         HEAP32[19665] = $3;
         $0 = HEAP32[19662] + $0 | 0;
         HEAP32[19662] = $0;
         HEAP32[$3 + 4 >> 2] = $0 | 1;
         HEAP32[$0 + $3 >> 2] = $0;
         return;
        }
        $0 = ($1_1 & -8) + $0 | 0;
        $2_1 = HEAP32[$5 + 12 >> 2];
        if ($1_1 >>> 0 <= 255) {
         $4_1 = HEAP32[$5 + 8 >> 2];
         if (($2_1 | 0) == ($4_1 | 0)) {
          (wasm2js_i32$0 = 78640, wasm2js_i32$1 = HEAP32[19660] & __wasm_rotl_i32($1_1 >>> 3 | 0)), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
          break block20;
         }
         HEAP32[$2_1 + 8 >> 2] = $4_1;
         HEAP32[$4_1 + 12 >> 2] = $2_1;
         break block20;
        }
        $7_1 = HEAP32[$5 + 24 >> 2];
        if (($2_1 | 0) != ($5 | 0)) {
         $1_1 = HEAP32[$5 + 8 >> 2];
         HEAP32[$1_1 + 12 >> 2] = $2_1;
         HEAP32[$2_1 + 8 >> 2] = $1_1;
         break block22;
        }
        $1_1 = HEAP32[$5 + 20 >> 2];
        if ($1_1) {
         $4_1 = $5 + 20 | 0
        } else {
         $1_1 = HEAP32[$5 + 16 >> 2];
         if (!$1_1) {
          break block25
         }
         $4_1 = $5 + 16 | 0;
        }
        while (1) {
         $6 = $4_1;
         $2_1 = $1_1;
         $4_1 = $1_1 + 20 | 0;
         $1_1 = HEAP32[$1_1 + 20 >> 2];
         if ($1_1) {
          continue
         }
         $4_1 = $2_1 + 16 | 0;
         $1_1 = HEAP32[$2_1 + 16 >> 2];
         if ($1_1) {
          continue
         }
         break;
        };
        HEAP32[$6 >> 2] = 0;
        break block22;
       }
       HEAP32[$5 + 4 >> 2] = $1_1 & -2;
       HEAP32[$0 + $3 >> 2] = $0;
       HEAP32[$3 + 4 >> 2] = $0 | 1;
       break block26;
      }
      $2_1 = 0;
     }
     if (!$7_1) {
      break block20
     }
     $1_1 = HEAP32[$5 + 28 >> 2];
     $4_1 = $1_1 << 2;
     block28 : {
      if (HEAP32[$4_1 + 78944 >> 2] == ($5 | 0)) {
       HEAP32[$4_1 + 78944 >> 2] = $2_1;
       if ($2_1) {
        break block28
       }
       (wasm2js_i32$0 = 78644, wasm2js_i32$1 = HEAP32[19661] & __wasm_rotl_i32($1_1)), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
       break block20;
      }
      block30 : {
       if (HEAP32[$7_1 + 16 >> 2] == ($5 | 0)) {
        HEAP32[$7_1 + 16 >> 2] = $2_1;
        break block30;
       }
       HEAP32[$7_1 + 20 >> 2] = $2_1;
      }
      if (!$2_1) {
       break block20
      }
     }
     HEAP32[$2_1 + 24 >> 2] = $7_1;
     $1_1 = HEAP32[$5 + 16 >> 2];
     if ($1_1) {
      HEAP32[$2_1 + 16 >> 2] = $1_1;
      HEAP32[$1_1 + 24 >> 2] = $2_1;
     }
     $1_1 = HEAP32[$5 + 20 >> 2];
     if (!$1_1) {
      break block20
     }
     HEAP32[$2_1 + 20 >> 2] = $1_1;
     HEAP32[$1_1 + 24 >> 2] = $2_1;
    }
    HEAP32[$0 + $3 >> 2] = $0;
    HEAP32[$3 + 4 >> 2] = $0 | 1;
    if (($3 | 0) != ($8 | 0)) {
     break block26
    }
    HEAP32[19662] = $0;
    return;
   }
   if ($0 >>> 0 <= 255) {
    $1_1 = ($0 & 248) + 78680 | 0;
    $4_1 = HEAP32[19660];
    $0 = 1 << ($0 >>> 3);
    block34 : {
     if (!($4_1 & $0)) {
      HEAP32[19660] = $0 | $4_1;
      $0 = $1_1;
      break block34;
     }
     $0 = HEAP32[$1_1 + 8 >> 2];
    }
    HEAP32[$0 + 12 >> 2] = $3;
    HEAP32[$1_1 + 8 >> 2] = $3;
    HEAP32[$3 + 12 >> 2] = $1_1;
    HEAP32[$3 + 8 >> 2] = $0;
    return;
   }
   $2_1 = 31;
   if ($0 >>> 0 <= 16777215) {
    $1_1 = Math_clz32($0 >>> 8 | 0);
    $2_1 = ($0 >>> 38 - $1_1 & 1 | $1_1 << 1) ^ 62;
   }
   HEAP32[$3 + 28 >> 2] = $2_1;
   HEAP32[$3 + 16 >> 2] = 0;
   HEAP32[$3 + 20 >> 2] = 0;
   $4_1 = ($2_1 << 2) + 78944 | 0;
   block39 : {
    block38 : {
     $1_1 = HEAP32[19661];
     $6 = 1 << $2_1;
     block37 : {
      if (!($1_1 & $6)) {
       HEAP32[$4_1 >> 2] = $3;
       HEAP32[19661] = $1_1 | $6;
       $2_1 = 24;
       $0 = 8;
       break block37;
      }
      $2_1 = $0 << (($2_1 | 0) != 31 ? 25 - ($2_1 >>> 1 | 0) | 0 : 0);
      $4_1 = HEAP32[$4_1 >> 2];
      while (1) {
       $1_1 = $4_1;
       if ((HEAP32[$1_1 + 4 >> 2] & -8) == ($0 | 0)) {
        break block38
       }
       $4_1 = $2_1 >>> 29 | 0;
       $2_1 = $2_1 << 1;
       $6 = ($4_1 & 4) + $1_1 | 0;
       $4_1 = HEAP32[$6 + 16 >> 2];
       if ($4_1) {
        continue
       }
       break;
      };
      HEAP32[$6 + 16 >> 2] = $3;
      $2_1 = 24;
      $4_1 = $1_1;
      $0 = 8;
     }
     $1_1 = $3;
     $6 = $1_1;
     break block39;
    }
    $4_1 = HEAP32[$1_1 + 8 >> 2];
    HEAP32[$4_1 + 12 >> 2] = $3;
    HEAP32[$1_1 + 8 >> 2] = $3;
    $0 = 24;
    $2_1 = 8;
    $6 = 0;
   }
   HEAP32[$2_1 + $3 >> 2] = $4_1;
   HEAP32[$3 + 12 >> 2] = $1_1;
   HEAP32[$0 + $3 >> 2] = $6;
   $0 = HEAP32[19668] - 1 | 0;
   HEAP32[19668] = $0 ? $0 : -1;
  }
 }

 function _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE($0, $1_1, $2_1) {
  var $3 = 0, $4_1 = 0, $5 = 0, $6 = 0, $7_1 = 0;
  $4_1 = $2_1 >>> 16 | 0;
  $3 = $0 >>> 16 | 0;
  $7_1 = Math_imul($4_1, $3);
  $5 = $2_1 & 65535;
  $0 = $0 & 65535;
  $6 = Math_imul($5, $0);
  $3 = ($6 >>> 16 | 0) + Math_imul($3, $5) | 0;
  $0 = ($3 & 65535) + Math_imul($0, $4_1) | 0;
  i64toi32_i32$HIGH_BITS = $7_1 + Math_imul($1_1, $2_1) + ($3 >>> 16) + ($0 >>> 16) | 0;
  return $6 & 65535 | $0 << 16;
 }

 function _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E($0, $1_1, $2_1) {
  var $3 = 0, $4_1 = 0, $5 = 0, $6 = 0, $7_1 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : {
       label$6 : {
        label$7 : {
         label$9 : {
          label$11 : {
           if ($1_1) {
            if (!$2_1) {
             break label$11
            }
            break label$9;
           }
           i64toi32_i32$HIGH_BITS = 0;
           return ($0 >>> 0) / ($2_1 >>> 0) | 0;
          }
          if (!$0) {
           break label$7
          }
          break label$6;
         }
         if (!($2_1 - 1 & $2_1)) {
          break label$5
         }
         $5 = (Math_clz32($2_1) + 33 | 0) - Math_clz32($1_1) | 0;
         $6 = 0 - $5 | 0;
         break label$3;
        }
        i64toi32_i32$HIGH_BITS = 0;
        return ($1_1 >>> 0) / 0 | 0;
       }
       $3 = 32 - Math_clz32($1_1) | 0;
       if ($3 >>> 0 < 31) {
        break label$4
       }
       break label$2;
      }
      if (($2_1 | 0) == 1) {
       break label$1
      }
      $5 = __wasm_ctz_i32($2_1);
      $2_1 = $5 & 31;
      if (($5 & 63) >>> 0 >= 32) {
       $0 = $1_1 >>> $2_1 | 0
      } else {
       $3 = $1_1 >>> $2_1 | 0;
       $0 = ((1 << $2_1) - 1 & $1_1) << 32 - $2_1 | $0 >>> $2_1;
      }
      i64toi32_i32$HIGH_BITS = $3;
      return $0;
     }
     $5 = $3 + 1 | 0;
     $6 = 63 - $3 | 0;
    }
    $3 = $5 & 63;
    $4_1 = $3 & 31;
    if ($3 >>> 0 >= 32) {
     $3 = 0;
     $8 = $1_1 >>> $4_1 | 0;
    } else {
     $3 = $1_1 >>> $4_1 | 0;
     $8 = ((1 << $4_1) - 1 & $1_1) << 32 - $4_1 | $0 >>> $4_1;
    }
    $6 = $6 & 63;
    $4_1 = $6 & 31;
    if ($6 >>> 0 >= 32) {
     $1_1 = $0 << $4_1;
     $0 = 0;
    } else {
     $1_1 = (1 << $4_1) - 1 & $0 >>> 32 - $4_1 | $1_1 << $4_1;
     $0 = $0 << $4_1;
    }
    if ($5) {
     $6 = $2_1 - 1 | 0;
     $10 = ($6 | 0) == -1 ? -1 : 0;
     while (1) {
      $7_1 = $3 << 1 | $8 >>> 31;
      $3 = $8 << 1 | $1_1 >>> 31;
      $4_1 = $10 - ($7_1 + ($3 >>> 0 > $6 >>> 0) | 0) >> 31;
      $9 = $2_1 & $4_1;
      $8 = $3 - $9 | 0;
      $3 = $7_1 - ($3 >>> 0 < $9 >>> 0) | 0;
      $1_1 = $1_1 << 1 | $0 >>> 31;
      $0 = $11 | $0 << 1;
      $7_1 = $4_1 & 1;
      $11 = $7_1;
      $5 = $5 - 1 | 0;
      if ($5) {
       continue
      }
      break;
     };
    }
    i64toi32_i32$HIGH_BITS = $1_1 << 1 | $0 >>> 31;
    return $7_1 | $0 << 1;
   }
   $0 = 0;
   $1_1 = 0;
  }
  i64toi32_i32$HIGH_BITS = $1_1;
  return $0;
 }

 function __wasm_ctz_i32($0) {
  if ($0) {
   return 31 - Math_clz32($0 - 1 ^ $0) | 0
  }
  return 32;
 }

 function __wasm_rotl_i32($0) {
  var $1_1 = 0;
  $1_1 = $0 & 31;
  $0 = 0 - $0 & 31;
  return (-1 >>> $1_1 & -2) << $1_1 | (-1 << $0 & -2) >>> $0;
 }

 bufferView = HEAPU8;
 initActiveSegments(imports);
 var FUNCTION_TABLE = [null, $4, $4, $186, $188, $190];
 function __wasm_memory_size() {
  return buffer.byteLength >> 16;
 }

 function __wasm_memory_grow(pagesToAdd) {
  pagesToAdd = pagesToAdd | 0;
  var oldPages = __wasm_memory_size() | 0;
  var newPages = oldPages + pagesToAdd | 0;
  if ((oldPages < newPages) && (newPages < 65536)) {
   var newBuffer = new ArrayBuffer(newPages << 16);
   var newHEAP8 = new Int8Array(newBuffer);
   newHEAP8.set(HEAP8);
   HEAP8 = new Int8Array(newBuffer);
   HEAP16 = new Int16Array(newBuffer);
   HEAP32 = new Int32Array(newBuffer);
   HEAPU8 = new Uint8Array(newBuffer);
   HEAPU16 = new Uint16Array(newBuffer);
   HEAPU32 = new Uint32Array(newBuffer);
   HEAPF32 = new Float32Array(newBuffer);
   HEAPF64 = new Float64Array(newBuffer);
   buffer = newBuffer;
   bufferView = HEAPU8;
  }
  return oldPages;
 }

 return {
  "memory": Object.create(Object.prototype, {
   "grow": {
    "value": __wasm_memory_grow
   },
   "buffer": {
    "get": function () {
     return buffer;
    }

   }
  }),
  "_initialize": $1,
  "raceReset": $13,
  "lapLength": $19,
  "roadX": $20,
  "roadSlopeAt": $22,
  "raceShoot": $24,
  "raceAdvance": $28,
  "raceState": $36,
  "raceVisible": $37,
  "raceObjects": $41,
  "raceCueCount": $42,
  "raceCue": $43,
  "raceClearCues": $44
 };
}

var retasmFunc = asmFunc({
  "wasi_snapshot_preview1": wasi_snapshot_preview1,
});
export var memory = retasmFunc.memory;
export var _initialize = retasmFunc._initialize;
export var raceReset = retasmFunc.raceReset;
export var lapLength = retasmFunc.lapLength;
export var roadX = retasmFunc.roadX;
export var roadSlopeAt = retasmFunc.roadSlopeAt;
export var raceShoot = retasmFunc.raceShoot;
export var raceAdvance = retasmFunc.raceAdvance;
export var raceState = retasmFunc.raceState;
export var raceVisible = retasmFunc.raceVisible;
export var raceObjects = retasmFunc.raceObjects;
export var raceCueCount = retasmFunc.raceCueCount;
export var raceCue = retasmFunc.raceCue;
export var raceClearCues = retasmFunc.raceClearCues;
