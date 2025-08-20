import * as net from "net";
export class IpAddressUtil {
  checkIPVersion(ip: string): "IPv4" | "IPv6" | "Invalid" {
    const version = net.isIP(ip);
    if (version === 4) return "IPv4";
    if (version === 6) return "IPv6";
    return "Invalid";
  }
}
