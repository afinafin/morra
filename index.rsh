'reach 0.1';

const [gameOutcome, A_WINS, B_WINS, DRAW] = makeEnum(3);

//function that computes the winner based on hands and guesses
const winner = (playHandA, playHandB, gHandA, gHandB) => {
  if(gHandA == gHandB) {
    return DRAW;
  } 
  else {
    //first player guess == both hands played
    if ((gHandA == (playHandA + playHandB))) {
      return A_WINS;
    }
    else {
      //second player guess == both hands played
      if( (gHandB == (playHandA + playHandB))) {
        return B_WINS;
      } else {
        return DRAW;
      }
    }
  }
};

assert(winner(0, 2, 0, 2) == B_WINS);
assert(winner(2, 0, 2, 0) == A_WINS);
assert(winner(0, 1, 0, 2) == DRAW);
assert(winner(1, 1, 1, 1) == DRAW);

forall(UInt, playHandA =>
  forall(UInt, playHandB =>
    forall(UInt, gHandA =>
      forall(UInt, gHandB =>
        assert(gameOutcome(winner(playHandA, playHandB, gHandA, gHandB)))))));

forall(UInt, playHandA =>
  forall(UInt, playHandB =>
    forall(UInt, same =>
      assert(winner(playHandA, playHandB , same, same) == DRAW ))));

const Shared = {
  ...hasRandom,
  getHand: Fun([], UInt),
  getGuess: Fun([UInt], UInt),
  actualResult: Fun([UInt], Null),
  seeOutcome: Fun([UInt], Null),
  informTimeout: Fun([], Null),
};

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    ...Shared,
    wager: UInt,
    deadline: UInt,
  });
  const Bob = Participant('Bob', {
    ...Shared,
    acceptWager: Fun([UInt], Null),
  });
  // const DEADLINE = 30; 

  init();

  const informTimeout = () => {
    each([Alice,Bob], ()=> {
      interact.informTimeout();
    });
  };

  Alice.only(() => {
    const amt = declassify(interact.wager);
    const time = declassify(interact.deadline);
  });
  
  Alice.publish(amt, time)
    .pay(amt);
  commit();

  Bob.interact.acceptWager(amt);
  Bob.pay(amt)
    .timeout(relativeTime(time), () => closeTo(Alice, informTimeout));

  var outcome = DRAW;
  invariant(balance() == 2 * amt && gameOutcome(outcome));
  while(outcome == DRAW){
    commit();

    Alice.only(() => {
      const _playHandA = interact.getHand();
      const _gHandA = interact.getGuess(_playHandA);
      const [_commitHandA, _saltHandA] = makeCommitment(interact,_playHandA)
      const commitHandA = declassify(_commitHandA);
      const [_commitGuessA, _saltGuessA] = makeCommitment(interact, _gHandA);
      const commitGuessA = declassify(_commitGuessA);
    });

    Alice.publish(commitHandA, commitGuessA)
      .timeout(relativeTime(time), () => closeTo(Bob, informTimeout));
    commit();

    unknowable(Bob,Alice(_playHandA, _saltHandA));
    unknowable(Bob,Alice(_gHandA,_saltGuessA));

    Bob.only(() => {
      const _playHandB = interact.getHand();
      const _gHandB = interact.getGuess(_playHandB);
      const playHandB = declassify(_playHandB);
      const gHandB = declassify(_gHandB);
    });

    Bob.publish(playHandB)
      .timeout(relativeTime(time), () => closeTo(Alice, informTimeout));
    commit();

    Bob.publish(gHandB)
    .timeout(relativeTime(time), () => closeTo(Alice, informTimeout));
    commit();

    Alice.only(() => {
      const [saltHandA, playHandA] = declassify([_saltHandA, _playHandA]);
      const [saltGuessA, gHandA] = declassify([_saltGuessA, _gHandA]);
    });

    Alice.publish(saltHandA, playHandA)
      .timeout(relativeTime(time), () => closeTo(Bob, informTimeout));
    checkCommitment(commitHandA, saltHandA, playHandA);
    commit();

    Alice.publish(saltGuessA, gHandA)
      .timeout(relativeTime(time), () => closeTo(Bob, informTimeout));
    checkCommitment(commitGuessA, saltGuessA, gHandA);

    const totalResult = playHandA+playHandB;

    each([Alice, Bob], () => {
      interact.actualResult(totalResult);
    });

    // Alice.only(() => {
    //   const totalResult = playHandA+playHandB;
    //   interact.actualResult(totalResult);
    // });

    // Alice.publish(totalResult)
    //   .timeout(relativeTime(time), () => closeTo(Alice, informTimeout));

    outcome = winner(playHandA, playHandB, gHandA, gHandB);
    continue;
  } //end loop

  assert(outcome == A_WINS || outcome == B_WINS);
  transfer(2 * amt).to(outcome == A_WINS ? Alice : Bob);
  commit();

  each([Alice,Bob], () => {
    interact.seeOutcome(outcome);
  });
  exit();
});
