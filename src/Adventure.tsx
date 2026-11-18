import type { State } from "./domain";
import { Hero, RankFrame } from "./Heroes";
import { progression, ranks } from "./progression";
import { Flame, ChevronRight, Sparkles } from "lucide-react";
export const themes = [
  {
    id: "academy",
    name: "ห้องเรียนแห่งจันทรา",
    description: "โรงเรียนเวทมนตร์ · Lavender",
    position: "0% 0%",
  },
  {
    id: "mountain",
    name: "ขุนเขาลอยฟ้า",
    description: "วิหารกลางหมอก · Jade",
    position: "100% 0%",
  },
  {
    id: "training",
    name: "ลานฝึกอาคม",
    description: "เปลวไฟและวงแหวนเวท · Amber",
    position: "0% 100%",
  },
  {
    id: "secrets",
    name: "ห้องแห่งความลับ",
    description: "คริสตัลและคัมภีร์ต้องห้าม · Midnight",
    position: "100% 100%",
  },
  {
    id: "minimal",
    name: "สมุดบัญชีลาเวนเดอร์",
    description: "ธีมเรียบสบายตาแบบดั้งเดิม",
    position: "0% 0%",
  },
];
export function ThemePreview({ id }: { id: string }) {
  const t = themes.find((t) => t.id === id) || themes[0];
  return (
    <span
      className={"theme-art scene-" + id}
      style={{ backgroundPosition: t.position }}
      aria-hidden="true"
    />
  );
}
export function ProgressBanner({
  transactions,
  avatar,
  open,
}: {
  transactions: State["transactions"];
  avatar: string;
  open: () => void;
}) {
  const p = progression(transactions);
  return (
    <button
      className="progress-banner"
      onClick={open}
      aria-label="ดูเลเวล แรงก์ และปรับแต่งฮีโร่"
    >
      <RankFrame rankIndex={p.rankIndex} size={56}>
        <Hero id={avatar} size={56} />
      </RankFrame>
      <div className="progress-banner-main">
        <div className="spread">
          <strong>
            {p.rank.name} <small>LV. {p.level}</small>
          </strong>
          <span>{p.xp.toLocaleString()} XP</span>
        </div>
        <div className="xp-track">
          <i style={{ width: p.levelProgress + "%" }} />
        </div>
        <small>
          อีก {p.toNext} XP ถึงเลเวล {p.level + 1}
        </small>
      </div>
      <span className="streak-pill">
        <Flame size={17} /> {p.streak} วันต่อเนื่อง
      </span>
      <ChevronRight size={16} />
    </button>
  );
}
export function ProgressPanel({
  transactions,
  avatar,
  unlocked = false,
  previewRank,
}: {
  transactions: State["transactions"];
  avatar: string;
  unlocked?: boolean;
  previewRank?: (index: number) => void;
}) {
  const p = progression(transactions);
  return (
    <div className="progress-panel">
      <div className="rank-spotlight">
        <RankFrame size={132} rankIndex={p.rankIndex}>
          <Hero id={avatar} size={132} />
        </RankFrame>
        <span className="eyebrow">YOUR CONSISTENCY IS YOUR POWER</span>
        <h2>
          {p.rank.name} · Level {p.level}
        </h2>
        <p>{p.rank.title}</p>
        <div className="xp-track">
          <i style={{ width: p.levelProgress + "%" }} />
        </div>
        <small>
          {p.xp.toLocaleString()} XP · อีก {p.toNext} XP ถึงเลเวลถัดไป
        </small>
      </div>
      <div className="quest-stats">
        <div>
          <Flame size={20} />
          <b>{p.streak}</b>
          <small>วันต่อเนื่องตอนนี้</small>
        </div>
        <div>
          <Sparkles size={20} />
          <b>{p.best}</b>
          <small>สถิติต่อเนื่องสูงสุด</small>
        </div>
        <div>
          <b>{p.days}</b>
          <small>วันที่บันทึกทั้งหมด</small>
        </div>
      </div>
      <div className="daily-quest">
        <span>{p.todayDone ? "✓ ภารกิจวันนี้สำเร็จ" : "✦ ภารกิจวันนี้"}</span>
        <h3>บันทึกรายการจริงอย่างน้อย 1 รายการ</h3>
        <p>รับ 25 XP ต่อวัน + โบนัสต่อเนื่องวันละ 5 XP สูงสุดเพิ่ม 35 XP</p>
      </div>
      <h3>เส้นทางแห่ง Ancients</h3>
      <div className="rank-road">
        {ranks.map((r, i) => (
          <div
            className={unlocked || i <= p.rankIndex ? "unlocked" : "locked"}
            role="button"
            tabIndex={0}
            aria-label={"ดูกรอบ " + r.name}
            onClick={() => {
              if (unlocked || i <= p.rankIndex) previewRank?.(i);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (unlocked || i <= p.rankIndex))
                previewRank?.(i);
            }}
            key={r.name}
          >
            <RankFrame size={64} rankIndex={i}>
              <Hero id={avatar} size={64} />
            </RankFrame>
            <b>{r.name}</b>
            <small>LV. {r.level}</small>
            {i === p.rankIndex && <em>ระดับปัจจุบัน</em>}
          </div>
        ))}
      </div>
      <p className="info-note">
        นับจากวันที่สร้างรายการจริงในเครื่อง วันเดียวกันนับเพียงครั้งเดียว ย้อนวันที่รายการไม่เพิ่ม XP
        ข้อมูลตัวอย่างและการปรับยอดไม่นับ เลเวลไม่จำกัดและยังสะสมต่อได้หลัง Immortal
        หากลบรายการจนไม่เหลือในวันนั้น XP จะคำนวณใหม่ สตรีกต่อได้หากบันทึกวันนี้หรือเมื่อวาน
      </p>
      <p className="tiny muted">
        ชื่อแรงก์ได้แรงบันดาลใจจาก Dota 2 แต่เกณฑ์เลเวลนี้ออกแบบสำหรับนิสัยบันทึกบัญชี
        ไม่มีการเชื่อมกับอันดับเกม
      </p>
    </div>
  );
}
