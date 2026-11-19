# Witchy Ledger 0.6.10 — Fast surface transitions

ต่อจาก0.6.9 (64a6936) แก้เฉพาะmotion,ปุ่มปิดและระดับเสียง ไม่มีการเปลี่ยนสูตรบัญชี/schema/rank/ข้อมูล

- ยกเลิกชั้นเอฟเฟกต์สีขาวทั่วจอ SceneTransition เปลี่ยนเป็นขยับsurfaceที่เลือกโดยตรง ไม่ซ้อนscrimระหว่างเลือกอื่นๆ/รายรับ/รายจ่าย/แตะหมวดหลัก
- ขั้นเลือกทั้งหมดใช้fade/zoom240ms แบบเดียวกับวงกดค้าง ไม่ใช้480msและไม่เพิ่มดีเลก่อนเปลี่ยนstate การสลับหน้าหลัก รายการ วิเคราะห์ใช้surface fade/zoomเดียวกัน
- ลบปุ่มradial-closeออกจากDOM เหลือปุ่มกลาง+/X ของnavigationให้ย้อนกลับ ช่องทางAndroidback/Escapeยังใช้ระบบเดิม
- overlay50%และblur3pxยังคงเดิม ตัวปุ่มไม่ถูกลดopacity รองรับreduced motionและmuteเดิม
- เพิ่มpeak gainเสียงจาก0.035เป็น0.075 ไม่เปลี่ยนระดับเสียงระบบของโทรศัพท์

## Verification

TypeScript/productionbuildผ่าน Tests70ผ่าน ตรวจเว็บมือถือ393×852ด้วยCUA: ไม่มีradial-close, overlayalpha0.5, เปิดและขั้นถัดไป0.24s, ไม่มีscene-gustทั่วจอ, ปิดด้วยXกลางแล้วradial-scrimเหลือ0; เปิดอื่นๆเข้าสู่ฟอร์ม แตะหมวดหลักแสดงเมนู0.24s และสลับรายการ/วิเคราะห์ได้ ไม่มีข้อมูลการเงินจริงถูกบันทึกระหว่างตรวจ

ยังไม่มีS25ต่ออยู่ ไม่ได้ตรวจความดังจากลำโพงจริง

## APK

app.witchyledger.offline versionCode16 versionName0.6.10-local-test keyเดิมของเครื่องนี้ ติดตั้งทับAPK0.6.9ที่ส่งในแชตนี้ได้ สำรองJSONก่อนอัปเดต ไม่ต้องถอนแอป

Preview0.6.8ยังเป็นคนละpackage/key จึงติดตั้งแยกจากPreviewเหมือนรุ่น0.6.9 ห้ามถอนPreviewเพื่อแก้signature mismatch
