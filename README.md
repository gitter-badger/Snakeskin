# Snakeskin

<img src="http://kobezzza.com/files/snakeskin/logo.svg" alt="Snakeskin" width="180px" />

Snakeskin — компилятор блочных шаблонов c поддержкой наследования.

[![NPM version](http://img.shields.io/npm/v/snakeskin.svg?style=flat)](http://badge.fury.io/js/snakeskin)
[![NPM dependencies](http://img.shields.io/david/kobezzza/Snakeskin.svg?style=flat)](https://david-dm.org/kobezzza/snakeskin)
[![Build Status](http://img.shields.io/travis/kobezzza/Snakeskin.svg?style=flat&branch=master)](https://travis-ci.org/kobezzza/Snakeskin)
[![Coverage Status](http://img.shields.io/coveralls/kobezzza/Snakeskin.svg?style=flat)](https://coveralls.io/r/kobezzza/Snakeskin?branch=master)

[Онлайн-демо](http://jsfiddle.net/kobezzza/NAPWB/10/)

[FAQ](https://github.com/kobezzza/Snakeskin/wiki/faq)

## Основные особенности

* 2 варианта синтаксиса: классический и Jade-Like;
* ОО-подход с очень богатым выбором для code-reuse (наследование, композиция, примеси и т.д.);
* Близкий к JS набор директив;
* Поддержка БЭМ на уровне синтаксиса;
* Поддержка локализации на уровне синтаксиса;
* Поддержка макросов и фильтров;
* Поддержка модулей и разбиения на файлы;
* Высокая скорость трансляции;
* Работа в браузерах, а также на сервере ([node.js](http://nodejs.org/));
* Движок написан на чистом JavaScript и не имеет дополнительных зависимостей;
* Исходный код спроектирован для совместной работы с Google Closure Compiler в продвинутом режиме;
* Хорошее покрытие кода тестами;
* Подробная [документация](https://github.com/kobezzza/Snakeskin/wiki) с примерами.

### Примеры использования

```
- template page(youAreUsingSnakeskin)
	- doctype
	< html lang = ru
		< head
			< title :: Snakeskin
			#< script
				if (foo) bar(1 + 5)

		< body
			< h1 :: Snakeskin — лучший шаблонный движок
			< #container.b-info
				- if youAreUsingSnakeskin
					< p.&__good :: Поздравляем, вы используете самое лучшее!

				- else
					< p.&__bad :: Скорее начните использовать!

				< p.&__description
					Snakeskin — это клиент-серверный шаблонный движок с
					простым и понятным синтаксисом и богатым набором возможностей.
```

```js
page(true);
```

Превратится в

```html
<!DOCTYPE html>
<html lang="ru">
	<head>
		<title>Snakeskin</title>
		<script type="text/javascript">
			if (foo) bar(1 + 5)
		</script>
	</head>
	<body>
		<h1>Snakeskin — лучший шаблонный движок</h1>
		<div id="container" class="b-info">
			<p class="b-info__good">Поздравляем, вы используете самое лучшее!</p>
			<p class="b-info__description">Snakeskin — это клиент-серверный шаблонный движок с
					простым и понятным синтаксисом и богатым набором возможностей.</p>
		</div>
	</body>
</html>
```

## Лицензия

The MIT License (MIT)

Copyright (c) 2014 Андрей Кобец (Kobezzza) <kobezzza@mail.ru>

Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и
сопутствующей документации (в дальнейшем именуемыми «Программное Обеспечение»),
безвозмездно использовать Программное Обеспечение без ограничений, включая неограниченное право на использование,
копирование, изменение, добавление, публикацию, распространение, сублицензирование и/или
продажу копий Программного Обеспечения, также как и лицам, которым предоставляется данное
Программное Обеспечение, при соблюдении следующих условий:

Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или
значимые части данного Программного Обеспечения.

ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ,
ВКЛЮЧАЯ, НО НЕ ОГРАНИЧИВАЯСЬ ГАРАНТИЯМИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И
ОТСУТСТВИЯ НАРУШЕНИЙ ПРАВ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО ИСКАМ О
ВОЗМЕЩЕНИИ УЩЕРБА, УБЫТКОВ ИЛИ ДРУГИХ ТРЕБОВАНИЙ ПО ДЕЙСТВУЮЩИМ КОНТРАКТАМ, ДЕЛИКТАМ ИЛИ ИНОМУ, ВОЗНИКШИМ ИЗ,
ИМЕЮЩИМ ПРИЧИНОЙ ИЛИ СВЯЗАННЫМ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ ИЛИ ИСПОЛЬЗОВАНИЕМ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ
ИНЫМИ ДЕЙСТВИЯМИ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ.
