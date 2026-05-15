
import BootScene from "./core/BootScene";
import MenuScene from "./core/MenuScene";
import OpeningScene from "./core/OpeningScene";
import TestScene from "./TestScene";
import HuaguoshanScene from "./chapter1/HuaguoshanScene";
import WaterCurtainCaveScene from "./chapter1/WaterCurtainCaveScene";
import WorldMapScene from "./core/WorldMapScene";
import { DonghaiScene } from "./chapter1/DonghaiScene";
import { BattleScene } from "./core/BattleScene";

const CoreScenes = [BootScene, MenuScene,OpeningScene, WorldMapScene, BattleScene];
const Chapter1Scenes = [HuaguoshanScene, WaterCurtainCaveScene,DonghaiScene];
const DebugScenes = [TestScene];

export const allScenes = [
  ...CoreScenes,
  ...Chapter1Scenes,
  ...DebugScenes

];
