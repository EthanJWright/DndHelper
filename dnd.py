import random
import math
from pyfiglet import figlet_format
from termcolor import cprint
import os
import sys
import json
import operator

if os.path.isfile('history.json'):
    with open('history.json') as f:
        history = json.load(f)
else:
    history = {}


def printer(die_type, result):
    attrs = ['bold']

    if result == die_type:
        color = 'green'
        attrs.append('blink')
    elif result > (die_type - math.ceil(die_type * 0.2)):
        color = 'blue'
    elif result > (die_type - math.ceil(die_type * 0.5)):
        color = 'yellow'
    elif result is not 1:
        color = 'red'
    else:
        color = 'red'
        attrs.append('blink')

    cprint(figlet_format(" ".join(str(result)), font='big'), color, attrs=attrs)


char_list = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']


def rolled(die_type):
    result = random.randint(1, die_type)
    printer(die_type, result)

    return result


def print_text(text):
    cprint(figlet_format(" ".join(text), font='big'), 'white')


def print_reg(text):
    cprint(figlet_format(text, font='big'), 'white')


def advantage(user):
    print_text("Adv Bonus: ")
    adding = 0

    if ('+' in user):
        broken = user.split('+')
        adding = int(broken[-1])

    if ('-' in user):
        broken = user.split('-')
        adding = 0 - int(broken[-1])
    print_text(str(adding))
    print("---------------------------------------------------")
    outcome1 = rolled(20)
    outcome2 = rolled(20)

    if (outcome1 > outcome2):
        selected = outcome1
    else:
        selected = outcome2
    print_reg("Result was: ")
    printer(20 + adding, selected + adding)


def disadvantage(user):
    print_text("Dis Bonus: ")
    adding = 0

    if ('+' in user):
        broken = user.split('+')
        adding = int(broken[-1])

    if ('-' in user):
        broken = user.split('-')
        adding = 0 - int(broken[-1])
    print_text(str(adding))
    print("---------------------------------------------------")
    outcome1 = rolled(20)
    outcome2 = rolled(20)

    if (outcome1 < outcome2):
        selected = outcome1
    else:
        selected = outcome2
    print_reg("Result was: ")
    printer(20 + adding, selected + adding)


def print_usage():
    print("Enter dnd rolling commands: ")
    print("3d8+4")
    print("----------------------------")
    print("Or roll advantage: ")
    print("a+3 means d20 advantage roll + 3 bonus")
    print("----------------------------")
    print("Or roll disadvantage: ")
    print("d+3 means d20 disadvantage roll + 3 bonus")


def roll(user):
    os.system('cls' if os.name == 'nt' else 'clear')

    if user[0] == 'h':
        get_hist()

        return

    global history

    if user in history:
        old = history[user]
        history[user] = old + 1
    else:
        history[user] = 1

    if "help" in user or "-h" in user:
        print_usage()

        return

    if "a" in user:
        advantage(user)

        return

    if user[0] == "d":
        disadvantage(user)

        return

    print_reg("Rolling: ")
    print_text(user)
    parsing = user
    mult = 1
    adding = 0
    die_type = 20
    max_possible = 0

    if "d" in user:
        broken = user.split('d')
        mult = int(broken[0])
        parsing = ''.join(broken[1:])

    if "+" in user:
        broken = parsing.split('+')
        adding = int(broken[-1])
        parsing = broken[0]

    if "-" in user:
        broken = parsing.split('-')
        adding = 0 - int(broken[-1])
        parsing = broken[0]

    die_type = int(parsing)

    total = []

    for i in range(0, mult):
        outcome = rolled(int(die_type))
        total.append(outcome)
    max_possible = ((mult * die_type) + adding)
    final = sum(total) + adding
    print_text("Result: ")
    printer(max_possible, final)


def get_hist():
    global history
    # Sort dictionary by most used items
    history = dict(sorted(history.items(), key=operator.itemgetter(1), reverse=True))
    iterate = 1

    for key in history:
        print(str(iterate) + " : " + key)
        iterate += 1
    got_input = False

    while(not got_input):
        user = input("Select One: ")
        try:
            val = int(user)
            got_input = True
        except ValueError:
            print("Please enter a number.")
    iterate = 1

    for key in history:
        if (iterate == val):
            roll(key)
        iterate += 1

    return


while True:
    try:
        user = input("Enter a die roll: ")
        roll(user.replace(" ", ""))
    except KeyboardInterrupt:
        print("\n")
        print("Exiting the program!")
        with open('history.json', 'w') as file:
            file.write(json.dumps(history))  # use `json.loads` to do the reverse
        sys.exit(1)
