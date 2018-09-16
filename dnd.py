import random
import math
from pyfiglet import figlet_format
from termcolor import cprint
import os
import sys
import json
import operator

initiative = {}


def load():
    global history

    if os.path.isfile('history.json'):
        with open('history.json') as f:
            history = json.load(f)


class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[32m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    YELLOW = '\033[33m'


def is_linux():
    if sys.platform == "linux":
        return True

    return False


def printer(die_type, result):
    if not is_linux():
        green = bcolors.OKGREEN
        blue = bcolors.HEADER
        yellow = bcolors.YELLOW
        red = bcolors.FAIL
        fail = bcolors.FAIL + bcolors.BOLD
    else:
        green = 'green'
        blue = 'blue'
        yellow = 'yellow'
        red = 'red'
        fail = 'red'
    attrs = ['bold']

    if result == die_type:
        color = green
        attrs.append('blink')
    elif result > (die_type - math.ceil(die_type * 0.2)):
        color = blue
    elif result > (die_type - math.ceil(die_type * 0.5)):
        color = yellow
    elif result is not 1:
        color = red
    else:
        color = fail
        attrs.append('blink')

    if not is_linux():
        print(color + figlet_format(" ".join(str(result)), font='big') + bcolors.ENDC)
    else:
        cprint(figlet_format(" ".join(str(result)),
                             font='big'), color, attrs=attrs)


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


def roll_initiative():
    global initiative
    print_text("Initiative: ")
    print_text(str(initiative["value"]))
    print("---------------------------------------------------")
    outcome = rolled(20)
    print_reg("Result was: ")
    printer(20+initiative["value"], outcome + initiative["value"])


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

    if user[0] == "i":
        roll_initiative()

        return

    global history

    if user in history:
        old = history[user]
        history[user] = old + 1
    else:
        # Keep dictionary to 15 items

        if len(history.keys()) >= 15:
            small_tup = min(history.items(), key=lambda x: x[1])
            del history[small_tup[0]]
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


def save():
    global history
    with open('history.json', 'w') as file:
            # use `json.loads` to do the reverse
        file.write(json.dumps(history))


def get_user_init():
    while True:
        user = input("Enter new initiative bonus: ")
        try:
            init = int(user)
            print("New initiative bonus is: " + str(init))
            user = input("Is this correct? (y/n) | ")

            if user == "y":
                return init
        except ValueError:
            print("Please enter a number.")
        except KeyboardInterrupt:
            exit()


def load_initiative():
    global initiative

    if os.path.isfile('initiative.json'):
        with open('initiative.json') as f:
            initiative = json.load(f)

        try:
            user = input("Current initiative bonus is: " +
                         str(initiative["value"]) + " is this correct? (y/n) | ")
        except KeyboardInterrupt:
            exit()

        if user is not "y":
            initiative["value"] = get_user_init()
    else:
        initiative["value"] = get_user_init()

    with open('initiative.json', 'w') as file:
                # use `json.loads` to do the reverse
        file.write(json.dumps(initiative))


def get_hist():
    global history
    # Sort dictionary by most used items
    history = dict(
        sorted(history.items(), key=operator.itemgetter(1), reverse=True))
    iterate = 1

    for key in history:
        print(str(iterate) + " : " + key)
        iterate += 1
    got_input = False

    while(not got_input):
        user = input("Select One: ")
        try:
            if("c" in user or "C" in user):
                print("Treating as cancel")

                return
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


def exit():
    save()
    print("\n")
    print("Exiting the program!")
    sys.exit(1)


def main():
    global history
    history = {}
    load_initiative()
    load()

    while True:
        try:
            user = input("Enter a die roll: ")
            roll(user.replace(" ", ""))
        except KeyboardInterrupt:
            exit()


if __name__ == "__main__":
    main()
