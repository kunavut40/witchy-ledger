# 0.6.0-test — Dashboard details and back navigation

พรอมป์ที่เขียนก่อนเริ่มอยู่ใน PROMPT-0.6.md

## งานที่ทำ

- การ์ด Dashboard ทั้ง4ใบกดได้ทั้งใบ (รวมไอคอนลูกศร) รองรับkeyboard Enter/Space แสดงรายละเอียดตามรอบที่เลือก
- เงินคงเหลือแสดงยอดแต่ละบัญชีสะสมถึงวันสิ้นรอบ รวมรายการก่อนรอบ ยอดไม่หักหนี้ซ้ำ
- รายรับ/รายจ่ายแสดงหมวดและรายการในรอบ กดหมวดเพื่อดูรายการย่อย ยอดสุทธิแสดงรายรับ/รายจ่ายและรายการที่เกี่ยวข้อง ไม่รวมโอน/ปรับยอด
- ปุ่ม รอบนี้ ของกราฟ donut เปิดสรุปเรียบง่าย: วันที่ ยอดรวม จำนวนรายการ หมวดสูงสุด สัดส่วนต่อหมวด และรายการ
- ย้อนกลับโดยปัดจากขอบซ้ายไปขวา >=85px ภายใน800ms แนวตั้งไม่เกิน45px ใช้ประวัติหน้าจอจริง ไม่สลับกลับหน้าแรกตลอด การปัดเริ่มบนinput/buttonไม่ทำงานเพื่อไม่รบกวนการกรอก มีปุ่มย้อนกลับให้ใช้ได้เสมอในหน้ารายละเอียดและหน้าอื่น
- Native Android back ใช้ window.WitchyBack ปิด overlay ก่อนย้อนหน้า มี Android13+ callback ด้วย ฟอร์มที่ยังไม่บันทึกต้องยืนยันก่อนปิดผ่านnative back/gesture
- ไม่มีการเปลี่ยน schema, domain calculations, debt repository หรือ progression

## ผลตรวจ wardrobe ตามจริง

CharacterArt ปัจจุบันใช้ภาพ bitmapatlas เลือกได้เพียงยูอิ/โมโมะและสีตา ส่วน Companion ไม่อ่าน outfit/hair/hat/accessory/cape/glasses/hand ไปเปลี่ยนภาพ ดังนั้นปุ่มเหล่านี้ยังใช้ไม่ได้จริงใน0.5 รอบนี้ปิดปุ่มดังกล่าวและการสุ่ม/บันทึกชุดโปรดที่ไม่ตรงภาพ พร้อมแสดงคำอธิบาย รักษาค่าที่เคยบันทึกไว้ ไม่อ้างว่าแก้การแต่งตัวครบแล้ว

ฉากและสีตายังเลือกได้ ของแต่งห้องเปลี่ยนเฉพาะoverlay ส่วนเตียง/ตู้/นาฬิกาที่วาดอยู่ในภาพฉากหลักไม่ใช่ชิ้นส่วนถอดเปลี่ยนได้

การแก้ให้เปลี่ยนชุด/ผม/เครื่องประดับครบจริงต้องเตรียมภาพแยกชั้นที่มีanchorเดียวกันและปรับrenderer เป็นงานระยะถัดไป ห้ามใช้การปิดปุ่มเป็นเหตุผลรายงานว่าระบบแต่งตัวเสร็จแล้ว

## Validation

Tests33กรณีผ่าน เพิ่ม6กรณีสำหรับยอดรายละเอียด ขอบรอบ หมวดรวมย่อย empty state creditและgesture TypeScript/buildผ่าน ตรวจ APKsignature/entrypoint/versionCode6/assets และใช้app ID/signing keyเดิมเพื่ออัปเดต

ไม่มีเครื่องมือbrowser automationในรอบนี้ และไม่มีอุปกรณ์S25ต่ออยู่ จึงยังไม่ได้ตรวจUIใหม่/การปัด/native back/ติดตั้งจริงบนเครื่อง ผู้ใช้ควรbackupJSONแล้วติดตั้งทับโดยไม่ถอนแอปก่อน

Implementation references: [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) สำหรับให้browserเลื่อนแนวตั้งและให้แอปอ่านการปัดแนวนอน และ [Android custom back](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture) สำหรับcallbackบนAndroid13ขึ้นไป
