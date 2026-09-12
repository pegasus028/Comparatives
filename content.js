/* ===========================================================================
   DEPARTURE BOARD — Comparatives & Superlatives
   content.js — curriculum, item bank, badges, remediation map.
   Edit freely: every string here is classroom copy, not code.
   ---------------------------------------------------------------------------
   ITEM TYPES
     choose  {stem, options[], answer}                 generic multiple choice
     equiv   {given, stem, options[], answer}          same-meaning
     judge   {given, stem, answer}                     True / False / Can't tell
     gap     {lines:[{who,text}], options[], answer}   dialogue gap-fill  ("___")
             ...or {lines, accept:[]}                  typed answer
     table   {table:{cols,rows}, stem, options[], answer}
     pick    {shop, items:[{name,price,note}], stem, answer}
     order   {stem, items[] IN CORRECT ORDER}          shuffled at render
     spot    {stem, words[], answer, fix}              click the wrong word
     build   {stem, tiles[], solution, alt[]}          assemble a sentence
   Every item carries: id, tag (error tag), level (CEFR), why (the diagnosis).
   =========================================================================== */

const CEFR = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];

/* --------------------------------------------------------------------------
   RANKS — trip-readiness levels, one per stage cleared
   -------------------------------------------------------------------------- */
const RANKS = [
  { n: 0, name: 'Daydreamer',     note: 'You have an idea and no plan.' },
  { n: 1, name: 'Researcher',     note: 'You can compare two things and say so.' },
  { n: 2, name: 'Planner',        note: 'You can pick the best one out of many.' },
  { n: 3, name: 'Booker',         note: 'You can argue about price and value.' },
  { n: 4, name: 'Packer',         note: 'You can say exactly how much better.' },
  { n: 5, name: 'Check-in',       note: 'You compare like with like, every time.' },
  { n: 6, name: 'Gate Open',      note: 'Superlatives hold no surprises for you.' },
  { n: 7, name: 'Boarding',       note: 'You handle the structures natives use without thinking.' },
  { n: 8, name: 'Frequent Flyer', note: 'C1. You compare like a writer, not a learner.' }
];

/* --------------------------------------------------------------------------
   BADGES — travel perks. `check` runs against the progress object.
   -------------------------------------------------------------------------- */
const BADGES = [
  { id: 'passport',    name: 'Passport Issued',   perk: 'You are officially a traveller.',        icon: 'stamp',  how: 'Finish your first lesson.' },
  { id: 'streak3',     name: 'Lounge Access',     perk: 'Quiet seats and free coffee.',           icon: 'sofa',   how: 'Study 3 days in a row.' },
  { id: 'streak7',     name: 'Priority Boarding', perk: 'You get on first.',                      icon: 'queue',  how: 'Study 7 days in a row.' },
  { id: 'streak14',    name: 'Theme Park Ticket', perk: 'One free day at Disneyland.',            icon: 'ticket', how: 'Study 14 days in a row.' },
  { id: 'upgrade',     name: 'Class Upgrade',     perk: 'Business class, one leg.',               icon: 'seat',   how: 'Score 100% on any stage challenge.' },
  { id: 'firstclass',  name: 'First Class',       perk: 'A bed at 38,000 feet.',                  icon: 'crown',  how: 'Score 100% on three stage challenges.' },
  { id: 'solo',        name: 'Solo Traveller',    perk: 'No help needed.',                        icon: 'compass',how: 'Clear a stage challenge without using a hint.' },
  { id: 'reclaim',     name: 'Baggage Reclaim',   perk: 'You got it back.',                       icon: 'bag',    how: 'Fix 5 items in Standby that you once got wrong.' },
  { id: 'tailwind',    name: 'Tailwind',          perk: 'Arriving early.',                        icon: 'wind',   how: 'Answer 10 in a row correctly.' },
  { id: 'rebooked',    name: 'Rebooked',          perk: 'A second chance, taken.',                icon: 'redo',   how: 'Pass a stage challenge you previously failed.' },
  { id: 'nonstop',     name: 'Non-stop',          perk: 'No connections.',                        icon: 'arrow',  how: 'Finish a whole stage in one session.' },
  { id: 'quickdraw',   name: 'Fast Track',        perk: 'Straight through security.',             icon: 'bolt',   how: 'Earn 25 time bonuses by answering inside 7 seconds.' },
  { id: 'frequent',    name: 'Frequent Flyer',    perk: 'The whole world is open.',               icon: 'globe',  how: 'Clear all 8 stages.' }
];

/* --------------------------------------------------------------------------
   ERROR TAGS → what the teacher report says. One entry per tag used by items.
   `reteach` is board-ready. `activities` are things a teacher can run tomorrow.
   -------------------------------------------------------------------------- */
const REMEDIATION = {
  gradability: {
    name: 'Gradability — can this word be compared at all?',
    principle: 'A word can only be compared if it names a scale. Classifying adjectives (electric, direct, return, double) sort things into boxes; they have no scale, so no comparative.',
    reteach: 'Use the VERY test. If you can say "very X", you can say "more X / X-er". "A very direct flight" — no. So "a more direct flight" is odd too. Extreme adjectives (enormous, freezing, packed, exhausted) are already at the top of the scale, so they take absolutely/completely, not very.',
    activities: [
      'Sorting race: 30 adjective cards from a travel brochure, three columns — scale / box / already-at-the-top. Two minutes, then defend the borderline ones.',
      'Coercion challenge: give the class an impossible comparative ("more electric", "more double-decker") and ask them to invent a context where it works. This teaches the rule and its exceptions at once.',
      'Brochure hunt: find five classifying adjectives in a real hotel listing and explain why none of them can take -er.'
    ]
  },
  'form-er-more': {
    name: 'Building the form — -er or more, and never both',
    principle: 'The suffix -er/-est attaches to short, UNDERIVED words. Words already built from a suffix (careful, expensive, crowded, reliable) refuse a second one.',
    reteach: 'Do not count syllables — look for a suffix. narrow → narrower (one piece). crowded → *crowdeder (already built from crowd + ed). That is why the "two-syllable rule" feels random: narrow, simple, quiet, clever are single pieces; careful, famous, crowded are not. And never mark twice: more faster, the most fastest.',
    activities: [
      'Split the word: give twenty adjectives and ask students to draw a line at any suffix they can see. Words that survive uncut take -er.',
      'Error auction: teams bid on sentences they believe contain a double-marking error; wrong bids cost points.'
    ]
  },
  'than-basic': {
    name: 'than — naming the other thing',
    principle: 'A comparative is incomplete until the standard is named. "The train is faster" answers nothing until we know faster than what.',
    reteach: 'Two questions to ask of every comparative you write: compared to what, and by how much. Missing than-phrases are the single commonest reason a B1 comparison paragraph reads as vague.',
    activities: [
      'Dangling comparative hunt: hand out an advertisement ("Now faster! More comfortable!") and ask what each claim is compared to. Advertising lives on this gap.',
      'Pair dictation: A reads half a comparison, B must supply a plausible than-phrase aloud within three seconds.'
    ]
  },
  'superlative-the': {
    name: 'The article with superlatives',
    principle: 'A superlative names the unique maximum of a set. Uniqueness is exactly what the encodes, so the is not decoration — it is the meaning.',
    reteach: '*a cheapest hotel is not just unusual, it is incoherent. The article only disappears when something else carries the definiteness (Japan\'s busiest station, our shortest route) or when you are comparing one thing across conditions (traffic is heaviest at 8am).',
    activities: [
      'Article strip: take a paragraph of travel writing, delete every the, and have students restore them, justifying each superlative one.',
      'Minimal pairs on the board: "The 08:10 is the most crowded train" vs "The 08:10 is most crowded on Mondays." Ask what changed. The answer is the comparison set, not the grammar.'
    ]
  },
  'superlative-set': {
    name: 'Delimiting the set — in, of, one of the, ordinals',
    principle: 'A superlative says nothing until you say which group it wins in. English supplies the group with in (places, organisations), of (groups, periods) or a relative clause.',
    reteach: 'the busiest airport IN Asia. the longest OF the three tunnels. the worst delay I HAVE EVER had (note the present perfect). And "one of the" selects from a plural set, so the noun must be plural: one of the cheapest hotelS.',
    activities: [
      'Superlative with a missing set: give five bare superlatives and have students supply three different sets each, showing how the truth changes.',
      'Ranking board: a table of six hotels; students write one sentence each using the, one of the, the second -est, and a relative-clause set.'
    ]
  },
  irregular: {
    name: 'Irregular forms',
    principle: 'The most frequent adjectives resist regularisation because they are rehearsed constantly: good/better/best, bad/worse/worst, far/further, little/less, many-much/more.',
    reteach: 'Note two things students miss. There is no *worser — the double forms died out with more better. And many and much, which are carefully kept apart in the positive, merge into a single more.',
    activities: [
      'Frequency argument: ask why there is no irregular comparative of punctual. The answer — nobody says it often enough — makes the pattern memorable.',
      'Sixty-second relay: teams race through irregular forms in a travel sentence frame.'
    ]
  },
  equative: {
    name: 'as … as — equatives set a floor',
    principle: '"as fast as X" means AT LEAST as fast as X. Exact equality is an inference, not the meaning — which is why "as fast as the express, faster in fact" is not a contradiction.',
    reteach: 'The frame is fixed: as + adjective + as. Crossing frames (*as fast than, *faster as) is the commonest B1 slip. Under negation, so becomes available and sounds formal: not so crowded as it used to be.',
    activities: [
      'Cancellation test: read "It is as good as the other one — better, actually." Ask whether the speaker contradicted themselves. They did not, and that is the lesson.',
      'Frame drill with mixed cards: students physically assemble as / as / than tiles against a timer.'
    ]
  },
  ratio: {
    name: 'Multipliers need the equative',
    principle: 'twice, half and three times attach to a ratio, and only the as … as frame expresses a ratio.',
    reteach: 'twice AS LONG AS, not *twice longer than. Also flag the ambiguity of three times longer — three times the length, or four? In writing, three times as long as or three times the length of.',
    activities: [
      'Data rewrite: give a fare table and require every comparison to be expressed twice, once with a multiplier and once with a difference.',
      'Ambiguity vote: put "three times longer" on the board and have the class vote on what it means. The split vote is the argument for the precise form.'
    ]
  },
  'less-fewer': {
    name: 'less vs fewer — and the measurement exception',
    principle: 'Countable nouns take fewer; uncountable take less. But measurements take less even when countable, because a measurement is an amount, not a count.',
    reteach: 'fewer trains, less congestion. BUT less than 20 minutes, less than 5 km, less than £10. Worth telling students honestly that the fewer rule was invented in 1770 and is a convention of edited writing, not a law of the language — they remember it better that way.',
    activities: [
      'Two-column sort with traps: put minutes, kilometres and pounds in the pile and let students discover the exception themselves.',
      'Editor role-play: students mark up a tourist-board text and must justify every change to a partner playing the writer.'
    ]
  },
  differential: {
    name: 'The differential slot — by how much?',
    principle: 'In front of every comparative sits a slot for the size of the gap. Filling it is the fastest single upgrade from B2 to C1 writing.',
    reteach: 'Measure phrases (ten minutes faster, £15 cheaper), large vague (much, far, considerably, substantially), small vague (slightly, marginally, a little). An unquantified comparative carries almost no information.',
    activities: [
      'Slot-filling ladder: "The metro is faster" → add a measure phrase → add a vague degree → add a hedge. Same sentence, four registers.',
      'Chart commentary: an IELTS Task 1 graph where students are banned from writing any bare comparative.'
    ]
  },
  'very-much': {
    name: 'very vs much',
    principle: 'very intensifies a POSITION on a scale; a comparative denotes a GAP between two positions, and gaps are measured, not intensified.',
    reteach: 'very fast, but much faster / far faster. The apparent exception, the very fastest, is a different word: there very means "precisely that one", identity rather than degree.',
    activities: [
      'Point-or-gap card sort: students hold up P or G for each modifier as you read them out.',
      'Correction chain: a sentence passes down a row, each student adding or fixing one modifier.'
    ]
  },
  'no-comparative': {
    name: 'no + comparative, and understatement',
    principle: 'no faster means equal or worse, with an implication of disappointed expectation. English does a great deal of its criticising by going DOWN the scale.',
    reteach: 'not the fastest way = it is slow. less than punctual = badly late. no better than before = nothing improved. Learners who cannot read this hear a mild remark where a sharp one was meant.',
    activities: [
      'Politeness thermometer: rank five understated criticisms from mild to brutal, then say each one out loud with the intonation that fits.',
      'Rewrite a blunt hotel review in litotes, then swap and translate back to blunt.'
    ]
  },
  'cat-match': {
    name: 'Comparing like with like',
    principle: 'The thing after than must be the same TYPE as the subject. "Fares in Bangkok are cheaper than Tokyo" compares a set of prices with a city.',
    reteach: 'Three repairs, all worth teaching: than THOSE IN Tokyo (plural count noun), than THAT OF Tokyo (singular/uncountable), than IN Tokyo (reuse the preposition). This is the commonest C1 writing error in the whole topic.',
    activities: [
      'Repair triage: twenty mismatched comparisons, students choose which of the three repairs fits each.',
      'Peer marking pass: students hunt only for this one error in each other\'s essays. Single-error passes find far more than general proofreading.'
    ]
  },
  'than-clause': {
    name: 'than introduces a clause, not a noun',
    principle: 'What follows than is a reduced clause. That is why "than I do" is possible at all, and why some comparisons are genuinely ambiguous.',
    reteach: 'Restore the verb and everything becomes clear: "than we do" rather than "than us"; "than the conductor did" rather than the ambiguous "than the conductor". The proof that a clause is there is subdeletion: "the platform is longer than the train is wide."',
    activities: [
      'Ambiguity theatre: act out both readings of "The guard helped the driver more than the conductor." Physical comedy makes the structure stick.',
      'Restore-the-verb drill on ten fragments — mechanical, fast, and it removes the than I / than me anxiety permanently.'
    ]
  },
  'any-ever': {
    name: 'any and ever after than',
    principle: 'The than-clause reverses the direction of inference, which licenses negative-polarity items. This is why any and ever appear with no negative word in sight.',
    reteach: 'faster than ANY other route (not *than some other routes). better than it has EVER been. Teaching this one licensing rule produces an immediate, visible jump in register.',
    activities: [
      'Some/any swap: a paragraph where every than-phrase uses some; students repair and then say why.',
      'Superlative-to-comparative transformation: "the best I have had" ↔ "better than any I have had".'
    ]
  },
  'zero-article': {
    name: 'Superlatives without the',
    principle: 'When you compare one thing across conditions or times rather than against other things, there is no set of entities, so there is nothing to be unique among — and the article goes.',
    reteach: 'The 08:10 is THE most crowded train on the line (entities). The 08:10 is most crowded on Mondays (conditions). Same for: traffic is heaviest at 8am, fares are cheapest on Tuesdays, the hotel is busiest in August.',
    activities: [
      'Entities-or-conditions sort, then students write one of each about their own commute.',
      'Timetable talk: students describe a real timetable using three zero-article superlatives.'
    ]
  },
  'most-three': {
    name: 'Three different mosts',
    principle: 'Superlative most (the most punctual airline), intensifier most (= very: a most unusual delay), and quantifier most (= the majority: most travellers). Three words, one spelling.',
    reteach: 'Tests: superlative takes the and needs a set; intensifier takes a and has no set at all; quantifier modifies the noun directly with no article. Students who only know the first will "correct" the other two.',
    activities: [
      'Three-column dictation from a travel article.',
      'Deliberate misreading: read "a most unusual delay" as a superlative and let the class explain why it cannot be one.'
    ]
  },
  correlative: {
    name: 'The more … the more …',
    principle: 'A dedicated structure for two quantities moving together. Both comparatives are fronted, there is no conjunction, and the comma is obligatory in writing.',
    reteach: 'Those two thes are not the definite article — they are Old English þy, the instrumental case, meaning "by that much". The structure literally says: by how much X, by that much Y. Same fossil in all the better and none the wiser.',
    activities: [
      'Chain game round the class: each student adds a correlative about travel, building on the last.',
      'Etymology reveal: show the fossil in all the better, then ask students to explain the double the themselves.'
    ]
  },
  incremental: {
    name: 'more and more — change over time',
    principle: 'For a trend, English reduplicates. Short adjectives repeat the whole form; long ones repeat only more.',
    reteach: 'later and later, fewer and fewer, cheaper and cheaper — but more and more crowded, NOT *more crowded and more crowded.',
    activities: [
      'Trend narration: students describe a line graph using only incremental comparatives.',
      'Which half repeats? Sort twelve adjectives by whether the whole form or only more doubles.'
    ]
  },
  'beyond-adj': {
    name: 'Comparison beyond adjectives',
    principle: 'Comparison is a meaning, not an ending. English also does it with verbal prefixes (out-, over-, under-), lexical verbs (exceed, surpass, lag behind) and quantitative phrases (up from, down on).',
    reteach: 'out- is a fully productive verbal comparative that almost no learner is taught: outperform, outnumber, outlast, outsell, outpace. "Rail outperforms road under 600 km" is one word doing the work of six.',
    activities: [
      'out- generator: give ten verbs and ask which accept out-, then use three in a travel sentence.',
      'De-adjective challenge: rewrite a comparison paragraph with no -er, -est, more or most anywhere.'
    ]
  },
  'irregular-split': {
    name: 'Pairs that split into two meanings',
    principle: 'further/farther, latest/last, nearest/next, elder/older, latter/later. These are not irregular so much as divided — and they are where advanced students lose marks.',
    reteach: 'The latest train is the most recent; the last train is the final one of the day — two very different situations to be standing on a platform in. The nearest station is closest in space; the next station is next along the route. Only further works in further delays.',
    activities: [
      'Five stations on the board, a student placed between two, then put on a moving train. Ask nearest and next each time; watch the answers diverge.',
      'Night-bus scenario: a short roleplay that only resolves correctly if students distinguish latest from last.'
    ]
  },
  metalinguistic: {
    name: 'The metalinguistic comparative',
    principle: 'When you compare which WORD fits better rather than two degrees, only more is possible — even on a one-syllable adjective.',
    reteach: '"The 07:40 is more slow than late" — it leaves on time and crawls. You cannot say *slower than late. Same with "it is more a hostel than a hotel". The test is that -er is unavailable where it normally would not be.',
    activities: [
      'Which word fits? Students describe a disappointing hotel using three more X than Y frames.',
      'Impossible -er: challenge students to convert five metalinguistic comparatives to -er and explain why each fails.'
    ]
  },
  register: {
    name: 'Precision and hedging in academic comparison',
    principle: 'In academic writing the differential slot is where the information lives, and the hedge is where the credibility lives.',
    reteach: 'Bare: "rail use is better". Precise: "rail journeys rose 41% while car journeys fell 6%". Also teach percentage points vs percent — from 20% to 30% is ten percentage points, or a 50% increase. And hedged superlatives: one of the most heavily used corridors, arguably the most efficient.',
    activities: [
      'Ban the bare comparative in one Task 1 paragraph; require a figure or a graded adverb every time.',
      'Percentage-point trap: three sentences, students identify which misuse percent for percentage points.'
    ]
  }
};


const STAGES = [];

