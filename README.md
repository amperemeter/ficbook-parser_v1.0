# ficbook-parser_v2.0
Парсер для сайта https://ficbook.net, отслеживающий появление новых фанфиков в выбранных фандомах.

Чтобы парсер заработал, нужно:
1. Установить на компьютер Nodejs.
2. Создать в любом месте папку "ficbook-parser" (можно другое название).
3. Разместить внутри созданной папки файлы "index.js" и "package.json" из репозитория.
4. Установить пакеты "tress", "needle", "cheerio", "mongodb", "assert" командой [npm i], используя терминал (cmd в Windows). Вы должны находиться в папке проекта.
5. Зарегистрироваться на сайте https://cloud.mongodb.com/ и создать новый кластер.
6. Создать в кластере базу данных с названием "fanficsdb", а внутри нее коллекцию с названием "fanfics". 
7. Создать юзера со всеми правами.
8. Создать в "fanfics" объекты c названием нужного вам фэндома, ссылкой на него и количеством фанфиков в значении 0. ID создается автоматически. Выглядеть должно так: { "_id": {"$oid": "5fbd52194c8f4b6314d6b5e1"}, "name": "Гарри Поттер", "url": "https://ficbook.net/fanfiction/books/harri_potter", "count": 0 } 
9. Заменить в файле "index.js" путь в строке 6 на путь к вашей базе данных: [mongodb+srv://username:password@<clustername>.xmsaf.mongodb.net/fanficsdb?retryWrites=true&w=majority]. 
10. Запустить парсер в терминале стандартной командой [node index.js]. Первый запуск парсера добавит количество фанфиков в базу данных. Последующие запуски отобразят количество новых фанфиков при их наличии.
