///////////////////////////////////////////////////////////////////////////////
// node boilerplate
//
// Not technically necessary, but cloud 9 crashes without it.

var http = require("http");
http.createServer(function(req, res) {
    res.end("text");
}).listen(process.env.PORT, process.env.IP);

///////////////////////////////////////////////////////////////////////////////
// main logic

// You can change the number of colors. Six is the original standard,
// and seven is a fun addition.
// blue green purple red silver yellow additional
var COLORS = ['b', 'g', 'p', 'r', 's', 'y', 'z'];

// not strictly necessary because the computer always wins in around 5
// the original rules are for 8, 10, or 12 turns
var MAX_ATTEMPTS = 10;

function allCombinations() {
    var combos = [];
    for (var w = 0; w < COLORS.length; ++w) {
        for (var x = 0; x < COLORS.length; ++x) {
            for (var y = 0; y < COLORS.length; ++y) {
                for (var z = 0; z < COLORS.length; ++z) {
                    combos.push([COLORS[w], COLORS[x], COLORS[y], COLORS[z]]);
                }
            }
        }
    }
    return combos;
}

function getObjectValues(obj) {
    return Object.keys(obj).map(function(key) { return obj[key]; });
}

Array.prototype.clone = function() {
	return this.slice(0);
};

Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

function Pips(black, white) {
    this.black = black;
    this.white = white;
}

Pips.prototype.solved = function() {
    return this.black === 4 && this.white === 0;
};

Pips.prototype.equals = function(pips) {
    return pips.black == this.black
        && pips.white == this.white;
};

Pips.prototype.toString = function() {
    return "{black: " + this.black + ", white: " + this.white + "}";
};

Pips.prototype.toHash = function() {
    return this.black * 100 + this.white;
};

function calcPips(code, guess) {
    var c = code.clone();
    var g = guess.clone();

    var black = 0;
    for(var i = 0; i < c.length; ++i) {
        if(c[i] == g[i]) {
            black++;
            c[i] = '';
            g[i] = '';
        }
    }

    var white = 0;
    for(i = 0; i < c.length; ++i) {
        if(c[i] !== '') {
            var j = g.indexOf(c[i]);
            if(j != -1) {
                white++;
                c[i] = '';
                g[j] = '';
            }
        }
    }

    return new Pips(black, white);
}

function eliminateCandidates(candidates, guess, pips) {
    return candidates.filter(function(candidate) {
        return pips.equals(calcPips(candidate, guess));
    });
}

function prettyCandidates(candidates) {
    return candidates
        .map(prettyCandidate)
        .join(" ");
}

function prettyCandidate(candidate) {
    return candidate.join("");
}

function prettyAttempt(attemptNum, guess, pips) {
    return attemptNum + ". " + prettyCandidate(guess) + ": " + pips.toString();
}

function nextGuess(candidates) {
    if(candidates.length <= 2) {
        return candidates[0];
    }
    var guesses = allCombinations();
    var lowest = {guess: guesses[0], score: 1000000};
    for(var i = 0; i < guesses.length; ++i) {
        var guess = guesses[i];
        var score = calcGuessScore(candidates, guess);
        if(score < lowest.score) {
            lowest.score = score;
            lowest.guess = guess;
        }
    }
    return lowest.guess;
}

function calcGuessScore(candidates, guess) {
    var pipsCounts = {};
    for(var i = 0; i < candidates.length; ++i) {
        var pipHash = calcPips(candidates[i], guess).toHash();
        if(!(pipHash in pipsCounts)) {
            pipsCounts[pipHash] = 0;
        }
        pipsCounts[pipHash]++;
    }
    return getObjectValues(pipsCounts).max();
}

function solve(answer) {
    console.log("----------------------------------------------");
    var candidates = allCombinations();
    var guess = nextGuess(candidates);
    var pips = calcPips(answer, guess);
    console.log(prettyAttempt(1, guess, pips));

    for(var i = 0; i < MAX_ATTEMPTS - 1 && !pips.solved(); ++i) {
        candidates = eliminateCandidates(candidates, guess, pips);
        if(candidates.length < 20) {
            console.log("(" + prettyCandidates(candidates) + ") " + candidates.length);
        } else {
            console.log("Num of candidates: " + candidates.length);
        }
        guess = nextGuess(candidates);
        pips = calcPips(answer, guess);
        console.log(prettyAttempt(i + 2, guess, pips));
    }

    console.log("---");
    if(pips.solved()) {
        console.log("Solved! Answer: " + prettyCandidate(guess));
    } else {
        console.log("Failed.");
    }
}

///////////////////////////////////////////////////////////////////////////////
// tests

// Example of every pip combination.
// Note that {black:3, white:1} isn't possible.
var pipTestCases = [
    [['b', 'b', 'b', 'b'], ['g', 'g', 'g', 'g'], new Pips(0, 0)],
    [['b', 'b', 'b', 'g'], ['g', 'g', 'g', 'y'], new Pips(0, 1)],
    [['g', 'g', 'b', 'b'], ['y', 'y', 'g', 'g'], new Pips(0, 2)],
    [['b', 'r', 'y', 'g'], ['r', 'b', 'g', 's'], new Pips(0, 3)],
    [['b', 'r', 'y', 'g'], ['g', 'b', 'r', 'y'], new Pips(0, 4)],
    [['b', 'b', 'b', 'b'], ['b', 'g', 'g', 'g'], new Pips(1, 0)],
    [['b', 'b', 'b', 'y'], ['b', 'y', 'r', 'r'], new Pips(1, 1)],
    [['b', 'b', 'r', 'y'], ['b', 'r', 'y', 's'], new Pips(1, 2)],
    [['b', 'r', 's', 'y'], ['r', 's', 'b', 'y'], new Pips(1, 3)],
    [['b', 'b', 'b', 'b'], ['b', 'b', 'g', 'g'], new Pips(2, 0)],
    [['b', 'b', 'b', 'g'], ['b', 'b', 'g', 'y'], new Pips(2, 1)],
    [['b', 'b', 'r', 'y'], ['b', 'b', 'y', 'r'], new Pips(2, 2)],
    [['b', 'b', 'b', 's'], ['b', 'b', 'b', 'y'], new Pips(3, 0)],
    [['b', 'r', 'y', 's'], ['b', 'r', 'y', 's'], new Pips(4, 0)]];

function testPipCases(cases) {
    console.log("Test pip cases.");
    var right = 0;
    var wrong = 0;
    for(var i = 0; i < cases.length; ++i) {
        var code = cases[i][0];
        var guess = cases[i][1];
        var expectedPips = cases[i][2];
        var actualPips = calcPips(code, guess);
        if(expectedPips.equals(actualPips)) {
            right++;
        } else {
            wrong++;
            console.log(code + ", " + guess + ", " + actualPips.toString());
        }
    }
    console.log("Correct: " + right + ", Wrong: " + wrong);
}

function runAllTests() {
    testPipCases(pipTestCases);
}

///////////////////////////////////////////////////////////////////////////////
// main

console.time("Solve time");

// solve(['b', 'b', 's', 'b']);
// solve(['g', 'r', 'y', 'b']);
// solve(['r', 'y', 'p', 'r']);
// solve(['s', 'p', 's', 'r']);
// solve(['p', 'r', 'y', 's']);
// solve(['y', 'y', 'y', 'y']);
// solve(['s', 'y', 's', 'y']);
solve(['b', 'p', 'g', 'z']);

console.timeEnd("Solve time");