/* ===== STAGE 1 — DEPARTURE LOUNGE ======================================= */
STAGES.push({
  id: 's1', art: 'lounge', n: 1, name: 'Departure Lounge', cefr: 'A2–B1',
  gate: 'Gate 1',
  blurb: 'You have decided to travel. Before you can compare anything, you need to know what CAN be compared — and how to build the form.',
  lessons: [
    {
      id: 's1l1', name: 'Can this word be compared?', cefr: 'A2',
      theory: {
        key: 'You can only compare a word that names a scale.',
        body: [
          'Some adjectives put a thing somewhere on a scale: <em>cheap, fast, comfortable, crowded, long</em>. A hotel can be a little cheap, quite cheap or very cheap. There is room to move.',
          'Other adjectives just put a thing in a box: <em>electric, direct, return, double, wooden</em>. A flight is direct or it is not. There is no room to move, so there is no comparative.',
          'The test is <strong>very</strong>. If you can say <em>very X</em>, you can say <em>X-er</em> or <em>more X</em>. If <em>very X</em> sounds wrong, so does the comparative.',
          'A third group is already at the top of the scale: <em>enormous, freezing, exhausted, packed</em>. These take <em>absolutely</em> or <em>completely</em>, not <em>very</em>, and they resist comparison for the opposite reason — there is nowhere further to go.'
        ],
        simple: [
          'Some words have a scale. Cheap, fast, big, crowded. You can have a little or a lot.',
          'Some words have no scale. Direct, electric, return. Yes or no. No middle.',
          'Test it with <strong>very</strong>. "Very cheap" is fine → "cheaper" is fine. "Very direct" is strange → "more direct" is strange too.',
          'Some words are already the maximum: enormous, freezing, packed. Say "absolutely packed", not "very packed".'
        ],
        examples: [
          { s: 'The night bus is <strong>cheaper</strong> than the train.', g: 'CHEAP HAS A SCALE — COMPARISON WORKS' },
          { s: '<s>We booked a more direct flight.</s>', g: 'DIRECT IS A BOX, NOT A SCALE' },
          { s: 'The terminal was <strong>absolutely packed</strong>.', g: 'ALREADY AT THE TOP — NOT "VERY PACKED"' }
        ]
      },
      items: [
        { id: 's1l1-01', type: 'choose', tag: 'gradability', level: 'A2',
          stem: 'Which sentence is possible in English?',
          options: ['This hotel is more electric than that one.', 'This hotel is quieter than that one.', 'This flight is more direct than that one, and the other one is also direct.', 'This ticket is more return than that one.'],
          answer: 1,
          why: 'Only <em>quiet</em> names a scale. Electric, direct and return sort things into boxes — there is nothing to move along.' },
        { id: 's1l1-02', type: 'spot', tag: 'gradability', level: 'A2',
          stem: 'One word does not belong. Click it.',
          words: ['The', 'lounge', 'was', 'very', 'enormous', 'when', 'we', 'arrived.'],
          answer: 3, fix: 'absolutely',
          why: '<em>Enormous</em> is already the top of the size scale, so it takes <em>absolutely</em> or <em>completely</em>, never <em>very</em>.' },
        { id: 's1l1-03', type: 'judge', tag: 'gradability', level: 'B1',
          given: 'Since 2010 the rail network has become far more electric.',
          stem: 'Is this sentence acceptable English?',
          answer: 0,
          why: 'Yes — but only because a scale has been created: <em>more of it is electrified</em>. Speakers invent a scale when they need one. The box reading ("electric or not") would be impossible.' },
        { id: 's1l1-04', type: 'pick', tag: 'gradability', level: 'A2',
          shop: 'Words from a hotel listing',
          art: 'hotel',
          stem: 'Four words from the same listing. Which one CANNOT take a comparative?',
          items: [
            { name: 'comfortable', price: '', note: '"a comfortable double room"' },
            { name: 'wooden', price: '', note: '"a wooden cabin by the lake"' },
            { name: 'expensive', price: '', note: '"not the most expensive option"' },
            { name: 'crowded', price: '', note: '"the pool gets crowded at noon"' }
          ],
          answer: 1,
          why: '<em>Wooden</em> classifies the material. A cabin is made of wood or it is not — no scale, no comparative.' },
        { id: 's1l1-05', type: 'gap', tag: 'gradability', level: 'B1',
          lines: [
            { who: 'Mai', text: 'The economy seats look tiny in the photo.' },
            { who: 'Jun', text: 'They were ___ on the flight out. I could not move at all.' }
          ],
          options: ['very tiny', 'absolutely tiny', 'more tiny', 'the most tiny'],
          answer: 1,
          why: '<em>Tiny</em> already means "extremely small", so it takes <em>absolutely</em>. The comparative forms are blocked for the same reason.' }
      ]
    },
    {
      id: 's1l2', name: 'Building the form: -er or more', cefr: 'A2',
      theory: {
        key: 'Short, single-piece words take -er. Words already built from a suffix take more.',
        body: [
          'The textbook rule counts syllables. The real rule looks at how the word is <strong>built</strong>.',
          '<strong>-er</strong> attaches to short words that are one piece: <em>cheap → cheaper, late → later, long → longer, busy → busier, narrow → narrower, simple → simpler, quiet → quieter</em>.',
          '<strong>more</strong> handles everything built from another word: <em>care + ful → more careful</em>, <em>expens + ive → more expensive</em>, <em>crowd + ed → more crowded</em>, <em>reli + able → more reliable</em>. You cannot say <em>*crowdeder</em> — the word already ends in a suffix and refuses a second one.',
          'That is why the "two-syllable lottery" is not a lottery. <em>Narrow, simple, quiet, clever</em> are single pieces, so they take <em>-er</em>. <em>Careful, famous, crowded</em> are not.',
          'Never mark twice. <em>*more faster</em> and <em>*the most fastest</em> were normal English until the 1700s, but modern English allows one marker only.'
        ],
        simple: [
          'Short word, one piece → add <strong>-er</strong>. cheap → cheaper.',
          'Word made from another word → use <strong>more</strong>. crowded = crowd + ed, so <em>more crowded</em>.',
          'Look for an ending: -ful, -ive, -ed, -ing, -able, -ous. If you see one, use <em>more</em>.',
          'Never both. Not <em>more cheaper</em>. Just <em>cheaper</em>.'
        ],
        examples: [
          { s: 'The hostel is <strong>cheaper</strong> and the rooms are <strong>narrower</strong>.', g: 'BOTH SINGLE-PIECE WORDS' },
          { s: 'The morning flight is <strong>more crowded</strong>.', g: 'CROWD + ED — A SUFFIX ALREADY' },
          { s: '<s>This route is more quicker.</s>', g: 'ONE MARKER ONLY' }
        ]
      },
      items: [
        { id: 's1l2-01', type: 'spot', tag: 'form-er-more', level: 'A2',
          stem: 'Click the word that should not be there.',
          words: ['The', 'overnight', 'ferry', 'is', 'more', 'cheaper', 'than', 'flying.'],
          answer: 4, fix: 'delete "more"',
          why: 'Double marking. <em>Cheaper</em> already carries the comparative; <em>more</em> repeats it.' },
        { id: 's1l2-02', type: 'choose', tag: 'form-er-more', level: 'A2',
          stem: 'Which two forms are correct?',
          options: ['narrower / more crowded', 'more narrow / crowdeder', 'narrowerer / most crowded', 'more narrower / more crowdeder'],
          answer: 0,
          why: '<em>Narrow</em> is a single piece, so <em>-er</em>. <em>Crowded</em> is crowd + ed, so <em>more</em>.' },
        { id: 's1l2-03', type: 'gap', tag: 'form-er-more', level: 'B1',
          lines: [
            { who: 'Ploy', text: 'Should we take the 06:00 or the 09:00?' },
            { who: 'Kit', text: 'The 06:00. It costs less and the airport is ___ at that hour.' }
          ],
          options: ['more quiet', 'quieter', 'more quieter', 'quietest'],
          answer: 1,
          why: '<em>Quiet</em> is a single-piece two-syllable word, so <em>-er</em> is natural. <em>More quiet</em> is not wrong, but <em>quieter</em> is what a native speaker says.' },
        { id: 's1l2-04', type: 'sort', tag: 'form-er-more', level: 'B1',
          art: 'suitcase',
          stem: 'Six words from a holiday brochure. Put each one in the box where it belongs.',
          bins: [
            { key: 'er', label: 'takes -er', hint: 'short, one piece' },
            { key: 'more', label: 'takes more', hint: 'long, or built from a suffix' }
          ],
          items: [
            { text: 'cheap', bin: 'er' }, { text: 'busy', bin: 'er' }, { text: 'narrow', bin: 'er' },
            { text: 'comfortable', bin: 'more' }, { text: 'crowded', bin: 'more' }, { text: 'relaxing', bin: 'more' }
          ],
          why: 'Look for a suffix, not a syllable count. <em>Cheap, busy, narrow</em> are single pieces. <em>Comfort+able</em>, <em>crowd+ed</em> and <em>relax+ing</em> are already built from something, so they refuse a second ending.' },
        { id: 's1l2-05', type: 'build', tag: 'form-er-more', level: 'B1',
          stem: 'Hostel ฿400 a night against ฿1,900 for the hotel — but reaching it means a 04:00 flight with two connections. Put both facts into one sentence.',
          tiles: ['The', 'hostel', 'is', 'cheaper', 'and', 'the', 'flight', 'is', 'more', 'tiring.'],
          solution: 'The hostel is cheaper and the flight is more tiring.',
          why: 'Two different strategies in one sentence, chosen by the shape of each word: <em>cheap</em> is one piece, <em>tiring</em> is tire + ing.' },
        { id: 's1l2-06', type: 'choose', tag: 'form-er-more', level: 'B1',
          stem: 'Which sentence would a careful writer produce?',
          options: ['The second hotel was more nicer but more expensiver.', 'The second hotel was nicer but more expensive.', 'The second hotel was more nice but expensiver.', 'The second hotel was nicerer but expensive more.'],
          answer: 1,
          why: '<em>Nice</em> is one syllable → <em>-er</em>. <em>Expensive</em> is expense + ive → <em>more</em>.' }
      ]
    },
    {
      id: 's1l3', name: 'than — naming the other thing', cefr: 'B1',
      theory: {
        key: 'A comparative is not finished until you say: compared to what?',
        body: [
          'A comparative compares a thing to a <strong>standard</strong>. <em>than</em> is how you name that standard.',
          '"The train is faster." Faster than what? Advertising loves this gap — <em>Now faster! More comfortable!</em> — because an unfinished comparison cannot be checked.',
          'In writing, either name the standard with <em>than</em>, or make sure the previous sentence has already named it.',
          'And notice the pairing. <em>-er / more</em> goes with <em>than</em>. <em>as</em> goes with <em>as</em>. Crossing them — <em>*faster as</em>, <em>*as fast than</em> — is the commonest slip at this level.'
        ],
        simple: [
          'Always answer the question: <strong>compared to what?</strong>',
          'Use <em>than</em> after <em>-er</em> or <em>more</em>: <em>cheaper than the bus</em>.',
          'Do not mix: <em>cheaper than</em> ✓, <em>as cheap as</em> ✓, <em>cheaper as</em> ✗, <em>as cheap than</em> ✗.'
        ],
        examples: [
          { s: 'Flying is <strong>faster than</strong> the train, but slower door to door.', g: 'STANDARD NAMED — THE CLAIM CAN NOW BE CHECKED' },
          { s: '<s>The coach is cheaper as the train.</s>', g: 'CROSSED FRAMES' }
        ]
      },
      items: [
        { id: 's1l3-01', type: 'spot', tag: 'than-basic', level: 'B1',
          stem: 'Click the wrong word.',
          words: ['Travelling', 'by', 'coach', 'is', 'slower', 'as', 'travelling', 'by', 'train.'],
          answer: 5, fix: 'than',
          why: '<em>-er</em> always pairs with <em>than</em>. <em>As</em> only pairs with another <em>as</em>.' },
        { id: 's1l3-02', type: 'gap', tag: 'than-basic', level: 'B1',
          lines: [
            { who: 'Agent', text: 'The city-centre hotel is 4,200 baht. The airport one is 2,800.' },
            { who: 'You', text: 'So the airport hotel is ___ the city-centre one.' }
          ],
          options: ['cheaper as', 'more cheap than', 'cheaper than', 'cheap than'],
          answer: 2,
          why: 'One syllable → <em>-er</em>; and <em>-er</em> requires <em>than</em>.' },
        { id: 's1l3-03', type: 'choose', tag: 'than-basic', level: 'B1',
          stem: 'An advertisement says: "Our new fleet is more comfortable." What is missing?',
          options: ['Nothing — the sentence is complete.', 'The standard: more comfortable than what?', 'An article before "comfortable".', 'A superlative form.'],
          answer: 1,
          why: 'It is grammatical but empty. A comparative with no standard cannot be checked — which is exactly why advertisers write them.' },
        { id: 's1l3-04', type: 'build', tag: 'than-basic', level: 'B1',
          stem: 'Don Mueang sits 24 km from the city centre; Suvarnabhumi is 32 km out. Make the comparison, and name what you are comparing it with.',
          tiles: ['Don', 'Mueang', 'is', 'closer', 'to', 'the', 'city', 'than', 'Suvarnabhumi.'],
          solution: 'Don Mueang is closer to the city than Suvarnabhumi.',
          why: 'Comparative + <em>than</em> + the named standard. The claim is now checkable.' },
        { id: 's1l3-05', type: 'equiv', tag: 'than-basic', level: 'B1',
          given: 'The Georgian is older than the Grand Hyatt.',
          stem: 'Which sentence means the same?',
          options: ['The Grand Hyatt was built before the Georgian.', 'The Georgian was built before the Grand Hyatt.', 'The two hotels were built in the same year.', 'The Georgian is the oldest hotel in the city.'],
          answer: 1,
          why: 'Older = built earlier. Note that the comparative tells you nothing about any third hotel — only about these two.' }
      ]
    }
  ]
});

/* ===== STAGE 2 — BOOKING DESK ========================================== */
STAGES.push({
  id: 's2', art: 'desk', n: 2, name: 'Booking Desk', cefr: 'B1',
  gate: 'Gate 2',
  blurb: 'Comparing two options is easy. Now you have twelve hotels on screen and you must pick the one — which means superlatives.',
  lessons: [
    {
      id: 's2l1', name: 'the + -est / most', cefr: 'B1',
      theory: {
        key: 'A superlative names the ONE winner in a group — and that is why it needs the.',
        body: [
          'A comparative puts one thing against one other. A superlative puts one thing against a whole <strong>set</strong> and says it is the maximum.',
          'Because there can only be one maximum, the thing is unique — and <em>the</em> is exactly how English marks a unique thing. So <em>the</em> is not decoration; it is the meaning. <em>*a cheapest hotel</em> is not just unusual, it is incoherent.',
          'The form follows the same rule as the comparative: single-piece words take <em>-est</em>, derived words take <em>most</em>. <em>the cheapest, the busiest, the narrowest</em> / <em>the most comfortable, the most crowded</em>.',
          'One thing can replace <em>the</em> — a possessive, because it already makes the noun definite: <em>Japan\'s busiest station</em>, <em>our cheapest option</em>.'
        ],
        simple: [
          'Two things → comparative (<em>cheaper</em>). Three or more → superlative (<em>the cheapest</em>).',
          'Always use <strong>the</strong> before a superlative. <em>the cheapest room</em>, not <em>a cheapest room</em>.',
          'Same form rule: short word → <em>-est</em>. Long or built word → <em>most</em>.',
          'Exception: <em>my</em>, <em>our</em>, <em>Japan\'s</em> can replace <em>the</em>.'
        ],
        examples: [
          { s: 'We took <strong>the cheapest</strong> room they had.', g: 'ONE WINNER OUT OF MANY' },
          { s: 'It was <strong>the most comfortable</strong> night of the trip.', g: 'DERIVED WORD → MOST' },
          { s: '<strong>Tokyo\'s busiest</strong> station handles 3.6 million people a day.', g: 'POSSESSIVE REPLACES "THE"' }
        ]
      },
      items: [
        { id: 's2l1-01', type: 'spot', tag: 'superlative-the', level: 'B1',
          stem: 'Click the word that is wrong.',
          words: ['We', 'booked', 'a', 'cheapest', 'room', 'in', 'the', 'hostel.'],
          answer: 2, fix: 'the',
          why: 'A superlative picks the unique maximum, and uniqueness is what <em>the</em> encodes. <em>A</em> cannot do that job.' },
        { id: 's2l1-02', type: 'table', tag: 'superlative-the', level: 'B1',
          table: { cols: ['Hotel', 'Price / night', 'Walk to station'], rows: [['Sakura Inn', '¥6,800', '4 min'], ['Hotel Meridian', '¥14,200', '11 min'], ['Capsule 9', '¥3,900', '2 min']] },
          stem: 'Complete: "Capsule 9 is ___ of the three."',
          options: ['cheaper', 'the cheapest', 'a cheapest', 'most cheap'],
          answer: 1,
          why: 'Three options means a set, so a superlative — and a superlative takes <em>the</em>. Note <em>of</em>, not <em>in</em>, for a group.' },
        { id: 's2l1-03', type: 'gap', tag: 'superlative-the', level: 'B1',
          lines: [
            { who: 'Nok', text: 'Twelve hotels, and we have to choose one.' },
            { who: 'Ben', text: 'Take the Sakura. It is ___ to the station of all of them.' }
          ],
          options: ['closer', 'the closest', 'more close', 'closest'],
          answer: 1,
          why: '<em>Of all of them</em> names a set, so a superlative with <em>the</em>. Dropping <em>the</em> is only possible in the special case you meet in Stage 6.' },
        { id: 's2l1-04', type: 'equiv', tag: 'superlative-the', level: 'B1',
          given: 'The Japanese restaurant is the most expensive in town.',
          stem: 'Is the Japanese restaurant the only restaurant being considered?',
          options: ['Yes — a superlative always means there is only one.', 'No — a superlative compares it with all the others in town.', 'Yes, because "the" means only one.', 'We cannot tell from the sentence.'],
          answer: 1,
          why: 'This is the point of a superlative: it needs a set of rivals. <em>The</em> marks the winner as unique, not the group as empty.' },
        { id: 's2l1-05', type: 'build', tag: 'superlative-the', level: 'B1',
          stem: 'You took nine trains on the holiday. This one had the best seats of the lot. Say so.',
          tiles: ['This', 'was', 'the', 'most', 'comfortable', 'train', 'of', 'the', 'trip.'],
          solution: 'This was the most comfortable train of the trip.',
          why: '<em>Comfortable</em> is derived, so <em>most</em>; the set is a period, so <em>of</em>.' }
      ]
    },
    {
      id: 's2l2', name: 'Naming the group: in, of, one of the', cefr: 'B1+',
      theory: {
        key: 'A superlative says nothing until you say WHICH GROUP it wins in.',
        body: [
          '"The busiest airport" — busiest where? In Asia? In the country? Of the three we looked at? The group changes the truth of the sentence completely.',
          'English names the group three ways, and the choice is not free:',
          '<strong>in</strong> for places and organisations: <em>the busiest airport <u>in</u> Asia</em>, <em>the best-paid job <u>in</u> the company</em>.',
          '<strong>of</strong> for groups of things and periods of time: <em>the longest <u>of</u> the three tunnels</em>, <em>the worst delay <u>of</u> the year</em>.',
          '<strong>a relative clause</strong>, very often with the present perfect: <em>the worst hotel I <u>have ever</u> stayed in</em>.',
          'Two patterns cause most of the errors here. <em>one of the</em> selects a member from a plural set, so the noun must be <strong>plural</strong>: <em>one of the cheapest hotel<u>s</u></em>. And ordinals stack in front: <em>the second cheapest</em>, <em>the third longest</em>.'
        ],
        simple: [
          'Say which group: <em>in Asia</em>, <em>of the three</em>, <em>that I have ever seen</em>.',
          'Places → <strong>in</strong>. Groups and time periods → <strong>of</strong>.',
          '<em>One of the cheapest hotel<strong>s</strong></em> — always plural after <em>one of the</em>.',
          'You can count down: <em>the second cheapest</em>, <em>the third biggest</em>.'
        ],
        examples: [
          { s: 'Changi is one of the busiest airport<strong>s</strong> in Asia.', g: '"ONE OF THE" + PLURAL, THEN "IN" FOR A PLACE' },
          { s: 'It was the worst delay <strong>of</strong> the year.', g: '"OF" FOR A TIME PERIOD' },
          { s: 'That was the longest queue I <strong>have ever</strong> stood in.', g: 'RELATIVE CLAUSE + PRESENT PERFECT' }
        ]
      },
      items: [
        { id: 's2l2-01', type: 'spot', tag: 'superlative-set', level: 'B1+',
          stem: 'Click the word that is wrong.',
          words: ['Suvarnabhumi', 'is', 'one', 'of', 'the', 'busiest', 'airport', 'in', 'Asia.'],
          answer: 6, fix: 'airports',
          why: '<em>One of the</em> picks a member out of a plural group, so the noun must be plural.' },
        { id: 's2l2-02', type: 'choose', tag: 'superlative-set', level: 'B1+',
          stem: 'Which preposition fits? "It was the most expensive meal ___ the whole holiday."',
          options: ['in', 'of', 'at', 'from'],
          answer: 1,
          why: 'A holiday is a period of time, and periods take <em>of</em>. <em>In</em> is for places and organisations.' },
        { id: 's2l2-03', type: 'table', tag: 'superlative-set', level: 'B1+',
          table: { cols: ['Room', 'Price', 'Floor'], rows: [['Standard', '฿1,900', '3'], ['Deluxe', '฿2,600', '8'], ['Suite', '฿5,400', '14'], ['Family', '฿3,100', '5']] },
          stem: 'Complete: "The Family room is ___ room in the hotel."',
          options: ['the second most expensive', 'the most expensive', 'one of the cheapest', 'the second cheapest'],
          answer: 0,
          why: 'Ranked by price: Suite (5,400), Family (3,100), Deluxe (2,600), Standard (1,900). Family sits second from the top.' },
        { id: 's2l2-04', type: 'gap', tag: 'superlative-set', level: 'B1+',
          lines: [
            { who: 'Mai', text: 'How was the transfer?' },
            { who: 'Pim', text: 'Terrible. It was the longest queue I ___ stood in.' }
          ],
          options: ['never', 'have ever', 'ever have', 'was ever'],
          answer: 1,
          why: 'A superlative set given by a relative clause almost always takes the present perfect: <em>the worst / longest / best … I have ever …</em>' },
        { id: 's2l2-05', type: 'equiv', tag: 'superlative-set', level: 'B1+',
          given: 'Osaka is one of the cheapest cities in Japan.',
          stem: 'Which statement must also be true?',
          options: ['Osaka is cheaper than every other Japanese city.', 'There are other Japanese cities that are about as cheap as Osaka.', 'Osaka is the cheapest city in Japan.', 'Osaka is expensive compared with other Japanese cities.'],
          answer: 1,
          why: '<em>One of the cheapest</em> places Osaka inside a small group at the bottom of the scale — it does not claim the single lowest position.' },
        { id: 's2l2-06', type: 'build', tag: 'superlative-set', level: 'B1+',
          stem: 'Haneda moves 85 million passengers a year. Only a handful of airports anywhere are busier. Say so.',
          tiles: ['Haneda', 'is', 'one', 'of', 'the', 'busiest', 'airports', 'in', 'the', 'world.'],
          solution: 'Haneda is one of the busiest airports in the world.',
          why: 'Plural noun after <em>one of the</em>, then <em>in</em> because the set is a place.' }
      ]
    },
    {
      id: 's2l3', name: 'The irregular few', cefr: 'B1',
      theory: {
        key: 'The most-used adjectives are irregular, because we say them too often to ever forget them.',
        body: [
          'Five families cover almost every irregular comparison in English:',
          '<em>good / well</em> → <strong>better / best</strong>. <em>bad / badly</em> → <strong>worse / worst</strong>. <em>far</em> → <strong>further / furthest</strong> (also <em>farther</em> for physical distance). <em>little</em> → <strong>less / least</strong>. <em>many</em> and <em>much</em> → <strong>more / most</strong>.',
          'Two details students miss. First, there is no <em>*worser</em> — the double forms disappeared along with <em>*more better</em>. Second, English carefully keeps <em>many</em> (countable) apart from <em>much</em> (uncountable) in the positive, and then merges them into a single <em>more</em>. <em>Many delays</em> and <em>much disruption</em>, but <em>more</em> of both.',
          'These forms are irregular precisely because they are common. There is no irregular comparative of <em>punctual</em> because nobody says it often enough to protect it.'
        ],
        simple: [
          'good → better → the best. bad → worse → the worst.',
          'far → further → the furthest. little → less → the least.',
          'many AND much → more → the most. (Two words, one comparative.)',
          'Never say <em>worser</em> or <em>more better</em>.'
        ],
        examples: [
          { s: 'The second hotel was <strong>much better</strong> and <strong>far cheaper</strong>.', g: 'TWO IRREGULARS, EACH WITH A DEGREE WORD' },
          { s: 'There were <strong>more</strong> delays and <strong>more</strong> disruption.', g: 'MANY AND MUCH MERGE INTO ONE FORM' }
        ]
      },
      items: [
        { id: 's2l3-01', type: 'spot', tag: 'irregular', level: 'B1',
          stem: 'Click the wrong word.',
          words: ['The', 'return', 'flight', 'was', 'worser', 'than', 'the', 'outbound', 'one.'],
          answer: 4, fix: 'worse',
          why: 'There is no <em>*worser</em>. The double comparative died out in the eighteenth century along with <em>more better</em>.' },
        { id: 's2l3-02', type: 'gap', tag: 'irregular', level: 'B1',
          lines: [
            { who: 'Ton', text: 'How far is the hostel from here?' },
            { who: 'Guide', text: 'It is a little ___ than the one you looked at yesterday — about ten minutes more on foot.' }
          ],
          options: ['farer', 'more far', 'further', 'furthest'],
          answer: 2,
          why: '<em>Far</em> is suppletive: <em>further/furthest</em> (or <em>farther</em> for physical distance only).' },
        { id: 's2l3-03', type: 'choose', tag: 'irregular', level: 'B1',
          stem: 'Which pair is correct? "There were ___ passengers and ___ luggage on the second train."',
          options: ['more / more', 'many more / much more', 'mores / muches', 'more many / more much'],
          answer: 0,
          why: 'Both <em>many</em> and <em>much</em> become <em>more</em>. (<em>Many more</em> and <em>much more</em> are also possible, but the degree word changes: <em>many more passengers</em>, <em>much more luggage</em>.)' },
        { id: 's2l3-04', type: 'order', tag: 'irregular', level: 'B1',
          stem: 'Order these hotel reviews from worst to best.',
          items: ['the worst room we have had', 'worse than last year', 'better than expected', 'the best night of the trip'],
          why: 'Superlative bottom → comparative bottom → comparative top → superlative top. The two comparatives sit inside the two superlatives.' },
        { id: 's2l3-05', type: 'build', tag: 'irregular', level: 'B1',
          stem: 'Second hotel: excellent breakfast, terrible mattresses. Compare it with the first in one sentence.',
          tiles: ['The', 'food', 'was', 'better', 'but', 'the', 'beds', 'were', 'worse.'],
          solution: 'The food was better but the beds were worse.',
          why: 'Two suppletive forms, neither taking <em>more</em> or <em>-er</em>.' }
      ]
    }
  ]
});

