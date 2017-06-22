DC.module('router/finance', function (mctx) {
    function f_dc_make(obj) {
        return DC.make(obj);
    }
    function f_dc_temp(obj) {
        return DC.temp(obj);
    }
    function f_dc_list(dc, list) {
        dc.DClist(list);
    }

    var dc_module = DC.temp(function () {

        return {
            state: {
                class: 'module-finance'
            },
            initLater() {
                return this;
            }
        }
    });
    ///
    var publicConfig = {},
        pending_xtx,
        pending_xtx_data = {};

    var explorer = function () {
        var prism = 'blockexplorer.com/api/';
        var colored = 'api.coinprism.com/v1/';
        var prismhost = 'https://testnet.' + prism;
        var coloredhost = 'https://testnet.' + colored;
        var fn = (obj, cbfail, cbok) => {
            var request = new XMLHttpRequest();
            var host = obj.type == 'colored' ? coloredhost : prismhost;
            request.open(obj.method || 'GET', host + obj.url);
            request.setRequestHeader('Content-Type', 'application/json');
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status != 200) return cbfail({ reason: JSON.parse(this.responseText) });
                    cbok(JSON.parse(this.responseText));
                }
            };
            request.send(JSON.stringify(obj.body));
        }
        fn.reconfig = (network) => {
            if (network == 'testnet') {
                prismhost = 'https://testnet.' + prism;
                coloredhost = 'https://testnet.' + colored;
            } else {
                prismhost = 'https://' + prism;
                coloredhost = 'https://' + colored;
            }
        }
        if (location.protocol == 'https:') fn.reconfig();
        return fn;
    } ();


    function sat2btc(sat) {
        sat = parseInt(sat);
        if (isNaN(sat)) return false;
        var btc = sat / 100000000;
        btc = btc.toFixed(8) * 1;
        return btc;
    }
    function btc2sat(btc) {
        btc = parseFloat(btc);
        if (isNaN(btc)) return false;
        btc = btc.toFixed(8);
        var sat = btc * 100000000;
        return sat;
    }
    function n2fpn(sat) {
        sat = parseInt(sat);
        if (isNaN(sat)) return false;
        var btc = sat / 10000000;
        btc = btc.toFixed(7) * 1;
        return btc;
    }
    function fpn2n(btc) {
        btc = parseFloat(btc);
        if (isNaN(btc)) return false;
        btc = btc.toFixed(7);
        var sat = btc * 10000000;
        return sat;
    }

    var timer = function () {
        var o = {};
        var ref, refapi,
            periodget = 120000,
            periodapi = 20000;
        var f = o.f = function () {
            mctx.f_semit('colu', {
                act: 'xtx_my_pending'
            }, d => {
                pending_xtx = d;
                tableBTC.update();
                if (d.length) {
                    start();
                } else {
                    stop();
                }
            });
        }
        var fapi = () => {
            var l = pending_xtx.length, ready = 0;
            pending_xtx.forEach(o => {
                explorer({
                    url: 'addr/' + o.c + '/balance'
                }, fail => {
                    // 
                }, ok => {
                    pending_xtx_data[o.c] = ok;
                    ready++;
                    if (ready == l) tableBTC.update();
                });
            });
        }
        var start = () => {
            if (refapi) clearInterval(refapi);
            fapi();
            refapi = setInterval(fapi, periodapi);
        }
        var stop = () => {
            clearInterval(refapi);
            tableBTC.update();
        }
        o.start = function () {
            if (ref) clearInterval(ref);
            f();
            ref = setInterval(f, periodget);
        }
        o.stop = function () {
            if (ref) clearInterval(ref);
        }
        return o;
    } ();

    function wallet_login() {
        timer.start();
        mctx.f_semit('get_blockchain_config', 1, data => {
            if (data.network) {
                publicConfig.network = data.network;
                explorer.reconfig(data.network);
                publicConfig.fpn_btc_value = data.fpn_btc_value;
                publicConfig.min_fee = data.min_fee;
            }
        });
    }
    function wallet_logout() {
        timer.stop();
        finance_content.el.hide();
        // password.el.show();
        // button.el.show();
        // zaqH1.el.show();
    }

    var Wallet = {
        mn_addr: '',
        btc_addr: '',
        addresses: []
    }

    var block_api = {};
    var body = f_dc_temp().insertIn(dc_module);
    var update = v => {
        body, change({ text: v });
    }
    ////
    var update = v => {
        body.change({ text: v });
    }



    var welcome = f_dc_temp(function () {
        var body = f_dc_temp({ state: { class: 'error' } });
        var update = v => {
            body.change({ text: v });
        }
        var anime = f_dc_temp({
            state: {
                class: 'fountainG',
                html: `
                <div class="windows8">
	<div class="wBall" id="wBall_1">
		<div class="wInnerBall"></div>
	</div>
	<div class="wBall" id="wBall_2">
		<div class="wInnerBall"></div>
	</div>
	<div class="wBall" id="wBall_3">
		<div class="wInnerBall"></div>
	</div>
	<div class="wBall" id="wBall_4">
		<div class="wInnerBall"></div>
	</div>
	<div class="wBall" id="wBall_5">
		<div class="wInnerBall"></div>
	</div>
</div>
            `
            }
        })
        anime.el.hide();
        var zaqH1 = f_dc_temp({
            eltype: 'h2',
            state: {
                class: '',
                text: 'Введите пароль'
            }
        })


        var password = f_dc_temp({
            eltype: 'input',
            state: {

            },
            attrs: {
                type: 'password',
                autofocus: 'true'
            }
        })

        var button = f_dc_temp({
            eltype: 'button',
            state: {
                text: 'ok'
            },
            attrs: {
                style: 'cursor:pointer'
            },
            events: {
                click() {
                    var pas = password.el.val();
                    if (pas.length < 8) return password.addClass('disable') && update('password invalid') && password.el.val('');
                    anime.el.show();
                    button.el.hide();
                    password.el.hide();
                    zaqH1.el.hide();
                    update('');
                    mctx.f_semit('init_wallet', { pas: pas }, data => {
                        if (typeof data == 'object') {
                            update('');
                            if (data.reason) {
                                update('fail because: ' + data.reason);
                                button.el.show();
                                password.el.show();
                                zaqH1.el.show();
                                anime.el.hide();
                                return password.addClass('disable');
                            }

                            else if (data.ok === true) {

                                block_api.load_wallets(fail => {
                                    console.log('fail loading wallets');
                                }, ok => {

                                    button.el.hide();
                                    password.el.hide();
                                    zaqH1.el.hide();
                                    update('');
                                    if (ok.length == 2) {
                                        var ready = 0, total = 2;
                                        Wallet.mn_addr = ok[0];
                                        Wallet.btc_addr = ok[1];
                                        wallet_login();
                                        block_api.updateBalanceFPN(fail => {
                                            // 
                                        }, ok => {
                                            ready++;
                                            if (ready == total) {
                                                finance_content.el.show();
                                                welcome.el.hide();
                                                anime.el.hide();
                                                update('');
                                            }
                                        })
                                        block_api.updateBalanceBTC(fail => {
                                            // 
                                        }, ok => {
                                            ready++;
                                            if (ready == total) {
                                                finance_content.el.show();
                                                welcome.el.hide();
                                                anime.el.hide();
                                                update('');
                                            }
                                        })

                                    }
                                });

                            }
                            else {
                                return update(JSON.stringify(data));
                            }
                        } else {
                            data = JSON.stringify(data);
                            update(data);
                        }
                    });
                },
                s_connection() {
                    wallet_logout();
                    password.el.val('');
                }
            }
        })


        return {
            state: {
                class: 'welcome_finance'
            },
            init() {
                var list = [
                    zaqH1,
                    body,
                    password,
                    button,
                    anime
                ];
                f_dc_list(this, list);
            }

        }
    }).insertIn(dc_module);

    var finance_content = f_dc_temp({
        state: {
            class: 'finance_content'
        }
    }).insertIn(dc_module);
    finance_content.el.hide();

    DC.temp(function () {
        var block = DC.temp();
        block_api.updateBalances = () => {
            //update('updating...');
            var ready = 0, total = 2;
            block_api.updateBalanceFPN(fail => {
                //update('error');
            }, ok => {
                ready++;
                if (ready == total) {
                    //update('');
                }
            })
            block_api.updateBalanceBTC(fail => {
                //update('error');
            }, ok => {
                ready++;
                if (ready == total) {
                    //update('');
                }
            })
        }
        // DC.temp({
        //     eltype: 'button',
        //     state: {
        //         class: 'b',
        //         text: 'refresh balance'
        //     },
        //     events: {
        //         click(){
        //             block_api.updateBalances();
        //         }
        //     }
        // }).insertIn(block);
        var info = DC.temp({
            eltype: 'span'
        }).insertIn(block);
        var update = (s) => {
            info.change({ text: s });
        }
        return {
            init() {
                block.insertIn(this);
                this.insertIn(finance_content);
            }
        }
    });

    /////////////////////////////////////////////////////////////////////////////////

    //block finance-freepenny

    var finance_freepenny = f_dc_temp({
        state: {
            class: 'finance-freepenny',
            html: `<h2>Freepenny</h2>`
        }
    }).insertIn(finance_content);

    var finance_freepenny_blockfreepenny = f_dc_temp({
        state: {
            class: 'finance-freepenny-blockfreepenny'
        }
    }).insertIn(finance_freepenny);

    var blockfreepenny = f_dc_temp({
        eltype: 'p',
        state: {
            class: 'p',
            html: ''
        },
        events: {
            click() {

            }
        }
    }).insertIn(finance_freepenny_blockfreepenny);

    var img_refresh = f_dc_temp({
        eltype: 'span',
        state: {
            html: '<img src="images/refresh.png">'
        },
        events: {
            click() {
                block_api.updateBalances();
            }
        },
        attrs: {
            style: 'cursor:pointer'
        }
    }).insertIn(blockfreepenny);

    var textCash = f_dc_temp({
        eltype: 'text',
        state: {
            text: '0.0000'
        }
    }).insertIn(blockfreepenny);
    var fp = f_dc_temp({
        eltype: 'span',
        state: {
            text: 'FPN'
        }
    }).insertIn(blockfreepenny);
    f_dc_temp({
        eltype: 'br'
    }).insertIn(blockfreepenny);
    var em_Me_cash = f_dc_temp({
        eltype: 'em',
        state: {
            text: 'Личный счет'
        }
    }).insertIn(blockfreepenny);

    var finance_freepenny_blockAddress = f_dc_temp({
        state: {
            class: 'finance-freepenny-blockAdress'
        }
    }).insertIn(finance_freepenny);

    var blockAdress = f_dc_temp({
        eltype: 'p',
        state: {
            class: '',
            html: 'akHUf81SJN4NUcNvy<br>68MfiN9vdVKp9x23gA '
        },
        attrs: {
            id: 'address1'
        }
    }).insertIn(finance_freepenny_blockAddress);

    var blockAdress_input = f_dc_temp({
        eltype: 'span',
        state: {
            class: '',
            html: `<img src="images/copy.png" class="copy"' 
            style="margin-right:5px;    width: 7%; cursor:pointer;"
            data-clipboard-target="#address1">`
        },
        attrs: {
            style: 'margin-right:5px;    width: 7%; cursor:pointer;'
        }
    }).insertIn(finance_freepenny_blockAddress);
    new Clipboard('.copy');

    var blockAdress_input = f_dc_temp({
        eltype: 'span1',
        state: {
            class: 'span1',
            html: 'Копировать адрес<br> <a href="#">Все счета</a>'
        }
    }).insertIn(finance_freepenny_blockAddress);

    var finance_freepenny_slide = f_dc_temp({
        state: {
            class: 'finance-freepenny-slide'//,
            //  html: `<h2>Операции  </h2>`
        }
    }).insertIn(finance_freepenny);

    var finance_freepenny_slide_h2 = f_dc_temp({
        eltype: 'h2',
        state: {
            class: '',
            text: 'Операции '
        }, events: {
            click() {
                if (finance_freepenny_slide_ul.el.style.display !== 'none')
                    finance_freepenny_slide_ul.el.hide();
                else
                    finance_freepenny_slide_ul.el.show();
            }
        }
    }).insertIn(finance_freepenny_slide);

    var finance_freepenny_slide_img = f_dc_temp({
        eltype: 'img',
        state: {
            class: 'finance-freepenny-slide-arrowBig'
        }, attrs: {
            src: 'images/arrow.png'
        }, events: {
            click() {
                if (finance_freepenny_slide_ul.el.style.display !== 'none')
                    finance_freepenny_slide_ul.el.hide();
                else
                    finance_freepenny_slide_ul.el.show();
            }
        }
    }).insertIn(finance_freepenny_slide_h2);

    var finance_freepenny_slide_ul = f_dc_temp({
        eltype: 'ul',
        state: {
            class: 'finance-freepenny-slide-ul'
        }
    }).insertIn(finance_freepenny);
    finance_freepenny_slide_ul.el.hide();

    var finance_freepenny_slide_li = f_dc_temp({
        eltype: 'li',
        state: {
            class: 'finance-freepenny-slide-li',
            html: 'Отправить'
        },
        events: {
            click() {
                finance_freepenny_slide_ul.el.hide();
                if (slide_buy.el.style.display == 'block')
                    slide_buy.el.hide();
                if (finance_freepemoney_slide_li_otpr.el.style.display !== 'none')
                    finance_freepemoney_slide_li_otpr.el.hide();
                else
                    finance_freepemoney_slide_li_otpr.el.show();
            }
        }
    }).insertIn(finance_freepenny_slide_ul);

    // var finance_freepenny_slide_li = f_dc_temp({
    //     eltype: 'li',
    //     state: {
    //         class: 'finance-freepenny-slide-li',
    //         html: 'Купить FPN'
    //     },
    //     events: {
    //         click() {
    //             finance_freepenny_slide_ul.el.hide();
    //             if(finance_freepemoney_slide_li_otpr.el.style.display == 'block')
    //                 finance_freepemoney_slide_li_otpr.el.hide();
    //             if (slide_buy.el.style.display !== 'none')
    //                 slide_buy.el.hide();
    //             else
    //                 slide_buy.el.show();
    //         }
    //     }
    // }).insertIn(finance_freepenny_slide_ul);

    // buy FPN
    //////////////////////////////////////////////////////////////////////
    var slide_buy = f_dc_temp(function () {



        var buy_input = f_dc_temp({
            eltype: 'input',
            state: {
                class: 'buy_input',
            },
            attrs: {
                type: 'text',
                placeholder: 'FPN amount'
            },
            events: {
                input() {
                    if (!publicConfig.fpn_btc_value) return update('failed');;
                    var n = this.value;
                    if (!n.length) return update('enter FPN amount');
                    n *= publicConfig.fpn_btc_value;
                    if (!n) return update('invalid');
                    n = sat2btc(btc2sat(n) + 10000);
                    update(n + ' BTC needed');
                }
            }
        })
        var buy_repeat = f_dc_temp({
            eltype: 'button',
            state: {
                class: 'buy_repeat',
                text: 'buy another'
            },
            events: {
                click() {
                    buy_repeat.el.hide();
                    buy_input.el.show();
                    buy_button.el.show();
                }
            }
        });

        var span_info = f_dc_temp({
            eltype: 'span',
            state: {
                text: ''
            }
        })
        var update = (v) => {
            span_info.change({
                text: v
            })
        }

        buy_repeat.el.hide();
        /*var buy_button = f_dc_temp({
            eltype: 'button',
            state: {
                class: 'buy_button',
                text: 'Buy'
            },
            events: {
                click() {
                    if (!publicConfig.fpn_btc_value) return console.log('failed');
                    if (pending_xtx && pending_xtx.length > 5) return update('Sorry, you have too much unpayed transactions yet');
                    var n = buy_input.el.val() * 1;
                    if (!n) return console.log('invalid');
                    console.log('loading...');
                    mctx.f_semit('colu', {
                        act: 'xtx_buy_fpn',
                        fpn_amount: n
                    }, data => {
                        if (data.a) {
                            timer.start();
                            buy_input.el.val('');
                            //buy_repeat.el.show();
                            slide_buy.el.hide();
                            //body.change({ html: 'Send <b>' + data.btc + ' BTC</b> to address <b>' + data.c + '</b> and your wallet <b>' + data.a + '</b> will be replenished with <b>' + data.fpn + ' FPN</b>' })
                            buy_repeat.el.show();
                        } else {
                            //update(JSON.stringify(data));
                        }
                    });
                }
            }
        })*/


        return {
            state: {
                class: 'slide-buy'
            },
            init() {
                var list = [
                    //buy_input,
                    //span_info,
                    //buy_button,
                    // buy_repeat
                ];
                f_dc_list(this, list);
            }
        }
    }).insertIn(finance_content);
    slide_buy.el.hide();


    /////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////
    // block freepemoney

    var finance_freepemoney = f_dc_temp({
        state: {
            class: 'finance-freepemoney',
            html: '<h2>Bitcoin</h2>'
            //html: '<div>+</div>'
        }
    }).insertIn(finance_content);

    var finance_freepemoney_blockfreepenny = f_dc_temp({
        state: {
            class: 'finance-freepemoney-blockfreepenny',
        }
    }).insertIn(finance_freepemoney);


    var blockfinance_freepemoney = f_dc_temp({
        eltype: 'p',
        state: {
            class: 'p',
            html: ''
        }
    }).insertIn(finance_freepemoney_blockfreepenny);
    var img_refresh_fr = f_dc_temp({
        eltype: 'span',
        state: {
            html: '<img src="images/refresh.png">'
        },
        attrs: {
            style: 'cursor:pointer'
        },
        events: {
            click() {
                block_api.updateBalances();
            }
        }
    }).insertIn(blockfinance_freepemoney);

    var textBTC = f_dc_temp({
        eltype: 'text',
        state: {
            text: '0.0000'
        }
    }).insertIn(blockfinance_freepemoney);


    var spanBTC = f_dc_temp({
        eltype: 'span',
        state: {
            text: 'BTC'
        }
    }).insertIn(blockfinance_freepemoney);

    f_dc_temp({
        eltype: 'br'
    }).insertIn(blockfinance_freepemoney);

    var emBTC = f_dc_temp({
        eltype: 'em',
        state: {
            text: 'Личный счет'
        }
    }).insertIn(blockfinance_freepemoney);

    var finance_freepemoney_blockAddress = f_dc_temp({
        state: {
            class: 'finance-freepemoney-blockAdress'
        }
    }).insertIn(finance_freepemoney);

    var blockAdressfreepemoney = f_dc_temp({
        eltype: 'p',
        state: {
            class: '',
            html: '17WmsqcxtaUnk8mc<br>3WFV4WFMHt9eExfjCV'
        },
        attrs: {
            style: 'color: #ebeef4;',
            id: 'address2'
        }
    }).insertIn(finance_freepemoney_blockAddress);


    var blockAdressfreepemoney_input = f_dc_temp({
        eltype: 'span',
        state: {
            class: '',
            html: `<img src="images/copy.png" class="copy"' 
            style="margin-right:5px;    width: 7%; cursor:pointer;"
            data-clipboard-target="#address2">`
        },
        attrs: {
            style: 'margin-right:5px;    width: 7%; cursor:pointer;'
        }
    }).insertIn(finance_freepemoney_blockAddress);
    new Clipboard('.copy');

    var blockAdressfreepemoney_input = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span',
            html: 'Копировать адрес<br> <a>Все счета</a>'
        }
    }).insertIn(finance_freepemoney_blockAddress);

    var finance_freepemoney_slide = f_dc_temp({
        state: {
            class: 'finance-freepemoney-slide',
            html: ``
        }

    }).insertIn(finance_freepemoney);

    var finance_freepemoney_slide_h2 = f_dc_temp({
        eltype: 'h2',
        state: {
            class: '',
            text: 'Операции '
        }, events: {
            click() {
                if (finance_freepemoney_slide_ul.el.style.display !== 'none')
                    finance_freepemoney_slide_ul.el.hide();
                else
                    finance_freepemoney_slide_ul.el.show();
            }
        }
    }).insertIn(finance_freepemoney_slide);

    var finance_freepemoney_slide_img = f_dc_temp({
        state: {
            class: 'finance-freepemoney-slide-arrowBig'
        }, events: {
            click() {
                if (finance_freepemoney_slide_ul.el.style.display !== 'none')
                    finance_freepemoney_slide_ul.el.hide();
                else
                    finance_freepemoney_slide_ul.el.show();
            }
        }
    }).insertIn(finance_freepemoney_slide_h2);

    var finance_freepemoney_slide_ul = f_dc_temp({
        eltype: 'ul',
        state: {
            class: 'finance-freepemoney-slide-ul'
        }
    }).insertIn(finance_freepemoney);
    finance_freepemoney_slide_ul.el.hide();
    var finance_freepemoney_slide_li = f_dc_temp({
        eltype: 'li',
        state: {
            class: 'finance-freepemoney-slide-li',
            html: 'Отправить'
        }, events: {
            click() {
                if (finance_freepemoney_slide_li_otpr.el.style.display !== 'none')
                    finance_freepemoney_slide_li_otpr.el.hide();
                else
                    finance_freepemoney_slide_li_otpr.el.show();
            }
        }
    }).insertIn(finance_freepemoney_slide_ul);

    var finance_freepemoney_slide_li = f_dc_temp({
        eltype: 'li',
        state: {
            class: 'finance-freepemoney-slide-li',
            html: 'Запросить платеж'
        },
        events: {
            click() {
                if (finance_freepemoney_slide_li_zapr.el.style.display !== 'none')
                    finance_freepemoney_slide_li_zapr.el.hide();
                else
                    finance_freepemoney_slide_li_zapr.el.show();
            }
        }
    })//.insertIn(finance_freepemoney_slide_ul);

    // var finance_freepemoney_slide_li = f_dc_temp({
    //     eltype: 'li',
    //     state: {
    //         class: 'finance-freepemoney-slide-li',
    //         html: 'Пополнить'
    //     },
    //     events: {
    //         click() {
    //             if (finance_freepemoney_slide_li_buy.el.style.display !== 'none')
    //                 finance_freepemoney_slide_li_buy.el.hide();
    //             else
    //                 finance_freepemoney_slide_li_buy.el.show();
    //         }
    //     }
    // }).insertIn(finance_freepemoney_slide_ul);

    var finance_freepemoney_slide_li = f_dc_temp({
        eltype: 'li',
        state: {
            class: 'finance-freepemoney-slide-li',
            html: 'Вывести'
        },
        events: {
            click() {
                if (finance_freepemoney_slide_li_vivod.el.style.display !== 'none')
                    finance_freepemoney_slide_li_vivod.el.hide();
                else
                    finance_freepemoney_slide_li_vivod.el.show();
            }
        }
    })//.insertIn(/*finance_freepemoney_slide_ul*/);

    var finance_freepemoney_slide_li = f_dc_temp({
        eltype: 'li',
        state: {
            html: `
                    
                    `,
            class: 'finance-freepemoney-slide-li'
        },
        attrs: {
            style: '    padding: 0;'
        }
    }).insertIn(finance_freepemoney_slide_ul);

    var shapeshift = f_dc_temp({
        eltype: 'a',
        state: {
            html: `
                <img src="https://shapeshift.io/images/shifty/xs_light_altcoins.png" class="ss-button" style="    margin: 0px auto;padding-top: 7px;">
            `,

        },
        attrs: {
            href: 'https://shapeshift.io/shifty.html?destination=mrhvdynJVLEz2Jx6UXE21aHjWS2EW2qMpi&amp;output=BTC'
        },
        events: {
            click(event) {
                event.preventDefault();
                var link = this.href;
                window.open(link, '1418115287605', 'width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=0,left=0,top=0');

            }
        }
    }).insertIn(finance_freepemoney_slide_li);



    ///////////////////////////////////////////////////////////////////////////////////////
    // absolute block vivod


    var finance_freepemoney_slide_li_vivod = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod'//,
            // html: `<div class="finance_freepemoney_slide_li_vivod_block1">
            //          <h2>Вывод Freepemoney</h2>
            //          <div class="finance_freepemoney_slide_li_vivod_block1_block1">
            //              <span>Сумма </span><br>
            //          </div>
            //          <div class="finance_freepemoney_slide_li_vivod_block1_block2">
            //             <span>Способ Оплаты</span><br>
            //          </div>
            //          <div class="finance_freepemoney_slide_li_vivod_block1_block3">
            //             <span>Реквизиты</span><br>
            //          </div>
            //     </div>
            //     <div class="finance_freepemoney_slide_li_vivod_block2">
            //         <h2>Добавление реквизитов</h2>

            //         <div class="finance_freepemoney_slide_li_vivod_block2_block1">
            //              <span>платежный шлюз </span><br>
            //          </div>
            //          <div class="finance_freepemoney_slide_li_vivod_block2_block2">
            //             <span>Название</span><br>
            //          </div>
            //          <div class="finance_freepemoney_slide_li_vivod_block2_block3">
            //             <span>Реквизиты</span><br>
            //          </div>
            //     </div>
            // `
        }
    }).insertIn(finance_content);
    finance_freepemoney_slide_li_vivod.el.hide();

    var finance_freepemoney_slide_li_vivod_block1 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod_block1',
            html: `<h2>Вывод Freepenny</h2>`
        }
    }).insertIn(finance_freepemoney_slide_li_vivod);

    var finance_freepemoney_slide_li_vivod_block1_block1 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod_block1_block1',
            html: `<span>Сумма </span><br>`
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1);

    var finance_freepemoney_slide_li_vivod_block1_block1_input1 = f_dc_temp({
        eltype: 'input',
        state: {
        },
        attrs: {
            type: 'text',
            placeholder: '0.000'
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1_block1);

    var finance_freepemoney_slide_li_vivod_block1_block1_input2 = f_dc_temp({
        eltype: 'select',
        state: {
            class: 'select',
            html: `
                        <option value="USD" selected>USD</option>
                        <option value="RUB">RUB</option>
            `
        },
        attrs: {
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1_block1);

    var finance_freepemoney_slide_li_vivod_block1_block2 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod_block1_block2',
            html: `<span>Способ Оплаты</span><br>`
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1);


    var finance_freepemoney_slide_li_vivod_block1_block2_input1 = f_dc_temp({
        eltype: 'select',
        state: {
            class: 'select2',
            html: `
                        <option value="USD" selected>Кредитная карта</option>
                    `
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1_block2);

    var finance_freepemoney_slide_li_vivod_block1_block3 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod_block1_block3',
            html: `<span>Реквизиты</span><br>`
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1);

    var finance_freepemoney_slide_li_vivod_block1_block2_input3 = f_dc_temp({
        eltype: 'input',
        state: {
            class: '',
            html: ''
        },
        attrs: {
            type: 'text'
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1_block3);

    var finance_freepemoney_slide_li_vivod_block1_block2_plus = f_dc_temp({
        state: {
            class: 'plus1',
            html: ''
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1_block3);

    var finance_freepemoney_slide_li_vivod_block1_block2_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span',
            html: 'К зачислению '
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1_block3);

    var finance_freepemoney_slide_li_vivod_block1_block2_span = f_dc_temp({
        eltype: 'text',
        state: {
            class: 'text',
            html: '502 грн.'
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1_block3);

    var finance_freepemoney_slide_li_vivod_block1_block2_button = f_dc_temp({
        eltype: 'input',
        state: {
            class: '',
            html: ''
        },
        attrs: {
            type: 'button',
            value: 'Вывести'
        },
        events: {
            click() {
                finance_freepemoney_slide_li_vivod.el.hide();
            }
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block1_block3);

    var finance_freepemoney_slide_li_vivod_block2 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod_block2',
            html: '<h2>Добавление реквизитов</h2>'
        }
    }).insertIn(finance_freepemoney_slide_li_vivod);
    finance_freepemoney_slide_li_vivod_block2.el.hide();

    var finance_freepemoney_slide_li_vivod_block2_block1 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod_block2_block1',
            html: `<span>платежный шлюз </span><br>`
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block2);

    var finance_freepemoney_slide_li_vivod_block1_block2_input1 = f_dc_temp({
        eltype: 'select',
        state: {
            class: 'select2',
            html: `
                        <option value="USD" selected>Кредитная карта</option>
                    `
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block2_block1);

    var finance_freepemoney_slide_li_vivod_block2_block2 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod_block2_block2',
            html: `<span>Название</span><br>`
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block2);

    var finance_freepemoney_slide_li_vivod_block2_block3 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_vivod_block2_block3',
            html: `<span>Название</span><br>`
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block2);

    var finance_freepemoney_slide_li_vivod_block2_block2_input2 = f_dc_temp({
        eltype: 'input',
        state: {
            class: ''
        },
        attrs: {
            type: 'text'
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block2_block2);

    var finance_freepemoney_slide_li_vivod_block2_block2_input3 = f_dc_temp({
        eltype: 'input',
        state: {
            class: '',
            html: ''
        },
        attrs: {
            type: 'text'
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block2_block3);

    var finance_freepemoney_slide_li_vivod_block1_block2_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'check',
            html: `
                        <input type="checkbox" class="checkbox">
                    <label>Это мой счет</label>`
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block2_block3);

    var finance_freepemoney_slide_li_vivod_block1_block2_button = f_dc_temp({
        eltype: 'input',
        state: {
            class: '',
            html: ''
        },
        attrs: {
            type: 'button',
            value: 'Подтвердить'
        }
    }).insertIn(finance_freepemoney_slide_li_vivod_block2_block3);
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    //zapr

    var finance_freepemoney_slide_li_zapr = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_zapr',
            html: `
                        <h2>Запросить платеж</h2>
                     `
        }
    })//.insertIn(/*finance_content*/);
    finance_freepemoney_slide_li_zapr.el.hide();

    var finance_freepemoney_slide_li_zapr_block1 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_zapr_block1',
            html: ``
        }
    }).insertIn(finance_freepemoney_slide_li_zapr);

    var finance_freepemoney_slide_li_zapr_block2 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_zapr_block2'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr);

    var finance_freepemoney_slide_li_zapr_block1_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span',
            text: 'Номер счета'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    f_dc_temp({
        eltype: 'br'
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_zapr_block1_input1 = f_dc_temp({
        eltype: 'select',
        state: {
            html: `
                        <option value="124512451246124w" selected></option>
                        <option value="635832656235632r">635832656235632r</option>
                        <option value="236586234672634e">236586234672634e</option>
                    `
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_zapr_block1_input1 = f_dc_temp({
        state: {
            class: 'add',
            html: `
                        <div class="plus"></div> <a href="">  Добавить счет</a>
                    `
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_zapr_block1_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span',
            text: 'Описание'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_zapr_block1_input1 = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input2',
            html: ``
        },
        attrs: {
            type: 'text'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_zapr_block1_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span',
            text: 'Сумма'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_vivod_block1_block1_input1 = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input3',
        },
        attrs: {
            type: 'text',
            placeholder: '0.000'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_vivod_block1_block1_input2 = f_dc_temp({
        eltype: 'select',
        state: {
            class: 'select',
            html: `
                        <option value="USD" selected>USD</option>
                        <option value="RUB">RUB</option>
                    `
        },
        attrs: {
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_vivod_block1_block2_button = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input4',
            html: ''
        },
        attrs: {
            type: 'button',
            value: 'Получить ссылку'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block1);

    var finance_freepemoney_slide_li_zapr_block1_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span',
            text: 'Ваша ссылка'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block2);

    var div = f_dc_temp({
        state: {
            class: 'd'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block2);

    var finance_freepemoney_slide_li_vivod_block1_block1_input1 = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input5',
        },
        attrs: {
            type: 'text',
            value: '13Q3WbjEUpj645mwFPZ6w5bWmbj5gQ7TG3'
        }
    }).insertIn(div);

    var finance_freepemoney_slide_li_zapr_block1_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span bl',
            text: 'Получатели'
        }
    }).insertIn(div);

    var finance_freepemoney_slide_li_zapr_block1_input = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input6',
        },
        attrs: {
            type: 'text',
            placeholder: ''
        }
    }).insertIn(div);

    var finance_freepemoney_slide_li_zapr_block1_input_plus = f_dc_temp({
        state: {
            class: 'plus abs'
        }
    }).insertIn(div);

    var finance_freepemoney_slide_li_vivod_block1_block1_input1_plus = f_dc_temp({
        state: {
            class: 'qrcode'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block2);

    var finance_freepemoney_slide_li_zapr_block2_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span bl1',
            html: 'Валерий Романов<br>Константин Иванов'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block2);

    var finance_freepemoney_slide_li_zapr_block2_button = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input7',
            html: ''
        },
        attrs: {
            type: 'button',
            value: 'Запросить'
        }
    }).insertIn(finance_freepemoney_slide_li_zapr_block2);


    //////////////////////////////////////////////////////////////////////////
    //buy
    var finance_freepemoney_slide_li_buy = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_buy',
            html: `
                        <h2>ПОКУПКА FREEPENNY</h2>
                    `
        }
    }).insertIn(finance_content);
    finance_freepemoney_slide_li_buy.el.hide();

    var finance_freepemoney_slide_li_buy_block1 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_buy_block1 block',
            html: ` <span class="span">Количекство: </span>`
        }
    }).insertIn(finance_freepemoney_slide_li_buy);

    var finance_freepemoney_slide_li_buy_block2 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_buy_block2 block',
            html: `<span class="span">Способ оплаты: </span>`
        }
    }).insertIn(finance_freepemoney_slide_li_buy);

    var finance_freepemoney_slide_li_buy_block5 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_buy_block5 block',
            html: `<span class="span1">Номер карты: </span>`
        }
    }).insertIn(finance_freepemoney_slide_li_buy);


    var finance_freepemoney_slide_li_buy_block1_input1 = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input7',
            html: ``
        },
        attrs: {
            type: 'text'
        }
    }).insertIn(finance_freepemoney_slide_li_buy);

    var finance_freepemoney_slide_li_buy_block6 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_buy_block6'
        }
    }).insertIn(finance_freepemoney_slide_li_buy);

    var finance_freepemoney_slide_li_buy_block6_select = f_dc_temp({
        eltype: 'select',
        state: {
            class: 'input8',
            html: `
                <option value="">01</option>
                <option value="">02</option>
                <option value="">03</option>
                <option value="">04</option>
                <option value="">05</option>
                <option value="">06</option>
                <option value="">07</option>
                <option value="">08</option>
                <option value="">09</option>
                <option value="">10</option>
                <option value="">11</option>
                <option value="">12</option>
            `
        }
    }).insertIn(finance_freepemoney_slide_li_buy_block6);

    var finance_freepemoney_slide_li_buy_block6_select2 = f_dc_temp({
        eltype: 'select',
        state: {
            class: 'input8',
            html: `
                <option value="">16</option>
                <option value="">17</option>
                <option value="">18</option>
                <option value="">19</option>
                <option value="">20</option>

            `
        }
    }).insertIn(finance_freepemoney_slide_li_buy_block6);

    var finance_freepemoney_slide_li_buy_block6_input = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input10'
        },
        attrs: {
            type: 'text',
            placeholder: ''
        }
    }).insertIn(finance_freepemoney_slide_li_buy_block6);



    // var finance_freepemoney_slide_li_zapr_block1_span = f_dc_temp({
    //     eltype: 'span',
    //     state: {
    //         class: 'span',
    //         text: 'Описание'
    //     }
    // }).insertIn(finance_freepemoney_slide_li_buy);

    var finance_freepemoney_slide_li_buy_block3 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_buy_block3 block',
            html: `<span class="span">К оплате: </span>`
        }
    }).insertIn(finance_freepemoney_slide_li_buy);

    // var finance_freepemoney_slide_li_buy_block4 = f_dc_temp({
    //     state: {
    //         class: 'finance_freepemoney_slide_li_buy_block4 block',
    //         html: `<span class="span">Курс: </span>
    //                              <p>1 FPN = 50 грн</p>`
    //     }
    // }).insertIn(finance_freepemoney_slide_li_buy);

    // var finance_freepemoney_slide_li_buy_block5 = f_dc_temp({
    //     state: {
    //         class: 'finance_freepemoney_slide_li_buy_block5',
    //         html: `<p>На ваш емейл выслана инструкция с дальнейшими действиями.</p>`
    //     }
    // }).insertIn(finance_freepemoney_slide_li_buy);

    var finance_freepemoney_slide_li_buy_block1_input = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input1'
        },
        attrs: {
            type: 'text',
            value: '10.000'
        }
    }).insertIn(finance_freepemoney_slide_li_buy_block1);

    var finance_freepemoney_slide_li_buyr_block1_input = f_dc_temp({
        eltype: 'select',
        state: {
            class: 'input2',
            html: '<option selected>Кредитная карта</option>'

        }
    }).insertIn(finance_freepemoney_slide_li_buy_block2);

    var finance_freepemoney_slide_li_buyr_block1t = f_dc_temp({
        eltype: 'text',
        state: {
            class: 'text',
            html: ' 502 грн.'
        },
        attrs: {
            title: 'Комиссия платежных систем 10 UAH'
        }
    }).insertIn(finance_freepemoney_slide_li_buy_block3);

    var finance_freepemoney_slide_li_buyr_block1 = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input3'
        },
        attrs: {
            type: 'button',
            value: 'Купить'
        },
        events: {
            click() {
                finance_freepemoney_slide_li_buy.el.hide();
            }
        }
    }).insertIn(finance_freepemoney_slide_li_buy_block3);

    // var finance_freepemoney_slide_li_buy_block5_input3 = f_dc_temp({
    //     eltype: 'input',
    //     state: {
    //         class: 'good'
    //     },
    //     attrs: {
    //         type: 'button',
    //         value: 'Хорошо'
    //     }
    // }).insertIn(finance_freepemoney_slide_li_buy_block5);

    /////////////////////////////////////////////////////////////////
    // otpr
    var finance_freepemoney_slide_li_otpr = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_otpr',
            html: ` <span style="float: right; cursor:pointer; color:#a5a5a5"
                        onclick="$('.finance_freepemoney_slide_li_otpr',1).hide();">Закрыть</span>
                        <h2>ОТПРАВИТЬ</h2>
                     `
        }
    }).insertIn(finance_content);
    finance_freepemoney_slide_li_otpr.el.hide();



    var finance_freepemoney_slide_li_otpr_block1 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_otpr_block1',
            html: ` <span class="span">С: </span>`
        }
    }).insertIn(finance_freepemoney_slide_li_otpr);

    var finance_freepemoney_slide_li_otpr_block2 = f_dc_temp({
        state: {
            class: 'finance_freepemoney_slide_li_otpr_block2',
            html: ` <span class="span">Сумма: </span>`
        }
    }).insertIn(finance_freepemoney_slide_li_otpr);

    var finance_freepemoney_slide_li_otpr_block1_input_from = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input1',
        },
        attrs: {
            type: 'text'
        }
    }).insertIn(finance_freepemoney_slide_li_otpr_block1);

    var finance_freepemoney_slide_li_otpr_block1_from = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span',
            text: 'Кому: '
        }
    }).insertIn(finance_freepemoney_slide_li_otpr_block1);
    var finance_freepemoney_slide_li_otpr_block1_input1 = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input1',
        },
        attrs: {
            type: 'text',
            placeholder: 'Логин получателя'
        }
    }).insertIn(finance_freepemoney_slide_li_otpr_block1);


    var finance_freepemoney_slide_li_otpr_block1_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'span',
            text: 'Cообщение'
        }
    }).insertIn(finance_freepemoney_slide_li_otpr_block1);
    finance_freepemoney_slide_li_otpr_block1_span.el.hide();
    var finance_freepemoney_slide_li_zapr_block1_span = f_dc_temp({
        eltype: 'textarea',
        state: {
            class: 'textarea'
        },
        attrs: {
            placeholder: 'Сообщение для получателя'
        }
    }).insertIn(finance_freepemoney_slide_li_otpr_block1);
    finance_freepemoney_slide_li_zapr_block1_span.el.hide();
    var finance_freepemoney_slide_li_zapr_block2_input = f_dc_temp({
        eltype: 'input',
        state: {

        },
        attrs: {
            type: 'text',
            placeholder: '0.000'
        }
    }).insertIn(finance_freepemoney_slide_li_otpr_block2);

    var finance_freepemoney_slide_li_zapr_block2_select = f_dc_temp({
        eltype: 'select',
        state: {
            class: 'select',
            html: `
                        <option value="USD" selected>FPN</option>
                        <option value="RUB">BTC</option>
                    `
        },
        attrs: {
        }
    }).insertIn(finance_freepemoney_slide_li_otpr_block2);

    (function () {
        var info = DC.temp({
            eltype: 'span',
            state: {
                class: 'span',
            },
            attrs: {
                style: 'color: red; margin-top:70%'
            }
        }).insertIn(finance_freepemoney_slide_li_otpr_block2);
        info.el.hide();
        var finance_freepemoney_slide_li_zapr_block2_input7 = f_dc_temp({
            eltype: 'input',
            state: {
                class: 'input7',
                html: ''
            },
            attrs: {
                type: 'button',
                value: 'Отправить'
            },
            events: {
                click() {
                    if (!Wallet.mn_addr) return;
                    finance_freepemoney_slide_li_zapr_block2_input7.el.hide();
                    info.change({ text: 'sending...' });
                    info.el.show();
                    var from = Wallet.mn_addr;
                    var to = finance_freepemoney_slide_li_otpr_block1_input1.el.val();
                    var am = fpn2n(finance_freepemoney_slide_li_zapr_block2_input.el.val());
                    if (!am) {
                        info.change({
                            text: 'invalid amount'
                        });
                        return;
                    }
                    mctx.f_semit('colu', { act: 'send_coins', from: from, to: to, amount: am }, data => {
                        finance_freepemoney_slide_li_zapr_block2_input7.el.show();
                        data = eval("(" + data + ")");
                        if (data.txHex) {
                            block_api.updateBalances();
                            info.el.hide();
                        } else {
                            console.log(data);
                            info.change({
                                text: 'error. see console'
                            });
                            info.el.show();
                        };
                    });

                }
            }
        }).insertIn(finance_freepemoney_slide_li_otpr_block2);
    } ());

    /////////////////////////////////////////////////////////////////////////////
    // finance exchange

    var finance_exchange = f_dc_temp({
        state: {
            class: 'finance-exchange',
            html: `<h2>ЦЕНТР ОБМЕНА</h2>`
        }
    }).insertIn(finance_content);

    var finance_exchange_block1 = f_dc_temp({
        state: {
            class: 'finance-exchange-block1',
            html: `<div class="finance-exchange-block1-span" style="color: #b5b5b5">
                                 1 FPN <span style="color:#fa7741"> = </span> 0.00625 BTC
                             </div>`
        }
    }).insertIn(finance_exchange);

    var finance_exchange_block2 = f_dc_temp({
        state: {
            class: 'finance-exchange-block2',
            html: `
                    <div class="finance-exchange-block2-span" style="color: #b5b5b5"">
                                Инструкция
                             </div>

                            
                `
        }
    }).insertIn(finance_exchange);

    var instr_p = f_dc_temp({
        eltype: 'p',
        state: {
            class: '',
            text: 'Введите количество BTC, которые вы хотите обменять на фрипенни или укажите колчество FPN, которое желаете купить и нажмите кнопку "Обменять".'
        },
        attrs: {
            style: `
                max-width: 100%;
                padding: 10px 30px;
            `
        }
    }).insertIn(finance_exchange_block2);

    var finance_exchange_block1_form = f_dc_temp({
        eltype: 'form',
        state: {
            class: 'finance-exchange-block1-form',
            html: `
                        
                    `
        }
    }).insertIn(finance_exchange_block1);

    var finance_exchange_block1_form_place = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input'
        },
        attrs: {
            type: 'text',
            placeholder: '0.000',
            id: 'inputBTC'
        },
        events: {
            input(){
                $('#inputFPN').val(this.value /0.00625);
            }
        }
    }).insertIn(finance_exchange_block1_form);

    var finance_exchange_block1_form_select = f_dc_temp({
        eltype: 'select',
        state: {
            html: `<option value="FPN" selected>BTC</option>`
        }
    }).insertIn(finance_exchange_block1_form);
    f_dc_temp({
        eltype: 'br'
    }).insertIn(finance_exchange_block1_form);

    var finance_exchange_block1_form_span = f_dc_temp({
        eltype: 'span',
        state: {
            class: '',
            text: 'на'
        }
    }).insertIn(finance_exchange_block1_form);

    f_dc_temp({
        eltype: 'br'
    }).insertIn(finance_exchange_block1_form);

    var finance_exchange_block1_form_input3 = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'input fpn_input'
        }, attrs: {
            placeholder: '0.000',
            type: 'text',
            id: 'inputFPN'
        },
        events: {
            input() {
                if (!publicConfig.fpn_btc_value) return update('failed');;
                var n = this.value;
                if (!n.length) return instr_p.change({
                    text: `Введите количество BTC, 
                                                которые вы хотите обменять на фрипенни или укажите колчество FPN, 
                                                которое желаете купить и нажмите кнопку "Обменять".`
                });
                n *= publicConfig.fpn_btc_value;
                if (!n)
                    return instr_p.change({
                        text: 'Некоректное значение'
                    });
                n = sat2btc(btc2sat(n) + 10000);
                console.log(finance_exchange_block1_form_place.value);
                // finance_exchange_block1_form_place.change({
                //     attrs: {
                //         value: this.value * 0.000625

                //     }
                // })
                $('#inputBTC').val(this.value * 0.000625);
                finance_exchange_block1_form_place.value = this.value * 0.000625;
                //update(n + ' BTC needed');
                /* instr_p.change({
                            text: 'invalid'
                       })*/
            }
        }
    }).insertIn(finance_exchange_block1_form);
    var finance_exchange_block1_form_select2 = f_dc_temp({
        eltype: 'label',
        state: {
            text: 'FPN'
        }
    }).insertIn(finance_exchange_block1_form);


    var finance_exchange_block1_form_submit = f_dc_temp({
        eltype: 'input',
        state: {
            class: ''
        }, attrs: {
            type: 'button',
            value: 'Обменять',
            style: 'cursor:pointer;'
        }, events: {
            click() {

                instr_p.change({
                    text: `Send ` + $('#inputBTC').val() + ` BTC to address n1RSSoFttaMNCijgy8KbCBUBF11S5XpvzT and your wallet mrhvdynJVLEz2Jx6UXE21aHjWS2EW2qMpi will be replenished with ` + $('#inputFPN').val() + ` FPN`
                })

                if (!publicConfig.fpn_btc_value) return console.log('failed');
                if (pending_xtx && pending_xtx.length > 5) return update(/*'Sorry, you have too much unpayed transactions yet'*/);
                var n = finance_exchange_block1_form_input3.el.val() * 1;
                if (!n) return console.log('invalid');
                console.log('loading...');
                mctx.f_semit('colu', {
                    act: 'xtx_buy_fpn',
                    fpn_amount: n
                }, data => {
                    if (data.a) {
                        timer.start();
                        finance_exchange_block1_form_input3.el.val('');
                        //buy_repeat.el.show();
                        ///slide_buy.el.hide();
                        //body.change({ html: 'Send <b>' + data.btc + ' BTC</b> to address <b>' + data.c + '</b> and your wallet <b>' + data.a + '</b> will be replenished with <b>' + data.fpn + ' FPN</b>' })
                        //buy_repeat.el.show();
                        instr_p.change({
                            html: `Send 0.120281 BTC to address ${Wallet.mn_addr} and your wallet ${Wallet.btc_addr} will be replenished with $(finance_exchange_block1_form_input3.el.val()) FPN`
                        })
                    } else {
                        //update(JSON.stringify(data));
                    }
                });

                // if (finance_exchange_block1_form_select.el.selectedIndex == 0 &&
                //     finance_exchange_block1_form_select2.el.selectedIndex == 3) {
                //     console.log('FPN and USD');
                //     if (finance_freepemoney_slide_li_vivod.el.display !== 'none')
                //         finance_freepemoney_slide_li_vivod.el.show();
                //     else
                //         finance_freepemoney_slide_li_vivod.el.hide();
                // }
                // else if (finance_exchange_block1_form_select.el.selectedIndex == 3 &&
                //     finance_exchange_block1_form_select2.el.selectedIndex == 0) {
                //     console.log('FPN and USD');
                //     if (finance_freepemoney_slide_li_buy.el.display !== 'none')
                //         finance_freepemoney_slide_li_buy.el.show();
                //     else
                //         finance_freepemoney_slide_li_buy.el.hide();
                // }
            }

        }
    }).insertIn(finance_exchange_block1_form);
    f_dc_temp({
        eltype: 'br'
    }).insertIn(finance_exchange_block1_form);




    ////////////////////////////////////////////////////////////////////////////////
    // block finance transaction

    var tableBTC = f_dc_temp(function () {
        var table = f_dc_temp();
        var lasthtml;
        var update = (s) => {
            if (s == lasthtml) return;
            table.change({
                html: s
            });
            lasthtml = s;
        }

        var last_req = {};

        return {
            state: {
                class: 'finance-transaction'
            },
            extend: {
                update() {
                    var l = pending_xtx;
                    if (l && l.length) {
                        //title.el.show();
                        tableBTC.el.show();
                        var html = '', i = 0;
                        if (l.length) {
                            html = '<table><tr><th style="width:10%">ДАТА</th><th style="width:10%">ТИП</th><th style="width:20%">ОТПРАВИТЕЛЬ</th><th style="width: 20%;">ПОЛУЧАТЕЛЬ</th><th style="width:20%">СУММА</th><th style="width:10%">СТАТУС</th></tr>';
                            l.forEach(o => {
                                i++;
                                var btc;
                                var sat = pending_xtx_data[o.c];
                                if (sat) btc = sat;
                                o.btc = parseFloat(o.btc);
                                o.fpn = parseFloat(o.fpn);
                                if (o.status == 2) {
                                    html += '<tr><td>' + new Date().getDate() + '.' + (new Date().getMonth() + 1) + '.' + new Date().getFullYear(0) + '</td><td></td><td>' + Wallet.mn_addr + '</td><td>' + Wallet.btc_addr + '</td><td>' + n2fpn(o.fpn) + ' FPN</td><td>оплачено...</td></tr>';
                                } else
                                    if (btc && btc >= o.btc) {
                                        if (!last_req[o.c] || Date.now() - last_req[o.c] > 15000) {
                                            mctx.f_semit('colu', {
                                                act: 'xtx_check_for',
                                                c: o.c
                                            }, d => {
                                                if (d.c) {
                                                    timer.start();
                                                } else {
                                                    console.log(d);
                                                }
                                            });
                                            last_req[o.c] = Date.now();
                                        }
                                        html += '<tr><td>veifying...</td><td>' + o.c + '</td><td>' + n2fpn(o.fpn) + '</td><td></td><td></td><td></td></tr>';
                                    } else {
                                        if (btc) {
                                            btc = sat2btc(btc2sat(o.btc) - sat);
                                        } else {
                                            btc = o.btc;
                                        }
                                        console.log('btc', btc, ' fpn', o.fpn);
                                        html += '<tr><td>' + new Date().getDate() + '.' + (new Date().getMonth() + 1) + '.' + new Date().getFullYear(0) + '</td><td></td><td>' + Wallet.mn_addr + '</td><td>' + Wallet.btc_addr + '</td><td>' + n2fpn(o.fpn) + ' FPN</td><td></td></tr>';
                                    }
                            });
                            html += '</table>';
                        }
                        update(html);
                    } else {
                        tableBTC.el.hide();
                    }
                }
            },
            init() {
                this.DClist([table]);
            }
        }
    }).insertIn(finance_content);

    var finance_ul = f_dc_temp({
        state: {
            class: 'finance-transaction-alter',
            html: `
                        <input type="button" value="FPN" id="fpn"'><input type="button" value="BTN">


                        <ul>
                            <li><span><img src="images/calendar.png"></span> <p>01/07/2016</p></li>
                            <li><span><img src="images/plat.png" id="img_2"></span> <p>Входящий платеж</p></li>
                            <li><span><img src="images/code.png" id="img_3"></span> <p class="alter_p">akHUf81SJN4NUcNvy68MfiN9vdVKp9x23gA</p></li>
                            <li><span><img src="images/you.png" id="img_4"></span> <p class="alter_p">17WmsqcxtaUnk8mc3WFV4WFMHt9eExfjCV</p></li>
                            <li><span><img src="images/file.png"></span> <p></p></li>
                            <li><span><img src="images/money.png"></span> <p>400 FPN</p></li>
                        </ul>

                        <input type="button" value="СЛЕДУЮЩАЯ ЗАПИСЬ" id="next">
        `
        }
    }).insertIn(finance_content);

    (function () {
        var dc = f_dc_temp();
        var title = f_dc_temp({
            state: {
                text: 'Get your backup data for wallet'
            }
        });
        var button = f_dc_temp({
            eltype: 'button',
            state: {
                text: 'get encrypted backup',
                class: 'b'
            },
            events: {
                click() {
                    update('loading...');
                    clear();
                    mctx.f_semit('colu', { act: 'get_encrypted_backup' }, data => {
                        try {
                            data = JSON.stringify(data);
                            update('Save this info carefully:\n\r\n\r *only with your password you will access your wallet');
                            update2(data);
                            show();
                        } catch (e) {
                            update(data);
                        }
                    });
                }
            }
        });
        var button2 = f_dc_temp({
            eltype: 'button',
            state: {
                text: 'get raw backup',
                class: 'b'
            },
            events: {
                click() {
                    update('loading...');
                    mctx.f_semit('colu', { act: 'get_raw_backup' }, data => {
                        try {
                            data = JSON.stringify(data);
                            update('Save this info very carefully:\n\r\n\r *your wallet can be accessed with this data even without password');
                            update2(data);
                            show();
                        } catch (e) {
                            update(data);
                        }
                    });
                }
            }
        });
        var result = f_dc_temp({
            eltype: 'pre'
        });
        var area = f_dc_temp({
            eltype: 'textarea',
            attrs: {
                style: 'width: 500px;height: 300px;resize: none;'
            }
        });
        function update(v) {
            result.change({ text: v });
        }
        function update2(v) {
            area.change({ val: v });
        }
        function clear() {
            area.el.hide();
        }
        function show() {
            area.el.show();
        }
        f_dc_list(dc, [title, button, button2, result, area]);
        dc.insertIn(finance_content);
    } ());



    var load_wallets = (cbfail, cbok) => {
        mctx.f_semit('colu', { act: 'show_all_wallets' }, data => {
            update('');
            if (typeof data == 'object') {
                if (cbok) cbok(data);

                br_cash = data => {
                    var str = '';
                    for (var i = 0; i < data.length; i++) {
                        str += data[i];
                        if (str.length == data.length / 2)
                            str += '<br>'
                    }
                    return str;
                }

                blockAdress.change({
                    html: data[0]
                });
                blockAdressfreepemoney.change({
                    html: data[1]
                });
                finance_freepemoney_slide_li_otpr_block1_input_from.el.value = data[0];
                // data.forEach(v => {
                // 	DC.temp({
                // 		state: {
                // 			class: 'module-wallets-address',
                // 			text: v
                // 		}
                // 	})
                // 	.insertIn(body);
                // });
                return data;
            } else {
                update(JSON.stringify(data));
            }
        });
    }
    block_api.load_wallets = (cbfail, cbok) => {
        load_wallets(cbfail, cbok);
    }


    block_api.updateBalanceFPN = (cbfail, cbok) => {
        mctx.f_semit('colu', { act: 'get_my_balance' }, data => {
            if (typeof data == 'object') {
                //update('');
                var asset = data.assetData;
                var total = {};
                var total_am = 0;
                asset.forEach(v => {
                    total_am += v.amount;
                    if (!total[v.address]) {
                        total[v.address] = v.amount;
                    } else {
                        total[v.address] += v.amount;
                    }
                });
                if (!total_am) {
                    textCash.change({
                        text: '0.0000'
                    });
                } else {
                    for (var v in total) {
                        textCash.change({
                            text: n2fpn(total[v])
                        });
                    }

                }
                cbok();
            } else {
                cbfail();
                console.log(data);
            }
        });
    }

    block_api.updateBalanceBTC = (cbfail, cbok) => {
        if (!Wallet.btc_addr) return console.log('no btc address');
        explorer({
            url: 'addr/' + Wallet.btc_addr + '/balance'
        }, fail => {
            // 
        }, ok => {
            var n = sat2btc(ok);
            cbok();
            textBTC.change({
                text: n
            });
        });
    }




    return {
        dc: dc_module,
        //api_module
    }
})