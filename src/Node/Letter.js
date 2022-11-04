import Generic from './Generic';

import { letterToInt } from '../quizManager';
const letters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

export default class Letter extends Generic {
  setup = async () => {
    const {
      alphabet: { letters },
    } = this.globalModels;
    console.log(letters);
    for (let i = 0; i < 35; i++) { //change 1 to 26 when all letter objects have been made
      await this._register(`${i}`, {
        ...letters[`${i}`],
        castShadow: true,
        receiveShadow: false,
      });
    }
    return this.models;
  };

   getLetter(letter) {
    let letterID = parseInt(letterToInt[letter]);
    //console.log(`letterID ${letterID}`);
    let moodel = this.models[letterID];
    return moodel.clone();
  };
}