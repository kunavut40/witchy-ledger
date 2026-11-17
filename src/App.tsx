import QuickMenu from "./QuickMenu";
import {
  FantasySettings,
  FantasyRoom,
  CompanionWidget,
  readFantasy,
} from "./fantasy/Fantasy";
import { menuSound } from "./fantasy/sound";
import { ProgressBanner } from "./Adventure";
import { progression } from "./progression";
import Profile, { Character, getProfile } from "./Profile";
import Debts from "./Debts";
import Confirm, { askConfirm } from "./Confirm";
import { useEffect, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Shapes,
  Wallet,
  CalendarDays,
  ChartNoAxesCombined,
  Settings,
  Database,
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  Download,
  Upload,
  Leaf,
  ShieldCheck,
  PanelLeftClose,
  Sparkles,
  Trash2,
  Pencil,
  Copy,
  Check,
  Target,
  CreditCard,
  Coins,
  BedDouble,
  Shirt,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  db,
  initialize,
  readState,
  saveTransaction,
  backupData,
  parseBackup,
  restore,
  loadDemo,
} from "./db";
import {
  type State,
  type Transaction,
  type Account,
  type Category,
  type Period,
  type Budget,
  type Goal,
  uid,
  today,
  money,
  thaiDate,
  satang,
  balance,
  summary,
  isLiability,
  descendantIds,
  categorySpend,
  periodWarnings,
  nextPeriod,
} from "./domain";
import Pixel, { icons } from "./Pixel";
const nav = [
  ["dashboard", "ภาพรวม", LayoutDashboard],
  ["transactions", "รายการธุรกรรม", ArrowRightLeft],
  ["categories", "หมวดหมู่", Shapes],
  ["accounts", "บัญชีของฉัน", Wallet],
  ["periods", "รอบบัญชี", CalendarDays],
  ["budgets", "งบประมาณ", Target],
  ["reports", "วิเคราะห์รายจ่าย", ChartNoAxesCombined],
  ["savings", "เงินออม", Coins],
  ["debts", "หนี้สิน / บัตรเครดิต", CreditCard],
  ["backup", "สำรองข้อมูล", Database],
  ["room", "ห้องของยูอิ", BedDouble],
  ["wardrobe", "แต่งตัว", Shirt],
  ["settings", "ตั้งค่า", Settings],
] as const;
const kindLabels: Record<string, string> = {
  income: "รายรับ",
  expense: "รายจ่าย",
  transfer: "โอน / จ่ายหนี้",
  adjustment: "ปรับยอด",
  cash: "เงินสด",
  bank: "ธนาคาร",
  wallet: "e-wallet",
  saving: "ออมทรัพย์",
  credit: "บัตรเครดิต",
  debt: "หนี้สิน",
  other: "อื่น ๆ",
};
type Modal =
  | { type: "transaction"; value?: Transaction }
  | { type: "account"; value?: Account }
  | { type: "category"; value?: Category }
  | { type: "period"; value?: Period }
  | { type: "budget"; value?: Budget }
  | { type: "goal"; value?: Goal }
  | null;
