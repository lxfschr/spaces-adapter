/**
 * Created by kukulski on 6/9/14.
 */
_playground = (function()
{
   return {
        debug: {
            logMessage: function (message)
            {
            },
            getRemoteDebuggingPort: function ()
            {
            },
            testRoundTrip: function (notifier)
            {
            }
        },
        ps: {
            descriptor: {
                play: function (event, args, opts, cb)
                {
                },
                get: function (ref, cb)
                {
                },
                identity: function (desc, ref, notifier)
                {
                },
                registerEventListener: function (cb)
                {
                },
                unRegisterEventListener: function (cb)
                {
                },
                addEvent: function (event)
                {
                },
                removeEvent: function (event)
                {
                }
            },


            owl: {
                setWidgetTypeVisibility : function (uiTypes, value, notifier) {},
                widgetTypeToolbar:1,
                widgetTypeControlBar:2,
                widgetTypePalette:4,
                widgetTypeDocument:8,
                widgetTypeApplicationBar:16
            }
        },
        util: {
            getElapsedMSecs: function ()
            {
            }
        }
    }
})();