/* ===== STAGE 3 — PRICE COMPARISON ====================================== */
STAGES.push({
  id: 's3', art: 'tags', n: 3, name: 'Price Comparison', cefr: 'B1+',
  gate: 'Gate 3',
  blurb: 'Two tabs open, four prices, and a friend who wants to argue. Equal, not equal, twice as much, and the difference between fewer and less.',
  lessons: [
    {
      id: 's3l1', name: 'as … as — and what it really means', cefr: 'B1+',
      theory: {
        key: '"as cheap as" means AT LEAST as cheap — not exactly the same.',
        body: [
          'Everyone is taught that <em>as cheap as</em> means "the same price". It does not. It means <strong>at least as cheap as</strong>.',
          'That is why this is not a contradiction: <em>The hostel is as comfortable as the hotel — more comfortable, actually.</em> The "exactly equal" reading is something the listener guesses (if you meant <em>more</em>, you would have said <em>more</em>), and a guess can be cancelled.',
          'It also explains frames that otherwise look strange: <em>at least as good as</em>, <em>every bit as crowded as</em>, <em>just as expensive as</em>. All of them push on a floor, not on an equals sign.',
          'The frame is fixed: <strong>as + adjective + as</strong>. Crossing it is the classic slip — <em>*as cheap than</em>, <em>*cheaper as</em>.',
          'Under a negative, <em>so</em> becomes possible and sounds more formal: <em>not so crowded as it used to be</em>. Outside a negative it is not available.'
        ],
        simple: [
          '<em>as cheap as</em> = at least as cheap. Maybe cheaper.',
          'The frame never changes: <strong>as + word + as</strong>.',
          'Do not mix: <em>as cheap as</em> ✓ &nbsp; <em>cheaper than</em> ✓ &nbsp; <em>as cheap than</em> ✗ &nbsp; <em>cheaper as</em> ✗',
          'With <em>not</em>, you can also say <em>not so … as</em>: <em>not so busy as before</em>.'
        ],
        examples: [
          { s: 'The night train is <strong>as comfortable as</strong> the hotel — better, honestly.', g: 'NOT A CONTRADICTION: THE EQUATIVE SETS A FLOOR' },
          { s: 'Terminal 2 is <strong>not as crowded as</strong> Terminal 1.', g: 'NEGATIVE EQUATIVE' },
          { s: '<s>The bus is as cheap than the train.</s>', g: 'CROSSED FRAME' }
        ]
      },
      items: [
        { id: 's3l1-01', type: 'judge', tag: 'equative', level: 'B2',
          given: 'The guesthouse is as clean as the hotel — cleaner, in fact.',
          stem: 'Has the speaker contradicted themselves?',
          answer: 1,
          why: 'No. <em>As clean as</em> means "at least as clean", so adding "cleaner" refines the claim rather than reversing it.' },
        { id: 's3l1-02', type: 'spot', tag: 'equative', level: 'B1+',
          stem: 'Click the wrong word.',
          words: ['The', 'coach', 'is', 'almost', 'as', 'fast', 'than', 'the', 'train.'],
          answer: 6, fix: 'as',
          why: 'The equative frame is <em>as … as</em>. <em>Than</em> belongs only with <em>-er</em> and <em>more</em>.' },
        { id: 's3l1-03', type: 'gap', tag: 'equative', level: 'B1+',
          lines: [
            { who: 'Ploy', text: 'Is the new terminal still horrible in the mornings?' },
            { who: 'Jun', text: 'It is ___ it used to be. They added twelve more gates.' }
          ],
          options: ['not as crowded as', 'not so crowded than', 'not crowded as', 'no crowded as'],
          answer: 0,
          why: 'Negative equative: <em>not as … as</em>. (<em>Not so crowded as</em> is also correct and sounds more formal.)' },
        { id: 's3l1-04', type: 'equiv', tag: 'equative', level: 'B2',
          given: 'Flying is not as cheap as taking the overnight bus.',
          stem: 'Which sentence means the same?',
          options: ['The bus and the flight cost the same.', 'The overnight bus is cheaper than flying.', 'Flying is cheaper than the overnight bus.', 'Nobody knows which is cheaper.'],
          answer: 1,
          why: 'A negated equative reverses the direction: <em>not as cheap as X</em> = more expensive than X.' },
        { id: 's3l1-05', type: 'build', tag: 'equative', level: 'B1+',
          stem: 'Both are a four-minute walk from the station. Say the hostel gives up nothing on location.',
          tiles: ['The', 'hostel', 'is', 'just', 'as', 'central', 'as', 'the', 'hotel.'],
          solution: 'The hostel is just as central as the hotel.',
          why: '<em>Just</em> sits inside the frame, reinforcing the floor: at least as central, and probably no more.' }
      ]
    },
    {
      id: 's3l2', name: 'Twice as much: multipliers', cefr: 'B1+',
      theory: {
        key: 'Multipliers need the as … as frame, never than.',
        body: [
          '<em>twice</em>, <em>half</em>, <em>three times</em> and <em>a third</em> all express a <strong>ratio</strong> — and only the equative frame can carry a ratio.',
          'So: <em>twice <u>as</u> expensive <u>as</u></em>, not <em>*twice more expensive than</em>. <em>Half <u>as</u> frequent <u>as</u></em>, not <em>*half more frequent</em>.',
          'You will hear <em>three times longer than</em> in speech, and it is common — but it is genuinely ambiguous. Three times the length, or four? In writing, use <em>three times as long as</em> or <em>three times the length of</em>.',
          'The other precise pattern is a plain noun phrase: <em>twice the price of</em>, <em>double the capacity of</em>, <em>half the journey time of</em>.'
        ],
        simple: [
          'Ratio words (<em>twice, half, three times</em>) need <strong>as … as</strong>.',
          '<em>twice as expensive as</em> ✓ &nbsp; <em>twice more expensive than</em> ✗',
          'Or use a noun: <em>twice the price of</em>, <em>half the time of</em>.',
          'Avoid <em>three times longer</em> in writing — it is unclear.'
        ],
        examples: [
          { s: 'The taxi costs <strong>twice as much as</strong> the airport train.', g: 'RATIO → EQUATIVE FRAME' },
          { s: 'The flight takes <strong>half the time of</strong> the ferry.', g: 'NOUN VERSION — ALWAYS UNAMBIGUOUS' },
          { s: '<s>The suite is twice more expensive than the standard room.</s>', g: 'MULTIPLIER WITH "THAN" — NOT POSSIBLE' }
        ]
      },
      items: [
        { id: 's3l2-01', type: 'spot', tag: 'ratio', level: 'B1+',
          stem: 'Click the word that breaks the sentence.',
          words: ['A', 'taxi', 'is', 'twice', 'more', 'expensive', 'than', 'the', 'airport', 'bus.'],
          answer: 4, fix: 'use "as expensive as"',
          why: 'A multiplier needs the equative: <em>twice as expensive as the airport bus</em>.' },
        { id: 's3l2-02', type: 'table', tag: 'ratio', level: 'B1+',
          table: { cols: ['Option', 'Fare', 'Time'], rows: [['Airport train', '฿45', '26 min'], ['Taxi', '฿450', '55 min'], ['Airport bus', '฿90', '70 min']] },
          stem: 'Complete: "The airport bus costs ___ the train."',
          options: ['twice more than', 'twice as much as', 'two times more as', 'twice than'],
          answer: 1,
          why: '฿90 is exactly double ฿45 — a ratio, so the equative frame.' },
        { id: 's3l2-03', type: 'choose', tag: 'ratio', level: 'B2',
          stem: 'A guidebook says the new tunnel is "three times longer than the old one". Why would an editor change it?',
          options: ['It should be "three times long".', 'It is ambiguous — three times the length, or four times?', '"Tunnel" cannot take a multiplier.', '"Longer" must become "more long".'],
          answer: 1,
          why: 'Readers split on whether it means 3× or 1 + 3×. <em>Three times as long as</em> removes the doubt.' },
        { id: 's3l2-04', type: 'gap', tag: 'ratio', level: 'B1+',
          lines: [
            { who: 'Mai', text: 'The suite is 5,400 and the standard room is 1,800.' },
            { who: 'Ben', text: 'So the suite is ___ the standard room. Forget it.' }
          ],
          options: ['three times as expensive as', 'three times more expensive than', 'the most expensive of', 'as three times expensive as'],
          answer: 0,
          why: '5,400 ÷ 1,800 = 3. A clean ratio, so a clean equative.' },
        { id: 's3l2-05', type: 'equiv', tag: 'ratio', level: 'B2',
          given: 'The ferry takes twice as long as the flight.',
          stem: 'The flight takes 50 minutes. How long does the ferry take?',
          options: ['25 minutes', '100 minutes', '150 minutes', 'We cannot tell.'],
          answer: 1,
          why: '<em>Twice as long as</em> is unambiguous: 2 × 50. This is exactly the clarity that <em>twice longer than</em> loses.' }
      ]
    },
    {
      id: 's3l3', name: 'less, fewer, least', cefr: 'B2',
      theory: {
        key: 'Count them → fewer. Measure them → less. Even when they look countable.',
        body: [
          'Going down the scale, English splits by countability where going up does not. <em>More</em> covers everything; <em>fewer</em> and <em>less</em> divide the work.',
          '<strong>fewer</strong> + countable: <em>fewer flights, fewer delays, fewer tourists</em>.<br><strong>less</strong> + uncountable: <em>less traffic, less luggage, less choice</em>.',
          'Now the exception that even strict editors keep. <strong>Measurements take <em>less</em></strong>, even when the noun is countable, because a measurement is an amount rather than a count: <em>less than 20 minutes</em>, <em>less than 5 km</em>, <em>less than £30</em>. <em>*Fewer than 20 minutes</em> sounds wrong to everyone.',
          'Worth knowing: the <em>fewer</em> rule is not ancient. <em>Less</em> with countable nouns has been used since Old English; the rule was suggested by one writer in 1770 and hardened into a convention. It is a rule of edited writing — observe it in exams, but do not be shocked when you hear otherwise.',
          'The superlative is <em>the least</em>: <em>the least reliable airline</em>, <em>the fewest delays</em>.'
        ],
        simple: [
          'Can you count them? → <strong>fewer</strong>. <em>fewer flights</em>.',
          'Is it a mass? → <strong>less</strong>. <em>less traffic</em>.',
          'Money, time, distance → always <strong>less</strong>. <em>less than 20 minutes</em>.',
          'Top of the scale down: <em>the least comfortable</em>, <em>the fewest stops</em>.'
        ],
        examples: [
          { s: 'There are <strong>fewer</strong> trains on Sundays, so there is <strong>less</strong> choice.', g: 'COUNT / MASS IN ONE SENTENCE' },
          { s: 'The transfer takes <strong>less than</strong> 20 minutes.', g: 'MEASUREMENT — "FEWER" WOULD BE WRONG' }
        ]
      },
      items: [
        { id: 's3l3-01', type: 'spot', tag: 'less-fewer', level: 'B2',
          stem: 'Click the wrong word.',
          words: ['There', 'are', 'less', 'flights', 'to', 'Hakodate', 'in', 'winter.'],
          answer: 2, fix: 'fewer',
          why: 'Flights are counted, so <em>fewer</em>.' },
        { id: 's3l3-02', type: 'choose', tag: 'less-fewer', level: 'B2',
          stem: 'Which sentence is correct as written?',
          options: ['Fewer than 15 minutes to the gate.', 'Less than 15 minutes to the gate.', 'Fewer than 15 minute to the gate.', 'Less than 15 minute to the gate.'],
          answer: 1,
          why: 'Minutes here are a measured amount, not a count, so <em>less</em> — the standard exception to the <em>fewer</em> rule.' },
        { id: 's3l3-03', type: 'gap', tag: 'less-fewer', level: 'B2',
          lines: [
            { who: 'Nok', text: 'Why do you always fly on a Tuesday?' },
            { who: 'Kit', text: 'Cheaper seats, ___ passengers, and ___ queuing at security.' }
          ],
          options: ['less / fewer', 'fewer / less', 'fewer / fewer', 'less / less'],
          answer: 1,
          why: 'Passengers are counted (<em>fewer</em>); queuing is a mass activity (<em>less</em>).' },
        { id: 's3l3-04', type: 'pick', tag: 'less-fewer', level: 'B2',
          shop: 'Airline comparison',
          stem: 'Which airline should you choose if you want the FEWEST stops and are happy to pay more?',
          items: [
            { name: 'SkyLink', price: '฿6,200', note: '2 stops, 14 h' },
            { name: 'Nimbus Air', price: '฿9,800', note: 'direct, 6 h' },
            { name: 'BudgetGo', price: '฿4,100', note: '3 stops, 19 h' },
            { name: 'Pacific One', price: '฿7,400', note: '1 stop, 9 h' }
          ],
          answer: 1,
          why: 'Direct means zero stops — the fewest possible. <em>Fewest</em>, not <em>least</em>, because stops are counted.' },
        { id: 's3l3-05', type: 'table', tag: 'less-fewer', level: 'B2',
          table: { cols: ['Route', 'Stops', 'Journey time', 'Fare'], rows: [['Coastal', '6', '4 h 10', '฿380'], ['Express', '2', '2 h 45', '฿690'], ['Local', '11', '5 h 30', '฿240']] },
          stem: 'Complete: "The Express has ___ stops and takes ___ three hours."',
          options: ['less / fewer than', 'fewer / less than', 'fewer / fewer than', 'less / less than'],
          answer: 1,
          why: 'Stops are counted → <em>fewer</em>. Three hours is a measured amount → <em>less than</em>.' },
        { id: 's3l3-06', type: 'build', tag: 'less-fewer', level: 'B2',
          stem: 'Sunday timetable: half the usual services, and the roads are empty. Say both in one sentence.',
          tiles: ['There', 'are', 'fewer', 'buses', 'but', 'less', 'traffic', 'on', 'Sundays.'],
          solution: 'There are fewer buses but less traffic on Sundays.',
          why: 'One countable noun, one uncountable, in a single sentence — the cleanest way to feel the split.' },
        { id: 's3l3-08', type: 'sort', tag: 'less-fewer', level: 'B2',
          stem: 'Six nouns from a train timetable. Which word goes in front of each?',
          bins: [
            { key: 'fewer', label: 'fewer', hint: 'you can count them' },
            { key: 'less', label: 'less', hint: 'a mass or an amount' }
          ],
          items: [
            { text: 'delays', bin: 'fewer' }, { text: 'passengers', bin: 'fewer' }, { text: 'carriages', bin: 'fewer' },
            { text: 'congestion', bin: 'less' }, { text: 'luggage', bin: 'less' }, { text: 'than 20 minutes', bin: 'less' }
          ],
          why: 'The last one is the trap. Minutes look countable, but a stretch of time is a measured <em>amount</em>, so it takes <em>less</em> — as do money and distance.' }
      ]
    }
  ]
});

/* ===== STAGE 4 — TIMETABLE ============================================= */
STAGES.push({
  id: 's4', art: 'timetable', n: 4, name: 'Timetable', cefr: 'B2',
  gate: 'Gate 4',
  blurb: '"It is faster" tells nobody anything. This stage is about the slot in front of the comparative — the one that says how much.',
  lessons: [
    {
      id: 's4l1', name: 'How much more? The differential slot', cefr: 'B2',
      theory: {
        key: 'In front of every comparative there is a slot for the size of the gap. Fill it.',
        body: [
          '<em>The metro is faster.</em> Faster by a minute, or by an hour? A bare comparative carries almost no information, and filling the slot in front of it is the single fastest upgrade from B2 to C1 writing.',
          'Four kinds of filler:',
          '<strong>A measure phrase</strong> — <em>ten minutes faster</em>, <em>two stops further</em>, <em>฿400 cheaper</em>, <em>3 kg lighter</em>.',
          '<strong>A large vague degree</strong> — <em>much, far, a lot, considerably, substantially, significantly, vastly</em>.',
          '<strong>A small vague degree</strong> — <em>slightly, a little, a bit, marginally, somewhat</em>.',
          '<strong>Zero</strong> — <em>no faster than the bus</em>, <em>not any cheaper</em>.',
          'Notice the order is fixed: the differential always comes <u>first</u>, before the adjective. <em>ten minutes faster</em>, never <em>*faster ten minutes</em>.'
        ],
        simple: [
          'Always say <strong>how much</strong>: <em>ten minutes faster</em>, <em>฿400 cheaper</em>.',
          'Big gap: <em>much, far, a lot, considerably</em>.',
          'Small gap: <em>slightly, a little, a bit, marginally</em>.',
          'No gap: <em>no faster</em>, <em>not any cheaper</em>.',
          'The amount goes <strong>before</strong> the adjective.'
        ],
        examples: [
          { s: 'The express is <strong>twelve minutes</strong> faster and <strong>฿250</strong> dearer.', g: 'TWO MEASURE PHRASES — CHECKABLE CLAIMS' },
          { s: 'The new terminal is <strong>considerably</strong> easier to navigate.', g: 'LARGE VAGUE DEGREE' },
          { s: 'The night bus is <strong>only marginally</strong> cheaper.', g: 'SMALL VAGUE DEGREE + HEDGE' }
        ]
      },
      items: [
        { id: 's4l1-01', type: 'spot', tag: 'differential', level: 'B2',
          stem: 'Click the word in the wrong position.',
          words: ['The', 'express', 'is', 'faster', 'twelve', 'minutes', 'than', 'the', 'local.'],
          answer: 3, fix: 'twelve minutes faster',
          why: 'The differential always precedes the comparative: <em>twelve minutes faster than the local</em>.' },
        { id: 's4l1-02', type: 'table', tag: 'differential', level: 'B2',
          table: { cols: ['Service', 'Departs', 'Arrives', 'Fare'], rows: [['Local', '08:05', '10:40', '฿180'], ['Express', '08:20', '10:15', '฿430']] },
          stem: 'Complete: "The Express is ___ than the Local, but ฿250 dearer."',
          options: ['much faster', 'forty minutes faster', 'slightly faster', 'no faster'],
          answer: 1,
          why: 'Local: 2 h 35. Express: 1 h 55. The gap is exactly 40 minutes — so use the measure phrase, not a vague one.' },
        { id: 's4l1-03', type: 'gap', tag: 'differential', level: 'B2',
          lines: [
            { who: 'Ben', text: 'Is the airport line worth it? It is 45 baht against 40 on the bus.' },
            { who: 'Pim', text: 'It is ___ more expensive, and it saves you an hour. Take it.' }
          ],
          options: ['much', 'far', 'only marginally', 'considerably'],
          answer: 2,
          why: 'A five-baht gap is tiny, so the filler must be a small-degree one. <em>Much</em> or <em>far</em> would misrepresent the data.' },
        { id: 's4l1-04', type: 'order', tag: 'differential', level: 'B2',
          stem: 'Order these from the SMALLEST difference to the LARGEST.',
          items: ['marginally cheaper', 'slightly cheaper', 'considerably cheaper', 'vastly cheaper'],
          why: 'The vague degree words form a real scale, and choosing the right rung is what makes writing sound precise rather than approximate.' },
        { id: 's4l1-05', type: 'build', tag: 'differential', level: 'B2',
          stem: 'Car ferry: 2 h 10. Fast ferry: 1 h 30. Make a claim a passenger could check against the timetable.',
          tiles: ['The', 'fast', 'ferry', 'is', 'forty', 'minutes', 'quicker', 'than', 'the', 'car', 'ferry.'],
          solution: 'The fast ferry is forty minutes quicker than the car ferry.',
          why: 'Differential + comparative + <em>than</em> + standard. All four slots filled.' },
        { id: 's4l1-06', type: 'choose', tag: 'differential', level: 'B2',
          stem: 'Which sentence would score highest in an IELTS Task 1 answer?',
          options: ['Rail travel got better.', 'Rail travel was more popular than car travel.', 'Rail journeys rose considerably while car journeys fell.', 'Rail journeys rose by 41% while car journeys fell by 6%.'],
          answer: 3,
          why: 'The differential slot is where the data lives. A figure beats a graded adverb, and a graded adverb beats a bare comparative.' }
      ]
    },
    {
      id: 's4l2', name: 'very vs much', cefr: 'B2',
      theory: {
        key: 'very intensifies a POINT. much and far measure a GAP. That is why *very faster is impossible.',
        body: [
          'This is not an irregularity to memorise — it follows from what the words do.',
          '<em>Very</em> intensifies a <strong>position</strong> on a scale: <em>very fast</em> = far along the speed scale.',
          'A comparative does not name a position. It names a <strong>difference</strong> between two positions — and a difference is measured, not intensified. So it takes <em>much, far, a lot, considerably</em>.',
          '<em>very fast</em> ✓ &nbsp;&nbsp; <em>*very faster</em> ✗ &nbsp;&nbsp; <em>much faster</em> ✓ &nbsp;&nbsp; <em>*much fast</em> ✗',
          'One apparent exception proves the rule. <em>The very fastest service</em> is fine — but there <em>very</em> does not mean "to a high degree". It means <strong>precisely that one, no other</strong>. Compare <em>the very last train</em>. It is a different word that happens to share a spelling.',
          'Superlatives have their own intensifier family in the same slot: <em>by far the busiest</em>, <em>easily the cheapest</em>, <em>comfortably the best</em>, <em>far and away the most reliable</em>.'
        ],
        simple: [
          '<em>very</em> + normal adjective: <em>very fast</em>.',
          '<em>much / far</em> + comparative: <em>much faster</em>.',
          'Never <em>very faster</em>. Never <em>much fast</em>.',
          '<em>the very best</em> is allowed — there <em>very</em> means "exactly that one".',
          'With superlatives: <em>by far the best</em>, <em>easily the cheapest</em>.'
        ],
        examples: [
          { s: 'Security was <strong>very</strong> slow, so the lounge route was <strong>much</strong> quicker.', g: 'POINT, THEN GAP' },
          { s: 'That is <strong>by far</strong> the busiest gate in the terminal.', g: 'SUPERLATIVE INTENSIFIER' },
          { s: 'We caught <strong>the very last</strong> train.', g: 'IDENTITY, NOT DEGREE' }
        ]
      },
      items: [
        { id: 's4l2-01', type: 'spot', tag: 'very-much', level: 'B2',
          stem: 'Click the wrong word.',
          words: ['The', 'new', 'signalling', 'makes', 'the', 'line', 'very', 'more', 'reliable.'],
          answer: 6, fix: 'far / much',
          why: '<em>Very</em> intensifies a point on a scale; a comparative names a gap, and gaps take <em>much</em> or <em>far</em>.' },
        { id: 's4l2-02', type: 'choose', tag: 'very-much', level: 'B2',
          stem: 'Which pair is correct?',
          options: ['very crowded / very more crowded', 'much crowded / much more crowded', 'very crowded / much more crowded', 'much crowded / very more crowded'],
          answer: 2,
          why: 'Plain adjective takes <em>very</em>; comparative takes <em>much</em>. Each modifier has exactly one home.' },
        { id: 's4l2-03', type: 'judge', tag: 'very-much', level: 'B2',
          given: 'We booked the very cheapest seats on the aircraft.',
          stem: 'Is this correct English?',
          answer: 0,
          why: 'Yes — with a superlative, <em>very</em> means "precisely that one", not "to a high degree". It is a different word from the <em>very</em> in <em>very cheap</em>.' },
        { id: 's4l2-04', type: 'gap', tag: 'very-much', level: 'B2',
          lines: [
            { who: 'Mai', text: 'Is Terminal 3 any better since the rebuild?' },
            { who: 'Jun', text: 'It is ___ better. You can actually find the gates now.' }
          ],
          options: ['very', 'far', 'so', 'too'],
          answer: 1,
          why: '<em>Better</em> is a comparative, so it takes a gap-measuring word: <em>far</em>, <em>much</em>, <em>a lot</em>.' },
        { id: 's4l2-05', type: 'build', tag: 'very-much', level: 'B2',
          stem: 'The airport hotel had aircraft overhead all night — and cost half what the city hotel did. One sentence.',
          tiles: ['The', 'airport', 'hotel', 'was', 'very', 'noisy', 'but', 'much', 'cheaper.'],
          solution: 'The airport hotel was very noisy but much cheaper.',
          why: 'Both modifiers in one sentence, each with the form it belongs to.' }
      ]
    },
    {
      id: 's4l3', name: 'no better, by far the best', cefr: 'B2+',
      theory: {
        key: 'no + comparative means "equal or worse", and it always carries disappointment.',
        body: [
          '<em>The new timetable is <strong>no faster</strong> than the old one.</em> This does not mean "slower". It means "not faster" — equal at best — and it implies that someone expected an improvement and did not get one.',
          'Compare the neutral version: <em>The new timetable is <strong>not faster</strong> than the old one.</em> Same facts, no attitude.',
          'The same structure gives English some of its most useful understatement: <em>no better than before</em>, <em>none the wiser</em>, <em>no cheaper for all that queuing</em>.',
          'On the other side, superlatives take a family of intensifiers in the differential slot: <em>by far</em>, <em>easily</em>, <em>comfortably</em>, <em>far and away</em>, <em>much</em>. <em>By far the busiest station</em>, <em>easily the least reliable airline</em>.',
          'Finally, two emphatic frames that mean the opposite of what their shape suggests: <em>no fewer than 300 passengers</em> means surprisingly many, and <em>no less than a complete rebuild</em> is emphasis, not reduction.'
        ],
        simple: [
          '<em>no faster</em> = not faster, and I am disappointed.',
          '<em>not faster</em> = just a fact, no feeling.',
          'Before superlatives use <em>by far</em>, <em>easily</em>, <em>comfortably</em>.',
          '<em>no fewer than 300</em> = that is a LOT of people.'
        ],
        examples: [
          { s: 'After the rebuild, check-in is <strong>no quicker</strong> than before.', g: 'EQUAL OR WORSE, PLUS DISAPPOINTMENT' },
          { s: 'Changi is <strong>by far</strong> the easiest airport to connect through.', g: 'SUPERLATIVE INTENSIFIER' },
          { s: '<strong>No fewer than</strong> 300 passengers were left at the gate.', g: 'EMPHASIS: SURPRISINGLY MANY' }
        ]
      },
      items: [
        { id: 's4l3-01', type: 'equiv', tag: 'no-comparative', level: 'B2+',
          given: 'The refurbished lounge is no better than the old one.',
          stem: 'What does the speaker feel?',
          options: ['Pleased — it has improved.', 'Neutral — they are only reporting a fact.', 'Disappointed — they expected an improvement and did not get one.', 'Confused — they cannot remember the old lounge.'],
          answer: 2,
          why: '<em>No + comparative</em> carries the attitude. The neutral version would be <em>not better than</em>.' },
        { id: 's4l3-02', type: 'gap', tag: 'no-comparative', level: 'B2+',
          lines: [
            { who: 'Kit', text: 'Which airport would you connect through?' },
            { who: 'Nok', text: 'Singapore, ___. Everything else is a gamble.' }
          ],
          options: ['by far', 'very much', 'much more', 'the most'],
          answer: 0,
          why: '<em>By far</em> is a superlative intensifier and can stand alone after a choice, meaning "by far the best".' },
        { id: 's4l3-03', type: 'choose', tag: 'no-comparative', level: 'B2+',
          stem: '"No fewer than 300 passengers were stranded overnight." What is the writer signalling?',
          options: ['That the number is small.', 'That the number is surprisingly large.', 'That the number is uncertain.', 'That nobody was stranded.'],
          answer: 1,
          why: '<em>No fewer than</em> is emphatic: it invites the reader to be impressed by the size of the figure.' },
        { id: 's4l3-04', type: 'spot', tag: 'no-comparative', level: 'B2+',
          stem: 'Click the wrong word.',
          words: ['Haneda', 'is', 'very', 'far', 'the', 'best', 'connected', 'airport', 'in', 'the', 'region.'],
          answer: 2, fix: 'by',
          why: 'The superlative intensifier is <em>by far</em>. <em>Very far</em> is a distance, not a degree.' },
        { id: 's4l3-05', type: 'judge', tag: 'no-comparative', level: 'B2+',
          given: 'The express is no faster than the local service.',
          stem: 'Does this sentence tell us the express is slower?',
          answer: 1,
          why: 'No. It rules out "faster" and allows "equal" — the two services may well take the same time.' }
      ]
    }
  ]
});

