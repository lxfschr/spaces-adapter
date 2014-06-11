
define(function (require, exports, module) {
    var stub = function() {}
    var echo = function(a,b) { console.log(a,b)}

    var log = function(err, val)
    {
        console.log(err,val)
    }

    var desc = _playground.ps.descriptor


    wrapTarget = function(maybeClassName) {
        return typeof maybeClassName == 'string' ? {ref:maybeClassName,  enum: "Ordn", value: "Trgt"} : maybeClassName
    }

    module.exports = {
        log: function (message) {
            _playground.debug.logMessage(message)
        },
        call: function (command, json,opts,cb) {
            return desc.play(command,json || {} ,opts || "silent",cb || stub)
        },
        //  get:function(json){},
        getAsync: function (json, callback) {
            json = wrapTarget(json)
            if (Array.isArray(json))
            {
                var fixed = json.map(wrapTarget)
                fixed.reverse()
                json = {ref: fixed}
            }
            return desc.get(json,callback || log)
        },
        getProperty: function (mainRef,propName,cb)
        {
            cb = cb || echo
            module.exports.getAsync([mainRef, {ref:"Prpr", property:propName}],
                function(err,obj) {
                    cb(err,obj[propName])}
            )
        },
        identity: function(desc,ref,cb) {
            desc.identity(desc,ref,cb || log)
        }


//        function dummyNotifier(a, b) {
//            console.log(a, b)
//        }
//
//        PS.call = function (eventId, arguments) {
//            return _playground.ps.descriptor.play(eventId, arguments, "Silent", dummyNotifier);
//        };
//
//        PS.get = function (target) {
//            return _playground.ps.descriptor.get(target, dummyNotifier);
//
//        },
//
//            roundTripRef
//        :
//        function (json) {
//        }

        ,
        roundTrip : function (json) { }

        ,
        expandName:function (nameOrID) {
        }
        ,
        expandCode:function (nameOrID) {
        }
        ,
        getCode:function (nameOrID) {
        }
        ,
        sendCancel:function () {
        }
        ,
        showConsole:function () {
        }
        ,
        focusHTML: false

    }
});