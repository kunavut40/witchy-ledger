# Companion animation specification

ใช้ modular rig เดิม: `CharacterArt.tsx` ประกอบ body + head + head accessories + hand item ไม่เปลี่ยนชุดขณะพูด หัวและเลเยอร์ใบหน้าอยู่ในกลุ่ม anchor เดียวกัน

## Assets and anchors

- Bodies: `public/wardrobe/bodies.png`, 4×2 cells
- Heads: `public/wardrobe/heads-v2.png`, 5×2 cells; Yui row 0 / Momo row 1
- Accessories: `public/wardrobe/accessories.png`, 4×2 cells
- Body poses: `public/wardrobe/poses-v1.png`, 8×3 cells. Columns follow the eight real outfit choices; rows are hands on hips / hands clasped / sleepy raised hand. Normalized neck (256,205), soles y490 in each 512px cell
- Cell 512px; Yui chin (256,205), head offset follows `CharacterArt.tsx`
- Yui face matches app icon, dark hair and eyes, slightly turned screen-right. Momo row is preserved from the prior atlas
- Blink/mouth/blush/emotion symbols are SVG layers in the same rig coordinates; outfit/hair choices remain bitmap layers

## States

| State | Layer behavior |
| --- | --- |
| idle | Small stepped breathing/sway cycle |
| blink | Open → partial lid → closed → partial → open; automatic every 4.8s |
| talking | Three mouth drawings selected by typewriter codepoint count modulo three; small stepped nod |
| happy | Hands clasped, heart and short celebratory movement |
| annoyed | Hands on hips, puffed cheek overlay, tension symbol; existing angular eyebrows retained |
| embarrassed | Hands clasped and cheek blush in three opacity steps |
| worried | Small sweat drop |
| surprised | Brief four-step startle and surprise mark |
| sleepy | Half-closed eyelids, opening yawn mouth, raised hand, and sleepy mark |
| proud | Hands clasped, gold sparkle and four-step celebration |

ชุดนี้เป็น hybrid layered animation: ภาพร่างกายใหม่ 24 ช่องสำหรับสามท่าหลัก ประกอบกับ head/hair/accessory เดิม, ภาพปากสามแบบ, เปลือกตา, แก้ม และเอฟเฟกต์อารมณ์ ใช้การขยับแบบ steps สำหรับช่วงเปลี่ยนอารมณ์ 2–4 จังหวะ ไม่ใช่การวาดภาพเต็มตัวใหม่ทุกเฟรม ห้องแต่งตัวใช้ emotion ปัจจุบันจากคิวเดียวกับกล่องบทพูด

`CompanionWidget` ใช้ typewriter 27ms ต่อ codepoint เมื่อครบข้อความกลับไป idle/อารมณ์ของอีเวนต์ชั่วคราว แล้วเลื่อนคิวหลัง 4.5 วินาที แตะครั้งแรกแสดงข้อความครบ แตะอีกครั้งเลื่อนไปบทถัดไป

## Motion and layout

เปิดปิดอนิเมชั่นได้ในโลกของยูอิ & โมโมะ และเคารพ `prefers-reduced-motion` ทั้ง rig และ typewriter ไม่มีเสียงพูดหรือ TTS มีเฉพาะเสียงเลือกเมนูเดิม

มือถือแสดง portrait ล่างซ้าย กล่องข้างตัวละคร เหนือปุ่มเพิ่มรายการ มีปุ่มซ่อน/เรียกกลับ พื้นที่แสดงบัญชีเผื่อส่วนตัวละครไว้ ไม่ซ้อนทับปุ่ม + ข้อความแจ้งบันทึกอยู่ใกล้ด้านบนและหายภายใน 1.25 วินาที