/* ===== STAGE 5 — TERMS & CONDITIONS ==================================== */
STAGES.push({
  id: 's5', art: 'contract', n: 5, name: 'Terms & Conditions', cefr: 'B2',
  gate: 'Gate 5',
  blurb: 'The small print of comparison. What exactly is being compared with what — and why "cheaper than Tokyo" is the most common C1 writing error in the language.',
  lessons: [
    {
      id: 's5l1', name: 'Compare like with like', cefr: 'B2',
      theory: {
        key: 'The thing after than must be the SAME TYPE as the thing before it.',
        body: [
          '<em>Fares in Bangkok are cheaper than Tokyo.</em> Read it literally: a set of prices is being compared with a city. That is a category error, and it is the commonest advanced writing mistake in this whole topic.',
          'Three repairs, all worth knowing, because each fits a different noun:',
          '<strong>than those in</strong> — for plural countable nouns: <em>Fares in Bangkok are cheaper than <u>those in</u> Tokyo.</em>',
          '<strong>than that of</strong> — for singular or uncountable nouns: <em>The population of Osaka is smaller than <u>that of</u> Tokyo.</em>',
          '<strong>than in</strong> — reuse the preposition, the lightest repair: <em>Fares are cheaper in Bangkok than <u>in</u> Tokyo.</em>',
          'The same logic applies to possessives: <em>My flight was cheaper than <u>yours</u></em>, not <em>*than you</em>.',
          'The test is mechanical. Say the sentence again with the missing words restored. If the full version is nonsense, the short version is wrong.'
        ],
        simple: [
          'Both sides of <em>than</em> must be the same kind of thing.',
          'Prices vs prices, not prices vs a city.',
          'Plural things: <em>than <strong>those in</strong> Tokyo</em>.',
          'One thing / uncountable: <em>than <strong>that of</strong> Tokyo</em>.',
          'Or just repeat the preposition: <em>cheaper in Bangkok than <strong>in</strong> Tokyo</em>.'
        ],
        examples: [
          { s: '<s>Hotels in Kyoto are dearer than Osaka.</s>', g: 'HOTELS COMPARED WITH A CITY' },
          { s: 'Hotels in Kyoto are dearer than <strong>those in</strong> Osaka.', g: 'PLURAL COUNTABLE → THOSE IN' },
          { s: 'The climate of Hokkaido is colder than <strong>that of</strong> Kyushu.', g: 'UNCOUNTABLE → THAT OF' }
        ]
      },
      items: [
        { id: 's5l1-01', type: 'spot', tag: 'cat-match', level: 'B2',
          stem: 'The comparison is broken. Click the word where the repair must go.',
          words: ['Hotel', 'prices', 'in', 'Kyoto', 'are', 'higher', 'than', 'Osaka.'],
          answer: 7, fix: 'those in Osaka',
          why: 'A set of prices is being compared with a city. Insert <em>those in</em> so that prices meet prices.' },
        { id: 's5l1-02', type: 'choose', tag: 'cat-match', level: 'B2',
          stem: 'Repair: "The population of Osaka is smaller than ___ Tokyo."',
          options: ['those in', 'that of', 'the one', 'it is'],
          answer: 1,
          why: '<em>Population</em> is singular and uncountable here, so the pro-form is <em>that</em>, and it needs <em>of</em> to attach to Tokyo.' },
        { id: 's5l1-03', type: 'gap', tag: 'cat-match', level: 'B2',
          lines: [
            { who: 'Pim', text: 'Are the beaches better in Krabi or Phuket?' },
            { who: 'Ton', text: 'Krabi, easily. The beaches there are quieter than ___ Phuket.' }
          ],
          options: ['Phuket', 'those in', 'that of', 'they are in'],
          answer: 1,
          why: 'Beaches are plural and countable, so <em>those in</em>. (<em>Than they are in Phuket</em> is also possible but heavier.)' },
        { id: 's5l1-04', type: 'equiv', tag: 'cat-match', level: 'B2',
          given: 'My ticket was cheaper than my sister.',
          stem: 'What does this sentence literally say?',
          options: ['The ticket cost less than the sister\'s ticket.', 'The ticket cost less than the sister herself costs.', 'The sister bought a cheap ticket.', 'Both tickets cost the same.'],
          answer: 1,
          why: 'A ticket is being priced against a person. The repair is <em>than my sister\'s</em> — a possessive that stands for "my sister\'s ticket".' },
        { id: 's5l1-05', type: 'build', tag: 'cat-match', level: 'B2',
          stem: 'Bangkok fares average ฿45; Tokyo fares average ฿380. Compare them, making sure both sides of <em>than</em> are the same kind of thing.',
          tiles: ['Fares', 'in', 'Bangkok', 'are', 'lower', 'than', 'those', 'in', 'Tokyo.'],
          solution: 'Fares in Bangkok are lower than those in Tokyo.',
          why: '<em>Those</em> stands for "fares", so both sides of <em>than</em> are now sets of fares.' },
        { id: 's5l1-07', type: 'sort', tag: 'cat-match', level: 'B2+',
          stem: 'Each sentence needs a repair after <em>than</em>. Which repair does each one take?',
          bins: [
            { key: 'those', label: 'than those in', hint: 'plural, countable' },
            { key: 'that', label: 'than that of', hint: 'singular or uncountable' }
          ],
          items: [
            { text: 'Fares in Bangkok are lower than …', bin: 'those' },
            { text: 'Hotels in Kyoto are dearer than …', bin: 'those' },
            { text: 'Beaches in Krabi are quieter than …', bin: 'those' },
            { text: 'The climate of Hokkaido is colder than …', bin: 'that' },
            { text: 'The population of Osaka is smaller than …', bin: 'that' },
            { text: 'The traffic in Chiang Mai is lighter than …', bin: 'that' }
          ],
          why: 'The pro-form has to match the noun it stands for. Plural countable nouns take <em>those</em>; singular and uncountable nouns take <em>that</em>.' },
        { id: 's5l1-06', type: 'choose', tag: 'cat-match', level: 'B2+',
          stem: 'Which version would a careful academic writer choose?',
          options: ['Rail use in Japan is higher than Thailand.', 'Rail use in Japan is higher than Thailand is.', 'Rail use is higher in Japan than in Thailand.', 'Rail use in Japan is higher than Thailand does.'],
          answer: 2,
          why: 'The lightest correct repair is to repeat the preposition. Both sides now compare rail use in a place with rail use in a place.' }
      ]
    },
    {
      id: 's5l2', name: 'than is a clause in disguise', cefr: 'B2+',
      theory: {
        key: 'What follows than is a reduced clause. Restore the verb and every problem disappears.',
        body: [
          'The deepest fact in the topic: <em>than</em> does not introduce a noun. It introduces a <strong>clause</strong> with everything predictable deleted.',
          '<em>The express is faster than the local <span class="ghost">[is ___ fast]</span>.</em>',
          'Three consequences you can use.',
          '<strong>1. The pronoun problem dissolves.</strong> <em>than I</em> or <em>than me</em>? Both are defensible, because <em>than</em> behaves as a conjunction for some speakers and a preposition for others. Sidestep it: <em>than I do</em>, <em>than we did</em>, <em>than she does</em>.',
          '<strong>2. Some comparisons are genuinely ambiguous.</strong> <em>The guide helped the driver more than the conductor.</em> More than the conductor helped the driver? Or more than the guide helped the conductor? Both readings exist because a clause has two positions the remnant could have come from. Restore the piece that disambiguates.',
          '<strong>3. You can compare two different scales.</strong> <em>The platform is longer than the train is wide.</em> This is only possible if a full clause is available after <em>than</em>.',
          'And parallelism: the two sides of <em>than</em> should have the same grammatical shape. <em>Flying is faster than taking the train</em>, not <em>*than to take the train</em>.'
        ],
        simple: [
          'After <em>than</em> there is a hidden verb.',
          'Not sure about <em>than me</em> / <em>than I</em>? Add the verb: <strong>than I do</strong>.',
          '<em>…more than the conductor</em> can mean two things. Add words to make it clear.',
          'Keep both sides the same shape: <em>flying … than taking</em>, not <em>flying … than to take</em>.'
        ],
        examples: [
          { s: 'She travels more than <strong>I do</strong>.', g: 'RESTORE THE VERB — NO CASE ARGUMENT LEFT' },
          { s: 'The platform is longer than the train <strong>is wide</strong>.', g: 'TWO SCALES — PROOF A CLAUSE IS THERE' },
          { s: 'Flying is faster than <strong>taking</strong> the train.', g: 'PARALLEL SHAPES: -ING WITH -ING' }
        ]
      },
      items: [
        { id: 's5l2-01', type: 'choose', tag: 'than-clause', level: 'B2+',
          stem: 'Which version removes the argument about than me / than I?',
          options: ['She flies more often than me.', 'She flies more often than I.', 'She flies more often than I do.', 'She flies more often than mine.'],
          answer: 2,
          why: 'Restoring the auxiliary makes the clause visible and the case question disappears. This is the version to use in exam writing.' },
        { id: 's5l2-02', type: 'judge', tag: 'than-clause', level: 'B2+',
          given: 'The guide helped the driver more than the conductor.',
          stem: 'Is there exactly one possible meaning?',
          answer: 1,
          why: 'No — two. "…than the conductor helped the driver" or "…than the guide helped the conductor". The ambiguity is evidence that <em>than</em> takes a clause.' },
        { id: 's5l2-03', type: 'spot', tag: 'than-clause', level: 'B2+',
          stem: 'The two halves do not match. Click the word that breaks the parallel.',
          words: ['Flying', 'is', 'quicker', 'than', 'to', 'take', 'the', 'overnight', 'train.'],
          answer: 4, fix: 'taking',
          why: 'Both sides of <em>than</em> should share a shape. <em>Flying</em> is an -ing form, so the other side must be <em>taking</em>.' },
        { id: 's5l2-04', type: 'gap', tag: 'than-clause', level: 'B2+',
          lines: [
            { who: 'Nok', text: 'Will the coach fit under that bridge?' },
            { who: 'Driver', text: 'No. The coach is taller ___ .' }
          ],
          options: ['than the bridge', 'than the bridge is high', 'than high the bridge', 'as the bridge is high'],
          answer: 1,
          why: 'Two different measurements — height of coach against height of bridge — so the full clause has to be spelled out. This is comparative subdeletion.' },
        { id: 's5l2-05', type: 'build', tag: 'than-clause', level: 'B2+',
          stem: 'You allowed twenty minutes for security. It took fifty-five. Say so, keeping a full clause after <em>than</em>.',
          tiles: ['The', 'queue', 'was', 'longer', 'than', 'we', 'had', 'expected.'],
          solution: 'The queue was longer than we had expected.',
          why: 'A full clause after <em>than</em>, with the adjective deleted — the normal, invisible case.' }
      ]
    },
    {
      id: 's5l3', name: 'any and ever after than', cefr: 'B2+',
      theory: {
        key: 'After than, use any and ever — not some.',
        body: [
          'Something odd happens inside a <em>than</em>-clause. Words that normally need a negative — <em>any</em>, <em>ever</em>, <em>at all</em>, <em>yet</em> — become available with no negative in sight.',
          '<em>This route is faster than <strong>any</strong> other.</em><br><em>Punctuality is better than it has <strong>ever</strong> been.</em><br><em>The fleet is newer than I would <strong>ever</strong> have expected.</em>',
          'The reason is that a <em>than</em>-clause reverses the direction of inference, and reversed environments license these words. You do not need the theory to use it — you need the habit.',
          'The practical payoff is large. Learners write <em>faster than <u>some</u> other routes</em>, which is grammatical but instantly marks the writer as non-native. <em>Faster than <u>any</u> other route</em> is what a native writer produces, and it is also stronger.',
          'The same licensing works after superlatives: <em>the best hotel I have <strong>ever</strong> stayed in</em>.'
        ],
        simple: [
          'After <em>than</em>, use <strong>any</strong>, not <em>some</em>.',
          '<em>faster than <strong>any</strong> other route</em> ✓',
          '<em>faster than <strong>some</strong> other routes</em> — grammatical, but it sounds like a learner.',
          'Also use <strong>ever</strong>: <em>better than it has ever been</em>, <em>the best I have ever had</em>.'
        ],
        examples: [
          { s: 'Terminal 4 is cleaner than <strong>any</strong> other in the country.', g: '"ANY" LICENSED BY THE COMPARATIVE' },
          { s: 'Fares are higher than they have <strong>ever</strong> been.', g: '"EVER" WITH NO NEGATIVE PRESENT' }
        ]
      },
      items: [
        { id: 's5l3-01', type: 'spot', tag: 'any-ever', level: 'B2+',
          stem: 'One word makes this sound like a learner. Click it.',
          words: ['The', 'night', 'train', 'is', 'more', 'comfortable', 'than', 'some', 'other', 'services.'],
          answer: 7, fix: 'any',
          why: 'Comparatives license <em>any</em>. <em>Some</em> is grammatical but weak and non-native here.' },
        { id: 's5l3-02', type: 'gap', tag: 'any-ever', level: 'B2+',
          lines: [
            { who: 'Ben', text: 'How was the new lounge?' },
            { who: 'Mai', text: 'Better than it has ___ been. They finally fixed the wifi.' }
          ],
          options: ['never', 'ever', 'always', 'yet'],
          answer: 1,
          why: 'The <em>than</em>-clause licenses <em>ever</em> without any negative word.' },
        { id: 's5l3-03', type: 'equiv', tag: 'any-ever', level: 'B2+',
          given: 'It is the worst delay I have ever experienced.',
          stem: 'Which comparative version says the same thing?',
          options: ['It is worse than some delays I have experienced.', 'It is worse than any delay I have ever experienced.', 'It is as bad as the delays I have experienced.', 'It is not the worst delay I have experienced.'],
          answer: 1,
          why: 'Superlative ↔ comparative + <em>any</em> is a standard transformation, and both sides license <em>ever</em>.' },
        { id: 's5l3-04', type: 'choose', tag: 'any-ever', level: 'B2+',
          stem: 'Which sentence would a C1 writer produce?',
          options: ['Our fares are lower than some competitors.', 'Our fares are lower than any of our competitors\'.', 'Our fares are more low than competitors.', 'Our fares are lower as our competitors.'],
          answer: 1,
          why: 'Three things at once: <em>any</em> for the polarity, the possessive apostrophe for category match, and the correct frame.' },
        { id: 's5l3-05', type: 'build', tag: 'any-ever', level: 'B2+',
          stem: 'You have looked at nine hotels. This one beats every one of them on price. Say so.',
          tiles: ['This', 'is', 'cheaper', 'than', 'any', 'hotel', 'we', 'have', 'looked', 'at.'],
          solution: 'This is cheaper than any hotel we have looked at.',
          why: '<em>Any</em> inside a <em>than</em>-clause, plus the present perfect that these structures attract.' }
      ]
    }
  ]
});

