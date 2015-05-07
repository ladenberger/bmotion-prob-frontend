/* 
Three female frogs are on the three stones on the left and three male frogs are on the three stones on the right. Find a way to exchange the positions of the male and female frogs, so that the male frogs are all on the left and the females are all on the right. 

(You may first want to try it online at:http://www.hellam.net/maths2000/frogs.html)

The constraints that your solution must satisfy are as follows: 
1. Frogs can only jump in the direction they are facing. 
2. Frogs can either jump one rock forward if the next rock is empty or they can jump over a frog if the next rock has a frog on it and the rock after it is empty.
*/

MACHINE FrogPuzzle
SETS
 FROGS = {ffrog1, ffrog2, ffrog3, free, mfrog1, mfrog2, mfrog3};
 ROCKS = {rock1,rock2,rock3,rock4,rock5,rock6,rock7}
DEFINITIONS
 GOAL == (positions={1 |-> mfrog1, 2 |-> mfrog2, 3 |-> mfrog3, 4 |-> free,
               5 |-> ffrog1, 6 |-> ffrog2, 7 |-> ffrog3})
CONSTANTS FEMALE_FROGS, MALE_FROGS
PROPERTIES
 FEMALE_FROGS = {ffrog1, ffrog2, ffrog3} &
 MALE_FROGS = {mfrog1, mfrog2, mfrog3}
VARIABLES positions
INVARIANT
 positions: 1..7 >->> FROGS
INITIALISATION
 positions := {1 |-> ffrog1, 2 |-> ffrog2, 3 |-> ffrog3, 4 |-> free,
               5 |-> mfrog1, 6 |-> mfrog2, 7 |-> mfrog3}
OPERATIONS
   Move_right(x) = 
  PRE 
     x:FEMALE_FROGS & positions(positions~(x)+1) = free
  THEN
     positions := positions <+ {positions~(x) |-> free, (positions~(x)+1) |-> x}
  END;
   Move_left(x) =
  PRE 
     x:MALE_FROGS & positions(positions~(x)-1) = free
  THEN
     positions := positions <+ {positions~(x) |-> free, (positions~(x)-1) |-> x}
  END;
   Hop_right(x) = 
  PRE 
     x:FEMALE_FROGS & positions(positions~(x)+2) = free
  THEN
     positions := positions <+ {positions~(x) |-> free, (positions~(x)+2) |-> x}
  END;
   Hop_left(x) =
  PRE 
     x:MALE_FROGS & positions(positions~(x)-2) = free
  THEN
     positions := positions <+ {positions~(x) |-> free, (positions~(x)-2) |-> x}
  END
END
