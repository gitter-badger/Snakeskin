# Snakeskin

Snakeskin — компилятор блочных шаблонов c поддержкой наследования.
Независим от среды исполнения, для работы нужен лишь интерпретатор JavaScript.

Поиграться можно тут: http://jsfiddle.net/NAPWB

## Установка

	npm install -g snakeskin

или

	bower install snakeskin

или

	git clone git://github.com/kobezzza/Snakeskin.git

## Общая концепция

Шаблоны в Snakeskin — это функции в JavaScript.

	{template foo(name)}
		Hello {name}!
	{end}

Эквивалентно

```js
var foo = function foo(name) {
	var __SNAKESKIN_RESULT__ = '',
		$_;

	var TPL_NAME = 'foo';
	var PARENT_TPL_NAME;

	__SNAKESKIN_RESULT__ += ' Hello ';
	__SNAKESKIN_RESULT__ += Snakeskin.Filters.html(Snakeskin.Filters.undef(name));
	__SNAKESKIN_RESULT__ += '! ';

	return __SNAKESKIN_RESULT__;
};
```

После компиляции вызов шаблона соотвествует простому вызову функции `foo()`.
Такой же подход используется в [Google Closure Templates](https://developers.google.com/closure/templates/).

### Варианты применения

Существует 2 сценария использования Snakeskin:

1. Предварительная трансляция файлов Snakeskin в файлы JavaScript и подключение последних;
2. "Живая" компиляция шаблонов.

#### Использования Snakeskin с компиляцией в браузере

```html
<!doctype html>
<html>
	<head>
		<title>Пример</title>
		<meta charset="utf-8">
		<script src="snakeskin.js"></script>
	</head>

	<body>
		<script type="text/x-snakeskin-template" id="templates">
			{template hello(name)}
				Hello {name}!
			{end}

			{template calc(a, b)}
				{a + b}
			{end}
		</script>

		<div id="result1"></div>
		<div id="result2"></div>

		<script>
			// Компиляция шаблонов,
			// после шаблоны hello и calc станут доступны,
			// как простые глобальные функции
			Snakeskin.compile(document.getElementById('templates'));

			// Выведем результат работы шаблонов
			document.getElementById('result1').innerHTML = hello('World');
			document.getElementById('result2').innerHTML = calc(5, 7);
		</script>
	</body>
</html>
```

#### Использования Snakeskin в Node.js c "живой" компиляцией

```js
var snakeskin = require('snakeskin');

var tpl =
	'{template hello(name)}' +
		'Hello {name}!' +
	'{end}' +

	'{template calc(a, b)}' +
		'{a + b}' +
	'{end}';

var tpls = {};
snakeskin.compile(tpl, {context: tpls});

console.log(tpls.hello('World'));
console.log(tpls.calc(5, 7));
```

#### Использования Snakeskin в Node.js с компилированными файлами

После подключения файла шаблонов необходимо вызвать метод init и передать ему ссылку на объект Snakeskin.

```js
var tpls = require('./my_tpls').init(require('snakeskin'));

console.log(tpls.hello('World'));
console.log(tpls.calc(5, 7));
```

## Области декларации шаблонов

Шаблоны можно описывать в отдельных файлах с расширением `.ss`
или же в блоках `<script type="text/x-snakeskin-template">...</script>`.
В одной области может быть объявлено неограниченное количество шаблонов.

## Синтаксис управляющих конструкций

Управляющие конструкции шаблонизатора размещаются между `{` и `}`.

## Комментарии

В любом месте области декларации шаблонов допускается использовать однострочные (`///`) и многострочные (`/* ... */`)
комментарии. Комментарии вырезаются на этапе трансляции и не попадают в скомпилированный JavaScript.

```js
/* ... */
/// ...
{template foo(name)}
	///{name}
	/*Hello
	World*/

	{1 /*+ 2*/} /// выведет 1

	{'/* 1 */'} /// /* 1 */, т.к. внутри литералов строк и регулярных выражений комментарии не действуют

	/* Чтобы отменить нежелательный комментарий, то его можно экранировать */
	file:\///... /// экранируем первый /, чтобы URL вывелся как надо

	/// Пример ниже вызовет ошибку
	{/*}*/
{end}
```

Вне декларации шаблона можно также использовать специальные jsDoc комментарии,
которые не будут вырезаться на этапе трансляции
(это может быть нужно, если, например, после трансляции шаблоны будут компилироваться в Google Closure Compiler).

```js
/**
 * Описание шаблона
 *
 * @param {?} param1 - параметр 1
 * @param {?} param2 - параметр 2
 * @return {string}
 */
{template myTemplate(param1, param2)}
{end}
```

## Директива end

Директива завершает тело другой директивы, поддерживается несколько форм записей

	{template}
		...
	{end} /// Такая форма не доступна для cdata

	{template}
		...
	{end template}

	{template}
		...
	{/template}

	{template}
		...
	{/} /// Такая форма не доступна для cdata

В случае использования `end template` и `/template` Snakeskin дополнительно проверяет правильность вложенностей и
может генерировать сообщения об ошибках.

## Объявления шаблона.

Объявление шаблона возможно с помощью директив `template` и `placeholder`.
Шаблон может декларироваться только в глобальной области (т.е. шаблон не может включать в себя другой шаблон).

Простой шаблон без входных параметров:

	{template myTemplate()}
		Тело шаблона
	{end}

Название шаблона соответствует названию функции в JavaScript, поэтому оно подчиняется тем же правилам.

Простой шаблон без входных параметров объявленный в пространстве имён (безопасность добавления проверяется):

	{template myTpl.myTemplate()}
		Тело шаблона
	{end}

	{template myTpl['myTemplate']()}
		Тело шаблона
	{end}

Если название шаблона в пространстве имён взято в квадратные скобки,
то оно может содержать любые валидные JavaScript символы. Также есть ещё одно небольшое отличие в
конечном коде при использовании `myTpl.myTemplate()` и `myTpl['myTemplate']()`:
в первом случае будет `myTpl.myTemplate = function myTemplate() {`, а во втором `myTpl['myTemplate'] = function () {`,
т.е. первая скомпилированная функция именованная, а вторая нет.

Шаблон с 2-мя входными параметрами, причём один из них имеет значение по умолчанию:

	{template myTemplate(a = 1, b)}
		Тело шаблона
	{end}

Значение по умолчанию ставится в случае если параметр равен `null` или `undefined`.

Шаблон, который наследует функционал другого шаблона:

	{template nextTemplate(a, b) extends myTemplate}
		Тело шаблона
	{end}

Общая формула декларации шаблонов (в квадратные скобки взяты опциональные параметры):

	{template [пространствоИмён]названиеШаблона([параметры через запятую]) [extends родительскийШаблон]}
		Тело шаблона
	{end}

### Директива placeholder

Директива placeholder позволяет декларироват шаблоны, которые будут существовать только на этапе трансляции,
но не войдут в скомпилированный файл. Синтаксис placeholder идентичен синтаксису template.

	{placeholder myTpl.myTemplate()}
		Тело шаблона
	{end}

	{placeholder myTpl['myTemplate']()}
		Тело шаблона
	{end}

### Стандартные переменные шаблона

Внутри каждого шаблона доступны несколько встроенных переменных:

* `TPL_NAME` - строка, полное название шаблона (с учётом пространства имён);
* `PARENT_TPL_NAME` - строка, полное название родительского шаблона (с учётом пространства имён).

### Подшаблоны. Директивы proto и apply

Snakeskin не поддерживает вложенные шаблоны, но для реализации нужной функциональности он имеет специальные директивы.

#### proto

Директива proto (прототип) декларирует подшаблон, который может неоднократно применяться в рамках своего родительского шаблона.
Подшаблон можно декларироваться как в глобальной области, так и внутри другого шаблона или же подшаблона.

	/* Прототип, размещённый в глобальной области,
	 обязательно должен идти перед декларацией шаблона,
	 к которому он относится */
	{proto foo->outer}
		Some text ...
	{end}

	{template foo()}
		/// Прототип внутри шаблона
		{proto hello}
			Hello World

			/// Вложенный прототип
			{proto deep}
				bla bla bla
			{end}
		{end}
	{end}

В случае декларации прототипа в глобальной области необходимо указывать название шаблона,
которому принадлежит прототип, общая формула такая: `{proto названиеШаблона->названиеПрототипа}`.
Для вложенных прототипов и прототипов внутри шаблона нужно писать только название.
Название прототипа может состоять из символов латинского алфавита, цифр, знака подчёркивания (_) и знака доллара ($).
Названия прототипов лежит в отдельном пространстве имён, поэтому оно может совпадать с названием существующих шаблонов,
констант и т.д.. В пределах одного шаблона не может быть 2-х прототипов с одним именем,
т.к. все прототипы хранятся в единой глобальной области своего шаблона вне зависимости от места своей декларации.

Прототип, как и шаблон, может иметь входные параметры, для этого используется следующий синтаксис:

	{template foo()}
		/// Параметр age имеет значение по умолчанию
		{proto hello(name, age = 18)}
			Hello {name}!
			Age: {age}
		{end}
	{end}

#### apply

При декларации прототипа его тело не выводится в конечный шаблон, т.е. после декларации его необходимо специально вызвать.
Для этого существует директива apply, которую можно использовать только внутри шаблонов или прототипов.

	{template foo()}
		{proto hello(name = 'World')}
			Hello {name}!
		{end}

		{apply hello} /// Hello World!
		{apply hello()} /// Hello World!
		{apply hello('Bob')} /// Hello Bob!
	{end}

Вызывать прототип можно до того, как он будет декларирован

	{template foo()}
		{apply hello}

		{proto hello(name = 'World')}
			Hello {name}!
		{end}
	{end}

Внутри прототипов допускается вызов других прототипов

	{proto foo->begin}
		{apply f1(1)}
	{end}

	{proto foo->f1(i)}
		{apply f2(i)}
		{apply f2(i + 1)}

		{proto f3(i)}
			{i * 2}
		{end}
	{end}

	{template foo()}
		{apply begin} /// 1 2
		{apply f3(2)} /// 4

		{proto f2(i)}
			{i}
		{end}
	{end}

##### Рекурсивный apply

Прототипы поддерживают возможность рекурсии, как в явном виде

	{template foo()}
		{proto begin(i)}
			{i}

			{if i}
				{apply begin(--i)}
			{end}
		{end}

		{apply begin(5)} /// 5 4 3 2 1 0
	{end}

Так и в косвенном

	{template foo()}
		{proto begin(i)}
			{proto foo(i)}
				{apply begin(i)}
			{end}

			{i}

			{if i}
				{apply foo(--i)}
			{end}
		{end}

		{apply begin(5)} /// 5 4 3 2 1 0
	{end}

Однако, в данной версии Snakeskin на косвенный вызов накладываются некоторые ограничения: прототип,
организующий косвенную рекурсию должен либы содержаться "внутри" (как на примере выше) своей пары,
либо декларироваться после неё, но до вызова корневого apply, т.е.

	{template foo()}
		{proto begin(i)}
			{i}

			{if i}
				{apply foo(--i)}
			{end}
		{end}

		{proto foo(i)}
			{apply begin(i)}
		{end}

		{apply begin(5)} /// 5 4 3 2 1 0
	{end}

### Вызов шаблона в теле другого шаблона. Директива call

С помощью директивы call можно вызывать другие шаблоны (или же другие функции) внутри шаблона или прототипа.
Шаблоны декларированные с помощью placeholder вызывать нельзя, т.к. они сущесвуют только на этапе трансляции.

	{template foo(name)}
		{name}
	{end}

	{template bar()}
		{call foo('Bob')}

		/// На самом деле call - это простой вызов функции внутри шаблона,
		/// поэтому можно делать так
		{call foo.call(this, 'Bob')}
		{call foo.apply(this, arguments)}

		/// Т.к. любой шаблон - это простая функция, то с помощью call можно вызывать любые функции
		{call Math.random}
	{end}

#### proto-apply VS template-call

Оба подхода используются при декомпозии, однако связка proto-apply реализуется на этапе трансляции,
т.е. в скомпилированном JavaScript никаких прототипов не существует, что благоприятно влияет на скорость работы шаблона,
а связка template-call выполняется уже при запуске скомпилированной функции — это даёт больше гибкость в использовании,
но порождает дополнительные связи и замедляет скорость работы шаблона.

Обычно, если некоторая часть шаблона используется только "внутри", но не должна быть доступна из вне,
то предпочтительнее использовать прототипы.

### Директива return

Внутри шаблонов или прототипов можно использовать директиву return, которая прерывает дальнейшее выполнение блока

	{template foo()}
		{proto begin(i)}
			{i}

			{if i === 3}
				{return}
			{end}

			{if i}
				{apply begin(--i)}
			{end}
		{end}

		{apply begin(5)} /// 5 4 3

		/// Внутри шаблонов, но вне тела прототипа директиве можно указывать возвращаемое значение,
		/// которое вернёт шаблон вместо базового результата
		{return 1}
	{end}

## Работа с пробельными символами

Внутри шаблона или прототипа все пробельные символы (переходы строк, табуляция, пробелы и т.д.) трактуются как пробел,
а смежные пробельные символы "схлопываются" в один.

	{template foo()}
		Hello             World /// Hello World
	{end}

### Директива &

Директива декларирует, что все последующие пробельные символы до первого не пробельного должны игнорироваться.

	{template foo()}
		Hello{&}             World /// HelloWorld
	{end}

## Директива cdata

Выделенная последовательность вырезается при обработке парсером,
а затем вставляется без изменений в результирующую функцию (пробельные символы также остаются неизменны).

	{template foo()}
		/// Блоки внутри cdata не будут обработаны парсером
		{cdata}
			{if a = 1}
			{end}
		{end cdata}

		{cdata}
			{if a = 1}
			{end}
		{/cdata}
	{end}

## Вывод значений

Для вывода значений используется следующий синтаксис `{a}`.
Внутри выводимой конструкции можно использовать любой валидный JavaScript.

	{a > 1 ? 'foo' : 'bar'}
	{1 + 2}
	{Math.round(Math.random())}
	{new Date() + 1e3}
	{'foo'.length + @a['myValue']}

### Фильтры

Snakeskin поддерживает механизм фильтров — это более удобный и "сахарный" доступ к функциям
в пространстве имён Snakeskin.Filters.

	{a|ucfirst} /// {Snakeskin.Filters['ucfirst'](a)}
	{a + b|ucfirst} /// {Snakeskin.Filters['ucfirst'](a + b)}

Допускается использовать последовательности фильтров

	{a + b|trim|ucfirst} /// {Snakeskin.Filters['ucfirst'](Snakeskin.Filters['trim'](a + b))}

Фильтры можно накладывать отдельно на некоторые части выражения, для этого нужно обернуть декларацию в круглые скобки

	/// Два локальных и один глобальный фильтр
	{(a|ucfirst) + (b|ucfirst) |trim}

Фильтрам можно передавать параметры, на которые также можно применять фильтры и т.д.

	{a|myFilter 1, (2 / 3|myFilter)}

По умолчанию при выводе значений через `{ ... }` к ним применяется глобальный фильтр html (экранирование html символов),
однако его выполнение можно отменить `{a|!html}`.

Механизм фильтров поддерживает большинство директив Snakeskin.

	{var a = ('fooo '|trim)}

	{if a|trim}
		...
	{end}

Чтобы написать свой фильтр, достаточно добавить его в `Snakeskin.Filters`.
Название фильтра может начинаться с символа латинского алфавита, подчёркивания (_) и знака доллара ($).
Первым параметром функции будет значение выражения.

```js
// Составить строку из повторений подстроки, где opt_num число повторений
Snakeskin.Filters['repeat'] = function (str, opt_num) {
	return new Array(opt_num || 2).join(str);
};
```

Фильтры можно разбивать на внутренние пространства имён

```js
Snakeskin.Filters['text'] = {
	'repeat': function (str, opt_num) {
		return new Array(opt_num || 2).join(str);
	}
};
```

	{'foo'|text.repeat}

Также для добавления своих фильтров можно воспользоваться методов `Snakeskin.importFilters`

```js
Snakeskin.importFilters({
	'repeat': function (str, opt_num) {
		return new Array(opt_num || 2).join(str);
	}
});

// С указанием пространства имён
Snakeskin.importFilters({
	'repeat': function (str, opt_num) {
		return new Array(opt_num || 2).join(str);
	}
}, 'my.foo.bar'); // my.foo.bar.repeat
```

В библиотеку Snakeskin входит несколько стандартных фильтров:

* html – экранирование html сущностей, применяется по умолчанию на все выводимые через `{ ... }` параметры;
* !html – отменяет выполнение по умолчанию фильтра html;
* uhtml – обратная операция html (& => & и т.д.);
* stripTags – удаляет знаки тегов (< и >);
* uri – кодирует URL;
* json – JSON.stringify (для поддержки в старых браузеров необходимо будет подключить полифил, например, JSON2.js);
* upper – переводит строку в верхний регистр;
* ucfirst – переводит первую букву строки в верхний регистр;
* lower – переводит строку в нижний регистр;
* lcfirst – переводит первую букву строки в нижний регистр;
* trim – срезает крайние пробелы у строки;
* collapse – сворачивает пробелы в 1 и срезает крайние у строки;
* truncate – обрезает строку до указанный длины и в конце подставляет троеточие, имеет 1 обязательный параметр (максимальная длина) и 1 необязательный (true, если обрезается с учётом целостности слов);
* repeat – создаёт строку из повторений входной строки, имеет 1 необязательный параметр (количество повторений, по умолчанию 2);
* remove – удаляет указанную подстроку из входной строки, подстрока указывается как строка или как регулярное выражение;
* replace – заменяет указанную подстроку из входной строки, подстрока указывается как строка или как регулярное выражение, строка замены указывается как простая строка.

#### Примечание к фильтрам

Чтобы использовать в шаблоне побитовое ИЛИ (|) достаточно просто указать пробел после оператора |,
также если после оператора | идёт число, то можно писать как есть, т.к. название фильтра не может начинаться с числа.

	{1|0}

	{a = 1}
	{1 | a}

#### Переменная $_

Переменная $_ содержит результат последней работы фильтра

	{' fooo '|trim}
	{$_} /// 'fooo'

### Вызов функции VS call

На самом деле вызывать любую функцию можно просто используя синтаксис вывода,
однако на вызов функции с call не накладывается фильтр html умолчанию, т.е.

	{call foo()}
	/// Тоже самое, что и
	{foo()|!html}

## Директива void

Директива выполняет указанное действие, но ничего не выводит в шаблон.
Директиву можно использовать только внутри шаблонов или прототипов.

	{void changeDocTitle('Foobar')}

Также для директивы доступна более короткая форма записи:

	{?changeDocTitle('Foobar')}
	{?a++; b()}
	{?console.log(a)}

Также, как и при выводе значений, внутри директивы можно использовать фильтры.

## Константы

В любом месте внутри шаблона или прототипа можно объявить константу.
После определение константы будет невозможным переопределить её значение
или создать новую с таким же именем. Константы имеют глобальную область видимости внутри шаблона,
т.е. не важно где она будет определена.
Константа может принимать любое валидное JavaScript значение (кроме деларации функции).
Входные параметры шаблона также являются константами.

	{a = 1}
	{b = [{a: 1}, 2, 3]}
	{c = someFunction()}
	{r = a === 1 ? 2 : 4}

Несмотря на то, что значение константы нельзя переопределить, его можно модифицировать, т.е.:

	{a = 1}
	{a += 2}
	{a--}

	{b = {}}
	{b.val = 1} /// свойство b.val также является константой

	{b = 3} /// error, нельзя переопределить константу

Ключевое слово const обычно опускается, но его можно писать явно.

	{const a = 1}

### Доступ к константам из внешних прототипов

Т.к. константы являются глобальными, то мы можем использовать их и во внешних прототипах

	{proto foo->bar}
		{a} /// 1
		{b} /// 2
		{e = 4}
	{end}

	{template foo(a = 1)}
		{b = 2}
		{e} /// error

		{apply bar}
		{e} /// 4
	{end}

## Переменные

В любом месте внутри шаблона или прототипа могут быть объявлены переменные.
В отличии от констант их значение может быть переопределено в ходе выполнения шаблона.
Переменные не могут быть переопределены явно в дочернем шаблоне (константы могут).

	{template foo}
		{var a = 1}
		{var b = [{a: 1}, 2, 3]}

		/// Несколько переменных в одной директиве
		{var c = someFunction(),
			r = a === 1 ? 2 : 4}

		/// Более короткий синтаксис объявления
		{:e = 1, j = 2}
	{end}

Переменные имеют блочную область видимости (аналогия с let в JavaScript).

	{template foo()}
		{if 1}
			{:a = 1}
			{a} /// 1
		{end}

		{a} /// error, a is not defined

		{:b = 1}
		{if 1}
			{b} /// 1
		{end}

		{b} /// 1
	{end}

## Супер-глобальные переменные

Вне тела шаблона можно декларировать супер-глобальные переменные.
Доступ к этим переменным может получить любой шаблон или прототип.

	{a = 1}
	{template foo()}
		/// Для доступа к супер-глобальной переменной испольюзуется модификатор @
		{@a}

		/// Внутри шаблона можно определять новые или изменять значение старых переменных
		{@a += 2}
		{@c = 1}
	{end}

Значение переменных сохраняется в `Snakeskin.Vars`.

## Условия

Внутри шаблонов или прототипов можно использовать директивы условий:

	{if a === 1}
		...
	{elseIf a == 3}
		...
	{else}
		...
	{end}

	{if (b == 4 || c == 4) && a == 4}
		{if g == 4}
		   ...
		{end}
	{end}

	{switch a}
		{case 1}
			...
		{end}

		{case 2}
			...
		{end}

		/// Для case есть более короткий синтаксиc
		{> 3}
			...
		{end}

		{default}
			...
		{end}
	{end}

## Итераторы и циклы
### forEach

Для итерации по массивам и объектам используется директива forEach,
локальные переменные цикла могут объявляться после `=>` через запятую (опционально).

Для массивов список входны параметров следующий:
* значение элемента;
* номер итерации;
* ссылка на итерируемый массив;
* является ли элемент первым;
* является ли элемент последним;
* длина массива.

Для объектов:
* значение элемента;
* ключ;
* ссылка на итерируемый объект;
* номер итерации;
* является ли элемент первым;
* является ли элемент последним;
* длина объекта.

Пример:

	{forEach a => el, i}
		{forEach el}
		{end}
	{end}

### forIn

Для итерации по объектам без учёта `hasOwnProperty` существует директива forIn
(список аргументов такой же, как и у forEach для объектов).

	{forIn a => el}
		{el}
	{end}

### Циклы

Внутри шаблонов или прототипов можно использовать директивы декларации циклов:

	{for var i = 0; i < 10; i++}
		...
	{end}

	{var i = 10}
	{while i--}
		...
	{end}

	{var i = 10}
	{do}
		...
	{while i--}

	/// repeat-until является псевдонимом do-while
	{var i = 10}
	{repeat}
		...
	{until i--}

### break и continue

Директивы break и continue являются аналогом break и continue в JavaScript,
их можно использовать вместе с циклами и итераторами.

## Обработка исключений

Внутри шаблонов или прототипов можно использовать директивы обработки исключений:

	{try}
		...
	{catch err}
		...
	{finally}
		...
	{end}

## Директива with

Директива задаёт область видимости для поиска свойств объекта.
Директиву with можно использовать только внутри шаблонов или прототипов.

	{with a.child}
		{a} /// a.child.a
		{with a.next}
			{a + b} /// a.child.a.next.a + a.child.a.next.b
		{end}
	{end}

Внутри директивы with поддерживаются модификаторы контекста:
* # - искать значение на один with блок выше, например, `{#a}`
* #n (где n - целое число от 1) - искать значение на n with блок выше, например, `{#2a}`
* @ - искать значение вне with блоков, например, `{@a}`
* @@ - искать значение супер-глобальной переменной, например, `{@@a}`

	{with a.child}
		{#a} /// a
		{with a.next}
			{#a + @b + @@c} /// a.child.a + b + Snakeskin.Vars['c']
		{end}
	{end}

При объявлении переменных внутри блоков with доступ адресуется к ним

	{with foo}
		{var a = 1}
		{a + b} /// 1 + foo.b
	{end}

### Использование с прототипами

Блок proto всегда статически привязан к области видимости в месте своей декларации

	{template bar()}
		{a = {a: 1}}

		{with a}
			{proto foo(prop)}
				{a} - {prop}
			{end}
		{end}

		{apply foo(3)} /// 1 3

		{b = {a: 2}}
		{with b}
			{apply foo(a)} /// 1 2
		{end}
	{end}

## Директива data

Директива схожа по функциональности с директивой cdata,
т.е. текст внутри директивы вставляется "как есть".

	{template bar()}
		{a = 1}

		{data a} /// a
		{data {a: a}} /// {a: a}
	{end}

Однако в отличии от cdata внутрь директивы data возможно передавать параметры из шаблона с помощью синтаксиса `${}`

	{template bar()}
		{a = 1}

		{data ${a}} /// 1
		{data {a: ${a}}} /// {a: 1}

		/// Внутри ${} можно использовать фильтры и т.д.
		{data ${' fooo '|trim}}
	{end}

У директивы есть более короткая форма записи

	{=foooBar}
	{=[1,2,3]}
	{={a: 1}}

## Директива decl

Директива схожа по функциональностью с data

	{template bar()}
		{a = 1}

		{decl {a}} /// {{a}}
		{data {a: ${a}}} /// {{a: 1}}
	{end}

У директивы есть более короткая форма записи

	{{foo}}
	{{${a}}}

Данная директив создана для генерации "пометок" для библиотек организующих data-binding шаблона.

## Наследования шаблонов

Шаблоны могут наследоваться от других шаблонов.
Этот механизм основан на расширении и переопределении блоков родительского шаблона.

Чтобы сказать, что шаблон Б наследуется от шаблона A, необходимо указать в директиве декларации шаблона:
`{template B() extends A}`. Шаблон A уже должен быть продекларированным, иначе будет возбуждено исключение.

Допустим у нас есть 2 шаблона:

	{template base()}
		{name = 'Вася'}
		Привет {name}, как твои дела?
	{end}

	{template child() extends base}
		{name = 'Петя'}
	{end}

При наследовании дочерний шаблон полностью копирует структуру своего родителя,
а затем модифицирует его своими свойствами. Т.е. если развернуть наследование, то получилось бы

	{template base()}
		{name = 'Вася'}
		Привет {name}, как твои дела?
	{end}

	{template child()}
		{name = 'Петя'}
		Привет {name}, как твои дела?
	{end}

В скомпилированном коде обе функции абсолютно независимы, т.к. копирование структуры происходит на этапе трансляции.
Если родительский шаблон нужен только как прообраз, но самостоятельно нигде не используется в JS,
то тогда лучше использовать директиву placeholder для его декларации.

	{placeholder base()}
		{name = 'Вася'}
		Привет {name}, как твои дела?
	{end}

	{template child() extends base}
		{name = 'Петя'}
	{end}

### Концепция наследования. Директива block

Важно понимать отличия простой декларации шаблона от декларации шаблона с наследованием.
При декларации простого шаблона мы описываем его структуру,
а при наследовании мы описываем его изменения относительно родителя, например

	{template base()}
		Какой хороший день!
	{end}

	{template child() extends base}
		Может пойдём на речку?
	{end}

При вызове скомпилированной функции child результат будет точно таким же, как и у base: "Какой хороший день!",
но мы скорее всего ожидали увидеть "Какой хороший день! Может пойдём на речку?". Всё дело в том,
что в тексте шаблона child не были указаны изменения, а просто написана некоторая новая структура и Snakeskin не знает
как именно она должна расширять родительский шаблон и поэтому проигнорировал её.

Одним из способов декларации переопределяемых структур являются блоки,
они позволяют создавать специальные структурные пометки, например

	{template base()}
		{block foo}
			Какой хороший день!
		{end}
	{end}

	{template child() extends base}
		{block foo}
			Может пойдём на речку?
		{end}
	{end}

Tеперь при вызове child результат будет: "Может пойдём на речку?", т.к. в родительском шаблоне мы декларировали блок foo,
а в дочернем переопределили его. Мы также можем расширять дочерний шаблон путём введения новых блоков,
которых нет у родителя, и тогда они будут последовательно подставляться в конец тела родителя.

	{template base()}
		Какой хороший день!
	{end}

	{template child() extends base}
		{block sub}
			Может пойдём на речку?
		{end}
	{end}

Теперь результат child: "Какой хороший день! Может пойдём на речку?".

Сами по себе блоки никак не влияют на конечный вид шаблона, т.е.

	{template base()}
		{block sub}Как хороший день!{end}
	{end}

	{template base2()}
		Как хороший день!
	{end}

Оба шаблона дадут абсолютно одинаковый ответ.

В пределах шаблона не может быть двух блоков с одинаковым названием. Название блоков может состоять из любых символов,
однако крайние пробельные символы игнорируются. Внутри блока можно декларировать другие директивы, в частности другие блоки,
прототипы или константы, саму директиву можно также помещать внутрь прототипа и т.д.

	{template base()}
		{block foo}
			Какой хороший {block e}день{end}!
		{end}
	{end}

	{template child() extends base}
		{block e}пень{end}
	{end}

При переопределении/расширении можно также вводить новые блоки, прототипы и т.д.

	{template base()}
		{block foo}
			Какой хороший {block e}день{end}!
		{end}
	{end}

	{template child() extends base}
		{block e}
			пень
			{block next}, мой друг{end}
		{end}
	{end}

	{template child2() extends child}
		{block next}, мой брат{end}
	{end}

### Наследование констант и прототипов

Блоки не единственная структурная единица, которая может участвовать в наследовании: поддержка есть также у констант и прототипов.
Логика работы такая же как и у блоков: если в родительском шаблоне есть такая единица, то проиходит переопределение,
а если нет, то расширение. Разумеется родительские прототипы можно также вызывать в дочернем шаблоне.

	{proto base->foo(i)}
		{i}
	{end}

	{template base()}

	{end}

	{template sub() extends base}
		{block my}
			{apply foo(5)}
		{end}
	{end}

### Директива super

Директива позволяет подставлять тело родительского блока или прототипа при переопределении в дочернем.

	{proto base->foo(i)}
		{i}
	{end}

	{template base()}

	{end}

	{proto sub->foo(i)}
		{super} - {i * 2}
	{end}

	{template sub() extends base}
		{block my}
			{apply foo(2)} /// 2 - 4
		{end}
	{end}

### Наследование входных параметров

При наследовании шаблон наследует входные параметры родительского шаблона только в случае явного перечисления,
при этом если входной параметр имеет в родительском шаблоне значение по умолчанию, а в дочернем оно не указано, то
оно наследуется также.

	{template base(a = 1, b)}
	{end}

	/// Шаблон имеет один параметр "a" cо значением по умолчанию 1
	{template child(a) extends base}
	{end}

	/// Шаблон имеет один параметр "a" cо значением по умолчанию 2
	{template child(a = 2) extends base}
	{end}

Т.к. входные параметры шаблона являются константами, то они привязку по своему названию, а не порядку.

	{template base(a = 1, b = 2)}
	{end}

	/// b = 2, a = 1
	{template child(b, a) extends base}
	{end}

В случае если дочерний шаблон исключает родительский параметр со значением по умолчанию,
то этот параметр становится простой константой внутри шаблона (которую можно переопределить).

	{template base(a = 1)}
	{end}

	/// Параметр "a" стал константой со значением a = 1
	{template child() extends base}
	{end}

Помимо исключения родительских параметров в дочернем шаблоне допускается и добавление новых.

	{template base(a = 1)}
	{end}

	{template child(b = 3, a) extends base}
	{end}

## Обработка ошибок

На этапе трансляции Snakeskin может генерировать различные исключения с информацией об ошибках
(номер строки, название файла и т.д.). После трансляции полученный текст прогоняется через eval,
который проверит правильность в синтаксисе JavaScript конструкций.

## Лицензия

The MIT License (MIT)

Copyright (c) 2014 Андрей Кобец (Kobezzza) <<kobezzza@mail.ru>>

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