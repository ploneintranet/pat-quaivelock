(function(root, factory) {
    // We use AMD (Asynchronous Module Definition) or browser globals to create
    // this module.
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "pat-base",
            "pat-registry",
            "pat-parser",
            "pat-logger",
        ], function() {
            return factory.apply(this, arguments);
        });
    } else {
        // If require.js is not available, you'll need to make sure that these
        // global variables are available.
        factory($, patterns.Base, patterns, patterns.Parser, patterns.logger); // jshint ignore:line
    }
}(this, function($, Base, registry, Parser, logger) {
    "use strict";

    var parser = new Parser("quaivelock");
    parser.add_argument("url", "");

    var log = logger.getLogger("pat-display-time");
    log.debug("pattern loaded");

    return Base.extend({
        name: "quaivelock",
        trigger: ".pat-quaivelock",
        _changed: false,
        defaults: {
            // events on which to check for changes
            changingEvents: "change keyup paste",
            // fields on which to check for changes
            changingFields: "input,select,textarea,fileupload"
        },
        init: function() {
            this.options = parser.parse(this.$el);
            log.debug("pattern initialized");
            this.set_listeners();
        },
        lock: function() {
            var self = this;
            if (self._changed) {
                return;
            }
            if (!self.options.url) {
                return;
            }
            self._changed = true;
            $.ajax({
                url: self.options.url,
                data: {
                    "lock": true
                },
                success: function(data) {
                    $("#global-statusmessage").html(
                        $("#global-statusmessage", data).html()
                    );
                }
            });
        },
        unlock: function() {
            var self = this;
            if (!self._changed) {
                return;
            }
            if (!self.options.url) {
                return;
            }
            $.ajax({
                url: self.options.url,
                data: {
                    "unlock": true
                },
                success: function(data) {
                    $("#global-statusmessage").append(
                        $("#global-statusmessage", data).html()
                    );
                }
            });
            self._changed = false;
        },
        set_listeners: function() {
            var self = this;
            if (!self.$el.is("form")) {
                return;
            }
            // unlock when changing page
            $(window).on(
                "beforeunload",
                self.unlock.bind(self)
            );

            // unlock when the form gets removed from the DOM
            self.$el.bind("DOMNodeRemoved", function(e) {
                if (e.target === self.$el[0]) {
                    self.unlock.bind(self)();
                }
            });

            // lock when elements are changed
            $(self.defaults.changingFields, self.$el).on(
                self.defaults.changingEvents,
                self.lock.bind(self)
            );
        }
    });
}));