/* ===== STAGE 6 — DEPARTURES BOARD ====================================== */
STAGES.push({
  id: 's6', art: 'board', n: 6, name: 'Departures Board', cefr: 'B2+',
  gate: 'Gate 6',
  blurb: 'Superlatives, properly. When the disappears, how the set is really chosen, and the three different words spelled most.',
  lessons: [
    {
      id: 's6l1', name: 'When the superlative loses its the', cefr: 'B2+',
      theory: {
        key: 'Comparing one thing across CONDITIONS is not the same as comparing it against other THINGS.',
        body: [
          'Two sentences that look identical and are not:',
          '<em>The 08:10 is <strong>the</strong> most crowded train on the line.</em> — the 08:10 against other trains. A set of things, one winner, so <em>the</em>.',
          '<em>The 08:10 is most crowded on Mondays.</em> — the 08:10 against itself, on different days. There is no set of things at all, so there is nothing to be unique among, and the article goes.',
          'This second pattern is everywhere in travel English: <em>Traffic is heaviest between 07:00 and 09:00. Fares are cheapest on Tuesdays. The hotel is busiest in August. The beach is quietest before eight.</em>',
          'Two other situations remove the article for different reasons. A <strong>possessive</strong> already carries the definiteness: <em>Japan\'s busiest station</em>, <em>our cheapest option</em>. And an <strong>adverbial</strong> superlative often drops it: <em>Which line runs (the) most frequently?</em>',
          'Test yourself with one question: <em>am I comparing this thing with OTHER THINGS, or with ITSELF at other times?</em> Other things → <em>the</em>. Itself → no article.'
        ],
        simple: [
          'Compare with other things → use <strong>the</strong>: <em>the busiest station</em>.',
          'Compare one thing with itself at different times → <strong>no the</strong>: <em>traffic is heaviest at 8am</em>.',
          'More examples with no <em>the</em>: <em>fares are cheapest on Tuesdays</em>, <em>the hotel is busiest in August</em>.',
          '<em>My</em>, <em>our</em>, <em>Japan\'s</em> also replace <em>the</em>.'
        ],
        examples: [
          { s: 'Shinjuku is <strong>the</strong> busiest station in the world.', g: 'AGAINST OTHER STATIONS → ARTICLE' },
          { s: 'Shinjuku is busiest between 07:30 and 09:00.', g: 'AGAINST ITSELF AT OTHER TIMES → NO ARTICLE' },
          { s: 'Fares are cheapest on Tuesdays.', g: 'ONE THING, MANY CONDITIONS' }
        ]
      },
      items: [
        { id: 's6l1-01', type: 'choose', tag: 'zero-article', level: 'B2+',
          stem: 'Which sentence needs NO article before the superlative?',
          options: ['Shinjuku is ___ busiest station in Tokyo.', 'Traffic on the ring road is ___ heaviest at 8 a.m.', 'That was ___ worst hotel of the trip.', 'Capsule 9 is ___ cheapest of the three.'],
          answer: 1,
          why: 'Only the second compares one thing with itself across times. The others compare members of a set, so they need <em>the</em>.' },
        { id: 's6l1-02', type: 'spot', tag: 'zero-article', level: 'B2+',
          stem: 'Click the word that should be removed.',
          words: ['Airport', 'fares', 'are', 'the', 'cheapest', 'on', 'Tuesday', 'mornings.'],
          answer: 3, fix: 'delete "the"',
          why: 'Fares are being compared with themselves at other times, not with other fares. No set of entities, no article.' },
        { id: 's6l1-03', type: 'gap', tag: 'zero-article', level: 'B2+',
          lines: [
            { who: 'Pim', text: 'When should we go to the temple?' },
            { who: 'Guide', text: 'Early. It is ___ between eleven and two, when the tour buses arrive.' }
          ],
          options: ['the most crowded', 'most crowded', 'more crowded', 'crowded most'],
          answer: 1,
          why: 'One temple, different times of day — conditions, not entities, so no article.' },
        { id: 's6l1-04', type: 'equiv', tag: 'zero-article', level: 'B2+',
          given: 'The Sakura Inn is busiest in cherry-blossom season.',
          stem: 'What is the Sakura Inn being compared with?',
          options: ['Other hotels in the city.', 'Itself, at other times of year.', 'All hotels in Japan.', 'Nothing — it is a simple statement.'],
          answer: 1,
          why: 'The missing article is the clue. An entity comparison would read <em>the busiest hotel in the city</em>.' },
        { id: 's6l1-05', type: 'build', tag: 'zero-article', level: 'B2+',
          stem: 'Same station, different hours: shoulder to shoulder at 08:00, almost empty at 14:00. Describe the afternoon lull.',
          tiles: ['The', 'station', 'is', 'quietest', 'just', 'after', 'lunch.'],
          solution: 'The station is quietest just after lunch.',
          why: 'The <em>the</em> belongs to <em>station</em>, not to the superlative — there is no article in front of <em>quietest</em>.' }
      ]
    },
    {
      id: 's6l2', name: 'Who is in the set?', cefr: 'B2+',
      theory: {
        key: 'A superlative is only as true as the group you compare inside.',
        body: [
          'Change the group and you change the fact. <em>The cheapest hotel</em> — in the city? On this street? Of the four we shortlisted? Each version can be true while the others are false.',
          'There is also a real ambiguity that causes quiet miscommunication in reports:',
          '<em>Nan booked the cheapest ticket.</em><br><strong>Absolute reading:</strong> the ticket that was cheapest, full stop.<br><strong>Relative reading:</strong> cheaper than anyone else\'s — Nan is the one who bought the cheapest of those bought.',
          'Fix it by making the set audible: <em>the cheapest ticket available</em> versus <em>a cheaper ticket than anyone else did</em>.',
          'And superlatives attract the present perfect when the set is "everything so far": <em>the worst delay I <strong>have ever</strong> had</em>, <em>the best meal we <strong>have had</strong> this trip</em>.',
          'One more: superlatives hedge beautifully in academic writing — <em>one of the most heavily used corridors</em>, <em>arguably the most efficient</em>, <em>among the least reliable</em>.'
        ],
        simple: [
          'Always say the group: <em>in the city</em>, <em>of the four</em>, <em>that we have seen</em>.',
          '<em>Nan booked the cheapest ticket</em> has two meanings. Say which you mean.',
          'Use the present perfect for "so far": <em>the worst I have ever had</em>.',
          'Softer versions: <em>one of the best</em>, <em>arguably the best</em>, <em>among the best</em>.'
        ],
        examples: [
          { s: 'That is the worst delay I <strong>have ever</strong> had.', g: 'SET = MY WHOLE LIFE SO FAR' },
          { s: 'It is <strong>arguably</strong> the most efficient system in Asia.', g: 'HEDGED SUPERLATIVE — ACADEMIC REGISTER' }
        ]
      },
      items: [
        { id: 's6l2-01', type: 'judge', tag: 'superlative-set', level: 'B2+',
          given: 'Nan booked the cheapest ticket.',
          stem: 'Does this definitely mean the ticket was the cheapest one on sale?',
          answer: 2,
          why: 'Can\'t tell. It may mean that, or it may mean Nan\'s was cheaper than everyone else\'s. Make the set audible to remove the doubt.' },
        { id: 's6l2-02', type: 'choose', tag: 'superlative-set', level: 'B2+',
          stem: 'Which version is unambiguous?',
          options: ['Nan booked the cheapest ticket.', 'Nan booked the cheapest ticket available.', 'Nan booked a cheapest ticket.', 'Nan booked cheapest ticket.'],
          answer: 1,
          why: '<em>Available</em> names the set explicitly, so only the absolute reading survives.' },
        { id: 's6l2-03', type: 'gap', tag: 'superlative-set', level: 'B2+',
          lines: [
            { who: 'Ton', text: 'How bad was the delay?' },
            { who: 'Nok', text: 'It was the worst I ___ . Nine hours on the floor at Gate 42.' }
          ],
          options: ['ever had', 'have ever had', 'had ever', 'am ever having'],
          answer: 1,
          why: 'When the superlative set is "my experience up to now", English uses the present perfect.' },
        { id: 's6l2-04', type: 'table', tag: 'superlative-set', level: 'B2+',
          table: { cols: ['Airline', 'On-time %', 'Fare', 'Baggage'], rows: [['Nimbus', '91%', '฿9,800', '23 kg'], ['SkyLink', '78%', '฿6,200', '20 kg'], ['Pacific One', '86%', '฿7,400', '30 kg'], ['BudgetGo', '64%', '฿4,100', '7 kg']] },
          stem: 'Which sentence is TRUE of this table?',
          options: ['BudgetGo is by far the least punctual of the four.', 'Nimbus has the most generous baggage allowance.', 'SkyLink is the cheapest airline in Asia.', 'Pacific One is the most punctual of the four.'],
          answer: 0,
          why: '64% is well below the next worst (78%), so <em>by far the least punctual</em> holds. The others each misstate the set or the data.' },
        { id: 's6l2-05', type: 'build', tag: 'superlative-set', level: 'B2+',
          stem: 'You think the network is outstanding, but you cannot prove it is the single best. Make the claim so it survives a challenge.',
          tiles: ['It', 'is', 'arguably', 'one', 'of', 'the', 'most', 'efficient', 'systems', 'in', 'Asia.'],
          solution: 'It is arguably one of the most efficient systems in Asia.',
          why: 'Two hedges stacked — <em>arguably</em> and <em>one of</em> — plus a plural noun and an <em>in</em>-set. Textbook academic register.' }
      ]
    },
    {
      id: 's6l3', name: 'Three different mosts', cefr: 'C1',
      theory: {
        key: 'Superlative most, intensifier most, quantifier most. Three words, one spelling.',
        body: [
          '<strong>1. Superlative <em>most</em></strong> — the maximum of a set. <em>The most punctual airline in the region.</em> It takes <em>the</em>, and it needs a set.',
          '<strong>2. Intensifier <em>most</em></strong> — simply means <em>very</em>, in a formal and evaluative register. <em>We experienced a most unusual delay.</em> It takes <em>a</em>, and there is <strong>no set at all</strong>. Nobody is being compared with anybody.',
          '<strong>3. Quantifier <em>most</em></strong> — means <em>the majority of</em>. <em>Most travellers book online.</em> It attaches straight to the noun, with no article.',
          'The tests are quick. <em>The</em> + set → superlative. <em>A</em> + no set → intensifier. Bare noun → quantifier.',
          'Students who only know the first will read <em>a most unusual delay</em> as an error, and will try to "fix" <em>most travellers</em> by adding <em>the</em>. Both corrections would be wrong.'
        ],
        simple: [
          '<em>the most</em> + set = the winner. <em>the most punctual airline in Asia</em>.',
          '<em>a most</em> = very. <em>a most unusual delay</em> = a very unusual delay.',
          '<em>most</em> + noun = the majority. <em>most travellers</em> = the majority of travellers.',
          'Look at the word before <em>most</em>: <em>the</em> / <em>a</em> / nothing.'
        ],
        examples: [
          { s: 'Nimbus is <strong>the most</strong> punctual airline in the region.', g: 'SUPERLATIVE: "THE" + A SET' },
          { s: 'It was <strong>a most</strong> unusual delay.', g: 'INTENSIFIER: = VERY. NO SET.' },
          { s: '<strong>Most</strong> travellers book online now.', g: 'QUANTIFIER: = THE MAJORITY OF' }
        ]
      },
      items: [
        { id: 's6l3-01', type: 'choose', tag: 'most-three', level: 'C1',
          stem: 'In "It was a most unusual delay", what does most mean?',
          options: ['The maximum of a set — no delay was longer.', 'Very. It is an intensifier, not a superlative.', 'The majority of delays.', 'It is an error for "the most".'],
          answer: 1,
          why: 'The giveaway is <em>a</em>. A superlative cannot take an indefinite article, because a superlative is unique by definition.' },
        { id: 's6l3-02', type: 'spot', tag: 'most-three', level: 'C1',
          stem: 'A student has "corrected" this sentence and made it wrong. Click their addition.',
          words: ['The', 'most', 'travellers', 'now', 'book', 'their', 'tickets', 'online.'],
          answer: 0, fix: 'delete "The"',
          why: 'Quantifier <em>most</em> attaches directly to the noun. <em>The most travellers</em> would be a superlative with no set.' },
        { id: 's6l3-03', type: 'gap', tag: 'most-three', level: 'C1',
          lines: [
            { who: 'Reviewer', text: 'The room itself was ordinary, but the staff made it ___ enjoyable stay.' },
            { who: 'Editor', text: 'Keep that phrasing — it sounds appropriately formal.' }
          ],
          options: ['the most', 'a most', 'most', 'most of'],
          answer: 1,
          why: 'Intensifier <em>most</em>: <em>a most enjoyable stay</em> = a very enjoyable stay. The <em>a</em> is what signals it.' },
        { id: 's6l3-04', type: 'order', tag: 'most-three', level: 'C1',
          stem: 'Order these by how many things are being compared: none, two, all of them.',
          items: ['a most agreeable journey', 'the more agreeable of the two routes', 'the most agreeable route in the region'],
          why: 'Intensifier (no comparison at all) → comparative (two) → superlative (a whole set). The spelling of <em>most</em> tells you almost nothing; the article does.' },
        { id: 's6l3-06', type: 'sort', tag: 'most-three', level: 'C1',
          stem: 'Six phrases, three different words spelled <em>most</em>. Sort them.',
          bins: [
            { key: 'sup', label: 'the most', hint: 'the winner of a set' },
            { key: 'int', label: 'a most', hint: '= very' },
            { key: 'qty', label: 'most + noun', hint: '= the majority' }
          ],
          items: [
            { text: 'the most punctual airline in Asia', bin: 'sup' },
            { text: 'the most crowded platform on the line', bin: 'sup' },
            { text: 'a most unusual delay', bin: 'int' },
            { text: 'a most agreeable crossing', bin: 'int' },
            { text: 'most travellers book online', bin: 'qty' },
            { text: 'most of the passengers had boarded', bin: 'qty' }
          ],
          why: 'The article decides it, not the word. <em>The</em> + a set means superlative; <em>a</em> with no set at all means <em>very</em>; a bare noun means <em>the majority of</em>.' },
        { id: 's6l3-05', type: 'judge', tag: 'most-three', level: 'C1',
          given: 'Most of the passengers had already boarded.',
          stem: 'Is this a superlative?',
          answer: 1,
          why: 'No — it is the quantifier, meaning "the majority of". No set is being ranked and nothing is unique.' }
      ]
    }
  ]
});

/* ===== STAGE 7 — THE LONG HAUL ========================================= */
STAGES.push({
  id: 's7', art: 'nightflight', n: 7, name: 'The Long Haul', cefr: 'C1',
  gate: 'Gate 7',
  blurb: 'Two quantities moving together, trends that keep going, and a thousand-year-old fossil hiding in "the more, the merrier".',
  lessons: [
    {
      id: 's7l1', name: 'The more you book ahead, the less you pay', cefr: 'C1',
      theory: {
        key: 'Two fronted comparatives, no conjunction, and a compulsory comma.',
        body: [
          'English has a dedicated structure for two quantities that move together:',
          '<em><strong>The earlier</strong> you book, <strong>the cheaper</strong> the fare.</em><br><em><strong>The longer</strong> the layover, <strong>the more</strong> you pay in food.</em><br><em><strong>The more</strong> you automate check-in, <strong>the fewer</strong> staff you need.</em>',
          'The shape is rigid. Both comparatives are pushed to the <strong>front</strong> of their clause, there is <strong>no</strong> joining word between them, and in writing the <strong>comma is obligatory</strong>.',
          'The verb can often be dropped when it is <em>be</em>: <em>The faster the train, the shorter the journey</em> — no <em>is</em> needed in either half.',
          'Now the beautiful part. Those two <em>the</em>s are <strong>not the definite article</strong>. They come from Old English <em>þȳ</em>, the instrumental case of the demonstrative, meaning "by that much". The structure literally says: <em>by how much X, by that much Y</em>.',
          'Once you know that, a whole family of odd expressions makes sense — every one is the same fossil: <em>all <u>the</u> better</em> (better by all of that), <em>none <u>the</u> wiser</em>, <em>so much <u>the</u> worse for the timetable</em>, <em><u>the</u> more <u>the</u> merrier</em>.'
        ],
        simple: [
          'Pattern: <strong>The + comparative + clause, the + comparative + clause.</strong>',
          '<em>The earlier you book, the cheaper it is.</em>',
          'No <em>and</em>, no <em>so</em>. Just a comma.',
          'With <em>be</em> you can drop the verb: <em>The faster the train, the shorter the journey.</em>',
          'These <em>the</em>s are old words meaning "by that much" — not "the".'
        ],
        examples: [
          { s: '<strong>The earlier</strong> you book, <strong>the less</strong> you pay.', g: 'BOTH COMPARATIVES FRONTED, COMMA BETWEEN' },
          { s: '<strong>The faster</strong> the train, <strong>the shorter</strong> the journey.', g: 'VERB "BE" DROPPED IN BOTH HALVES' },
          { s: 'The upgrade was free, which made it <strong>all the better</strong>.', g: 'THE SAME FOSSIL "THE": BETTER BY ALL OF THAT' }
        ]
      },
      items: [
        { id: 's7l1-01', type: 'spot', tag: 'correlative', level: 'C1',
          stem: 'One word should not be there. Click it.',
          words: ['The', 'earlier', 'you', 'book,', 'and', 'the', 'cheaper', 'the', 'fare', 'is.'],
          answer: 4, fix: 'delete "and"',
          why: 'The correlative takes no conjunction. The comma alone joins the two halves.' },
        { id: 's7l1-02', type: 'build', tag: 'correlative', level: 'C1',
          stem: 'Airport food is expensive, and a long wait between flights means more meals. State the rule.',
          tiles: ['The', 'longer', 'the', 'layover,', 'the', 'more', 'you', 'spend', 'on', 'food.'],
          solution: 'The longer the layover, the more you spend on food.',
          why: 'Both comparatives fronted; the verb <em>is</em> is dropped in the first half.' },
        { id: 's7l1-03', type: 'gap', tag: 'correlative', level: 'C1',
          lines: [
            { who: 'Agent', text: 'Prices change every day, so my advice is simple.' },
            { who: 'Agent', text: 'The earlier you book, ___ you pay.' }
          ],
          options: ['the less', 'less', 'the lesser', 'the fewer'],
          answer: 0,
          why: 'The second half must also be fronted with <em>the</em>. <em>Pay</em> takes an amount, so <em>less</em>, not <em>fewer</em>.' },
        { id: 's7l1-04', type: 'choose', tag: 'correlative', level: 'C1',
          stem: 'Why does "the more, the merrier" contain two thes?',
          options: ['They are definite articles marking two unique groups.', 'They are an old instrumental form meaning "by that much".', 'It is an idiom with no grammatical explanation.', 'One is an article and one is a typing error.'],
          answer: 1,
          why: 'Old English <em>þȳ</em>, "by that much". The phrase means: by however much more, by that much merrier.' },
        { id: 's7l1-05', type: 'equiv', tag: 'correlative', level: 'C1',
          given: 'The more you automate check-in, the fewer staff you need.',
          stem: 'Which sentence means the same?',
          options: ['Automation and staffing rise together.', 'As automation increases, staffing requirements fall.', 'Automation has no effect on staffing.', 'Staff numbers determine how much you automate.'],
          answer: 1,
          why: 'A correlative states covariation. Here one goes up as the other goes down — which <em>fewer</em> signals.' }
      ]
    },
    {
      id: 's7l2', name: 'More and more crowded', cefr: 'C1',
      theory: {
        key: 'For a trend, English repeats the comparative — but which part repeats depends on the word.',
        body: [
          'To say something keeps changing in the same direction, double the comparative:',
          '<em>Services are running <strong>later and later</strong>.</em><br><em><strong>Fewer and fewer</strong> passengers buy paper tickets.</em><br><em>Flights are getting <strong>cheaper and cheaper</strong>.</em>',
          'But watch which half repeats. Short adjectives double the <strong>whole form</strong>. Long adjectives double only <strong>more</strong>:',
          '<em>The platform is getting <strong>more and more</strong> crowded.</em> — never <em>*more crowded and more crowded</em>.',
          'This structure almost always appears with a verb of change: <em>get, become, grow</em>. <em>It is getting more and more expensive</em> rather than <em>*it is more and more expensive</em> — though the second is possible when the change is already understood.',
          'A close relative for a sudden or striking trend: <em>ever more crowded</em>, <em>ever fewer services</em> — more formal, and very common in written English.'
        ],
        simple: [
          'Repeat the comparative to show a trend: <em>later and later</em>, <em>cheaper and cheaper</em>.',
          'Short word: repeat the whole thing. <em>later and later</em>.',
          'Long word: repeat only <em>more</em>. <em>more and more crowded</em>.',
          'Usually with <em>get</em>, <em>become</em> or <em>grow</em>.',
          'Formal version: <em>ever more crowded</em>.'
        ],
        examples: [
          { s: 'Trains are arriving <strong>later and later</strong>.', g: 'SHORT WORD — WHOLE FORM DOUBLES' },
          { s: 'The route is becoming <strong>more and more</strong> popular.', g: 'LONG WORD — ONLY "MORE" DOUBLES' },
          { s: '<strong>Ever fewer</strong> passengers use the ticket office.', g: 'FORMAL WRITTEN EQUIVALENT' }
        ]
      },
      items: [
        { id: 's7l2-01', type: 'spot', tag: 'incremental', level: 'C1',
          stem: 'Click the word where the sentence goes wrong.',
          words: ['The', 'morning', 'train', 'is', 'getting', 'more', 'crowded', 'and', 'more', 'crowded.'],
          answer: 7, fix: 'more and more crowded',
          why: 'With a long adjective only <em>more</em> doubles. The adjective is said once.' },
        { id: 's7l2-02', type: 'choose', tag: 'incremental', level: 'C1',
          stem: 'Which pair is correct?',
          options: ['later and later / more and more expensive', 'more late and more late / expensiver and expensiver', 'later and later / more expensive and more expensive', 'more and more late / more and more expensive'],
          answer: 0,
          why: 'Short adjective doubles whole (<em>later and later</em>); long adjective doubles only <em>more</em>.' },
        { id: 's7l2-03', type: 'gap', tag: 'incremental', level: 'C1',
          lines: [
            { who: 'Mai', text: 'Do you still print your boarding pass?' },
            { who: 'Jun', text: 'Nobody does. ___ people even carry paper now.' }
          ],
          options: ['Less and less', 'Fewer and fewer', 'More and more few', 'The fewer'],
          answer: 1,
          why: '<em>People</em> is countable, so <em>fewer</em>; and a trend needs the doubled form.' },
        { id: 's7l2-04', type: 'build', tag: 'incremental', level: 'C1',
          stem: 'Fares have risen every quarter for three years, with no sign of stopping. Describe the trend.',
          tiles: ['Flights', 'are', 'getting', 'more', 'and', 'more', 'expensive.'],
          solution: 'Flights are getting more and more expensive.',
          why: 'Verb of change + doubled <em>more</em> + the adjective once.' },
        { id: 's7l2-05', type: 'equiv', tag: 'incremental', level: 'C1',
          given: 'Ever fewer passengers use the ticket office.',
          stem: 'Which sentence means the same, in a less formal register?',
          options: ['Fewer and fewer people use the ticket office.', 'The fewest people use the ticket office.', 'Fewer people never use the ticket office.', 'Most people use the ticket office.'],
          answer: 0,
          why: '<em>Ever + comparative</em> is the written-formal equivalent of the doubled trend form.' }
      ]
    },
    {
      id: 's7l3', name: 'Saying less, meaning more', cefr: 'C1',
      theory: {
        key: 'English criticises by going DOWN the scale. Learners who miss this hear a mild remark where a sharp one was meant.',
        body: [
          'Three understatement patterns, all built on comparison, all extremely common in real speech and in reviews.',
          '<strong>Negated superlative.</strong> <em>It is not the fastest way across the city.</em> Meaning: it is slow. <em>Not the cleanest hotel I have stayed in.</em> Meaning: it was dirty.',
          '<strong>less than + positive adjective.</strong> <em>Service has been less than punctual this year.</em> Meaning: badly late. <em>The response was less than helpful.</em> Meaning: useless.',
          '<strong>no + comparative.</strong> <em>The new timetable is no better than the old one.</em> Meaning: nothing improved, and I am annoyed about it.',
          'The inverse also exists — emphasis dressed as reduction: <em>no fewer than 300 passengers</em> (surprisingly many), <em>no less than a complete rebuild</em> (a huge undertaking).',
          'And the metalinguistic comparative, which belongs here because it too compares words rather than degrees: <em>The 07:40 is <strong>more slow than late</strong></em> — it leaves on time and crawls. You can never say <em>*slower than late</em>; only <em>more</em> works, whatever the adjective\'s length.'
        ],
        simple: [
          '<em>not the fastest</em> = slow.',
          '<em>less than punctual</em> = very late.',
          '<em>no better than before</em> = nothing improved, and I am annoyed.',
          '<em>no fewer than 300</em> = wow, that is a lot.',
          '<em>more slow than late</em> = "slow" is the better word here, not "late". Always <em>more</em>, never <em>-er</em>.'
        ],
        examples: [
          { s: 'The airport hotel was <strong>less than clean</strong>.', g: 'IT WAS DIRTY. UNDERSTATEMENT AS CRITICISM' },
          { s: 'Honestly, it is <strong>more a hostel than a hotel</strong>.', g: 'METALINGUISTIC: WHICH WORD FITS, NOT HOW MUCH' },
          { s: '<strong>No fewer than</strong> forty people missed the connection.', g: 'EMPHASIS DRESSED AS REDUCTION' }
        ]
      },
      items: [
        { id: 's7l3-01', type: 'equiv', tag: 'no-comparative', level: 'C1',
          given: 'The transfer desk was less than helpful.',
          stem: 'What is the speaker actually saying?',
          options: ['The desk was quite helpful.', 'The desk was moderately helpful.', 'The desk was no help at all.', 'The desk was closed.'],
          answer: 2,
          why: '<em>Less than X</em> is a polite way of saying "pointedly not X". It is stronger criticism than it looks.' },
        { id: 's7l3-02', type: 'choose', tag: 'metalinguistic', level: 'C1',
          stem: 'Why is "The 07:40 is slower than late" impossible?',
          options: ['Because "slow" cannot take -er.', 'Because the sentence compares which WORD fits, and that comparison only takes "more".', 'Because "late" is not an adjective.', 'Because you need "the" before "slower".'],
          answer: 1,
          why: 'Metalinguistic comparison — is "slow" or "late" the better description? — is expressed only with <em>more</em>, even on a one-syllable adjective.' },
        { id: 's7l3-03', type: 'gap', tag: 'metalinguistic', level: 'C1',
          lines: [
            { who: 'Ben', text: 'So what is the place actually like?' },
            { who: 'Pim', text: 'Honestly? It is ___ a hostel than a hotel. Bunk beds and one bathroom.' }
          ],
          options: ['more', 'rather', 'much more', 'less'],
          answer: 0,
          why: 'Comparing which noun fits the place better. <em>More X than Y</em> is the fixed frame.' },
        { id: 's7l3-04', type: 'judge', tag: 'no-comparative', level: 'C1',
          given: 'It is not the worst hotel we have stayed in.',
          stem: 'Is this a compliment?',
          answer: 1,
          why: 'No. A negated superlative at the bottom of a scale is faint praise at best — the speaker is saying it was bad, but survivable.' },
        { id: 's7l3-05', type: 'order', tag: 'no-comparative', level: 'C1',
          stem: 'Order these hotel reviews from the MILDEST criticism to the HARSHEST.',
          items: ['not quite the best we have stayed in', 'not the cleanest place in town', 'less than clean', 'the worst room of the entire trip'],
          why: 'Understatement is graded. Learners often hear all four as equally mild; ranking them out loud is how the register becomes audible.' }
      ]
    }
  ]
});

