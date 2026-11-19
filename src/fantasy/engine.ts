import {
  addDays,
  balance,
  categorySpend,
  descendantIds,
  isLiability,
  summary,
  today,
  type State,
  type Transaction,
} from "../domain";
import { progression } from "../progression";
import {
  furniture,
  parseFantasy,
  type CompanionId,
  type FantasyState,
} from "./model";
import { dialogueBank, eventRegistry, type EventId } from "./events";
import affinityDialogue from "./affinityDialogue.json";
export const RUNTIME_KEY = "companion.runtime.v1";
export const affinityTier = (n: number) =>
  1 + [7, 21, 60, 120].filter((x) => n >= x).length;
export const affinityTitles = [
  "ยังไม่สนิท",
  "เริ่มคุ้นเคย",
  "เพื่อนสนิท",
  "ไว้ใจ",
  "คู่หูสมุดเวท",
];
type Memory = {
  affinity: number;
  lastAwardDay: string;
  recent: string[];
  lastEvents: Record<string, number>;
  history: { key: string; event: EventId; line: string; at: number }[];
};
export type Dialogue = {
  key: string;
  event: EventId;
  line: string;
  text: string;
  character: CompanionId;
  at: number;
  priority: number;
  emotion: (typeof eventRegistry)[EventId]["emotion"];
  evidence?: { id: string; revision: string }[];
};
export type Runtime = {
  version: 1;
  initialized: boolean;
  seenTransactions: string[];
  consumed: Record<string, true>;
  characters: Record<CompanionId, Memory>;
  queue: Dialogue[];
  lastOpened: string;
  snapshot: {
    level: number;
    rank: number;
    period: string;
    outfitCount: number;
    furniture: string[];
  };
  appearance?: {
    character: CompanionId;
    outfit: number;
    hair: number;
    accessory: string;
    furniture: string;
  };
  lastPage?: string;
};
export type Cause = {
  kind: "open" | "sync" | "interaction" | "page";
  session?: string;
  page?: string;
};
const emptyMemory = (): Memory => ({
  affinity: 0,
  lastAwardDay: "",
  recent: [],
  lastEvents: {},
  history: [],
});
export function readRuntime(value?: string, legacy?: FantasyState): Runtime {
  try {
    const r = JSON.parse(value || "null");
    if (
      r?.version === 1 &&
      r.characters?.yui &&
      r.characters?.momo &&
      Array.isArray(r.queue) &&
      Array.isArray(r.seenTransactions) &&
      r.snapshot &&
      r.consumed
    ) {
      for (const id of ["yui", "momo"] as const) {
        const m = r.characters[id];
        r.characters[id] = {
          affinity: Number.isFinite(m.affinity)
            ? Math.max(0, Math.floor(m.affinity))
            : 0,
          lastAwardDay:
            typeof m.lastAwardDay === "string" ? m.lastAwardDay : "",
          recent: Array.isArray(m.recent)
            ? m.recent.filter((x: unknown) => typeof x === "string").slice(-3)
            : [],
          lastEvents:
            m.lastEvents && typeof m.lastEvents === "object"
              ? Object.fromEntries(
                  Object.entries(m.lastEvents).filter(
                    ([, v]) => typeof v === "number" && Number.isFinite(v),
                  ),
                )
              : {},
          history: Array.isArray(m.history)
            ? m.history
                .filter(
                  (x: Memory["history"][number]) =>
                    x &&
                    typeof x.key === "string" &&
                    eventRegistry[x.event] &&
                    typeof x.line === "string" &&
                    Number.isFinite(x.at),
                )
                .slice(-250)
            : [],
        };
      }
      r.queue = r.queue
        .filter(
          (q: Dialogue) =>
            q &&
            typeof q.key === "string" &&
            typeof q.line === "string" &&
            typeof q.text === "string" &&
            eventRegistry[q.event] &&
            (q.character === "yui" || q.character === "momo") &&
            Number.isFinite(q.at) &&
            (!q.evidence ||
              (Array.isArray(q.evidence) &&
                q.evidence.every(
                  (x) =>
                    x &&
                    typeof x.id === "string" &&
                    typeof x.revision === "string",
                ))),
        )
        .map((q: Dialogue) => ({
          ...q,
          priority: eventRegistry[q.event].priority,
          emotion: eventRegistry[q.event].emotion,
        }))
        .slice(0, 12);
      r.seenTransactions = r.seenTransactions.filter(
        (x: unknown) => typeof x === "string",
      );
      r.consumed = Object.fromEntries(
        Object.entries(r.consumed).filter(([, v]) => v === true),
      );
      r.snapshot = {
        level: Math.max(1, Number(r.snapshot.level) || 1),
        rank: Math.max(0, Number(r.snapshot.rank) || 0),
        period: typeof r.snapshot.period === "string" ? r.snapshot.period : "",
        outfitCount: Math.max(1, Number(r.snapshot.outfitCount) || 1),
        furniture: Array.isArray(r.snapshot.furniture)
          ? r.snapshot.furniture.filter((x: unknown) => typeof x === "string")
          : [],
      };
      if (r.appearance && !["yui", "momo"].includes(r.appearance.character))
        delete r.appearance;
      return r;
    }
  } catch {
    /* preserve the legacy settings on malformed runtime */
  }
  const r: Runtime = {
    version: 1,
    initialized: false,
    seenTransactions: [],
    consumed: {},
    characters: { yui: emptyMemory(), momo: emptyMemory() },
    queue: [],
    lastOpened: "",
    snapshot: { level: 1, rank: 0, period: "", outfitCount: 1, furniture: [] },
  };
  if (legacy) {
    r.characters[legacy.character].affinity = Math.max(
      0,
      Number(legacy.affinity) || 0,
    );
    r.characters[legacy.character].lastAwardDay = legacy.lastInteraction || "";
  }
  return r;
}
export function localDay(now: Date) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function isCoffee(t: Pick<Transaction, "categoryId">, s: State) {
  return /กาแฟ|coffee/i.test(
    s.categories.find((c) => c.id === t.categoryId)?.name || "",
  );
}
export function coffeeFacts(s: State, day = today()) {
  const tx = s.transactions.filter(
    (t) => t.kind === "expense" && t.date === day && isCoffee(t, s),
  );
  const known = tx.filter(
    (t) => Number.isSafeInteger(t.coffee?.cups) && t.coffee!.cups > 0,
  );
  return {
    cups: known.reduce((n, t) => n + t.coffee!.cups, 0),
    partnerCups: known.reduce((n, t) => n + (t.coffee!.partnerCups || 0), 0),
    complete: tx.length > 0 && tx.length === known.length,
    transactions: tx.length,
  };
}
const setting = (s: State, id: string) =>
  s.settings.find((x) => x.id === id)?.value || "";
