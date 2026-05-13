const questions = [
    {
        type: "脑筋急转弯",
        question: "什么东西早上四条腿，中午两条腿，晚上三条腿？",
        answer: "人",
        hint: "想想人的一生",
        acceptableAnswers: ["人", "人类", "人一生"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西越洗越脏？",
        answer: "水",
        hint: "想想洗东西用什么",
        acceptableAnswers: ["水", "清水", "水"]
    },
    {
        type: "脑筋急转弯",
        question: "什么门永远关不上？",
        answer: "球门",
        hint: "想想体育用品",
        acceptableAnswers: ["球门", "足球门"]
    },
    {
        type: "数学谜题",
        question: "一个人花8块钱买了一只鸡，9块钱卖掉了，然后他觉得不划算，花10块钱又买回来了，11块卖给另外一个人。问他赚了多少？",
        answer: "2",
        hint: "分开计算两次交易",
        acceptableAnswers: ["2", "2元", "两块"]
    },
    {
        type: "脑筋急转弯",
        question: "什么路最窄？",
        answer: "冤家路",
        hint: "想想一句成语",
        acceptableAnswers: ["冤家路", "冤家路窄"]
    },
    {
        type: "逻辑推理",
        question: "房间里有3盏灯，门外有3个开关，每个开关分别控制一盏灯。你只能进房间一次，怎么判断哪个开关控制哪盏灯？",
        answer: "先开一个开关，等一会关掉，再开另一个开关，然后进房间。亮着的是第二个开关，发热的是第一个开关，剩下的是第三个开关。",
        hint: "灯泡除了发光还有什么特性？",
        acceptableAnswers: ["先开一个开关等一会关掉再开另一个", "先开一个开关等一会关掉再开另一个开关", "发热的灯泡"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西有头无脚？",
        answer: "硬币",
        hint: "想想钱币",
        acceptableAnswers: ["硬币", "钱币", "铜钱"]
    },
    {
        type: "数学谜题",
        question: "假设1=5，2=15，3=215，4=3215，那么5=？",
        answer: "1",
        hint: "看看第一个等式",
        acceptableAnswers: ["1", "1"]
    },
    {
        type: "脑筋急转弯",
        question: "什么水永远用不完？",
        answer: "口水",
        hint: "想想你身体里的水",
        acceptableAnswers: ["口水", "唾液", "泪水"]
    },
    {
        type: "逻辑推理",
        question: "有两个人，一个面朝南，一个面朝北的站立着，不准回头，不准走动，不准照镜子，问他们能否看到对方的脸？",
        answer: "能",
        hint: "想想他们是怎么站的",
        acceptableAnswers: ["能", "面对面", "可以"]
    },
    {
        type: "脑筋急转弯",
        question: "什么书谁也没见过？",
        answer: "天书",
        hint: "想想神仙的书",
        acceptableAnswers: ["天书", "无字天书"]
    },
    {
        type: "数学谜题",
        question: "教室里有10盏灯，关掉了3盏，还剩几盏灯？",
        answer: "10",
        hint: "关掉的灯还是灯吗？",
        acceptableAnswers: ["10", "10盏", "十"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西越热越爱出来？",
        answer: "汗",
        hint: "想想夏天你会出什么",
        acceptableAnswers: ["汗", "汗水", "汗液"]
    },
    {
        type: "脑筋急转弯",
        question: "什么牛不吃草？",
        answer: "蜗牛",
        hint: "想想小动物",
        acceptableAnswers: ["蜗牛", "铁牛", "水牛"]
    },
    {
        type: "逻辑推理",
        question: "你在赛跑比赛中，超过了第二名，你现在是第几名？",
        answer: "第二",
        hint: "仔细想想，你超过了第二名，不是第一名",
        acceptableAnswers: ["第二", "第二名", "2"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西人们都不想要？",
        answer: "病",
        hint: "想想健康问题",
        acceptableAnswers: ["病", "疾病", "生病"]
    },
    {
        type: "脑筋急转弯",
        question: "什么球不能踢？",
        answer: "地球",
        hint: "想想我们住在哪里",
        acceptableAnswers: ["地球", "星球", "月球"]
    },
    {
        type: "数学谜题",
        question: "一只青蛙掉进10米深的井里，每次跳上去3米滑下来2米，问几次能跳出来？",
        answer: "8",
        hint: "最后一次跳上去不会滑下来哦",
        acceptableAnswers: ["8", "八", "8次"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西打破了才能用？",
        answer: "鸡蛋",
        hint: "想想早餐吃什么",
        acceptableAnswers: ["鸡蛋", "蛋壳", "蛋"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西越生气越大？",
        answer: "脾气",
        hint: "想想你的情绪",
        acceptableAnswers: ["脾气", "火气", "气"]
    },
    {
        type: "逻辑推理",
        question: "有一家人，爸爸、妈妈、两个儿子、两个女儿、一只狗。他们要过河，船一次只能载两个人（包括狗）。只有爸爸、妈妈、爷爷会划船。问至少要几次才能全部过河？",
        answer: "9",
        hint: "需要来回接送",
        acceptableAnswers: ["9", "九", "9次"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西有五个头，但人不觉得它怪？",
        answer: "手",
        hint: "想想你的身体部位",
        acceptableAnswers: ["手", "手指", "手脚"]
    },
    {
        type: "脑筋急转弯",
        question: "什么车子寸步难行？",
        answer: "风车",
        hint: "想想农用工具",
        acceptableAnswers: ["风车", "纺车", "水车"]
    },
    {
        type: "数学谜题",
        question: "桌上有3个苹果，你拿走了2个，你还有几个？",
        answer: "2",
        hint: "你拿走的就是你的",
        acceptableAnswers: ["2", "两个", "二个"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西越减越大？",
        answer: "洞",
        hint: "想想挖东西",
        acceptableAnswers: ["洞", "窟窿", "坑"]
    },
    {
        type: "脑筋急转弯",
        question: "什么布剪不断？",
        answer: "瀑布",
        hint: "想想自然景观",
        acceptableAnswers: ["瀑布", "水布"]
    },
    {
        type: "逻辑推理",
        question: "一个猎人，一只枪，枪射程100米，有一个狼离猎人200米，猎人和狼都不动，可是猎人却开枪把狼打死了？",
        answer: "枪长100米",
        hint: "枪本身有长度吗？",
        acceptableAnswers: ["枪长100米", "枪长", "枪有100米"]
    },
    {
        type: "脑筋急转弯",
        question: "什么东西天天来，却从来没真正来过？",
        answer: "明天",
        hint: "想想时间",
        acceptableAnswers: ["明天", "明日"]
    },
    {
        type: "脑筋急转弯",
        question: "什么蛋打不烂，煮不熟，更不能吃？",
        answer: "考试得的零蛋",
        hint: "想想考试成绩",
        acceptableAnswers: ["零蛋", "0蛋", "零分"]
    },
    {
        type: "数学谜题",
        question: "请问：将18平均分成两份，却不得9，还会得几？",
        answer: "10",
        hint: "从中间分开，不是算术",
        acceptableAnswers: ["10", "十", "1和8"]
    }
];

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}