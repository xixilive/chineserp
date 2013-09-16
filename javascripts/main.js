$(function(){
  var picker = new ChineseRegion.RegionPicker({
    remote: 'json',
    initialized: function(){
      $('#pick').on('change', function(){
        $('#picked').empty();
        if(!$(this).val()){
          return;
        }
        this.attr('disabled', true);
        picker.pick($(this).val(), function(regions){
          $('#pick').attr('disabled', false);
          $('#picked').append('<h3>'+ (regions.map(function(r){ return r.n; }).join(' > ')) +'</h3>');
          regions.forEach(function(r){
            $('#picked').append('<hr>');
            $('<ul>').append('<li>ID: '+r.i+'</li>')
              .append('<li>Name: '+r.n+'</li>')
              .append('<li>Alias: '+r.a+'</li>')
              .append('<li>Pinyin: '+r.y+'</li>')
              .append('<li>Abbr: '+r.b+'</li>')
              .append('<li>Postcode: '+r.z+'</li>').appendTo($('#picked'));
          });
        });
      });
    }
  });
});