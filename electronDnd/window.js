function rolled(die_type) {
    const min = 1;
    const max = die_type;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roll(input) {
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
    var rand = Math.floor(Math.random() * (die_type - 2)) + 1;
    var equation = mult.toString() + " * " + die_type.toString() + " + " + adding.toString();

    var printing = "You rolled: ";
    var rolled = [];
    for ( var i = 0; i < mult; i++ ) {
        const min = 1;
        const max = die_type;
        var outcome = Math.floor(Math.random() * (max - min + 1)) + min;
        rolled.push(outcome);
        printing += outcome.toString() + " | ";
    }
    printing = printing.substring(0, printing.length - 3);
    var total = rolled.reduce(getSum) + adding;
    var total_report = "Your total score was: " + total.toString();
    return new Promise( (resolve, reject) => {
        resolve([printing, total_report]);
    });
}

function getSum(total, num) {
    return total + num;
}


$( () => {
    $('#text-input').keypress( (event) => {
        var keycode = ( event.keyCode ? event.keyCode : event.which );
        var text = $('#text-input').val();
        if ( keycode == '13' ) {
            $('#command-output').text(text);
            $('#debug-output').text(text);
            roll(text).then( (results) => {
                $('#debug-output').text('Changed!');
                $('#rolled-output').text(results[0]);
                $('#total-output').text(results[1]);
                $('#text-input').val('');
            }).catch( (err) => {
                $('#debug-output').text(err);
            });
        }
    });
} );
