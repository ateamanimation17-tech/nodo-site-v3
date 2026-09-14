export type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: number;
  date: string;
  body: { heading?: string; text: string }[];
};

export const posts: Post[] = [
  {
    slug: "two-week-rule",
    title: "The two-week rule: why most trackers get abandoned",
    category: "Reset",
    readTime: 5,
    date: "2026-09-01",
    excerpt:
      "Almost every habit tracker dies in the same two-week window. It isn't a willpower problem — it's a design problem, and it's fixable.",
    body: [
      {
        text: "Open any app store review section for a fitness or habit app and you'll find the same pattern repeating: five stars for the first two weeks, then a rush of one-star reviews that all say some version of the same thing. \"Loved it at first, then I just stopped opening it.\" That two-week cliff isn't a coincidence, and it isn't really about motivation.",
      },
      {
        heading: "The real reason trackers die",
        text: "Most tracking tools ask you to do two jobs at once: live your life, and separately, go log what you did. Every one of those logging moments is a small tax. For the first week or two, novelty covers the tax. Once the novelty wears off, the tax is still there, and now nothing is paying for it.",
      },
      {
        text: "The fix isn't a better reminder notification. It's removing as many of those separate logging moments as possible, and replacing them with things that update themselves as a side effect of you doing what you were already going to do — the meal you were going to eat anyway gets logged because you tapped the recipe you were following, not because you opened a separate food diary and searched for each ingredient.",
      },
      {
        heading: "What to look for instead",
        text: "A system worth keeping past week two rebuilds itself around your behavior instead of asking you to report on it. A meal rotation that adjusts to your actual macro target instead of a static PDF. A shopping list that regenerates from what you're actually cooking. A momentum grid that fills in from workouts you were doing anyway, not a diary entry you have to remember to write. Fewer decisions, fewer separate steps, more of it happening automatically in the background.",
      },
      {
        text: "If you're evaluating any tracker — ours included — ask one question before you commit to it: on day 15, when the novelty is gone, what work is this thing still asking of me? If the honest answer is \"the same as day one,\" that's your two-week cliff, right on schedule.",
      },
    ],
  },
  {
    slug: "net-worth-number",
    title: "Your net worth number isn't what you think it is",
    category: "Finance",
    readTime: 6,
    date: "2026-08-24",
    excerpt:
      "Most people either don't know their net worth or know a version of it that's quietly wrong. Here's how to get the number that actually means something.",
    body: [
      {
        text: "Ask most people what their net worth is and you'll get one of two answers: a shrug, or a number that's actually just their bank balance. Both miss the point of the number, which is to answer a much more useful question than \"how much cash do I have right now\": if I stopped everything today, sold what's sellable, and paid off what's owed, what would actually be left?",
      },
      {
        heading: "The two mistakes that break the number",
        text: "The first mistake is counting only what's easy to see — checking and savings accounts — and ignoring the assets that don't show up in a banking app: the value tied up in things you own outright, money owed to you, anything with real resale value. The second, more dangerous mistake is the opposite: counting assets but forgetting the debts sitting against them, which turns a real net worth calculation into a vanity number that quietly overstates how well things are actually going.",
      },
      {
        text: "A number that only ever goes up because you stopped subtracting debt isn't tracking your finances — it's decorating them.",
      },
      {
        heading: "Why this number, specifically, is worth tracking monthly",
        text: "Income and spending are noisy month to month — one big bill, one bonus, one irregular expense, and the trend line means nothing. Net worth is quieter and more honest, because it nets all of that out automatically. A single upward trend line, checked once a month, tells you more about whether your financial decisions are working than a dozen category-by-category spending reports.",
      },
      {
        text: "The habit worth building isn't checking your balance more often. It's checking one number, once a month, that already accounts for everything you own and everything you owe — and watching whether that one line is moving in the direction you want.",
      },
    ],
  },
  {
    slug: "one-habit-that-predicts",
    title: "The one habit that predicts whether the rest stick",
    category: "Brain",
    readTime: 4,
    date: "2026-08-15",
    excerpt:
      "Of everything people track, one habit is the strongest predictor of whether their other habits survive the month. It probably isn't the one you'd guess.",
    body: [
      {
        text: "People tend to assume the habit that matters most is the hardest one — the 5am workout, the strict diet, the deep-work block. In practice, the strongest predictor of whether someone's whole system survives the month is much smaller and much less impressive: whether they have any kind of fixed daily review at all, even a two-minute one.",
      },
      {
        heading: "Why the small habit carries the big ones",
        text: "Every habit system drifts. Life gets in the way, a day gets missed, a goal quietly gets deprioritized. What determines whether that drift becomes a full collapse or just a small correction is whether anything is checking in on the system regularly. A daily review — even something as short as glancing at a habit checklist and today's one priority — is the mechanism that catches drift while it's still a one-day miss instead of a three-week gap.",
      },
      {
        text: "This is also why habit trackers that reset themselves automatically each day tend to outperform ones that require manual setup every morning: the review only works if it costs almost nothing to do. The moment it takes more than a few seconds, it becomes one more thing to skip on a busy day — which is exactly the day it was needed most.",
      },
      {
        heading: "What to actually track",
        text: "Start smaller than feels useful: one habit checklist, one running task list, checked once a day at a consistent moment — after coffee, before bed, whatever already exists in your day. Everything else — projects, goals, longer-term tracking — holds up much better once that one small daily anchor is actually in place.",
      },
    ],
  },
  {
    slug: "protein-target-explained",
    title: "Why your protein target should be closer to 2.5g/kg than 1g/kg",
    category: "Reset",
    readTime: 5,
    date: "2026-08-05",
    excerpt:
      "The 'protein per kg' number people quote most often is built for sedentary maintenance, not for anyone training. Here's the actual math.",
    body: [
      {
        text: "The most commonly repeated protein guideline — roughly 0.8 to 1g per kilogram of bodyweight — comes from research on preventing deficiency in sedentary adults. It's a floor, not a target, and it was never meant to describe anyone who trains regularly, is in a calorie deficit, or is trying to build or preserve muscle while losing fat.",
      },
      {
        heading: "What changes once training enters the picture",
        text: "Resistance training increases the rate at which muscle protein breaks down and needs to be rebuilt. Being in a calorie deficit — which most people trying to change their body composition are — makes the body more likely to pull from muscle tissue for energy unless protein intake specifically protects against it. Both effects push the real requirement well above the sedentary-maintenance number.",
      },
      {
        text: "This is where a target closer to 2 to 2.5g per kilogram of bodyweight comes from: it's the range where research on trained individuals in a deficit consistently shows the best muscle retention, without meaningfully higher benefits above it. Below roughly 1.6g/kg, most people training seriously start losing more muscle than necessary along with fat.",
      },
      {
        heading: "The practical takeaway",
        text: "If a calculator or app gives you a protein target under 1.5g per kilogram and you train regularly, that number is doing you a disservice — it's protecting against deficiency, not supporting the actual goal of holding onto muscle while losing weight. Set the target based on what you're doing with your body, not on a guideline designed for someone who isn't training at all.",
      },
    ],
  },
];
