/*
 * chineserp
 * https://github.com/xixilive/chineserp
 *
 * Copyright (c) 2013 xixilive
 * Licensed under the MIT license.
 * 
 * ==================================================
 * data struct of region:
 *  i: ID, the unique code of region
 *  n: Name, the fullname of region
 *  a: Alias, the simplfied name of region
 *  b: Abbr, the simplfied chinese Pinyin of region
 *  y: Pinyin, the chinese Pinyin of region
 *  z: Zipcode, the post-code of region
 */

(function($) {
  'use strict';

  var root = this
  var ChineseRegion = root.ChineseRegion = {};

  ChineseRegion.$ = $;

  // Prototype getJSON wrapper
  if(ChineseRegion.$ && !ChineseRegion.$.getJSON && root.Ajax){
    ChineseRegion.$.getJSON = function(){
      var url = arguments[0], data, callback;
      switch(arguments.length){
        case 2:
          data = null;
          callback = arguments[1];
          break;
        case 3:
          data = arguments[1];
          callback = arguments[2];
          break;
      }
      if(typeof callback != 'function') callback = function(){};
      var request = new root.Ajax.Request(url, {method: 'get', parameters: data, evalJSON: 'force', onSuccess: function(t){
        callback(t.responseJSON);
      }});
      return request.transport;
    };
  };

  ChineseRegion.getJSON = function(){
    return ChineseRegion.$.getJSON.apply(ChineseRegion.$, arguments);
  };

  /*
    RegionCollection
  */
  var RegionCollection = ChineseRegion.RegionCollection = function(data, id){
    this.collection = data || [];
    this.name = id;
    return this;
  };

  RegionCollection.prototype = {
    constructor: RegionCollection,

    select: function(f){
      return this.collection.filter(f);
    },

    map: function(f){
      return this.collection.map(f);
    },

    first: function(f){
      return this.select(f)[0];
    },

    //find by names
    //options: 
    //  key: the key to find
    findByNames: function(a,b, options){
      options = options || {};
      options.key = options.key || 'n'; //default to find by region name

      var arr = [];
      if(a){
        arr[0] = this.first(function(d){
          return d[options.key] == a;
        }) || this.collection[0];
      }
      
      if(b && arr[0] && arr[0].c){
        arr[1] = arr[0].c.filter(function(d){ return d[options.key] == b; })[0] || arr[0].c[0];
      }
      return arr;
    },

    findById: function(id, options){
      var arr = [];
      arr[0] = this.first(function(d){
        return d.i == id;
      }) || this.first(function(d){
        return d.i == id.substr(0,4) + '00';
      }) || this.collection[0];

      if(arr[0] && arr[0].c){
        arr[1] = arr[0].c.filter(function(d){ return d.i == id; })[0] || arr[0].c[0];
      }
      return arr;
    }
  };

  /*
    DataProxy
  */
  var DataProxy = ChineseRegion.DataProxy = function(remote, init){
    var self = this;
    this._remote = (remote  + '/').replace(/\/+/g,'/');
    this._caches = {};

    this.load('index', function(collection, proxy){
      if(typeof init == 'function'){ init(proxy, collection); }
    });
    return this;
  };

  DataProxy.prototype = {
    _index: function(id){
      return id.replace(/\d{4}$/,'0000');
    },

    _cacheid: function(id){
      return 'cached_' + this._index(id);
    },

    _url: function(id){
      return this._remote + this._index(id) + '.json';
    },

    load: function(id, f){
      var self = this, cache_id = this._cacheid(id);
      if(typeof f != 'function') f = function(){};

      if(this._caches[cache_id]){
        f(new RegionCollection(this._caches[cache_id], cache_id),self);
        return;
      }

      ChineseRegion.$.getJSON(this._url(id), function(data){
        self._caches[cache_id] = data;
        f(new RegionCollection(data, cache_id), self);
      });
    },

    collections: function(){
      var coll = [];
      for(var i in this._caches){
        coll.push(new RegionCollection(this._caches[i], i));
      }
      return coll;
    },

    collection: function(value){
      var cid = this._cacheid(value);
      return this.collections().filter(function(c){ return c.name == cid; })[0];
    },

    indices: function(){
      return this.collection('index');
    }
  };

  /*
    RegionPicker
    options:
      remote: the json files path
    Example:
    new RegionPicker({remote: '/', initialized: function(picker){
      picker.pick('310102', function(regions){ console.log( regions.map(function(d){ return d.n; }).join(" > "); ); })
      picker.pick('PROVINCE,CITY,SUBURB', function(regions){ console.log( regions.map(function(d){ return d.n; }).join(" > "); ); })
    }})
  */
  var RegionPicker = ChineseRegion.RegionPicker = function(options){
    var self = this;
    this.options = options;
    new DataProxy(options.remote || '',  function(proxy,index_collection){
      self.initialize(proxy);
    });
    return self;
  };

  RegionPicker.prototype = {
    initialize: function(proxy){
      this.proxy = proxy;
      if(typeof this.options.initialized == 'function') this.options.initialized(this);
    },

    //pick(value, callback)
    //pick(value, options, callback)
    pick: function(){
      var value = arguments[0], options = {}, f;

      switch(arguments.length){
        case 2:
          f = arguments[1];
          break;
        case 3:
          options = arguments[1];
          f = arguments[2];
          break;
      }

      if(typeof f != 'function') f = function(){};

      var proxy = this.proxy;
      if(!this.proxy){ f([]); return; }

      if(value == null || value == ''){
        value = proxy.indices().collection[0].i;
      }

      if(/^\d+$/.test(value)){ //pickById
        this._pickById(value, options, f);
        return;
      }else{ //pickByNames
        if(typeof value == 'string') value = value.split(/[,|\s]+/,3);
        this._pickByNames(value, options, f);
        return;
      }
      f([]);
    },

    _pickedCollections: function(regions){
      if(!regions || !regions.map){
        return [];
      }
      var collections = [];
      if(regions[0]){
        collections.push(this.proxy.collection('index').collection);
      }
      if(regions[1]){
       collections.push(this.proxy.collection(regions[1].i).collection); 
      }
      if(regions[2] && regions[1].c){
       collections.push(regions[1].c); 
      }
      return collections;
    },

    _pickById: function(id, options, f){
      var self = this, proxy = this.proxy, regions = [];
      regions[0] = proxy.indices().first(function(r){
        return r.i == id.substr(0,2) + '0000';
      });
      proxy.load(id, function(c){
        regions = regions.concat(c.findById(id,options));
        f(regions, self._pickedCollections(regions));
      });
    },

    _pickByNames: function(names, options, f){
      var self = this, proxy = this.proxy, regions = [];
      regions[0] = proxy.indices().first(function(r){
        return r.n == names[0];
      });
      if(!regions[0]){
        f([]);
        return;
      }
      proxy.load(regions[0].i, function(c){
        regions = regions.concat(c.findByNames(names[1],names[2],options));
        f(regions, self._pickedCollections(regions));
      });
    }
  };

}).call(this, this.jQuery || this.$ || this.Zepto || this.Prototype);