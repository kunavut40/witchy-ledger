# Witchy Ledger — ส่งต่องานที่บ้าน

## สถานะ ณ 17 พฤศจิกายน 2569

โปรเจกต์ React19 + TypeScript + Vite6 + Dexie/IndexedDB ไม่มี cloud database ระบบบัญชีเดิมใช้ integer สตางค์ และรอบบัญชีกำหนดวันเอง มีรายรับรายจ่าย บัญชี งบ เงินออม หนี้ผ่อนชำระ และ JSON backup/restore

branch งาน: feature/witchy-character-expansion
baseline ก่อน Fantasy: commit 654fded

รุ่นโค้ดล่าสุด 0.4.0-test สร้าง APK ทดสอบได้แล้ว ดู ANDROID-TEST.md แต่ยังไม่ได้ทดสอบติดตั้งบน S25 จริง ภาพตัวละคร/เสื้อผ้าเป็น placeholder และยังไม่ตรงกับแบบที่ผู้ใช้อนุมัติ ห้ามเข้าใจว่า UI ล่าสุดใน docs/design ถูก implement แล้ว

## แบบที่ผู้ใช้อนุมัติล่าสุด — ยังไม่ลงโค้ด

- ดู docs/design/Witchy-Ledger-Minimal-UI-Concept.png: พื้นขาวโล่ง ม่วงพาสเทล กรอบเวทมนตร์เล็ก/บาง header เคารพ safe area ของโทรศัพท์ โลโก้หน้ายูอิหมวกม่วง profile HUD กรอบแรงก์
- ลบหน้าฮีโร่ Dota ทั้งหมดออกจาก UI เก็บเฉพาะชื่อและฉายาเป็นตัวเลือกแยกกัน ใช้เฉพาะยูอิ/โมโมะเป็น companion
- กรอบแรงก์อิง Dota2 แต่เป็นงานต้นฉบับ 2D pixel fantasy คงสูตรเลเวล/แรงก์เดิมใน src/progression.ts
- ปุ่ม + กลาง bottom nav ใหญ่ขึ้นเล็กน้อย กดแล้วพื้นหลังเบลอ มีวงกลมรายรับ/รายจ่าย พร้อมแอนิเมชันและเสียง
- ยูอิคุยแบบหันสามส่วนไปทางขวา มีถอนหายใจ หลับตา ขยิบตา เปลี่ยน typewriter จาก 40 เป็นประมาณ 27ms/ตัวอักษร
- ดู Pastel-Themes-Concept.png: Lavender, Peach Orange, Mint, Rose Pink, Sky Blue, Champagne Gold พื้นยังขาว อ่านง่าย สีรายรับ/รายจ่ายต้องไม่สับสนกับธีม
- ดู Wardrobe-Places-Concept.png: เปลี่ยนสีตาดำ/ม่วง/ชมพู/อำพัน/ฟ้า/เขียว/เบอร์กันดี/เทา แยกจากผมและชุด มีฉากห้องแต่งตัว สะพาน ห้องสมุด เฉพาะหน้าตัวละคร/ห้อง หน้าการเงินยังขาว
- งานภาพทั้งหมดต้อง 2D pixel art ตามแนว cozy witch life sim ห้ามใช้ตัวละคร block placeholder เดิมเป็น final และไม่ใช้ 3D voxel

## งานคงค้าง

ระบบ dialogue เต็ม 30–50 event, coffee metadata แยกแก้วและผู้รับ (ห้ามเดา), sprite/เสื้อผ้า final, อารมณ์ครบ, animation sheets, achievement และ affinity เต็มระบบ ยังไม่เสร็จ ดูข้อจำกัดใน ANDROID-TEST.md

## เปิดโปรเจกต์

ติดตั้ง Node.js22+ และ pnpm11 จากนั้น pnpm install, pnpm dev, pnpm test, pnpm build. มี tests 27 กรณีที่ผ่านล่าสุด หาก pnpm ตรวจ dependency แล้วติดข้อจำกัดสภาพแวดล้อม ใช้ node node_modules/vitest/vitest.mjs run --configLoader runner และ node node_modules/typescript/bin/tsc -b หลังติดตั้ง dependencies สำเร็จ

Android source อยู่ android/ ไม่ใช่ Gradle project: build-apk.ps1 ใช้ JDK21, SDK platform35 และ buildtools35 ผ่านพารามิเตอร์ -Tools ดู ANDROID-TEST.md กุญแจเซ็นและ SDK อยู่ภายนอก repo ไม่ส่งขึ้น GitHub

## ข้อมูลจริงและความปลอดภัย

Git เก็บ source/assets/tests ไม่ได้เก็บ IndexedDB ของผู้ใช้ ข้อมูลการเงินต้อง backup JSON ผ่านแอปเองก่อนย้ายเครื่อง APK กับเบราว์เซอร์มีข้อมูลแยกกัน ห้ามเพิ่มไฟล์ JSON การเงินจริงหรือ signing keystore เข้า repo

ก่อนลงมือรอบต่อไป ตรวจ git status และสร้างจุดย้อนกลับ รักษางานที่ยังไม่ commit ห้าม reset/clean ห้ามเปลี่ยนสูตรการเงินหรือ progression โดยไม่ได้รับอนุญาต
