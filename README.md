# ficbook-parser_v1.0
Парсер для сайта https://ficbook.net, отслеживающий появление новых фанфиков в выбранных фандомах. Уже работает, но будет дорабатываться.

Чтобы парсер заработал, нужно:
1. Установить на компьютер Nodejs.
2. Создать папку, инициализировать внутри нее проект [npm init], после чего внутри папки автоматически создаcтся файл packege.json.
3. Разместить внутри созданной папки файл index.js из репозитория.
4. Установить  пакеты: tress, needle, cheerio, mongodb, assert. Команда [npm init НазваниеПакета]
5. Установить на компьютер Mongodb.
6. Создать базу данных с названием moviesdb, а внутри нее коллекцию с названием movies. Можно через консоль, можно с помощью программы MongoDBCompass (так гораздо проще).
7. Создать в базе данных объекты c названием нужного вам фэндома, ссылкой на него (в конце добавить ключ ?p=) и количеством фанфиков в значении 0. ID создается автоматически. Выглядеть должно так:
    "_id": {
        "$oid": "5fbd52194c8f4b6314d6b5e1"
    },
    "name": "Гарри Поттер",
    "url": "https://ficbook.net/fanfiction/books/harri_potter?p=",
    "count": 0  
8. При запуске парсера вы должны быть подключены к базе данных. Парсер запускается в консоли стандартной командой [node index.js]. Первый запуск парсера добавит количество фанфиков в базу данных. Последующие запуски отобразят в консоли количество новых фанфиков при их наличии.
