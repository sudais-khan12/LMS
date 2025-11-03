export function parsePagination(url: string, defaultLimit = 20, maxLimit = 100) {
  const { searchParams } = new URL(url);
  const limitParam = searchParams.get('limit');
  const skipParam = searchParams.get('skip');
  let limit = defaultLimit;
  let skip = 0;
  if (limitParam) {
    const v = parseInt(limitParam);
    if (!isNaN(v)) limit = Math.max(1, Math.min(maxLimit, v));
  }
  if (skipParam) {
    const v = parseInt(skipParam);
    if (!isNaN(v)) skip = Math.max(0, v);
  }
  return { limit, skip };
}


