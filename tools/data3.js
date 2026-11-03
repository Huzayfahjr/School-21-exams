/* Variant 3: wider scope - windows, CTE, transactions, views, normal forms, DDL/DML */
var V3P = [
  P('v3-01', 'join', 2,
`SELECT count(*)
FROM Student AS s
FULL JOIN Hobby AS h ON s.id = h.student_id;`,
    [T.student, T.hobby], null,
    ['3', '4', '5', '7'], 2,
    [`FULL JOIN сохраняет строки обеих сторон. Совпавших пар 3 (Иван×2, Ирина), плюс Анна без хобби, плюс хобби «Плавание» без студента: 3 + 1 + 1 = 5.`,
     `FULL JOIN ikkala tomon qatorlarini saqlaydi. Mos juftlar 3 ta (Иван×2, Ирина), yana hobbisiz Анна, yana talabasiz «Плавание» hobbisi: 3 + 1 + 1 = 5.`],
    '[5]'),

  P('v3-02', 'join', 3,
`SELECT count(*)
FROM Student AS s
LEFT JOIN Hobby AS h
       ON s.id = h.student_id AND h.hobby = 'Музыка';`,
    [T.student, T.hobby], null,
    ['1', '2', '3', '4'], 2,
    [`Условие в ON определяет лишь то, какие строки «склеиваются»; LEFT JOIN всё равно сохраняет каждого студента: Иван (с Музыкой), Анна (NULL), Ирина (NULL) = 3 строки. Если бы то же условие стояло в WHERE, осталась бы 1 строка.`,
     `ON dagi shart faqat qaysi qatorlar «yopishtirilishini» belgilaydi; LEFT JOIN baribir har bir talabani saqlaydi: Иван (Музыка bilan), Анна (NULL), Ирина (NULL) = 3 qator. Agar shu shart WHERE da turganida, 1 qator qolardi.`],
    '[3]'),

  P('v3-03', 'join', 3,
`SELECT count(*)
FROM Employee AS e1
JOIN Employee AS e2
  ON e1.employee = e2.employee AND e1.id < e2.id;`,
    [T.employee], null,
    ['1', '2', '3', '5'], 1,
    [`Это self join: таблица соединяется сама с собой. Пары с одинаковым именем и e1.id < e2.id: Иван (1, 4) и Анна (2, 5) → 2 пары. Ирина встречается один раз и пары не образует.`,
     `Bu self join: jadval o'zi bilan birlashtiriladi. Ismi bir xil va e1.id < e2.id bo'lgan juftlar: Иван (1, 4) va Анна (2, 5) → 2 juft. Ирина bir marta uchraydi va juft hosil qilmaydi.`],
    '[2]'),

  P('v3-04', 'window', 3,
`SELECT sum(transaction) OVER (PARTITION BY employee)
FROM Employee
WHERE id = 4;`,
    [T.employee], null,
    ['430', '330', '100', '725'], 1,
    [`WHERE выполняется до оконных функций. Остаётся одна строка (id = 4, Иван, 330), и окно по Ивану содержит только её: 330. Чтобы получить 430, фильтровать нужно снаружи, в подзапросе.`,
     `WHERE oyna funksiyalaridan oldin bajariladi. Bitta qator qoladi (id = 4, Иван, 330), Иван oynasida faqat shu qator bor: 330. 430 olish uchun filtrni tashqarida, ichki so'rovda qo'llash kerak.`],
    '[330]'),

  P('v3-05', 'window', 3,
`SELECT prev
FROM (
  SELECT id,
         lag(transaction) OVER (ORDER BY id) AS prev
  FROM Employee
) AS t
WHERE id = 3;`,
    [T.employee], null,
    ['200', '50', '100', 'NULL'], 0,
    [`lag(x) возвращает значение из предыдущей строки по порядку окна. Для id = 3 предыдущая строка — id = 2 (Анна, 200). Фильтр WHERE стоит снаружи, поэтому окно считается по всей таблице.`,
     `lag(x) oyna tartibidagi oldingi qatordan qiymat qaytaradi. id = 3 uchun oldingi qator — id = 2 (Анна, 200). WHERE filtri tashqarida turibdi, shuning uchun oyna butun jadval bo'yicha hisoblanadi.`],
    '[200]'),

  P('v3-06', 'window', 3,
`SELECT v,
       rank()       OVER (ORDER BY v DESC) AS r,
       dense_rank() OVER (ORDER BY v DESC) AS dr
FROM (VALUES (10), (20), (20), (30)) AS t(v)
ORDER BY v
LIMIT 1;`,
    [], null,
    ['(10, 3, 3)', '(10, 4, 3)', '(10, 4, 4)', '(10, 3, 4)'], 1,
    [`По убыванию: 30 → 1-е место, 20 и 20 → оба 2-е. Для 10: rank() после ничьей пропускает номера и даёт 4, а dense_rank() идёт без пропусков и даёт 3. Строка с v = 10 → (10, 4, 3).`,
     `Kamayish tartibida: 30 → 1-o'rin, 20 va 20 → ikkalasi 2-o'rin. 10 uchun: rank() durangdan keyin raqamlarni o'tkazib yuboradi va 4 beradi, dense_rank() esa o'tkazib yubormasdan 3 beradi. v = 10 qatori → (10, 4, 3).`],
    '[10,4,3]'),

  P('v3-07', 'cte', 3,
`WITH RECURSIVE t(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM t WHERE n < 5
)
SELECT sum(n) FROM t;`,
    [], null,
    ['10', '15', '5', '21'], 1,
    [`Рекурсивный CTE генерирует n = 1, 2, 3, 4, 5 (останавливается, когда n < 5 перестаёт быть истинным). Сумма: 1 + 2 + 3 + 4 + 5 = 15.`,
     `Rekursiv CTE n = 1, 2, 3, 4, 5 ni hosil qiladi (n < 5 sharti yolg'on bo'lganda to'xtaydi). Yig'indi: 1 + 2 + 3 + 4 + 5 = 15.`],
    '[15]'),

  P('v3-08', 'func', 2,
`SELECT count(*)
FROM generate_series(1, 10, 3);`,
    [], null,
    ['3', '4', '10', '5'], 1,
    [`generate_series(начало, конец, шаг) даёт 1, 4, 7, 10 (следующее значение 13 больше 10). Всего 4 строки.`,
     `generate_series(boshi, oxiri, qadam) 1, 4, 7, 10 ni beradi (keyingi qiymat 13, 10 dan katta). Jami 4 qator.`],
    '[4]'),

  P('v3-09', 'func', 2,
`SELECT substr('School21', 3, 4);`,
    [], null,
    [`'cho'`, `'hool'`, `'choo'`, `'hool2'`], 1,
    [`substr(строка, начало, длина): нумерация с 1. Символы 'School21': S1 c2 h3 o4 o5 l6 2 1. С 3-го символа, длина 4: h-o-o-l → 'hool'.`,
     `substr(satr, boshi, uzunlik): raqamlash 1 dan boshlanadi. 'School21' belgilari: S1 c2 h3 o4 o5 l6 2 1. 3-belgidan, uzunligi 4: h-o-o-l → 'hool'.`],
    '["hool"]'),

  P('v3-10', 'null', 3,
`SELECT coalesce(nullif(5, 5), 0) + 1;`,
    [], null,
    ['NULL', '1', '6', '5'], 1,
    [`nullif(5, 5) возвращает NULL, потому что аргументы равны. coalesce(NULL, 0) → 0. Затем 0 + 1 = 1.`,
     `nullif(5, 5) NULL qaytaradi, chunki argumentlar teng. coalesce(NULL, 0) → 0. Keyin 0 + 1 = 1.`],
    '[1]'),

  P('v3-11', 'aggr', 2,
`SELECT sum(reg_num)
FROM Student;`,
    [T.studentReg], null,
    ['579', 'NULL', '456', '123'], 0,
    [`Агрегатные функции игнорируют NULL: 123 + 456 = 579. NULL у Anna просто пропускается. (Результат был бы NULL только если бы все значения были NULL.)`,
     `Agregat funksiyalar NULL ni e'tiborsiz qoldiradi: 123 + 456 = 579. Anna dagi NULL shunchaki o'tkazib yuboriladi. (Natija faqat hamma qiymat NULL bo'lganda NULL bo'lardi.)`],
    '[579]'),

  P('v3-12', 'tx', 3,
`CREATE TABLE t (x INT);

BEGIN;
INSERT INTO t VALUES (1);
SAVEPOINT s1;
INSERT INTO t VALUES (2);
ROLLBACK TO s1;
INSERT INTO t VALUES (3);
COMMIT;

SELECT sum(x) FROM t;`,
    [], null,
    ['6', '4', '3', '1'], 1,
    [`ROLLBACK TO s1 отменяет только то, что было после точки сохранения: вставка 2 пропадает. Вставки 1 и 3 фиксируются по COMMIT: 1 + 3 = 4.`,
     `ROLLBACK TO s1 faqat saqlash nuqtasidan keyin qilinganini bekor qiladi: 2 ni kiritish yo'qoladi. 1 va 3 ni kiritish COMMIT bilan tasdiqlanadi: 1 + 3 = 4.`],
    '[4]'),

  P('v3-13', 'ddl', 2,
`UPDATE Employee
SET transaction = transaction * 2
WHERE employee = 'Иван';

SELECT sum(transaction) FROM Employee;`,
    [T.employee], null,
    ['725', '860', '1155', '1585'], 2,
    [`Исходная сумма: 100 + 200 + 50 + 330 + 45 = 725. UPDATE удваивает только строки Ивана: 100 → 200 и 330 → 660, то есть +430. Итого 725 + 430 = 1155.`,
     `Boshlang'ich yig'indi: 100 + 200 + 50 + 330 + 45 = 725. UPDATE faqat Иван qatorlarini ikki baravar oshiradi: 100 → 200 va 330 → 660, ya'ni +430. Jami 725 + 430 = 1155.`],
    '[1155]'),

  P('v3-14', 'ddl', 3,
`CREATE VIEW rich AS
SELECT * FROM Employee WHERE transaction > 100;

INSERT INTO Employee VALUES (6, 'Олег', 500);

SELECT count(*) FROM rich;`,
    [T.employee], null,
    ['0', '2', '3', '6'], 2,
    [`VIEW не хранит данные: сохранён только запрос, и он выполняется при каждом обращении. Подходят строки Анна (200), Иван (330) и новый Олег (500) → 3. Материализованное представление осталось бы на 2 до REFRESH MATERIALIZED VIEW.`,
     `VIEW ma'lumot saqlamaydi: faqat so'rov saqlangan va u har murojaatda bajariladi. Анна (200), Иван (330) va yangi Олег (500) mos keladi → 3. Materiallashtirilgan ko'rinish REFRESH MATERIALIZED VIEW gacha 2 bo'lib qolardi.`],
    '[3]'),

  P('v3-15', 'null', 2,
`SELECT ('a' || NULL) IS NULL;`,
    [], null,
    ['TRUE', 'FALSE', 'NULL', ERR], 0,
    [`Конкатенация || с NULL даёт NULL: 'a' || NULL → NULL. Проверка NULL IS NULL возвращает TRUE (IS NULL — единственный правильный способ проверить NULL; = NULL не работает).`,
     `|| birlashtirish NULL bilan NULL beradi: 'a' || NULL → NULL. NULL IS NULL tekshiruvi TRUE qaytaradi (IS NULL — NULL ni tekshirishning yagona to'g'ri usuli; = NULL ishlamaydi).`],
    '[true]')
];

