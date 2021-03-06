// not strictly necessary because the computer always wins in around 5
// the original rules are for 8, 10, or 12 turns
var MAX_ATTEMPTS = 10;

// You can change the number of colors. Six is the original standard,
// and seven is a fun addition.
var COLORS = ['b', 'd', 'g', 'l', 'p', 'r', 'y'];

// number of pegs to guess
var SLOTS = 6;

// return all combinations of COLORS for the number of SLOTS
function allCombinations() {
  var all = [[]];
  for(var s = 0; s < SLOTS; ++s) {
    var next = [];
    for(var c = 0; c < COLORS.length; ++c) {
      for(var a = 0; a < all.length; ++a) {
        next.push(all[a].concat(COLORS[c]));
      }
    }
    all = next;
  }
  return all;
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
    return this.black === SLOTS && this.white === 0;
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
        var score = _calcGuessScore(candidates, guess);
        if(score < lowest.score) {
            lowest.score = score;
            lowest.guess = guess;
        }
    }
    return lowest.guess;
}

function _calcGuessScore(candidates, guess) {
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
            console.log("(" + prettyCandidates(candidates) + ") "
                + candidates.length);
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

function timeSolve(answer) {
    console.time("Solve time");
    solve(answer);
    console.timeEnd("Solve time");
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
// calc user's pips

// calc something like this from stdin
//   > node mastermind.js bbbrgd rrrrgb

function calcUsersPips() {
  var code = process.argv[2].split('');
  var guess = process.argv[3].split('');

  if(code.length != guess.length) {
    console.log("Code and guess not same length!");
    return;
  }

  console.log(calcPips(code, guess));
}

///////////////////////////////////////////////////////////////////////////////
// main

// timeSolve(['b', 'b', 's', 'b']);
// timeSolve(['g', 'r', 'y', 'b']);
// timeSolve(['r', 'y', 'p', 'r']);
// timeSolve(['s', 'p', 's', 'r']);
// timeSolve(['p', 'r', 'y', 's']);
// timeSolve(['y', 'y', 'y', 'y']);
// timeSolve(['s', 'y', 's', 'y']);
// timeSolve(['b', 'p', 'g', 'o']);
// timeSolve(['g', 'r', 's', 'y']);

calcUsersPips()
