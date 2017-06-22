DC.module('router/DashBoard', function (mctx) {
    //////////
    function f_dc_make(obj) {
        return DC.make(obj);
    }
    function f_dc_temp(obj) {
        return DC.temp(obj);
    }
    var dc_module = DC.temp(function () {
        return {
            state: {
                class: 'module-room'
            },
            init() {
                return this;
            }
        }
    });
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
                //tableBTC.update();
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
                    //if (ready == l) tableBTC.update();
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
            //tableBTC.update();
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
    var block_api = {};
    var Wallet = {
        mn_addr: '',
        btc_addr: '',
        addresses: []
    }

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
    }

    mctx.f_semit('init_wallet', { pas: 'password' }, data => {
        if (typeof data == 'object') {
            if (data.reason) return;

            else if (data.ok === true) {

                block_api.load_wallets(fail => {
                    console.log('fail loading wallets');
                }, ok => {
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
                            }
                        })
                        /*block_api.updateBalanceBTC(fail => {
                            // 
                        }, ok => {
                            ready++;
                            if (ready == total) {
                            }
                        })*/

                    }
                });

            }
            else {
                return update(JSON.stringify(data));
            }
        } else {
            data = JSON.stringify(data);
        }
    });


    /////////////////////////////////////////////////////

    var content = f_dc_temp({
        state: {
            class: 'content'
        }
    }).insertIn(dc_module);
    ///////////////////////////////////////////////////////////////////////////////
    // block character
    var character = f_dc_temp({
        state: {
            class: 'character'
        }
    }).insertIn(content);

    var account = f_dc_temp({
        state: {
            class: 'characterDiv',
            html: `<span>Ваши Счета</span>`
        }
    }).insertIn(character);

    var divSh = f_dc_temp({
        state: {
            class: 'sh',
            html: ''
        }
    }).insertIn(account);

    var fpn = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'fpn',
            html: 'FPN'
        }, events: {
            click() {
                fpn.addClass('active_VAL');
                fpm.removeClass('active_VAL');
                console.log(1);
                mctx.f_semit('colu', { act: 'get_my_balance' }, data => {
                    if (typeof data == 'object') {
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
                            balance.change({
                                text: 'Баланс: <i>0.0000 </i>'
                            });
                        } else {
                            for (var v in total) {
                                balance.change({
                                    html: 'Баланс: <i>' + n2fpn(total[v]) + '</i>'
                                });
                            }
                        }
                    }
                    else {
                        console.log(data);
                    }
                });

            }
        }
    }).insertIn(divSh)
    fpn.addClass('active_VAL');

    var fpm = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'fpm',
            html: 'BTC'
        },
        events: {
            click() {
                fpm.addClass('active_VAL');
                fpn.removeClass('active_VAL');

                if (!Wallet.btc_addr) return console.log('no btc address');
                explorer({
                    url: 'addr/' + Wallet.btc_addr + '/balance'
                }, fail => {
                    // 
                }, ok => {
                    var n = sat2btc(ok);
                    //cbok();
                    balance.change({
                        html: 'Баланс: <i>' + n + '</i>'
                    });
                });

            }
        }
    }).insertIn(divSh)

    var arrow = f_dc_temp({
        state: {
            class: 'arrowBig',
            html: '<img src="images/arrowBig.png" style="vertical-align: top;">'
        }, events: {
            click() {
                if (slideRef.el.style.display == 'block' || slideSkils.el.style.display == 'block') {
                    slideSkils.el.hide();
                    slideRef.el.hide();
                }
                if (slideAccount.el.style.display !== 'none')
                    slideAccount.el.hide();
                else
                    slideAccount.el.show();
            }
        },
        attrs: {
            style: 'cursor:pointer'
        }
    }).insertIn(account);

    var slideAccount = f_dc_temp({
        eltype: 'ul',
        state: {
            html: `
                <li>Кошелек: <i>Личный</i> <img src="images/copy.png" 
                                            style="margin-left: 10px;vertical-align: sub;">
                </li>
        `,
            class: 'slideAccount'
        }
    }).insertIn(account);
    slideAccount.el.hide();

    var balance = f_dc_temp({
        eltype: 'li',
        state: {
            html: 'Баланс: <i></i>'
        }
    }).insertIn(slideAccount);

    var refer = f_dc_temp({
        state: {
            class: 'characterDiv ref',
            html: `<span>Ваши Рефералы</span>
                
                `
        }
    }).insertIn(character);

    var refCount = f_dc_temp({
        eltype: 'span',
        state: {
            class: 'refCount',

        }
    }).insertIn(refer);

    var refLabel = f_dc_temp({
        eltype: 'label',
        state: {
            text: 150
        }
    }).insertIn(refCount);

    var chel = f_dc_temp({
        eltype: 'text',
        state: {
            text: ' чел.'
        }
    }).insertIn(refLabel)


    var arrowRef = f_dc_temp({
        state: {
            class: 'arrowBigRef',
            html: '<img src="images/arrowBig.png" style="vertical-align: top;">'
        },
        events: {
            click() {
                if (slideAccount.el.style.display == 'block' || slideSkils.el.style.display == 'block') {
                    slideSkils.el.hide();
                    slideAccount.el.hide();
                }
                if (slideRef.el.style.display !== 'none')
                    slideRef.el.hide();
                else
                    slideRef.el.show();
            }
        },
        attrs: {
            style: 'cursor: pointer'
        }
    }).insertIn(refer);
    arrowRef.el.hide();

    var slideRef = f_dc_temp({
        eltype: 'ul',
        state: {
            class: 'slideRef',
            html: `
            <li>1 Виктор <em>   15.02.2016   </em>   <span>600 </span>FPN</li>
                            <li>2 Виктор <em>15.02.2016</em>   <span>600 </span>FPN</li>
        `
        }
    }).insertIn(refer);
    slideRef.el.hide();

    var scills = f_dc_temp({
        state: {
            class: 'characterDiv skils',
            html: `<span>Ваш Уровень</span>`
        },
        events: {
        }
    }).insertIn(character);

    var skillsNumber = f_dc_temp({
        eltype: 'span',
        state: {
            text: '0.5',
            class: 'skillsNumber'
        }
    }).insertIn(scills);
    var arrowScills = f_dc_temp({
        state: {
            class: 'arrowBigScills',
            html: '<img src="images/arrowBig.png" style="vertical-align: top;">'
        },
        events: {
            click() {
                if (slideAccount.el.style.display == 'block' || slideRef.el.style.display == 'block') {
                    slideRef.el.hide();
                    slideAccount.el.hide();
                }
                if (slideSkils.el.style.display !== 'none')
                    slideSkils.el.hide();
                else
                    slideSkils.el.show();
            }
        },
        attrs: {
            style: 'cursor: pointer'
        }
    }).insertIn(scills);
    arrowScills.el.hide();

    var slideSkils = f_dc_temp({
        eltype: 'ul',
        state: {
            html: `<li>2 реферала = 40 FPT</li>
							<li>10 FPN = 10 FPT</li>	
							<li>50 FPT до уровня 1</li>`,
            class: 'slideSkils'
        }
    }).insertIn(scills);
    slideSkils.el.hide();

    var rating = f_dc_temp({
        state: {
            class: 'characterDiv raiting',
            html: `<span>Ваш Рейтинг</span>`
        }
    }).insertIn(character);

    var ratingCount = f_dc_temp({
        eltype: 'span',
        state: {
            text: '1',
            class: 'raitingsNumber'
        }
    }).insertIn(rating);

    ///////////////////////////////////////////////////////////////////////////////////
    // block skillsNumber

    var pageSkills = f_dc_temp({
        state: {
            class: 'skillsDiv'
        }
    }).insertIn(content);

    var level1_block = f_dc_temp({
        state: {
            class: 'level_block'
        }
    }).insertIn(pageSkills);
    var level2_block = f_dc_temp({
        state: {
            class: 'level_block'
        }
    }).insertIn(pageSkills);
    var level3_block = f_dc_temp({
        state: {
            class: 'level_block'
        }
    }).insertIn(pageSkills);
    var level4_block = f_dc_temp({
        state: {
            class: 'level_block'
        }
    }).insertIn(pageSkills);

    var level1 = f_dc_temp({

        state: {
            html: '<h1>УРОВЕНЬ 1</h1>',
            class: 'level1'
        },
        attrs: {
            src: 'images/skills1.png'
        },
        events: {
            click() {
                if (mctx.User.getLevel() === 2 || mctx.User.getLevel() == 6 || mctx.User.getLevel() == 8) {
                    if (levelUL1.el.style.display !== 'none')
                        levelUL1.el.hide();
                    else
                        levelUL1.el.show();
                }
            }
        }
    }).insertIn(level1_block);

    var level2 = f_dc_temp({
        state: {
            html: '<h1>УРОВЕНЬ 2</h1>',
            class: 'level2'
        },
        attrs: {
            src: 'images/skills2.png'
        },
        events: {
            click() {

                if (mctx.User.getLevel() == 1||mctx.User.getLevel() == 3 || mctx.User.getLevel() == 7 || mctx.User.getLevel() == 9) {
                    if (levelUL2.el.style.display !== 'none')
                        levelUL2.el.hide();
                    else
                        levelUL2.el.show();
                }
            }
        }
    }).insertIn(level2_block);

    var level3 = f_dc_temp({
        state: {
            html: '<h1>УРОВЕНЬ 3</h1>',
            class: 'level3'
        },
        attrs: {
            src: 'images/skills3.png'
        },
        events: {
            click() {

                if (mctx.User.getLevel() === 4 || mctx.User.getLevel() === 8 || mctx.User.getLevel() === 10) {
                    if (levelUL3.el.style.display !== 'none')
                        levelUL3.el.hide();
                    else
                        levelUL3.el.show();
                }
            }
        }
    }).insertIn(level3_block);

    var level4 = f_dc_temp({
        state: {
            html: '<h1>УРОВЕНЬ 4</h1>',
            class: 'level4'
        },
        attrs: {
            src: 'images/skills4.png'
        },
        events: {
            click() {
                if (mctx.User.getLevel() === 5 || mctx.User.getLevel() === 7) {
                    if (levelUL4.el.style.display !== 'none')
                        levelUL4.el.hide();
                    else
                        levelUL4.el.show();
                }
            }
        }
    }).insertIn(level4_block);
    var levelUL4 = f_dc_temp({
        eltype: 'ul',
        state: {
            html: '<li>'
            + '<span>Задача</span><br>'
            + 'Пригласите 15 друзей или купите 150 FPN'
            + '</li>'
            + '<li>'
            + '<span>Награда</span><br>'
            + ' Реферальный бонус: 8%'
            + '</li>',
            class: 'slideSkills levelUL4'
        }
    }).insertIn(level4_block);
    levelUL4.el.hide();

    var levelUL3 = f_dc_temp({
        eltype: 'ul',
        state: {
            html: '<li>'
            + '<span>Задача</span><br>'
            + 'пригласите 10 друзей или купите 100 FPN'
            + '</li>'
            + '<li>'
            + '<span>Награда</span><br>'
            + 'Реферальный бонус: 6%'
            + '</li>',
            class: 'slideSkills'
        }
    }).insertIn(level3_block);
    levelUL3.el.hide();


    var levelUL1 = f_dc_temp({
        eltype: 'ul',
        state: {
            html: '<li>'
            + '<span>Задача</span><br>'
            + 'Зарегистрироваться'
            + '</li>'
            + '<li>'
            + '<span>Награда</span><br>'
            + ' Реферальный бонус: 2%'
            + '</li>',
            class: 'slideSkills levelUL1'
        }
    }).insertIn(level1_block);
    levelUL1.el.hide();


    var levelUL2 = f_dc_temp({
        eltype: 'ul',
        state: {
            html: '<li>'
            + '<span>Задача</span><br>'
            + 'Пригласите 5 друзей или купите: 50 FPN'
            + '</li>'
            + '<li>'
            + '<span>Награда</span><br>'
            + ' Реферальный бонус: 4%'
            + '</li>',
            class: 'slideSkills levelUL2'
        }
    }).insertIn(level2_block);
    levelUL2.el.hide();

    /////////////////////////////////////////////////
    //block main

    var main = f_dc_temp({
        state: {
            class: 'main'
        }
    }).insertIn(content);

    var categories = f_dc_temp({
        state: {
            html: `<ul>
                    <li class="personal li"><a href="#" onmouseover="">ЛИЧНЫЕ</a></li>
                    <li class="work li"><a href="">СЛУЖЕБНЫЕ</a></li>
                    <li class="group li"><a href="">ГРУППОВЫЕ</a></li>
                    <li class="other"><a href=""></a></li>
                    <div class="arrow sol"></div>
                    <li class="icon3 icon li" style="display:none;"><img src="images/one.png"></li>
                    <li class="icon2 icon li"><img src="images/three.png"></li>
                    <li class="icon1 icon li"><img src="images/two.png"></li>
            </ul>`,
            class: 'categories'
        }
    }).insertIn(main);



    //////////////////////////////////////////////////////////////////////////////
    // block people left nav bar

    var blockPeople = f_dc_temp({
        state: {
            class: 'blockPeople',
            html: `
                <li class="li one">
                    <span>Дмитрий Васильев</span><em></em><br>
							Lore ipsum wbubw
                </li>
                 <li class="li">
                    <span>Дмитрий Васильев</span><em></em><br>
							Lore ipsum wbubw
                </li>
                 <li class="li">
                    <span>Дмитрий Васильев</span><em></em><br>
							Lore ipsum wbubw
                </li>
                 <li class="li">
                    <span>Дмитрий Васильев</span><em></em><br>
							Lore ipsum wbubw
                </li>
                <li class="li">
                    <span>Дмитрий Васильев</span><em></em><br>
							Lore ipsum wbubw
                </li>

            `
        }
    }).insertIn(main);


    //////////////////////////////////////////////////////////////////////////////////
    // block messages

    var messages = f_dc_temp({
        state: {
            class: 'message',
            html: ''
        }
    }).insertIn(main);

    var blockM = f_dc_temp({
        state: {
            class: 'block-message',
            html: `
                <img src="images/messageLeftImage.png" class="messageLeftImage">
                <div class="messageLeft"><p>Lorem iefwwefwepsum dolor sit</p></div><br>
                <div class="messageRighttoo"><p>Lorem ipsum dolor sit </p></div>
                <img src="images/messageRightImage.png" class="messageRightImagetoo"><br>
                <img class="messageLeftImagetoo" src="images/messageLeftImage.png">
                <div class="messageLefttoo"><p>Lorem ipsum dolor sit </p></div><br>
                <div class="messageRight"><p>Lorem ipsum dolor sit </p></div>
                <img src="images/messageRightImage.png" class="messageRightImage">
            `
        }
    }).insertIn(messages);

    var inputField = f_dc_temp({
        state: {
            class: 'inputField'
        }
    }).insertIn(messages);

    var plus = f_dc_temp({
        eltype: 'em',
        state: {
            class: 'plus',
            html: '+'
        }
    }).insertIn(inputField);

    var plus = f_dc_temp({
        eltype: 'img',
        state: {
            class: 'smile',
            html: '+'
        },
        attrs: {
            src: 'images/smile.png'
        }
    }).insertIn(inputField);

    var inputText = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'text',
            html: ''
        },
        attrs: {
            src: 'images/smile.png',
            type: 'text'
        }
    }).insertIn(inputField);


    var inputSubmit = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'submit',
            text: 'ОТПРАВИТЬ'
        },
        attrs: {
            src: 'images/smile.png',
            type: 'submit'
        },
        events: {
            click() {
                if (inputText.el.val() !== '') {
                    console.log(inputText.el.val());
                    inputText.el.val('');
                }

            }
        }
    }).insertIn(inputField);

    ///////////////////////////////////////////////////////////////////////////////
    //block refer and news

    var blockFn = f_dc_temp({
        state: {
            class: 'blockrefN'
        }
    }).insertIn(main);

    var referen = f_dc_temp({
        state: {
            class: 'referen',
            html: `<h3>РАССКАЖИТЕ ДРУЗЬЯМ: </h3>`
        }
    }).insertIn(blockFn);

    var referenInput = f_dc_temp({
        eltype: 'input',
        state: {
            class: 'refText'
        },
        attrs: {
            type: 'text',
            value: 'loading...',
            id: 'refer'
        }
    }).insertIn(referen);

    // var copy = f_dc_temp({
    //     eltype: 'img',
    //     state: {
    //         class: 'copy1'
    //     },
    //     attrs: {
    //         src: 'images/copy.png'
    //     }
    // }).insertIn(referen);

    var social = f_dc_temp({
        state: {
            html: `<p data-clipboard-target="#refer" class="btn-clipboard"><img src="images/copy.png" class="social_copy" > <a>Копировать</a></p>`,
            class: 'social'
        }
    }).insertIn(referen);
    /* social button */
    /*var social_copy = f_dc_temp({
        eltype: 'p',
        state: {
            html: '<img src="images/copy.png" class="social_copy" > <a>Копировать</a>'
        },
        events: {
            click(){

            }
        },
        attrs: {
            class: 'btn-clipboard',
            dataClipboardTarget: '#refer'
        }
    }).insertIn(social);*/
    new Clipboard('.btn-clipboard');

    var facebook = f_dc_temp({
        eltype: 'a',
        state: {
            html: '<img src="images/facebook.png">'
        },
        events: {
            click() {
                event.preventDefault();
                return share.me(this);
            }
        },
        attrs: {
            href: 'https://www.facebook.com/sharer/sharer.php?u=http://freepe.io/ref/ ' + mctx.User.ref_link + '&t=TITLE',
            target: '_blank'
        }
    }).insertIn(social);
    var twitter = f_dc_temp({
        eltype: 'a',
        state: {
            html: '<img src="images/twitter.png">'
        },
        events: {
            click() {
                event.preventDefault();
                return share.me(this);
            }
        },
        attrs: {
            href: 'https://twitter.com/intent/tweet?original_referer=http://freepe.io/ref/' + mctx.User.ref_link + '&text=' + 'Реферальная ссылка http://freepe.io/ref/' + mctx.User.ref_link + '&url=URL',
            target: '_blank'
        }
    }).insertIn(social);
    var vk = f_dc_temp({
        eltype: 'a',
        state: {
            html: '<img src="images/vk.png">'
        },
        events: {
            click(event) {
                console.log(event);
                event.preventDefault();
                return share.me(this);
            }
        },
        attrs: {
            href: 'http://vk.com/share.php?url=URL&title=' + 'Реферальная ссылка http://freepe.io/ref/' + mctx.User.ref_link + '&image=IMG_PATH&noparse=true',
            target: '_blank'
        }
    }).insertIn(social);
    var gmail = f_dc_temp({
        eltype: 'a',
        state: {
            html: '<img src="images/google-plus.png">'
        },
        events: {
            click() {
                event.preventDefault();
                return share.me(this);
            }
        },
        attrs: {
            href: 'http://connect.mail.ru/share?url=URL&title=' + 'Реферальная ссылка http://freepe.io/ref/' + mctx.User.ref_link + '&imageurl=IMG_PATH',
            target: '_blank'
        }
    })//.insertIn(social);

    var share = {
        vkontakte: function (purl, ptitle, pimg, text) {
            url = 'http://vkontakte.ru/share.php?';
            url += 'url=' + encodeURIComponent(purl);
            url += '&title=' + encodeURIComponent(ptitle);
            url += '&description=' + encodeURIComponent(text);
            url += '&image=' + encodeURIComponent(pimg);
            url += '&noparse=true';
            console.log('vkontacte');
            share.popup(url);
        },
        facebook: function (purl, ptitle, pimg, text) {
            url = 'http://www.facebook.com/sharer.php?s=100';
            url += '&p[title]=' + encodeURIComponent(ptitle);
            url += '&p[summary]=' + encodeURIComponent(text);
            url += '&p[url]=' + encodeURIComponent(purl);
            url += '&p[images][0]=' + encodeURIComponent(pimg);
            share.popup(url);
        },
        twitter: function (purl, ptitle) {
            url = 'http://twitter.com/share?';
            url += 'text=' + encodeURIComponent(ptitle);
            url += '&url=' + encodeURIComponent(purl);
            url += '&counturl=' + encodeURIComponent(purl);
            share.popup(url);
        },
        mailru: function (purl, ptitle, pimg, text) {
            url = 'http://connect.mail.ru/share?';
            url += 'url=' + encodeURIComponent(purl);
            url += '&title=' + encodeURIComponent(ptitle);
            url += '&description=' + encodeURIComponent(text);
            url += '&imageurl=' + encodeURIComponent(pimg);
            share.popup(url)
        },

        me: function (el) {
            console.log(el.href);
            share.popup(el.href);
            return false;
        },

        popup: function (url) {
            window.open(url, '', 'toolbar=0,status=0,width=626,height=436');
        }

    };
    /* social button end */

    var news = f_dc_temp({
        state: {
            class: 'news',
            html: '<h3>НОВОСТИ</h3>'
        }
    }).insertIn(blockFn);

    var newsSpisok = f_dc_temp({
        state: {
            class: 'ul',
            html: `
						<ul>
							<li> <span>Пользователь купил 100 FPT</span></li>
							<li> <span>Новый Пользователь "12345" <br> присоеднился</span></li>
							<li><span>Пользователь 134 купил 20 FPT</span></li>
							<li><span>Пользователь 1234 купил 10 FPT</span></li>
							
						</ul>
					`
        }
    }).insertIn(news);
    var news_bottom = f_dc_temp({
        eltype: 'h3',
        state: {
            class: 'news_bottom',
            html: '<img src="images/news_arrow.png">'
        },
        attrs: {
            style: 'cursor:pointer'
        }
    }).insertIn(news);

    console.log("level :", mctx.User.getLevel());


    var api_module = {
        updateLink(val) {
            // referenInput.change({

            // })
            referenInput.el.value = 'http://freepe.io/ref/' + val;
        },
        updateLevel(val) {
            skillsNumber.change({
                text: val
            })
            switch (val) {
                case 1: level1.addClass('active_level'); break;
                case 2: level2.addClass('active_level');
                    level1.addClass('active_level'); break;
                case 3: level1.addClass('active_level');
                    level3.addClass('active_level');
                    level2.addClass('active_level'); break;
                /*case 4: level4.addClass('active_level'); 
                        level3.addClass('active_level'); 
                        level2.addClass('active_level');
                break;*/
                case 4: level1.change({
                    html: '<h1>Уровень 5</h1>'
                });

                    level2.change({
                        html: '<h1>Уровень 6</h1>'
                    });
                    level3.change({
                        html: '<h1>Уровень 7</h1>'
                    });
                    level4.change({
                        html: '<h1>Уровень 8</h1>'
                    })
                    levelUL1.change({
                        html: '<li>'
                        + '<span>Задача</span><br>'
                        + 'Пригласите 20 друзей или купите 200 FPN'
                        + '</li>'
                        + '<li>'
                        + '<span>Награда</span><br>'
                        + 'Реферальный бонус: 10%'
                        + '</li>'
                    })
                    /*level2.removeClass('active_level');
                    level3.removeClass('active_level');
                    level4.removeClass('active_level');*/
                    break;

                case 5:
                    level1.addClass('active_level');
                    level1.change({
                        html: '<h1>Уровень 5</h1>'
                    });

                    level2.change({
                        html: '<h1>Уровень 6</h1>'
                    });
                    level3.change({
                        html: '<h1>Уровень 7</h1>'
                    });
                    level4.change({
                        html: '<h1>Уровень 8</h1>'
                    })
                    levelUL2.change({
                        html: '<li>'
                        + '<span>Задача</span><br>'
                        + 'Пригласите 25 друзей или купите 250 FPN'
                        + '</li>'
                        + '<li>'
                        + '<span>Награда</span><br>'
                        + 'Реферальный бонус: 12%'
                        + '</li>'
                    })

                    break;
                case 6: level2.addClass('active_level');
                    level1.addClass('active_level');
                    level1.change({
                        html: '<h1>Уровень 5</h1>'
                    });

                    level2.change({
                        html: '<h1>Уровень 6</h1>'
                    });
                    level3.change({
                        html: '<h1>Уровень 7</h1>'
                    });
                    level4.change({
                        html: '<h1>Уровень 8</h1>'
                    })
                    levelUL3.change({
                        html: '<li>'
                        + '<span>Задача</span><br>'
                        + 'Пригласите 25 друзей или купите 250 FPN'
                        + '</li>'
                        + '<li>'
                        + '<span>Награда</span><br>'
                        + 'Реферальный бонус: 14%'
                        + '</li>'
                    })
                    break;
                case 7: level3.addClass('active_level');
                    level1.addClass('active_level');
                    level2.addClass('active_level');
                    level1.addClass('active_level');
                    level1.change({
                        html: '<h1>Уровень 5</h1>'
                    });

                    level2.change({
                        html: '<h1>Уровень 6</h1>'
                    });
                    level3.change({
                        html: '<h1>Уровень 7</h1>'
                    });
                    level4.change({
                        html: '<h1>Уровень 8</h1>'
                    })

                    levelUL4.change({
                        html: '<li>'
                        + '<span>Задача</span><br>'
                        + 'Пригласите 30 друзей или купите 300 FPN'
                        + '</li>'
                        + '<li>'
                        + '<span>Награда</span><br>'
                        + 'Реферальный бонус: 16%'
                        + '</li>'
                    })
                    break;
                case 8: level1.addClass('active_level');
                    level3.addClass('active_level');
                    level2.addClass('active_level');
                    level1.change({
                        html: '<h1>Уровень 7</h1>'
                    });

                    level2.change({
                        html: '<h1>Уровень 8</h1>'
                    });
                    level3.change({
                        html: '<h1>Уровень 9</h1>'
                    });
                    level4.change({
                        html: '<h1>Уровень 10</h1>'
                    })
                    level4.addClass('active_level'); break;
                case 9:

                    level1.change({
                        html: '<h1>Уровень 7</h1>'
                    });

                    level2.change({
                        html: '<h1>Уровень 8</h1>'
                    });
                    level3.change({
                        html: '<h1>Уровень 9</h1>'
                    });
                    level4.change({
                        html: '<h1>Уровень 10</h1>'
                    })
                    level1.addClass('active_level');
                    level3.addClass('active_level');
                    level2.addClass('active_level');
                    break;
                case 10:
                    level1.change({
                        html: '<h1>Уровень 7</h1>'
                    });

                    level2.change({
                        html: '<h1>Уровень 8</h1>'
                    });
                    level3.change({
                        html: '<h1>Уровень 9</h1>'
                    });
                    level4.change({
                        html: '<h1>Уровень 10</h1>'
                    })
                    level1.addClass('active_level');
                    level3.addClass('active_level');
                    level2.addClass('active_level');
                    level4.addClass('active_level');
                    break;
                default: level1.addClass('active_level'); break;
            }

        },
        updateReferals(val) {
            //
            refLabel.change({
                text: val
            })
        },
        updateAccounts(val) {
            //
            var str = '';
            str += '<li>';
            slideAccount.change({
                html: ''
            })
        }

    }

    if (mctx.User) api_module.updateLink(mctx.User.ref_link);
    api_module.updateLevel(mctx.User.getLevel());
    api_module.updateReferals(0);



    var load_wallets = (cbfail, cbok) => {
        mctx.f_semit('colu', { act: 'show_all_wallets' }, data => {
            console.log(1);
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

                /*blockAdress.change({
                    html: data[0]
                });
                blockAdressfreepemoney.change({
                    html: data[1]
                });*/

                // data.forEach(v => {
                //  DC.temp({
                //      state: {
                //          class: 'module-wallets-address',
                //          text: v
                //      }
                //  })
                //  .insertIn(body);
                // });
                console.log(data);
                return data;
            } else {
                update(JSON.stringify(data));
            }
        });
    }
    block_api.load_wallets = (cbfail, cbok) => {
        load_wallets(cbfail, cbok);
    }

    block_api.load_wallets(fail => {
        console.log('fail loading wallets');
    }, ok => {

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
                }
            })
            /*block_api.updateBalanceBTC(fail => {
                // 
            }, ok => {
                ready++;
                if (ready == total) {
                }
            })*/

        }
    });
    block_api.updateBalanceFPN = (cbfail, cbok) => {
        mctx.f_semit('colu', { act: 'get_my_balance' }, data => {
            console.log(123);
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
                    balance.change({
                        html: 'Баланс: <i>0.0000 </i>'
                    });
                } else {
                    for (var v in total) {
                        balance.change({
                            html: 'Баланс: <i>' + n2fpn(total[v]) + '</i>'
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
    //api_module.updateAccounts({});

    return {
        //////
        dc: dc_module,
        api: api_module

    }
});