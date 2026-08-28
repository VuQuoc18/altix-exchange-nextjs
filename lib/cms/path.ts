const TOKEN = /\.?([A-Za-z_][A-Za-z0-9_]*)|\[(\d+)\]/g;

export function parsePath(path: string): (string | number)[] {
  if (!path || path[0] === '.' || path[0] === '[') {
    throw new Error(`invalid path: ${path}`);
  }
  const tokens: (string | number)[] = [];
  let pos = 0;
  const re = new RegExp(TOKEN.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(path)) !== null) {
    if (match.index !== pos) {
      throw new Error(`invalid path: ${path}`);
    }
    pos = match.index + match[0].length;
    if (match[1] !== undefined) {
      tokens.push(match[1]);
    } else {
      tokens.push(Number(match[2]));
    }
  }
  if (pos !== path.length || tokens.length === 0) {
    throw new Error(`invalid path: ${path}`);
  }
  return tokens;
}

export function getByPath(obj: Record<string, unknown>, path: string): unknown {
  let cur: unknown = obj;
  for (const token of parsePath(path)) {
    try {
      if (typeof token === 'number') {
        cur = (cur as unknown[])[token];
      } else {
        cur = (cur as Record<string, unknown>)[token];
      }
    } catch {
      throw new Error(`path not found: ${path}`);
    }
    if (cur === undefined) {
      throw new Error(`path not found: ${path}`);
    }
  }
  return cur;
}

export function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: string,
): Record<string, unknown> {
  const tokens = parsePath(path);
  const newObj = structuredClone(obj);
  let cur: unknown = newObj;
  for (const token of tokens.slice(0, -1)) {
    if (typeof token === 'number') {
      cur = (cur as unknown[])[token];
    } else {
      cur = (cur as Record<string, unknown>)[token];
    }
    if (cur === undefined || cur === null) {
      throw new Error(`path not found: ${path}`);
    }
  }
  const last = tokens[tokens.length - 1];
  if (typeof last === 'number') {
    (cur as unknown[])[last] = value;
  } else {
    const parent = cur as Record<string, unknown>;
    if (!(last in parent)) {
      throw new Error(`path not found: ${path}`);
    }
    parent[last] = value;
  }
  return newObj;
}
