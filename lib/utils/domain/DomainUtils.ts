export class DomainUtils {
  isValidDomain(domain: string): boolean {
    // Basic domain regex (no protocol, no path)
    const domainRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.[A-Za-z]{2,}$/;

    return domainRegex.test(domain.trim());
  }
}
