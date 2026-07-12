const PUBLIC_AGENT_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/hobbies\/?$/,
  /^\/hobbies\/[a-z0-9-]+\/?$/,
  /^\/blog\/?$/,
  /^\/blog\/[a-z0-9-]+\/?$/,
  /^\/videos\/?$/,
  /^\/videos\/[a-z0-9-]+\/?$/,
  /^\/life-bingo\/?$/,
  /^\/side-quests\/?$/,
  /^\/what-are-significant-hobbies\/?$/,
];

export function isAgentReadablePath(pathname: string): boolean {
  return PUBLIC_AGENT_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}
