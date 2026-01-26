import crypto from "crypto";
export class TOTP {
  static dec2hex(e: any) {
    return (e < 15.5 ? "0" : "") + Math.round(e).toString(16);
  }

  static hex2dec(e: any) {
    return Number(`0x${e}`);
  }

  static hex2str(e: any) {
    let t = "";
    for (let n = 0; n < e.length; n += 2) {
      t += String.fromCharCode(this.hex2dec(e.substr(n, 2)));
    }
    return t;
  }

  static leftpad(e: any, t: any, n: any) {
    if (t + 1 >= e.length) {
      e = new Array(t + 1 - e.length).join(n) + e;
    }
    return e;
  }

  static base32tohex(e: any) {
    let t = "";
    let n = "";
    let r = 0;

    for (let i = 0; i < e.length; i++) {
      if (e.charAt(i) === "=") {
        t += "00000";
        r++;
      } else {
        const value = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(
          e.charAt(i).toUpperCase()
        );
        t += this.leftpad(value.toString(2), 5, "0");
      }
    }

    for (let i = 0; i + 4 <= t.length; i += 4) {
      const segment = t.substr(i, 4);
      n += Number(`0b${segment}`).toString(16);
    }

    switch (r) {
      case 0:
        break;
      case 6:
        n = n.substr(0, n.length - 8);
        break;
      case 4:
        n = n.substr(0, n.length - 6);
        break;
      case 3:
        n = n.substr(0, n.length - 4);
        break;
      case 1:
        n = n.substr(0, n.length - 2);
        break;
      default:
        throw new Error("Invalid Base32 string");
    }
    return n;
  }

  static base26(e: any) {
    const alphabet = "23456789BCDFGHJKMNPQRTVWXY";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += alphabet[e % alphabet.length];
      e = Math.floor(e / alphabet.length);
    }
    if (result.length < 5) {
      result = new Array(5 - result.length + 1).join(alphabet[0]) + result;
    }
    return result;
  }

  static cryptoJsWordArrayToUint8Array(wordArray: any) {
    const t = wordArray.sigBytes;
    const n = wordArray.words;
    const result = new Uint8Array(t);
    let i = 0;
    let o = 0;

    while (i < t) {
      const word = n[o++];
      result[i++] = (word >> 24) & 0xff;
      if (i === t) break;
      result[i++] = (word >> 16) & 0xff;
      if (i === t) break;
      result[i++] = (word >> 8) & 0xff;
      if (i === t) break;
      result[i++] = word & 0xff;
    }
    return result;
  }

  static generate(
    type: any,
    secret: string,
    counter: any,
    step: any,
    digits = 6,
    algorithm: any,
    timeOffset: any
  ) {
    secret = secret.replace(/\s/g, "");
    let keyHex,
      useBase26 = false;

    switch (type) {
      case "totp":
      case "hotp":
        keyHex = this.base32tohex(secret);
        break;
      case "hex":
      case "hhex":
        keyHex = secret;
        break;
      case "battle":
        keyHex = this.base32tohex(secret);
        digits = 8;
        break;
      case "steam":
        keyHex = this.base32tohex(secret);
        digits = 10;
        useBase26 = true;
        break;
      default:
        keyHex = this.base32tohex(secret);
    }

    if (!keyHex) throw new Error("Invalid secret key");

    if (type !== "hotp" && type !== "hhex") {
      const currentTime = Math.floor(Date.now() / 1000);
      const adjustedTime = currentTime + (timeOffset || 0);
      counter = Math.floor(adjustedTime / step);
    }

    const counterHex = this.leftpad(this.dec2hex(counter), 16, "0");

    // Calculate HMAC
    const hmac = crypto.createHmac(
      algorithm || "sha1",
      Buffer.from(keyHex, "hex")
    );
    hmac.update(Buffer.from(counterHex, "hex"));
    const hash = hmac.digest("hex");

    // Get the OTP
    const offset = this.hex2dec(hash.substring(hash.length - 1));
    let binary = (
      this.hex2dec(hash.substr(2 * offset, 8)) & this.hex2dec("7fffffff")
    ).toString();

    if (useBase26) {
      return this.base26(Number(binary));
    } else {
      if (binary.length < digits) {
        binary = new Array(digits - binary.length + 1).join("0") + binary;
      }
      return binary.substr(binary.length - digits, digits).toString();
    }
  }
}
