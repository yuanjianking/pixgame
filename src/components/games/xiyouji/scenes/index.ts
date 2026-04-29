
import BootScene from "./core/BootScene";
import MenuScene from "./core/MenuScene";
import OpeningScene from "./core/OpeningScene";
import TestScene from "./TestScene";
import HuaguoshanScene from "./chapter1/HuaguoshanScene";
import WaterCurtainCaveScene from "./chapter1/WaterCurtainCaveScene";
import WorldMapScene from "./core/WorldMapScene";

const CoreScenes = [WorldMapScene,BootScene, MenuScene,OpeningScene];
const Chapter1Scenes = [HuaguoshanScene, WaterCurtainCaveScene];
const DebugScenes = [TestScene];

export const allScenes = [
  ...CoreScenes,
  ...Chapter1Scenes,
  ...DebugScenes
];
