import { Object3D } from 'three';

import ModelLoader from '../../src/ModelLoader';
import { groundLevel, startingRow } from '../GameSettings';

import { questionType, currentLetterIndex, increaseCLI, getCurrentLetter, resetProgress} from '../quizManager';
import Score from '../../components/ScoreText';

export const Fill = {
  empty: 'empty',
  solid: 'solid',
  random: 'random',
};

const HAS_WALLS = true;
const HAS_OBSTACLES = true;
const HAS_VARIETY = true;
const HAS_LETTERS = true;

export default class Grass extends Object3D {
  active = false;
  entities = [];

  top = 0.4;
  /*

* Build Walls

* Random Fill Center
* Solid Fill Center
* Empty Fill Center


*/

  removeMesh(mesh) {
    this.floor.remove(mesh);
  };

  completelyRemoveMesh(){
    this.letterMap = {};
  };

  generate = (type = Fill.random) => {
    this.entities.map(val => {
      this.floor.remove(val.mesh);
      val = null;
    });
    this.entities = [];
    this.obstacleMap = {};
    this.letterMap = {};
    this.treeGen(type);
  };

  obstacleMap = {};
  letterMap = {};
  addObstacle = x => {
    let mesh; //  IMPORTANT OBJECT SPAWNING LOCATION
    if (HAS_VARIETY) {
      mesh =
        Math.random() < 0.4
          ? ModelLoader._boulder.getRandom()
          : ModelLoader._tree.getRandom();
    } else {
      mesh = ModelLoader._tree.getRandom();
    }
    this.obstacleMap[`${x | 0}`] = { index: this.entities.length };
    this.entities.push({ mesh });
    this.floor.add(mesh);
    mesh.position.set(x, groundLevel, 0);
  };

  spawnLetter = (letter,x) => {
    let mesh; //  IMPORTANT OBJECT SPAWNING LOCATION
    mesh = ModelLoader._letter.getLetter(letter);
    this.letterMap[`${x | 0}` ]= { index: [letter, mesh] };
    this.entities.push({ mesh });
    this.floor.add(mesh);
    mesh.position.set(x, groundLevel, 0);
    increaseCLI(1);
  };

  treeGen = type => {
    // 0 - 8
    var usedSlots = [];;
    let _rowCount = 0;
    const count = Math.round(Math.random() * 2) + 1;
    for (let x = -3; x < 12; x++) {
      const _x = x - 4;
      
      if (type === Fill.solid) {
        this.addObstacle(_x);
        //usedSlots.push(_x);
        continue;
      }

      if (HAS_WALLS) {
        /// Walls
        if (x >= 9 || x <= -1) {
          this.addObstacle(_x);
          usedSlots.push(_x);
          continue;
        }
      }

      if (HAS_OBSTACLES) {
        if (_rowCount < count) {
          if (_x !== 0 && Math.random() > 0.6) {
            this.addObstacle(_x);
            usedSlots.push(_x);
            _rowCount++;
          }
        }
      }  
    }
    console.log(_rowCount);
    if (HAS_LETTERS && this.position.z > startingRow+1) {
      var spawnLocation = Math.floor(Math.random() * 12)+-7;
      if (usedSlots.includes(spawnLocation)) { 
        console.log();
      }else{
        let odds = Math.random();
        console.log(odds);
        if (spawnLocation !== 0 && odds > 0.2) {
          let letter = getCurrentLetter();
          if (letter != " " && letter != -1){
            console.log(letter);
            console.log(this.position);
            this.spawnLetter(letter,spawnLocation);
            
          }/*else if (letter == -1 && questionType == "multipleChoice"){
            resetProgress();
          }*/
      }}
    }
  };

  constructor(heroWidth, onCollide) {
    super();
    this.onCollide = onCollide;
    const { _grass } = ModelLoader;

    this.floor = _grass.getNode();
    this.add(this.floor);
  }
}
