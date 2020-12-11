const tress = require('tress'),
    needle = require('needle'), 
    cheerio = require('cheerio'),
    MongoClient = require('mongodb').MongoClient;
    assert = require('assert'),
    uri = 'mongodb+srv://<username>:<password>@<clustername>.xmsaf.mongodb.net/fanficsdb?retryWrites=true&w=majority';
    
    
MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  const collection = client.db('fanficsdb').collection('fanfics');        
     
    
  // Получение данных с сайта  
  
  function scrape (link, fanficContext) {   
    needle.get(link + 1, function(err, res) {    
    // выяснение количество страниц на странице фэндома
      if (err) throw err; 
      let $ = cheerio.load(res.body),
          page = $(".pagenav .paging-description b:last-of-type").html();       
      page = page ? page : 1;
        
      needle.get(link + page, function(err, res) {
      // вычисление количества фанфиков на всех страницах
        if (err) throw err; 
        $ = cheerio.load(res.body); 
        let articles = $(".fanfic-thumb-block:last-of-type .block").length;         
        if (page != 1) {
          articles = (page - 1) * 20 + articles;
        }
        fanficContext.setArticleCount(articles); // установка значения в свойство articleCount
        fanficContext.checkIsNew(); // проверка разницы между oldArticleCount и articleCount 
        fanficContext.saveCount(); // сохранение значения articleCount в БД          
      });        
    });      
  } // end scrape


  // Рабочий объект
  
  let fanficObj = {
    id: '',
    name: '',
    url: '',
    oldArticleCount: 0,
    articleCount: 0,
    loadArticleCount: function () {
      scrape (this.url, this);
    },
    setArticleCount: function (count) {
    // добавление в объект новое количество фанфиков
      this.articleCount = count;
    },
    hasNew: function () {
    // сравнение нового и старого количества фанфиков
      return this.articleCount - this.oldArticleCount;
    },
    checkIsNew: function () {
    // вывод после сравнения количества добавленных фанфиков  
      let difference = this.hasNew();
      if (difference > 0) {    
        console.log(`${this.name}: новых ${difference}\n${this.url + 1}\n`); 
      }
    },
    
    saveCount: function () {
    // сохранение нового кол-ва фанфиков в базу данных
      const name = this.name,
            count = this.articleCount;  
      
      try {  
        collection.updateOne({name: name}, {$set: {count: count}});
      }       
      catch(err) {
        console.log('Error: ' + err);
      }   
     
    }      
    
  } // end fanficObj   
  
  //Создание массива с данными из БД 
    
  async function readCollection() {
    // получение массива данных из БД
    const result = await collection.find({}).toArray(),
          fanfics = []; 
    console.log(`Всего фанфиков: ${result.length}`);
          
    
    // Создание объектов с использованием данных из БД и добавление их в массив fanfics

    for (let i = 0; i < result.length; i++) {
      // создание архива с объектами
      let fanfic = Object.assign({}, fanficObj);
      fanfic.url = result[i].url;
      fanfic.name = result[i].name;
      fanfic.id = result[i]._id;
      fanfic.oldArticleCount = result[i].count;  
      fanfics.push(fanfic);
      //console.log(JSON.stringify(fanfic));
    }
    
      
    // Вызов функции loadArticleCount для каждого элемента созданного массива с объектами
       
    for (let i = 0; i < fanfics.length; i++) { 
     (ind => setTimeout (function () { 
       fanfics[i].loadArticleCount();
       console.log(i + 1);
      }, 1000 + (5000 * ind))
     )(i); 
    } 
                  
  } // end readCollection     
  readCollection(); // вызов функции readCollection
}); 
