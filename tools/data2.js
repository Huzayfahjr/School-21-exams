/* Variant 2: close to variant 1 (same tables, new twists, same theory areas) */
var V2P = [
  P('v2-01', 'join', 1,
`SELECT *
FROM Student AS s
LEFT JOIN Hobby AS h ON s.id = h.student_id;`,
    [T.student, T.hobby],
    [`Сколько строк (R) и столбцов (C) вернёт запрос?`, `So'rov nechta qator (R) va nechta ustun (C) qaytaradi?`],
    ['R = 4, C = 5', 'R = 3, C = 5', 'R = 4, C = 4', 'R = 6, C = 5'], 0,
    [`LEFT JOIN сохраняет все строки Student: Иван (2 хобби → 2 строки), Анна (хобби нет → 1 строка с NULL), Ирина (1 хобби) = 4 строки. Столбцов 2 + 3 = 5.`,
     `LEFT JOIN Student ning barcha qatorlarini saqlaydi: Иван (2 hobbi → 2 qator), Анна (hobbi yo'q → NULL li 1 qator), Ирина (1 hobbi) = 4 qator. Ustunlar 2 + 3 = 5.`],
    'R4C5'),

  P('v2-02', 'null', 2,
`SELECT count(*), count(reg_num)
FROM Student;`,
    [T.studentReg], null,
    ['(3, 3)', '(3, 2)', '(2, 2)', '(2, 3)'], 1,
    [`count(*) считает все строки (3), а count(столбец) пропускает NULL: у Anna reg_num = NULL, значит 2.`,
     `count(*) barcha qatorlarni sanaydi (3), count(ustun) esa NULL larni o'tkazib yuboradi: Anna da reg_num = NULL, demak 2.`],
    '[3,2]'),

  P('v2-03', 'group', 2,
`SELECT employee, sum(transaction)
FROM Employee
GROUP BY employee
HAVING sum(transaction) > 300
ORDER BY 1;`,
    [T.employee], null,
    [`('Анна', 245)`, `('Иван', 430)`, `('Иван', 430), ('Анна', 245)`, NOROWS], 1,
    [`Суммы: Иван 430, Анна 245, Ирина 50. HAVING sum(transaction) > 300 оставляет только группу Иван.`,
     `Yig'indilar: Иван 430, Анна 245, Ирина 50. HAVING sum(transaction) > 300 faqat Иван guruhini qoldiradi.`],
    '["Иван",430]'),

  P('v2-04', 'aggr', 1,
`SELECT max(transaction) - min(transaction)
FROM Employee;`,
    [T.employee], null,
    ['330', '285', '45', '375'], 1,
    [`max = 330, min = 45 → 330 − 45 = 285.`,
     `max = 330, min = 45 → 330 − 45 = 285.`],
    '[285]'),

  P('v2-05', 'subq', 2,
`SELECT s.name
FROM Student AS s
WHERE NOT EXISTS (
  SELECT 1
  FROM Hobby AS h
  WHERE h.student_id = s.id
);`,
    [T.student, T.hobby], null,
    [`'Иван'`, `'Анна'`, `'Ирина'`, NOROWS], 1,
    [`NOT EXISTS оставляет студентов, у которых нет ни одной строки в Hobby. Хобби есть у Ивана (id 1) и Ирины (id 3), нет у Анны.`,
     `NOT EXISTS Hobby da birorta ham qatori yo'q talabalarni qoldiradi. Hobbi Иван (id 1) va Ирина (id 3) da bor, Анна da yo'q.`],
    '["Анна"]'),

  P('v2-06', 'null', 3,
`SELECT count(*)
FROM Student
WHERE id NOT IN (1, 2, NULL);`,
    [T.student], null,
    ['0', '1', '3', 'NULL'], 0,
    [`Ловушка NOT IN с NULL. Для id = 3: 3 ≠ 1 — TRUE, 3 ≠ 2 — TRUE, 3 ≠ NULL — NULL (неизвестно), итог NULL, и строка отбрасывается. Для id 1 и 2 условие FALSE. Результат: count(*) = 0.`,
     `NOT IN dagi NULL tuzog'i. id = 3 uchun: 3 ≠ 1 — TRUE, 3 ≠ 2 — TRUE, 3 ≠ NULL — NULL (noma'lum), natija NULL va qator tashlab yuboriladi. id 1 va 2 uchun shart FALSE. Natija: count(*) = 0.`],
    '[0]'),

  P('v2-07', 'join', 3,
`SELECT h.hobby
FROM Student AS s
INNER JOIN Hobby AS h ON s.id = h.student_id
ORDER BY h.hobby
LIMIT 1 OFFSET 1;`,
    [T.student, T.hobby], null,
    [`'Музыка'`, `'Хоккей'`, `'Плавание'`, `'Чтение'`], 1,
    [`INNER JOIN отбрасывает хобби без студента (Плавание, student_id = 4). Остаются: Музыка, Хоккей, Чтение — по алфавиту именно в таком порядке. OFFSET 1 пропускает первую, LIMIT 1 берёт следующую → 'Хоккей'.`,
     `INNER JOIN talabasi yo'q hobbilarni (Плавание, student_id = 4) tashlab yuboradi. Qoladi: Музыка, Хоккей, Чтение — alifbo bo'yicha aynan shu tartibda. OFFSET 1 birinchisini o'tkazib yuboradi, LIMIT 1 keyingisini oladi → 'Хоккей'.`],
    '["Хоккей"]'),

  P('v2-08', 'group', 2,
`SELECT s.name, count(h.id)
FROM Student AS s
LEFT JOIN Hobby AS h ON s.id = h.student_id
GROUP BY s.name
ORDER BY 2 DESC, 1
LIMIT 1;`,
    [T.student, T.hobby], null,
    [`('Иван', 2)`, `('Анна', 0)`, `('Ирина', 1)`, `('Иван', 3)`], 0,
    [`После LEFT JOIN и группировки: Иван — 2 хобби, Анна — 0 (count(h.id) не считает NULL), Ирина — 1. Сортировка по количеству по убыванию → ('Иван', 2).`,
     `LEFT JOIN va guruhlashdan keyin: Иван — 2 hobbi, Анна — 0 (count(h.id) NULL ni sanamaydi), Ирина — 1. Soni bo'yicha kamayish tartibida → ('Иван', 2).`],
    '["Иван",2]'),

  P('v2-09', 'set', 2,
`SELECT count(*)
FROM (
  SELECT id FROM Student
  UNION ALL
  SELECT student_id FROM Hobby
) AS t;`,
    [T.student, T.hobby], null,
    ['4', '7', '3', '5'], 1,
    [`UNION ALL не убирает дубликаты: 3 строки из Student + 4 строки из Hobby = 7. (Обычный UNION дал бы 4 уникальных значения.)`,
     `UNION ALL dublikatlarni olib tashlamaydi: Student dan 3 qator + Hobby dan 4 qator = 7. (Oddiy UNION 4 ta noyob qiymat bergan bo'lardi.)`],
    '[7]'),

  P('v2-10', 'set', 2,
`SELECT student_id FROM Hobby
EXCEPT
SELECT id FROM Student;`,
    [T.student, T.hobby], null,
    ['1', '2', '4', NOROWS], 2,
    [`EXCEPT возвращает значения из первого запроса, которых нет во втором. student_id в Hobby: {1, 3, 4}; id в Student: {1, 2, 3}. Разница: {4}.`,
     `EXCEPT birinchi so'rovdagi, lekin ikkinchisida yo'q qiymatlarni qaytaradi. Hobby dagi student_id: {1, 3, 4}; Student dagi id: {1, 2, 3}. Farq: {4}.`],
    '[4]'),

  P('v2-11', 'window', 2,
`SELECT employee, transaction,
       row_number() OVER (ORDER BY transaction DESC) AS rn
FROM Employee
ORDER BY rn
LIMIT 1;`,
    [T.employee], null,
    [`('Анна', 200, 1)`, `('Иван', 330, 1)`, `('Иван', 100, 1)`, `('Ирина', 50, 1)`], 1,
    [`row_number() нумерует строки по transaction от большего к меньшему: самая большая сумма 330 (Иван) получает номер 1.`,
     `row_number() qatorlarni transaction bo'yicha kattadan kichikka raqamlaydi: eng katta summa 330 (Иван) 1-raqamni oladi.`],
    '["Иван",330,1]'),

  P('v2-12', 'func', 1,
`SELECT coalesce(NULL, NULL, 3, 4);`,
    [], null,
    ['NULL', '3', '4', ERR], 1,
    [`coalesce возвращает первый аргумент, не равный NULL: здесь это 3.`,
     `coalesce NULL ga teng bo'lmagan birinchi argumentni qaytaradi: bu yerda 3.`],
    '[3]'),

  P('v2-13', 'func', 2,
`SELECT 10 / 4;`,
    [], null,
    ['2.5', '2', '3', ERR], 1,
    [`Деление двух целых в PostgreSQL целочисленное: дробная часть отбрасывается, 10 / 4 = 2. Чтобы получить 2.5, нужно 10 / 4.0 или 10::numeric / 4.`,
     `PostgreSQLda ikki butun sonni bo'lish butun sonli bo'ladi: kasr qismi tashlanadi, 10 / 4 = 2. 2.5 olish uchun 10 / 4.0 yoki 10::numeric / 4 kerak.`],
    '[2]'),

  P('v2-14', 'aggr', 1,
`SELECT count(DISTINCT employee)
FROM Employee;`,
    [T.employee], null,
    ['5', '3', '2', '1'], 1,
    [`В Employee 5 строк, но уникальных имён три: Иван, Анна, Ирина.`,
     `Employee da 5 ta qator bor, lekin noyob ismlar uchta: Иван, Анна, Ирина.`],
    '[3]'),

  P('v2-15', 'func', 2,
`SELECT name
FROM Student
WHERE name LIKE '_н%';`,
    [T.student], null,
    [`'Иван'`, `'Анна'`, `'Ирина'`, NOROWS], 1,
    [`В LIKE символ _ — ровно один любой символ, % — любое количество символов. Шаблон '_н%' означает «вторая буква н». Подходит только 'Анна' (А-н-на).`,
     `LIKE da _ — aynan bitta ixtiyoriy belgi, % — istalgan sondagi belgilar. '_н%' shabloni «ikkinchi harf н» degani. Faqat 'Анна' (А-н-на) mos keladi.`],
    '["Анна"]')
];

