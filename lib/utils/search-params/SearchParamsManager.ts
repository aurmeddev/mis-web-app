export class SearchParamsManager {
  // Generate searchParams
  append(params: any) {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        searchParams.append(key, params[key]);
      }
    }
    return `?${searchParams.toString()}`;
  }

  // Convert the URLSearchParams to Object format
  toObject(searchParams: any) {
    const obj: any = {};
    const isNumber = /^[1-9][0-9]*$/;
    for (const [key, value] of searchParams.entries()) {
      if (isNumber.test(value)) {
        obj[key] = Number(value);
      } else {
        obj[key] = value;
      }
    }
    return obj;
  }

  cleanSearchParams(searchParams: string): string {
    // Split the search params by '&' to get individual key-value pairs
    const params = searchParams.split("&");

    // Filter out the parameters where the value is null, undefined, or 0
    const validParams = params.filter((param) => {
      const [key, value] = param.split("=");
      return (
        value !== "0" && value !== null && value !== undefined && value !== ""
      );
    });

    // Join the filtered parameters back into a string
    return validParams.join("&");
  }

  generateFullURL = (
    willRemoveSearchParams: boolean,
    pathname?: string
  ): string => {
    if (typeof window === "undefined") {
      return ""; // Return an empty string if the code is running server-side
    }

    const baseUrl = window.location.origin; // Get the base URL (e.g., "https://example.com")
    const currentPath = pathname || window.location.pathname; // Use provided pathname or fallback to the current pathname
    let searchParams = window.location.search; // Get current query parameters (e.g., "?key=value")
    searchParams = willRemoveSearchParams ? "" : searchParams; // Remove search params if needed

    // Construct and return the full URL
    return `${baseUrl}${currentPath}${searchParams}`;
  };

  createPageURL = (param: any, pathname: any, searchParams: any) => {
    // Check if the params is not empty
    if (searchParams.toString() !== "") {
      let existingParams: any = "";
      for (const [key, value] of searchParams.entries()) {
        if (param.toString() !== key.toString()) {
          existingParams += key + "=" + value + "&";
        }
      }
      return pathname + "?" + existingParams;
    }

    return pathname + "?";
  };

  refreshWithCacheBuster({
    page,
    limit,
    willCache = true,
  }: {
    page: string;
    limit: string;
    willCache?: boolean;
  }) {
    const query = new URLSearchParams();

    if (page) query.set("page", page);
    if (limit) query.set("limit", limit);

    if (willCache) {
      const triggerCache = Math.random()
        .toString(36)
        .substring(2, 5 + 2);
      query.set("trigger", triggerCache);
    }
    return query;
  }

  getDomainNameFromUrl(urlString: string) {
    try {
      const url = new URL(urlString);
      const hostname = url.hostname;

      // Split the hostname by the '.' character.
      const parts = hostname.split(".");

      // A simple check to see if there's a subdomain.
      // If the length is greater than 2, it has a subdomain (e.g., 'www.example.com').
      if (parts.length > 2) {
        // Use slice(-2) to get the last two elements of the array (the root and TLD).
        // Then, join them back together with a '.'.
        return parts.slice(-2).join(".");
      }

      return hostname;
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  }
}
