const tress = require('tress'),
      needle = require('needle'), 
      cheerio = require('cheerio'),
      assert = require('assert'),
      MongoClient = require('mongodb').MongoClient,
      uri = 'mongodb+srv://<username>:<password>@<cluster>.xmsaf.mongodb.net/<database>?retryWrites=true&w=majority';    
    
MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server"); 
  const collection = client.db('fanficsdb').collection('fanfics');        
         
  // Получить данные с сайта    
  function scrape (link, fanficContext) {   
    needle.get(`${link}?p=1`, function(err, res) {    
    // вычислить количество страниц на странице фэндома
      if (err) throw err; 
      let $ = cheerio.load(res.body),
          page = $(".pagenav .paging-description b:last-of-type").html();       
      page = page ? page : 1;
        
      needle.get(`${link}?p=${page}`, function(err, res) { 
      // вычислить количество фанфиков на всех страницах
        if (err) throw err; 
        $ = cheerio.load(res.body); 
        let articles = $(".fanfic-thumb-block:last-of-type .block").length;         
        if (page != 1) {
          articles = (page - 1) * 20 + articles;
        }
        fanficContext.setArticleCount(articles); // установить значение в свойство articleCount
        fanficContext.checkIsNew(); // проверить разницу между oldArticleCount и articleCount 
        fanficContext.saveCount(); // сохранить значение articleCount в БД          
      });        
    });      
  } // end function scrape

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
    // добавить в объект новое количество фанфиков
      this.articleCount = count;
    },
    hasNew: function () {
    // сравнить новое и старое количество фанфиков
      return this.articleCount - this.oldArticleCount;
    },
    checkIsNew: function () {
    // вывести после сравнения количество добавленных фанфиков  
      let difference = this.hasNew();
      if (difference > 0) {    
        console.log(`${this.name}: новых ${difference}\n${this.url}\n`); 
      } 
    },    
    saveCount: function () {
    // сохранить новое кол-во фанфиков в БД
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
  
  //Создать массив с данными из БД     
  async function readCollection() {
    // получить массив данных из БД
    const result = await collection.find({}).toArray(),
          fanfics = []; 
    console.log(`Всего фанфиков: ${result.length}`);
    
    // Создать объекты с использованием данных из БД и добавить их в массив fanfics
    for (let i = 0; i < result.length; i++) {
      // создать архив с объектами
      let fanfic = Object.assign({}, fanficObj);
      fanfic.url = result[i].url;
      fanfic.name = result[i].name;
      fanfic.id = result[i]._id;
      fanfic.oldArticleCount = result[i].count;  
      fanfics.push(fanfic);
    }    
      
    // Вызвать функцию loadArticleCount для каждого элемента созданного массива с объектами с задержкой      
    for (let i = 0; i < fanfics.length; i++) { 
     (ind => setTimeout (function () { 
       fanfics[i].loadArticleCount();
       console.log(i + 1);
      }, 1000 + (5000 * ind))
     )(i); 
    } 
                  
  } // end function readCollection    
  
  readCollection(); // вызвать функцию readCollection  
}); 
