modules_index

###

: bar = 5
- include './test3/base.ss'

- template modules_index() extends modules_base
	- block root
		- super
		| :
		+= bar
		| :
		- block bar
			{bar}
	- block foo
		`fffuuuu`

###

6:3:5`fffuuuu`