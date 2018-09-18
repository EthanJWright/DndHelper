var main_dom,
    hist_dom,
    fs = require('fs');


const electron = require('electron');
var macro_file = macro_file = get_path("macros.json");
var hist_file = hist_file = get_path("history.json");

var macros = load_macros();

function delete_history() {
    history = {};
    saveHist({});
}

function delete_macro() {
		macros = {};
		save_macro({});
}

function getSorted(history) {
    var sortable = [];
    for ( var key in history ) {
        sortable.push([key, history[key]]);
    }
    sortable.sort((a,b) => {
        return a[1] - b[1];
    });
    return sortable;
}

function getHist() {
    return new Promise ( (resolve, reject) => {
        if ( fs.existsSync(hist_file) ) {
            var history = JSON.parse(fs.readFileSync(hist_file, 'utf8'));
            var new_hist = {};
            var sortable = getSorted(history);
            for (var i = sortable.length-1; i >= 0; i--) {
                new_hist[sortable[i][0]] = sortable[i][1];
            }
            resolve(new_hist);
        }
        resolve({});
    });

}

function saveHist(history) {
    fs.writeFileSync(hist_file, JSON.stringify(history), {encoding: 'utf8',flag:'w'});
}

function get_path(file) {
    const userDataPath = (electron.app || electron.remote.app).getPath('appData');
    return userDataPath + file;
}

function load_macros() {
    if (fs.existsSync(macro_file)) {
        return JSON.parse(fs.readFileSync(macro_file, 'utf8'));
    } else {
        return {};
    }
    
}

function save_macro(macros) {
    fs.writeFileSync(macro_file,JSON.stringify(macros),{encoding:'utf8',flag:'w'});
}

