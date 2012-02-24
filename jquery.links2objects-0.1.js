(function($){
 $.fn.links2objects = function(options) {

  var defaults = {
    sites: ['youtube', 'flickr', 'vimeo'],
    flickr_size: 'medium',
    flickr_api_key: '',
    youtube_video_width: 560,
    youtube_video_height: 340,
    vimeo_video_width: 560,
    vimeo_video_height: 340
  };
  var global_obj = null;
  var options = $.extend(defaults, options);


  var flickr = function(html){
    var ret_dict = {};
    var link_regexp = /http:\/\/www.flickr.com\/photos\/([a-z]+)\/(\d+)\/?/gi;
    var m = html.match(link_regexp);
    if(m){
      var len = m.length;
      for(var i = 0; i<m.length; i++){
        var photo_id = m[i].match(/\d+/)[0];
        var request_link = 'http://api.flickr.com/services/rest/?format=json&method=flickr.photos.getSizes&photo_id='+photo_id+'&api_key='+options.flickr_api_key+'&jsoncallback=?';

        $.getJSON(request_link,
          function(data){
            if(data){
              var sizes = data;
              if(sizes.sizes && sizes.sizes.size && data.stat && data.stat=="ok"){
                sizes = sizes.sizes.size;
                var len2 = sizes.length;
                for(var j=0;j<len2; j++){
                  if(sizes[j]["label"].toLowerCase()==options.flickr_size){
                    var old_link = sizes[j].url.match(link_regexp)[0];
                    var new_html = '<a href="'+old_link+'"><img src="'+sizes[j].source+'" /></a>';
                    global_obj.html(global_obj.html().replace(new RegExp(old_link), new_html));
                  }
                }
              }
            }
          }

        );
      }
    }
  };

  var picasa = function(html){
    var link_regexp = '';
  };

  var youtube = function(html){
    var link_regexp = /http:\/\/(www\.)?youtube\.com\/watch\/?\?v=([a-z0-9\-_]+)(&amp;[a-z]+=.*)*/gi;
    var m = html.match(link_regexp);
    if(m){
      var len = m.length;
      for(var i = 0; i<len; i++){
        var video_id = m[i].match(/v=([a-zA-Z0-9\-_]+)/i);
        if(video_id[1]){
          video_id = video_id[1];
          var new_html = "<object width=\""+options.youtube_video_width+"\" height=\""+options.youtube_video_height+"\"> \
          <param name=\"movie\" value=\"http://www.youtube.com/v/"+video_id+"&fs=1&rel=0\"></param> \
          <param name=\"allowFullScreen\" value=\"true\"></param><param name=\"allowscriptaccess\" value=\"always\"></param> \
          <embed src=\"http://www.youtube.com/v/"+video_id+"&fs=1&rel=0\" type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" allowfullscreen=\"true\" width=\""+options.youtube_video_width+"\" height=\""+options.youtube_video_height+"\"></embed> \
          </object>";
          global_obj.html(global_obj.html().replace(m[i], new_html));
        }
      }
    }
  };

 var vimeo = function(html){
   var link_regexp = /http:\/\/(www\.)?vimeo\.com\/([0-9]+)/gi;
   var m = html.match(link_regexp);
   if(!m || m.length == 0) return;

   for(var i = (m.length - 1); i>=0; i--){
     var url = m[i];
     $.getJSON('http://vimeo.com/api/oembed.json?url=' + url + '&callback=?', function(data){
       var html = data.html;
       html = html.replace(/width\=\"(\d)+\"/, 'width="' +  options.vimeo_video_width + '"');
       html = html.replace(/height\=\"(\d)+\"/, 'height="' +  options.vimeo_video_height + '"');

       global_obj.html(global_obj.html().replace(url, html));
     });
   }
 };

  var sites_functions = {'flickr': flickr, 'picasa': this.picasa, 'youtube': youtube, 'vimeo': vimeo };

  return this.each(function() {
   obj = $(this);
   global_obj = obj;
   var body = obj.html();
   for(var site in options.sites){
     sites_functions[options.sites[site]](body);
   }
   //return this;
  });
 };
})(jQuery);
