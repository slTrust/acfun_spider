根目录自行创建 setting.js 形如

```
const Production = {
  logger: {
    path: '',
  },
  mongo: {
    uri: '',
  },
  redis: {
    port: 1111,
    host: '',
  },
};

const Debug = {
  logger: {
    path: '',
  },
  mongo: {
    uri: '',
  },
  redis: {
    port: 1111,
    host: '',
  },
};
if (process.env.NODE_ENV === 'production') {
  module.exports = Production;
} else {
  module.exports = Debug;
}
```

### 爬虫服务运行

**项目根目录运行**
**项目根目录运行**
**项目根目录运行**

> 生成id

```
# redis 里 清数据 flushall

node scripts/spider.js generate_ids 0 41
# 生成 0 ～ 410000的 id
# redis 里 scard acfun_id_set 验证 生成的是否是 4100000 条id
```

> 开始爬取

```
node scripts/spider.js start_getting_articles
# 验证没问题，服务器上 使用 pm2 开始爬
```

> pm2 运行爬虫脚本

```
NODE_ARGV_2=start_getting_articles pm2 start scripts/spider.js
```

> 对外开放接口服务

```
NODE_ENV=production pm2 start bin/www
```

**production的 log目录可能没有需要你手动创建，同时附加读写权限**

```
sudo chmod 777 -R 你的目录
```

### 


#### 之前添加了 nodejieba 分词

- **如果你用最新版代码从头爬取的数据不用搞这个**
- **如果你用最新版代码从头爬取的数据不用搞这个**
- **如果你用最新版代码从头爬取的数据不用搞这个**
- 但是数据tags里没录入 jieba 分词后的 title 
- 单独写了一个洗数据的脚本 script/fix_data.js


```
// 修复 tags 里没有 title分词后的 tag
node scripts/tag_score_adjustment.js recalculate_tag_scores

// 修复 tags的 字段名错误 从 scroe => score
node scripts/fix_data.js fix_tags_scroe_to_score
```