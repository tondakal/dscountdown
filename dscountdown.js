/*!
 dsCountDown v1.1
 jQuery count down plugin
 Complete rewrite to Jquery UI widget 
 Antonin Kalvoda
 (c) 2013 I Wayan Wirka - http://iwayanwirka.duststone.com/dscountdown/
 license: http://www.opensource.org/licenses/mit-license.php
 */

(function (factory) {
    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define([
            "jquery",
            "./core",
            "./widget"
        ], factory);
    } else {

        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    return $.widget("ui.dsCountDown", {
        version: "@VERSION",
        options: {
            startDate: new Date(), // Date Object of starting time of count down, usualy now (whether client time or given php time)
            endDate: null, // Date Object of ends of count down

            elemSelDays: '', // Leave blank to use default value or provide a string selector if the lement already exist, Example: .ds-ds.data.days
            elemSelHours: '', // Leave blank to use default value or provide a string selector if the lement already exist, Example: .ds-ds.data.hours
            elemSelMinutes: '', // Leave blank to use default value or provide a string selector if the lement already exist, Example: .ds-ds.data.minutes
            elemSelSeconds: '', // Leave blank to use default value or provide a string selector if the lement already exist, Example: .ds-ds.data.seconds

            theme: 'white', // Set the theme 'white', 'black', 'red', 'flat', 'custome'

            titleDays: 'Days', // Set the title of ds.data.days
            titleHours: 'Hours', // Set the title of ds.data.hours
            titleMinutes: 'Minutes', // Set the title of ds.data.minutes
            titleSeconds: 'Seconds', // Set the title of ds.data.seconds

            onBevoreStart: null, // callback before the count down starts
            onClocking: null, // callback after the timer just clocked
            onFinish: null,
        },
        data: {
            refreshed: 1000,
            thread: null,
            running: false,
            left: 0,
            decreament: 1,
            interval: 0,
            seconds: 0,
            minutes: 0,
            hours: 0,
            days: 0,
            validDate: false,
            elemDays: null,
            elemHours: null,
            elemMinutes: null,
            elemSeconds: null
        },
        _create: function () {

            var ds = this;
            this.element.addClass('dsCountDown');
            if (!ds.data.validDate) {
                this.element.hide();
            }
            this.element.attr('style', 'display:none;')
            // Init element
            if (!ds.options.elemSelSeconds) {
                this.element.prepend('<div class="ds-element ds-element-seconds">\
							<div class="ds-element-title">' + ds.options.titleSeconds + '</div>\
							<div class="ds-element-value ds-seconds">00</div>\
						</div>');
                ds.data.elemSeconds = this.element.find('.ds-seconds');
            } else {
                ds.data.elemSeconds = this.element.find(ds.options.elemSelSeconds);
            }

            if (!ds.options.elemSelMinutes) {
                this.element.prepend('<div class="ds-element ds-element-minutes">\
							<div class="ds-element-title">' + ds.options.titleMinutes + '</div>\
							<div class="ds-element-value ds-minutes">00</div>\
						</div>');
                ds.data.elemMinutes = this.element.find('.ds-minutes');
            } else {
                ds.data.elemMinutes = this.element.find(ds.options.elemSelMinutes);
            }

            if (!ds.options.elemSelHours) {
                this.element.prepend('<div class="ds-element ds-element-hours">\
							<div class="ds-element-title">' + ds.options.titleHours + '</div>\
							<div class="ds-element-value ds-hours">00</div>\
						</div>');
                ds.data.elemHours = this.element.find('.ds-hours');
            } else {
                ds.data.elemHours = this.element.find(ds.options.elemSelHours);
            }

            if (!ds.options.elemSelDays) {
                this.element.prepend('<div class="ds-element ds-element-days">\
							<div class="ds-element-title">' + ds.options.titleDays + '</div>\
							<div class="ds-element-value ds-days">00</div>\
						</div>');
                ds.data.elemDays = this.element.find('.ds-days');
            } else {
                ds.data.elemDays = this.element.find(ds.options.elemSelDays);
            }


            this.element.addClass('ds-' + ds.options.theme);

            // Init start and end
            this._initDates();

            this._refreshValue();

        },
        _initDates: function () {
            var ds = this;
            if (ds.options.startDate && ds.options.endDate) {
                ds.data.interval = ds.options.endDate.getTime() - ds.options.startDate.getTime();
                if (ds.data.interval > 0) {
                    var allSeconds = (ds.data.interval / 1000);
                    var hoursMod = (allSeconds % 86400);
                    var minutesMod = (hoursMod % 3600);

                    ds.data.left = allSeconds;
                    ds.data.days = Math.floor(allSeconds / 86400);
                    ds.data.hours = Math.floor(hoursMod / 3600);
                    ds.data.minutes = Math.floor(minutesMod / 60);
                    ds.data.seconds = Math.floor(minutesMod % 60);
                } else {
                    ds.data.left = 0;
                    ds.data.days = 0;
                    ds.data.hours = 0;
                    ds.data.minutes = 0;
                    ds.data.seconds = 0;
                }
            }
        },
        _destroy: function () {
//		this.element.removeAttr( "role aria-valuemin aria-valuemax aria-valuenow" );

            this.valueDiv.remove();
        },
        _setOptions: function (options) {
            // Ensure "value" option is set after other values (like max)
            var value = options.value;
            delete options.value;

            this._super(options);

            this._refreshValue();

        },
        _setOption: function (key, value) {
            this._super(key, value);
            if (key == 'startDate' || key == 'endDate') {
                this._initDates();
            }
        },
        _refreshValue: function () {
            var ds = this;
            if (!ds.data.running) {
                if (ds.data.left > 0) {

                    if (ds.options.onBevoreStart) {
                        ds.options.onBevoreStart(ds);
                    }

                    ds.data.thread = setInterval(
                            function () {

                                if (ds.data.left > 0) {

                                    ds.data.left -= ds.data.decreament;

                                    ds.data.seconds -= ds.data.decreament;

                                    if (ds.data.seconds < 0 && (ds.data.minutes > 0 || ds.data.hours > 0 || ds.data.days > 0)) {
                                        ds.data.minutes--;
                                        ds.data.seconds = 59;
                                    }

                                    if (ds.data.minutes < 0 && (ds.data.hours > 0 || ds.data.days > 0)) {
                                        ds.data.hours--;
                                        ds.data.minutes = 59;
                                    }

                                    if (ds.data.hours <= 0 && ds.data.days > 0) {
                                        ds.data.days--;
                                        ds.data.hours = 23;
                                    }

                                    if (ds.data.elemDays)
                                        ds.data.elemDays.html((ds.data.days < 10 ? '0' + ds.data.days : ds.data.days));
                                    if (ds.data.elemHours)
                                        ds.data.elemHours.html((ds.data.hours < 10 ? '0' + ds.data.hours : ds.data.hours));
                                    if (ds.data.elemMinutes)
                                        ds.data.elemMinutes.html((ds.data.minutes < 10 ? '0' + ds.data.minutes : ds.data.minutes));
                                    if (ds.data.elemSeconds)
                                        ds.data.elemSeconds.html((ds.data.seconds < 10 ? '0' + ds.data.seconds : ds.data.seconds));

                                    if (ds.options.onClocking) {
                                        ds.options.onClocking(ds);
                                    }

                                } else {
                                    ds._stop(ds.options.onFinish);
                                }
                                if (!ds.data.validDate) {
                                    ds.data.validDate = true;
                                    ds.element.show();
                                }
                            },
                            ds.data.refreshed);
                    ds.data.running = true;
                } else {
                    ds.data.seconds = 0;
                    ds.data.elemMinutes.html("00");
                    if (ds.options.onFinish) {
                        ds.options.onFinish(ds);
                    }
                }
            }
        },
        _stop: function (callback) {
            var ds = this;
            if (ds.data.running) {
                clearInterval(ds.data.thread);
                ds.data.running = false;
            }
            if (callback) {
                callback(ds);
            }
        }

    });

}));



