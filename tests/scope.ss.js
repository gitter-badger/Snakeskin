/* This code is generated automatically, don't alter it. */var Snakeskin = global.Snakeskin;exports.init = function (obj) { Snakeskin = typeof obj === "object" ? obj : require(obj);delete exports.init;exec();return this;};function exec() {if (typeof Snakeskin !== 'undefined') { Snakeskin.Vars.name = 'foo'; }/* Snakeskin template: scope_index; obj */exports.scope_index= function (obj) { var __SNAKESKIN_RESULT__ = '', $_;var TPL_NAME = 'scope_index';var PARENT_TPL_NAME;__SNAKESKIN_RESULT__ += ' ';var name = 'bar';__SNAKESKIN_RESULT__ += ' ';__SNAKESKIN_RESULT__ += ' ';__SNAKESKIN_RESULT__ += Snakeskin.Filters.html(Snakeskin.Filters.undef(obj.child.name));var __e__with_111 = 'test';__SNAKESKIN_RESULT__ += ' ';__SNAKESKIN_RESULT__ += ' ';__SNAKESKIN_RESULT__ += Snakeskin.Filters.html(Snakeskin.Filters.undef(name) + ' ' +      Snakeskin.Filters.undef(name) + ' ' +      Snakeskin.Filters.undef(obj.child.name) + ' ' +      Snakeskin.Filters.undef(obj.child.name) + ' ' +      Snakeskin.Filters.undef(name) + ' ' +      Snakeskin.Filters.undef(Snakeskin.Vars['name']) + ' ' +      Snakeskin.Filters.undef(obj.child.child.name) + ' ' +      Snakeskin.Filters.undef(__e__with_111));__SNAKESKIN_RESULT__ += ' ';__SNAKESKIN_RESULT__ += ' ';__SNAKESKIN_RESULT__ += ' ';return __SNAKESKIN_RESULT__; };if (typeof Snakeskin !== 'undefined') {Snakeskin.cache['scope_index'] = exports.scope_index;}/* Snakeskin template. *//* Snakeskin templating system. Generated at: Mon Mar 03 2014 10:15:59 GMT+0400 (Московское время (зима)). */}