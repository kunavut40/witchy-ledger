# Witchy Ledger — S25 test build 0.4.0

## ติดตั้ง

ส่ง WitchyLedger-S25-test.apk ไปยัง Galaxy S25 แล้วเปิดไฟล์จาก My Files เพื่อใช้หน้าติดตั้งของ Android รุ่นนี้เป็น APK ทดสอบที่เซ็นด้วยกุญแจทดสอบเฉพาะโปรเจกต์ ไม่ใช่รุ่นเผยแพร่ผ่าน Play Store และยังไม่ได้ติดตั้งทดสอบบนเครื่อง S25 จริง

ไม่มีไฟล์ native .so จึงใช้ bytecode Java/WebView ของเครื่อง รองรับ Android 11/API30 ขึ้นไป target API35 ตัว APK บรรจุเว็บ ฟอนต์ ภาพ และเสียงสังเคราะห์ไว้ครบ ไม่ต้องมี Node.js หรือเปิดคอม ไม่มีสิทธิ์ INTERNET, ไมค์, รายชื่อ หรือพื้นที่เก็บข้อมูลทั้งเครื่อง ใช้ file picker ของระบบเฉพาะไฟล์ที่ผู้ใช้เลือก

## เริ่มทดลอง

1. เปิดแอป เริ่มข้อมูลว่างพร้อมโหมด Fantasy (เลือก Classic ได้ใน ตั้งค่า)
2. ไป แต่งตัว → เปลี่ยนยูอิ/โมโมะ ลองชุด ทรงผม หมวก แว่น กิ๊บ ผ้าคลุม และคทา ฟังเสียงเมนูเบา ๆ
3. เปิด ห้องของยูอิ → สลับของตกแต่งในช่องที่กำหนด ของล็อกใช้ Level เดิมเป็นเงื่อนไข
4. ตั้งค่า → ปิดเสียงได้ตลอดเวลา
5. บันทึกรายรับ/รายจ่าย แล้วปิดเปิดแอปเพื่อตรวจข้อมูลและชุดที่สวม

## ย้ายข้อมูลจากคอม / เบราว์เซอร์

ฐานข้อมูลใน APK แยกจากเบราว์เซอร์เดิม ไม่มี sync อัตโนมัติ ให้สำรอง JSON จากแอปเดิม ส่งเข้าโทรศัพท์ แล้วใช้ สำรองข้อมูล → กู้คืน → เลือกไฟล์ → ตรวจจำนวนรายการและยืนยัน การกู้คืนแทนที่ข้อมูลในแอปมือถือ รวมการตั้งค่า จึงอาจต้องเปิด Fantasy ใหม่หลัง restore

ปุ่มสำรอง JSON และส่งออก CSV ใน APK จะเปิดหน้าบันทึกไฟล์ของ Android โดยตรง สำรองข้อมูลก่อนถอนการติดตั้ง/ล้างข้อมูลแอป การอัปเดตควรติดตั้งทับด้วย APK ที่ใช้กุญแจเดิม ไม่ถอนติดตั้งก่อน

## ทำแล้วจริง

- โหมด Classic/Fantasy และภาพห้องใต้หลังคาต้นฉบับ 2D ตามทิศทางที่ตกลง
- ผู้ช่วยเล็กบน Dashboard มีซ่อน/เรียกกลับ Typewriter text, idle/blink/talking และสีหน้าเบื้องต้น ไม่มีเสียงพูด
- ยูอิ/โมโมะ ชื่อและบุคลิกแยกกัน บทพูดในเครื่องสำหรับทักทาย งบเกิน เป้าหมายออม และ streak โดยอ่านผลจากระบบเดิม
- catalog 26 ชุด 12 ทรงผม แต่ภาพยังเป็น placeholder บางแบบใช้โครงและสีร่วมกัน ไม่ใช่ชุดภาพ final ตามภาพอ้างอิงทุกแบบ
- หมวก แว่น กิ๊บ ผ้าคลุม ของถือมือ ชุดโปรด สุ่มของที่ปลดล็อก การจัดห้องแบบตำแหน่งตายตัว และบันทึก settings ใน IndexedDB เดิม
- เสียงสังเคราะห์ Web Audio สำหรับเลือกเมนู/ฮีโร่/เครื่องประดับ ปรับปิดได้ ไม่มีไฟล์เสียงหรือ cloud
- คงสูตรบัญชี บัตรเครดิต เงินออม และสูตรแรงก์เดิม ไม่มีการแก้ schema ฐานข้อมูล

