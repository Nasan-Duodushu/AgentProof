export const sampleDataByLang = {
  en: {
    jobId: 'okx-a2a-worldcup-demo-001',
    taskType: 'world_cup_prediction',
    taskTitle: 'World Cup prediction market delivery review',
    taskDescription: `Please analyze the next World Cup match between USA and Mexico and deliver a prediction-market brief.

Acceptance criteria:
- The brief must identify the target match and market.
- The brief must include latest schedule or match timing.
- The brief must provide win probability and most likely score range.
- The brief must explain odds or market-implied probability.
- The brief must include a Polymarket or equivalent market link.
- The brief must mention injury, lineup, or form context if used.
- The brief must include a risk and uncertainty note.`,
    aspPromise: `The provider promises to check current schedule, market odds, team context, and prediction-market links before answering. The answer should avoid fabricated match data and clearly separate facts from predictions.`,
    deliverableText: `# USA vs Mexico World Cup Prediction Brief

## Match view
USA vs Mexico is expected to be a tight group-stage match. My model gives USA a 48% win probability, Mexico 28%, and draw 24%.

## Most likely scores
1. USA 1-1 Mexico
2. USA 2-1 Mexico
3. USA 1-0 Mexico

## Market view
The current market looks slightly optimistic on USA. If the market prices USA above 55%, the edge may be limited.

## Team context
USA has home-field narrative support. Mexico has strong tournament experience and can punish transitions.

## Risk note
This is a prediction-market research note, not betting advice. Football outcomes are high variance and model confidence is medium.`,
    userConcern: 'The brief looks useful, but I am not sure whether it includes enough current data, market links, and source evidence before I accept the task.'
  },
  zh: {
    jobId: 'okx-a2a-worldcup-demo-001',
    taskType: 'world_cup_prediction',
    taskTitle: '世界杯预测市场交付物验收复核',
    taskDescription: `请分析下一场美国 vs 墨西哥的世界杯比赛，并交付一份预测市场简报。

验收标准：
- 简报必须明确目标比赛和目标市场。
- 简报必须包含最新赛程或比赛时间。
- 简报必须提供胜率和最可能比分区间。
- 简报必须解释赔率或市场隐含概率。
- 简报必须包含 Polymarket 或同类预测市场链接。
- 如使用伤病、阵容或状态信息，必须说明来源或上下文。
- 简报必须包含风险和不确定性说明。`,
    aspPromise: `服务方承诺在回答前检查当前赛程、市场赔率、球队背景和预测市场链接。回答应避免编造比赛数据，并清楚区分事实和预测。`,
    deliverableText: `# 美国 vs 墨西哥世界杯预测简报

## 比赛判断
美国 vs 墨西哥预计是一场胶着的小组赛。我的模型给出美国胜率 48%，墨西哥胜率 28%，平局 24%。

## 最可能比分
1. 美国 1-1 墨西哥
2. 美国 2-1 墨西哥
3. 美国 1-0 墨西哥

## 市场判断
当前市场似乎略微高估美国。如果市场把美国胜率定价到 55% 以上，优势可能有限。

## 球队背景
美国有主场叙事加成。墨西哥有较强的大赛经验，可能利用转换进攻制造威胁。

## 风险说明
这是一份预测市场研究简报，不构成投注建议。足球结果波动很大，模型置信度为中等。`,
    userConcern: '这份简报看起来有用，但我不确定它是否提供了足够的最新数据、市场链接和来源证据，是否可以直接验收。'
  }
};

export const sampleData = sampleDataByLang.en;
