# Snakeskin

Snakeskin — компилятор блочных шаблонов c поддержкой наследования.
Независим от среды исполнения, для работы нужен лишь интерпретатор JavaScript.

Подробная статья с описанием: http://habrahabr.ru/post/168093/

Поиграться можно тут: http://jsfiddle.net/NAPWB

## Установка

	npm install -g snakeskin

или

	git clone https://github.com/kobezzza/Snakeskin

## Общая концепция

Шаблоны в Snakeskin — это функции в JavaScript.

```js
{template foo()}
	Hello World!
{end}
```

Эквивалентно

```js
function foo() {
	return 'Hello World';
}
```

После компиляции вызов шаблона соотвествует простому вызову функции `foo()`.
Такой же подход используется в [Google Closure Templates](https://developers.google.com/closure/templates/).

### Варианты применения

Существует 2 сценария использования Snakeskin:

* Предварительная трансляция файлов Snakeskin в файлы JavaScript и подключение последних;
* "Живая" компиляция шаблонов.

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

## Области декларации шаблонов

Шаблоны можно описывать в отдельных файлах с расширением `.ss`
или же в блоках `<script type="text/x-snakeskin-template">...</script>`.
В одной области может быть объявлено неограниченное количество шаблонов.

## Синтаксис управляющих конструкций

Управляющие конструкции шаблонизатора размещаются между `{` и `}`.

## Комментарии

В любом месте области декларации шаблонов допускается использовать однострочные (`///`) и многострочные (`/* ... */`)
комментарии.

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

Директива завершает тело другой директивы, поддерживает несколько форм записей

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

## Объявления шаблона

Объявление шаблона возможно с помощью директив `template` и `placeholder`.
Шаблон может декларироваться только в глобальной области (т.е. шаблон не может включать в себя другой шаблон).

Простой шаблон без входных параметров:

	{template myTemplate()}
		Тело шаблона
	{end}

Простой шаблон без входных параметров объявленный в пространстве имён (безопасность добавления проверяется):

	{template myTpl.myTemplate()}
		Тело шаблона
	{end}

	{template myTpl['myTemplate']()}
		Тело шаблона
	{end}

Есть одно небольшое отличие в конечном коде при использовании `myTpl.myTemplate()` и `myTpl['myTemplate']()`:
в первом случае будет `myTpl.myTemplate = function myTemplate() {`, а во втором `myTpl['myTemplate'] = function () {`,
т.е. первая скомпилированная функция именованная, а вторая нет.

Шаблон с 2-мя входными параметрами, причём один из них имеет значение по умолчанию:

	{template myTemplate(a = 1, b)}
		Тело шаблона
	{end}

Шаблон, который наследует функционал другого шаблона:

	{template nextTemplate(a, b) extends myTemplate}
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

* TPL_NAME - строка, полное название шаблона (с учётом пространства имён);
* PARENT_TPL_NAME - строка, полное название родительского шаблона (с учётом пространства имён).

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

Директиву можно использовать внутри шаблонов или прототипов.
Шаблоны декларированные с помощью placeholder вызывать нельзя.

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
Директиву можно использовать только внутри шаблонов или прототипов.

	/// Блоки внутри cdata не будут обработаны парсером
	{cdata}
		{if a = 1}
		{end}
	{end cdata}

	{cdata}
		{if a = 1}
		{end}
	{/cdata}

## Вывод значений

Для вывода значений используется следующий синтаксис `{a}`.
Внутри выводимой конструкции можно использовать любой валидный JavaScript.
Вывод значений можно использовать только внутри шаблонов или прототипов.

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

Фильтры можно накладывать отдельно на некоторые части выражения, для этого нужно обернуть декларацию в круглые скобки.

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

## Переменные внутри шаблона

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
Директиву можно использовать только внутри шаблонов или прототипов.

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

## Директива void

Директива выполняет указанное действие, но ничего не выводит в шаблон.
Директиву можно использовать только внутри шаблонов или прототипов.

	{void changeDocTitle('Foobar')}

Также для директивы доступна более короткая форма записи:

	{?changeDocTitle('Foobar')}
	{?a++; b()}
	{?console.log(a)}

## Директива data

Директива схожа по функциональности с директивой cdata,
т.е. текст внутри директивы вставляется "как есть".
Директиву data можно использовать только внутри шаблонов или прототипов.

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

Данная директив создана для генерации "пометок" для библиотек организующих data-binding шаблона,
её можно использовать только внутри шаблонов или прототипов.

## Наследования шаблонов

Наследование реализовано с помощью директив block, proto и переопределении констант.
Уровень вложенности наследования не ограничен. Входные параметры шаблона наследуются в случае,
если их указать при декларации (если этого не сделать, то они просто станут локальными константами),
значение по умолчанию также наследуется.

	{template base(a = 2)}
		{e = 1}
		{proto exec}
			foo
		{end}

		<!doctype html>
		<html>
			<head>
				{block head}
					<title>
						{block title}
							{apply exec}
						{end}
					</title>
				{end}
			</head>

			{block footer}
			{end}
		</html>
	{end}

	/// Переопределим значение по умолчанию у константы a
	{template child(a = 3, l = 'my') extends base}
		 /// Переопределим константу e
		 {e = 4}
		 /// Добавим новую константу j
		 /// (добавится после всех наследуемых констант)
		 {j = 4}

		 /// Переопределим блок title
		 {block title}
			Заголовок
		 {end}

		 /// Новые блоки добавляются в конец
		 /// (кроме новых вложенных блоков)
		 {block end}
		 {end}
	{end}

## Дополнительно

Если вы транслируете шаблоны с помощью консольного приложения snakeskin, то в файлах шаблонов вы можете использовать
директивы [jossy](https://github.com/Kolyaj/Jossy) для сборки множества файлов.

## Как компилировать и что подключать

Для компиляции файла шаблонов, нужно просто запустить snakeskin: `snakeskin -s myTemplates.ss`.
Скомпилированный файл сохранится в папке с myTemplates.ss, как myTemplates.ss.js, однако можно вручную указать имя:
`snakeskin myTemplates.ss -o ../result.js`.

Флаг -cjs указывает, что скомпилированные функции должны быть декларированы, как свойства exports
`snakeskin -cjs myTemplates.ss ../result.js`.

Для работы скомпилированного шаблона, необходимо также подключить snakeskin.live.js (или snakeskin.live.min.js).
При подключении шаблонов через require (на сервере) можно воспользоваться методом liveInit, для подгрузки snakeskin.live.

	var tpl = require('./helloworld.commonjs.ss.js').liveInit('../snakeskin.live.min.js');

Или же можно просто объявить глобальную переменную Snakeskin.

	global.Snakeskin = require('../snakeskin.live.min.js');

Для live в компиляции в браузере необходимо подключать snakeskin.js (или snakeskin.min.js) и пользоваться методом
compile, который принимает ссылку на DOM узел или текст шаблонов.

Скомпилированные шаблоны вызываются как простые JavaScript функции и принимают указанные в шаблоне параметры.

## Лицензия

(The MIT License)

Copyright (c) 2014 kobezzza <<kobezzza@mail.ru>>

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