function rolled(die_type) {
    const min = 1;
    const max = die_type;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function get_values(input) {


		var mult = 1;
    var adding = 0;
    var die_type = 20;
    var parsing = input;
    if ( input.indexOf('d') > -1 ) {
        var broken = parsing.split('d');
        mult = parseInt(broken[0]);
        broken.shift();
        parsing = broken.join();
    }

    if ( input.indexOf('+') > -1 ) {
        broken = parsing.split('+');
        adding = parseInt(broken.slice(-1).pop());
        parsing = broken.join();
    }
    if ( input.indexOf('-') > -1 ) {
        broken = parsing.split('-');
        adding = 0 - parseInt(broken.slice(-1).pop());
        parsing = broken.join();
    }
    die_type = parseInt(parsing);	
		return [mult, adding, die_type];
}

function displayRolls(rolls) {
    var printing = "You rolled: ";
    for (var i = 0; i < rolls.length; i++) {
        printing += rolls[i].toString() + " | ";
    }
    printing = printing.substring(0, printing.length - 3);
    add_roll_info(printing);
}

function printTotal(mult, rolls, adding, die_type, total) {
    var report = "";
    for ( var i = 0; i <  rolls.length; i++) {
        report += rolls[i] + " + ";
    }
    // Remove extra + at end
    report = report.substring(0, report.length - 3);
    if ( adding > 0 ) {
        report += " + " + adding.toString();
    }
    if ( adding < 0  ) {
        report += " - " + Math.abs(adding.toString());
    }
    report += " = " + total.toString();
    add_total_text(report);
    add_total_card({
        "outcome" : rolls.reduce(getSum) + adding,
        "max" : (mult * die_type) + adding
    });
}

function printer(text) {
    $('#command-output').text(text);
}

function add_history(adding) {
    getHist().then( (history) => {
        if ( history.hasOwnProperty(adding) ) {
            history[adding] = history[adding] + 1;
        } else {
            var sorted = getSorted(history);
            while ( sorted.length > 7 ) {
                delete history[sorted[0][0]];
                var sorted = getSorted(history);
            }
            history[adding] = 1;
        }
        saveHist(history);
    }).catch( (err) => {
        printer(err);
    });
}

function runHist(input) {
    var split = input.split(":");
    index = split[1];
    getHist().then( (history) => {
        var counter = 1;
        for ( var key in history ) {
            if ( counter == index ) {
                router(key);
            }
            counter++;
        }
    });
}

function new_macro(input) {
    var broken = input.split("=");
    macros[broken[0]] = broken[1];

    $('#command-output').text("Saved macro: " + broken[0] + " | " + broken[1]);
    $('#rolled-output').text("");
    $('#total-output').text("");
    save_macro(macros);
}

function is_macro(input) {
    if ( macros.hasOwnProperty(input) ) {
        return true;
    } 
    return false;
}

function handle_macro(input) {
    const macro = macros[input];
    $('#command-output').text("Macro used: " + macro);
    roll(macro);
}

function router(input) {
    onAction(input);
    if ( input.indexOf("h:") > -1 ) {
        runHist(input);
        return;
    }
    if ( input.indexOf("?") > -1 || input.indexOf("help") > -1) {
        hide();
        show_help();
        return;
    }

    if ( input.indexOf("hist") > -1 ) {
        hide();
        show_history();
        return;
    }

    if ( input.indexOf("clear") > -1 ) {
				if ( input.indexOf("macro") > -1 ) {
						delete_macro();
				} else {
						delete_history();
				}
        return;
    }
		if ( input.indexOf("macro") > -1 ) {
				hide();
				show_macros();
				return;
		}

    if ( input.indexOf("=") > -1 ) {
        new_macro(input);
        return;
    }

    add_history(input);

    if ( is_macro(input) ) {
        handle_macro(input);
        return;
    }


    if ( input[0] == "a" ) {
        special(input, true);
    } 
    else if ( input[0] == "d" ) {
        special(input, false);
    }
    else {
        roll(input);
    }
}

function get_adding(input) {
    if ( input.indexOf("+") > -1 ) {
        var broken = input.split("+");
        return parseInt(broken[broken.length - 1]);
    }
    if ( input.indexOf("-") > -1 ) {
        var broken = input.split("-");
        return 0 - parseInt(broken[broken.length - 1]);
    }
    return 0;
}

function special(input, advantage) {
    var mult = 1,
        adding = get_adding(input),
        die_type = 20;
    const outcome1 = Math.floor(Math.random() * (die_type)) + 1;
    const outcome2 = Math.floor(Math.random() * (die_type)) + 1;
    add_card({
        "max" : die_type,
        "outcome" : outcome1
    });

    add_card({
        "max" : die_type,
        "outcome" : outcome2
    });

    var final = outcome2;
    if ( advantage ) {

				$('#command-output').text("Advantage " + input.slice(1));
        if ( outcome1 > outcome2 ) {
            final = outcome1;
        }
    } else {
				$('#command-output').text("Disadvantage " + input.slice(1));
        if ( outcome1 < outcome2 ) {
            final = outcome1;
        }
    }

    rolls = [outcome1, outcome2];
    displayRolls(rolls);
    var total_string = "Total: " + final.toString();
    if ( adding > 0 ) {
        total_string += " + " + adding;
    } 
    if ( adding < 0 ) {
        total_string += " - " + Math.abs(adding);
    }

    $('#total-output').text(total_string);
    add_total_card({
        "outcome" : final + adding,
        "max" : 20 + adding
    });
}

function roll(input) {
    input = input.split(' ').join('');
    [mult, adding, die_type] = get_values(input);
	var rolls = [];
    for ( var i = 0; i < mult; i++ ) {
        var outcome = Math.floor(Math.random() * (die_type)) + 1;
        add_card({ "max" : die_type, "outcome" : outcome });
		rolls.push(outcome);
    }
    displayRolls(rolls);

    var total = rolls.reduce(getSum) + adding;

    printTotal(mult, rolls, adding, die_type, total);
}

function getSum(total, num) {
    return total + num;
}

function categorize(result, max) {
		if ( result == max ) {
				return 'bg-success';
		}
		else if ( result > ( max - Math.ceil(max * 0.3) ) ) {
				return 'bg-info';
		} 
		else if ( result != 1 ) {
				return 'bg-warning'; } 
		else {
				return 'bg-danger';
		}
}

function build_card(die_info) {
		var result = die_info["outcome"];
		var type = die_info["max"];
		var card_type = categorize(result, type);
		var card = '<div class="card ' + card_type + '"><div class="card-body text-center"><p class="card-text">' + result + '</div></div>';
		return new Promise( (resolve, reject) => {
				resolve(card);
		});
}

function build_hist_card(text) {
    return new Promise( (resolve, reject) => {
        var card = '<div class="info card bg-info my-4"><div class="card-body text-center"><p class="card-text">' + text + '</div></div>';
        resolve(card);
    });
}

function show_macros() {
		var counter = 1;
		for ( var key in macros ) {
				var first = "        ";
				first = first.slice(key.length);
				var key_buff = key + first;
				var message = key_buff + "|   " + macros[key];
				build_hist_card(message).then( (card) => {
						$('#hist-deck').append(card);
				});
		}
}

const help = {
    "Examples" : " the following are examples of commands and what they do.",
    "macro" : "Show a list of all macros",
    "gs=2d6+5" : "Save macro gs as 2d6+5",
    "a+1" : "roll advantage with +1",
    "d-2" : "roll disadvantage with -2",
    "history" : "Show most used commands throughout history"
};

function show_help() {
    for ( var key in help ) {
        var message = key + " | " + help[key];
        build_hist_card(message).then( (card) => {
                $('#hist-deck').append(card);
        });
    }
}

function show_history() {
    var counter = 1;
    getHist().then( (history) => {
        for ( var key in history ) {
            var message = counter.toString() + "   |   " + key;
            counter++;
            build_hist_card(message).then( (card) => {
                $('#hist-deck').append(card);
            });
        }
    });
}

function clear_history() {
    $('#hist-deck').empty();
}

function hide() {
        $('#die-box').empty();
        $('#total-box').empty();
        $('#command-output').text("");
        $('#rolled-output').text("");
        $('#total-output').text("");
}

function reveal() {
		[].forEach.call(document.querySelectorAll('.result-header'), function (res) {
				  res.style.visibility = 'visible';

		});
}

function add_card(info) {
    build_card(info).then( (card) => {
        $('#die-box').append(card);
    }).catch( (err) => {
    });
}

function add_total_card(info) {
    build_card(info).then( (card) => {
        $('#total-box').append(card);
    }).catch( (err) => {
    });
}

function add_total_text(text) {
    $('#total-output').text("Total: " + text);
}

function add_roll_info(text) {
    $('#rolled-output').text(text);
}

function onAction(text) {
    clear_history();
    $('#die-box').empty();
    $('#total-box').empty();
    $('#command-output').text("Command: " + text);
    reveal();
    $('#text-input').val('');   
}

$( () => {
    $('#text-input').keypress( (event) => {
        var keycode = ( event.keyCode ? event.keyCode : event.which );
        var text = $('#text-input').val();
        if ( keycode == '13' ) {
            router(text);
        }
    });
} );
