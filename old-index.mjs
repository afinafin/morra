import {loadStdlib, ask} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const isAlice = await ask.ask(
  `Are you Alice?`,
  ask.yesno
);

const who = isAlice ? 'Alice' : 'Bob';

console.log(`Starting Morra Game! as ${who}`);

let acc = null;
const createAcc = await ask.ask(
  `Would you like to create new account?`,
  ask.yesno
);
if(createAcc){
  acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000)); 
} else {
  const secret = await ask.ask(
  `What is your account secret? `,
  (x => x)
  );
  acc = await stdlib.newAccountFromSecret(secret);
};

let ctc = null;
if(isAlice){
  ctc = acc.contract(backend);
  ctc.getInfo().then((info) => {
    console.log(`The contract is deployed as = ${JSON.stringify(info)}`);
  });
} else {
  const info = await ask.ask(
    `Please paste the contract information:`,
    JSON.parse
  );
  ctc = acc.contract(backend,info);
}

const fmt = (x) => stdlib.formatCurrency(x,4); //up to 4 decimals
const getBalance = async () => fmt(await stdlib.balanceOf(acc));
const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = { ...stdlib.hasRandom };

interact.informTimeout = () => {
  console.log(`There was a timeout.`);
  process.exit(1);
};

if(isAlice) {
  const amt = await ask.ask(
    `How much do you want to wager?`,
    stdlib.parseCurrency 
  );
  interact.wager = amt;
  interact.deadline = { ETH:10, ALGO: 100, CFX: 1000 }[stdlib.connector];
} else {
  interact.acceptWager = async (amt) => {
    const accepted = await ask.ask(
      `Do you accept the wager of ${fmt(amt)}?`,
      ask.yesno
    );
    if(!accepted){
      process.exit(0);
    }
  };
}


const HAND = [0, 1, 2, 3, 4, 5];
const GUESS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];

interact.getHand = async () => {
  const hand = await ask.ask(`What number will u choose? (0-5)`, (x) => {
    const hand = HAND[x];
    if(hand === undefined){
      throw Error(`Not a valid number ${hand}`);
    }
    return hand;
  });
  console.log(`You played ${HAND[hand]}`);
  return hand;
};

interact.getGuess = async (what) => {
  const guess = await ask.ask(`What is your guess? (0-10)`, (y) => {
    const guess = GUESS[y];
    if(guess === undefined){
      throw Error(`Not a valid number ${guess}`);
    }
    return guess;
  });
  console.log(`You guessed ${GUESS[guess]}`);
  return guess;
};

interact.actualResult = async (total) => {
  console.log(`The result (Alice+Bob) : ${GUESS[total]}`);
  console.log(`------------------------------`)
};

const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
interact.seeOutcome = async (outcome) => {
  console.log(`The outcome is: ${OUTCOME[outcome]}`);
};

const part = isAlice ? ctc.p.Alice : ctc.p.Bob;
await part(interact);

const after = await getBalance();
console.log(`Your balance is now ${after}`);

ask.done(); 
