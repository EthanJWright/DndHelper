# D&D CLI Rolling Utility

Examples of interactions:
```
# Choose command based on history, sorted by most used
h

# Roll 2 d6 dice and add a bonus of 3
2d6+3

# Roll a normal d20
20

# d20 plus bonus
20+3

# Roll with advantage and a bonus of 2
a+2

# Roll with disadvantage and a bonus of -1
d-1
```

### Setup
```
# clone the repository
git clone https://github.com/EthanJWright/DndHelper.git ~/dndhelper

# install the requirements
cd ~/dndhelper
pip3 install -r requirements.txt
```

### Features
Features of CLI:

* Flashing output when crit miss or hit
* 4 grades of roll ( green, blue, yellow, red )
* History saved to disk for quick rolling
* Advantage / Disadvantage utility


### Notes
* To clear the history, delete the `history.json` file in the folder and
    restart the program.
