import { GLView } from "expo-gl";
import React, { Component } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Vibration,
  View,
  useColorScheme,
  Text,
} from "react-native";

import GestureRecognizer, { swipeDirections } from "../components/GestureView";
import Score from "../components/ScoreText";
import Engine from "../src/GameEngine";
import State from "../src/state";
import GameOverScreen from "./GameOverScreen";
import HomeScreen from "./HomeScreen";
import SettingsScreen from "./SettingsScreen";
import GameContext from "../context/GameContext";
import Banner from "../components/GameOver/Banner";

import { globalVars } from "../src/GlobalVars";
import { getCurrentQuestionAnswers, getAnswerAtID, getCurrentQuestion, question, answersVisible, setAnswersVisible, decreaseScore, setLetterDetected, letMeRender } from "../src/quizManager";
import Images from "../src/Images";
import Lives from "../components/LivesText";

var menuButtons = [Images.button.menu,Images.button.menu_flip];
var currentMenuButton = 0;

function increaseMenuButton(){
  if (currentMenuButton+1 >= menuButtons.length){
    currentMenuButton = 0;
  }else {currentMenuButton+=1;}
}

function getTextWidth(text){
  let widthConstant = 27;
  let length = widthConstant*text.length
  return length;
}

//dw bout this... had to copy it from ScoreText.js but its fine
function generateTextShadow(width) {
  return  Platform.select({ web: {
    textShadow: `-${width}px 0px 0px #000, ${width}px 0px 0px #000, 0px -${width}px 0px #000, 0px ${width}px 0px #000`
  }, default: {} });
} 
const textShadow = generateTextShadow(4)

const DEBUG_CAMERA_CONTROLS = false;
class Game extends Component {
  /// Reserve State for UI related updates...
  state = {
    ready: false,
    score: 0,
    viewKey: 0,
    gameState: State.Game.none,
    showSettings: false,
    // gameState: State.Game.gameOver
  };

  transitionScreensValue = new Animated.Value(1);

  UNSAFE_componentWillReceiveProps(nextProps, nextState) {
    if (nextState.gameState && nextState.gameState !== this.state.gameState) {
      this.updateWithGameState(nextState.gameState, this.state.gameState);
    }
    if (this.engine && nextProps.character !== this.props.character) {
      this.engine._hero.setCharacter(nextProps.character);
    }
    // if ((this.state.gameState === State.Game.playing || this.state.gameState === State.Game.paused) && nextProps.isPaused !== this.props.isPaused) {
    //   this.setState({ gameState: nextProps.isPaused ? State.Game.paused : State.Game.playing })
    // }
    // if (nextProps.character.id !== this.props.character.id) {
    //   (async () => {
    //     this.world.remove(this._hero);
    //     this._hero = this.hero.getNode(nextProps.character.id);
    //     this.world.add(this._hero);
    //     this._hero.position.set(0, groundLevel, startingRow);
    //     this._hero.scale.set(1, 1, 1);
    //     this.init();
    //   })();
    // }
  }

