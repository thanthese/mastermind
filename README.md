Javascript Mastermind solver. It exposes a function `solve()` that takes a code as an array of characters. For example, the code `blue blue green red` would be passed as `['b', 'b', 'g', 'r']`. Rather than being returned, the answer and all logging information is printed to the console.

Available colors are `blue`, `green`, `orange`, `purple`, `red`, `silver`, and `yellow`, each represented in the code by its first letter.

Algorithm used comes straight from [Donald Knuth][1].

[1]: http://en.wikipedia.org/wiki/Mastermind_(board_game)#Five-guess_algorithm

## Future work

If there is ever a UI need for it, make `solve()` return a JSON object with the details of the solve.