const appearance = (f: FantasyState) => ({
  character: f.character,
  outfit: f.outfit,
  hair: f.hair,
  accessory: f.accessory,
  furniture: f.furniture.join(","),
});
function snapshots(s: State, day: string) {
  const p = progression(s.transactions, day);
  return {
    level: p.level,
    rank: p.rankIndex,
    period:
      s.periods
        .filter((x) => x.start <= day && x.end >= day)
        .sort((a, b) => b.start.localeCompare(a.start))[0]?.id || "",
    outfitCount: Math.min(8, Math.floor(p.level / 2) + 1),
    furniture: furniture.filter((x) => x.level <= p.level).map((x) => x.id),
  };
}
export function advanceCompanion(
  s: State,
  previous: Runtime,
  cause: Cause,
  now = new Date(),
  random = Math.random,
): Runtime {
  const r = structuredClone(previous),
    day = localDay(now),
    time = now.getTime(),
    f = parseFantasy(setting(s, "fantasy.state")),
    character = f.character,
    m = r.characters[character],
    snap = snapshots(s, day),
    old = r.snapshot;
  r.queue = r.queue.filter(
    (x) =>
      time - x.at < 600000 &&
      (!x.evidence ||
        x.evidence.every((proof) =>
          s.transactions.some(
            (t) => t.id === proof.id && JSON.stringify(t) === proof.revision,
          ),
        )),
  );
  const candidates: { id: EventId; scope: string }[] = [];
  const offer = (id: EventId, scope = day) => candidates.push({ id, scope });
  const seenTransactions = new Set(r.seenTransactions);
  const fresh = s.transactions.filter((t) => !seenTransactions.has(t.id));
  const current = fresh.filter(
    (t) =>
      t.date === day &&
      localDay(new Date(t.createdAt)) === day &&
      !t.note.includes("ข้อมูลตัวอย่าง"),
  );
  const first = !r.initialized;
  // Baseline existing data instead of replaying earned events during installation/import.
  if (first) {
    r.initialized = true;
    r.consumed["selected:" + character] = true;
  }
  if (cause.kind === "open") {
    if (r.lastOpened && r.lastOpened <= addDays(day, -14)) offer("E30");
    const last = s.transactions
      .filter(
        (t) => t.date <= day && (t.kind === "income" || t.kind === "expense"),
      )
      .map((t) => t.date)
      .sort()
      .at(-1);
    if (last && last <= addDays(day, -7)) offer("E35");
    else if (last && last <= addDays(day, -3)) offer("E08");
    offer(
      now.getHours() < 5 || now.getHours() >= 18
        ? "E03"
        : now.getHours() < 11
          ? "E01"
          : "E02",
    );
    r.lastOpened = day;
  }
  if (
    ["open", "interaction"].includes(cause.kind) ||
    (!first && current.length)
  ) {
    const before = affinityTier(m.affinity);
    if (m.lastAwardDay !== day) {
      m.affinity++;
      m.lastAwardDay = day;
    }
    if (affinityTier(m.affinity) > before)
      offer("E29", character + ":" + affinityTier(m.affinity));
  }
  if (cause.kind === "interaction")
    offer(
      now.getHours() < 5 || now.getHours() >= 18
        ? "E03"
        : now.getHours() < 11
          ? "E01"
          : "E02",
      day + ":talk:" + time,
    );
  if (!first && r.appearance) {
    if (r.appearance.character !== character)
      r.queue = r.queue.filter((q) => q.character === character);
    if (
      r.appearance.character !== character &&
      !r.consumed["selected:" + character]
    ) {
      offer("E46", character);
      r.consumed["selected:" + character] = true;
    } else if (r.appearance.character === character) {
      if (r.appearance.outfit !== f.outfit) offer("E42", String(time));
      if (r.appearance.hair !== f.hair) offer("E43", String(time));
      if (r.appearance.accessory !== f.accessory && f.accessory === "skull")
        offer("E47", String(time));
      if (r.appearance.furniture !== f.furniture.join(","))
        offer("E44", String(time));
    }
  }
  if (cause.kind === "page" && r.lastPage !== cause.page) {
    if (cause.page === "room") offer("E44", String(time));
    if (cause.page === "wardrobe") offer("E45", String(time));
    r.lastPage = cause.page;
  }
  const period = s.periods.find((x) => x.id === snap.period),
    prior = period
      ? s.periods
          .filter((x) => x.end < period.start)
          .sort((a, b) => b.end.localeCompare(a.end))[0]
      : undefined;
  const z = period ? summary(s, period) : undefined;
  if (!first && current.length) {
    const prog = progression(s.transactions, day);
    if (snap.rank > old.rank) offer("E26", String(snap.rank));
    else if (snap.level > old.level) offer("E25", String(snap.level));
    if (snap.outfitCount > old.outfitCount)
      offer("E27", String(snap.outfitCount));
    for (const id of snap.furniture)
      if (!old.furniture.includes(id)) offer("E28", id);
    if (prog.streak >= 30) {
      offer("E07", "30");
      r.consumed["E06:7"] = true;
    } else if (prog.streak >= 7) offer("E06", "7");
    if (prog.days >= 30)
      offer("E49", "recorded-days:" + (prog.days >= 100 ? 100 : 30));
    const savings = s.accounts
      .filter((a) => a.kind === "saving")
      .reduce((n, a) => n + balance(a, s.transactions, day), 0);
    if (savings >= 1000000) {
      offer("E20", "10000");
      r.consumed["E19:1000"] = true;
    } else if (savings >= 100000) offer("E19", "1000");
    for (const goal of s.goals) {
      const account = s.accounts.find(
        (a) => a.id === goal.accountId && a.kind === "saving",
      );
      if (account && balance(account, s.transactions, day) >= goal.target)
        offer("E18", goal.id);
    }
    for (const t of current) {
      const cat = s.categories.find((c) => c.id === t.categoryId),
        incoming = s.accounts.find((a) => a.id === t.toAccountId);
      if (t.kind === "income") {
        if (/เงินเดือน|salary/i.test(cat?.name || "")) offer("E09", t.id);
        else if (
          /เสริม|freelance|side/i.test(cat?.name || "") &&
          !s.transactions.some(
            (other) =>
              other.id !== t.id &&
              other.kind === "income" &&
              other.createdAt < t.createdAt &&
              /เสริม|freelance|side/i.test(
                s.categories.find((c) => c.id === other.categoryId)?.name || "",
              ),
          )
        )
          offer("E10", "side-income");
        offer(t.entrySource === "quick" ? "E41" : "E05", t.id);
      }
      if (t.kind === "expense") {
        if (isCoffee(t, s)) {
          const coffee = coffeeFacts(s, day),
            cb = s.budgets.find(
              (b) =>
                b.periodId === period?.id &&
                /กาแฟ|coffee/i.test(
                  s.categories.find((c) => c.id === b.categoryId)?.name || "",
                ),
            );
          const spent =
            cb && z ? categorySpend(cb.categoryId, z.tx, s.categories) : 0;
          // One highest applicable coffee reaction per transaction, never infer cups from price/count.
          if (cb && cb.amount > 0 && spent > cb.amount)
            offer("C04", period!.id);
          else if (cb && cb.amount > 0 && spent >= cb.amount * 0.8)
            offer("E33", period!.id);
          else if (coffee.complete && coffee.cups === 3)
            offer(coffee.partnerCups > 0 ? "C03" : "E32");
          else if (coffee.complete && coffee.cups === 2) offer("C02");
          else if (coffee.complete && coffee.cups === 1) offer("E31");
          else offer("C01", t.id);
        } else offer(t.entrySource === "quick" ? "E41" : "E04", t.id);
        const past = s.transactions
          .filter(
            (x) =>
              x.id !== t.id &&
              x.kind === "expense" &&
              x.createdAt < t.createdAt &&
              x.date <= day,
          )
          .map((x) => x.amount)
          .sort((a, b) => a - b);
        if (
          past.length >= 5 &&
          t.amount >= 100000 &&
          t.amount > past[Math.floor(past.length / 2)] * 3
        )
          offer("E38");
      }
      if (t.kind === "transfer" && incoming) {
        if (incoming.kind === "saving") offer("E17", t.id);
        if (isLiability(incoming)) {
          if (balance(incoming, s.transactions, day) === 0)
            offer("E24", incoming.id);
          else offer(incoming.kind === "credit" ? "E22" : "E23", t.id);
        }
      }
    }
  }
  // Contextual warnings and period comparisons are read-only, based on existing accounting helpers.
  if (z && period && (cause.kind === "open" || (!first && current.length))) {
    const prog = progression(s.transactions, day);
    if (
      prog.next &&
      prog.next.level - prog.level === 1 &&
      prog.levelProgress >= 80
    )
      offer("E51", period.id + ":" + prog.next.name);
    const incomeCategories = new Set(
      z.tx
        .filter((t) => t.kind === "income" && t.incomeSource?.trim())
        .map((t) => t.incomeSource!.trim().toLocaleLowerCase()),
    );
    if (incomeCategories.size >= 2) offer("E11", period.id);
    const budgets = s.budgets.filter(
      (b) => b.periodId === period.id && b.amount > 0,
    );
    // Avoid double counting parent/child budgets: only outermost configured envelopes.
    const outer = budgets.filter(
      (b) =>
        !budgets.some(
          (other) =>
            other !== b &&
            descendantIds(other.categoryId, s.categories).includes(
              b.categoryId,
            ),
        ),
    );
    const limit = outer.reduce((n, b) => n + b.amount, 0),
      spent = outer.reduce(
        (n, b) => n + categorySpend(b.categoryId, z.tx, s.categories),
        0,
      );
    if (limit > 0 && spent > limit) offer("E14", period.id);
    else if (limit > 0 && spent >= limit * 0.8) offer("E13", period.id);
    if (z.actual < 0) offer("E37");
    if (prior) {
      const before = summary(s, prior);
      if (before.income > 0 && z.income > before.income)
        offer("E36", period.id);
      for (const [pattern, id] of [
        [/อาหาร|food/i, "E15"],
        [/เดินทาง|travel|transport/i, "E16"],
      ] as const) {
        const cat = s.categories.find(
          (c) => !c.parentId && pattern.test(c.name),
        );
        if (
          cat &&
          categorySpend(cat.id, before.tx, s.categories) > 0 &&
          categorySpend(cat.id, z.tx, s.categories) >
            categorySpend(cat.id, before.tx, s.categories)
        )
          offer(id, period.id);
      }
    }
    const passive = z.tx
      .filter(
        (t) =>
          t.kind === "income" &&
          (/#passive\b/i.test(t.tags) ||
            /ดอกเบี้ย|ปันผล|passive/i.test(
              s.categories.find((c) => c.id === t.categoryId)?.name || "",
            )),
      )
      .reduce((n, t) => n + t.amount, 0);
    if (passive >= 100000) offer("E50", period.id);
  }
  if (cause.kind === "open") {
    if (
      setting(s, "companion.birthdayConsent") === "true" &&
      setting(s, "companion.birthday") === day.slice(5)
    )
      offer("E48");
    const salary = Number(setting(s, "companion.salaryDay"));
    if (salary >= 1 && salary <= 31) {
      const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        Math.min(
          salary,
          new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
        ),
      );
      if (next < new Date(day + "T00:00:00"))
        next.setFullYear(
          now.getFullYear(),
          now.getMonth() + 1,
          Math.min(
            salary,
            new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate(),
          ),
        );
      const delta = Math.round(
        (Date.parse(localDay(next)) - Date.parse(day)) / 86400000,
      );
      if (delta >= 0 && delta <= 3) offer("E39");
    }
    let due: Record<string, string> = {};
    try {
      due = JSON.parse(setting(s, "companion.debtDueDates") || "{}");
    } catch {
      /* optional metadata */
    }
    for (const account of s.accounts.filter(
      (a) => a.kind === "credit" && a.active,
    ))
      if (
        /^\d{4}-\d{2}-\d{2}$/.test(due[account.id] || "") &&
        due[account.id] >= day &&
        due[account.id] <= addDays(day, 3) &&
        balance(account, s.transactions, day) > 0
      )
        offer("E21", day + ":" + account.id);
    const closed = s.periods
      .filter((p) => p.end < day)
      .sort((a, b) => b.end.localeCompare(a.end));
    if (closed[0]) {
      const latest = summary(s, closed[0]);
      if (latest.actual > 0) offer("E12", closed[0].id);
      const dates = new Set(
        latest.tx
          .filter((t) => t.kind === "income" || t.kind === "expense")
          .map((t) => t.date),
      );
      const days =
        Math.round(
          (Date.parse(closed[0].end) - Date.parse(closed[0].start)) / 86400000,
        ) + 1;
      if (days > 0 && dates.size === days) offer("E34", closed[0].id);
      if (closed[1]) {
        const coffee = (p: (typeof closed)[0]) =>
          summary(s, p)
            .tx.filter((t) => t.kind === "expense" && isCoffee(t, s))
            .reduce((n, t) => n + t.amount, 0);
        const len = (p: (typeof closed)[0]) =>
          Date.parse(p.end) - Date.parse(p.start);
        if (
          len(closed[0]) === len(closed[1]) &&
          coffee(closed[1]) > 0 &&
          coffee(closed[0]) < coffee(closed[1])
        )
          offer("C05", closed[0].id);
      }
    }
  }
  if (!first && snap.period && old.period && snap.period !== old.period)
    offer("E40", snap.period);
  if (first) {
    // Existing achievements establish a high-water baseline, never retroactive reward speech.
    const prog = progression(s.transactions, day);
    if (prog.best >= 7) r.consumed["E06:7"] = true;
    if (prog.best >= 30) r.consumed["E07:30"] = true;
    if (prog.days >= 30) r.consumed["E49:recorded-days:30"] = true;
    if (prog.days >= 100) r.consumed["E49:recorded-days:100"] = true;
    for (const g of s.goals) {
      const a = s.accounts.find((a) => a.id === g.accountId);
      if (a && balance(a, s.transactions, day) >= g.target)
        r.consumed["E18:" + g.id] = true;
    }
    const savings = s.accounts
      .filter((a) => a.kind === "saving")
      .reduce((n, a) => n + balance(a, s.transactions, day), 0);
    if (savings >= 100000) r.consumed["E19:1000"] = true;
    if (savings >= 1000000) r.consumed["E20:10000"] = true;
  }
  const sorted = candidates.sort(
    (a, b) => eventRegistry[b.id].priority - eventRegistry[a.id].priority,
  );
  let added = 0;
  for (const c of sorted) {
    const def = eventRegistry[c.id],
      key = c.id + ":" + c.scope,
      consumedKey = def.scope === "once" ? key : character + ":" + key;
    if (
      r.consumed[consumedKey] ||
      time - (m.lastEvents[c.id] || 0) < def.cooldown
    )
      continue;
    if (added >= 8 || r.queue.length >= 12) break;
    // A special reaction replaces generic save/greeting speech for this evaluation.
    if (added && def.priority <= 21) continue;
    const tier = affinityTier(m.affinity);
    const useAffinity =
      cause.kind === "interaction" && ["E01", "E02", "E03"].includes(c.id);
    const prefix = useAffinity
      ? `${character}.affinity.${tier}`
      : `${character}.${c.id}`;
    const lines = useAffinity
        ? affinityDialogue[character][tier - 1]
        : dialogueBank[c.id][character],
      choices = lines
        .map((text, i) => ({ text, line: `${prefix}.${i}` }))
        .filter((x) => !m.recent.slice(-3).includes(x.line));
    const pool = choices.length
        ? choices
        : lines.map((text, i) => ({ text, line: `${prefix}.${i}` })),
      selected =
        pool[
          Math.min(
            pool.length - 1,
            Math.max(0, Math.floor(random() * pool.length)),
          )
        ];
    const suffix =
      character === "yui" &&
      tier >= 4 &&
      ["E04", "E05", "E17", "E18"].includes(c.id)
        ? " ฉันอยู่ข้างเธอนะ... ก็เป็นคู่หูกันนี่"
        : "";
    r.queue.push({
      key: consumedKey,
      event: c.id,
      line: selected.line,
      text: selected.text + suffix,
      character,
      at: time,
      priority: def.priority,
      emotion: def.emotion,
      evidence: current.length
        ? current.map((t) => ({ id: t.id, revision: JSON.stringify(t) }))
        : undefined,
    });
    r.consumed[consumedKey] = true;
    m.lastEvents[c.id] = time;
    m.recent = [...m.recent, selected.line].slice(-3);
    m.history = [
      ...m.history,
      { key: consumedKey, event: c.id, line: selected.line, at: time },
    ].slice(-250);
    added++;
  }
  r.queue.sort((a, b) => b.priority - a.priority || a.at - b.at);
  r.seenTransactions = [
    ...new Set([...r.seenTransactions, ...s.transactions.map((t) => t.id)]),
  ];
  r.snapshot = {
    ...snap,
    level: Math.max(old.level, snap.level),
    rank: Math.max(old.rank, snap.rank),
    outfitCount: Math.max(old.outfitCount, snap.outfitCount),
    furniture: [...new Set([...old.furniture, ...snap.furniture])],
  };
  r.appearance = appearance(f);
  return r;
}