/* ===== STAGE 8 — ARRIVALS ============================================== */
STAGES.push({
  id: 's8', art: 'arrivals', n: 8, name: 'Arrivals', cefr: 'C1',
  gate: 'Gate 8',
  blurb: 'Comparison without adjectives, the pairs that split into two meanings, and how a C1 writer actually builds a comparison paragraph.',
  lessons: [
    {
      id: 's8l1', name: 'Comparison without an adjective', cefr: 'C1',
      theory: {
        key: 'Comparison is a meaning, not an ending. English does it with verbs and prefixes too.',
        body: [
          'Learners who only know <em>-er</em> and <em>more</em> write flat, repetitive comparison paragraphs. English has four other routes.',
          '<strong>The verbal prefix <em>out-</em></strong> — a fully productive comparative that attaches to <strong>verbs</strong> and almost nobody teaches: <em>outperform, outnumber, outlast, outsell, outpace, outrun, outbid, outgrow</em>. <em>Rail outperforms road on journeys under 600 km</em> — one word doing the work of six.',
          '<strong>over- and under-</strong> compare against a norm rather than a rival: <em>the flight was overbooked</em>, <em>the branch line is badly underused</em>.',
          '<strong>Lexical verbs</strong>: <em>exceed, surpass, top, trail, lag behind, fall short of, rival, be second only to</em>. <em>Ridership has exceeded the 2019 peak; the northern line still lags behind the rest of the network.</em>',
          '<strong>Quantitative phrases</strong>: <em>up from, down on, a rise of, twice the capacity of, over, under</em>. <em>Punctuality is up from 82% to 91%.</em>',
          'Two more that sit outside the adjective system: nominal comparison (<em>more of a hostel than a hotel</em>, <em>the better of the two options</em>, <em>the latter route</em>) and verbal frequency (<em>I fly more than I drive</em> — comparing how often, with no adjective anywhere).'
        ],
        simple: [
          'Use <strong>out-</strong> on verbs: <em>outperform, outnumber, outlast</em>.',
          'Use strong verbs: <em>exceed, surpass, lag behind, fall short of</em>.',
          'Use numbers: <em>up from 82% to 91%</em>, <em>twice the capacity of</em>.',
          'These make a comparison paragraph sound like a writer, not a textbook.'
        ],
        examples: [
          { s: 'Cyclists now <strong>outnumber</strong> cars on that bridge.', g: 'VERBAL COMPARATIVE — ONE WORD' },
          { s: 'Ridership has <strong>exceeded</strong> the 2019 peak.', g: 'LEXICAL COMPARISON' },
          { s: 'The northern line still <strong>lags behind</strong> the rest of the network.', g: 'DOWNWARD LEXICAL COMPARISON' }
        ]
      },
      items: [
        { id: 's8l1-01', type: 'choose', tag: 'beyond-adj', level: 'C1',
          stem: 'Rewrite with one word: "There are now more cyclists than cars on the bridge."',
          options: ['Cyclists overcome cars on the bridge.', 'Cyclists outnumber cars on the bridge.', 'Cyclists outbid cars on the bridge.', 'Cyclists overtake cars on the bridge.'],
          answer: 1,
          why: '<em>out-</em> + a verb is a real comparative morpheme. <em>Outnumber</em> compares quantity; <em>overtake</em> would compare position.' },
        { id: 's8l1-02', type: 'gap', tag: 'beyond-adj', level: 'C1',
          lines: [
            { who: 'Report', text: 'Passenger numbers reached 4.1 million this year, against 3.8 million in 2019.' },
            { who: 'Summary', text: 'Ridership has therefore ___ the pre-pandemic peak.' }
          ],
          options: ['exceeded', 'lagged behind', 'fallen short of', 'trailed'],
          answer: 0,
          why: '4.1 is above 3.8, so the upward verb. The other three are all downward comparisons.' },
        { id: 's8l1-03', type: 'equiv', tag: 'beyond-adj', level: 'C1',
          given: 'The northern line lags behind the rest of the network.',
          stem: 'Which sentence means the same?',
          options: ['The northern line performs worse than the other lines.', 'The northern line is longer than the other lines.', 'The northern line runs after the other lines.', 'The northern line was built last.'],
          answer: 0,
          why: '<em>Lag behind</em> is a lexical downward comparative — worse on whatever measure is in play.' },
        { id: 's8l1-04', type: 'build', tag: 'beyond-adj', level: 'C1',
          stem: 'Under 600 km, trains beat cars on every measure. Say it without using <em>-er</em>, <em>more</em> or <em>than</em>.',
          tiles: ['Rail', 'outperforms', 'road', 'on', 'journeys', 'under', '600', 'km.'],
          solution: 'Rail outperforms road on journeys under 600 km.',
          why: 'No <em>-er</em>, no <em>more</em>, no <em>than</em> — and it is still a comparison, expressed more economically than any adjective could manage.' },
        { id: 's8l1-05', type: 'table', tag: 'beyond-adj', level: 'C1',
          table: { cols: ['Mode', '2019', '2025', 'Change'], rows: [['Rail', '3.8 m', '4.1 m', '+8%'], ['Coach', '2.4 m', '1.9 m', '−21%'], ['Air (domestic)', '1.1 m', '1.1 m', '0%']] },
          stem: 'Which sentence describes this table most precisely?',
          options: ['Rail is better than coach.', 'Rail is up from 3.8 to 4.1 million, while coach has fallen by a fifth.', 'Rail is much more popular than coach and air.', 'Coach is not as good as rail these days.'],
          answer: 1,
          why: 'Two quantitative comparisons, both checkable. The other options are bare or unanchored comparatives.' }
      ]
    },
    {
      id: 's8l2', name: 'The pairs that split', cefr: 'C1',
      theory: {
        key: 'further/farther, latest/last, nearest/next, elder/older, latter/later. Not irregular — divided.',
        body: [
          '<strong>farther / further.</strong> <em>Farther</em> is physical distance only. <em>Further</em> covers distance <u>and</u> abstract extent — and only <em>further</em> works in <em>further delays are expected</em>, <em>pending further notice</em>. In British usage <em>further</em> has largely swallowed both.',
          '<strong>latest / last.</strong> <em>The latest train</em> is the most recent one. <em>The last train</em> is the final one of the day. Two very different situations to be standing on a platform in at 1 a.m.',
          '<strong>nearest / next.</strong> <em>Nearest</em> is closest in <u>space</u>. <em>Next</em> is next in <u>sequence</u> along the route. <em>The nearest station is Asok; the next station is Phrom Phong.</em> Get on a train going the other way and both answers change independently.',
          '<strong>elder / older.</strong> <em>Elder</em> is attributive only, people only, usually family: <em>my elder sister</em>. Aircraft and trains are <em>older</em>, never <em>*elder</em>.',
          '<strong>latter / later.</strong> <em>Later</em> is a time word. <em>Latter</em> means "the second of the two just mentioned": <em>We looked at the ferry and the flight; the latter was quicker.</em>'
        ],
        simple: [
          '<em>farther</em> = distance only. <em>further</em> = distance OR more of something. <em>further delays</em> ✓',
          '<em>the latest train</em> = the newest / most recent. <em>the last train</em> = the final one tonight.',
          '<em>nearest</em> = closest to me. <em>next</em> = next on the route.',
          '<em>elder</em> = only for people, only before a noun: <em>my elder brother</em>.',
          '<em>latter</em> = the second of two things just mentioned.'
        ],
        examples: [
          { s: 'We are expecting <strong>further</strong> delays this evening.', g: 'ABSTRACT EXTENT — NEVER "FARTHER"' },
          { s: 'The <strong>nearest</strong> station is Asok; the <strong>next</strong> station is Phrom Phong.', g: 'SPACE VS SEQUENCE' },
          { s: 'The ferry and the flight both work; the <strong>latter</strong> is quicker.', g: 'THE SECOND OF TWO MENTIONED' }
        ]
      },
      items: [
        { id: 's8l2-01', type: 'spot', tag: 'irregular-split', level: 'C1',
          stem: 'Click the wrong word.',
          words: ['Passengers', 'should', 'expect', 'farther', 'delays', 'this', 'evening.'],
          answer: 3, fix: 'further',
          why: 'Delays are not a distance. Only <em>further</em> covers abstract extent.' },
        { id: 's8l2-02', type: 'choose', tag: 'irregular-split', level: 'C1',
          stem: 'It is 00:45. You want the final service of the night. Which do you ask for?',
          options: ['the latest train', 'the last train', 'the later train', 'the latter train'],
          answer: 1,
          why: '<em>Last</em> = final one of the day. <em>Latest</em> would only get you the most recent departure, which may not be the final one.' },
        { id: 's8l2-03', type: 'gap', tag: 'irregular-split', level: 'C1',
          lines: [
            { who: 'Tourist', text: 'I need a pharmacy. Which stop do I want?' },
            { who: 'Local', text: 'Stay on. The ___ station is Asok, but the pharmacy is by the one after that.' }
          ],
          options: ['nearest', 'next', 'latest', 'closest'],
          answer: 1,
          why: 'They are on a moving train, so the relevant relation is sequence along the route, not distance from where they stand.' },
        { id: 's8l2-04', type: 'equiv', tag: 'irregular-split', level: 'C1',
          given: 'We considered the overnight ferry and the morning flight; the latter was considerably cheaper.',
          stem: 'Which option was cheaper?',
          options: ['The overnight ferry.', 'The morning flight.', 'Both cost the same.', 'The sentence does not say.'],
          answer: 1,
          why: '<em>The latter</em> always means the second of the two just named — here, the morning flight.' },
        { id: 's8l2-05', type: 'order', tag: 'irregular-split', level: 'C1',
          stem: 'You are standing at Phaya Thai on a train heading north. Order these from the one you reach FIRST to the one you reach LAST.',
          items: ['the next station', 'the second station from here', 'the last station on this line'],
          why: '<em>Next</em> is sequence, not distance. Once you are moving, "nearest" and "next" can point at completely different platforms.' },
        { id: 's8l2-06', type: 'spot', tag: 'irregular-split', level: 'C1',
          stem: 'Click the wrong word.',
          words: ['The', 'airline', 'still', 'flies', 'several', 'elder', 'aircraft', 'on', 'domestic', 'routes.'],
          answer: 5, fix: 'older',
          why: '<em>Elder</em> is for people only, and only before a noun. Machines are <em>older</em>.' }
      ]
    },
    {
      id: 's8l3', name: 'Writing the comparison paragraph', cefr: 'C1',
      theory: {
        key: 'Two questions before you move on: compared to what, and by how much.',
        body: [
          'Everything in this course reduces to two slots. Slot 4 is the standard (<em>compared to what?</em>). Slot 1 is the differential (<em>by how much?</em>). Fill both and a sentence reads as C1; leave either empty and it does not, whatever the vocabulary is doing.',
          '<strong>Weak:</strong> <em>Rail use is better than car use.</em><br><strong>Strong:</strong> <em>Between 2015 and 2024, rail journeys per head rose 41% while car journeys fell 6% — a divergence of nearly 50 percentage points.</em>',
          'Note that last phrase. <strong>Percentage points are not percent.</strong> A share moving from 20% to 30% has risen ten <u>percentage points</u>, or by 50 <u>percent</u> — because ten out of the original twenty is half again. Mixing the two up is a precision error examiners notice.',
          'Hedge the claims you cannot prove. <em>arguably the most efficient</em>, <em>one of the most heavily used corridors</em>, <em>among the least reliable</em>, <em>broadly comparable with</em>. A hedged claim is stronger than an overstated one, because it survives scrutiny.',
          'And vary the machinery. A paragraph built entirely from <em>-er … than</em> reads as a drill. Rotate through: a comparative with a figure, an equative, a superlative with a delimited set, a lexical verb (<em>outperform, lag behind</em>), and a quantitative phrase (<em>up from … to …</em>).'
        ],
        simple: [
          'Always answer: <strong>compared to what?</strong> and <strong>by how much?</strong>',
          'Use a number if you have one: <em>41% higher</em> beats <em>much higher</em>.',
          '20% → 30% is <strong>ten percentage points</strong>, or a <strong>50% increase</strong>. Two different questions.',
          'Soften claims you cannot prove: <em>arguably</em>, <em>one of the</em>, <em>among the</em>.',
          'Do not use <em>-er than</em> five times in one paragraph. Change the tool.'
        ],
        examples: [
          { s: 'Rail journeys rose <strong>41%</strong> while car journeys fell <strong>6%</strong>.', g: 'TWO FIGURES, NO BARE COMPARATIVES' },
          { s: 'Rail\'s share rose from 20% to 30% — ten <strong>percentage points</strong>.', g: 'THE PRECISION TRAP, HANDLED CORRECTLY' },
          { s: 'It is <strong>arguably</strong> the most efficient network in the region.', g: 'HEDGE THAT SURVIVES SCRUTINY' }
        ]
      },
      items: [
        { id: 's8l3-01', type: 'choose', tag: 'register', level: 'C1',
          stem: 'Rail\'s share of journeys rose from 20% to 30%. Which description is correct?',
          options: ['It rose by ten percent.', 'It rose by ten percentage points — which is a 50% increase.', 'It rose by 50 percentage points.', 'It rose by 30 percent.'],
          answer: 1,
          why: 'Count the gap between the two figures: 30 − 20 = ten <strong>percentage points</strong>. Now ask how big that gap is compared with where you started: ten out of twenty is half again, so a <strong>50% increase</strong>. Two different questions, two different answers.' },
        { id: 's8l3-02', type: 'choose', tag: 'register', level: 'C1',
          stem: 'A report says: "The new fleet is more efficient." An examiner marks it down. Why?',
          options: [
            'The adjective should be "efficienter".',
            'There is no standard and no figure — nothing a reader could check.',
            'It should be a superlative, not a comparative.',
            'It needs "the" in front of "more efficient".'
          ],
          answer: 1,
          why: 'A dangling comparative. Grammatical, but with neither slot filled — no <em>than what</em> and no <em>by how much</em> — it makes no claim anyone can test. The classic Task Response weakness.' },
        { id: 's8l3-03', type: 'order', tag: 'register', level: 'C1',
          stem: 'Order these from WEAKEST to STRONGEST as a piece of academic writing.',
          items: ['Rail travel got better.', 'Rail travel is more popular than car travel.', 'Rail use rose considerably while car use declined.', 'Rail journeys rose 41% while car journeys fell 6%.'],
          why: 'Vague verb → bare comparative → graded adverb → figures. Each step fills the differential slot more precisely.' },
        { id: 's8l3-04', type: 'gap', tag: 'register', level: 'C1',
          lines: [
            { who: 'Draft', text: 'The Tokyo network is the most efficient in the world.' },
            { who: 'Supervisor', text: 'You cannot prove that. Soften it.' },
            { who: 'Revision', text: 'The Tokyo network is ___ the most efficient in the world.' }
          ],
          options: ['definitely', 'arguably', 'very much', 'by far'],
          answer: 1,
          why: '<em>Arguably</em> concedes that the claim is contestable, which is what makes it defensible. <em>By far</em> and <em>definitely</em> strengthen it instead.' },
        { id: 's8l3-05', type: 'build', tag: 'register', level: 'C1',
          stem: 'Bangkok fares run about 18% below Tokyo\'s, though the figure moves. Write it with the number and a hedge.',
          tiles: ['Fares', 'are', 'around', '18%', 'lower', 'than', 'those', 'in', 'Tokyo.'],
          solution: 'Fares are around 18% lower than those in Tokyo.',
          why: 'Hedged figure in slot 1, category-matched standard in slot 4. Both questions answered in nine words.' },
        { id: 's8l3-06', type: 'choose', tag: 'register', level: 'C1',
          stem: 'A paragraph uses "-er than" in five consecutive sentences. What is the best fix?',
          options: ['Change them all to superlatives.', 'Rotate the machinery: a figure, an equative, a lexical verb, a quantitative phrase.', 'Delete three of the sentences.', 'Add "very" to each comparative.'],
          answer: 1,
          why: 'Range of structures is assessed directly in Grammatical Range and Accuracy. The content stays; the machinery varies.' }
      ]
    }
  ]
});

/* ===== STAGE CHALLENGES =================================================
   8 items each. Items mix every lesson in the stage, and from Stage 3 on
   they interleave one or two items from earlier stages — interleaving is
   what makes a review test diagnostic rather than decorative.
   ======================================================================= */
