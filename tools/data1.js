/* Shared definitions + Variant 1 (30 questions from the student's questions.txt)
   Every text field is either a plain string (same in both languages) or [ru, uz]. */
var ERR = [`синт. ошибка`, `sintaksis xato`];
var NOROWS = [`не вернет ни одной строки`, `birorta ham qator qaytarmaydi`];
var PQ = [`Что вернёт запрос?`, `So'rov nima qaytaradi?`];

var TOPICS = {
  join:   [`JOIN`, `JOIN`],
  null:   [`NULL`, `NULL`],
  group:  [`GROUP BY / HAVING`, `GROUP BY / HAVING`],
  aggr:   [`Агрегаты`, `Agregatlar`],
  cte:    [`CTE`, `CTE`],
  subq:   [`Подзапросы`, `Ichki so'rovlar`],
  window: [`Оконные функции`, `Oyna funksiyalari`],
  set:    [`UNION / EXCEPT`, `UNION / EXCEPT`],
  order:  [`ORDER BY / LIMIT`, `ORDER BY / LIMIT`],
  func:   [`Функции и выражения`, `Funksiya va ifodalar`],
  basic:  [`SELECT / WHERE`, `SELECT / WHERE`],
  index:  [`Индексы`, `Indekslar`],
  tx:     [`Транзакции / ACID`, `Tranzaksiya / ACID`],
  nf:     [`Нормальные формы`, `Normal shakllar`],
  keys:   [`Ключи и ограничения`, `Kalit va cheklovlar`],
  model:  [`ER-модель`, `ER-model`],
  dbms:   [`СУБД и основы`, `MBBT va asoslar`],
  cap:    [`CAP / NoSQL`, `CAP / NoSQL`],
  ddl:    [`DDL / DML / VIEW`, `DDL / DML / VIEW`]
};

var T = {
  student:    { n: 'Student', c: ['id', 'name'], r: [[1, 'Иван'], [2, 'Анна'], [3, 'Ирина']] },
  studentEn:  { n: 'Student', c: ['id', 'name'], r: [[1, 'Ivan'], [2, 'Anna'], [3, 'Irina']] },
  studentReg: { n: 'Student', c: ['id', 'name', 'reg_num'], r: [[1, 'Ivan', 123], [2, 'Anna', null], [3, 'Irina', 456]] },
  hobby:      { n: 'Hobby', c: ['id', 'student_id', 'hobby'], r: [[10, 1, 'Хоккей'], [20, 1, 'Музыка'], [30, 3, 'Чтение'], [40, 4, 'Плавание']] },
  hobbyEn:    { n: 'Hobby', c: ['id', 'student_id', 'hobby'], r: [[10, 1, 'Hockey'], [20, 1, 'Music'], [30, 3, 'Reading'], [40, 4, 'Swimming']] },
  hobbyName:  { n: 'Hobby', c: ['id', 'student', 'hobby'], r: [[1, 'Иван', 'Хоккей'], [2, 'Анна', 'Блог'], [3, 'Ирина', 'Чтение'], [4, 'Иван', 'Футбол'], [5, 'Анна', 'Спорт']] },
  employee:   { n: 'Employee', c: ['id', 'employee', 'transaction'], r: [[1, 'Иван', 100], [2, 'Анна', 200], [3, 'Ирина', 50], [4, 'Иван', 330], [5, 'Анна', 45]] }
};

/* P = practice (SQL result), Q = theory. chk = expected first row / ERR / EMPTY / RxCy (used only by verify.js) */
function P(id, t, d, code, tables, q, o, a, e, chk) { return { id: id, t: t, d: d, p: 1, code: code, tables: tables, q: q || PQ, o: o, a: a, e: e, chk: chk }; }
function Q(id, t, d, q, o, a, e) { return { id: id, t: t, d: d, p: 0, q: q, o: o, a: a, e: e }; }

