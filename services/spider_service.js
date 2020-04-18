require('./mongoose_service');
const axios = require('axios');
const cherrio = require('cheerio');
const RedisService = require('./content_id_service');
const moment = require('moment');
const jieba = require('nodejieba')
const Article = require('../models/article');

class Tag {
  constructor(name, value, score){
    this.name = name; // 标签 如 漫画 
    this.value = value; // 对应的值
    this.score = score;
  }
}

async function spideringArticles(count){
  const ids = await RedisService.getRandomAcfunIds(count);
  let succeedCount = 0;
  let errorCount = 0 ;
  for(let id of ids){
    await getStringArticle(id)
      .then(r=>{
        succeedCount++;
      })
      .catch(e=>{
          errorCount++
          if(e.errorCode !== 4040000) throw e;
      })
    await new Promise((rsv)=>{
      setTimeout(rsv, 1000);
    })
  }
  return {
    succeedCount,
    errorCount
  }
}

async function getStringArticle(id){
  const url = `http://www.acfun.cn/a/ac${id}`;
  const res = await axios.get(url)
    .catch(e=>{
        if(e.response && e.response.status && e.response.status == 404){
            const err = new Error('Not found');
            err.errorCode = 4040000;
            throw err;
        }else{
            throw e;
        }
    })
  const html = res.data;
  const $ = cherrio.load(html);
  const articleContentFlg = $('.article-content');
  if(!articleContentFlg){
      return;
  }else{
      // add to already-got set
      await RedisService.markArticleIdSucceed(id);
  }

  const main = $('#main');
  const data = main.children('script').eq(0).html();
  const window = {}; 
  const articleContentHTML = eval(data).parts[0].content;
  $('.article-content').html(articleContentHTML);
  const articleContent = $('.article-content');
  const doms = articleContent.children();

 
  let orginCreateAtStr = $('.up-time').text();
  if(orginCreateAtStr.indexOf('小时')!=-1){
    var hour = parseInt(orginCreateAtStr);
    orginCreateAtStr =  Date.now().valueOf() - hour*60*60*1000;
  }else if(orginCreateAtStr.indexOf('分钟')!=-1){
    var minutes = parseInt(orginCreateAtStr);
    orginCreateAtStr =  Date.now().valueOf() - minutes*60*1000;
  }
  const orginCreateAt = moment(new Date(orginCreateAtStr)).valueOf(); 
  const tags = [];
  const articleCategoryAndTagNames = $('.article-parent').children('a')
  const bottomTags = $('#bd_tag.tag > span');

  const title = $('.art-title').children('.art-title-head').children('.caption').text();
  const titleTags = jieba.extract(title, 5);
  for (const t of titleTags) {
    tags.push(new Tag('ARTICLE_TAG_TITLE', t.word, t.weight));
  }
  // console.log(titleTags);
  //面包屑a标签  文章 > 漫画文学 > 漫画
  tags.push(new Tag('ARTICLE_CATEGORY',articleCategoryAndTagNames.eq(1).text(),1));
  tags.push(new Tag('ARTICLE_TAG_NAME',articleCategoryAndTagNames.eq(2).text(),1));
  tags.push(new Tag('ARTICLE_TAG_SYS',articleCategoryAndTagNames.eq(2).text(),1));

  bottomTags.each((idx,span)=>{
    tags.push(new Tag('ARTICLE_TAG_USER',$(span).text(),1));
  })
  
  const content = getTextOrImg(doms,[]);

  const article = {
    acfunId: id,
    content: content ,
    articleContentHtml: articleContentHTML,
    createdAt: Date.now().valueOf(),
    originCreatedAt: orginCreateAt ,// 文章创建时间
    title: title, //文章标题
    tags: tags,
  }
  const result = await Article.model.findOneAndUpdate(
    {
      acfunId:id
    },
    article,
    {
      upsert: true,
      returnNewValue: true,
    });
  console.log('updated')
  return result;

  function getTextOrImg(doms,arr){
    doms.each(function(i,ele){
        if(ele.tagName === 'p'){
            // console.log($(ele).text())
            arr.push($(ele).text())
            let children = $(ele).children();
            children.each(function(i2,ele2){
                // console.log('--'+i,i2, ele2.tagName)
                if(ele2.tagName === 'img'){
                    // console.log($(ele2).attr('src'))
                    arr.push($(ele2).attr('src'))
                }else{
                    // console.log($(ele2).text())
                    arr.push($(ele2).text())
                }
            })
        }
      })
      return arr;
  }
}


module.exports = {
    spideringArticles,
    getStringArticle
}
