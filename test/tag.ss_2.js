/* Snakeskin v6.1.3, key <commonJS,false,
,xml,false,true,,stringConcat,true,true,true,,true,true,i18n>, label <1413886610374>, includes <>, generated at <1414826999880>.
   This code is generated automatically, don't alter it. */
(function() {
    var Snakeskin = global.Snakeskin;
    exports['init'] = function(obj) {
        Snakeskin = Snakeskin || obj instanceof Object ? obj : require(obj);
        delete exports.init;
        exec.call(exports);
        return exports;
    };

    function exec() {
        var __ROOT__ = this,
            self = this;
        var $C = this.$C != null ? this.$C : Snakeskin.Vars.$C,
            async = this.async != null ? this.async : Snakeskin.Vars.async;
        var __$C__ = $C,
            __async__ = async;
        var __APPEND__ = Snakeskin.appendChild,
            __FILTERS__ = Snakeskin.Filters,
            __VARS__ = Snakeskin.Vars,
            __LOCAL__ = Snakeskin.LocalVars,
            __STR__, __TMP__, __J__;
        var $_ = __LOCAL__['$_1b3c1']; /* Snakeskin template: tag_index;  */
        this.tag_index = function() {
            var __THIS__ = this,
                __CALLEE__ = __ROOT__.tag_index,
                callee = __CALLEE__;
            if (!callee.Blocks) {
                var __BLOCKS__ = __CALLEE__.Blocks = {},
                    blocks = __BLOCKS__;
            }
            var __RESULT__ = '',
                __COMMENT_RESULT__, __NODE__, $_;

            function getTplResult(opt_clear) {
                var res = __RESULT__;
                if (opt_clear) {
                    __RESULT__ = '';
                }
                return res;
            }

            function clearTplResult() {
                __RESULT__ = '';
            }
            var __RETURN__ = false,
                __RETURN_VAL__;
            var TPL_NAME = "tag_index",
                PARENT_TPL_NAME;
            __TMP__ = {
                'class': ''
            };
            __RESULT__ += '<span';
            __STR__ = '';
            __J__ = 0;
            if (('bar') != null && ('bar') !== '') {
                __STR__ += __J__ ? ' ' + 'bar' : 'bar';
                __J__++;
            }
            if (('car') != null && ('car') !== '') {
                __STR__ += __J__ ? ' ' + 'car' : 'car';
                __J__++;
            }
            if (('class') != null && ('class') != '' && (__STR__ || false)) {
                if (__TMP__[('class')] != null) {
                    __TMP__[('class')] += __STR__;
                } else {
                    if (__NODE__) {
                        __NODE__.setAttribute('class', __STR__);
                    } else {
                        __RESULT__ += ' ' + 'class' + (__STR__ ? '="' + __STR__ + '"' : '');
                    }
                }
            }
            __TMP__['class'] += (__TMP__['class'] ? ' ' : '') + 'foo';
            __RESULT__ += (__TMP__['class'] ? ' class="' + __TMP__['class'] + '"' : '') + '>';
            __TMP__ = {
                'class': ''
            };
            __RESULT__ += '<div';
            __RESULT__ += ' id="my"';
            __TMP__['class'] += (__TMP__['class'] ? ' ' : '') + '' + __FILTERS__.html(($_ = __FILTERS__['bem'].call(this, 'foo', '__bar')), false, false) + '';
            __RESULT__ += (__TMP__['class'] ? ' class="' + __TMP__['class'] + '"' : '') + '>';
            __RESULT__ += '1 ';
            __RESULT__ += '</div>';
            __RESULT__ += '</span>';
            __TMP__ = {
                'class': ''
            };
            __RESULT__ += '<div';
            __RESULT__ += ' id="my"';
            __TMP__['class'] += (__TMP__['class'] ? ' ' : '') + '&__bar';
            __RESULT__ += (__TMP__['class'] ? ' class="' + __TMP__['class'] + '"' : '') + '>';
            __RESULT__ += '1 ';
            __RESULT__ += '</div>';
            __TMP__ = {
                'class': ''
            };
            __RESULT__ += '<div';
            __RESULT__ += ' id="my"';
            __TMP__['class'] += (__TMP__['class'] ? ' ' : '') + '' + __FILTERS__.html(($_ = __FILTERS__['bem'].call(this, 'foo', '__bar')), false, false) + '';
            __RESULT__ += (__TMP__['class'] ? ' class="' + __TMP__['class'] + '"' : '') + '>';
            __RESULT__ += '1 ';
            __RESULT__ += '</div>';
            return __RESULT__;
        };
        Snakeskin.cache["tag_index"] = this.tag_index; /* Snakeskin template. */
    }
}).call(this);