var V1 = [
  P('v1-01', 'join', 1,
`SELECT *
FROM Student AS s
CROSS JOIN Hobby AS h;`,
    [T.student, T.hobby],
    [`Сколько строк (R) и столбцов (C) вернёт запрос?`, `So'rov nechta qator (R) va nechta ustun (C) qaytaradi?`],
    ['R = 12, C = 5', 'R = 4, C = 4', 'R = 4, C = 5', 'R = 12, C = 4'], 0,
    [`CROSS JOIN перемножает строки: 3 студента × 4 хобби = 12 строк. Выбираются все столбцы обеих таблиц: id, name (Student) + id, student_id, hobby (Hobby) = 5 столбцов.`,
     `CROSS JOIN qatorlarni ko'paytiradi: 3 talaba × 4 hobbi = 12 qator. Ikkala jadvalning barcha ustunlari olinadi: id, name (Student) + id, student_id, hobby (Hobby) = 5 ustun.`],
    'R12C5'),

  Q('v1-02', 'index', 1,
    [`Какая команда используется для создания составного индекса?`, `Kompozit (bir nechta ustunli) indeks yaratish uchun qaysi buyruq ishlatiladi?`],
    ['CREATE INDEX comp_index on table_name (col1, col2)', 'ADD COMPOSITE INDEX', 'CREATE INDEX table_name (col, index, col2)', 'CREATE COMPOSITE INDEX'], 0,
    [`Правильный синтаксис: CREATE INDEX имя ON таблица (поле1, поле2). Составной индекс строится сразу по нескольким столбцам; отдельного ключевого слова COMPOSITE в SQL нет.`,
     `To'g'ri sintaksis: CREATE INDEX nom ON jadval (ustun1, ustun2). Kompozit indeks bir nechta ustun bo'yicha birdaniga quriladi; SQLda COMPOSITE degan alohida kalit so'z yo'q.`]),

  Q('v1-03', 'tx', 1,
    [`Какое действие выполняет команда COMMIT?`, `COMMIT buyrug'i qanday amalni bajaradi?`],
    [[`подтверждает все изменения, сделанные в текущей транзакции`, `joriy tranzaksiyada qilingan barcha o'zgarishlarni tasdiqlaydi`],
     [`применяет изменения текущей транзакции только для чтения`, `joriy tranzaksiya o'zgarishlarini faqat o'qish uchun qo'llaydi`],
     [`отменяет текущую транзакцию`, `joriy tranzaksiyani bekor qiladi`],
     [`отменяет все изменения`, `barcha o'zgarishlarni bekor qiladi`]], 0,
    [`COMMIT сохраняет все изменения, сделанные с начала транзакции, и делает их видимыми для других. Отмена изменений — это ROLLBACK.`,
     `COMMIT tranzaksiya boshidan qilingan barcha o'zgarishlarni saqlaydi va boshqalarga ko'rinadigan qiladi. O'zgarishlarni bekor qilish esa ROLLBACK.`]),

  Q('v1-04', 'nf', 1,
    [`Что представляет собой первая нормальная форма (1NF)?`, `Birinchi normal shakl (1NF) nimani anglatadi?`],
    [[`Все атрибуты зависят от первичного ключа`, `Barcha atributlar birlamchi kalitga bog'liq`],
     [`Все значения атрибутов в таблице уникальны`, `Jadvaldagi barcha atribut qiymatlari noyob`],
     [`Каждая таблица имеет первичный ключ`, `Har bir jadvalda birlamchi kalit bor`],
     [`Каждая ячейка в таблице содержит только 1 значение`, `Jadvalning har bir katagida faqat 1 ta qiymat bor`]], 3,
    [`1NF требует атомарности: в каждой ячейке только одно значение (нет списков и повторяющихся групп).`,
     `1NF atomarlikni talab qiladi: har bir katakda faqat bitta qiymat bo'ladi (ro'yxatlar va takrorlanuvchi guruhlar yo'q).`]),

  P('v1-05', 'order', 2,
`SELECT reg_num
FROM Student
ORDER BY reg_num NULLS LAST
LIMIT 1;`,
    [T.studentReg], null,
    ['456', 'NULL', NOROWS, '123'], 3,
    [`NULLS LAST ставит NULL в конец. ORDER BY reg_num по возрастанию: 123, 456, NULL. LIMIT 1 берёт первый элемент → 123.`,
     `NULLS LAST NULL larni oxiriga qo'yadi. ORDER BY reg_num o'sish tartibida: 123, 456, NULL. LIMIT 1 birinchisini oladi → 123.`],
    '[123]'),

  P('v1-06', 'group', 2,
`SELECT employee, sum(transaction)
FROM Employee
GROUP BY employee
ORDER BY 2 DESC
LIMIT 1;`,
    [T.employee], null,
    [`('Анна', 530)`, ERR, `('Иван', 430)`, `('Ирина', 50)`], 2,
    [`Суммы по сотрудникам: Иван 100 + 330 = 430, Анна 200 + 45 = 245, Ирина 50. Сортировка по 2-му столбцу по убыванию → Иван (430) на первом месте.`,
     `Xodimlar bo'yicha yig'indilar: Иван 100 + 330 = 430, Анна 200 + 45 = 245, Ирина 50. 2-ustun bo'yicha kamayish tartibida → Иван (430) birinchi.`],
    '["Иван",430]'),

  P('v1-07', 'cte', 3,
`WITH _a AS (
  SELECT s.name, h.hobby
  FROM Student AS s
  RIGHT JOIN Hobby AS h ON s.id = h.student_id
  ORDER BY s.name NULLS FIRST
  LIMIT 1
),
_b AS (
  SELECT 1/0 AS res
)
SELECT * FROM _a;`,
    [T.student, T.hobby], null,
    [NOROWS, `('Иван', 'Музыка')`, `(NULL, 'Плавание')`, `('Анна', NULL)`], 2,
    [`CTE _b с делением на 0 в основном запросе не используется, поэтому PostgreSQL его не выполняет и ошибки нет. В _a: RIGHT JOIN даёт строку (NULL, 'Плавание') — у хобби с student_id = 4 нет студента; NULLS FIRST ставит её первой, LIMIT 1 берёт её.`,
     `Asosiy so'rovda CTE _b ishlatilmaydi, shuning uchun PostgreSQL uni bajarmaydi va 0 ga bo'lish xatosi chiqmaydi. _a da: RIGHT JOIN (NULL, 'Плавание') qatorini beradi — student_id = 4 bo'lgan hobbining talabasi yo'q; NULLS FIRST uni birinchi qiladi, LIMIT 1 shuni oladi.`],
    '[null,"Плавание"]'),

  Q('v1-08', 'keys', 1,
    [`Какая команда используется для создания FOREIGN KEY?`, `FOREIGN KEY yaratish uchun qaysi buyruq ishlatiladi?`],
    ['ALTER VIEW', 'INSERT INTO', 'CREATE INDEX', 'ADD CONSTRAINT'], 3,
    [`Внешний ключ добавляется так: ALTER TABLE t ADD CONSTRAINT fk_name FOREIGN KEY (col) REFERENCES other_table (id). Ключевая часть — ADD CONSTRAINT.`,
     `Tashqi kalit shunday qo'shiladi: ALTER TABLE t ADD CONSTRAINT fk_name FOREIGN KEY (col) REFERENCES other_table (id). Asosiy qism — ADD CONSTRAINT.`]),

  P('v1-09', 'null', 2,
`SELECT sum(tl.value)
FROM (SELECT NULL::INTEGER AS value) AS tl;`,
    [], null,
    [ERR, 'NULL', '1', '0'], 1,
    [`SUM по значениям, которые все NULL (или по пустому набору), возвращает NULL, а не 0. Чтобы получить 0, нужен coalesce(sum(...), 0).`,
     `Hammasi NULL bo'lgan (yoki bo'sh) qiymatlar ustidan SUM 0 emas, NULL qaytaradi. 0 olish uchun coalesce(sum(...), 0) kerak.`],
    '[null]'),

  P('v1-10', 'order', 2,
`SELECT DISTINCT employee AS emp
FROM Employee
ORDER BY 1 DESC
LIMIT 1;`,
    [T.employee], null,
    [`'Анна'`, `'Ирина'`, `'Иван'`, ERR], 1,
    [`DISTINCT оставляет Иван, Анна, Ирина. Сортировка по алфавиту в обратном порядке (DESC): Ирина > Иван > Анна («Ир…» идёт после «Ив…», потому что «р» после «в»). Первая строка — 'Ирина'.`,
     `DISTINCT Иван, Анна, Ирина ni qoldiradi. Alifbo bo'yicha teskari tartib (DESC): Ирина > Иван > Анна («Ир…» «Ив…» dan keyin keladi, chunki «р» «в» dan keyin). Birinchi qator — 'Ирина'.`],
    '["Ирина"]'),

  P('v1-11', 'join', 2,
`SELECT s.name, h.hobby
FROM Student AS s
RIGHT JOIN Hobby AS h ON s.id = h.student_id
ORDER BY s.name NULLS FIRST;`,
    [T.student, T.hobby],
    [`Какая строка будет первой в результате?`, `Natijadagi birinchi qator qaysi?`],
    [NOROWS, `('Анна', NULL)`, `('Иван', 'Музыка')`, `(NULL, 'Плавание')`], 3,
    [`Хобби с student_id = 4 нет в Student, но RIGHT JOIN сохраняет все строки Hobby, поэтому для него name = NULL. NULLS FIRST ставит эту строку первой: (NULL, 'Плавание').`,
     `student_id = 4 bo'lgan hobbi Student da yo'q, lekin RIGHT JOIN Hobby ning barcha qatorlarini saqlaydi, shuning uchun name = NULL bo'ladi. NULLS FIRST bu qatorni birinchi qiladi: (NULL, 'Плавание').`],
    '[null,"Плавание"]'),

  Q('v1-12', 'cap', 1,
    [`Какая из перечисленных не относится к реляционным БД?`, `Quyidagilardan qaysi biri relyatsion MBga kirmaydi?`],
    ['psql', 'mysql', 'mongodb', 'oracle'], 2,
    [`MongoDB — документо-ориентированная NoSQL-база (данные в виде JSON-подобных документов), а не реляционная. (psql — это консольный клиент PostgreSQL, реляционной СУБД; в этом вопросе правильный ответ — mongodb.)`,
     `MongoDB — hujjatga yo'naltirilgan NoSQL baza (ma'lumotlar JSON o'xshash hujjatlar ko'rinishida), relyatsion emas. (psql — PostgreSQL (relyatsion MBBT) ning konsol klienti; bu savolda to'g'ri javob — mongodb.)`]),

  Q('v1-13', 'model', 1,
    [`Какое из следующих понятий описывает связь между двумя сущностями в логической модели данных?`, `Quyidagilardan qaysi tushuncha mantiqiy ma'lumotlar modelida ikki ob'ekt (entity) orasidagi bog'lanishni tasvirlaydi?`],
    [[`Индекс`, `Indeks`], [`Внешний ключ`, `Tashqi kalit`], [`Триггер`, `Trigger`], [`Хеш-код`, `Xesh-kod`]], 1,
    [`Внешний ключ (FOREIGN KEY) связывает строки одной таблицы со строками другой и тем самым задаёт логическую связь между сущностями.`,
     `Tashqi kalit (FOREIGN KEY) bir jadval qatorlarini boshqa jadval qatorlari bilan bog'laydi va shu bilan ob'ektlar orasidagi mantiqiy bog'lanishni belgilaydi.`]),

  P('v1-14', 'subq', 3,
`SELECT count(*)
FROM Student AS s
WHERE id IN (SELECT * FROM Hobby);`,
    [T.studentEn, T.hobbyEn], null,
    ['NULL', '2', '3', ERR], 3,
    [`Подзапрос в IN должен возвращать один столбец. SELECT * FROM Hobby возвращает три (id, student_id, hobby), поэтому PostgreSQL выдаёт ошибку: «subquery has too many columns».`,
     `IN ichidagi ichki so'rov bitta ustun qaytarishi kerak. SELECT * FROM Hobby uchta ustun (id, student_id, hobby) qaytaradi, shuning uchun PostgreSQL xato beradi: «subquery has too many columns».`],
    'ERR'),

  P('v1-15', 'group', 2,
`SELECT student
FROM Hobby
GROUP BY student
HAVING student LIKE '%Анна%'
LIMIT 1;`,
    [T.hobbyName], null,
    [`'Анна'`, ERR, NOROWS, 'NULL'], 0,
    [`HAVING применяется после GROUP BY и может фильтровать по столбцу группировки. Группы: Иван, Анна, Ирина; условие LIKE '%Анна%' оставляет только 'Анна'.`,
     `HAVING GROUP BY dan keyin qo'llanadi va guruhlash ustuni bo'yicha filtrlay oladi. Guruhlar: Иван, Анна, Ирина; LIKE '%Анна%' sharti faqat 'Анна' ni qoldiradi.`],
    '["Анна"]'),

  Q('v1-16', 'model', 1,
    [`Какой из следующих языков используется для описания логической модели данных?`, `Quyidagi tillardan qaysi biri mantiqiy ma'lumotlar modelini tasvirlash uchun ishlatiladi?`],
    ['HTML', 'SQL', 'UML', 'JSON'], 2,
    [`UML — язык для визуального описания модели: сущностей, их атрибутов и связей между ними.`,
     `UML — modelni vizual tasvirlash tili: ob'ektlar, ularning atributlari va ular orasidagi bog'lanishlar.`]),

  Q('v1-17', 'keys', 1,
    [`Что произойдет, если объект с CHECK CONSTRAINT не пройдет проверку при вставке?`, `Agar CHECK CONSTRAINT li ob'ekt qo'shishda tekshiruvdan o'tmasa nima bo'ladi?`],
    [[`Ограничение будет автоматически отключено`, `Cheklov avtomatik o'chiriladi`],
     [`Данные будут автоматически удалены`, `Ma'lumotlar avtomatik o'chiriladi`],
     [`БД выдаст предупреждение, но продолжит операцию`, `MB ogohlantirish beradi, lekin amalni davom ettiradi`],
     [`Операция вставки или обновления будет отклонена`, `INSERT yoki UPDATE amali rad etiladi`]], 3,
    [`CHECK CONSTRAINT запрещает вставку и обновление данных, нарушающих условие: операция завершается ошибкой и ничего не записывается.`,
     `CHECK CONSTRAINT shartni buzuvchi ma'lumotlarni kiritish va yangilashni taqiqlaydi: amal xato bilan tugaydi va hech narsa yozilmaydi.`]),

  Q('v1-18', 'dbms', 2,
    [`Какая из перечисленных служб управляет доступом к данным?`, `Quyidagi xizmatlardan qaysi biri ma'lumotlarga kirishni boshqaradi?`],
    ['SQL server', 'Transaction Manager', 'Query Optimizer', 'DBMS'], 3,
    [`DBMS (СУБД) управляет хранением, изменением и доступом к данным. Transaction Manager отвечает только за транзакции, Query Optimizer — за выбор плана запроса, а «SQL server» — это конкретный продукт.`,
     `DBMS (MBBT) ma'lumotlarni saqlash, o'zgartirish va ularga kirishni boshqaradi. Transaction Manager faqat tranzaksiyalar uchun, Query Optimizer — so'rov rejasini tanlash uchun javob beradi, «SQL server» esa muayyan mahsulot.`]),

  Q('v1-19', 'tx', 1,
    [`Какой принцип ACID гарантирует, что если транзакция прошла успешно, изменения будут сохранены даже в случае сбоя?`, `ACID ning qaysi tamoyili tranzaksiya muvaffaqiyatli o'tgan bo'lsa, nosozlik bo'lganda ham o'zgarishlar saqlanishini kafolatlaydi?`],
    [[`Надежность`, `Barqarorlik (Durability)`], [`Согласованность`, `Izchillik (Consistency)`], [`Изоляция`, `Izolyatsiya (Isolation)`], [`Атомарность`, `Atomarlik (Atomicity)`]], 0,
    [`Надёжность (Durability): после COMMIT данные не пропадут даже при сбое питания или падении системы. ACID = Atomicity, Consistency, Isolation, Durability.`,
     `Barqarorlik (Durability): COMMIT dan keyin ma'lumotlar elektr o'chishi yoki tizim qulashida ham yo'qolmaydi. ACID = Atomicity, Consistency, Isolation, Durability.`]),

  P('v1-20', 'window', 3,
`SELECT employee
FROM (
  SELECT employee,
         row_number() OVER (ORDER BY transaction) AS row_num
  FROM Employee
  GROUP BY employee
) AS tl
WHERE tl.row_num = 2
ORDER BY 1 ASC
LIMIT 1;`,
    [T.employee], null,
    [ERR, `'Анна'`, `'Иван'`, `'Ирина'`], 0,
    [`Ошибка: столбец transaction не входит в GROUP BY и не обёрнут в агрегат, а оконная функция выполняется уже после группировки и видит только сгруппированные данные. PostgreSQL: «column employee.transaction must appear in the GROUP BY clause or be used in an aggregate function».`,
     `Xato: transaction ustuni GROUP BY da yo'q va agregat ichiga olinmagan, oyna funksiyasi esa guruhlashdan keyin bajariladi va faqat guruhlangan ma'lumotni ko'radi. PostgreSQL: «column employee.transaction must appear in the GROUP BY clause or be used in an aggregate function».`],
    'ERR'),

  P('v1-21', 'subq', 2,
`SELECT count(*)
FROM Student AS s
WHERE EXISTS (
  SELECT NULL
  FROM Hobby AS h
  WHERE h.student_id = s.id
  LIMIT 1
);`,
    [T.studentEn, T.hobbyEn], null,
    ['NULL', '3', '2', NOROWS], 2,
    [`EXISTS проверяет, вернул ли подзапрос хотя бы одну строку (что именно в SELECT — неважно). Хобби есть только у студентов 1 (Ivan) и 3 (Irina) → 2.`,
     `EXISTS ichki so'rov kamida bitta qator qaytarganini tekshiradi (SELECT da nima turgani muhim emas). Hobbisi faqat 1 (Ivan) va 3 (Irina) talabalarda bor → 2.`],
    '[2]'),

  P('v1-22', 'set', 2,
`SELECT string_agg(tl.id::VARCHAR, ',' ORDER BY tl.id) AS result
FROM (
  SELECT s.id FROM Student AS s
  UNION
  SELECT h.student_id FROM Hobby AS h
) AS tl;`,
    [T.student, T.hobby], null,
    ['1, 1, 2, 3, 3, 4', '1, 2, 3, 4', '1, 1, 1, 2, 3, 3, 4', ERR], 1,
    [`UNION убирает дубликаты: из {1, 2, 3} и {1, 1, 3, 4} получается {1, 2, 3, 4}. string_agg склеивает их в одну строку '1,2,3,4'. (UNION ALL оставил бы все 7 значений.)`,
     `UNION dublikatlarni olib tashlaydi: {1, 2, 3} va {1, 1, 3, 4} dan {1, 2, 3, 4} chiqadi. string_agg ularni bitta '1,2,3,4' qatoriga birlashtiradi. (UNION ALL barcha 7 qiymatni qoldirardi.)`],
    '["1,2,3,4"]'),

  Q('v1-23', 'dbms', 1,
    [`Что подходит под термин «реляционная БД»?`, `«Relyatsion MB» atamasiga nima mos keladi?`],
    [[`большие файлы`, `katta fayllar`],
     [`хранилище JSON-файлов`, `JSON-fayllar ombori`],
     [`на графах`, `graflarga asoslangan`],
     [`структура данных, основанная на связях между таблицами`, `jadvallar orasidagi bog'lanishlarga asoslangan ma'lumotlar tuzilmasi`]], 3,
    [`Реляционная модель — это таблицы (отношения), связанные друг с другом через ключи.`,
     `Relyatsion model — bu kalitlar orqali bir-biri bilan bog'langan jadvallar (munosabatlar).`]),

  Q('v1-24', 'cap', 2,
    [`Что означает CAP в CAP-теореме?`, `CAP teoremasidagi CAP nimani anglatadi?`],
    ['Connection, Authentication, Persistence', 'Consistency, Availability, Partition Tolerance', 'Consistency, Accuracy, Performance', 'Coordination, Availability, Processing'], 1,
    [`CAP: Consistency (согласованность), Availability (доступность), Partition tolerance (устойчивость к разделению сети). В распределённой системе при разрыве сети можно гарантировать только два из трёх.`,
     `CAP: Consistency (izchillik), Availability (mavjudlik), Partition tolerance (tarmoq bo'linishiga bardoshlilik). Taqsimlangan tizimda tarmoq uzilganda uchtadan faqat ikkitasini kafolatlash mumkin.`]),

  P('v1-25', 'basic', 1,
`SELECT 1 + 1 AS value
WHERE 1 = 1 AND 2 = 1;`,
    [], null,
    ['NULL', '2', NOROWS, ERR], 2,
    [`В PostgreSQL SELECT без FROM допустим. WHERE 1 = 1 AND 2 = 1 → TRUE AND FALSE = FALSE, значит ни одна строка не вернётся (пустой результат, а не NULL).`,
     `PostgreSQLda FROM siz SELECT mumkin. WHERE 1 = 1 AND 2 = 1 → TRUE AND FALSE = FALSE, demak birorta ham qator qaytmaydi (bo'sh natija, NULL emas).`],
    'EMPTY'),

  Q('v1-26', 'keys', 1,
    [`Что такое первичный ключ?`, `Birlamchi kalit nima?`],
    [[`Столбец содержащий внешний ключ`, `Tashqi kalitni o'z ichiga olgan ustun`],
     [`Столбец с дублирующимися значениями`, `Takrorlanuvchi qiymatli ustun`],
     [`Столбец с уникальным значением и NULL`, `Noyob qiymatli va NULL ruxsat etilgan ustun`],
     [`Уникальный идентификатор записей в таблице`, `Jadvaldagi yozuvlarning noyob identifikatori`]], 3,
    [`Первичный ключ (PRIMARY KEY) — уникальный идентификатор строки; значения не повторяются и не могут быть NULL.`,
     `Birlamchi kalit (PRIMARY KEY) — qatorning noyob identifikatori; qiymatlar takrorlanmaydi va NULL bo'lishi mumkin emas.`]),

  Q('v1-27', 'model', 1,
    [`Что концептуально представляет собой структура ER-модели?`, `ER-modelning tuzilmasi konseptual jihatdan nimani ifodalaydi?`],
    [[`Характеристики сущностей`, `Ob'ektlar (entity) xususiyatlari`],
     [`Имена сущностей`, `Ob'ekt nomlari`],
     [`Ключевые слова`, `Kalit so'zlar`],
     [`Отношения между сущностями`, `Ob'ektlar orasidagi munosabatlar`]], 3,
    [`ER-модель (Entity–Relationship) описывает сущности и отношения между ними; именно отношения — основная суть структуры.`,
     `ER-model (Entity–Relationship) ob'ektlar va ular orasidagi munosabatlarni tasvirlaydi; tuzilmaning asosiy mohiyati aynan munosabatlar.`]),

  P('v1-28', 'null', 3,
`SELECT CASE
         WHEN NULL = 5  THEN 'A'
         WHEN NULL <> 5 THEN 'B'
         ELSE 'C'
       END AS result;`,
    [], null,
    [`'C'`, 'NULL', `'A'`, `'B'`], 0,
    [`Любое сравнение с NULL даёт NULL (неизвестно), а CASE срабатывает только на TRUE. NULL = 5 → NULL, NULL <> 5 → NULL, поэтому выполняется ELSE → 'C'.`,
     `NULL bilan har qanday taqqoslash NULL (noma'lum) beradi, CASE esa faqat TRUE da ishlaydi. NULL = 5 → NULL, NULL <> 5 → NULL, shuning uchun ELSE bajariladi → 'C'.`],
    '["C"]'),

  Q('v1-29', 'keys', 2,
    [`Какая команда используется для создания CHECK CONSTRAINT?`, `CHECK CONSTRAINT yaratish uchun qaysi buyruq ishlatiladi?`],
    ['CREATE TABLE', 'ALTER TABLE', 'INSERT INTO', 'UPDATE TABLE'], 1,
    [`CHECK можно добавить с помощью ALTER TABLE ... ADD CONSTRAINT ... CHECK (...). Описать его можно и прямо в CREATE TABLE, но в этом тесте правильным считается ALTER TABLE.`,
     `CHECK ni ALTER TABLE ... ADD CONSTRAINT ... CHECK (...) yordamida qo'shish mumkin. Uni CREATE TABLE ichida ham yozish mumkin, lekin bu testda to'g'ri javob ALTER TABLE hisoblanadi.`]),

  P('v1-30', 'join', 2,
`SELECT s.name, h.hobby
FROM Student AS s
INNER JOIN Hobby AS h ON s.id = h.student_id
WHERE h.hobby = 'Хоккей' AND h.hobby = 'Чтение';`,
    [T.student, T.hobby], null,
    [`('Иван', 'Хоккей')`, NOROWS, '(NULL, NULL)', `('Ирина', 'Чтение')`], 1,
    [`Одна строка Hobby не может одновременно иметь hobby = 'Хоккей' и hobby = 'Чтение': AND никогда не даёт TRUE, результат пуст. Чтобы получить оба, нужен OR (или IN).`,
     `Hobby ning bitta qatori bir vaqtda hobby = 'Хоккей' va hobby = 'Чтение' bo'la olmaydi: AND hech qachon TRUE bermaydi, natija bo'sh. Ikkalasini olish uchun OR (yoki IN) kerak.`],
    'EMPTY')
];
