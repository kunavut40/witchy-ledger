# Witchy Ledger 0.6.11 — Grand Witchy Fantasy

ต่อจาก0.6.10 งานนี้ปรับภาพ/ตัวละคร/typography ไม่เปลี่ยนสูตรบัญชี schema progression หรือข้อมูลจริง

- Witchy Fantasy ใช้ฉากพระราชวังป่าเวทมนตร์ต้นฉบับ ซุ้มงาช้างลายทอง ปราสาทเหนือแม่น้ำ แสงคริสตัล มีกรอบSVG ลายมุมการ์ดและประกาย14จุดที่ไม่รับpointer events
- ฉากปรับโทนตาม6paletteเดิม Classicไม่mountฉากและไม่แสดงองค์ประกอบตกแต่ง Fantasy ไม่มีvideo/canvasloop มีreduced motionและsettingปิดanimation
- Popupแสดงยูอิ/โมโมะครึ่งตัว เปิดbodylayerและcropที่เอว รักษาชุดและทรงผมจากระบบเดิม ยูอิ annoyed/proudใช้ภาพกอดอกใหม่8ชุด; annoyed/sleepy/blinkหลับตา happy/proudขยิบตา worried/surprisedตาเปิด ผูกกับemotionของdialogueในqueueเดิม ขยับปากตามtypewriterเหมือนเดิม ไม่มีเสียงพูดเพิ่ม
- เวลายังไม่มีdialogueจะแสดงประโยคทักทายแทนกล่องว่าง ยูอิยืนกอดอกขยิบตาเข้ากับประโยคปากแข็ง ท่าของโมโมะไม่ถูกบังคับให้กอดอกเหมือนยูอิ
- เพิ่มSarabun700ที่bundledในแอป ปรับตัวเลข/หัวข้อให้หนา ข้อความรองและขอบวงเข้มขึ้น อ่านง่ายขึ้น พื้นการ์ดสว่างช่วยแยกตัวเลขจากฉาก
- รายละเอียดassetและpromptจากbuilt-in imagegenอยู่ในdocs/ART-0.6.11.md ไม่มีการแก้ทับassetเดิม

## Verification

TypeScriptและproductionbuildผ่าน Tests72ผ่าน รวมทดสอบemotion-to-pose/expressionใหม่2กรณี

CUAเบราว์เซอร์393×852: Classicมีgrand-scene0, Fantasyมี1; เลือกมิ้นต์บันทึกแล้วfilterhue225degยังอยู่หลังreload; scrollWidth393เท่ากับviewport393; Popupใช้posecrossed/expressionwink มีbodydisplayblockและใช้poses-crossed-v2จริง winkopacity1 ภาพหน้าจอแนบเป็นหน้าจอจริง ไม่มีS25ต่ออยู่จึงยังไม่ได้ตรวจperformance/ติดตั้งบนโทรศัพท์จริง

## APK

app.witchyledger.offline versionCode17 versionName0.6.11-local-test ใช้keyเดิมของเครื่องนี้ อัปเดต0.6.10ที่ส่งในแชตได้ สำรองJSONก่อนติดตั้งทับ ไม่ต้องถอนแอป Preview0.6.8เป็นคนละpackage/keyเช่นเดิม
