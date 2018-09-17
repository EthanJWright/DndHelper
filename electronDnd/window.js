var main_dom,
		hist_dom;

$( document ).ready( () => {
		hide();
});

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
        report += " - " + Math.absolute(adding.toString());
    }
    report += " = " + total.toString();
    add_total_text(report);
    add_total_card({
        "outcome" : rolls.reduce(getSum) + adding,
        "max" : (mult * die_type) + adding
    });
}

function roll(input) {
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
		else if ( result > ( max - Math.ceil(max * 0.2) ) ) {
				return 'bg-primary';
		} 
		else if ( result > ( max - Math.ceil(max * 0.5) ) ) {
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

function hide() {
		[].forEach.call(document.querySelectorAll('.result-header'), function (res) {
				  res.style.visibility = 'hidden';

		});
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

$( () => {
    $('#text-input').keypress( (event) => {
        var keycode = ( event.keyCode ? event.keyCode : event.which );
        var text = $('#text-input').val();
        if ( keycode == '13' ) {
            $('#die-box').empty();
            $('#total-box').empty();
            $('#command-output').text("Command: " + text);
			reveal();
            roll(text);
			$('#text-input').val('');
        }
    });
} );
