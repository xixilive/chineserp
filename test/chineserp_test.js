/*
  ======== A Handy Little QUnit Reference ========
  http://api.qunitjs.com/
*/
(function(ChineseRegion){
  var test_collections = {
    'index': [
      {"i":"310000","n":"上海市","a":"上海","y":"ShangHai","b":"SH","z":"200000"}
    ],
    '310000': [
      {"i":"310101","n":"黄浦区","a":"黄浦区","y":"HuangPuQu","b":"HPQ","z":"200001"},
      {"i":"310104","n":"徐汇区","a":"徐汇区","y":"XuHuiQu","b":"XHQ","z":"200030"},
      {"i":"310105","n":"长宁区","a":"长宁区","y":"ZhangNingQu","b":"ZNQ","z":"200050"}
    ]
  };

  ChineseRegion.getJSON = function(url, callback){
    url = url.split('.')[0];
    callback(test_collections[url.substr(1)]);
  };

  //ChineseRegion
  module('ChineseRegion');
  test('ChineseRegion.ifn', function(){
    expect(2);
    strictEqual(ChineseRegion.ifn('function'), false);
    ok(ChineseRegion.ifn(function(){}));
  });

  //ChineseRegion.RegionCollection
  module('ChineseRegion.RegionCollection', {
    setup: function(){
      this.collection = new ChineseRegion.RegionCollection(test_collections['310000'], 'test_collection');
    }
  });

  test('RegionCollection#select', function() {
    expect(1);
    var result = this.collection.select(function(r){
      return r.n === '徐汇区';
    });
    deepEqual(result, [test_collections['310000'][1]]);
  });

  test('RegionCollection#map', function() {
    expect(1);
    var result = this.collection.map(function(r){
      return r.n;
    });
    ok((result.indexOf('长宁区') === 2));
  });

  test('RegionCollection#first', function() {
    expect(1);
    var result = this.collection.first(function(r){
      return r.n === '长宁区';
    });
    deepEqual(result, test_collections['310000'][2]);
  });

  test('RegionCollection#findByNames', function() {
    expect(3);
    deepEqual(this.collection.findByNames('NOT EXISTS'), [test_collections['310000'][0]]);
    deepEqual(this.collection.findByNames('长宁区'), [test_collections['310000'][2]]);
    deepEqual(this.collection.findByNames('ZhangNingQu', '' ,{key: 'y'}), [test_collections['310000'][2]]);
  });

  test('RegionCollection#findById', function() {
    expect(1);
    deepEqual(this.collection.findById('310104'), [test_collections['310000'][1]]);
  });

  //ChineseRegion.DataProxy
  module('ChineseRegion.DataProxy',{
    setup: function(){
      ChineseRegion._caches = {}; //reset global caches
      this.proxy = new ChineseRegion.DataProxy('/');
    }
  });

  test('DataProxy#indices', function(){
    expect(1);
    deepEqual(this.proxy.indices().collection, test_collections['index']);
  });

  test('DataProxy#load', function(){
    expect(4);
    this.proxy.load('310000',function(d){
      deepEqual(d.name, 'cached_310000');
      deepEqual(d.collection, test_collections['310000']);
    });
    this.proxy.load('310105',function(d){
      deepEqual(d.name, 'cached_310000');
      deepEqual(d.collection, test_collections['310000']);
    });
  });

  test('DataProxy#collections', function(){
    expect(2);
    equal(this.proxy.collections().length, 1);
    this.proxy.load('310000',function(){});
    equal(this.proxy.collections().length, 2);
  });

  test('DataProxy#collection', function(){
    expect(2);
    this.proxy.load('310000',function(){});
    deepEqual(this.proxy.collection('index').collection, test_collections['index']);
    deepEqual(this.proxy.collection('310000').collection, test_collections['310000']);
  });

  //ChineseRegion.RegionPicker
  module('ChineseRegion.RegionPicker', {
    setup: function(){
      this.picker = new ChineseRegion.RegionPicker({
        retmote: '/'
      });
    }
  });

  test('RegionPicker#pick', function(){
    expect(6);
    this.picker.pick('310104', function(regions, collections){
      equal(regions.length,2);
      equal(collections.length,2);
      deepEqual(regions[0], test_collections['index'][0]);
      deepEqual(regions[1], test_collections['310000'][1]);
      deepEqual(collections[0], test_collections['index']);
      deepEqual(collections[1], test_collections['310000']);
    });
  });
})(ChineseRegion);