  transitionToGamePlayingState = () => {
    Animated.timing(this.transitionScreensValue, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200,
      onComplete: ({ finished }) => {
        this.engine.setupGame(this.props.character);
        this.engine.init();

        if (finished) {
          Animated.timing(this.transitionScreensValue, {
            toValue: 1,
            useNativeDriver: true,
            duration: 300,
          }).start();
        }
      },
    }).start();
  };

  updateWithGameState = (gameState) => {
    if (!gameState) throw new Error("gameState cannot be undefined");

    if (gameState === this.state.gameState) {
      return;
    }
    const lastState = this.state.gameState;

    this.setState({ gameState });
    this.engine.gameState = gameState;
    const { playing, gameOver, paused, none } = State.Game;
    switch (gameState) {
      case playing:
        if (lastState === paused) {
          this.engine.unpause();
        } else if (lastState !== none) {
          this.transitionToGamePlayingState();
        } else {
          // Coming straight from the menu.
          this.engine._hero.stopIdle();
          this.onSwipe(swipeDirections.SWIPE_UP);
        }

        break;
      case gameOver:
        break;
      case paused:
        this.engine.pause();
        break;
      case none:
        if (lastState === gameOver) {
          this.transitionToGamePlayingState();
        }
        this.newScore();

        break;
      default:
        break;
    }
  };

  componentWillUnmount() {
    cancelAnimationFrame(this.engine.raf);
  }

  async componentDidMount() {
    // AudioManager.sounds.bg_music.setVolumeAsync(0.05);
    // await AudioManager.playAsync(
    //   AudioManager.sounds.bg_music, true
    // );

    Dimensions.addEventListener("change", this.onScreenResize);
  }

  onScreenResize = ({ window }) => {
    this.engine.updateScale();
  };

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.onScreenResize);
  }

  UNSAFE_componentWillMount() {
    this.engine = new Engine();
    this.setState({ currentQuestion: question });
    // this.engine.hideShadows = this.hideShadows;
    this.engine.onUpdateScore = (position) => {
      this.setState({ score: position, currentQuestion: question });
    };
    this.engine.onGameInit = () => {
      this.setState({ score: 0 });
    };
    this.engine._isGameStateEnded = () => {
      return this.state.gameState !== State.Game.playing;
    };
    this.engine.onGameReady = () => this.setState({ ready: true });
    this.engine.onGameEnded = () => {
      this.setState({ gameState: State.Game.gameOver });
      // this.props.navigation.navigate('GameOver')
    };
    this.engine.setupGame(this.props.character);
    this.engine.init();
  }

  newScore = () => {
    Vibration.cancel();
    // this.props.setGameState(State.Game.playing);
    this.setState({ score: 0 });
    this.engine.init();
  };

  onSwipe = (gestureName) => this.engine.moveWithDirection(gestureName);

  renderGame = () => {
    if (!this.state.ready) return;
    //<p style={{"textAlign": "center","fontSize":20}}>{question}</p>
    return (
      <GestureView
        pointerEvents={DEBUG_CAMERA_CONTROLS ? "none" : undefined}
        onStartGesture={this.engine.beginMoveWithDirection}
        onSwipe={this.onSwipe}
      >
        
        <GLView
          style={{ flex: 1, height: "100%", overflow: "hidden" }}
          onContextCreate={this.engine._onGLContextCreate}
        />
      </GestureView>
    );
  };

  renderGameOver = () => {
    if (this.state.gameState !== State.Game.gameOver) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <GameOverScreen
          showSettings={() => {
            this.setState({ showSettings: true });
          }}
          setGameState={(state) => {
            this.updateWithGameState(state);
          }}
        />
      </View>
    );
  };

  renderHomeScreen = () => {
    if (this.state.gameState !== State.Game.none) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <HomeScreen
          onPlay={() => {
            this.updateWithGameState(State.Game.playing);
          }}
        />
      </View>
    );
  };

  renderSettingsScreen() {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <SettingsScreen goBack={() => this.setState({ showSettings: false })} />
      </View>
    );
  }

  showAnswers(){
    setAnswersVisible(!answersVisible);
    console.log(answersVisible);
    increaseMenuButton();
    setLetterDetected(true); //MUST FIX. INCREASES SCORE BY 10 EVERYTIME BUTTON IS CLICKED
    decreaseScore(10);
    //returningScoreToBefore(true);
    //console.log("answers shown");
  }

  renderAnswers(){
    let content = [];
    if (answersVisible){
      console.log("attempting to display");
      for (let i=1; i <= getCurrentQuestionAnswers().length;i++) {
        let banner = [
          {
            //color: "#3640eb",
            title: `${i}) ${getAnswerAtID(i-1).text}`,
            textStyle: bannerStyle.answerBanner,
            
          }];
        content.push(<View index={i-1} style={[bannerStyle.container]}>
          {banner.map((val, index) => (
          <Banner
            key={index}
            style={val.textStyle}
            title={val.title}
            button={val.button}
          />
        ))}</View>)
      }
      //returningScoreToBefore(true);
    }/*
    content.push(<View key={0} pointerEvents="none" style={[big_styles[0].container]}><Text style={[big_styles[1].answer, textShadow]}>{`${1}) ${getAnswerAtID(0).text}                    ${2}) ${getAnswerAtID(1).text}`}</Text></View>);
    content.push(<View key={1} pointerEvents="none" style={[big_styles[1].container]}><Text style={[big_styles[3].answer, textShadow]}>{`${3}) ${getAnswerAtID(2).text}                    ${4}) ${getAnswerAtID(3).text}`}</Text></View>);
    */
    /*for (let i=1; i <= getCurrentQuestionAnswers().length/2;i++) {
      content.push(<View key={i-1} pointerEvents="none" style={[big_styles[i-1].container]}><Text style={[big_styles[i-1].answer, textShadow]}>{`${i}) ${getAnswerAtID(i-1).text}                    ${i+1}) ${getAnswerAtID(i).text}`}</Text></View>);
    }*/
    
    return content;
  }
  
  renderExplanationText(){
    let content = [];
    if (letMeRender){
      content.push(<View key={0} pointerEvents="none" style={[styleTopText.container]}><Text style={[styleTopText.answer, textShadow]}>{`collect the correct answer`}</Text></View>);
    }
    return content;
  }

  renderQuestion(){
    let banner = [
      {
        //color: "#3640eb",
        title: `${getCurrentQuestion().title}`,
        textStyle: bannerStyle.banner,
        button: {
          onPress: (_) => {
          this.showAnswers();
          },
          source: menuButtons[currentMenuButton],
          style: { aspectRatio: 1.85, height: 40 },
        },
      },/*
      {
        color: "#368FEB",
        title: "forked from EvanBacon",
        button: {
          onPress: (_) => {
          window.open("https://github.com/EvanBacon/Expo-Crossy-Road", '_blank').focus();
          },
          source: Images.button.social,
          style: { aspectRatio: 1.85, height: 40 },
        },
        
      },*/
    ];
    let content = [];
    content.push(<View key={0} style={[bannerStyle.container]}>
      {banner.map((val, index) => (
      <Banner
        key={index}
        style={val.textStyle}
        title={val.title}
        button={val.button}
      />
    ))}</View>)
    //content.push(<View pointerEvents="none" style={[styles.container]}><Text style={[styles.question, textShadow]}>{getCurrentQuestion().title}</Text></View>)
    return content;
  }

  render() {
    const { isDarkMode, isPaused } = this.props;

    return (
      <View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          { flex: 1, backgroundColor: "#87C6FF" },
          Platform.select({
            web: { position: "fixed" },
            default: { position: "absolute" },
          }),
          this.props.style,
        ]}
      >
        <Animated.View
          style={{ flex: 1, opacity: this.transitionScreensValue }}
        >
          {this.renderGame()}
          {this.renderExplanationText()}
        </Animated.View>
        <Score
          score={this.state.score}
          gameOver={this.state.gameState === State.Game.gameOver}
        />
        <Lives/>
        <div>
          {this.renderQuestion()}
          {this.renderAnswers()}
        </div>
        {this.renderGameOver()}

        {this.renderHomeScreen()}

        {this.state.showSettings && this.renderSettingsScreen()}

        {isPaused && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(105, 201, 230, 0.8)",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          />
        )}
      </View>
    );
  }
}

