/**
 * A same-site path for a relative Location header.
 * Browsers read "//host" and "/\host" as protocol-relative URLs (an open redirect),
 * so any run of leading slashes or backslashes collapses to exactly one "/".
 */
export function safePath(pathname: string): string {
  return "/" + pathname.replace(/^[/\\]+/, "");
}
