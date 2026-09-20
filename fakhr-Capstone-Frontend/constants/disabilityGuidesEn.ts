type GuideCopy = {
  name: string;
  shortName: string;
  definition: string;
  signs: string[];
  whenToSeek: string[];
  homeSupport: string[];
};

export const DISABILITY_GUIDES_EN: Record<string, GuideCopy> = {
  autism: {
    name: "Autism spectrum disorder",
    shortName: "Autism spectrum",
    definition:
      "Autism spectrum disorder is a developmental difference that affects how a child communicates, relates to others, and shows interests and patterns of behavior. It usually appears in the early years, and support needs vary from child to child.",
    signs: [
      "Difficulty with eye contact or using gestures to communicate",
      "Delayed language, or repeating words and phrases",
      "Limited interests, or repeating movements or routines",
      "Higher or lower sensitivity to sound, touch, light, or texture",
      "Difficulty with pretend play or peer interaction",
    ],
    whenToSeek: [
      "If speech or response to name is clearly delayed after 18–24 months",
      "If the child loses skills they previously had",
      "If social communication or play is limited in a way that concerns you",
      "If sensory sensitivity or repetitive behavior affects daily life",
    ],
    homeSupport: [
      "Use short, clear sentences and allow time to respond",
      "Support communication with pointing, pictures, or visual routines",
      "Keep a consistent daily routine when you can",
      "Create a calm space and reduce distractions during learning or play",
      "Celebrate small attempts and build on your child's interests",
    ],
  },
  intellectual: {
    name: "Intellectual disability",
    shortName: "Intellectual disability",
    definition:
      "Intellectual disability means a child needs more time and support to learn thinking, practical, and social skills than peers. It does not mean they cannot learn—it means the pace and the need for simpler, repeated steps are different.",
    signs: [
      "Delayed speech, understanding, or everyday problem-solving",
      "Difficulty learning self-care skills expected for their age",
      "Needing more support in play or interacting with others",
      "Difficulty remembering instructions or using them in new situations",
    ],
    whenToSeek: [
      "If developmental delay is clear in more than one area",
      "If learning stays hard despite calm repetition and home support",
      "Before school entry, or if the gap with peers is large",
    ],
    homeSupport: [
      "Break tasks into small steps and repeat them calmly",
      "Use pictures and modeling instead of long explanations",
      "Practice daily skills such as eating and dressing regularly",
      "Praise effort, not only the final result",
    ],
  },
  adhd: {
    name: "Attention-deficit/hyperactivity disorder",
    shortName: "ADHD",
    definition:
      "ADHD is a lasting pattern of difficulty focusing, extra movement, and/or impulsivity. It shows up in more than one setting, such as home and school, and can affect learning, relationships, or safety.",
    signs: [
      "Difficulty finishing tasks or following instructions",
      "Getting distracted quickly by sounds or movement",
      "Constant movement, or difficulty sitting still for their age",
      "Speaking or acting impulsively without waiting their turn",
      "Frequently forgetting or losing belongings",
    ],
    whenToSeek: [
      "If symptoms last more than six months and affect school or relationships",
      "If difficulties appear at both home and school",
      "If impulsivity puts the child in unsafe situations",
    ],
    homeSupport: [
      "Give short, direct instructions—one at a time",
      "Use a clear visual routine for the day and for tasks",
      "Offer short movement breaks between focus times",
      "Reduce distractions during homework",
    ],
  },
  learning: {
    name: "Learning difficulties",
    shortName: "Learning difficulties",
    definition:
      "Learning difficulties affect how the brain processes reading, writing, or math, even when a child's intelligence is average or above. They often appear when academic learning begins and need tailored teaching methods.",
    signs: [
      "Ongoing difficulty reading or distinguishing letters and sounds",
      "Slow writing or spelling errors that do not match the effort given",
      "Difficulty understanding math problems or recalling number facts",
      "Avoiding schoolwork despite trying",
    ],
    whenToSeek: [
      "If progress stays weak despite home and school support",
      "If teachers notice a clear gap between effort and results",
      "If the child starts losing confidence because of learning",
    ],
    homeSupport: [
      "Read together daily for a short, consistent time",
      "Use visual and hands-on ways to learn",
      "Build confidence through strengths such as drawing, movement, or stories",
      "Work with the school on a clear support plan",
    ],
  },
  motor: {
    name: "Physical disability",
    shortName: "Physical disability",
    definition:
      "A physical disability affects movement, balance, or muscle control. Needs may include assistive devices, exercises, and adapting the home or school environment.",
    signs: [
      "Delayed sitting, crawling, or walking compared with expected age",
      "Noticeable muscle stiffness or floppiness",
      "Difficulty with balance or fine motor skills",
      "Tiring quickly during movement, or avoiding physical play",
    ],
    whenToSeek: [
      "If motor milestones are clearly delayed",
      "If one side of the body is used much less than the other",
      "If movement limits independence in eating, dressing, or play",
    ],
    homeSupport: [
      "Follow the therapist's home exercise plan in short, regular sessions",
      "Adapt the space so the child can move and reach safely",
      "Encourage participation in play in ways that fit their body",
      "Celebrate every gain in independence",
    ],
  },
  hearing: {
    name: "Hearing disability",
    shortName: "Hearing disability",
    definition:
      "A hearing disability reduces how clearly a child hears speech and environmental sounds. Early support in language, listening, and communication—spoken, signed, or both—makes a major difference.",
    signs: [
      "Not responding to name or to sounds as expected for age",
      "Delayed speech, or speech that is hard to understand",
      "Turning up volume, or watching faces closely to understand",
      "Frequent ear infections or concerns after newborn hearing screening",
    ],
    whenToSeek: [
      "If hearing screening was not passed or was delayed",
      "If speech is delayed compared with peers",
      "If the child often seems not to hear instructions",
    ],
    homeSupport: [
      "Get the child's attention before speaking, and face them",
      "Reduce background noise during conversation",
      "Use visual supports, gestures, or sign as recommended",
      "Keep hearing devices on a consistent daily routine",
    ],
  },
  vision: {
    name: "Visual disability",
    shortName: "Visual disability",
    definition:
      "A visual disability affects how clearly a child sees, or how they use vision for movement and learning. Support may include glasses, orientation, and adapted materials.",
    signs: [
      "Holding objects very close, or not following faces or toys",
      "Frequent eye rubbing, squinting, or unusual head positions",
      "Bumping into objects, or hesitation in new spaces",
      "Delayed reaching, crawling, or exploring",
    ],
    whenToSeek: [
      "If visual behavior worries you in the first months or years",
      "If the child does not track faces or toys",
      "If movement or play is limited because of vision",
    ],
    homeSupport: [
      "Use good lighting and high contrast",
      "Keep furniture in a consistent place and describe the space",
      "Offer toys that make sound or have a clear tactile difference",
      "Follow the specialist's recommendations for glasses or mobility",
    ],
  },
  speech: {
    name: "Speech and communication disorders",
    shortName: "Speech and communication",
    definition:
      "These disorders affect producing sounds, understanding language, using words, or social communication. Early practice at home and with a specialist supports progress.",
    signs: [
      "Speech that is hard to understand compared with age",
      "A smaller vocabulary, or difficulty putting words together",
      "Difficulty understanding simple instructions",
      "Frustration, withdrawal, or behavior that follows communication difficulty",
    ],
    whenToSeek: [
      "If speech is clearly behind what is expected for age",
      "If the child is rarely understood by people outside the family",
      "If communication difficulty affects play or behavior",
    ],
    homeSupport: [
      "Narrate daily routines with simple language",
      "Wait and listen—do not rush to finish the child's sentence",
      "Use pictures, choices, and play to invite language",
      "Praise every attempt to communicate",
    ],
  },
  down: {
    name: "Down syndrome",
    shortName: "Down syndrome",
    definition:
      "Down syndrome is a genetic condition that can affect learning, muscle tone, health, and development. With early support, children make meaningful progress in communication, movement, and independence.",
    signs: [
      "Lower muscle tone and delayed motor milestones",
      "Delayed speech and language",
      "Need for extra support in learning and self-care",
      "Health needs that require regular medical follow-up",
    ],
    whenToSeek: [
      "From early infancy, for developmental and health follow-up",
      "If feeding, hearing, or heart concerns appear",
      "When planning school or therapy support",
    ],
    homeSupport: [
      "Start early intervention and keep a regular therapy rhythm",
      "Use pictures, songs, and repetition to build language",
      "Practice self-care in small daily steps",
      "Include the child in family routines and play",
    ],
  },
  multiple: {
    name: "Multiple disabilities",
    shortName: "Multiple disabilities",
    definition:
      "Multiple disabilities means a child has more than one significant need—for example movement and communication, or hearing and learning. Support works best when teams coordinate around the whole child.",
    signs: [
      "Needs in more than one developmental area",
      "Communication that depends on extra support",
      "Daily care or mobility that needs planning",
      "Fatigue or medical needs that affect learning time",
    ],
    whenToSeek: [
      "As soon as more than one area of need is clear",
      "When services feel fragmented or goals conflict",
      "Before major transitions such as starting school",
    ],
    homeSupport: [
      "Agree on a few shared goals across home and specialists",
      "Use the communication method the child actually uses",
      "Keep routines predictable and rest built in",
      "Ask the team to coordinate rather than add more tasks",
    ],
  },
  developmental: {
    name: "Developmental delay",
    shortName: "Developmental delay",
    definition:
      "Developmental delay means a child is slower than expected in one or more areas such as movement, language, or social skills. Early support can change the path, and some children catch up with the right help.",
    signs: [
      "Later sitting, walking, or using hands than expected",
      "Later speech or social smiling/play than expected",
      "Difficulty with more than one skill area at once",
      "Losing skills that were already present",
    ],
    whenToSeek: [
      "If delay is noticeable to you or the doctor",
      "If more than one area is delayed",
      "Immediately if skills are lost",
    ],
    homeSupport: [
      "Play every day in short, enjoyable sessions",
      "Follow through on therapy ideas at home",
      "Talk, sing, and read even before words appear",
      "Keep a simple log of milestones with the doctor",
    ],
  },
  mental: {
    name: "Mental health and behavior",
    shortName: "Mental health and behavior",
    definition:
      "This area includes anxiety, mood changes, intense tantrums, or behavior that affects a child's safety and relationships. Behavior is a message; understanding the need behind it matters more than punishment alone.",
    signs: [
      "Long tantrums or repeated aggression",
      "Withdrawal, extreme fear, or clinginess that is hard to soothe",
      "Changes in sleep, eating, or play",
      "Self-harm or dangerous behavior",
    ],
    whenToSeek: [
      "If behavior continues and affects family or school",
      "If withdrawal, sadness, or severe anxiety appears",
      "Immediately if the child or others may be harmed",
    ],
    homeSupport: [
      "Keep a regular sleep and meal routine",
      "Name feelings and teach simple calming tools",
      "Set calm, consistent limits without humiliation",
      "Notice triggers such as hunger, tiredness, noise, or sudden change",
    ],
  },
};
