import { db, type LedgerDB } from "./db";
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length)
    return items.slice();
  const result = items.slice(),
    [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}
export async function reorderCategories(
  source: string,
  target: string,
  database: LedgerDB = db,
) {
  if (source === target) return;
  await database.transaction("rw", database.categories, async () => {
    const a = await database.categories.get(source),
      b = await database.categories.get(target);
    if (!a || !b || a.kind !== b.kind || a.parentId !== b.parentId)
      throw Error("ย้ายได้เฉพาะหมวดระดับเดียวกัน");
    const siblings = (await database.categories.toArray())
      .filter((c) => c.kind === a.kind && c.parentId === a.parentId)
      .sort((x, y) => x.order - y.order || x.id.localeCompare(y.id));
    const moved = moveItem(
      siblings,
      siblings.findIndex((c) => c.id === source),
      siblings.findIndex((c) => c.id === target),
    );
    await database.categories.bulkPut(
      moved.map((c, order) => ({ ...c, order })),
    );
  });
}