var V2T = [
  Q('v2-16', 'tx', 1,
    [`Что делает команда ROLLBACK?`, `ROLLBACK buyrug'i nima qiladi?`],
    [[`отменяет все изменения текущей транзакции`, `joriy tranzaksiyaning barcha o'zgarishlarini bekor qiladi`],
     [`сохраняет изменения навсегда`, `o'zgarishlarni doimiy saqlaydi`],
     [`удаляет таблицу`, `jadvalni o'chiradi`],
     [`запускает новую транзакцию`, `yangi tranzaksiyani boshlaydi`]], 0,
    [`ROLLBACK откатывает все изменения с начала транзакции. Сохраняет изменения COMMIT, а начинает транзакцию BEGIN.`,
     `ROLLBACK tranzaksiya boshidan qilingan barcha o'zgarishlarni qaytaradi. O'zgarishlarni COMMIT saqlaydi, tranzaksiyani esa BEGIN boshlaydi.`]),

  Q('v2-17', 'index', 1,
    [`Какая команда создаёт уникальный индекс?`, `Noyob (unique) indeksni qaysi buyruq yaratadi?`],
    ['CREATE UNIQUE INDEX idx ON t (col)', 'CREATE INDEX UNIQUE idx ON t (col)', 'ADD UNIQUE INDEX idx (col)', 'CREATE INDEX idx ON t (col) UNIQUE'], 0,
    [`Слово UNIQUE ставится между CREATE и INDEX: CREATE UNIQUE INDEX имя ON таблица (столбец). Такой индекс не позволит вставить повторяющиеся значения.`,
     `UNIQUE so'zi CREATE va INDEX orasiga qo'yiladi: CREATE UNIQUE INDEX nom ON jadval (ustun). Bunday indeks takrorlanuvchi qiymat kiritishga yo'l qo'ymaydi.`]),

  Q('v2-18', 'nf', 2,
    [`Что требует вторая нормальная форма (2NF)?`, `Ikkinchi normal shakl (2NF) nimani talab qiladi?`],
    [[`Таблица в 1NF, и каждый неключевой атрибут зависит от всего первичного ключа, а не от его части`, `Jadval 1NF da va har bir kalit bo'lmagan atribut birlamchi kalitning bir qismiga emas, butun kalitga bog'liq`],
     [`В таблице нет первичного ключа`, `Jadvalda birlamchi kalit yo'q`],
     [`Все столбцы содержат только числа`, `Barcha ustunlarda faqat sonlar bor`],
     [`В таблице нет внешних ключей`, `Jadvalda tashqi kalitlar yo'q`]], 0,
    [`2NF = 1NF + отсутствие частичных зависимостей: неключевой атрибут не должен зависеть только от части составного ключа. Если ключ состоит из одного столбца, 1NF-таблица уже в 2NF.`,
     `2NF = 1NF + qisman bog'liqliklarning yo'qligi: kalit bo'lmagan atribut kompozit kalitning faqat bir qismiga bog'liq bo'lmasligi kerak. Kalit bitta ustundan iborat bo'lsa, 1NF dagi jadval allaqachon 2NF da.`]),

  Q('v2-19', 'tx', 1,
    [`Какой принцип ACID означает «всё или ничего»?`, `ACID ning qaysi tamoyili «yoki hammasi, yoki hech narsa» degan ma'noni anglatadi?`],
    [[`Атомарность`, `Atomarlik (Atomicity)`], [`Согласованность`, `Izchillik (Consistency)`], [`Изоляция`, `Izolyatsiya (Isolation)`], [`Надёжность`, `Barqarorlik (Durability)`]], 0,
    [`Атомарность (Atomicity): транзакция выполняется целиком или не выполняется вовсе. Классический пример — перевод денег: списание и зачисление либо оба произошли, либо ни одно.`,
     `Atomarlik (Atomicity): tranzaksiya to'liq bajariladi yoki umuman bajarilmaydi. Klassik misol — pul o'tkazish: yechish va qo'shish ikkalasi ham bo'ladi yoki ikkalasi ham bo'lmaydi.`]),

  Q('v2-20', 'tx', 1,
    [`Какое свойство ACID гарантирует, что параллельные транзакции не мешают друг другу?`, `ACID ning qaysi xususiyati parallel tranzaksiyalar bir-biriga xalaqit bermasligini kafolatlaydi?`],
    [[`Атомарность`, `Atomarlik (Atomicity)`], [`Изоляция`, `Izolyatsiya (Isolation)`], [`Надёжность`, `Barqarorlik (Durability)`], [`Согласованность`, `Izchillik (Consistency)`]], 1,
    [`Изоляция (Isolation): каждая транзакция выполняется так, будто других нет; степень изоляции задаётся уровнем (READ COMMITTED, REPEATABLE READ, SERIALIZABLE).`,
     `Izolyatsiya (Isolation): har bir tranzaksiya boshqalar yo'qdek bajariladi; izolyatsiya darajasi sath bilan belgilanadi (READ COMMITTED, REPEATABLE READ, SERIALIZABLE).`]),

  Q('v2-21', 'tx', 2,
    [`Что означает свойство Consistency (согласованность) в ACID?`, `ACID dagi Consistency (izchillik) xususiyati nimani anglatadi?`],
    [[`транзакция переводит БД из одного корректного состояния в другое, не нарушая ограничений`, `tranzaksiya MBni bir to'g'ri holatdan boshqasiga o'tkazadi, cheklovlarni buzmaydi`],
     [`данные хранятся на нескольких серверах`, `ma'lumotlar bir nechta serverda saqlanadi`],
     [`транзакции выполняются строго по очереди`, `tranzaksiyalar qat'iy navbat bilan bajariladi`],
     [`результат сохраняется после сбоя`, `natija nosozlikdan keyin ham saqlanadi`]], 0,
    [`Согласованность: после транзакции все ограничения (PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE) соблюдены. Сохранность после сбоя — это Durability, строгая очередь — Serializable-изоляция.`,
     `Izchillik: tranzaksiyadan keyin barcha cheklovlar (PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE) bajarilgan bo'ladi. Nosozlikdan keyin saqlanish — Durability, qat'iy navbat — Serializable izolyatsiya.`]),

  Q('v2-22', 'keys', 1,
    [`Для чего нужен внешний ключ (FOREIGN KEY)?`, `Tashqi kalit (FOREIGN KEY) nima uchun kerak?`],
    [[`для ускорения поиска`, `qidiruvni tezlashtirish uchun`],
     [`для обеспечения ссылочной целостности между таблицами`, `jadvallar orasida havola yaxlitligini (referential integrity) ta'minlash uchun`],
     [`для шифрования данных`, `ma'lumotlarni shifrlash uchun`],
     [`для хранения больших файлов`, `katta fayllarni saqlash uchun`]], 1,
    [`Внешний ключ гарантирует, что значение в столбце ссылается на существующую строку родительской таблицы: нельзя добавить хобби для несуществующего студента. Ускоряет поиск индекс, а не внешний ключ.`,
     `Tashqi kalit ustundagi qiymat ota jadvalning mavjud qatoriga havola qilishini kafolatlaydi: mavjud bo'lmagan talaba uchun hobbi qo'shib bo'lmaydi. Qidiruvni indeks tezlashtiradi, tashqi kalit emas.`]),

  Q('v2-23', 'keys', 2,
    [`Какое утверждение о первичном ключе (PRIMARY KEY) верно?`, `Birlamchi kalit (PRIMARY KEY) haqidagi qaysi fikr to'g'ri?`],
    [[`может содержать NULL и повторы`, `NULL va takrorlarni o'z ichiga olishi mumkin`],
     [`значения уникальны и не могут быть NULL`, `qiymatlari noyob va NULL bo'lishi mumkin emas`],
     [`в таблице может быть сколько угодно первичных ключей`, `jadvalda xohlagancha birlamchi kalit bo'lishi mumkin`],
     [`всегда состоит из одного столбца`, `doim bitta ustundan iborat`]], 1,
    [`PRIMARY KEY = UNIQUE + NOT NULL. В таблице он только один, но может быть составным (из нескольких столбцов).`,
     `PRIMARY KEY = UNIQUE + NOT NULL. Jadvalda u faqat bitta, lekin kompozit (bir nechta ustundan) bo'lishi mumkin.`]),

  Q('v2-24', 'keys', 2,
    [`Что гарантирует ограничение UNIQUE?`, `UNIQUE cheklovi nimani kafolatlaydi?`],
    [[`значения в столбце не повторяются`, `ustundagi qiymatlar takrorlanmaydi`],
     [`значение не может быть NULL`, `qiymat NULL bo'lishi mumkin emas`],
     [`значение всегда число`, `qiymat doim son`],
     [`столбец ссылается на другую таблицу`, `ustun boshqa jadvalga havola qiladi`]], 0,
    [`UNIQUE запрещает повторяющиеся значения. В отличие от PRIMARY KEY, он допускает NULL (в PostgreSQL можно несколько NULL, потому что NULL ≠ NULL). Запрет NULL — это NOT NULL.`,
     `UNIQUE takrorlanuvchi qiymatlarni taqiqlaydi. PRIMARY KEY dan farqli o'laroq NULL ga ruxsat beradi (PostgreSQLda bir nechta NULL mumkin, chunki NULL ≠ NULL). NULL ni taqiqlash — NOT NULL.`]),

  Q('v2-25', 'ddl', 2,
    [`Какое утверждение о TRUNCATE верно?`, `TRUNCATE haqidagi qaysi fikr to'g'ri?`],
    [[`быстро удаляет все строки таблицы и не поддерживает WHERE`, `jadvalning barcha qatorlarini tez o'chiradi va WHERE ni qo'llab-quvvatlamaydi`],
     [`удаляет саму таблицу вместе со структурой`, `jadvalning o'zini tuzilmasi bilan birga o'chiradi`],
     [`удаляет только строки со значением NULL`, `faqat NULL qiymatli qatorlarni o'chiradi`],
     [`удаляет только дубликаты`, `faqat dublikatlarni o'chiradi`]], 0,
    [`TRUNCATE очищает таблицу целиком (структура остаётся) и не принимает WHERE. DELETE удаляет строки по условию, DROP TABLE удаляет таблицу вместе со структурой.`,
     `TRUNCATE jadvalni butunlay tozalaydi (tuzilma qoladi) va WHERE qabul qilmaydi. DELETE shart bo'yicha qatorlarni o'chiradi, DROP TABLE jadvalni tuzilmasi bilan o'chiradi.`]),

  Q('v2-26', 'cap', 1,
    [`Какая из перечисленных СУБД не является реляционной?`, `Quyidagi MBBTlardan qaysi biri relyatsion emas?`],
    ['PostgreSQL', 'MySQL', 'SQLite', 'Redis'], 3,
    [`Redis — NoSQL-хранилище типа «ключ–значение». PostgreSQL, MySQL и SQLite — реляционные.`,
     `Redis — «kalit–qiymat» turidagi NoSQL ombori. PostgreSQL, MySQL va SQLite — relyatsion.`]),

  Q('v2-27', 'model', 2,
    [`Какой тип связи между «Клиент» и «Заказ», если клиент может сделать много заказов, а заказ принадлежит только одному клиенту?`, `«Mijoz» va «Buyurtma» orasidagi bog'lanish turi qanday, agar mijoz ko'p buyurtma bera olsa, buyurtma esa faqat bitta mijozga tegishli bo'lsa?`],
    [[`один к одному (1:1)`, `birga bir (1:1)`], [`один ко многим (1:N)`, `birga ko'p (1:N)`], [`многие ко многим (M:N)`, `ko'pga ko'p (M:N)`], [`связи нет`, `bog'lanish yo'q`]], 1,
    [`Это связь «один ко многим». Внешний ключ ставится на стороне «многие»: в таблице Order появляется столбец customer_id.`,
     `Bu «birga ko'p» bog'lanish. Tashqi kalit «ko'p» tomonida qo'yiladi: Order jadvalida customer_id ustuni paydo bo'ladi.`]),

  Q('v2-28', 'cap', 3,
    [`Что выбирает CP-система при разделении сети (partition)?`, `CP-tizim tarmoq bo'linishi (partition) paytida nimani tanlaydi?`],
    [[`Согласованность, жертвуя доступностью`, `Izchillikni tanlaydi, mavjudlikdan voz kechadi`],
     [`Доступность, жертвуя согласованностью`, `Mavjudlikni tanlaydi, izchillikdan voz kechadi`],
     [`Отказывается от устойчивости к разделению`, `Bo'linishga bardoshlilikdan voz kechadi`],
     [`Одновременно все три свойства`, `Uchala xususiyatni bir vaqtda ta'minlaydi`]], 0,
    [`В распределённой системе разрыв сети неизбежен, поэтому выбор идёт между C и A. CP-система предпочитает не отвечать (или отказывать), лишь бы не выдать устаревшие данные; AP-система отвечает всегда, но данные могут быть устаревшими.`,
     `Taqsimlangan tizimda tarmoq uzilishi muqarrar, shuning uchun tanlov C va A orasida. CP-tizim eskirgan ma'lumot bermaslik uchun javob bermaslikni (yoki rad etishni) afzal ko'radi; AP-tizim doim javob beradi, lekin ma'lumot eskirgan bo'lishi mumkin.`]),

  Q('v2-29', 'index', 2,
    [`Какой недостаток есть у индексов?`, `Indekslarning qanday kamchiligi bor?`],
    [[`замедляют INSERT / UPDATE / DELETE и занимают место на диске`, `INSERT / UPDATE / DELETE ni sekinlashtiradi va diskda joy egallaydi`],
     [`замедляют все запросы SELECT`, `barcha SELECT so'rovlarini sekinlashtiradi`],
     [`запрещают использовать JOIN`, `JOIN ishlatishni taqiqlaydi`],
     [`автоматически удаляют дубликаты`, `dublikatlarni avtomatik o'chiradi`]], 0,
    [`Индекс ускоряет чтение, но при каждой записи его нужно обновлять, и он занимает место. Поэтому индексируют только те столбцы, по которым часто ищут или соединяют.`,
     `Indeks o'qishni tezlashtiradi, lekin har yozishda uni yangilash kerak va u joy egallaydi. Shuning uchun faqat tez-tez qidiriladigan yoki bog'lanadigan ustunlar indekslanadi.`]),

  Q('v2-30', 'model', 1,
    [`Чему в реляционной БД обычно соответствует сущность (entity) из ER-модели?`, `ER-modeldagi ob'ekt (entity) relyatsion MBda odatda nimaga mos keladi?`],
    [[`таблице`, `jadvalga`], [`индексу`, `indeksga`], [`транзакции`, `tranzaksiyaga`], [`запросу SELECT`, `SELECT so'roviga`]], 0,
    [`Соответствие: сущность → таблица, атрибут → столбец, экземпляр сущности → строка, связь → внешний ключ.`,
     `Moslik: ob'ekt (entity) → jadval, atribut → ustun, ob'ekt nusxasi → qator, bog'lanish → tashqi kalit.`])
];
