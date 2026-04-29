import type { WorldNode } from "../types";

export const WorldNodesData: WorldNode[] = [
  // 花果山中心点
  { id: 'huaguoshan', name: '花果山', x: 10800, y: 3000, region: '东胜神洲', isUnlocked: true,
    description: '石猴出世，成为美猴王', icon: 'mountain', scene: 'HuaguoshanScene' },

  // 天庭 - 花果山右上方
  { id: 'tianting', name: '天庭', x: 11200, y: 2200, region: '东胜神洲', isUnlocked: false,
    description: '弼马温、齐天大圣、大闹天宫', icon: 'temple', scene: 'TiantingScene' },

  // 东海龙宫 - 花果山右下方
  { id: 'donghai', name: '东海龙宫', x: 11300, y: 3800, region: '东胜神洲', isUnlocked: false,
    description: '夺取定海神针', icon: 'water', scene: 'DonghaiScene' },

  // 幽冥界 - 花果山左下方
  { id: 'mingjie', name: '幽冥界', x: 10200, y: 3500, region: '东胜神洲', isUnlocked: false,
    description: '大闹地府，勾销生死簿', icon: 'cave', scene: 'MingjieScene' },

  // ==================== 五行山 ====================
  { id: 'wuxingshan', name: '五行山', x: 9700, y: 3100, region: '南赡部洲', isUnlocked: false,
    description: '救出孙悟空', icon: 'mountain', scene: 'WuxingshanScene' },

  // ==================== 后续节点 ====================
  { id: 'yingchoujian', name: '鹰愁涧', x: 9200, y: 3200, region: '南赡部洲', isUnlocked: false,
    description: '收白龙马', icon: 'water', scene: 'YingchoujianScene' },

  { id: 'guanyin', name: '观音禅院', x: 8700, y: 3100, region: '南赡部洲', isUnlocked: false,
    description: '黑熊精偷袈裟', icon: 'temple', scene: 'GuanyinScene' },

  { id: 'gaolaozhuang', name: '高老庄', x: 8200, y: 3200, region: '南赡部洲', isUnlocked: false,
    description: '收猪八戒', icon: 'city', scene: 'GaolaozhuangScene' },

  { id: 'huangfeng', name: '黄风岭', x: 7700, y: 3100, region: '南赡部洲', isUnlocked: false,
    description: '黄风怪', icon: 'desert', scene: 'HuangfengScene' },

  { id: 'liushahe', name: '流沙河', x: 7200, y: 2800, region: '西牛贺洲', isUnlocked: false,
    description: '收沙和尚', icon: 'water', scene: 'LiushaheScene' },

  { id: 'sisheng', name: '四圣试禅心处', x: 6700, y: 2900, region: '西牛贺洲', isUnlocked: false,
    description: '四圣试探', icon: 'temple', scene: 'SishengScene' },

  { id: 'wuzhuang', name: '五庄观', x: 6200, y: 2800, region: '西牛贺洲', isUnlocked: false,
    description: '偷吃人参果', icon: 'temple', scene: 'WuzhuangScene' },

  { id: 'baigujing', name: '白虎岭', x: 5700, y: 2900, region: '西牛贺洲', isUnlocked: false,
    description: '白骨精', icon: 'desert', scene: 'BaigujingScene' },

  { id: 'baoxiang', name: '宝象国', x: 5200, y: 2800, region: '西牛贺洲', isUnlocked: false,
    description: '黄袍怪', icon: 'city', scene: 'BaoxiangScene' },

  { id: 'pingdingshan', name: '平顶山', x: 4700, y: 2500, region: '西牛贺洲', isUnlocked: false,
    description: '金角银角大王', icon: 'mountain', scene: 'PingdingshanScene' },

  { id: 'wujiguo', name: '乌鸡国', x: 4200, y: 2600, region: '西牛贺洲', isUnlocked: false,
    description: '青毛狮子精', icon: 'city', scene: 'WujiguoScene' },

  { id: 'huoyun', name: '火云洞', x: 3700, y: 2400, region: '西牛贺洲', isUnlocked: false,
    description: '红孩儿', icon: 'fire', scene: 'HuoyunScene' },

  { id: 'heishui', name: '黑水河', x: 3200, y: 2500, region: '西牛贺洲', isUnlocked: false,
    description: '小鼍龙', icon: 'water', scene: 'HeishuiScene' },

  { id: 'chechi', name: '车迟国', x: 2700, y: 2400, region: '西牛贺洲', isUnlocked: false,
    description: '虎鹿羊三仙', icon: 'city', scene: 'ChechiScene' },

  { id: 'tongtian', name: '通天河', x: 2200, y: 2100, region: '西牛贺洲', isUnlocked: false,
    description: '灵感大王', icon: 'water', scene: 'TongtianScene' },

  { id: 'jindou', name: '金兜洞', x: 1700, y: 2200, region: '西牛贺洲', isUnlocked: false,
    description: '青牛精', icon: 'cave', scene: 'JindouScene' },

  { id: 'nver', name: '女儿国', x: 1200, y: 2000, region: '西牛贺洲', isUnlocked: false,
    description: '唐僧成亲', icon: 'city', scene: 'NverScene' },

  { id: 'dudi', name: '毒敌山', x: 700, y: 2100, region: '西牛贺洲', isUnlocked: false,
    description: '蝎子精', icon: 'desert', scene: 'DudiScene' },

  { id: 'zhenjia', name: '二心山', x: 200, y: 2000, region: '西牛贺洲', isUnlocked: false,
    description: '六耳猕猴', icon: 'cave', scene: 'ZhenjiaScene' },

  // ==================== 方向向下 ====================
  { id: 'huoyanshan', name: '火焰山', x: 400, y: 2400, region: '西牛贺洲', isUnlocked: false,
    description: '三借芭蕉扇', icon: 'fire', scene: 'HuoyanshanScene' },

  { id: 'bibo', name: '碧波潭', x: 300, y: 2600, region: '西牛贺洲', isUnlocked: false,
    description: '九头虫', icon: 'water', scene: 'BiboSceen' },

  { id: 'jingji', name: '荆棘岭', x: 500, y: 2800, region: '西牛贺洲', isUnlocked: false,
    description: '树精', icon: 'forest', scene: 'JingjiScene' },

  { id: 'xiaoleiyin', name: '小雷音寺', x: 900, y: 3000, region: '西牛贺洲', isUnlocked: false,
    description: '黄眉老祖', icon: 'temple', scene: 'XiaoleiyinScene' },

  { id: 'xishi', name: '稀柿衕', x: 1300, y: 3200, region: '西牛贺洲', isUnlocked: false,
    description: '蟒蛇精', icon: 'forest', scene: 'XishiScene' },

  { id: 'zhuzi', name: '朱紫国', x: 400, y: 3400, region: '西牛贺洲', isUnlocked: false,
    description: '赛太岁', icon: 'city', scene: 'ZhuziScene' },

  { id: 'pansi', name: '盘丝洞', x: 800, y: 3600, region: '西牛贺洲', isUnlocked: false,
    description: '蜘蛛精', icon: 'cave', scene: 'PansiScene' },

  { id: 'huanghua', name: '黄花观', x: 1200, y: 3700, region: '西牛贺洲', isUnlocked: false,
    description: '蜈蚣精', icon: 'temple', scene: 'HuanghuaScene' },

  { id: 'shituo', name: '狮驼岭', x: 1600, y: 3900, region: '西牛贺洲', isUnlocked: false,
    description: '三大王', icon: 'mountain', scene: 'ShituoScene' },

  { id: 'biji', name: '比丘国', x: 2000, y: 4000, region: '西牛贺洲', isUnlocked: false,
    description: '白面狐狸', icon: 'city', scene: 'BijiScene' },

  { id: 'wudi', name: '无底洞', x: 1700, y: 4400, region: '西牛贺洲', isUnlocked: false,
    description: '老鼠精', icon: 'cave', scene: 'WudiScene' },

  { id: 'mieffa', name: '灭法国', x: 2100, y: 4500, region: '西牛贺洲', isUnlocked: false,
    description: '灭法国王', icon: 'city', scene: 'MieffaScene' },

  { id: 'yinwu', name: '隐雾山', x: 2500, y: 4900, region: '西牛贺洲', isUnlocked: false,
    description: '豹子精', icon: 'forest', scene: 'YinwuScene' },

  { id: 'fengxian', name: '凤仙郡', x: 2900, y: 5300, region: '西牛贺洲', isUnlocked: false,
    description: '求雨', icon: 'desert', scene: 'FengxianScene' },

  { id: 'yuhua', name: '玉华州', x: 3300, y: 5500, region: '西牛贺洲', isUnlocked: false,
    description: '黄狮精', icon: 'city', scene: 'YuhuaScene' },

  { id: 'zhujie', name: '竹节山', x: 3700, y: 5900, region: '西牛贺洲', isUnlocked: false,
    description: '九灵元圣', icon: 'mountain', scene: 'ZhujieScene' },

  { id: 'xuanjing', name: '玄英洞', x: 4200, y: 5850, region: '西牛贺洲', isUnlocked: false,
    description: '犀牛精', icon: 'cave', scene: 'XuanjingScene' },

  { id: 'tianzhu', name: '天竺国', x: 4700, y: 5950, region: '西牛贺洲', isUnlocked: false,
    description: '玉兔精', icon: 'city', scene: 'TianzhuScene' },

  { id: 'lingyun', name: '凌云渡', x: 5200, y: 5800, region: '西牛贺洲', isUnlocked: false,
    description: '脱胎成佛', icon: 'water', scene: 'LingyunScene' },

  // ==================== 终点 ====================
  { id: 'leiyin', name: '雷音寺', x: 5700, y: 5900, region: '西牛贺洲', isUnlocked: false,
    description: '取得真经，成佛', icon: 'temple', scene: 'LeiyinScene' },
];