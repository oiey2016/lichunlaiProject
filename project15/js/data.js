const GameData = {
    idioms: [
        {
            word: "一心一意",
            description: "形容心思、意念专一，只做一件事或只爱一个人",
            meaning: "心思、意念专一",
            example: "他做事总是一心一意，从不三心二意",
            firstHint: "第一个字是数字",
            secondHint: "和三心二意是反义词"
        },
        {
            word: "一帆风顺",
            description: "船挂着满帆顺风行驶，比喻非常顺利，没有任何阻碍",
            meaning: "比喻非常顺利，没有阻碍",
            example: "祝他这次的旅行一帆风顺",
            firstHint: "第一个字是数字",
            secondHint: "形容旅途或事业顺利"
        },
        {
            word: "三心二意",
            description: "形容犹豫不决，意志不坚定或用心不专一",
            meaning: "犹豫不定，不专心",
            example: "做事不能三心二意，要专心致志",
            firstHint: "前两个字都是数字",
            secondHint: "和一心一意是反义词"
        },
        {
            word: "五颜六色",
            description: "形容色彩复杂或花样繁多，引申为各色各样",
            meaning: "形容色彩繁多",
            example: "公园里开满了五颜六色的花",
            firstHint: "前两个字都是数字",
            secondHint: "形容颜色很多"
        },
        {
            word: "七上八下",
            description: "形容心里慌乱不安，无所适从的感觉",
            meaning: "形容心里慌乱不安",
            example: "考试成绩快出来了，我心里七上八下的",
            firstHint: "前两个字都是数字",
            secondHint: "形容心情忐忑不安"
        },
        {
            word: "十全十美",
            description: "十分完美，毫无欠缺",
            meaning: "十分完美，没有缺陷",
            example: "世上没有十全十美的人",
            firstHint: "第一个字和第三个字都是数字",
            secondHint: "形容非常完美"
        },
        {
            word: "百发百中",
            description: "形容射箭或打枪准确，每次都命中目标，也比喻做事有充分把握",
            meaning: "形容做事有把握，每次都成功",
            example: "他的投篮百发百中",
            firstHint: "第一个字和第三个字都是数字",
            secondHint: "形容射击精准"
        },
        {
            word: "千方百计",
            description: "想尽或用尽一切办法",
            meaning: "想尽各种办法",
            example: "他千方百计地想办法解决这个问题",
            firstHint: "第一个字和第三个字都是数字",
            secondHint: "形容想尽各种办法"
        },
        {
            word: "画龙点睛",
            description: "原形容梁代画家张僧繇作画的神妙，后多比喻写文章或讲话时，在关键处用几句话点明实质，使内容生动有力",
            meaning: "在关键处点明要点",
            example: "这篇文章的结尾真是画龙点睛",
            firstHint: "第一个字是动作",
            secondHint: "和绘画有关"
        },
        {
            word: "守株待兔",
            description: "原比喻希图不经过努力而得到成功的侥幸心理，现也比喻死守狭隘经验，不知变通",
            meaning: "比喻死守经验，不知变通",
            example: "学习不能守株待兔，要主动去学",
            firstHint: "第一个字是动作",
            secondHint: "是一个寓言故事"
        },
        {
            word: "掩耳盗铃",
            description: "偷铃铛怕别人听见而捂住自己的耳朵，比喻自己欺骗自己，明明掩盖不住的事情偏要想法子掩盖",
            meaning: "比喻自己欺骗自己",
            example: "他这样做简直是掩耳盗铃",
            firstHint: "第一个字和第三个字都是动作",
            secondHint: "比喻自欺欺人"
        },
        {
            word: "亡羊补牢",
            description: "羊逃跑了再去修补羊圈，还不算晚，比喻出了问题以后想办法补救，可以防止继续受损失",
            meaning: "出问题后及时补救",
            example: "亡羊补牢，为时未晚",
            firstHint: "第一个字和第三个字都是动作",
            secondHint: "比喻及时补救"
        },
        {
            word: "对牛弹琴",
            description: "讥笑听话的人不懂对方说得是什么，用以讥笑说话的人不看对象",
            meaning: "比喻说话不看对象",
            example: "跟他讲这些，简直是对牛弹琴",
            firstHint: "第一个字是介词",
            secondHint: "比喻说话不看对象"
        },
        {
            word: "井底之蛙",
            description: "井底的蛙只能看到井口那么大的一块天，比喻见识狭窄的人",
            meaning: "比喻见识短浅的人",
            example: "不要做井底之蛙，要多出去看看",
            firstHint: "第一个字和最后一个字是地名加动物",
            secondHint: "比喻见识短浅"
        },
        {
            word: "刻舟求剑",
            description: "比喻不懂事物已发展变化而仍静止地看问题",
            meaning: "比喻拘泥不变，不知变通",
            example: "时代变了，你还用老办法，真是刻舟求剑",
            firstHint: "第一个字和第三个字都是动作",
            secondHint: "是一个寓言故事"
        },
        {
            word: "叶公好龙",
            description: "比喻口头上说爱好某事物，实际上并不真爱好",
            meaning: "比喻口是心非",
            example: "他说喜欢运动，其实是叶公好龙",
            firstHint: "第一个字是姓氏",
            secondHint: "比喻口是心非"
        },
        {
            word: "自相矛盾",
            description: "比喻自己说话做事前后抵触",
            meaning: "前后抵触，不一致",
            example: "他说的话自相矛盾",
            firstHint: "第一个字是反身代词",
            secondHint: "比喻前后抵触"
        },
        {
            word: "滥竽充数",
            description: "比喻无本领的冒充有本领，次货冒充好货",
            meaning: "以次充好，混在行家里",
            example: "他在团队里滥竽充数",
            firstHint: "第一个字是形容词",
            secondHint: "比喻混在行家里充数"
        },
        {
            word: "杯弓蛇影",
            description: "将映在酒杯里的弓影误认为蛇，比喻因疑神疑鬼而引起恐惧",
            meaning: "比喻疑神疑鬼",
            example: "别杯弓蛇影，自己吓自己",
            firstHint: "第一个字和第三个字都是物品",
            secondHint: "比喻疑神疑鬼"
        },
        {
            word: "买椟还珠",
            description: "买下木匣，退还了珍珠，比喻没有眼力，取舍不当",
            meaning: "比喻取舍不当",
            example: "你这样做简直是买椟还珠",
            firstHint: "第一个字和第三个字都是动作",
            secondHint: "比喻取舍不当"
        },
        {
            word: "狐假虎威",
            description: "狐狸假借老虎的威势，比喻依仗别人的势力欺压人",
            meaning: "依仗别人势力欺压人",
            example: "他不过是狐假虎威罢了",
            firstHint: "前两个字都是动物",
            secondHint: "比喻依仗别人势力"
        },
        {
            word: "画蛇添足",
            description: "画蛇时给蛇添上脚，比喻做了多余的事，非但无益，反而不合适",
            meaning: "比喻做多余的事",
            example: "你这样做是画蛇添足",
            firstHint: "第一个字和第三个字都是动作",
            secondHint: "比喻做多余的事"
        },
        {
            word: "愚公移山",
            description: "比喻坚持不懈地改造自然和坚定不移地进行斗争",
            meaning: "比喻坚持不懈",
            example: "要有愚公移山的精神",
            firstHint: "第一个字是人名",
            secondHint: "比喻坚持不懈"
        },
        {
            word: "精卫填海",
            description: "旧时比喻仇恨极深，立志报复，后比喻意志坚决，不畏艰难",
            meaning: "比喻意志坚决",
            example: "他有精卫填海的决心",
            firstHint: "前两个字是人名",
            secondHint: "比喻意志坚决"
        },
        {
            word: "卧薪尝胆",
            description: "睡觉睡在柴草上，吃饭睡觉都尝一尝苦胆，形容人刻苦自励，发奋图强",
            meaning: "形容刻苦自励",
            example: "他卧薪尝胆，终于成功了",
            firstHint: "第一个字和第三个字都是动作",
            secondHint: "和越王勾践有关"
        },
        {
            word: "闻鸡起舞",
            description: "听到鸡叫就起来舞剑，后比喻有志报国的人及时奋起",
            meaning: "比喻有志之士及时奋发",
            example: "年轻人要闻鸡起舞，努力学习",
            firstHint: "第一个字和第三个字都是动作",
            secondHint: "和祖逖有关"
        },
        {
            word: "破釜沉舟",
            description: "比喻下决心不顾一切地干到底",
            meaning: "比喻下定决心",
            example: "他破釜沉舟，背水一战",
            firstHint: "第一个字和第三个字都是动作",
            secondHint: "和项羽有关"
        },
        {
            word: "完璧归赵",
            description: "本指蔺相如将和氏璧完好地自秦送回赵国，后比喻把原物完好地归还本人",
            meaning: "比喻原物归还",
            example: "借别人的东西一定要完璧归赵",
            firstHint: "第一个字是形容词",
            secondHint: "和蔺相如有关"
        },
        {
            word: "纸上谈兵",
            description: "在纸面上谈论打仗，比喻空谈理论，不能解决实际问题",
            meaning: "比喻空谈理论",
            example: "只会纸上谈兵是不行的",
            firstHint: "前两个字是地点加动作",
            secondHint: "和赵括有关"
        },
        {
            word: "指鹿为马",
            description: "指着鹿，说是马，比喻故意颠倒黑白，混淆是非",
            meaning: "比喻颠倒黑白",
            example: "他总是指鹿为马，混淆是非",
            firstHint: "第一个字是动作",
            secondHint: "和赵高有关"
        }
    ],

    quizQuestions: [
        {
            question: "成语画龙点睛原本是形容什么的？",
            options: ["画画技法", "文章写作", "说话技巧", "建筑设计"],
            correct: 0,
            explanation: "画龙点睛原形容梁代画家张僧繇作画的神妙"
        },
        {
            question: "成语亡羊补牢中的牢是什么意思？",
            options: ["监狱", "羊圈", "牢固", "牢房"],
            correct: 1,
            explanation: "牢在这里指羊圈"
        },
        {
            question: "下列哪个成语和掩耳盗铃意思最接近？",
            options: ["自欺欺人", "画蛇添足", "守株待兔", "刻舟求剑"],
            correct: 0,
            explanation: "掩耳盗铃比喻自己欺骗自己，和自欺欺人意思相近"
        },
        {
            question: "成语卧薪尝胆讲的是谁的故事？",
            options: ["项羽", "刘邦", "勾践", "韩信"],
            correct: 2,
            explanation: "卧薪尝胆讲的是越王勾践的故事"
        },
        {
            question: "成语破釜沉舟讲的是谁的故事？",
            options: ["刘邦", "项羽", "韩信", "张良"],
            correct: 1,
            explanation: "破釜沉舟讲的是项羽的故事"
        },
        {
            question: "下列哪个成语形容做事专心？",
            options: ["三心二意", "一心一意", "七上八下", "五颜六色"],
            correct: 1,
            explanation: "一心一意形容心思专一"
        },
        {
            question: "成语指鹿为马讲的是谁的故事？",
            options: ["赵高", "李斯", "秦始皇", "秦二世"],
            correct: 0,
            explanation: "指鹿为马讲的是赵高的故事"
        },
        {
            question: "成语完璧归赵中的璧指的是什么？",
            options: ["墙壁", "和氏璧", "完璧", "玉璧"],
            correct: 1,
            explanation: "璧指的是和氏璧"
        },
        {
            question: "下列哪个成语形容见识短浅？",
            options: ["井底之蛙", "狐假虎威", "叶公好龙", "滥竽充数"],
            correct: 0,
            explanation: "井底之蛙比喻见识狭窄的人"
        },
        {
            question: "成语闻鸡起舞讲的是谁的故事？",
            options: ["祖逖", "刘邦", "项羽", "韩信"],
            correct: 0,
            explanation: "闻鸡起舞讲的是祖逖的故事"
        },
        {
            question: "成语纸上谈兵讲的是谁的故事？",
            options: ["赵括", "廉颇", "蔺相如", "赵王"],
            correct: 0,
            explanation: "纸上谈兵讲的是赵括的故事"
        },
        {
            question: "下列哪个成语比喻依仗别人的势力？",
            options: ["狐假虎威", "画蛇添足", "守株待兔", "滥竽充数"],
            correct: 0,
            explanation: "狐假虎威比喻依仗别人的势力欺压人"
        },
        {
            question: "成语叶公好龙中的好是什么意思？",
            options: ["好坏", "爱好", "好像", "好人"],
            correct: 1,
            explanation: "好在这里是爱好的意思"
        },
        {
            question: "下列哪个成语形容色彩繁多？",
            options: ["五颜六色", "三心二意", "七上八下", "十全十美"],
            correct: 0,
            explanation: "五颜六色形容色彩复杂或花样繁多"
        },
        {
            question: "成语滥竽充数比喻什么？",
            options: ["以次充好", "音乐好听", "数量很多", "质量很好"],
            correct: 0,
            explanation: "滥竽充数比喻无本领的冒充有本领"
        },
        {
            question: "下列哪个成语形容心情不安？",
            options: ["七上八下", "一心一意", "十全十美", "百发百中"],
            correct: 0,
            explanation: "七上八下形容心里慌乱不安"
        },
        {
            question: "成语杯弓蛇影比喻什么？",
            options: ["疑神疑鬼", "喝酒太多", "弓箭很好", "蛇很可怕"],
            correct: 0,
            explanation: "杯弓蛇影比喻因疑神疑鬼而引起恐惧"
        },
        {
            question: "成语买椟还珠比喻什么？",
            options: ["取舍不当", "很有钱", "很会做生意", "眼光很好"],
            correct: 0,
            explanation: "买椟还珠比喻没有眼力，取舍不当"
        },
        {
            question: "下列哪个成语形容非常完美？",
            options: ["十全十美", "三心二意", "五颜六色", "七上八下"],
            correct: 0,
            explanation: "十全十美形容十分完美，毫无欠缺"
        },
        {
            question: "成语愚公移山比喻什么？",
            options: ["坚持不懈", "很傻", "力气大", "山很高"],
            correct: 0,
            explanation: "愚公移山比喻坚持不懈地进行斗争"
        },
        {
            question: "成语精卫填海比喻什么？",
            options: ["意志坚决", "很傻", "海很大", "鸟很多"],
            correct: 0,
            explanation: "精卫填海比喻意志坚决，不畏艰难"
        },
        {
            question: "下列哪个成语形容做事有把握？",
            options: ["百发百中", "三心二意", "七上八下", "五颜六色"],
            correct: 0,
            explanation: "百发百中形容每次都命中目标"
        },
        {
            question: "成语自相矛盾比喻什么？",
            options: ["前后抵触", "兵器很好", "很会说话", "很会打仗"],
            correct: 0,
            explanation: "自相矛盾比喻自己说话做事前后抵触"
        },
        {
            question: "成语刻舟求剑比喻什么？",
            options: ["拘泥不变", "很有钱", "船很好", "剑很好"],
            correct: 0,
            explanation: "刻舟求剑比喻不知变通"
        },
        {
            question: "成语守株待兔比喻什么？",
            options: ["死守经验", "很有耐心", "兔子很多", "树很好"],
            correct: 0,
            explanation: "守株待兔比喻死守狭隘经验，不知变通"
        }
    ]
};
