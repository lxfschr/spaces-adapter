/**
 * Created by kukulski on 6/3/14.
 */

define(function (require, exports, module) {

    var PS = require("ds");

    var _get = _playground.ps.descriptor.get

    var current = {
        "ref" : "Lyr",
        "value" : "Trgt",
        "enum" : "Ordn"
    }

    var LayerKinds = {
        group:7,
        endGroup:13,
        bitmap:1
    }


    var makeFilterFn =  function(params) {

        var type = typeof params

        switch (type) {
            case "function": return params; break;
            default: return null;
        }
    }

    var filterAndMapAndHier = function(arr,options) {
        options = options || {}
        var filter = makeFilterFn(options.filter)
        var map = makeMapFn(options.map)

        var filtered= filter ? arr.filter(filter) : arr
        var mapped = map ? filtered.map(map) : filtered
        return makeHierarchy(mapped)
    }

    var makeMapFn =  function(params) {

        var type = typeof params
        if(Array.isArray(params)) type = "array";

        switch (type) {
            case "function": return params; break;
            case "string": return mapFnFromArray([params, "layerKind"]); break;
            case "Array":
                var fields = params.concat("layerKind")
                return mapFnFromArray(fields)
                break;
            default: return null;
        }
    }

    var makeHierarchy = function(raw) {
        var rval = []
        var targets = [rval]
        var target = rval

        var actions = []
        actions[LayerKinds.group] = function (elt) {
            defaultAction(elt)
            elt.children = []
            targets.push(elt.children)
            target = elt.children
        }
        var defaultAction = function (elt) {
            target.push(elt)
        }

        actions[LayerKinds.endGroup] = function (elt) {
            target.endGroup = elt
            targets.pop()
            target = targets[targets.length - 1]
        }

        for (var i = raw.length - 1; i >= 0; --i) {
            var elt = raw[i];
            if (elt && typeof elt == "object") {
                var cmd = actions[elt.layerKind] || defaultAction;
                cmd(elt)
            }
        }
        return rval
    }




    var offsetCommand = function (cmd, ref, dx, dy) {


        if(ref) {

            PS.call("slct",{null: ref})

        }
        ref = ref || current

        var args = dx ? {
            "T   " : {
                "obj" : "Ofst",
                "Hrzn" : {
                    "value" : dx,
                    "unit" : "#Px "
                },
                "Vrtc" : {
                    "value" : dy || 0,
                    "unit" : "#Px "
                }
            },
            "null" : ref
        } : {
            null: ref

        }
        PS.call(cmd,args)
    }


  module.exports = {

      selected: function(cb) {
        return PS.getAsync(current,cb)
      },

       byName: function(name,cb) {
           PS.call("slct",
               {
                   "MkVs":0,
                   "null":{ name :name, ref:"Lyr "}
               },cb);

       },
      frontmost: function(cb) {
         return _playground.ps.descriptor.play('slct',{
              "MkVs" : 0,
              "null" : {ref:"Lyr ",
                  value:"Frnt",
                  enum:"Ordn"}
          },"silent",cb)
      },
      withLayerCount: function(cb) {
          PS.getProperty("document","NmbL",cb)
//          var docRef = {ref:[
//              {ref: 'Prpr', property: 'NmbL'},
//              {ref: "document", value: "Trgt", enum: "Ordn"}
//          ]}
//
//          get(docRef, function (err,doc) {
//              cb(doc.NmbL);
//          })
      },

      getAsync: function(cb,options) {
          var filterLayers = function(rawLayers)
          {

              try {
                  var arr = filterAndMapAndHier(rawLayers, options)
                  cb(arr)
              } catch (e) { console.log(e)
              }
          }
          module.exports.rawLayers(filterLayers);
      },
      rawLayers: function(cb) {
          // this version ignores 'background' by omission rather than design

          module.exports.withLayerCount(function(_,numberOfLayers) {
              if(numberOfLayers == 0) {
                  cb([]);
                  return;
              }
              var layers = [];
              var waitCount = numberOfLayers;

              for (var i=1;i<numberOfLayers+1;i++) {
                  layers[i] = null;
                  (function(){
                      var j = i
                      _get({ref:"Lyr ", index:j}, function(_,elt) {
                          layers[j] = elt;
                          waitCount--;
                          if(waitCount == 0) {
                              cb(layers);
                          }
                      })})();
              }
          })
      },

      propertyFromEachLayer: function(propName, cb) {

          module.exports.withLayerCount(function (_,numberOfLayers) {
              if (numberOfLayers == 0) {
                  cb([]);
                  return;
              }
              var layers = [];
              var waitCount = numberOfLayers;

              for (var i = 1; i < numberOfLayers + 1; i++) {
                  layers[i] = null;
                  (function () {
                      var j = i
                      PS.getProperty({ref: "Lyr ", index: j},propName, function (err,val) {
                          layers[j] = val;
                          waitCount--;
                          if (waitCount == 0) {
                              cb(layers);
                          }
                      })
                  })();
              }
          })


      },
      copy: function (ref, dx, dy) {
        offsetCommand("copy",ref,dx,dy)
      },
      move: function(ref, dx, dy) {
          offsetCommand("move",ref,dx,dy)
      },
      rename: function (ref, newName, cb) {
          _playground.ps.descriptor.play(
              'setd',
              {
                  "T   ": {
                      obj: "Lyr",
                      value: {
                          Nm: newName
                      }
                  },
                  null:  current
              },
              "silent",
              cb)



      },
      "new" : function(cb) {
          return PS.call('Mk  ',{
              "null" : {
                  "ref" : "Lyr "
              }
          },"silent",cb)
      } ,

      newFill: function(rgb,cb) {
          var r, g,b;

          if(Array.isArray(rgb)) {
            r = rgb[0]
             g = rgb[1]
              b = rgb[2]
          } else {
              r = rgb >> 16
              g = (rgb >> 8) &255
              b = rgb & 255
          }



          PS.call('Mk  ',{
              "Usng" : {
                  "obj" : "contentLayer",
                  value: {
                      "Type": {
                          "obj": "solidColorLayer",
                          value: {
                              "Clr ": {
                                  "obj": "RGBC",
                                  value: {
                                      "Rd  ": r,
                                      "Grn ": g,
                                      "Bl  ": b
                                  }
                              }
                          }
                      }
                  }
              },
              "null" : {
                  "ref" : "contentLayer"
              }
          })
      },
      "delete": function(ref) {
          PS.call("Dlt ", {null: ref || current})
      },
      ifLayerNamed: function(name, exists, nonexist) {
          PS.getAsync({ref:'Lyr ', name:name}, function(err,l){
              var fn = err ? nonexist: exists;
              if (fn) fn();
          })
      },

      toggleLayerAtIndex:  function(idx, show) {
          var cmd = show ? "Shw ":"Hd  "
          PS.call(cmd, {null: { ref : "Lyr ",index: idx}})
      },

      haveLayer : function(name) {
          this.ifLayerNamed(name,
              function () {
                  module.exports.byName(name);
              }, function () {
                  module.exports.new();
                  module.exports.rename(name);
              });
      },

      null: null
  } //return value

});