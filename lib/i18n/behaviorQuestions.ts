import type { Concept, ConceptOutline } from "@/lib/parse";
import type { SlotKind } from "@/lib/parse/slots";
import type { Topic } from "@/lib/catalog";
import type { Locale } from "./locales";

export const BEHAVIOR_QUESTIONS_FILE = "0_behavior_questions.md";

const QUESTION_TITLES_RU: Readonly<Record<string, string>> = {
  "Interview preparation": "Подготовка к собеседованию",
  "Tell me about yourself": "Расскажите о себе",
  "What are your greatest strengths?": "Какие ваши главные сильные стороны?",
  "What are your greatest weaknesses?": "Какие ваши главные слабые стороны?",
  "Tell me about something you did – or failed to do – that you now feel a little ashamed of.":
    "Расскажите о ситуации, за которую вам сейчас немного стыдно.",
  "Why are you leaving (or did you leave) this position?":
    "Почему вы уходите (или ушли) с текущей/прошлой позиции?",
  "The “Silent Treatment”": "«Молчаливое» давление",
  "Why should I hire you?": "Почему я должен нанять именно вас?",
  "Aren’t you overqualified for this position?":
    "Разве вы не слишком квалифицированы для этой позиции?",
  "Where do you see yourself five years from now?":
    "Где вы видите себя через пять лет?",
  "Describe your ideal company, location and job.":
    "Опишите идеальную для вас компанию, локацию и работу.",
  "Why do you want to work at our company?":
    "Почему вы хотите работать в нашей компании?",
  "Why have you been out of work so long?":
    "Почему вы так долго были без работы?",
  "Tell me honestly about the strong points and weak points of your boss (company, management team, etc.)…":
    "Расскажите честно о сильных и слабых сторонах вашего руководителя (компании, менеджмента и т.д.)…",
  "What good books have you read lately?":
    "Какие хорошие книги вы читали в последнее время?",
  "Tell me about a situation when your work was criticized.":
    "Расскажите о ситуации, когда вашу работу критиковали.",
  "What are your outside interests?": "Какие у вас интересы вне работы?",
  "The “Fatal Flaw” question": "Вопрос о «фатальном недостатке»",
  "How do you feel about reporting to a younger person (minority, woman, etc)?":
    "Как вы относитесь к подчинению более молодому человеку (женщине, представителю меньшинства и т.д.)?",
  "On confidential matters…": "О конфиденциальных вопросах…",
  "Would you lie for the company?": "Вы бы солгали ради компании?",
  "Looking back, what would you do differently in your life?":
    "Оглядываясь назад, что бы вы изменили в своей жизни?",
  "Could you have done better in your last job?":
    "Могли бы вы работать лучше на прошлом месте?",
  "Can you work under pressure?": "Можете ли вы работать под давлением?",
  "What makes you angry?": "Что вас злит?",
  "Why aren’t you earning more money at this stage of your career?":
    "Почему на этом этапе карьеры вы зарабатываете не больше?",
  "Who has inspired you in your life and why?":
    "Кто вдохновлял вас в жизни и почему?",
  "What was the toughest decision you ever had to make?":
    "Какое самое сложное решение вам приходилось принимать?",
  "Tell me about the most boring job you’ve ever had.":
    "Расскажите о самой скучной работе, которая у вас была.",
  "Have you been absent from work more than a few days in any previous position?":
    "Бывало ли, что вы отсутствовали на работе больше нескольких дней на прошлых местах?",
  "What changes would you make if you came on board?":
    "Какие изменения вы бы внесли, если выйдете на работу?",
  "I’m concerned that you don’t have as much experience as we’d like in…":
    "Меня беспокоит, что у вас недостаточно опыта в…",
  "How do you feel about working nights and weekends?":
    "Как вы относитесь к работе по ночам и в выходные?",
  "Are you willing to relocate or travel?":
    "Готовы ли вы к переезду или командировкам?",
  "Do you have the stomach to fire people? Have you had experience firing many people?":
    "Сможете ли вы увольнять людей? Был ли у вас такой опыт?",
  "Why have you had so many jobs?": "Почему у вас было так много мест работы?",
  "…a leading company in our industry; etc.":
    "…лидирующая компания в нашей отрасли; и т.д.",
  "What would you say to your boss if he’s crazy about an idea, but you think it stinks?":
    "Что бы вы сказали боссу, если ему идея нравится, а вам она кажется плохой?",
  "How could you have improved your career progress?":
    "Как можно было бы улучшить ваш карьерный рост?",
  "What would you do if a fellow executive on your own corporate level wasn’t pulling his/her weight…and this was hurting your department?":
    "Что бы вы сделали, если равный по уровню руководитель не тянул работу и это вредило отделу?",
  "You’ve been with your firm a long time. Won’t it be hard switching to a new company?":
    "Вы давно в компании. Разве переход в новую компанию не будет сложным?",
  "May I contact your present employer for a reference?":
    "Можем ли мы связаться с вашим текущим работодателем за рекомендацией?",
  "Give me an example of your creativity (analytical skill…managing ability, etc.)":
    "Приведите пример вашей креативности (аналитики, управления и т.д.)",
  "What do you worry about?": "О чем вы беспокоитесь?",
  "How many hours a week do you normally work?":
    "Сколько часов в неделю вы обычно работаете?",
  "What’s the most difficult part of being a (job title)?":
    "Что самое сложное в работе (должности)?",
  "The “Hypothetical Problem”": "«Гипотетическая проблема»",
  "What was the toughest challenge you’ve ever faced?":
    "С каким самым сложным вызовом вы сталкивались?",
  "Have you consider starting your own business?":
    "Думали ли вы открыть свой бизнес?",
  "What are your goals?": "Какие у вас цели?",
  "Sell me this stapler…(this pencil…this clock…or some other object on interviewer’s desk).":
    "Продайте мне этот степлер… (или другой предмет на столе интервьюера).",
  "The Salary Question” – How much money do you want?":
    "Вопрос о зарплате — сколько денег вы хотите?",
  "The Illegal Question": "Незаконный вопрос",
  "The “Secret” Illegal Question Simple summary:":
    "«Секретный» незаконный вопрос",
  "What was the toughest part of your last job?":
    "Что было самым сложным на прошлой работе?",
  "How do you define success…and how do you measure up to your own definition?":
    "Как вы определяете успех… и насколько ему соответствуете?",
  "“The Opinion Question” – What do you think about …Abortion…The President…The Death Penalty…(or any other controversial subject)?":
    "«Вопрос о мнении» — что вы думаете об абортах, президенте, смертной казни… (или другой спорной теме)?",
  "If you won \\$10 million lottery, would you still work?":
    "Если бы вы выиграли $10 млн в лотерею, вы бы продолжали работать?",
  "Looking back on your last position, have you done your best work?":
    "Оглядываясь на прошлую позицию, сделали ли вы там лучшую работу в жизни?",
  "Tell me something negative you’ve heard about our company…":
    "Расскажите что-то негативное, что вы слышали о нашей компании…",
  "On a scale of one to ten, rate me as an interviewer.":
    "По шкале от 1 до 10, оцените меня как интервьюера.",
};

