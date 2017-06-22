
DC.ready(function(){
	var divMain = DC.make({
		state: {
			html:'<div class="fix">'+
					'<a href="#">Войти</a>'+
				 '</div>'+

				 '<a href="#" id="alter">Войти</a>'+

				 '<h3>Наслаждайся жизнью сейчас!</h3>'+
				 '<p>Стань одним из нас! Позволь <strong>FreePe</strong> позоботиться об остальном.</p>'+
				 '<p class="alternative">Стань одним из нас!<br>Позволь <strong>FreePe</strong> позоботиться об остальном.</p>'+

				 '<form><input type="email" class="validate" id="email" placeholder="Введите ваш Email" required>'+
				 '<input type="submit" id="submit" class="" value="Вливайся!"></form>'+

				 '<div class="page_background_middle"></div>'+
				 '<div class="page_background_footer"></div>',
			class: 'page-background'
		}
	});

	divMain.insertIn(document.body);
})

