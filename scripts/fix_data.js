const { MongoClient } = require('mongodb');
const jieba = require('nodejieba')
const logger = require('../utils/loggers/logger');

class Tag {
    constructor(name, value, score){
      this.name = name; // 标签 如 漫画 
      this.value = value; // 对应的值
      this.score = score;
    }
}

async function fixHistorySpiderData() {
  const db = await MongoClient.connect('mongodb://localhost:27017/acfun');
  const cursor = db.collection('articles').find({}, { tags: 1 ,title:1});
  let count = 0;
  while (await cursor.hasNext()) {
    count+=1;
    const doc = await cursor.next();
    let raw_tags = doc.tags;
    let fix_tags = [];
    let fixed = raw_tags
                  .filter(item =>item.name === 'ARTICLE_TAG_TITLE')
                  .length ===0?false:true
    if(!fixed){
        const titleTags = jieba.extract(doc.title, 5);
        for (const t of titleTags) {
            fix_tags.push(new Tag('ARTICLE_TAG_TITLE', t.word, t.weight));
        }
        fix_tags = fix_tags.concat(raw_tags);
        await db.collection('articles')
        .updateOne({ _id: doc._id }, { $set: { tags: fix_tags } });
        console.log('updated',count)
    }else{
        console.log('已存在不需要修复',count)
    }
    
  }
}

async function fixTagsScroeToScore() {
  const db = await MongoClient.connect('mongodb://localhost:27017/acfun');
  const cursor = db.collection('articles').find({}, { tags: 1 ,title:1});
  let count = 0;
  while (await cursor.hasNext()) {
    count+=1;
    const doc = await cursor.next();
    let raw_tags = doc.tags;
    let fix_tags = raw_tags.map(item=>{
        return new Tag(item.name, item.value, item.scroe)
    })
    console.log(fix_tags)
    await db.collection('articles')
    .updateOne({ _id: doc._id }, { $set: { tags: fix_tags } });
    console.log('updated',count)
    
  }
}

switch (process.argv[2]) {
  case 'fix_jieba_title_tags':
    // 调整数据分数 用于 es搜索
    fixHistorySpiderData()
      .then(() => {
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
        logger.error(
          'error fixHistorySpiderData',
          { err: e },
        );
        process.exit(1);
      });
    break;
  case 'fix_tags_scroe_to_score':
    // 调整数据分数 用于 es搜索
    fixTagsScroeToScore()
      .then(() => {
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
        logger.error(
          'error fixTagsScroeToScore',
          { err: e },
        );
        process.exit(1);
      });
    break;
  default:
    break;
}