const SLOT_LABELS_RU: Partial<Record<SlotKind, string>> = {
  key: "Ключ",
  advices: "Советы",
  traps: "Ловушки",
  interviewQuestions: "Вопросы для интервью",
};

export function isBehaviorQuestionsTopic(
  topic: Pick<Topic, "file" | "slug">,
): boolean {
  return (
    topic.file === BEHAVIOR_QUESTIONS_FILE ||
    topic.slug === "behavior-questions"
  );
}

export function behaviorQuestionTitle(
  locale: Locale,
  englishTitle: string,
): string {
  if (locale !== "ru") {
    return englishTitle;
  }
  return QUESTION_TITLES_RU[englishTitle] ?? englishTitle;
}

export function behaviorSlotLabel(
  locale: Locale,
  kind: SlotKind,
): string | undefined {
  if (locale !== "ru") {
    return undefined;
  }
  return SLOT_LABELS_RU[kind];
}

export function localizeBehaviorOutline(
  outline: readonly ConceptOutline[],
  locale: Locale,
): readonly ConceptOutline[] {
  if (locale !== "ru") {
    return outline;
  }
  return outline.map((concept) => {
    const title = behaviorQuestionTitle(locale, concept.title);
    if (title === concept.title) {
      return concept;
    }
    return {
      ...concept,
      title,
      titleSearchText: [title, concept.titleSearchText ?? concept.title]
        .join(" ")
        .trim(),
    };
  });
}

export function localizeBehaviorConcepts(
  concepts: readonly Concept[],
  locale: Locale,
): readonly Concept[] {
  if (locale !== "ru") {
    return concepts;
  }
  return concepts.map((concept) => {
    const title = behaviorQuestionTitle(locale, concept.title);
    if (title === concept.title) {
      return concept;
    }
    return {
      ...concept,
      title,
      titleSearchText: [
        title,
        concept.titleSearchText ?? concept.title,
        concept.searchText ?? "",
      ]
        .join(" ")
        .trim()
        .slice(0, 1600),
    };
  });
}

export function behaviorPageTitle(
  locale: Locale,
  englishTitle: string,
): string {
  if (locale !== "ru") {
    return englishTitle;
  }
  if (englishTitle === "Behavior questions") {
    return "Поведенческие вопросы";
  }
  return englishTitle;
}