const CHALLENGES = {
  s1: { id: 's1ch', name: 'Boarding Check 1', items: [
    { id: 's1ch-1', type: 'choose', tag: 'gradability', level: 'B1',
      stem: 'Which comparison is impossible without inventing a new meaning?',
      options: ['a quieter carriage', 'a more crowded platform', 'a more return ticket', 'a longer delay'],
      answer: 2, why: '<em>Return</em> classifies the ticket type. There is no scale, so no degrees.' },
    { id: 's1ch-2', type: 'spot', tag: 'form-er-more', level: 'B1',
      stem: 'Click the wrong word.',
      words: ['The', 'late', 'flight', 'was', 'more', 'cheaper', 'but', 'much', 'less', 'comfortable.'],
      answer: 4, fix: 'delete "more"', why: 'Double marking. One comparative marker only.' },
    { id: 's1ch-3', type: 'gap', tag: 'form-er-more', level: 'B1',
      lines: [{ who: 'Ploy', text: 'Why the 06:00?' }, { who: 'Kit', text: 'The airport is ___ and the queues are shorter.' }],
      options: ['more quiet', 'quieter', 'quietest', 'more quieter'], answer: 1,
      why: '<em>Quiet</em> is a single-piece word, so <em>-er</em> is the natural form.' },
    { id: 's1ch-4', type: 'equiv', tag: 'than-basic', level: 'B1',
      given: 'The Georgian is older than the Grand Hyatt.',
      stem: 'Which must be true?',
      options: ['The Georgian opened first.', 'The Grand Hyatt opened first.', 'The Georgian is the oldest hotel in town.', 'Both opened the same year.'],
      answer: 0, why: 'Older = built earlier. The comparative says nothing about any third hotel.' },
    { id: 's1ch-5', type: 'build', tag: 'form-er-more', level: 'B1',
      stem: 'The hostel saves you money. Getting there wears you out. Say both in one sentence.',
      tiles: ['The', 'hostel', 'is', 'cheaper', 'but', 'the', 'journey', 'is', 'more', 'tiring.'],
      solution: 'The hostel is cheaper but the journey is more tiring.',
      why: 'One single-piece word, one derived word — two different strategies in one sentence.' },
    { id: 's1ch-6', type: 'spot', tag: 'than-basic', level: 'B1',
      stem: 'Click the wrong word.',
      words: ['Going', 'by', 'coach', 'is', 'slower', 'as', 'going', 'by', 'train.'],
      answer: 5, fix: 'than', why: '<em>-er</em> pairs with <em>than</em>; <em>as</em> pairs only with another <em>as</em>.' },
    { id: 's1ch-7', type: 'choose', tag: 'gradability', level: 'B1',
      stem: 'Which word correctly completes: "The terminal was ___ packed."',
      options: ['very', 'absolutely', 'more', 'much'],
      answer: 1, why: '<em>Packed</em> is already at the top of the scale, so it takes <em>absolutely</em>, not <em>very</em>.' },
    { id: 's1ch-8', type: 'sort', tag: 'form-er-more', level: 'B1',
      stem: 'Sort these six into the right box.',
      bins: [
        { key: 'er', label: 'takes -er', hint: 'short, one piece' },
        { key: 'more', label: 'takes more', hint: 'long, or built from a suffix' }
      ],
      items: [
        { text: 'late', bin: 'er' }, { text: 'noisy', bin: 'er' }, { text: 'simple', bin: 'er' },
        { text: 'expensive', bin: 'more' }, { text: 'tiring', bin: 'more' }, { text: 'careful', bin: 'more' }
      ],
      why: '<em>Late, noisy, simple</em> are single pieces. <em>Expens+ive</em>, <em>tir+ing</em> and <em>care+ful</em> already end in a suffix.' }
  ]},

  s2: { id: 's2ch', name: 'Boarding Check 2', items: [
    { id: 's2ch-1', type: 'spot', tag: 'superlative-the', level: 'B1',
      stem: 'Click the wrong word.',
      words: ['We', 'took', 'a', 'cheapest', 'room', 'they', 'had.'],
      answer: 2, fix: 'the', why: 'A superlative marks a unique winner, and <em>the</em> is what encodes uniqueness.' },
    { id: 's2ch-2', type: 'spot', tag: 'superlative-set', level: 'B1+',
      stem: 'Click the wrong word.',
      words: ['Changi', 'is', 'one', 'of', 'the', 'busiest', 'airport', 'in', 'Asia.'],
      answer: 6, fix: 'airports', why: '<em>One of the</em> selects from a plural set.' },
    { id: 's2ch-3', type: 'table', tag: 'superlative-set', level: 'B1+',
      table: { cols: ['Room', 'Price', 'Floor'], rows: [['Standard', '฿1,900', '3'], ['Deluxe', '฿2,600', '8'], ['Suite', '฿5,400', '14'], ['Family', '฿3,100', '5']] },
      stem: 'Which is true?',
      options: ['The Deluxe is the second cheapest room.', 'The Family room is the cheapest.', 'The Suite is one of the cheapest rooms.', 'The Standard is the second most expensive.'],
      answer: 0, why: 'By price: Standard 1,900 < Deluxe 2,600 < Family 3,100 < Suite 5,400.' },
    { id: 's2ch-4', type: 'gap', tag: 'superlative-set', level: 'B1+',
      lines: [{ who: 'Mai', text: 'How was the transfer?' }, { who: 'Pim', text: 'The longest queue I ___ stood in.' }],
      options: ['ever', 'have ever', 'never', 'was ever'], answer: 1,
      why: 'A relative-clause superlative set takes the present perfect.' },
    { id: 's2ch-5', type: 'choose', tag: 'irregular', level: 'B1',
      stem: 'Which is correct?',
      options: ['The return flight was worser.', 'The return flight was more bad.', 'The return flight was worse.', 'The return flight was baddest.'],
      answer: 2, why: '<em>Bad</em> is suppletive: <em>worse / worst</em>, with no <em>-er</em> and no <em>more</em>.' },
    { id: 's2ch-6', type: 'equiv', tag: 'superlative-the', level: 'B1',
      given: 'The Japanese restaurant is the most expensive in town.',
      stem: 'Is it the only restaurant being considered?',
      options: ['Yes — "the" means there is only one.', 'No — it is being compared with all the others in town.', 'Yes, superlatives always stand alone.', 'The sentence does not say.'],
      answer: 1, why: 'A superlative requires a set of rivals. <em>The</em> marks the winner, not an empty field.' },
    { id: 's2ch-7', type: 'gap', tag: 'superlative-set', level: 'B1+',
      lines: [{ who: 'Ben', text: 'Worst part of the trip?' }, { who: 'Nok', text: 'The 3 a.m. transfer. Easily the worst night ___ the whole holiday.' }],
      options: ['in', 'of', 'at', 'on'], answer: 1,
      why: 'A holiday is a period of time, and periods take <em>of</em>.' },
    { id: 's2ch-8', type: 'build', tag: 'superlative-set', level: 'B1+',
      stem: 'Only a handful of airports on earth handle more passengers than Haneda. Say so.',
      tiles: ['Haneda', 'is', 'one', 'of', 'the', 'busiest', 'airports', 'in', 'the', 'world.'],
      solution: 'Haneda is one of the busiest airports in the world.',
      why: 'Plural after <em>one of the</em>, then <em>in</em> for a place.' }
  ]},

  s3: { id: 's3ch', name: 'Boarding Check 3', items: [
    { id: 's3ch-1', type: 'spot', tag: 'equative', level: 'B1+',
      stem: 'Click the wrong word.',
      words: ['The', 'coach', 'is', 'nearly', 'as', 'fast', 'than', 'the', 'train.'],
      answer: 6, fix: 'as', why: 'The equative frame is <em>as … as</em>, never <em>as … than</em>.' },
    { id: 's3ch-2', type: 'judge', tag: 'equative', level: 'B2',
      given: 'The guesthouse is as clean as the hotel — cleaner, in fact.',
      stem: 'Has the speaker contradicted themselves?',
      answer: 1, why: '<em>As clean as</em> sets a floor ("at least as clean"), so refining upward is not a contradiction.' },
    { id: 's3ch-3', type: 'choose', tag: 'ratio', level: 'B1+',
      stem: 'The taxi is ฿450, the airport train is ฿45. Complete: "The taxi costs ___ the train."',
      options: ['ten times more than', 'ten times as much as', 'ten times than', 'as ten times much as'],
      answer: 1, why: 'A multiplier expresses a ratio, and only the equative frame carries a ratio.' },
    { id: 's3ch-4', type: 'table', tag: 'less-fewer', level: 'B2',
      table: { cols: ['Route', 'Stops', 'Time', 'Fare'], rows: [['Coastal', '6', '4 h 10', '฿380'], ['Express', '2', '2 h 45', '฿690'], ['Local', '11', '5 h 30', '฿240']] },
      stem: 'Complete: "The Express has ___ stops and takes ___ three hours."',
      options: ['less / fewer than', 'fewer / less than', 'fewer / fewer than', 'less / less than'],
      answer: 1, why: 'Stops are counted → <em>fewer</em>. Three hours is a measured amount → <em>less than</em>.' },
    { id: 's3ch-5', type: 'equiv', tag: 'equative', level: 'B2',
      given: 'Flying is not as cheap as the overnight bus.',
      stem: 'Which means the same?',
      options: ['They cost the same.', 'The bus is cheaper.', 'Flying is cheaper.', 'We cannot tell.'],
      answer: 1, why: 'A negated equative reverses direction: flying costs more.' },
    { id: 's3ch-6', type: 'spot', tag: 'less-fewer', level: 'B2',
      stem: 'Click the wrong word.',
      words: ['There', 'are', 'less', 'flights', 'in', 'winter', 'and', 'less', 'choice.'],
      answer: 2, fix: 'fewer', why: 'Flights are counted (<em>fewer</em>); choice is a mass (<em>less</em>). Only the first is wrong.' },
    { id: 's3ch-7', type: 'gap', tag: 'ratio', level: 'B1+',
      lines: [{ who: 'Mai', text: 'The ferry is 100 minutes, the flight is 50.' }, { who: 'Ben', text: 'So the ferry takes ___ the flight.' }],
      options: ['twice as long as', 'twice longer than', 'two times more than', 'the longest of'],
      answer: 0, why: 'Exact ratio, so the equative frame — and it removes the 3×/4× ambiguity problem entirely.' },
    { id: 's3ch-8', type: 'choose', tag: 'superlative-set', level: 'B1+',
      stem: 'Which sentence is correct?',
      options: ['It is one of the cheapest hotel in the city.', 'It is one of the cheapest hotels in the city.', 'It is one of a cheapest hotels in the city.', 'It is one of cheapest hotels in city.'],
      answer: 1, why: 'Plural noun after <em>one of the</em>, definite article intact, <em>in</em> for a place.' }
  ]},

  s4: { id: 's4ch', name: 'Boarding Check 4', items: [
    { id: 's4ch-1', type: 'spot', tag: 'very-much', level: 'B2',
      stem: 'Click the wrong word.',
      words: ['The', 'rebuilt', 'terminal', 'is', 'very', 'more', 'pleasant', 'to', 'use.'],
      answer: 4, fix: 'far / much', why: '<em>Very</em> modifies a point on a scale; a comparative names a gap.' },
    { id: 's4ch-2', type: 'table', tag: 'differential', level: 'B2',
      table: { cols: ['Service', 'Departs', 'Arrives', 'Fare'], rows: [['Local', '08:05', '10:40', '฿180'], ['Express', '08:20', '10:15', '฿430']] },
      stem: 'Which claim matches the data most precisely?',
      options: ['The Express is much faster.', 'The Express is forty minutes faster.', 'The Express is slightly faster.', 'The Express is no faster.'],
      answer: 1, why: 'Local 2 h 35 vs Express 1 h 55. When you have the figure, use the figure.' },
    { id: 's4ch-3', type: 'gap', tag: 'differential', level: 'B2',
      lines: [{ who: 'Ben', text: '฿45 on the train against ฿40 on the bus.' }, { who: 'Pim', text: 'It is ___ more expensive, and it saves an hour.' }],
      options: ['far', 'much', 'only marginally', 'considerably'], answer: 2,
      why: 'A five-baht gap needs a small-degree filler; <em>much</em> would misrepresent the data.' },
    { id: 's4ch-4', type: 'judge', tag: 'very-much', level: 'B2',
      given: 'We booked the very cheapest seats on the aircraft.',
      stem: 'Is this correct English?',
      answer: 0, why: 'Yes. With a superlative, <em>very</em> means "precisely that one" — identity, not degree.' },
    { id: 's4ch-5', type: 'equiv', tag: 'no-comparative', level: 'B2+',
      given: 'After the refurbishment, check-in is no quicker than before.',
      stem: 'What is implied?',
      options: ['Check-in improved.', 'The speaker expected an improvement and did not get one.', 'Check-in is now slower.', 'The speaker never used the old check-in.'],
      answer: 1, why: '<em>No + comparative</em> carries disappointment; <em>not quicker</em> would be neutral.' },
    { id: 's4ch-6', type: 'spot', tag: 'no-comparative', level: 'B2+',
      stem: 'Click the wrong word.',
      words: ['Haneda', 'is', 'very', 'far', 'the', 'best', 'connected', 'airport', 'here.'],
      answer: 2, fix: 'by', why: 'The superlative intensifier is <em>by far</em>.' },
    { id: 's4ch-7', type: 'build', tag: 'differential', level: 'B2',
      stem: 'Car ferry 2 h 10, fast ferry 1 h 30. Make a claim someone could check.',
      tiles: ['The', 'fast', 'ferry', 'is', 'forty', 'minutes', 'quicker', 'than', 'the', 'car', 'ferry.'],
      solution: 'The fast ferry is forty minutes quicker than the car ferry.',
      why: 'Differential, comparative, <em>than</em>, standard. All four slots filled.' },
    { id: 's4ch-8', type: 'choose', tag: 'less-fewer', level: 'B2',
      stem: 'Which sentence is correct as written?',
      options: ['Fewer than 15 minutes to the gate.', 'Less than 15 minutes to the gate.', 'Fewer than 15 minute to the gate.', 'Less of 15 minutes to the gate.'],
      answer: 1, why: 'Minutes here are a measured amount, so <em>less</em> — the standard exception.' }
  ]},

  s5: { id: 's5ch', name: 'Boarding Check 5', items: [
    { id: 's5ch-1', type: 'spot', tag: 'cat-match', level: 'B2',
      stem: 'Click where the repair must go.',
      words: ['Hotel', 'prices', 'in', 'Kyoto', 'are', 'higher', 'than', 'Osaka.'],
      answer: 7, fix: 'those in Osaka', why: 'Prices are being compared with a city. Insert <em>those in</em>.' },
    { id: 's5ch-2', type: 'choose', tag: 'cat-match', level: 'B2',
      stem: 'Repair: "The population of Osaka is smaller than ___ Tokyo."',
      options: ['those in', 'that of', 'it is', 'the one'], answer: 1,
      why: 'Singular uncountable noun → <em>that</em>, and it attaches with <em>of</em>.' },
    { id: 's5ch-3', type: 'choose', tag: 'than-clause', level: 'B2+',
      stem: 'Which version removes the than me / than I argument?',
      options: ['She flies more often than me.', 'She flies more often than I.', 'She flies more often than I do.', 'She flies more often than mine.'],
      answer: 2, why: 'Restoring the auxiliary makes the hidden clause visible and settles the case question.' },
    { id: 's5ch-4', type: 'spot', tag: 'than-clause', level: 'B2+',
      stem: 'Click the word that breaks the parallel.',
      words: ['Flying', 'is', 'quicker', 'than', 'to', 'take', 'the', 'night', 'train.'],
      answer: 4, fix: 'taking', why: 'Both sides of <em>than</em> must share a shape: <em>flying … taking</em>.' },
    { id: 's5ch-5', type: 'spot', tag: 'any-ever', level: 'B2+',
      stem: 'One word makes this sound like a learner. Click it.',
      words: ['The', 'night', 'train', 'is', 'cleaner', 'than', 'some', 'other', 'services.'],
      answer: 6, fix: 'any', why: 'Comparatives license <em>any</em>; <em>some</em> is grammatical but non-native here.' },
    { id: 's5ch-6', type: 'gap', tag: 'than-clause', level: 'B2+',
      lines: [{ who: 'Nok', text: 'Will the coach clear that bridge?' }, { who: 'Driver', text: 'No. The coach is taller ___ .' }],
      options: ['than the bridge', 'than the bridge is high', 'than high the bridge', 'as the bridge is high'],
      answer: 1, why: 'Two different measurements, so the full clause must appear. This is subdeletion.' },
    { id: 's5ch-7', type: 'equiv', tag: 'any-ever', level: 'B2+',
      given: 'It is the worst delay I have ever experienced.',
      stem: 'Which comparative version says the same?',
      options: ['Worse than some delays I have had.', 'Worse than any delay I have ever had.', 'As bad as the delays I have had.', 'Not the worst delay I have had.'],
      answer: 1, why: 'Superlative ↔ comparative + <em>any</em> is a standard transformation.' },
    { id: 's5ch-8', type: 'build', tag: 'cat-match', level: 'B2',
      stem: 'Bangkok fares average ฿45, Tokyo ฿380. Compare them so that prices meet prices.',
      tiles: ['Fares', 'in', 'Bangkok', 'are', 'lower', 'than', 'those', 'in', 'Tokyo.'],
      solution: 'Fares in Bangkok are lower than those in Tokyo.',
      why: '<em>Those</em> stands for "fares", so both sides now compare the same kind of thing.' }
  ]},

  s6: { id: 's6ch', name: 'Boarding Check 6', items: [
    { id: 's6ch-1', type: 'spot', tag: 'zero-article', level: 'B2+',
      stem: 'Click the word that should be removed.',
      words: ['Airport', 'fares', 'are', 'the', 'cheapest', 'on', 'Tuesday', 'mornings.'],
      answer: 3, fix: 'delete "the"', why: 'One thing compared with itself at other times — no set of entities, no article.' },
    { id: 's6ch-2', type: 'choose', tag: 'zero-article', level: 'B2+',
      stem: 'Which sentence needs NO article before the superlative?',
      options: ['Shinjuku is ___ busiest station in Tokyo.', 'Traffic is ___ heaviest at 8 a.m.', 'That was ___ worst hotel of the trip.', 'Capsule 9 is ___ cheapest of the three.'],
      answer: 1, why: 'Only the second compares one thing across conditions.' },
    { id: 's6ch-3', type: 'judge', tag: 'superlative-set', level: 'B2+',
      given: 'Nan booked the cheapest ticket.',
      stem: 'Does this definitely mean the cheapest ticket on sale?',
      answer: 2, why: 'Can\'t tell — it may instead mean cheaper than anyone else\'s. Name the set to disambiguate.' },
    { id: 's6ch-4', type: 'choose', tag: 'most-three', level: 'C1',
      stem: 'In "It was a most unusual delay", what does most mean?',
      options: ['The maximum of a set.', 'Very — an intensifier.', 'The majority of.', 'It is an error.'],
      answer: 1, why: 'The <em>a</em> gives it away: a superlative cannot take an indefinite article.' },
    { id: 's6ch-5', type: 'spot', tag: 'most-three', level: 'C1',
      stem: 'A student has "corrected" this and made it wrong. Click their addition.',
      words: ['The', 'most', 'travellers', 'now', 'book', 'online.'],
      answer: 0, fix: 'delete "The"', why: 'Quantifier <em>most</em> attaches straight to the noun.' },
    { id: 's6ch-6', type: 'table', tag: 'superlative-set', level: 'B2+',
      table: { cols: ['Airline', 'On-time %', 'Fare', 'Baggage'], rows: [['Nimbus', '91%', '฿9,800', '23 kg'], ['SkyLink', '78%', '฿6,200', '20 kg'], ['Pacific One', '86%', '฿7,400', '30 kg'], ['BudgetGo', '64%', '฿4,100', '7 kg']] },
      stem: 'Which sentence is TRUE?',
      options: ['BudgetGo is by far the least punctual of the four.', 'Nimbus has the most generous baggage allowance.', 'SkyLink is the cheapest airline in Asia.', 'Pacific One is the most punctual of the four.'],
      answer: 0, why: '64% sits well below the next worst at 78%, so <em>by far</em> is justified.' },
    { id: 's6ch-7', type: 'gap', tag: 'zero-article', level: 'B2+',
      lines: [{ who: 'Pim', text: 'When should we visit?' }, { who: 'Guide', text: 'Early. It is ___ between eleven and two.' }],
      options: ['the most crowded', 'most crowded', 'more crowded', 'crowded most'], answer: 1,
      why: 'One place, different times of day — conditions, so no article.' },
    { id: 's6ch-8', type: 'build', tag: 'superlative-set', level: 'B2+',
      stem: 'Make a claim about the network that you could defend if someone disagreed.',
      tiles: ['It', 'is', 'arguably', 'one', 'of', 'the', 'most', 'efficient', 'systems', 'in', 'Asia.'],
      solution: 'It is arguably one of the most efficient systems in Asia.',
      why: 'Two hedges, a plural noun and a named set — academic register in eleven words.' }
  ]},

  s7: { id: 's7ch', name: 'Boarding Check 7', items: [
    { id: 's7ch-1', type: 'spot', tag: 'correlative', level: 'C1',
      stem: 'One word should not be there. Click it.',
      words: ['The', 'earlier', 'you', 'book,', 'and', 'the', 'cheaper', 'the', 'fare.'],
      answer: 4, fix: 'delete "and"', why: 'The correlative takes no conjunction — the comma alone joins the halves.' },
    { id: 's7ch-2', type: 'choose', tag: 'correlative', level: 'C1',
      stem: 'Why does "the more, the merrier" contain two thes?',
      options: ['Two definite articles.', 'An Old English instrumental form meaning "by that much".', 'An idiom with no explanation.', 'A printing error that stuck.'],
      answer: 1, why: 'Old English <em>þȳ</em>. The phrase means: by however much more, by that much merrier.' },
    { id: 's7ch-3', type: 'spot', tag: 'incremental', level: 'C1',
      stem: 'Click where the sentence goes wrong.',
      words: ['The', 'train', 'is', 'getting', 'more', 'crowded', 'and', 'more', 'crowded.'],
      answer: 6, fix: 'more and more crowded', why: 'With a long adjective only <em>more</em> doubles; the adjective is said once.' },
    { id: 's7ch-4', type: 'gap', tag: 'incremental', level: 'C1',
      lines: [{ who: 'Mai', text: 'Do you still print boarding passes?' }, { who: 'Jun', text: '___ people carry paper now.' }],
      options: ['Less and less', 'Fewer and fewer', 'More and more few', 'The fewer'], answer: 1,
      why: 'People are countable, and a trend needs the doubled form.' },
    { id: 's7ch-5', type: 'equiv', tag: 'no-comparative', level: 'C1',
      given: 'The transfer desk was less than helpful.',
      stem: 'What is the speaker saying?',
      options: ['Quite helpful.', 'Moderately helpful.', 'No help at all.', 'Closed.'],
      answer: 2, why: '<em>Less than X</em> means pointedly not X — sharper criticism than it looks.' },
    { id: 's7ch-6', type: 'choose', tag: 'metalinguistic', level: 'C1',
      stem: 'Why is "The 07:40 is slower than late" impossible?',
      options: ['"Slow" cannot take -er.', 'It compares which WORD fits, and that only takes "more".', '"Late" is not an adjective.', 'It needs "the".'],
      answer: 1, why: 'Metalinguistic comparison takes <em>more</em> whatever the adjective\'s length.' },
    { id: 's7ch-7', type: 'build', tag: 'correlative', level: 'C1',
      stem: 'Every extra hour between flights costs you another meal. State the rule.',
      tiles: ['The', 'longer', 'the', 'layover,', 'the', 'more', 'you', 'spend', 'on', 'food.'],
      solution: 'The longer the layover, the more you spend on food.',
      why: 'Both comparatives fronted; <em>is</em> dropped in the first half.' },
    { id: 's7ch-8', type: 'order', tag: 'no-comparative', level: 'C1',
      stem: 'Order from MILDEST criticism to HARSHEST.',
      items: ['not quite the best we have stayed in', 'not the cleanest place in town', 'less than clean', 'the worst room of the trip'],
      why: 'Understatement is graded, and learners routinely hear all four as equally mild.' }
  ]},

  s8: { id: 's8ch', name: 'Final Boarding', items: [
    { id: 's8ch-1', type: 'choose', tag: 'beyond-adj', level: 'C1',
      stem: 'Rewrite in one word: "There are now more cyclists than cars on the bridge."',
      options: ['overcome', 'outnumber', 'outbid', 'overtake'], answer: 1,
      why: '<em>out-</em> is a productive verbal comparative. <em>Outnumber</em> compares quantity.' },
    { id: 's8ch-2', type: 'spot', tag: 'irregular-split', level: 'C1',
      stem: 'Click the wrong word.',
      words: ['Passengers', 'should', 'expect', 'farther', 'delays', 'tonight.'],
      answer: 3, fix: 'further', why: 'Delays are not a distance; only <em>further</em> covers abstract extent.' },
    { id: 's8ch-3', type: 'choose', tag: 'irregular-split', level: 'C1',
      stem: 'It is 00:45 and you want the final service of the night. What do you ask for?',
      options: ['the latest train', 'the last train', 'the later train', 'the latter train'],
      answer: 1, why: '<em>Latest</em> = most recent. <em>Last</em> = final one of the day.' },
    { id: 's8ch-4', type: 'equiv', tag: 'irregular-split', level: 'C1',
      given: 'We considered the ferry and the flight; the latter was cheaper.',
      stem: 'Which was cheaper?',
      options: ['The ferry.', 'The flight.', 'Both the same.', 'Not stated.'],
      answer: 1, why: '<em>The latter</em> is always the second of the two just named.' },
    { id: 's8ch-5', type: 'choose', tag: 'register', level: 'C1',
      stem: 'Rail\'s share rose from 20% to 30%. Which is correct?',
      options: ['A rise of ten percent.', 'A rise of ten percentage points, or 50%.', 'A rise of 50 percentage points.', 'A rise of 30 percent.'],
      answer: 1, why: 'The gap is ten <strong>percentage points</strong> (30 − 20). As a share of where it started, ten out of twenty is a <strong>50% increase</strong>.' },
    { id: 's8ch-6', type: 'gap', tag: 'register', level: 'C1',
      lines: [{ who: 'Supervisor', text: 'You cannot prove it is the best. Soften it.' }, { who: 'Revision', text: 'The network is ___ the most efficient in the region.' }],
      options: ['definitely', 'arguably', 'very much', 'by far'], answer: 1,
      why: '<em>Arguably</em> concedes contestability, which is exactly what makes the claim defensible.' },
    { id: 's8ch-7', type: 'order', tag: 'register', level: 'C1',
      stem: 'Order from WEAKEST to STRONGEST as academic writing.',
      items: ['Rail travel got better.', 'Rail travel is more popular than car travel.', 'Rail use rose considerably while car use declined.', 'Rail journeys rose 41% while car journeys fell 6%.'],
      why: 'Vague verb → bare comparative → graded adverb → figures.' },
    { id: 's8ch-8', type: 'build', tag: 'register', level: 'C1',
      stem: 'Fares here sit roughly 18% under Tokyo\'s, give or take. Write the comparison with a figure and a hedge.',
      tiles: ['Fares', 'are', 'around', '18%', 'lower', 'than', 'those', 'in', 'Tokyo.'],
      solution: 'Fares are around 18% lower than those in Tokyo.',
      why: 'Hedged figure in the differential slot, category-matched standard after <em>than</em>.' }
  ]}
};

STAGES.forEach(function (st) { st.challenge = CHALLENGES[st.id]; });

/* ===== HELD-OUT VERIFICATION BANK ======================================
   Students NEVER see these in the roadmap. The teacher console draws on
   them to build a level-check test that independently verifies the level
   a student's roadmap claims. Keyed by stage number.
   ======================================================================= */