## ยังไม่เสร็จ

- sprite sheet final ครบ 8 อารมณ์และภาพชุดทุกแบบ (ปัจจุบันเป็น SVG pixel layers ต้นแบบ)
- Dialogue Engine 30–50 events, history/cooldown/priority เต็มระบบ และ coffee events แยกแก้ว/ผู้รับ ยังไม่เพิ่มฟิลด์จำนวนกาแฟ จึงไม่เดาจำนวนหรือผู้รับ
- Achievement ถาวร ความสนิทจาก achievement และการกลับมาใช้งาน (ปัจจุบัน affinity จากการคุยวันละหนึ่งครั้ง)
- ห้องที่ย้ายเฟอร์นิเจอร์ฉากพื้นหลังออกได้จริง: ภาพฉากฐานคงที่ ของเลือกปัจจุบันเป็น overlay ทดสอบตำแหน่ง ไม่ใช่เฟอร์นิเจอร์ final แยกชิ้น
- การทดสอบการติดตั้ง เสียง file picker backup/restore และ offline บน S25 จริง ยังต้องให้ผู้ใช้ทดลอง ไม่มี emulator/device ใน session นี้

## Stage 0 / Rollback

ตรวจ React19/TypeScript/Vite6/Dexie, ตารางเดิม7ตาราง, ระบบหนี้/งบ/รอบ/ธีม/Rank แล้ว ไม่พบ Git repository จึงสร้าง snapshot commit 654fded และ branch feature/witchy-character-expansion เก็บไฟล์ที่มีอยู่ทั้งหมดก่อนเริ่ม ไม่มี reset/clean และไม่แตะฐานข้อมูลจริงบนเบราว์เซอร์

ไม่มี migration หรือการเปลี่ยน schema จึงไม่ต้องแปลงข้อมูลจริง เพิ่มเฉพาะ settings key fantasy.state ซึ่งรวมอยู่ใน backup เดิม ก่อนเปลี่ยน schema ในระยะหน้า ต้องสำรอง JSON จริงจากอุปกรณ์ก่อน รอบนี้ไม่มีการอ้างว่าดึง backup ของผู้ใช้จาก browser ได้

ทดสอบอัตโนมัติ 27 กรณีผ่าน TypeScript/build ผ่าน ตรวจ diff ของ src/domain.ts, src/db.ts, src/progression.ts, src/debtRepository.ts ไม่มีการเปลี่ยนจาก baseline ตรวจลายเซ็น APK และ manifest ผ่าน Android build tools

การย้อน source ให้สร้าง checkout/worktree ใหม่จาก commit 654fded โดยรักษาไฟล์งานปัจจุบันไว้ ห้ามใช้ reset --hard ฐานข้อมูลจริงควรใช้ JSON backup ก่อน restore เสมอ

## Build

android/build-apk.ps1 ใช้ JDK21, Android Platform35 และ Build Tools35 ใน work/android-tools เครื่องนี้ ดาวน์โหลดจาก Adoptium และ Google ตรวจ SHA256 ของ JDK และ SHA1 ของ SDK ตาม metadata ทางการ ใช้ javac, aapt2, D8, zipalign และ apksigner โดยไม่ใช้ cloud build

กุญแจ test อยู่ใน work/android-tools/witchy-test.jks (รหัสทดสอบ android, alias witchytest) ต้องเก็บกุญแจนี้สำหรับอัปเดตติดตั้งทับในอนาคต ห้ามนำกุญแจทดสอบไปใช้เป็น production signing key

## งานภาพ

public/attic.png สร้างด้วย built-in ImageGen ไม่ใช้ CLI/API key ตามคำบรรยาย original dark cozy 2D pixel attic, charcoal timber, exactly three Gothic windows, golden standing astronomical clock, star-pattern bed, reading desk, wardrobe, mirror, warm lanterns, black cat, no people/no UI/no text/no copied assets ภาพนี้เป็นฉากฐาน ไม่ใช่ภาพตัวละครสำเร็จ
