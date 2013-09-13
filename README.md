# Chinese region picker

Chinese region picker, data provided by [chinese_regions_db][crd]

## Getting Started
Download the [production version][min] or the [development version][dev].

Checkout [chinese_regions_db][crd] project, and dump the database into json format(visit the project for details), and Copy these JSON files into your project.

## Examples
```javascript
var regionPicker = new ChineseRegion.RegionPicker({
  remote: '/json_files_path',
  initialize: function(picker){
    picker.pick('310102', function(regions, collections){
      console.log(regions, collections);
    })
  }
});
```

## Run the examples:
Checkout this project and install dependencies:
```node
cd chineserp & npm install
```

and type following command in your peoject directory to start a server:
```
node examples/server.js
```

then, open the examples page in your browser
```
http://localhost:8888/examples
```

[crd]: https://github.com/xixilive/chinese_regions_db
[min]: https://raw.github.com/xixilive/chineserp/master/dist/chineserp.min.js
[dev]: https://raw.github.com/xixilive/chineserp/master/dist/chineserp.js