var V3T = [
  Q('v3-16', 'tx', 2,
    [`Какой уровень изоляции транзакций используется в PostgreSQL по умолчанию?`, `PostgreSQLda tranzaksiya izolyatsiyasining qaysi darajasi odatiy (default) hisoblanadi?`],
    ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'], 1,
    [`По умолчанию в PostgreSQL — READ COMMITTED: каждый запрос видит только зафиксированные данные. (READ UNCOMMITTED в PostgreSQL работает как READ COMMITTED: грязное чтение невозможно.)`,
     `PostgreSQLda odatiy daraja — READ COMMITTED: har bir so'rov faqat tasdiqlangan ma'lumotlarni ko'radi. (PostgreSQLda READ UNCOMMITTED READ COMMITTED kabi ishlaydi: iflos o'qish mumkin emas.)`]),

  Q('v3-17', 'tx', 2,
    [`Что такое «грязное чтение» (dirty read)?`, `«Iflos o'qish» (dirty read) nima?`],
    [[`чтение данных, изменённых другой транзакцией, но ещё не зафиксированных`, `boshqa tranzaksiya o'zgartirgan, lekin hali tasdiqlanmagan (COMMIT qilinmagan) ma'lumotlarni o'qish`],
     [`чтение удалённого файла`, `o'chirilgan faylni o'qish`],
     [`чтение данных без индекса`, `indekssiz ma'lumot o'qish`],
     [`повторное чтение тех же строк с тем же результатом`, `bir xil qatorlarni takroran o'qib, bir xil natija olish`]], 0,
    [`Грязное чтение: транзакция видит чужие незафиксированные изменения, которые потом могут быть отменены ROLLBACK. Возможно только на уровне READ UNCOMMITTED (в PostgreSQL недоступно).`,
     `Iflos o'qish: tranzaksiya boshqalarning tasdiqlanmagan o'zgarishlarini ko'radi, ular keyin ROLLBACK bilan bekor qilinishi mumkin. Faqat READ UNCOMMITTED darajasida mumkin (PostgreSQLda yo'q).`]),

  Q('v3-18', 'tx', 3,
    [`Как называется ситуация, когда повторное чтение той же строки внутри одной транзакции возвращает другое значение, потому что другая транзакция успела изменить её и зафиксировать?`, `Bitta tranzaksiya ichida bir xil qatorni qayta o'qiganda boshqa qiymat chiqishi (chunki boshqa tranzaksiya uni o'zgartirib, COMMIT qilgan) qanday ataladi?`],
    [[`Грязное чтение (dirty read)`, `Iflos o'qish (dirty read)`],
     [`Неповторяющееся чтение (non-repeatable read)`, `Takrorlanmaydigan o'qish (non-repeatable read)`],
     [`Фантомное чтение (phantom read)`, `Fantom o'qish (phantom read)`],
     [`Потерянное обновление (lost update)`, `Yo'qolgan yangilanish (lost update)`]], 1,
    [`Неповторяющееся чтение: та же строка при повторном чтении изменилась. Фантомное чтение — когда при повторной выборке по условию появляются или исчезают новые строки. Грязное чтение — видны незафиксированные данные.`,
     `Takrorlanmaydigan o'qish: bir xil qator qayta o'qilganda o'zgargan. Fantom o'qish — shart bo'yicha qayta tanlashda yangi qatorlar paydo bo'lishi yoki yo'qolishi. Iflos o'qish — tasdiqlanmagan ma'lumot ko'rinadi.`]),

  Q('v3-19', 'nf', 3,
    [`Что требует третья нормальная форма (3NF)?`, `Uchinchi normal shakl (3NF) nimani talab qiladi?`],
    [[`таблица в 2NF и нет транзитивных зависимостей неключевых атрибутов от первичного ключа`, `jadval 2NF da va kalit bo'lmagan atributlarning birlamchi kalitga tranzitiv bog'liqligi yo'q`],
     [`в каждой ячейке одно значение`, `har bir katakda bitta qiymat bor`],
     [`у всех таблиц есть внешние ключи`, `barcha jadvallarda tashqi kalit bor`],
     [`в таблицах нет индексов`, `jadvallarda indekslar yo'q`]], 0,
    [`Транзитивная зависимость: ключ → A → B, где B зависит от ключа только через неключевой A (например, id → город → страна). Для 3NF B выносят в отдельную таблицу.`,
     `Tranzitiv bog'liqlik: kalit → A → B, bunda B kalitga faqat kalit bo'lmagan A orqali bog'liq (masalan, id → shahar → mamlakat). 3NF uchun B alohida jadvalga ajratiladi.`]),

  Q('v3-20', 'ddl', 1,
    [`Какая из команд относится к DDL (язык определения данных)?`, `Quyidagi buyruqlardan qaysi biri DDL (ma'lumotlarni ta'riflash tili) ga kiradi?`],
    ['SELECT', 'INSERT', 'ALTER TABLE', 'COMMIT'], 2,
    [`DDL меняет структуру: CREATE, ALTER, DROP. DML работает с данными: INSERT, UPDATE, DELETE (и SELECT для чтения). COMMIT, ROLLBACK, SAVEPOINT — управление транзакциями.`,
     `DDL tuzilmani o'zgartiradi: CREATE, ALTER, DROP. DML ma'lumotlar bilan ishlaydi: INSERT, UPDATE, DELETE (o'qish uchun SELECT). COMMIT, ROLLBACK, SAVEPOINT — tranzaksiyani boshqarish.`]),

  Q('v3-21', 'ddl', 1,
    [`Что такое представление (VIEW)?`, `Ko'rinish (VIEW) nima?`],
    [[`виртуальная таблица, определяемая сохранённым SELECT-запросом`, `saqlangan SELECT so'rovi bilan aniqlanadigan virtual jadval`],
     [`копия таблицы на диске`, `jadvalning diskdagi nusxasi`],
     [`особый тип индекса`, `indeksning maxsus turi`],
     [`резервная копия БД`, `MBning zaxira nusxasi`]], 0,
    [`VIEW хранит не данные, а запрос. При обращении к нему запрос выполняется заново, поэтому данные всегда актуальны.`,
     `VIEW ma'lumotni emas, so'rovni saqlaydi. Murojaat qilinganda so'rov qaytadan bajariladi, shuning uchun ma'lumot doim dolzarb.`]),

  Q('v3-22', 'ddl', 2,
    [`Чем материализованное представление отличается от обычного?`, `Materiallashtirilgan ko'rinish oddiy ko'rinishdan nimasi bilan farq qiladi?`],
    [[`хранит результат запроса физически и обновляется командой REFRESH MATERIALIZED VIEW`, `so'rov natijasini jismonan saqlaydi va REFRESH MATERIALIZED VIEW buyrug'i bilan yangilanadi`],
     [`всегда показывает актуальные данные без обновления`, `yangilashsiz har doim dolzarb ma'lumotni ko'rsatadi`],
     [`не может быть построено на JOIN`, `JOIN asosida qurib bo'lmaydi`],
     [`не занимает места на диске`, `diskda joy egallamaydi`]], 0,
    [`Материализованное представление сохраняет результат на диске: читать быстро, но данные устаревают, пока не выполнен REFRESH MATERIALIZED VIEW.`,
     `Materiallashtirilgan ko'rinish natijani diskda saqlaydi: o'qish tez, lekin REFRESH MATERIALIZED VIEW bajarilmaguncha ma'lumot eskiradi.`]),

  Q('v3-23', 'index', 1,
    [`Какой тип индекса создаётся в PostgreSQL по умолчанию?`, `PostgreSQLda odatiy (default) holatda qaysi turdagi indeks yaratiladi?`],
    ['Hash', 'B-tree', 'GIN', 'BRIN'], 1,
    [`CREATE INDEX без указания USING создаёт B-tree: он подходит для =, <, >, BETWEEN и сортировки.`,
     `USING ko'rsatilmagan CREATE INDEX B-tree yaratadi: u =, <, >, BETWEEN va saralash uchun mos.`]),

  Q('v3-24', 'index', 2,
    [`Что делает команда EXPLAIN?`, `EXPLAIN buyrug'i nima qiladi?`],
    [[`показывает план выполнения запроса (EXPLAIN ANALYZE ещё и выполняет его)`, `so'rovning bajarilish rejasini ko'rsatadi (EXPLAIN ANALYZE uni bajaradi ham)`],
     [`объясняет синтаксические ошибки`, `sintaksis xatolarini tushuntiradi`],
     [`создаёт индекс автоматически`, `indeksni avtomatik yaratadi`],
     [`удаляет медленные запросы`, `sekin so'rovlarni o'chiradi`]], 0,
    [`EXPLAIN показывает, как PostgreSQL собирается выполнять запрос (Seq Scan, Index Scan, виды JOIN). EXPLAIN ANALYZE выполняет запрос и добавляет реальное время.`,
     `EXPLAIN PostgreSQL so'rovni qanday bajarishini ko'rsatadi (Seq Scan, Index Scan, JOIN turlari). EXPLAIN ANALYZE so'rovni bajaradi va haqiqiy vaqtni qo'shadi.`]),

  Q('v3-25', 'group', 2,
    [`Чем HAVING отличается от WHERE?`, `HAVING WHERE dan nimasi bilan farq qiladi?`],
    [[`WHERE фильтрует строки до группировки, HAVING — группы после GROUP BY`, `WHERE qatorlarni guruhlashdan oldin, HAVING esa GROUP BY dan keyin guruhlarni filtrlaydi`],
     [`это одно и то же`, `bu bir xil narsa`],
     [`HAVING работает только с текстом`, `HAVING faqat matn bilan ishlaydi`],
     [`WHERE можно использовать только вместе с JOIN`, `WHERE faqat JOIN bilan birga ishlatiladi`]], 0,
    [`WHERE работает со строками до группировки и не может использовать агрегаты. HAVING фильтрует уже готовые группы, поэтому в нём можно писать sum(), count() и т. п.`,
     `WHERE guruhlashdan oldin qatorlar bilan ishlaydi va agregatlarni ishlata olmaydi. HAVING tayyor guruhlarni filtrlaydi, shuning uchun unda sum(), count() va shu kabilarni yozish mumkin.`]),

  Q('v3-26', 'basic', 3,
    [`Каков логический порядок выполнения частей SELECT-запроса?`, `SELECT so'rovi qismlarining mantiqiy bajarilish tartibi qanday?`],
    ['SELECT → FROM → WHERE → GROUP BY → ORDER BY', 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY', 'FROM → SELECT → WHERE → GROUP BY → HAVING → ORDER BY', 'WHERE → FROM → GROUP BY → SELECT → HAVING → ORDER BY'], 1,
    [`Логический порядок: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Поэтому алиас из SELECT нельзя использовать в WHERE, но можно в ORDER BY.`,
     `Mantiqiy tartib: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Shuning uchun SELECT dagi taxallusni WHERE da ishlatib bo'lmaydi, lekin ORDER BY da mumkin.`]),

  Q('v3-27', 'keys', 3,
    [`Что произойдёт с дочерними строками при удалении родительской строки, если внешний ключ объявлен с ON DELETE CASCADE?`, `Agar tashqi kalit ON DELETE CASCADE bilan e'lon qilingan bo'lsa, ota qator o'chirilganda bola qatorlarga nima bo'ladi?`],
    [[`будут удалены автоматически`, `avtomatik o'chiriladi`],
     [`останутся без изменений`, `o'zgarishsiz qoladi`],
     [`в них запишется NULL`, `ularga NULL yoziladi`],
     [`удаление родительской строки будет запрещено`, `ota qatorni o'chirish taqiqlanadi`]], 0,
    [`CASCADE удаляет и зависимые строки. ON DELETE SET NULL записал бы NULL, а RESTRICT / NO ACTION запретили бы удаление родителя.`,
     `CASCADE bog'liq qatorlarni ham o'chiradi. ON DELETE SET NULL NULL yozgan bo'lardi, RESTRICT / NO ACTION esa ota qatorni o'chirishni taqiqlagan bo'lardi.`]),

  Q('v3-28', 'ddl', 2,
    [`Что такое триггер (TRIGGER)?`, `Trigger (TRIGGER) nima?`],
    [[`функция, которая автоматически выполняется при событии INSERT / UPDATE / DELETE`, `INSERT / UPDATE / DELETE hodisasida avtomatik bajariladigan funksiya`],
     [`тип индекса`, `indeks turi`],
     [`команда для резервного копирования`, `zaxira nusxa olish buyrug'i`],
     [`способ шифрования паролей`, `parollarni shifrlash usuli`]], 0,
    [`Триггер привязан к таблице и срабатывает сам (до или после события): например, пишет запись в журнал при каждом изменении строки.`,
     `Trigger jadvalga bog'langan va o'zi ishga tushadi (hodisadan oldin yoki keyin): masalan, qator o'zgarganda jurnalga yozuv qo'shadi.`]),

  Q('v3-29', 'keys', 2,
    [`Что такое составной (composite) первичный ключ?`, `Kompozit (composite) birlamchi kalit nima?`],
    [[`первичный ключ из двух и более столбцов, уникальный в совокупности`, `ikki yoki undan ortiq ustundan iborat, ular majmuasi bo'yicha noyob birlamchi kalit`],
     [`два первичных ключа в одной таблице`, `bitta jadvalda ikkita birlamchi kalit`],
     [`внешний ключ на две таблицы`, `ikki jadvalga tashqi kalit`],
     [`ключ, который хранится в двух БД`, `ikkita MBda saqlanadigan kalit`]], 0,
    [`PRIMARY KEY (student_id, hobby_id): уникальной должна быть комбинация значений, а по отдельности каждое может повторяться. Типично для таблиц связи «многие ко многим».`,
     `PRIMARY KEY (student_id, hobby_id): qiymatlar kombinatsiyasi noyob bo'lishi kerak, alohida-alohida esa takrorlanishi mumkin. «Ko'pga ko'p» bog'lovchi jadvallar uchun xos.`]),

  Q('v3-30', 'join', 1,
    [`Что вернёт LEFT JOIN?`, `LEFT JOIN nimani qaytaradi?`],
    [[`все строки левой таблицы и подходящие строки правой (NULL, если совпадений нет)`, `chap jadvalning barcha qatorlari va o'ng jadvalning mos qatorlari (mos kelmasa NULL)`],
     [`только строки, у которых есть совпадение в обеих таблицах`, `faqat ikkala jadvalda mos keladigan qatorlar`],
     [`все строки правой таблицы`, `o'ng jadvalning barcha qatorlari`],
     [`декартово произведение таблиц`, `jadvallarning dekart ko'paytmasi`]], 0,
    [`LEFT JOIN сохраняет каждую строку левой таблицы; если справа нет пары, столбцы правой таблицы заполняются NULL. Только совпавшие строки — это INNER JOIN.`,
     `LEFT JOIN chap jadvalning har bir qatorini saqlaydi; o'ngda juft bo'lmasa, o'ng jadval ustunlari NULL bilan to'ldiriladi. Faqat mos kelganlari — INNER JOIN.`])
];

/* Interleave practice and theory the way the real exam mixes them */
function mix(a, b) { var r = [], i; for (i = 0; i < a.length; i++) { r.push(a[i]); if (b[i]) r.push(b[i]); } return r; }

var VARIANTS = [
  { id: 1, title: [`Вариант 1`, `1-variant`], sub: [`30 вопросов с экзамена из вашего файла: 15 практика и 15 теория`, `Sizning faylingizdagi 30 ta imtihon savoli: 15 amaliy va 15 nazariy`], q: V1 },
  { id: 2, title: [`Вариант 2`, `2-variant`], sub: [`Близко к варианту 1: те же таблицы, новые ловушки и те же темы теории`, `1-variantga yaqin: o'sha jadvallar, yangi tuzoqlar va o'sha nazariy mavzular`], q: mix(V2P, V2T) },
  { id: 3, title: [`Вариант 3`, `3-variant`], sub: [`Шире: окна, CTE, транзакции, VIEW, нормальные формы, DDL/DML`, `Kengroq: oyna funksiyalari, CTE, tranzaksiyalar, VIEW, normal shakllar, DDL/DML`], q: mix(V3P, V3T) }
];
var DATA = { TOPICS: TOPICS, VARIANTS: VARIANTS };
if (typeof module !== 'undefined') module.exports = DATA;
