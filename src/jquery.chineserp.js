(function($){
  // if(!this.ChineseRegion){
  //   this.console && this.console.error && this.console.error('require ChineseRegion lib, please include the chineserp.js with SCRIPT tag in current document.');
  //   return;
  // }
  var RegionRenderer = function(picker){
    if($('#region-picker').length == 0){
      $('<div id="region-picker"></div>')
        .append('<ul class="region-list"></ul><ul class="region-list"></ul><ul class="region-list"></ul>')
        .append('<div class="picker-actions"> \
          <a data-action="cancel" href="javascript:;">Cancel</a> \
          <a data-action="confirm" href="javascript:;">Confirm</a> \
        </div>')
        .appendTo('body');
    }

    this.container = $('#region-picker');
    this.container.on('click', '.region-list li', $.proxy(this.onItemClick, this));
    this.container.on('click', 'a[data-action]', $.proxy(this.onButtonClick, this));

    this.renderItems(picker.picker.proxy.indices().collection, 0, picker.picked[0]);
    var coll = picker.picker.proxy.collection(picker.picked[0].i);
    if(coll){
      this.renderItems(coll.collection, 1, picker.picked[1]);
      var children = picker.picked[1] && picker.picked[1].c ? picker.picked[1].c : coll.collection[0].c;
      if(children){
        this.renderItems(children,2, picker.picked[2]);
      }
    }
  };

  RegionRenderer.prototype = {
    onItemClick: function(e){

    },
    onButtonClick: function(e){

    },

    renderItems: function(items, index, picked){
      var c = $(".region-list:eq("+index+")",this.container);
      c.empty();
      items.forEach(function(d){
        var li = $('<li></li>').attr('data-i', d.i).text(d.n);
        if(d == picked) li.addClass('picked');
        li.appendTo(c);
      });
    },

    show: function(){
      return this;
    }
  };

  var RegionPicker = function(el, options){
    this.el = el;
    this.options = $.extend({}, options || {});
    this.picked = [];
    new ChineseRegion.RegionPicker({
      remote: this.options.remote,
      initialized: $.proxy(this.pickerInitialized, this)
    });
    return this;
  };

  RegionPicker.prototype = {
    constructor: RegionPicker,

    pickerInitialized: function(picker){
      var self = this;
      this.picker = picker;
      this.picker.pick(this.options.defaultValue, function(regions){
        self.picked = regions;
        self.el.on('click', $.proxy(self.onClick,self));
      });
    },


    onClick: function(e){
      this.renderer = this.renderer || new RegionRenderer(this);
      this.renderer.show();
    }
  };

  $.fn.regionPicker = function(options){
    return this.each(function(){
      var self = $(this), data = self.data("chineseRegionPicker");
      if (!data){
        self.data('chineseRegionPicker', (data = new RegionPicker(self, options)));
      }
    });
  };

})(jQuery);