const VERIFY = {
  1: [
    { id: 'v1-1', type: 'choose', tag: 'gradability', level: 'A2',
      stem: 'Which is possible?', options: ['a more wooden cabin', 'a more comfortable cabin', 'a more nuclear ferry', 'a more hourly bus'],
      answer: 1, why: 'Only <em>comfortable</em> names a scale.' },
    { id: 'v1-2', type: 'spot', tag: 'form-er-more', level: 'A2',
      stem: 'Click the wrong word.', words: ['The', 'second', 'hotel', 'was', 'more', 'nicer', 'and', 'closer.'],
      answer: 4, fix: 'delete "more"', why: 'Double marking.' },
    { id: 'v1-3', type: 'choose', tag: 'form-er-more', level: 'B1',
      stem: 'Which is the natural form?', options: ['more simple / more crowded', 'simpler / more crowded', 'simpler / crowdeder', 'more simpler / crowdeder'],
      answer: 1, why: '<em>Simple</em> is one piece; <em>crowded</em> is crowd + ed.' },
    { id: 'v1-4', type: 'gap', tag: 'than-basic', level: 'B1',
      lines: [{ who: 'A', text: 'The ferry is 3 hours, the flight is 1.' }, { who: 'B', text: 'So flying is much ___ the ferry.' }],
      options: ['quicker as', 'quicker than', 'more quick than', 'quickest than'], answer: 1,
      why: 'One syllable → <em>-er</em>; <em>-er</em> pairs with <em>than</em>.' },
    { id: 'v1-5', type: 'equiv', tag: 'than-basic', level: 'B1',
      given: 'The Riverside opened before the Marina.',
      stem: 'Which means the same?', options: ['The Marina is older than the Riverside.', 'The Riverside is older than the Marina.', 'They opened together.', 'The Marina is the oldest.'],
      answer: 1, why: 'Opened earlier = older.' },
    { id: 'v1-7', type: 'sort', tag: 'form-er-more', level: 'B1',
      stem: 'Sort these six words.',
      bins: [
        { key: 'er', label: 'takes -er', hint: 'short, one piece' },
        { key: 'more', label: 'takes more', hint: 'long, or built from a suffix' }
      ],
      items: [
        { text: 'safe', bin: 'er' }, { text: 'dirty', bin: 'er' }, { text: 'quiet', bin: 'er' },
        { text: 'delayed', bin: 'more' }, { text: 'reliable', bin: 'more' }, { text: 'famous', bin: 'more' }
      ],
      why: '<em>Delay+ed</em>, <em>reli+able</em> and <em>fam+ous</em> are already built from a suffix.' },
    { id: 'v1-6', type: 'build', tag: 'form-er-more', level: 'B1',
      stem: 'Coach: six hours, reclining seats. Train: four hours, hard benches. One sentence.',
      tiles: ['The', 'coach', 'is', 'slower', 'but', 'far', 'more', 'comfortable.'],
      solution: 'The coach is slower but far more comfortable.', why: 'Two strategies chosen by word shape.' }
  ],
  2: [
    { id: 'v2-1', type: 'spot', tag: 'superlative-the', level: 'B1',
      stem: 'Click the wrong word.', words: ['That', 'was', 'a', 'worst', 'meal', 'of', 'the', 'trip.'],
      answer: 2, fix: 'the', why: 'A superlative is unique, and <em>the</em> encodes uniqueness.' },
    { id: 'v2-2', type: 'spot', tag: 'superlative-set', level: 'B1+',
      stem: 'Click the wrong word.', words: ['It', 'is', 'one', 'of', 'the', 'oldest', 'temple', 'in', 'Kyoto.'],
      answer: 6, fix: 'temples', why: '<em>One of the</em> selects from a plural set.' },
    { id: 'v2-3', type: 'choose', tag: 'superlative-set', level: 'B1+',
      stem: 'Complete: "the finest view ___ the entire journey".', options: ['in', 'of', 'at', 'on'],
      answer: 1, why: 'A journey is a period, and periods take <em>of</em>.' },
    { id: 'v2-4', type: 'table', tag: 'superlative-set', level: 'B1+',
      table: { cols: ['Ferry', 'Fare', 'Crossing'], rows: [['Dawn', '฿320', '90 min'], ['Midday', '฿250', '140 min'], ['Sunset', '฿410', '75 min']] },
      stem: 'Which is true?', options: ['Dawn is the cheapest.', 'Midday is the second fastest.', 'Sunset is the most expensive and the fastest.', 'Dawn is the slowest.'],
      answer: 2, why: 'Sunset: highest fare (410) and shortest crossing (75).' },
    { id: 'v2-5', type: 'gap', tag: 'irregular', level: 'B1',
      lines: [{ who: 'A', text: 'How far now?' }, { who: 'B', text: 'A little ___ than the last stop — maybe ten minutes.' }],
      options: ['farer', 'more far', 'further', 'furthest'], answer: 2, why: '<em>Far</em> is suppletive.' },
    { id: 'v2-6', type: 'equiv', tag: 'superlative-the', level: 'B1',
      given: 'The rooftop bar is the priciest in the district.',
      stem: 'What follows?', options: ['It is the only bar in the district.', 'Other bars in the district cost less.', 'It is the only rooftop bar.', 'Nothing — it is a bare claim.'],
      answer: 1, why: 'A superlative needs a set of rivals that it beats.' }
  ],
  3: [
    { id: 'v3-1', type: 'spot', tag: 'equative', level: 'B1+',
      stem: 'Click the wrong word.', words: ['The', 'hostel', 'is', 'almost', 'as', 'central', 'than', 'the', 'hotel.'],
      answer: 6, fix: 'as', why: 'Equative frame: <em>as … as</em>.' },
    { id: 'v3-2', type: 'judge', tag: 'equative', level: 'B2',
      given: 'The local train is as quick as the express — quicker, actually.',
      stem: 'Is this a contradiction?', answer: 1, why: '<em>As quick as</em> sets a floor, so refining upward is fine.' },
    { id: 'v3-3', type: 'choose', tag: 'ratio', level: 'B1+',
      stem: 'The suite is ฿7,200; the standard is ฿1,800. Complete: "The suite costs ___ the standard room."',
      options: ['four times more than', 'four times as much as', 'four times than', 'as four times much as'],
      answer: 1, why: 'A ratio requires the equative frame.' },
    { id: 'v3-4', type: 'choose', tag: 'less-fewer', level: 'B2',
      stem: 'Which is correct as written?', options: ['Fewer than 40 minutes to boarding.', 'Less than 40 minutes to boarding.', 'Fewer than 40 minute to boarding.', 'Less of 40 minutes to boarding.'],
      answer: 1, why: 'A measured amount takes <em>less</em>.' },
    { id: 'v3-5', type: 'gap', tag: 'less-fewer', level: 'B2',
      lines: [{ who: 'A', text: 'Why do you fly midweek?' }, { who: 'B', text: '___ passengers and ___ noise in the cabin.' }],
      options: ['Less / fewer', 'Fewer / less', 'Fewer / fewer', 'Less / less'], answer: 1,
      why: 'Passengers counted, noise a mass.' },
    { id: 'v3-6', type: 'equiv', tag: 'ratio', level: 'B2',
      given: 'The bus takes twice as long as the train.',
      stem: 'The train takes 40 minutes. How long is the bus?', options: ['20 minutes', '80 minutes', '120 minutes', 'Not stated'],
      answer: 1, why: '2 × 40. The equative multiplier is unambiguous.' }
  ],
  4: [
    { id: 'v4-1', type: 'spot', tag: 'very-much', level: 'B2',
      stem: 'Click the wrong word.', words: ['The', 'new', 'coaches', 'are', 'very', 'quieter', 'than', 'the', 'old', 'ones.'],
      answer: 4, fix: 'much / far', why: '<em>Very</em> modifies a point; a comparative names a gap.' },
    { id: 'v4-2', type: 'table', tag: 'differential', level: 'B2',
      table: { cols: ['Route', 'Depart', 'Arrive', 'Fare'], rows: [['Coastal', '09:00', '12:30', '฿260'], ['Inland', '09:15', '11:45', '฿540']] },
      stem: 'Which claim matches the data most precisely?',
      options: ['Inland is much faster.', 'Inland is an hour faster.', 'Inland is slightly faster.', 'Inland is no faster.'],
      answer: 1, why: 'Coastal 3 h 30 vs Inland 2 h 30 — exactly one hour.' },
    { id: 'v4-3', type: 'gap', tag: 'differential', level: 'B2',
      lines: [{ who: 'A', text: '฿540 against ฿260.' }, { who: 'B', text: 'That is ___ more expensive for an hour saved.' }],
      options: ['marginally', 'slightly', 'considerably', 'no'], answer: 2,
      why: 'The fare more than doubles, so a large-degree filler.' },
    { id: 'v4-4', type: 'equiv', tag: 'no-comparative', level: 'B2+',
      given: 'The upgraded lounge is no quieter than the old one.',
      stem: 'What is implied?', options: ['It improved.', 'The speaker expected an improvement and did not get one.', 'It is now louder.', 'The speaker never saw the old one.'],
      answer: 1, why: '<em>No + comparative</em> carries disappointment.' },
    { id: 'v4-5', type: 'judge', tag: 'very-much', level: 'B2',
      given: 'They gave us the very last two seats.', stem: 'Is this correct English?',
      answer: 0, why: 'Yes — <em>very</em> before a superlative means "precisely that one".' },
    { id: 'v4-6', type: 'build', tag: 'differential', level: 'B2',
      stem: 'Local service 1 h 50, express 1 h 30. Make a claim someone could check.', tiles: ['The', 'express', 'is', 'twenty', 'minutes', 'faster', 'than', 'the', 'local.'],
      solution: 'The express is twenty minutes faster than the local.', why: 'All four slots filled.' }
  ],
  5: [
    { id: 'v5-1', type: 'spot', tag: 'cat-match', level: 'B2',
      stem: 'Click where the repair must go.', words: ['Rents', 'in', 'Osaka', 'are', 'lower', 'than', 'Tokyo.'],
      answer: 6, fix: 'those in Tokyo', why: 'Rents compared with a city.' },
    { id: 'v5-2', type: 'choose', tag: 'cat-match', level: 'B2',
      stem: 'Repair: "The climate of Hokkaido is colder than ___ Kyushu."',
      options: ['those in', 'that of', 'it is', 'the one of'], answer: 1,
      why: '<em>Climate</em> is singular/uncountable → <em>that of</em>.' },
    { id: 'v5-3', type: 'choose', tag: 'than-clause', level: 'B2+',
      stem: 'Which is safest in exam writing?', options: ['He travels more than me.', 'He travels more than I.', 'He travels more than I do.', 'He travels more than mine.'],
      answer: 2, why: 'Restoring the verb settles the case question.' },
    { id: 'v5-4', type: 'spot', tag: 'than-clause', level: 'B2+',
      stem: 'Click the word that breaks the parallel.', words: ['Driving', 'is', 'cheaper', 'than', 'to', 'fly', 'in', 'low', 'season.'],
      answer: 4, fix: 'flying', why: 'Both sides of <em>than</em> must share a shape.' },
    { id: 'v5-5', type: 'spot', tag: 'any-ever', level: 'B2+',
      stem: 'One word sounds non-native. Click it.', words: ['This', 'lounge', 'is', 'better', 'than', 'some', 'others', 'in', 'the', 'alliance.'],
      answer: 5, fix: 'any', why: 'Comparatives license <em>any</em>.' },
    { id: 'v5-6', type: 'gap', tag: 'any-ever', level: 'B2+',
      lines: [{ who: 'A', text: 'How is punctuality now?' }, { who: 'B', text: 'Better than it has ___ been.' }],
      options: ['never', 'ever', 'always', 'yet'], answer: 1, why: 'The <em>than</em>-clause licenses <em>ever</em>.' }
  ],
  6: [
    { id: 'v6-1', type: 'spot', tag: 'zero-article', level: 'B2+',
      stem: 'Click the word that should be removed.', words: ['The', 'market', 'is', 'the', 'busiest', 'on', 'Saturday', 'mornings.'],
      answer: 3, fix: 'delete "the"', why: 'One place across times — no set of entities.' },
    { id: 'v6-2', type: 'choose', tag: 'zero-article', level: 'B2+',
      stem: 'Which needs NO article before the superlative?',
      options: ['Narita is ___ largest airport near Tokyo.', 'The beach is ___ quietest before eight.', 'It was ___ finest meal of the week.', 'Room 12 is ___ cheapest of the four.'],
      answer: 1, why: 'One beach across times of day.' },
    { id: 'v6-3', type: 'choose', tag: 'most-three', level: 'C1',
      stem: 'In "a most agreeable crossing", what does most mean?',
      options: ['The maximum of a set.', 'Very.', 'The majority of.', 'An error for "the most".'],
      answer: 1, why: 'The <em>a</em> rules out a superlative.' },
    { id: 'v6-4', type: 'spot', tag: 'most-three', level: 'C1',
      stem: 'Click the word that should not be there.', words: ['The', 'most', 'tourists', 'arrive', 'between', 'June', 'and', 'August.'],
      answer: 0, fix: 'delete "The"', why: 'Quantifier <em>most</em> takes no article.' },
    { id: 'v6-5', type: 'judge', tag: 'superlative-set', level: 'B2+',
      given: 'Ploy chose the shortest route.', stem: 'Does this definitely mean the shortest route available?',
      answer: 2, why: 'Can\'t tell — it may mean shorter than anyone else chose.' },
    { id: 'v6-6', type: 'gap', tag: 'superlative-set', level: 'B2+',
      lines: [{ who: 'A', text: 'How bad was it?' }, { who: 'B', text: 'The worst crossing I ___ made.' }],
      options: ['ever', 'have ever', 'had ever', 'was ever'], answer: 1,
      why: 'Superlative + "so far" set → present perfect.' }
  ],
  7: [
    { id: 'v7-1', type: 'spot', tag: 'correlative', level: 'C1',
      stem: 'One word should not be there. Click it.', words: ['The', 'longer', 'you', 'wait,', 'so', 'the', 'more', 'you', 'pay.'],
      answer: 4, fix: 'delete "so"', why: 'The correlative takes no conjunction.' },
    { id: 'v7-2', type: 'gap', tag: 'correlative', level: 'C1',
      lines: [{ who: 'Agent', text: 'Simple rule:' }, { who: 'Agent', text: 'The earlier you book, ___ you pay.' }],
      options: ['the less', 'less', 'the lesser', 'the fewer'], answer: 0,
      why: 'Second half also fronted with <em>the</em>; <em>pay</em> takes an amount.' },
    { id: 'v7-3', type: 'spot', tag: 'incremental', level: 'C1',
      stem: 'Click where it goes wrong.', words: ['Tickets', 'are', 'becoming', 'more', 'expensive', 'and', 'more', 'expensive.'],
      answer: 5, fix: 'more and more expensive', why: 'Only <em>more</em> doubles with a long adjective.' },
    { id: 'v7-4', type: 'choose', tag: 'incremental', level: 'C1',
      stem: 'Which pair is right?', options: ['earlier and earlier / more and more crowded', 'more early and more early / crowdeder and crowdeder', 'earlier and earlier / more crowded and more crowded', 'more and more early / more and more crowded'],
      answer: 0, why: 'Short doubles whole; long doubles only <em>more</em>.' },
    { id: 'v7-5', type: 'equiv', tag: 'no-comparative', level: 'C1',
      given: 'The wifi was less than reliable.', stem: 'What is meant?',
      options: ['Fairly reliable.', 'Reliable most of the time.', 'It barely worked.', 'There was no wifi.'],
      answer: 2, why: '<em>Less than X</em> = pointedly not X.' },
    { id: 'v7-6', type: 'choose', tag: 'metalinguistic', level: 'C1',
      stem: 'Complete: "Honestly, it is ___ a hostel than a hotel."',
      options: ['more', 'rather', 'much more', 'less'], answer: 0,
      why: 'Metalinguistic comparison uses the fixed frame <em>more X than Y</em>.' }
  ],
  8: [
    { id: 'v8-1', type: 'choose', tag: 'beyond-adj', level: 'C1',
      stem: 'Rewrite in one word: "Ferries now carry more passengers than the airline does."',
      options: ['Ferries overtake the airline.', 'Ferries outcarry the airline.', 'Ferries outperform the airline on passenger numbers.', 'Ferries overcome the airline.'],
      answer: 2, why: '<em>out-</em> attaches productively to verbs; <em>outperform</em> is the idiomatic choice here.' },
    { id: 'v8-2', type: 'spot', tag: 'irregular-split', level: 'C1',
      stem: 'Click the wrong word.', words: ['We', 'will', 'issue', 'farther', 'information', 'at', 'noon.'],
      answer: 3, fix: 'further', why: 'Information is not a distance.' },
    { id: 'v8-3', type: 'choose', tag: 'irregular-split', level: 'C1',
      stem: 'You are on a moving train and want the stop after this one. What do you ask for?',
      options: ['the nearest station', 'the next station', 'the latest station', 'the last station'],
      answer: 1, why: 'Sequence along the route, not distance from where you stand.' },
    { id: 'v8-4', type: 'equiv', tag: 'irregular-split', level: 'C1',
      given: 'We compared the sleeper and the early flight; the former was far cheaper.',
      stem: 'Which was cheaper?', options: ['The sleeper.', 'The early flight.', 'Both the same.', 'Not stated.'],
      answer: 0, why: '<em>The former</em> is the first of the two just named — the mirror of <em>the latter</em>.' },
    { id: 'v8-5', type: 'choose', tag: 'register', level: 'C1',
      stem: 'Punctuality rose from 50% to 60%. Which is correct?',
      options: ['A rise of ten percent.', 'A rise of ten percentage points, or 20%.', 'A rise of 20 percentage points.', 'A rise of 60 percent.'],
      answer: 1, why: 'Ten <strong>percentage points</strong> (60 − 50). Ten out of a starting fifty is one fifth, so a <strong>20% increase</strong>.' },
    { id: 'v8-6', type: 'build', tag: 'register', level: 'C1',
      stem: 'The new line cuts roughly 12% off journey times, though it varies by hour. Write it with the figure and a hedge.',
      tiles: ['Journey', 'times', 'are', 'roughly', '12%', 'shorter', 'than', 'those', 'on', 'the', 'old', 'line.'],
      solution: 'Journey times are roughly 12% shorter than those on the old line.',
      why: 'Hedged figure in the differential slot, category-matched standard after <em>than</em>.' }
  ]
};


/* ===== SHOPPING & INSTRUCTIONS ITEMS ===================================
   "Following instructions" items — the student reads a request and picks
   the item that satisfies it. Injected into the lessons where the grammar
   they test already lives, so they are practice, not a separate mode.
   ======================================================================= */
const EXTRA_PICK = {
  s2l1: [
    { id: 's2l1-06', type: 'pick', tag: 'superlative-the', level: 'B1',
      shop: 'Duty free — fragrance counter',
      stem: 'Your friend says: "Just get me the cheapest one."',
      items: [
        { name: 'Aurora Eau de Parfum 50 ml', price: '฿2,400', note: 'no discount' },
        { name: 'Meridian Cologne 100 ml', price: '฿1,850', note: '10% off today' },
        { name: 'Sable Mist 30 ml', price: '฿1,990', note: 'gift box included' },
        { name: 'Kite Fresh 75 ml', price: '฿2,150', note: 'buy 2 get 1' }
      ],
      answer: 1,
      why: 'Meridian at ฿1,850 is the lowest price on the shelf. A superlative picks the single winner of the whole set — the discounts and gifts are distractors, not part of the price scale.' }
  ],
  s2l2: [
    { id: 's2l2-07', type: 'pick', tag: 'superlative-set', level: 'B1+',
      shop: 'Airport pharmacy',
      stem: 'The sign says: "Biggest discount of the week." Which product does it mean?',
      items: [
        { name: 'Travel sunscreen', price: '฿420', note: 'was ฿480 — save ฿60' },
        { name: 'Motion-sickness tablets', price: '฿180', note: 'was ฿300 — save ฿120' },
        { name: 'Eye mask set', price: '฿650', note: 'was ฿790 — save ฿140' },
        { name: 'Hand cream', price: '฿240', note: 'was ฿300 — save ฿60' }
      ],
      answer: 1,
      why: 'Careful: the biggest <em>discount</em> is a proportion, not an amount. Tablets are 40% off; the eye mask saves more baht but is only 18% off. Superlatives are only as true as the scale you measure on.' }
  ],
  s3l3: [
    { id: 's3l3-07', type: 'pick', tag: 'less-fewer', level: 'B2',
      shop: 'Convenience store, ฿100 in your pocket',
      stem: 'You ask: "What can I get for less than ฿100 that has fewer than three items in the pack?"',
      items: [
        { name: 'Rice crackers', price: '฿85', note: '6 packets inside' },
        { name: 'Iced coffee + sandwich', price: '฿95', note: '2 items' },
        { name: 'Fruit box', price: '฿120', note: '1 item' },
        { name: 'Sweet bun 4-pack', price: '฿60', note: '4 items' }
      ],
      answer: 1,
      why: 'Two conditions, two different words: <em>less than ฿100</em> (money is an amount) and <em>fewer than three items</em> (items are counted). Only the coffee and sandwich satisfies both.' }
  ],
  s4l1: [
    { id: 's4l1-07', type: 'pick', tag: 'differential', level: 'B2',
      shop: 'Cosmetics counter',
      stem: 'You ask: "Is there a slightly less expensive version of this lipstick?" The one you are holding is ฿1,200.',
      items: [
        { name: 'Same shade, mini size', price: '฿1,050', note: '3 g instead of 5 g' },
        { name: 'Same shade, refill only', price: '฿400', note: 'no case' },
        { name: 'Same shade, gift set', price: '฿1,950', note: 'with brush' },
        { name: 'Same shade, standard', price: '฿1,190', note: 'identical product' }
      ],
      answer: 0,
      why: '<em>Slightly</em> is a small-gap word. ฿1,050 is a noticeable but modest step down; ฿1,190 is barely a difference at all, and ฿400 is a large one, not a slight one.' }
  ],
  s4l3: [
    { id: 's4l3-06', type: 'pick', tag: 'no-comparative', level: 'B2+',
      shop: 'Souvenir shop',
      stem: 'Your friend says: "Get something, but it must be no more than ฿500 and by far the most useful thing they sell."',
      items: [
        { name: 'Fridge magnet', price: '฿120', note: 'decorative' },
        { name: 'Folding umbrella', price: '฿450', note: 'rainy season starts next week' },
        { name: 'Novelty keyring', price: '฿90', note: 'decorative' },
        { name: 'Silk scarf', price: '฿1,400', note: 'over budget' }
      ],
      answer: 1,
      why: 'Two instructions. <em>No more than ฿500</em> sets a ceiling that removes the scarf; <em>by far the most useful</em> then picks the clear winner among what is left.' }
  ],
  s6l2: [
    { id: 's6l2-06', type: 'pick', tag: 'superlative-set', level: 'B2+',
      shop: 'Electronics — travel adaptors',
      stem: 'You ask: "Which is the best value — not the cheapest, the best value?"',
      items: [
        { name: 'Basic 2-pin', price: '฿190', note: '1 country, no warranty' },
        { name: 'Universal 4-port', price: '฿690', note: '150 countries, 2-yr warranty' },
        { name: 'Universal, no USB', price: '฿540', note: '150 countries, 6-month warranty' },
        { name: 'Premium travel kit', price: '฿1,890', note: '150 countries, 2-yr warranty, case' }
      ],
      answer: 1,
      why: '<em>Best value</em> and <em>cheapest</em> are different scales — the speaker says so explicitly. The 4-port matches the premium kit on coverage and warranty at a third of the price.' }
  ],
  s8l1: [
    { id: 's8l1-06', type: 'pick', tag: 'beyond-adj', level: 'C1',
      shop: 'Luggage department',
      stem: 'The label says: "Outlasts and outperforms every case in its class." Which case is it describing?',
      items: [
        { name: 'Featherlite', price: '฿2,900', note: '1-yr warranty, 2.1 kg' },
        { name: 'Ironclad', price: '฿4,600', note: '10-yr warranty, tested to 8,000 rolls' },
        { name: 'Budget Roller', price: '฿1,400', note: '6-month warranty' },
        { name: 'Classic Soft', price: '฿3,200', note: '2-yr warranty' }
      ],
      answer: 1,
      why: '<em>Outlast</em> compares durability and <em>outperform</em> compares overall quality — both are verbal comparatives, and only the Ironclad\'s figures support either claim.' }
  ]
};

STAGES.forEach(function (st) {
  st.lessons.forEach(function (ls) {
    if (EXTRA_PICK[ls.id]) { ls.items = ls.items.concat(EXTRA_PICK[ls.id]); }
  });
});

/* One "following instructions" item added to three challenges, so the
   format appears under test conditions too. */
CHALLENGES.s3.items.push({
  id: 's3ch-9', type: 'pick', tag: 'less-fewer', level: 'B2',
  shop: 'Convenience store, ฿100 budget',
  stem: 'You ask: "What can I get for less than ฿100 with fewer than three items in the pack?"',
  items: [
    { name: 'Rice crackers', price: '฿85', note: '6 packets' },
    { name: 'Coffee + sandwich', price: '฿95', note: '2 items' },
    { name: 'Fruit box', price: '฿120', note: '1 item' },
    { name: 'Bun 4-pack', price: '฿60', note: '4 items' }
  ],
  answer: 1,
  why: 'Money is an amount (<em>less</em>); items are counted (<em>fewer</em>). Only one option satisfies both.'
});
CHALLENGES.s4.items.push({
  id: 's4ch-9', type: 'pick', tag: 'differential', level: 'B2',
  shop: 'Cosmetics counter — you are holding a ฿1,200 lipstick',
  stem: '"Is there a slightly less expensive version?"',
  items: [
    { name: 'Mini size', price: '฿1,050', note: '3 g' },
    { name: 'Refill only', price: '฿400', note: 'no case' },
    { name: 'Gift set', price: '฿1,950', note: 'with brush' },
    { name: 'Standard', price: '฿1,190', note: 'identical' }
  ],
  answer: 0,
  why: '<em>Slightly</em> names a small gap — not a trivial one (฿1,190) and not a large one (฿400).'
});
CHALLENGES.s6.items.push({
  id: 's6ch-9', type: 'pick', tag: 'superlative-set', level: 'B2+',
  shop: 'Airport pharmacy',
  stem: '"Biggest discount of the week" — which product?',
  items: [
    { name: 'Sunscreen', price: '฿420', note: 'was ฿480' },
    { name: 'Travel tablets', price: '฿180', note: 'was ฿300' },
    { name: 'Eye mask set', price: '฿650', note: 'was ฿790' },
    { name: 'Hand cream', price: '฿240', note: 'was ฿300' }
  ],
  answer: 1,
  why: 'A discount is a proportion: 40% beats the eye mask\'s 18%, even though the eye mask saves more baht.'
});

/* --------------------------------------------------------------------------
   EXPORTS
   -------------------------------------------------------------------------- */
const CONTENT = { CEFR, RANKS, BADGES, REMEDIATION, STAGES, VERIFY };
if (typeof window !== 'undefined') { window.CONTENT = CONTENT; }
if (typeof module !== 'undefined') { module.exports = CONTENT; }
