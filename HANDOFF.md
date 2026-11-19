# Witchy Ledger — ส่งต่องานที่บ้าน

## ล่าสุด 0.6.9-local-test — ต่อจาก GitHub0.6.8

อ่าน RELEASE-0.6.9.md ก่อน ใช้base55c08acจากGitHub0.6.8 ตามคำสั่งผู้ใช้ล่าสุด แยกworktreewitchy-ledger-069 ไม่รวมlocal0.6.3เก่า เพิ่มoverlay50%/blur3px unified fade-zoom240ms ขั้นถัดไป480ms reverse+back sound ไอคอนเมนูต่างกันและanimation เลิกสร้างใบไม้ลม ทดสอบ70กรณีผ่านและตรวจUIมือถือ393×852ผ่าน CUA ไม่มีS25ต่ออยู่

สำคัญ: APK068ที่GitHubเป็นapp.witchyledger.preview sign e6826d9d...; ไม่มีkeyนั้นบนเครื่องนี้ APK069จึงเป็นapp.witchyledger.offline versionCode15 sign a6f10620... ติดตั้งแยกจากPreviewและอัปเดตOfflineเดิมได้ ห้ามบอกว่าติดตั้งทับPreviewได้ ต้องใช้keyเดิมจากบ้านเพื่อสร้างPreviewupdateโดยตรง ข้อมูลด้านล่างเป็นประวัติและบันทึกส่งต่อเก่าที่ยังไม่ได้อัปเดตตามงานบ้าน

## ล่าสุด 0.6.3-local-test

อ่าน RELEASE-LOCAL-0.6.3.md ก่อน ทำต่อlocal0.6.2 ไม่รวมGitHub เพิ่มRadialEntry/EntryCategories/CompactHome ตั้งค่าวงจากแถบหัวเมนู+ กรอบRankFrameแบบมงกุฎใบไม้ และจำกัดความกว้างviewport Tests35ผ่าน versionCode9 key/packageเดิม ยังไม่มีการลองสัมผัสบนS25จริง ตรวจresponsiveต่อที่บ้าน ส่วนเสื้อผ้ายังรอlayerassets

## รุ่นล่าสุดที่ผู้ใช้สั่ง: 0.6.2-local-test — ซอร์สเครื่องนี้เท่านั้น

อ่าน PROMPT-LOCAL-0.6.2.md และ RELEASE-LOCAL-0.6.2.md ก่อน ใช้ซอร์สเครื่องนี้ snapshot3fcacb6 ก่อนรวมGitHub ไม่ใช้treeของv0.6.1 ไม่ดึงหรือรวมงานGitHubเข้าบิลด์ใหม่ package app.witchyledger.offline versionCode8 signing keyเดิม คง4การ์ดรายละเอียด/สรุปรอบ/back/ผลตรวจwardrobeตามงานlocal

ข้อมูลด้านล่างเป็นประวัติ ไม่ใช่ข้ออนุญาตให้ดึงGitHubกลับมาผสม การนำซอร์สใหม่ขึ้นGitHubทำหลังบิลด์เสร็จและต้องใช้treeเดียวกับที่ตรวจแล้ว รักษาประวัติเก่าได้ แต่ห้ามนำโค้ดจากสายงานGitHubมารวมโดยผู้ใช้ไม่ได้ขอ

## ล่าสุด: 0.6.0-test

ดู PROMPT-0.6.md และ RELEASE-0.6.md เพิ่ม Dashboardรายละเอียดทั้ง4การ์ด สรุปปุ่มรอบนี้ และ backhistory/gesture ตรวจพบ wardrobeเปลี่ยนภาพไม่ได้จึงปิดcontrolsที่ไม่ทำงานอย่างโปร่งใส ไม่ใช่แก้การแต่งตัวครบ Tests33กรณีผ่าน สูตรบัญชี/schema/rankเดิมไม่เปลี่ยน APK versionCode6 key/appIDเดิม ยังไม่มีการตรวจติดตั้งS25จริง

## ล่าสุด: 0.5.0-test

เริ่ม implement แบบพาสเทลแล้ว ดู RELEASE-0.5.md ก่อนอ่านสถานะเดิมด้านล่าง ซึ่งเป็นประวัติของรุ่น0.4 UIขาว6สี ปุ่มกลางแยกรายรับ/รายจ่าย ภาพยูอิ/โมโมะและไอคอนใหม่3สีตา ฉาก2Dสะพาน/ห้องสมุด เปลี่ยนแล้ว แต่ชุด/ทรงผมแบบภาพแยกชั้นและ8อารมณ์ยังไม่ครบ จึงห้ามอ้างว่าจบสเปกทั้งหมด Tests27ผ่าน และ APKเซ็นด้วยkeyเดิม versionCode5 ยังไม่ทดสอบS25จริง

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
