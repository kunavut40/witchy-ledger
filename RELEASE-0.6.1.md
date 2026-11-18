# 0.6.1-test — Dashboard details บนงานล่าสุดจากบ้าน

รวมงาน origin/main f753ba3 ที่พัฒนาจากบ้าน (หน้าหลักมือถือพอดีจอ วงเมนูด่วน เลือกหมวดวงกลม ราคาด่วน การตั้งค่า เสียง และใบหน้ายูอิ) โดยรักษางานทั้งหมด พร้อมเพิ่ม:

- กด4การ์ดสรุปได้ทั้งใบรวมลูกศรบนdesktopและmobile เปิดรายละเอียดรายรับ รายจ่าย ยอดสุทธิ และยอดสะสมแยกบัญชี
- ปุ่ม รอบนี้ เปิดสรุปรายจ่ายตามรอบพร้อมยอด หมวด สัดส่วน จำนวนรายการและธุรกรรม กดหมวดเพื่อเจาะรายละเอียด
- ย้อนกลับด้วยปุ่ม/ปัดจากขอบซ้ายไปขวา/Android back ใช้ประวัติหน้า ปิดตัวเลือกหมวดก่อนฟอร์ม และยืนยันก่อนทิ้งฟอร์มธุรกรรมหรือหนี้
- ตรวจพบว่าชุด/ทรงผม/เครื่องประดับบันทึกค่าได้แต่ไม่เปลี่ยนภาพจริง จึงพักตัวเลือกที่ไม่ทำงานพร้อมคำอธิบายและรักษาค่าเดิม ไม่ได้อ้างว่าแต่งตัวเสร็จแล้ว ต้องพัฒนาภาพแยกชั้นและrendererต่อ
- สีตาของภาพเต็มตัวกับฉากยังเปลี่ยนได้ ภาพใบหน้ายูอิจากบ้านเป็นภาพสีตาคงที่ เฟอร์นิเจอร์ที่อยู่ในภาพฉากยังถอดเปลี่ยนไม่ได้ เปลี่ยนได้เฉพาะชิ้นตกแต่งที่วางเพิ่ม

สูตรบัญชี/schema/debt repository/progression ไม่เปลี่ยน

## APK และข้อมูล

APK รอบนี้เป็น app.witchyledger.offline versionCode7 versionName0.6.1-test ลงลายเซ็นด้วยkeyเดิมของรุ่นOffline0.5 ติดตั้งทับแอป Witchy Ledger เดิมได้โดยไม่ถอนก่อน สำรองJSONผ่านเมนูแอปก่อนอัปเดต

แอป Witchy Ledger Preview จากบ้านใช้ package app.witchyledger.preview และฐานข้อมูลแยกกัน APK Offline นี้ไม่ใช่อัปเดตของPreview หากใช้Previewให้สำรองJSONจากPreviewแล้วนำเข้าOfflineผ่านเมนูrestore โดยตรวจข้อมูลปลายทางก่อนเพราะrestoreแทนที่ข้อมูลในแอปปลายทาง

ไฟล์ WitchyLedger-Preview.apk ในrepoคงไฟล์0.6จากบ้านไว้ ไม่ใช่APKที่สร้างรอบนี้ สคริปต์buildรองรับทั้งOfflineและPreview แต่การอัปเดตต้องใช้keyของpackageนั้นจริง ไม่มีprivate keyรวมในซอร์ส

## การตรวจ

ทดสอบ33กรณีผ่าน TypeScriptและproductionbuildผ่าน APKตรวจลายเซ็น เวอร์ชัน assets และentrypointแล้ว ไม่มีS25ต่ออยู่จึงยังไม่ได้ติดตั้งหรือทดสอบสัมผัสบนเครื่องจริง

อ้างอิง implementation: [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) และ [Android back callback](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture)