const emptyTx = (): Transaction => ({
  id: uid(),
  kind: "expense",
  amount: 0,
  date: today(),
  time: "",
  accountId: "bank",
  toAccountId: "",
  categoryId: "",
  title: "",
  note: "",
  tags: "",
  recurring: false,
  createdAt: new Date().toISOString(),
});
function download(content: string, name: string, type = "application/json") {
  if (window.WitchyNative) {
    window.WitchyNative.exportFile(name, content, type);
    return;
  }
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export default function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [quickAdd, setQuickAdd] = useState(false);
  const [page, setPage] = useState("dashboard"),
    [periodId, setPeriodId] = useState(""),
    [modal, setModal] = useState<Modal>(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState(""),
    [accountFilter, setAccountFilter] = useState(""),
    [categoryFilter, setCategoryFilter] = useState(""),
    [sort, setSort] = useState("desc"),
    [allDates, setAllDates] = useState(false),
    [online, setOnline] = useState(navigator.onLine),
    [ready, setReady] = useState(false),
    [pending, setPending] = useState<State | null>(null);
  useEffect(() => {
    initialize()
      .then(async () => {
        if (window.WitchyNative && !(await db.settings.get("fantasy.state")))
          await db.settings.put({
            id: "fantasy.state",
            value: JSON.stringify({ mode: true }),
          });
        setReady(true);
      })
      .catch((e) => setError("เปิดฐานข้อมูลไม่ได้: " + e.message));
    const on = () => setOnline(navigator.onLine);
    addEventListener("online", on);
    addEventListener("offline", on);
    return () => {
      removeEventListener("online", on);
      removeEventListener("offline", on);
    };
  }, []);
  const liveState = useLiveQuery(() => readState(), [], undefined);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const act = async (
    fn: () => Promise<unknown>,
    message = "บันทึกเรียบร้อยแล้ว",
  ) => {
    try {
      await fn();
      setNotice(message);
      setError("");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  };
  if (!ready || !liveState || !liveState.periods.length)
    return (
      <main className="loading">
        <Pixel name="moon" size={64} />
        <h1>Witchy Ledger</h1>
        <p>{error || "กำลังเปิดสมุดบัญชีของคุณ…"}</p>
      </main>
    );
  const s: State = liveState;
  const profile = getProfile(s.settings);
  const fantasy = readFantasy(s);
  const player = progression(s.transactions);
  const scene =
    s.settings.find((x) => x.id === "appearance.theme")?.value || "academy";
  const p = s.periods.find((x) => x.id === periodId) || s.periods[0];
  const sum = summary(s, p);
  const cat = (id: string) => s.categories.find((c) => c.id === id);
  const acc = (id: string) => s.accounts.find((a) => a.id === id);
  const isDemo = s.settings.some((x) => x.id === "demo");
  const chartCats = s.categories
    .filter((c) => !c.parentId && c.kind === "expense")
    .map((c) => ({ ...c, value: categorySpend(c.id, sum.tx, s.categories) }))
    .filter((c) => c.value > 0);
  const daily = Array.from(new Set(sum.tx.map((t) => t.date)))
    .sort()
    .map((date) => ({
      date: thaiDate(date, true).split(" ").slice(0, 2).join(" "),
      amount:
        sum.tx
          .filter((t) => t.date === date && t.kind === "expense")
          .reduce((n, t) => n + t.amount, 0) / 100,
    }));
  const transactions = (allDates ? s.transactions : sum.tx)
    .filter(
      (t) =>
        (!filter || t.kind === filter) &&
        (!accountFilter ||
          t.accountId === accountFilter ||
          t.toAccountId === accountFilter) &&
        (!categoryFilter ||
          descendantIds(categoryFilter, s.categories).includes(t.categoryId)) &&
        [t.title, t.note, t.tags, cat(t.categoryId)?.name]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "amount"
        ? b.amount - a.amount
        : (sort === "asc" ? 1 : -1) *
          (a.date + a.time + a.createdAt).localeCompare(
            b.date + b.time + b.createdAt,
          ),
    );
  const removeTx = async (t: Transaction) => {
    if (await askConfirm(`ลบ “${t.title}” จำนวน ฿${money(t.amount)}?`))
      void act(() => db.transactions.delete(t.id), "ลบรายการแล้ว");
  };
  function txRows(list: Transaction[]) {
    return list.length ? (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>รายการ</th>
              <th>วันที่</th>
              <th>บัญชี</th>
              <th className="right">จำนวนเงิน</th>
              <th>
                <span className="sr-only">จัดการ</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="tx-name">
                    <span
                      className="pixel-box"
                      style={{ color: cat(t.categoryId)?.color || "#9680bc" }}
                    >
                      <Pixel
                        name={cat(t.categoryId)?.icon || "coin"}
                        size={30}
                      />
                    </span>
                    <span>
                      <strong>{t.title}</strong>
                      <small>
                        {cat(t.categoryId)?.name || kindLabels[t.kind]}
                        {t.recurring ? " · รายการประจำ (บันทึกเอง)" : ""}
                        {t.tags ? " · " + t.tags : ""}
                      </small>
                    </span>
                  </div>
                </td>
                <td className="nowrap">{thaiDate(t.date, true)}</td>
                <td>
                  {acc(t.accountId)?.name}
                  {t.toAccountId && (
                    <small> → {acc(t.toAccountId)?.name}</small>
                  )}
                </td>
                <td
                  className={
                    "amount " +
                    (t.kind === "income"
                      ? "income"
                      : t.kind === "expense"
                        ? "expense"
                        : "muted")
                  }
                >
                  {t.kind === "income" ? "+" : t.kind === "expense" ? "-" : ""}฿
                  {money(t.amount)}
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      aria-label={"แก้ไข " + t.title}
                      onClick={() =>
                        setModal({ type: "transaction", value: t })
                      }
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={"ลบ " + t.title}
                      onClick={() => removeTx(t)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="empty">
        <Pixel name="book" size={54} />
        <h3>สมุดบัญชียังว่างอยู่</h3>
        <p>เริ่มจากรายการเล็ก ๆ ของวันนี้</p>
        <button
          className="soft-button"
          onClick={() => setModal({ type: "transaction" })}
        >
          <Plus size={16} /> เพิ่มรายการแรก
        </button>
      </div>
    );
  }
  function budgetCards() {
    const items = s.budgets.filter((b) => b.periodId === p.id);
    return items.length ? (
      items.map((b) => {
        const c = cat(b.categoryId);
        const spent = categorySpend(b.categoryId, sum.tx, s.categories);
        return (
          <div className="budget-row" key={b.id}>
            <div className="spread">
              <span>
                <i className="dot" style={{ background: c?.color }} />
                {c?.name}
              </span>
              <span>
                <b>฿{money(spent)}</b>
                <small> / {money(b.amount)}</small>
              </span>
            </div>
            <div className="progress">
              <i
                style={{
                  width: Math.min(100, (spent / b.amount) * 100) + "%",
                  background: spent > b.amount ? "#d9719e" : c?.color,
                }}
              />
            </div>
            <div className="spread muted tiny">
              <span>
                {spent > b.amount ? "เกินงบ" : "เหลือ"} ฿
                {money(Math.abs(b.amount - spent))}
              </span>
              <span>{Math.round((spent / b.amount) * 100)}%</span>
              {page === "budgets" && (
                <button
                  className="text-button"
                  onClick={() => setModal({ type: "budget", value: b })}
                >
                  แก้ไข
                </button>
              )}
            </div>
          </div>
        );
      })
    ) : (
      <p className="muted">ยังไม่ได้ตั้งงบสำหรับรอบนี้</p>
    );
  }
  return (
    <div
      className="app-shell"
      data-theme={scene}
      data-palette={
        s.settings.find((x) => x.id === "appearance.palette")?.value ||
        "lavender"
      }
      data-eye={fantasy.eyeColor || "pink"}
      data-fantasy={fantasy.mode ? "on" : "off"}
      onClickCapture={(e) => {
        const target = (e.target as HTMLElement).closest(
          ".nav-item,.hero-picker button,.icon-picker button",
        );
        if (target)
          menuSound(
            target.matches(".hero-picker button") ? "character" : "select",
            fantasy.muted,
          );
      }}
    >
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("dashboard");
          }}
        >
          <img src="/icon.svg" alt="" />
          <span>
            Witchy Ledger<small>YOUR LITTLE MONEY GRIMOIRE</small>
          </span>
        </a>
        <div className="nav-caption">สมุดบัญชีของคุณ</div>
        <nav>
          {nav.map(([id, label, Icon], i) => (
            <button
              key={id}
              className={page === id ? "nav-item active" : "nav-item"}
              onClick={() => setPage(id)}
            >
              {i === 9 && <span />}
              <Icon size={19} />
              {label}
              {page === id && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-moon">
            <Pixel name="moon" size={48} />
            <p>
              ทีละนิด ก็เป็นเวทมนตร์ได้<small>ดูแลเงิน ดูแลตัวเอง</small>
            </p>
          </div>
          <div className="local-label">
            <ShieldCheck size={15} /> ข้อมูลอยู่ในเครื่องของคุณ
          </div>
          <small>Witchy Ledger · v0.5.0-test</small>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button className="mobile-brand" onClick={() => setPage("dashboard")}>
            <img src="/yui-icon.png" alt="" />
            <span>
              Witchy Ledger<small>YOUR LITTLE MONEY GRIMOIRE</small>
            </span>
          </button>
          <div className="top-actions">
            <span className="offline-pill">
              <i />
              {online ? "Local-first" : "ออฟไลน์"}
            </span>
            <button
              className="profile-button"
              aria-label="แก้ไขชื่อเล่นและตัวละคร"
              onClick={() => setShowProfile(true)}
            >
              <span className="profile-nickname">
                {profile.nickname}
                <small>
                  {s.settings.find((x) => x.id === "profile.title")?.value ||
                    player.rank.title}{" "}
                  · LV. {player.level}
                </small>
              </span>
              <span className="avatar character-avatar">
                <Character
                  id={profile.avatar}
                  size={37}
                  rankIndex={player.rankIndex}
                />
              </span>
            </button>
          </div>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">A LITTLE MAGIC, EVERY DAY</span>
              <h1>
                {page === "dashboard"
                  ? "ภาพรวมการเงิน"
                  : nav.find((n) => n[0] === page)?.[1]}{" "}
                <span className="heading-star">✦</span>
              </h1>
              <p>
                {page === "dashboard"
                  ? "ค่อย ๆ ดูแลเงินของคุณ ให้เติบโตไปด้วยกัน"
                  : "ทุกเรื่องการเงิน อยู่ในสมุดเล่มเดียว"}
              </p>
            </div>
            <button
              className="primary"
              onClick={() => setModal({ type: "transaction" })}
            >
              <Plus size={19} /> เพิ่มรายการ
            </button>
          </div>
          {(page === "dashboard" ||
            page === "transactions" ||
            page === "reports" ||
            page === "budgets") && (
            <div className="period-bar">
              <div>
                <span className="period-icon">
                  <CalendarDays size={20} />
                </span>
                <div>
                  <small>รอบบัญชีที่เลือก</small>
                  <select
                    aria-label="เลือกรอบบัญชี"
                    value={p.id}
                    onChange={(e) => setPeriodId(e.target.value)}
                  >
                    {s.periods
                      .slice()
                      .sort((a, b) => b.start.localeCompare(a.start))
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <span className="period-dates">
                {thaiDate(p.start, true)} <span>—</span> {thaiDate(p.end, true)}
              </span>
              <button
                className="text-button"
                onClick={() => setPage("periods")}
              >
                จัดการรอบ <ChevronRight size={15} />
              </button>
            </div>
          )}
          {isDemo && (
            <div className="banner">
              กำลังใช้ข้อมูลตัวอย่าง · ล้างข้อมูลตัวอย่างได้ที่หน้าตั้งค่า
            </div>
          )}
          {page === "dashboard" && (
            <>
              <ProgressBanner
                transactions={s.transactions}
                avatar={profile.avatar}
                open={() => setShowProfile(true)}
              />
              <section className="welcome-strip">
                <div>
                  <span className="welcome-tag">
                    <Sparkles size={14} /> YOUR MONEY, YOUR MAGIC
                  </span>
                  <h2>ให้ทุกการบันทึก เป็นจุดเริ่มต้นที่ดี</h2>
                  <p>รายรับ รายจ่าย และเป้าหมายเล็ก ๆ ในทุกวัน</p>
                </div>
                <div className="witch-art" aria-hidden="true">
                  <span className="spark s1">✧</span>
                  <span className="spark s2">✦</span>
                  <Pixel name="moon" size={52} />
                  <Pixel name="potion" size={76} />
                  <Pixel name="flower" size={58} />
                  <span className="art-shelf" />
                </div>
              </section>
              <div className="stats-grid">
                <article className="stat-card balance-card">
                  <div className="spread">
                    <span>เงินคงเหลือจริงสะสม</span>
                    <Wallet size={19} />
                  </div>
                  <h2>฿{money(sum.actual)}</h2>
                  <small>ยอดทุกบัญชีเงิน ณ วันสิ้นสุดรอบ</small>
                  <span className="stat-decoration">✧</span>
                </article>
                <article className="stat-card">
                  <div className="spread">
                    <span>รายรับรอบนี้</span>
                    <span className="stat-icon green">
                      <ArrowDownRight size={18} />
                    </span>
                  </div>
                  <h2 className="income">฿{money(sum.income)}</h2>
                  <small>เฉพาะวันที่ในรอบบัญชี</small>
                </article>
                <article className="stat-card">
                  <div className="spread">
                    <span>รายจ่ายรอบนี้</span>
                    <span className="stat-icon pink">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                  <h2 className="expense">฿{money(sum.expense)}</h2>
                  <small>รวมยอดซื้อผ่านบัตรเครดิต</small>
                </article>
                <article className="stat-card">
                  <div className="spread">
                    <span>ยอดสุทธิของรอบ</span>
                    <span className="stat-icon purple">
                      <ArrowRightLeft size={18} />
                    </span>
                  </div>
                  <h2>฿{money(sum.flow)}</h2>
                  <small>รายรับ − รายจ่ายเฉพาะรอบ</small>
                </article>
              </div>
            </>
          )}
          {(page === "dashboard" || page === "reports") && (
            <>
              <div className="charts-grid">
                <section className="card">
                  <div className="card-heading">
                    <h3>รายจ่ายแยกตามหมวดหมู่</h3>
                    <span className="tag">รอบนี้</span>
                  </div>
                  {chartCats.length ? (
                    <div className="donut-layout">
                      <div className="donut">
                        <ResponsiveContainer width="100%" height={210}>
                          <PieChart>
                            <Pie
                              data={chartCats}
                              dataKey="value"
                              innerRadius={69}
                              outerRadius={88}
                              paddingAngle={4}
                              stroke="none"
                            >
                              {chartCats.map((c) => (
                                <Cell key={c.id} fill={c.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(v) => "฿" + money(Number(v))}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center">
                          <small>รายจ่ายทั้งหมด</small>
                          <b>฿{money(sum.expense)}</b>
                        </div>
                      </div>
                      <div className="legend">
                        {chartCats.map((c) => (
                          <div key={c.id}>
                            <span>
                              <i
                                className="dot"
                                style={{ background: c.color }}
                              />
                              {c.name}
                            </span>
                            <b>{Math.round((c.value / sum.expense) * 100)}%</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="chart-empty">
                      <div className="empty-donut">
                        <Pixel name="crystal" size={44} />
                      </div>
                      <p>กราฟจะปรากฏเมื่อมีรายจ่ายในรอบนี้</p>
                    </div>
                  )}
                </section>
                <section className="card">
                  <div className="card-heading">
                    <h3>จังหวะการใช้จ่าย</h3>
                    <span className="tag">รายวัน · บาท</span>
                  </div>
                  {daily.length ? (
                    <ResponsiveContainer width="100%" height={225}>
                      <AreaChart
                        data={daily}
                        margin={{ top: 25, right: 8, left: -22, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="0%"
                              stopColor="#aa95d3"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="100%"
                              stopColor="#aa95d3"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="4 5"
                          vertical={false}
                          stroke="#eee9f3"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#99909e" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#99909e" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(v) => "฿" + money(Number(v) * 100)}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          name="รายจ่าย"
                          stroke="#a28aca"
                          fill="url(#area)"
                          strokeWidth={2.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-empty">
                      <ChartNoAxesCombined size={46} />
                      <p>เริ่มบันทึกเพื่อเห็นจังหวะการใช้จ่ายของคุณ</p>
                    </div>
                  )}
                </section>
              </div>
              <div className="lower-grid">
                <section className="card">
                  <div className="card-heading">
                    <h3>ดูแลงบประมาณ</h3>
                    <button
                      className="text-button"
                      onClick={() => setPage("budgets")}
                    >
                      ดูทั้งหมด <ChevronRight size={14} />
                    </button>
                  </div>
                  {budgetCards()}
                  <button
                    className="text-button"
                    onClick={() => setModal({ type: "budget" })}
                  >
                    <Plus size={14} /> ตั้งงบประมาณ
                  </button>
                </section>
                <section className="card goals-summary">
                  <div className="card-heading">
                    <h3>เติบโตทีละนิด</h3>
                    <Leaf size={18} />
                  </div>
                  <div className="summary-item">
                    <span className="pixel-box blue">
                      <Pixel name="chest" />
                    </span>
                    <div>
                      <small>เงินออมสะสม ณ สิ้นรอบ</small>
                      <h2>
                        ฿
                        {money(
                          s.accounts
                            .filter((a) => a.kind === "saving")
                            .reduce(
                              (n, a) => n + balance(a, s.transactions, p.end),
                              0,
                            ),
                        )}
                      </h2>
                    </div>
                    <button
                      aria-label="ดูเงินออม"
                      className="icon-button"
                      onClick={() => setPage("savings")}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="summary-item">
                    <span className="pixel-box">
                      <Pixel name="crystal" />
                    </span>
                    <div>
                      <small>หนี้สิน / บัตรเครดิต ณ สิ้นรอบ</small>
                      <h2>฿{money(sum.debt)}</h2>
                    </div>
                    <button
                      aria-label="ดูหนี้สิน"
                      className="icon-button"
                      onClick={() => setPage("debts")}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <p className="gentle-note">ทุกก้าวเล็ก ๆ มีความหมายเสมอ ✧</p>
                </section>
              </div>
              {page === "reports" && (
                <section className="card">
                  <h3>เปรียบเทียบรอบบัญชี</h3>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>รอบ</th>
                          <th>รายรับ</th>
                          <th>รายจ่าย</th>
                          <th>สุทธิ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.periods.map((x) => {
                          const z = summary(s, x);
                          return (
                            <tr key={x.id}>
                              <td>{x.name}</td>
                              <td className="income">฿{money(z.income)}</td>
                              <td className="expense">฿{money(z.expense)}</td>
                              <td>฿{money(z.flow)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
          {(page === "dashboard" || page === "transactions") && (
            <section className="card transactions-card">
              <div className="card-heading">
                <h3>
                  {page === "dashboard" ? "รายการล่าสุด" : "รายการธุรกรรม"}{" "}
                  <span className="count">
                    {page === "dashboard" ? sum.tx.length : transactions.length}
                  </span>
                </h3>
                {page === "dashboard" && (
                  <button
                    className="text-button"
                    onClick={() => setPage("transactions")}
                  >
                    ดูทั้งหมด <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {page === "transactions" && (
                <div className="filters">
                  <label className="search">
                    <Search size={17} />
                    <input
                      placeholder="ค้นหาชื่อ หมายเหตุ แท็ก…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <select
                    aria-label="กรองประเภท"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="">ทุกประเภท</option>
                    {["income", "expense", "transfer", "adjustment"].map(
                      (k) => (
                        <option key={k} value={k}>
                          {kindLabels[k]}
                        </option>
                      ),
                    )}
                  </select>
                  <select
                    aria-label="กรองบัญชี"
                    value={accountFilter}
                    onChange={(e) => setAccountFilter(e.target.value)}
                  >
                    <option value="">ทุกบัญชี</option>
                    {s.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="กรองหมวดหมู่"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">ทุกหมวดหมู่</option>
                    {s.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parentId ? "↳ " : ""}
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="เรียงลำดับ"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="desc">ใหม่สุดก่อน</option>
                    <option value="asc">เก่าสุดก่อน</option>
                    <option value="amount">จำนวนมากก่อน</option>
                  </select>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={allDates}
                      onChange={(e) => setAllDates(e.target.checked)}
                    />{" "}
                    ทุกวันที่
                  </label>
                </div>
              )}
              {txRows(
                page === "dashboard"
                  ? sum.tx
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 5)
                  : transactions,
              )}
            </section>
          )}
          {page === "categories" && (
            <>
              <div className="section-intro">
                <p>หมวดหลักและหมวดย่อยอ้างอิงด้วย ID รายการเดิมจึงยังอยู่เมื่อเปลี่ยนชื่อ</p>
                <button
                  className="soft-button"
                  onClick={() => setModal({ type: "category" })}
                >
                  <Plus size={16} /> สร้างหมวดหมู่
                </button>
              </div>
              <div className="entity-grid">
                {s.categories
                  .filter((c) => !c.parentId)
                  .sort((a, b) => a.order - b.order)
                  .map((c) => (
                    <section key={c.id} className="card category-card">
                      <div className="spread">
                        <span className="pixel-box" style={{ color: c.color }}>
                          <Pixel name={c.icon} />
                        </span>
                        <button
                          className="icon-button"
                          aria-label={"แก้ไข " + c.name}
                          onClick={() =>
                            setModal({ type: "category", value: c })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                      <h3>
                        {c.name} {c.archived && <small>(เก็บถาวร)</small>}
                      </h3>
                      <small className="muted">{kindLabels[c.kind]}</small>
                      <div className="child-cats">
                        {s.categories
                          .filter((x) => x.parentId === c.id)
                          .sort((a, b) => a.order - b.order)
                          .map((x) => (
                            <button
                              key={x.id}
                              onClick={() =>
                                setModal({ type: "category", value: x })
                              }
                            >
                              {x.name}
                              {x.archived ? " · เก็บถาวร" : ""}
                              <Pencil size={12} />
                            </button>
                          ))}
                      </div>
                      <button
                        className="text-button"
                        onClick={() =>
                          setModal({
                            type: "category",
                            value: {
                              ...c,
                              id: uid(),
                              name: "",
                              parentId: c.id,
                              order: s.categories.length,
                            },
                          })
                        }
                      >
                        <Plus size={14} /> เพิ่มหมวดย่อย
                      </button>
                    </section>
                  ))}
              </div>
            </>
          )}
          {page === "accounts" && (
            <>
              <div className="section-intro">
                <p>
                  {page === "accounts"
                    ? "ยอดสะสมถึงวันนี้ · ยอดเริ่มต้นใช้เป็นฐานก่อนรายการทั้งหมด"
                    : "ซื้อด้วยบัตร = รายจ่าย · ชำระบิล = โอนจากธนาคารเข้าบัตร"}
                </p>
                <button
                  className="soft-button"
                  onClick={() => setModal({ type: "account" })}
                >
                  <Plus size={16} /> เพิ่มบัญชี
                </button>
              </div>
              <div className="entity-grid">
                {s.accounts.map((a) => (
                  <section className="card account-card" key={a.id}>
                    <div className="spread">
                      <span className="pixel-box" style={{ color: a.color }}>
                        <Pixel name={a.icon} />
                      </span>
                      <span className="tag">{kindLabels[a.kind]}</span>
                    </div>
                    <h3>
                      {a.name} {!a.active && <small>(พักใช้งาน)</small>}
                    </h3>
                    <h2>฿{money(balance(a, s.transactions, today()))}</h2>
                    <small className="muted">
                      {isLiability(a) ? "ยอดหนี้คงค้าง" : "ยอดเงินสะสม"} · THB
                    </small>
                    <div className="card-footer">
                      <button
                        className="text-button"
                        onClick={() => setModal({ type: "account", value: a })}
                      >
                        <Pencil size={14} /> แก้ไข
                      </button>
                      <button
                        className="text-button"
                        onClick={() =>
                          setModal({
                            type: "transaction",
                            value: {
                              ...emptyTx(),
                              accountId: isLiability(a) ? "bank" : a.id,
                              toAccountId: isLiability(a) ? a.id : "",
                              kind: isLiability(a) ? "transfer" : "adjustment",
                              title: isLiability(a)
                                ? "ชำระ " + a.name
                                : "ปรับยอด " + a.name,
                            },
                          })
                        }
                      >
                        {isLiability(a) ? "ชำระหนี้" : "ปรับยอด"}{" "}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
          {page === "debts" && <Debts s={s} act={act} />}
          {page === "periods" && (
            <>
              <div className="section-intro">
                <p>เลือกรอบเงินเดือน เดือนปฏิทิน หรือกำหนดวันเอง · วันที่แสดงเป็น พ.ศ.</p>
                <button
                  className="soft-button"
                  onClick={() => setModal({ type: "period" })}
                >
                  <Plus size={16} /> สร้างรอบบัญชี
                </button>
              </div>
              <div className="entity-grid">
                {s.periods
                  .slice()
                  .sort((a, b) => b.start.localeCompare(a.start))
                  .map((x) => (
                    <section className="card" key={x.id}>
                      <div className="spread">
                        <CalendarDays className="muted" />
                        <span className="tag">
                          {x.kind === "salary"
                            ? "รอบเงินเดือน"
                            : x.kind === "calendar"
                              ? "เดือนปฏิทิน"
                              : "กำหนดเอง"}
                        </span>
                      </div>
                      <h3>{x.name}</h3>
                      <p>
                        {thaiDate(x.start, true)} — {thaiDate(x.end, true)}
                      </p>
                      {periodWarnings(x, s.periods).map((w) => (
                        <small className="warning" key={w}>
                          {w}
                        </small>
                      ))}
                      <div className="card-footer">
                        <button
                          className="text-button"
                          onClick={() => setModal({ type: "period", value: x })}
                        >
                          <Pencil size={14} /> แก้ไข
                        </button>
                        <button
                          className="text-button"
                          onClick={() =>
                            setModal({ type: "period", value: nextPeriod(x) })
                          }
                        >
                          <Copy size={14} /> รอบถัดไป
                        </button>
                      </div>
                    </section>
                  ))}
              </div>
            </>
          )}
          {page === "budgets" && (
            <section className="card">
              <div className="card-heading">
                <h3>งบประมาณของ {p.name}</h3>
                <button
                  className="soft-button"
                  onClick={() => setModal({ type: "budget" })}
                >
                  <Plus size={16} /> ตั้งงบ
                </button>
              </div>
              {budgetCards()}
              <p className="info-note">
                งบหมวดหลักรวมรายการของหมวดย่อย หากตั้งทั้งสองระดับ จะใช้เปรียบเทียบแยกกัน
              </p>
            </section>
          )}
          {page === "savings" && (
            <>
              <div className="section-intro">
                <p>เป้าหมายผูกกับยอดบัญชีออมทรัพย์ · โอนเงินเพื่อออมโดยไม่เพิ่มรายจ่าย</p>
                <button
                  className="soft-button"
                  onClick={() => setModal({ type: "goal" })}
                >
                  <Plus size={16} /> เพิ่มเป้าหมาย
                </button>
              </div>
              <div className="entity-grid">
                {s.goals.map((g) => {
                  const value = balance(
                    acc(g.accountId)!,
                    s.transactions,
                    today(),
                  );
                  return (
                    <section className="card" key={g.id}>
                      <div className="spread">
                        <Pixel name="chest" size={48} />
                        <button
                          className="icon-button"
                          aria-label={"แก้ไข " + g.name}
                          onClick={() => setModal({ type: "goal", value: g })}
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                      <h3>{g.name}</h3>
                      <h2>฿{money(value)}</h2>
                      <p className="muted">จากเป้าหมาย ฿{money(g.target)}</p>
                      <div className="progress">
                        <i
                          style={{
                            width:
                              Math.max(
                                0,
                                Math.min(100, (value / g.target) * 100),
                              ) + "%",
                          }}
                        />
                      </div>
                      <small>
                        เหลืออีก ฿{money(Math.max(0, g.target - value))} ·{" "}
                        {Math.round((value / g.target) * 100)}%
                      </small>
                      <p className="muted tiny">
                        {acc(g.accountId)?.name} ·
                        เป้าหมายที่ใช้บัญชีเดียวกันจะแสดงยอดเดียวกัน
                      </p>
                    </section>
                  );
                })}
              </div>
              {!s.goals.length && (
                <div className="card empty">
                  <Pixel name="flower" size={70} />
                  <h3>ปลูกเป้าหมายเล็ก ๆ ของคุณ</h3>
                  <p>สร้างบัญชีประเภทออมทรัพย์ แล้วเริ่มต้นเป้าหมายแรก</p>
                  <button
                    className="soft-button"
                    onClick={() => setModal({ type: "account" })}
                  >
                    สร้างบัญชีออมทรัพย์
                  </button>
                </div>
              )}
            </>
          )}
          {page === "backup" && (
            <div className="backup-grid">
              <section className="card">
                <span className="pixel-box">
                  <Pixel name="book" />
                </span>
                <h3>สำรองสมุดบัญชี</h3>
                <p className="muted">
                  ดาวน์โหลด JSON รวมบัญชี หมวดหมู่ รายการ รอบ งบประมาณ และเป้าหมาย
                </p>
                <button
                  className="primary"
                  onClick={async () => {
                    download(
                      backupData(s),
                      "witchy-ledger-" + today() + ".json",
                    );
                    setNotice("ดาวน์โหลดข้อมูลสำรองแล้ว");
                  }}
                >
                  <Download size={17} /> สำรองข้อมูลทั้งหมด
                </button>
                <hr />
                <h3>ส่งออกรายการ CSV</h3>
                <p className="muted">รายการทั้งหมด เปิดอ่านในโปรแกรมตารางคำนวณได้</p>
                <button
                  className="soft-button"
                  onClick={async () => {
                    const rows = [
                      [
                        "ID",
                        "วันที่",
                        "ประเภท",
                        "ชื่อรายการ",
                        "จำนวนบาท",
                        "บัญชี",
                        "บัญชีปลายทาง",
                        "หมวดหมู่",
                        "หมายเหตุ",
                        "แท็ก",
                      ],
                      ...s.transactions.map((t) => [
                        t.id,
                        t.date,
                        kindLabels[t.kind],
                        t.title,
                        (t.amount / 100).toFixed(2),
                        acc(t.accountId)?.name || "",
                        acc(t.toAccountId)?.name || "",
                        cat(t.categoryId)?.name || "",
                        t.note,
                        t.tags,
                      ]),
                    ];
                    const csv = rows
                      .map((row) =>
                        row
                          .map(
                            (v) =>
                              '"' +
                              String(v)
                                .replace(/^[=+@\-\t\r]/, "'$&")
                                .replaceAll('"', '""') +
                              '"',
                          )
                          .join(","),
                      )
                      .join("\r\n");
                    download(
                      "\uFEFF" + csv,
                      "witchy-transactions-" + today() + ".csv",
                      "text/csv;charset=utf-8",
                    );
                  }}
                >
                  <Download size={17} /> ส่งออก CSV
                </button>
              </section>
              <section className="card">
                <span className="pixel-box">
                  <Pixel name="potion" />
                </span>
                <h3>กู้คืนจากไฟล์สำรอง</h3>
                <p className="muted">
                  ตรวจไฟล์และแสดงจำนวนข้อมูลก่อนแทนที่ข้อมูลปัจจุบัน กรุณาสำรองข้อมูลเดิมก่อน
                </p>
                <label className="upload-box">
                  <Upload size={24} />
                  <b>เลือกไฟล์สำรอง .json</b>
                  <small>ประมวลผลในเครื่องเท่านั้น</small>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        if (file.size > 20 * 1024 * 1024)
                          throw Error("ไฟล์ต้องไม่เกิน 20 MB");
                        setPending(parseBackup(await file.text()));
                      } catch (err) {
                        setError((err as Error).message);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                {pending && (
                  <div className="restore-preview">
                    <h4>พร้อมกู้คืน</h4>
                    <p>
                      {pending.accounts.length} บัญชี ·{" "}
                      {pending.transactions.length} รายการ ·{" "}
                      {pending.periods.length} รอบ
                    </p>
                    <button
                      className="primary"
                      onClick={async () => {
                        if (await askConfirm("แทนที่ข้อมูลปัจจุบันทั้งหมดด้วยไฟล์นี้?"))
                          void act(async () => {
                            await restore(pending);
                            setPending(null);
                            setPeriodId("");
                          }, "กู้คืนข้อมูลแล้ว");
                      }}
                    >
                      ยืนยันแทนที่ข้อมูล
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setPending(null)}
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
                <p className="info-note">
                  ยังไม่มีไฟล์ income_expense_ledger.xlsx ใน workspace
                  กรุณาแนบไฟล์เมื่อต้องการพัฒนาและตรวจ mapping สำหรับนำเข้า Excel ใน
                  Phase 3
                </p>
              </section>
            </div>
          )}
          {page === "settings" && (
            <section className="card settings-card">
              <FantasySettings s={s} />
              <h3>สมุดบัญชีที่เป็นของคุณ</h3>
              <button
                className="soft-button"
                onClick={() => setShowProfile(true)}
              >
                <Character id={profile.avatar} size={35} /> {profile.nickname} ·
                แก้ไขตัวละครและชื่อเล่น
              </button>
              <p>
                <ShieldCheck size={18} /> เก็บข้อมูลใน IndexedDB ของเบราว์เซอร์นี้
                ไม่มีระบบล็อกอิน ไม่มี telemetry และไม่มี cloud sync
              </p>
              <p>ฟอนต์ Sarabun ถูกติดตั้งมากับแอป ไม่ดึงจาก CDN</p>
              <p>
                หากล้างข้อมูลเว็บไซต์ ข้อมูลอาจหาย ก่อนย้ายเครื่องให้สำรอง JSON
                ข้อมูลบนคอมและมือถือยังไม่ซิงก์อัตโนมัติ
              </p>
              <p>
                ใช้งานออฟไลน์ได้หลังเปิดแอปฉบับ build ผ่าน localhost ครั้งแรกและแคชเสร็จ
                โดยใช้ browser และ URL เดิม
              </p>
              <hr />
              <h3>ทดลองใช้งาน</h3>
              <p className="muted">
                เริ่มต้นด้วยข้อมูลว่าง คุณเลือกใส่ข้อมูลตัวอย่างเพื่อทดลอง Dashboard ได้
              </p>
              <button
                className="soft-button"
                disabled={s.transactions.length > 0}
                onClick={() => void act(() => loadDemo(), "เพิ่มข้อมูลตัวอย่างแล้ว")}
              >
                <Sparkles size={17} /> เพิ่มข้อมูลตัวอย่าง
              </button>
              {isDemo && (
                <button
                  className="danger-button"
                  onClick={async () => {
                    if (
                      await askConfirm(
                        "ล้างรายการ งบประมาณ และยอดเริ่มต้นทั้งหมดในชุดทดลอง? หากเพิ่มข้อมูลจริงแล้ว กรุณาสำรองก่อน",
                      )
                    )
                      void act(async () => {
                        await db.transaction(
                          "rw",
                          db.transactions,
                          db.budgets,
                          db.accounts,
                          db.settings,
                          async () => {
                            await db.transactions.clear();
                            await db.budgets.clear();
                            await db.accounts
                              .toCollection()
                              .modify({ opening: 0 });
                            await db.settings.delete("demo");
                          },
                        );
                      }, "ล้างข้อมูลตัวอย่างแล้ว");
                  }}
                >
                  ล้างชุดข้อมูลทดลอง
                </button>
              )}
              <hr />
              <h3>สถานะการพัฒนา</h3>
              <p>Phase 1 พร้อมทดลองใช้ พร้อมงบประมาณและเป้าหมายออมเบื้องต้น</p>
              <p className="muted">
                รายการประจำเป็นเครื่องหมายกำกับ ยังไม่สร้างรายการให้อัตโนมัติ ส่วน parser
                ภาษาไทย นำเข้า/ส่งออก Excel ใบแจ้งยอดบัตร และแยกเงินต้น/ดอกเบี้ย
                อยู่ในระยะถัดไป
              </p>
            </section>
          )}
          {(page === "room" || page === "wardrobe") && (
            <FantasyRoom s={s} wardrobe={page === "wardrobe"} />
          )}
          <footer className="main-footer">
            <span>
              <ShieldCheck size={13} /> เก็บไว้ในเครื่อง เป็นส่วนตัวเสมอ
            </span>
            <span>
              Made with a little magic <span className="heading-star">✦</span>
            </span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav refreshed-nav">
        <button
          onClick={() => setPage("dashboard")}
          className={page === "dashboard" ? "active" : ""}
        >
          <LayoutDashboard size={21} />
          <span>หน้าหลัก</span>
        </button>
        <button onClick={() => setPage("transactions")}>
          <ArrowRightLeft size={21} />
          <span>รายการ</span>
        </button>
        <button
          className="central-add"
          aria-label={quickAdd ? "ปิดเพิ่มรายการ" : "เพิ่มรายรับหรือรายจ่าย"}
          aria-expanded={quickAdd}
          onClick={() => {
            setQuickAdd(!quickAdd);
            menuSound("equip", fantasy.muted);
          }}
        >
          <Plus
            size={30}
            style={{ transform: quickAdd ? "rotate(45deg)" : "" }}
          />
        </button>
        <button onClick={() => setPage("room")}>
          <BedDouble size={21} />
          <span>ห้องยูอิ</span>
        </button>
        <select
          aria-label="เมนูเพิ่มเติม"
          value=""
          onChange={(e) => e.target.value && setPage(e.target.value)}
        >
          <option value="">เพิ่มเติม</option>
          {nav
            .filter(
              (n) => !["dashboard", "transactions", "room"].includes(n[0]),
            )
            .map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
        </select>
      </nav>
      {quickAdd && <QuickMenu close={()=>setQuickAdd(false)} choose={(kind,id,amount)=>{
        setQuickAdd(false);
        const category=s.categories.find(c=>c.id===id && !c.archived);
        const account=s.accounts.find(a=>a.active && a.id==="cash") || s.accounts.find(a=>a.active);
        const t={...emptyTx(),kind,categoryId:category?.id||"",accountId:account?.id||"",amount:(amount||0)*100};
        menuSound("equip",fantasy.muted);
        if(amount && category && account) void act(()=>saveTransaction({...t,title:category.name,tags:"#"+category.name,time:new Date().toTimeString().slice(0,5)}),"บันทึก "+category.name+" "+amount+" บาทแล้ว");
        else setModal({type:"transaction",value:t});
      }}/>}
      {showProfile && (
        <Profile
          settings={s.settings}
          transactions={s.transactions}
          close={() => setShowProfile(false)}
          act={act}
        />
      )}
      {page === "dashboard" && <CompanionWidget s={s} />}
      <Confirm />
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
      {error && (
        <div className="error-toast" role="alert">
          {error}
          <button
            className="icon-button"
            aria-label="ปิดข้อความผิดพลาด"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
      {modal && (
        <Editor
          key={modal.type + (modal.value?.id || "new")}
          modal={modal}
          s={s}
          period={p}
          close={() => setModal(null)}
          act={act}
        />
      )}
    </div>
  );
}

function Editor({
  modal,
  s,
  period,
  close,
  act,
}: {
  modal: NonNullable<Modal>;
  s: State;
  period: Period;
  close: () => void;
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState(
    modal.type === "transaction"
      ? modal.value?.kind || "expense"
      : modal.type === "category"
        ? modal.value?.kind || "expense"
        : "",
  );
  const [parentId, setParentId] = useState(
    modal.type === "category" ? modal.value?.parentId || "" : "",
  );
  const [icon, setIcon] = useState(
    modal.value && "icon" in modal.value ? modal.value.icon : "potion",
  );
  const [warning, setWarning] = useState("");
  const tx = modal.type === "transaction" ? modal.value : undefined;
  const [mainCat, setMainCat] = useState(
    tx?.categoryId
      ? s.categories.find((c) => c.id === tx.categoryId)?.parentId ||
          tx.categoryId
      : "",
  );
  const [subCat, setSubCat] = useState(tx?.categoryId || "");
  const [accountKind, setAccountKind] = useState(
    modal.type === "account" ? modal.value?.kind || "bank" : "bank",
  );
  const categoryName=s.categories.find(c=>c.id===(subCat||mainCat))?.name || "";
  const formId = "editor-form";
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const elements = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"] button:not(:disabled),[role="dialog"] input,[role="dialog"] select,[role="dialog"] textarea',
          ),
        ).filter((el) => el.offsetParent !== null);
        const first = elements[0],
          last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    addEventListener("keydown", on);
    setTimeout(
      () =>
        document.querySelector<HTMLElement>('[role="dialog"] input')?.focus(),
      30,
    );
    return () => {
      document.body.style.overflow = old;
      removeEventListener("keydown", on);
      previous?.focus();
    };
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const str = (k: string) => String(f.get(k) || "").trim();
    const result = await act(async () => {
      if (modal.type === "transaction") {
        const t: Transaction = {
          ...(tx || emptyTx()),
          kind: kind as Transaction["kind"],
          amount: satang(str("amount")),
          title: str("note").slice(0,200) || tx?.title || categoryName || "รายการบัญชี",
          date: str("date"),
          time: tx?.time || new Date().toTimeString().slice(0,5),
          accountId: str("accountId"),
          toAccountId: kind === "transfer" ? str("toAccountId") : "",
          categoryId: ["income", "expense"].includes(kind)
            ? subCat || mainCat
            : "",
          note: str("note"),
          tags: Array.from(new Set([...(tx?.tags||"").split(" "),categoryName?"#"+categoryName:""].filter(Boolean))).join(" "),
          recurring: f.has("recurring"),
        };
        await saveTransaction(t);
      }
      if (modal.type === "account") {
        const a: Account = {
          ...modal.value,
          id: modal.value?.id || uid(),
          name: str("name"),
          kind: accountKind as Account["kind"],
          opening: satang(str("opening")),
          color: str("color"),
          icon,
          active: f.has("active"),
          currency: "THB",
        };
        if (a.opening < 0) throw Error("ยอดเริ่มต้นต้องไม่ติดลบ");
        if (
          modal.value &&
          s.transactions.some(
            (t) => t.accountId === a.id || t.toAccountId === a.id,
          ) &&
          (modal.value.opening !== a.opening || modal.value.kind !== a.kind)
        )
          throw Error("บัญชีมีรายการแล้ว กรุณาใช้การปรับยอดเพื่อเก็บประวัติ");
        await db.accounts.put(a);
      }
      if (modal.type === "category") {
        const id = modal.value?.id || uid();
        if (parentId && s.categories.some((c) => c.parentId === id))
          throw Error(
            "กรุณาย้ายหมวดย่อยออกก่อน เพื่อรักษาโครงสร้างหมวดหลัก/หมวดย่อยสองระดับ",
          );
        if (parentId && descendantIds(id, s.categories).includes(parentId))
          throw Error("ไม่สามารถย้ายหมวดเข้าไปในตัวเองหรือหมวดย่อยได้");
        if (
          modal.value &&
          modal.value.kind !== kind &&
          s.transactions.some((t) =>
            descendantIds(id, s.categories).includes(t.categoryId),
          )
        )
          throw Error("หมวดที่มีรายการแล้วเปลี่ยนประเภทรายรับ/รายจ่ายไม่ได้");
        const c: Category = {
          id,
          name: str("name"),
          kind: kind as Category["kind"],
          parentId,
          icon,
          color: str("color"),
          order: Number(str("order")),
          archived: f.has("archived"),
        };
        await db.transaction("rw", db.categories, async () => {
          await db.categories.put(c);
          const children = descendantIds(id, s.categories).filter(
            (x) => x !== id,
          );
          for (const child of children)
            await db.categories.update(child, { kind: c.kind });
        });
      }
      if (modal.type === "period") {
        const p: Period = {
          id: modal.value?.id || uid(),
          name: str("name"),
          start: str("start"),
          end: str("end"),
          kind: str("periodKind") as Period["kind"],
        };
        if (p.start > p.end) throw Error("วันสิ้นสุดต้องไม่อยู่ก่อนวันเริ่ม");
        if (
          p.kind === "calendar" &&
          (p.start.slice(8) !== "01" ||
            p.start.slice(0, 7) !== p.end.slice(0, 7) ||
            new Date(
              Date.parse(p.end + "T00:00:00Z") + 86400000,
            ).getUTCDate() !== 1)
        )
          throw Error("เดือนปฏิทินต้องเริ่มวันที่ 1 และจบวันสุดท้ายของเดือนเดียวกัน");
        const warnings = periodWarnings(p, s.periods);
        if (
          warnings.length &&
          !(await askConfirm(warnings.join("\n") + "\nต้องการบันทึกรอบนี้หรือไม่?"))
        )
          throw Error("ยกเลิกการบันทึกรอบ");
        await db.periods.put(p);
      }
      if (modal.type === "budget") {
        const amount = satang(str("amount"));
        if (amount <= 0) throw Error("งบต้องมากกว่า 0");
        const categoryId = str("categoryId");
        if (
          s.budgets.some(
            (b) =>
              b.periodId === period.id &&
              b.categoryId === categoryId &&
              b.id !== modal.value?.id,
          )
        )
          throw Error("มีงบหมวดนี้ในรอบแล้ว กรุณาแก้ไขงบเดิม");
        await db.budgets.put({
          id: modal.value?.id || uid(),
          periodId: period.id,
          categoryId,
          amount,
        });
      }
      if (modal.type === "goal") {
        const target = satang(str("target"));
        if (target <= 0) throw Error("เป้าหมายต้องมากกว่า 0");
        if (!str("accountId")) throw Error("กรุณาสร้างบัญชีออมทรัพย์ก่อน");
        await db.goals.put({
          id: modal.value?.id || uid(),
          name: str("name"),
          accountId: str("accountId"),
          target,
        });
      }
    });
    setBusy(false);
    if (result) close();
  }
  const title = {
    transaction:
      tx && s.transactions.some((t) => t.id === tx.id)
        ? "แก้ไขรายการ"
        : "บันทึกเรื่องราวการเงิน",
    account: modal.value ? "แก้ไขบัญชี" : "เพิ่มบัญชีของฉัน",
    category: modal.value ? "แก้ไขหมวดหมู่" : "สร้างหมวดหมู่",
    period: modal.value ? "แก้ไข / สร้างรอบถัดไป" : "สร้างรอบบัญชี",
    budget: "ตั้งงบประมาณ",
    goal: "เป้าหมายเงินออม",
  }[modal.type];
  const accountOptions = (to = false) =>
    s.accounts
      .filter(
        (a) => a.active || a.id === tx?.accountId || a.id === tx?.toAccountId,
      )
      .filter((a) => to || kind !== "transfer" || !isLiability(a))
      .map((a) => (
        <option key={a.id} value={a.id}>
          {a.name} · {kindLabels[a.kind]}
        </option>
      ));
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) close();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        <header>
          <div>
            <span className="eyebrow">A NEW PAGE IN YOUR GRIMOIRE</span>
            <h2 id="editor-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            aria-label="ปิดแบบฟอร์ม"
            onClick={close}
          >
            <X size={21} />
          </button>
        </header>
        <form id={formId} onSubmit={submit}>
          {modal.type === "transaction" && (
            <>
              <div className="type-tabs">
                {["expense", "income", "transfer", "adjustment"].map((k) => (
                  <button
                    type="button"
                    key={k}
                    className={kind === k ? "selected" : ""}
                    onClick={async () => {
                      setKind(k);
                      setMainCat("");
                      setSubCat("");
                    }}
                  >
                    {kindLabels[k]}
                  </button>
                ))}
              </div>
              <label className="amount-field">
                จำนวนเงิน (บาท)
                <div>
                  <span>฿</span>
                  <input
                    name="amount"
                    inputMode={kind==="adjustment"?"decimal":"numeric"}
                    required
                    placeholder="0"
                    defaultValue={tx?.amount ? String(tx.amount / 100) : ""}
                  />
                </div>
              </label>
              {kind === "adjustment" && (
                <p className="info-note">
                  กรอกผลต่างที่ต้องการเพิ่มหรือลด เช่น -100.00 เพื่อลดยอด 100 บาท
                  การปรับยอดเก็บเป็นรายการและไม่รวมรายรับ/รายจ่าย สำหรับบัญชีหนี้
                  เครื่องหมายบวกคือเพิ่มหนี้
                </p>
              )}
              {kind==="expense" && categoryName && <div className="suggested-prices">ราคาแนะนำ {(categoryName.includes("กาแฟ")?[20,25,30]:categoryName.includes("น้ำมัน")?[120,300,500]:[40,45,50]).map(n=><button key={n} type="button" onClick={e=>{const input=e.currentTarget.form?.elements.namedItem("amount") as HTMLInputElement;if(input)input.value=String(n)}}>{n}</button>)}</div>}
              <div className="form-grid">
                <label>
                  วันที่
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={tx?.date || today()}
                  />
                </label>
              </div>
              {["income", "expense"].includes(kind) && (
                <div className="form-grid">
                  <label>
                    หมวดหลัก
                    <select
                      required
                      value={mainCat}
                      onChange={(e) => {
                        setMainCat(e.target.value);
                        setSubCat("");
                      }}
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {s.categories
                        .filter(
                          (c) =>
                            !c.parentId &&
                            c.kind === kind &&
                            (!c.archived || c.id === mainCat),
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    หมวดย่อย
                    <select
                      value={subCat}
                      onChange={(e) => setSubCat(e.target.value)}
                    >
                      <option value="">ใช้หมวดหลัก</option>
                      {s.categories
                        .filter(
                          (c) =>
                            !!mainCat &&
                            c.parentId === mainCat &&
                            (!c.archived || c.id === subCat),
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              )}
              <div className="form-grid">
                <fieldset className="account-orbs"><legend>{kind==="transfer"?"บัญชีต้นทาง":"บัญชี"}</legend>{accountOptions().map(o=><label key={o.key}><input type="radio" required name="accountId" value={o.props.value} defaultChecked={o.props.value===(tx?.accountId||"bank")}/><span>{s.accounts.find(a=>a.id===o.props.value)?.name}</span></label>)}</fieldset>
                {kind === "transfer" && (
                  <label>
                    บัญชีปลายทาง
                    <select
                      name="toAccountId"
                      required
                      defaultValue={tx?.toAccountId}
                    >
                      <option value="">เลือกบัญชี</option>
                      {accountOptions(true)}
                    </select>
                  </label>
                )}
              </div>
              {kind === "transfer" && (
                <p className="info-note">
                  การโอนเข้าบัญชีออมทรัพย์หรือชำระบัตร/หนี้ ไม่ถือเป็นรายจ่ายใหม่
                </p>
              )}
              <label>
                หมายเหตุ
                <textarea
                  name="note"
                  rows={2}
                  defaultValue={tx?.note}
                  placeholder="รายละเอียดเพิ่มเติม…"
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  name="recurring"
                  defaultChecked={tx?.recurring}
                />{" "}
                ทำเครื่องหมายรายการประจำ (ยังไม่บันทึกซ้ำอัตโนมัติ)
              </label>
              <small className="muted">
                รองรับการพิมพ์และพูดผ่านไมค์ของคีย์บอร์ดมือถือ
              </small>
            </>
          )}
          {modal.type === "account" && (
            <>
              <label>
                ชื่อบัญชี
                <input
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={modal.value?.name}
                />
              </label>
              <label>
                ประเภท
                <select
                  value={accountKind}
                  onChange={(e) =>
                    setAccountKind(e.target.value as Account["kind"])
                  }
                  disabled={
                    !!modal.value &&
                    s.transactions.some(
                      (t) =>
                        t.accountId === modal.value!.id ||
                        t.toAccountId === modal.value!.id,
                    )
                  }
                >
                  {[
                    "cash",
                    "bank",
                    "wallet",
                    "saving",
                    "credit",
                    "debt",
                    "other",
                  ].map((k) => (
                    <option key={k} value={k}>
                      {kindLabels[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                ยอดเริ่มต้น (บาท)
                {["credit", "debt"].includes(accountKind) && " · ยอดหนี้เป็นบวก"}
                <input
                  name="opening"
                  inputMode="decimal"
                  required
                  defaultValue={((modal.value?.opening || 0) / 100).toFixed(2)}
                  readOnly={
                    !!modal.value &&
                    s.transactions.some(
                      (t) =>
                        t.accountId === modal.value!.id ||
                        t.toAccountId === modal.value!.id,
                    )
                  }
                />
              </label>
              <p className="muted tiny">
                ยอดเริ่มต้นใช้เป็นฐานก่อนรายการทั้งหมด หากมีรายการแล้วให้ใช้ “ปรับยอด”
                เพื่อเก็บประวัติ
              </p>
              <label className="check">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={modal.value?.active ?? true}
                />{" "}
                เปิดใช้งาน
              </label>
            </>
          )}
          {modal.type === "category" && (
            <>
              <label>
                ชื่อหมวดหมู่
                <input
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={modal.value?.name}
                />
              </label>
              <label>
                ประเภท
                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value);
                    setParentId("");
                  }}
                >
                  <option value="expense">รายจ่าย</option>
                  <option value="income">รายรับ</option>
                </select>
              </label>
              <label>
                อยู่ภายใต้หมวด
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">เป็นหมวดหลัก</option>
                  {s.categories
                    .filter(
                      (c) =>
                        !c.parentId &&
                        c.kind === kind &&
                        !descendantIds(
                          modal.value?.id || "",
                          s.categories,
                        ).includes(c.id),
                    )
                    .map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                ลำดับแสดง
                <input
                  name="order"
                  type="number"
                  min="0"
                  required
                  defaultValue={modal.value?.order ?? s.categories.length}
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  name="archived"
                  defaultChecked={modal.value?.archived}
                />{" "}
                เก็บถาวร (รายการเก่ายังอยู่)
              </label>
              <p className="info-note">
                เมื่อต้องการเลิกใช้หมวด ให้เก็บถาวร หรือเปลี่ยนหมวดหลักเพื่อย้ายกลุ่ม
                ไม่มีการลบรายการที่อ้างอิงหมวด
              </p>
            </>
          )}
          {(modal.type === "account" || modal.type === "category") && (
            <>
              <label>
                สี
                <input
                  className="color-input"
                  type="color"
                  name="color"
                  defaultValue={modal.value?.color || "#a494cb"}
                />
              </label>
              <label>
                ไอคอน
                <div className="icon-picker">
                  {icons.map((n) => (
                    <button
                      className={icon === n ? "selected" : ""}
                      type="button"
                      key={n}
                      aria-label={n}
                      aria-pressed={icon === n}
                      onClick={() => setIcon(n)}
                    >
                      <Pixel name={n} size={33} />
                    </button>
                  ))}
                </div>
              </label>
            </>
          )}
          {modal.type === "period" && (
            <>
              <label>
                ชื่อรอบบัญชี
                <input
                  name="name"
                  required
                  defaultValue={modal.value?.name}
                  placeholder="เงินเดือนกุมภาพันธ์ 2570"
                />
              </label>
              <label>
                รูปแบบ
                <select
                  name="periodKind"
                  defaultValue={modal.value?.kind || "salary"}
                >
                  <option value="salary">รอบเงินเดือน</option>
                  <option value="calendar">เดือนปฏิทิน</option>
                  <option value="custom">กำหนดเอง</option>
                </select>
              </label>
              <div className="form-grid">
                <label>
                  วันเริ่ม
                  <input
                    type="date"
                    required
                    name="start"
                    defaultValue={modal.value?.start || today()}
                    onChange={() =>
                      setWarning("ระบบจะตรวจช่วงวันที่ซ้อนทับและเว้นว่างก่อนบันทึก")
                    }
                  />
                </label>
                <label>
                  วันสิ้นสุด
                  <input
                    type="date"
                    required
                    name="end"
                    defaultValue={modal.value?.end || today()}
                  />
                </label>
              </div>
              <p className="info-note">
                ช่องเลือกวันใช้รูปแบบของอุปกรณ์ รายงานแสดง พ.ศ. ภาษาไทย ภายในเก็บ ISO
                date โดยไม่เลื่อนวันตาม timezone
              </p>
              {warning && <p className="warning">{warning}</p>}
            </>
          )}
          {modal.type === "budget" && (
            <>
              <p className="info-note">สำหรับ {period.name}</p>
              <label>
                หมวดหมู่
                <select
                  name="categoryId"
                  required
                  defaultValue={modal.value?.categoryId}
                >
                  <option value="">เลือกหมวด</option>
                  {s.categories
                    .filter((c) => c.kind === "expense" && !c.archived)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parentId ? "↳ " : ""}
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                งบประมาณ (บาท)
                <input
                  required
                  name="amount"
                  inputMode="decimal"
                  defaultValue={
                    modal.value ? (modal.value.amount / 100).toFixed(2) : ""
                  }
                />
              </label>
            </>
          )}
          {modal.type === "goal" && (
            <>
              <label>
                ชื่อเป้าหมาย
                <input name="name" required defaultValue={modal.value?.name} />
              </label>
              <label>
                บัญชีออมทรัพย์
                <select
                  name="accountId"
                  required
                  defaultValue={modal.value?.accountId}
                >
                  <option value="">เลือกบัญชีออมทรัพย์</option>
                  {s.accounts
                    .filter((a) => a.kind === "saving")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                ยอดเป้าหมาย (บาท)
                <input
                  name="target"
                  inputMode="decimal"
                  required
                  defaultValue={
                    modal.value ? (modal.value.target / 100).toFixed(2) : ""
                  }
                />
              </label>
              <p className="info-note">
                เงินสะสมคำนวณจากยอดบัญชี กรุณาใช้บัญชีออมทรัพย์แยกแต่ละเป้าหมาย
              </p>
            </>
          )}
        </form>
        <footer>
          {(modal.type === "budget" || modal.type === "goal") &&
            modal.value && (
              <button
                className="danger-button"
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (await askConfirm("ลบรายการตั้งค่านี้?")) {
                    const ok = await act(
                      () =>
                        db
                          .table(modal.type === "budget" ? "budgets" : "goals")
                          .delete(modal.value!.id),
                      "ลบแล้ว",
                    );
                    if (ok) close();
                  }
                }}
              >
                ลบ
              </button>
            )}
          <button className="soft-button" type="button" onClick={close}>
            ยกเลิก
          </button>
          <button
            className="primary"
            form={formId}
            type="submit"
            disabled={busy}
          >
            <Check size={17} />
            {busy ? "กำลังบันทึก…" : "บันทึก"}
          </button>
        </footer>
      </section>
    </div>
  );
}
