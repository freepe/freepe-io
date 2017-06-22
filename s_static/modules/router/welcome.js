//1.00
DC.module('router/welcome',function(mctx){

        function f_dc_make(obj) {
        return DC.make(obj);
    }
    function f_dc_temp(obj) {
        return DC.temp(obj);
    }

var dc_module = DC.temp(function(){
    return {
        state: {
            class: 'module-welcome'
        },
        initLater(){
            return this;
        }
    }
})

    var page = f_dc_temp({
        state: {
            class: 'page',
            html: `
            <div class="freepe">
                <div class="freepe_block1">
                <h1> ДОБРО ПОЖАЛОВАТЬ В МИР FREEPE IO.</h1>
                <p>Мы очень рады, что вы присоединились к нам. 
                    Вместе мы достигнем потрясающих высот!
                </p>
                </div>
            </div>
                <div class="freepe_block2">
                    <p>Позвольте сделать небольшую экскурсию по страницам.</p>
                    <a href="#DashBoard"><img src="images/lineSmall.png" style="padding-right: 4%; ">
                    НАЧАТЬ ЭКСКУРСИЮ
                    <img src="images/lineSmall.png" style="padding-left: 4%;"></a>
                </div>
            `
        }
    }).insertIn(dc_module);

    var papeDashBoard = f_dc_temp({
        state: {
            class: 'pageDashBoard',
            html:`
                <div class="DashBoard" id="DashBoard">
                    <h1> 1. ДОМАШНЯЯ СТРАНИЦА</h1>
                    <img src="images/DashBoard.png" id="img" style="width: 80%;">
                    <img src="images/DashBoard480.png" id="alterDash">

                    <p>
                        На <span class="span"> Домашней странице</span> указан ваш текущий
                        баланс FreePenny(FPN), реферальная ссылка с возможностью поделится ею через
                        соцсети, уровень, который влияет на процент дохода с вложений
                        ваших рефералов, а также личные и групповые сообщения.
                    </p>

                    <a href="#fin"><img src="images/str.png" id="str"></a>
                </div>
            `
        }
    }).insertIn(dc_module);

    var pageFinanses = f_dc_temp({
        state: {
            class: 'pageFinanses',
            html: `
                <div class="finanses" id="fin">
                    <h1>2. СТРАНИЦА ФИНАНСОВ</h1>
                    <img src="images/fin.png" style="width: 80%;">
                    <img src="images/fin480.png" id="alterFin">

                    <p>
                        На странице<span class="span" onclick="func();"> Финансы</span> вы можете найти свои кошельки FreePenny и
                        осуществлять операции по отправке и обмену средств, делать запросы на получение платежей,пополнять счета FPM с помощью различных валют и выводить деньги
                        через доступные платежные системы.
                    </p>
                </div>
            `
        }
    }).insertIn(dc_module);

    var pagePr = f_dc_temp({
        state: {
            class: 'pr'
        }
    }).insertIn(dc_module);


return {

dc: dc_module,

api: {
}

}
});

