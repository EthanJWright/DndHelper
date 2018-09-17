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

function roll(input) {
		[mult, adding, die_type] = get_values(input);
		var rand = Math.floor(Math.random() * (die_type - 2)) + 1;
    var equation = mult.toString() + " * " + die_type.toString() + " + " + adding.toString();

    var printing = "You rolled: ";
    var rolled = [];
		var to_sum = [];
    for ( var i = 0; i < mult; i++ ) {
        const min = 1;
        const max = die_type;
        var outcome = Math.floor(Math.random() * (max - min + 1)) + min;
				var die_info = {
						"max" : die_type,
						"outcome" : outcome
				};
        rolled.push(die_info);
				to_sum.push(outcome);
        printing += outcome.toString() + " | ";
    }
    printing = printing.substring(0, printing.length - 3);
    var total = to_sum.reduce(getSum) + adding;
		var math_say = "";
		for ( var i = 0; i < to_sum.length; i++ ) {
				math_say += to_sum[i] + " + ";
		}
    math_say = math_say.substring(0, math_say.length - 3);
		if ( adding > 0 ) {
				math_say += " + " + adding.toString();
		}
		if ( adding < 0 ) {
				math_say += " - " + Math.abs(adding).toString();
		}
		math_say += " = " + total.toString();

    var total_report = + total.toString();
		var total_obj = {
				"max" : (mult * die_type) + adding,
				"outcome" : total
		};
    return new Promise( (resolve, reject) => {
        resolve([rolled, total_obj, math_say, printing]);
    });
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
				return 'bg-warning';
		} 
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

$( () => {
    $('#text-input').keypress( (event) => {
        var keycode = ( event.keyCode ? event.keyCode : event.which );
        var text = $('#text-input').val();
        if ( keycode == '13' ) {
						$('#die-box').empty();
						$('#total-box').empty();
            $('#command-output').text("Command: " + text);
						// $('#debug-output').text(text);
						reveal();
            roll(text).then( (results) => {
								die_results = results[0];
								for ( var i = 0; i < die_results.length; i++ ) {
										build_card(die_results[i]).then( (card) => {
												$('#die-box').append(card);
										}).catch( (err) => {
												// $('#debug-output').text(err);
										});
								}

								build_card(results[1]).then( (card) =>  {
										$('#total-box').append(card);
								}).catch( (err) => {
										// $('#debug-output').text(err);
								});

								// $('#debug-output').text('Changed!');
                $('#rolled-output').text(results[3]);
                $('#total-output').text("Total: " + results[2]);
                $('#text-input').val('');
            }).catch( (err) => {
								// $('#debug-output').text(err);
            });
        }
    });
} );