const GestureView = ({ onStartGesture, onSwipe, ...props }) => {
  const config = {
    velocityThreshold: 0.2,
    directionalOffsetThreshold: 80,
  };

  return (
    <GestureRecognizer
      onResponderGrant={() => {
        onStartGesture();
      }}
      onSwipe={(direction) => {
        onSwipe(direction);
      }}
      config={config}
      onTap={() => {
        onSwipe(swipeDirections.SWIPE_UP);
      }}
      style={{ flex: 1 }}
      {...props}
    />
  );
};

function GameScreen(props) {
  const scheme = useColorScheme();
  const { character } = React.useContext(GameContext);

  // const appState = useAppState();

  return (
    <Game {...props} character={character} isDarkMode={scheme === "dark"} />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top:16,
    marginLeft:"auto",
    marginRight:"auto",
    left:(Dimensions.get('window').width/2)-(getTextWidth(getCurrentQuestion().title)/2),
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  question: {
    color: 'white',
    fontFamily: 'retro',
    fontSize: 45,
    backgroundColor: 'transparent',
    letterSpacing: '0.1em',
  },
  sub_question: {
    color: 'white',
    fontFamily: 'retro',
    fontSize: 40,
    marginTop: 16,
    backgroundColor: 'transparent',
    letterSpacing: '0.15em',
  }
});

const styleTopText= StyleSheet.create({
  container: {
    position: 'absolute',
    top:10,
    marginLeft:"auto",
    marginRight:"auto",
    left:(Dimensions.get('window').width/2)-(getTextWidth(`collect the correct answer`)/2),
  },
  answer: {
    color: 'white',
    fontFamily: 'retro',
    fontSize: 32,
    marginTop: 16,
    backgroundColor: 'transparent',
    letterSpacing: '0.15em',
  }
});

const bannerStyle = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  banner: {
    backgroundColor: "transparent",
    fontFamily: "retro",
    //letterSpacing: '0.15em',
  },
  answerBanner: {
    backgroundColor: "transparent",
    fontFamily: "retro",
    color: "indianred",
  }
})

export default GameScreen;
