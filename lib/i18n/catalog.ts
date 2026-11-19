import type { Locale } from "./locales";

/** Russian UI copy for catalog blurbs (EN catalog stays source of truth). */
const RU_BLURBS: Readonly<Record<string, string>> = {
  "2024+ CSS features and advanced phase-2 topics.":
    "Возможности CSS 2024+ и продвинутые темы phase-2.",
  "AAA and the test pyramid.": "AAA и пирамида тестов.",
  "AAA, pyramid, layers, practices, and tooling.":
    "AAA, пирамида, слои, практики и инструменты.",
  "AAA, the test pyramid, doubles, and Jest.":
    "AAA, пирамида тестов, doubles и Jest.",
  "AMQP exchanges, queues, routing, and task queues.":
    "AMQP exchanges, очереди, маршрутизация и task queues.",
  "Accessibility, SEO, and advanced APIs.":
    "Доступность, SEO и продвинутые API.",
  "SEO and advanced APIs.": "SEO и продвинутые API.",
  "Attributes valid on any element.": "Атрибуты, допустимые на любом элементе.",
  "ACID, CAP, transactions, and normalization.":
    "ACID, CAP, транзакции и нормализация.",
  "Agent Skills: SKILL.md, auto vs slash, and built-ins.":
    "Agent Skills: SKILL.md, auto vs slash и встроенные.",
  "Agent Skills: SKILL.md, auto vs slash, paths, and built-ins.":
    "Agent Skills: SKILL.md, auto vs slash, пути и встроенные.",
  "AI-first vs augmented, editors, Context7/Ref, and RTK.":
    "AI-first vs augmented, редакторы, Context7/Ref и RTK.",
  "AI-first developer habits, verification, and spec-driven development (SDD).":
    "AI-first привычки разработчика, проверка результата и spec-driven development (SDD).",
  "AI across the delivery pipeline: multi-agent roles, human gates, MCP/RAG infra, lead time metrics.":
    "ИИ на конвейере поставки: роли агентов, human gates, инфра MCP/RAG, метрики lead time.",
  "Classical SDLC principles and phases, then multi-agent roles, gates, MCP, and lead time.":
    "Принципы и этапы SDLC, затем роли агентов, ворота, MCP и lead time.",
  "Principles, phases, process models, and agentic AI delivery.":
    "Принципы, этапы, модели процесса и агентная AI-поставка.",
  "Planning through support: six stages and Agile overlap.":
    "От планирования до поддержки: шесть этапов и перекрытие в Agile.",
  "Principles, six phases, Agile and Waterfall, and multi-agent delivery.":
    "Принципы, шесть этапов, Agile и Waterfall, мультиагентная поставка.",
  Principles: "Принципы",
  Phases: "Этапы",
  Methodologies: "Методологии",
  "Cyclicity, quality, transparency, risk, user focus, and systematic delivery.":
    "Цикличность, качество, прозрачность, риски, фокус на пользователе и системный подход.",
  "Planning through support: six lifecycle stages and Agile overlap.":
    "От планирования до поддержки: шесть этапов жизненного цикла и перекрытие в Agile.",
  "Vertical slice, prod triage, Git/CI/Docker/migrations, secrets and access, design patterns — study map with checklists.":
    "Vertical slice, triage в проде, Git/CI/Docker/миграции, секреты и доступы, паттерны — карта обучения с чеклистами.",
  "Core tips, skills, rules, plugins, slash commands, and questions.":
    "Core tips, skills, rules, plugins, slash-команды и вопросы.",
  "Shortcuts, Run Modes, verification loops, and Cursor Directory.":
    "Шорткаты, Run Modes, циклы проверки и Cursor Directory.",
  "Algorithm basics and complexity analysis.":
    "Основы алгоритмов и анализ сложности.",
  "Annotations, type assertions, and function types.":
    "Аннотации типов, type assertions и типы функций.",
  "any and unknown.": "any и unknown.",
  "App Router, data, routing, and the Next.js platform.":
    "App Router, данные, маршрутизация и платформа Next.js.",
  "App Router, file-based routes, navigation, and metadata.":
    "App Router, файловые маршруты, навигация и metadata.",
  "App Router, file-based routes, navigation, metadata, and SEO.":
    "App Router, файловые маршруты, навигация, metadata и SEO.",
  "App Router, file-based routes, and navigation.":
    "App Router, файловые маршруты и навигация.",
  "App Router, data, routing, accessibility, SEO, metadata, and the Next.js platform.":
    "App Router, данные, маршрутизация, доступность, SEO, metadata и платформа Next.js.",
  "Metadata API, sitemaps, robots, structured data, and accessible pages.":
    "Metadata API, sitemap, robots, structured data и доступные страницы.",
  "AWS, GCP, Azure, and managed infrastructure.":
    "AWS, GCP, Azure и managed-инфраструктура.",
  "AWS, GCP, and Azure.": "AWS, GCP и Azure.",
  "App types and security.": "Типы приложений и безопасность.",
  "App types and real-time transports.":
    "Типы приложений и realtime-транспорты.",
  "Architecture, libraries, performance, and legacy.":
    "Архитектура, библиотеки, производительность и legacy.",
  "Atomic Design, FSD, feature folders, and micro-frontends.":
    "Atomic Design, FSD, feature folders и micro-frontends.",
  "Atomic, FSD, Bulletproof React, slices, MFE, and monorepo layout.":
    "Atomic, FSD, Bulletproof React, slices, MFE и monorepo layout.",
  "SPA, micro-frontends, FSD, client routing, and rendering modes.":
    "SPA, micro-frontends, FSD, клиентский роутинг и режимы рендеринга.",
  "Libraries, data fetching, styling, performance, and legacy.":
    "Библиотеки, data fetching, стили, производительность и legacy.",
  "Build, testing, REST client, backend integration, observability, and platforms.":
    "Build, testing, REST client, backend integration, observability и platforms.",
  "Vite and Webpack for React — config, code splitting, tree shaking.":
    "Vite и Webpack для React — config, code splitting, tree shaking.",
  "Vite and Webpack for React — config, splitting, tree shaking.":
    "Vite и Webpack для React — config, splitting, tree shaking.",
  "Jest, React Testing Library, test pyramid, Playwright/Cypress.":
    "Jest, React Testing Library, пирамида тестов, Playwright/Cypress.",
  "Jest, React Testing Library, pyramid, Playwright/Cypress.":
    "Jest, React Testing Library, пирамида, Playwright/Cypress.",
  "fetch, axios, error handling, and TanStack Query / RTK caching.":
    "fetch, axios, обработка ошибок и кэш TanStack Query / RTK.",
  "fetch, axios, error handling, and client-side caching.":
    "fetch, axios, обработка ошибок и клиентский кэш.",
  "Microservices, API gateway, BFF, contracts, and partial failure.":
    "Microservices, API gateway, BFF, контракты и partial failure.",
  "Microservices, API gateway, BFF, and frontend boundaries.":
    "Microservices, API gateway, BFF и границы фронтенда.",
  "Sentry, browser logging, RUM, and CI source maps.":
    "Sentry, логи в браузере, RUM и source maps в CI.",
  "Sentry, client logs, RUM, and release debugging.":
    "Sentry, клиентские логи, RUM и отладка релизов.",
  "SPA, MPA, SSR, PWA, and React Native vs native.":
    "SPA, MPA, SSR, PWA и React Native vs native.",
  "SPA, SSR, PWA, and mobile (React Native) architecture.":
    "SPA, SSR, PWA и mobile (React Native) architecture.",
  "Architecture, patterns, and scaling.":
    "Архитектура, паттерны и масштабирование.",
  "Arrays, trees, graphs, heaps, and structure selection.":
    "Массивы, деревья, графы, кучи и выбор структуры.",
  "AuthN/AuthZ, sessions, JWT, OAuth, cookies, and storage.":
    "AuthN/AuthZ, сессии, JWT, OAuth, cookies и storage.",
  "Basic value types — string, number, boolean, arrays, any, null, undefined.":
    "Базовые типы значений — string, number, boolean, arrays, any, null, undefined.",
  "Best common type, contextual typing, and inference.":
    "Best common type, контекстная типизация и вывод типов.",
  "Big O and algorithm fundamentals.": "Big O и основы алгоритмов.",
  "Broker fundamentals and selection.":
    "Основы брокеров сообщений и выбор решения.",
  "Broker fundamentals, queue vs log, and broker selection.":
    "Основы брокеров, queue vs log и выбор брокера.",
  "Big O, common algorithms, and interview patterns.":
    "Big O, типовые алгоритмы и паттерны для собеседований.",
  "Blob, ArrayBuffer, FormData, FileReader, and object URLs.":
    "Blob, ArrayBuffer, FormData, FileReader и object URLs.",
  "Built-in Fragment, Profiler, StrictMode, Suspense, Activity, ViewTransition.":
    "Встроенные Fragment, Profiler, StrictMode, Suspense, Activity и ViewTransition.",
  "Built-in type operators — index hub with links to section topics.":
    "Встроенные type operators — hub-индекс со ссылками на разделы.",
  "Built-in utility types — catalog hub with sectioned topics.":
    "Встроенные utility types — hub каталога с разделами по темам.",
  "Binary trees, BFS/DFS traversal, graph representations, and tries for prefix search — including recursive vs iterative trade-offs.":
    "Бинарные деревья, обход BFS/DFS, представления графов и trie для поиска по префиксу — с recursive vs iterative подходами.",
  "Branches, merges, remotes, and collaboration.":
    "Ветки, merge, remote и совместная работа.",
  "Branches, remotes, and team practices.":
    "Ветки, remote и командные практики.",
  "Browser security, Core Web Vitals, and integrations.":
    "Безопасность браузера, Core Web Vitals и интеграции.",
  "Browser security and third-party integrations.":
    "Безопасность браузера и сторонние интеграции.",
  "Browser platform, web accessibility, and security fundamentals.":
    "Платформа браузера, веб-доступность и основы безопасности.",
  "Browser processes, JS engine, rendering, and security model.":
    "Процессы браузера, движок JS, рендеринг и модель безопасности.",
  "Processes, V8, rendering pipeline, and security model overview.":
    "Процессы, V8, пайплайн рендеринга и обзор модели безопасности.",
  "Browser work principles, processes, V8, rendering, and security model.":
    "Принципы работы браузера, процессы, V8, рендеринг и модель безопасности.",
  "Bundlers, CI, Docker, and delivery.": "Бандлеры, CI, Docker и доставка.",
  "Call signatures, overloads, and this typing.":
    "Сигнатуры вызова, перегрузки и типизация this.",
  "Cascade, layout, visual design, and CSS architecture.":
    "Каскад, вёрстка, визуальный дизайн и архитектура CSS.",
  "Cascade, selectors, and the box model.":
    "Каскад, селекторы и блочная модель.",
  "Class syntax, inheritance, static members, and private fields.":
    "Синтаксис классов, наследование, static-члены и private fields.",
  "child_process, cluster, workers, and real-time servers.":
    "child_process, cluster, workers и realtime-серверы.",
  "CI/CD, package managers, and task runners.":
    "CI/CD, менеджеры пакетов и task runners.",
  "npm lockfile, CI, semver, workspaces, supply chain — 16 GFE concepts.":
    "npm: lockfile, CI, semver, workspaces, supply chain — 16 концептов GFE.",
  "One Q&A accordion per GreatFrontEnd npm interview question.":
    "Один accordion Q&A на каждый вопрос GreatFrontEnd по npm.",
  "GFE filterable list, async UI, races, debounce — ~3 YOE machine coding.":
    "GFE: фильтруемый список, async UI, гонки, debounce — machine coding ~3 года.",
  "One Q&A per GFE machine coding section (~3 years).":
    "Один Q&A на секцию GFE machine coding (~3 года).",
  "CI/CD, packages, and bundlers.": "CI/CD, пакеты и бандлеры.",
  "Cache, sessions, data structures, and TTL.":
    "Кэш, сессии, структуры данных и TTL.",
  "Cloud fundamentals and provider comparison.":
    "Основы облаков и сравнение провайдеров.",
  "Coding tasks and live-coding challenges.":
    "Задачи по коду и live-coding challenges.",
  "Column-store OLAP, analytics, and fast aggregates.":
    "Column-store OLAP, аналитика и быстрые агрегаты.",
  "Compiler directives, ambient declarations, and declare.":
    "Директивы компилятора, ambient declarations и declare.",
  "Compose classes from partial building blocks.":
    "Композиция классов из частичных building blocks.",
  "Compute Engine, Cloud Storage, Cloud SQL, Cloud Run, Pub/Sub.":
    "Compute Engine, Cloud Storage, Cloud SQL, Cloud Run и Pub/Sub.",
  "Components, hooks, server rendering, and ecosystem.":
    "Компоненты, хуки, серверный рендеринг и экосистема.",
  "Composition, MVC, layers/DDD, data flow, and frontend structure.":
    "Композиция, MVC, слои/DDD, поток данных и структура фронтенда.",
  "Control-flow analysis and type guards.":
    "Анализ потока управления и type guards.",
  "createContext, lazy, memo, transitions, cache, act, and related APIs.":
    "createContext, lazy, memo, transitions, cache, act и связанные API.",
  "Custom elements, shadow DOM, slots, styling, and events.":
    "Custom elements, shadow DOM, slots, стилизация и события.",
  "Crawlability, metadata, and structured data.":
    "Crawlability, метаданные и structured data.",
  "Cursor and Agent plugin formats and marketplaces.":
    "Форматы плагинов Cursor и Agent и маркетплейсы.",
  "Cursor and Agent plugin formats, MCP, and marketplaces.":
    "Форматы плагинов Cursor и Agent, MCP и маркетплейсы.",
  "Data, caching, and infrastructure building blocks.":
    "Данные, кэширование и строительные блоки инфраструктуры.",
  "Declarations, arrows, this, higher-order functions, and bind.":
    "Объявления, стрелки, this, функции высшего порядка и bind.",
  "Declarations, scope, closures, arrows, this, HOF, recursion, and timers.":
    "Объявления, scope, замыкания, стрелки, this, HOF, рекурсия и таймеры.",
  "Delivery architecture, Nginx, brokers, and DX tools.":
    "Архитектура доставки, Nginx, брокеры и DX-инструменты.",
  "Deploy topology and where HTML is built.":
    "Топология деплоя и где собирается HTML.",
  "Docker and infrastructure.": "Docker и инфраструктура.",
  "Document skeleton, metadata, elements, and attributes.":
    "Каркас документа, метаданные, элементы и атрибуты.",
  "Document structure, semantics, rendering, forms, a11y, and SEO.":
    "Структура документа, семантика, рендеринг, формы, a11y и SEO.",
  "Document structure, semantics, rendering, forms, a11y, UX/UI, and SEO.":
    "Структура документа, семантика, рендеринг, формы, a11y, UX/UI и SEO.",
  "Document structure, semantics, rendering, forms, UX/UI, and SEO.":
    "Структура документа, семантика, рендеринг, формы, UX/UI и SEO.",
  "Documents, aggregation, and Mongoose.": "Документы, агрегации и Mongoose.",
  "Document, events, and extra browser APIs.":
    "Document, события и дополнительные браузерные API.",
  "Browser platform (processes, V8, security), DOM, events, and extra APIs.":
    "Платформа браузера (процессы, V8, безопасность), DOM, события и доп. API.",
  "DOM tree, querying, mutation, BOM, and script loading.":
    "DOM-дерево, поиск, мутации, BOM и загрузка скриптов.",
  "DOM, events, windows, files, network, animation, and Web Components.":
    "DOM, события, окна, файлы, сеть, анимация и Web Components.",
  "Browser platform architecture, DOM, events, windows, files, network, animation, and Web Components.":
    "Архитектура платформы браузера, DOM, события, окна, файлы, сеть, анимация и Web Components.",
  "EC2, S3, RDS, Lambda, SQS, and common AWS services.":
    "EC2, S3, RDS, Lambda, SQS и типовые сервисы AWS.",
  "ES modules, CommonJS, resolution, and module emit targets.":
    "ES modules, CommonJS, resolution и цели emit модулей.",
  "ES modules, import/export, and dynamic import().":
    "ES modules, import/export и dynamic import().",
  "ES modules, import/export, and module resolution.":
    "ES modules, import/export и module resolution.",
  "Enumerated and typed attribute values.":
    "Перечисляемые и типизированные значения атрибутов.",
  "Everyday types — catalog hub with sectioned topics.":
    "Повседневные типы — hub каталога с разделами по темам.",
  "Don't Repeat Yourself, Keep It Simple, You Aren't Gonna Need It.":
    "Не повторяйся, держи простоту, тебе это не понадобится (DRY, KISS, YAGNI).",
  "Editor and browser developer tools.":
    "Редактор и инструменты разработчика в браузере.",
  "Event loop, promises, and fetch.": "Event loop, промисы и fetch.",
  "Event loop, callbacks, promises, async/await, and browser APIs.":
    "Event loop, колбэки, промисы, async/await и браузерные API.",
  "Call stack, microtasks, macrotasks, and execution order.":
    "Стек вызовов, microtasks, macrotasks и порядок выполнения.",
  "Sync vs async, callbacks, AJAX, and side effects.":
    "Sync vs async, колбэки, AJAX и побочные эффекты.",
  "States, chaining, static methods, and error handling.":
    "Состояния, цепочки, статические методы и обработка ошибок.",
  "Sequential and parallel flows, iterators, and top-level await.":
    "Последовательные и параллельные потоки, итераторы и top-level await.",
  "Timers, fetch, AbortController, and requestIdleCallback.":
    "Таймеры, fetch, AbortController и requestIdleCallback.",
  "Express, auth, validation, Koa, NestJS, and runtime choice.":
    "Express, auth, валидация, Koa, NestJS и выбор рантайма.",
  "Express, NestJS, auth, and validation.":
    "Express, NestJS, auth и валидация.",
  "Exclude, Extract, function types, Awaited, and string literal operators.":
    "Exclude, Extract, типы функций, Awaited и операторы string literal.",
  "Exclude, Extract, ReturnType, Awaited, and string operators.":
    "Exclude, Extract, ReturnType, Awaited и строковые операторы.",
  "Expressions, operators, comparisons, optional chaining, and nullish coalescing.":
    "Выражения, операторы, сравнения, optional chaining и nullish coalescing.",
  "Control flow, loops, switch, try/catch, iterators, and generators.":
    "Control flow, циклы, switch, try/catch, итераторы и генераторы.",
  "Expressions, operators, comparisons, control flow, try/catch, and iterators.":
    "Выражения, операторы, сравнения, control flow, try/catch и итераторы.",
  "Fetching, caching, and Server Actions.":
    "Запросы, кэширование и Server Actions.",
  "Fetching, caching, revalidation, Server Actions, and Route Handlers.":
    "Запросы, кэш, revalidation, Server Actions и Route Handlers.",
  "fetch, XHR, progress, CORS, WebSocket, SSE, and long polling.":
    "fetch, XHR, progress, CORS, WebSocket, SSE и long polling.",
  "File-based routes, special files, navigation, metadata, and SEO.":
    "Файловые маршруты, special files, навигация, metadata и SEO.",
  "Flexbox, grid, and responsive design.":
    "Flexbox, grid и адаптивная вёрстка.",
  "Flexbox, grid, positioning, responsive design, and mobile viewport.":
    "Flexbox, grid, позиционирование, адаптив и mobile viewport.",
  "Form controls, validation, dialog, and accessible form patterns.":
    "Элементы форм, валидация, dialog и доступные паттерны форм.",
  "Foundations and distributed systems.": "Основы и распределённые системы.",
  "Foundations and distributed-systems basics.":
    "Основы и база распределённых систем.",
  "Foundations and SQL.": "Основы и SQL.",
  "Fields, visibility, inheritance, implements, and abstract classes.":
    "Поля, видимость, наследование, implements и абстрактные классы.",
  "Framework model, App Router, and design principles.":
    "Модель фреймворка, App Router и принципы проектирования.",
  "Framework model, rendering, and streaming.":
    "Модель фреймворка, рендеринг и streaming.",
  "Function types, generics, parameters, overloads, and this.":
    "Типы функций, дженерики, параметры, перегрузки и this.",
  "Rendering strategies, Server/Client boundaries, and streaming.":
    "Стратегии рендеринга, границы Server/Client и потоковая передача.",
  "requestAnimationFrame, easing, CSS vs JavaScript animation.":
    "requestAnimationFrame, easing, анимация CSS vs JavaScript.",
  "Framework model and design principles.":
    "Модель фреймворка и принципы проектирования.",
  "Generics, type operators, and utility types.":
    "Дженерики, type operators и utility types.",
  "Generics, keyof, typeof, conditional and mapped types.":
    "Дженерики, keyof, typeof, conditional и mapped types.",
  "OpenAPI codegen, Zod, typed HTTP clients, and contract drift.":
    "OpenAPI codegen, Zod, типизированные HTTP-клиенты и расхождение контракта.",
  "Devinterview.io Q&A plus GFE HTML items (#gfe-html-import).":
    "Devinterview.io Q&A плюс HTML-материалы GFE (#gfe-html-import).",
  "Devinterview.io Q&A plus GFE CSS items (#gfe-css-import).":
    "Devinterview.io Q&A плюс CSS-материалы GFE (#gfe-css-import).",
  "Devinterview.io Q&A plus GreatFrontEnd import (#gfe-javascript-import).":
    "Devinterview.io Q&A плюс импорт GreatFrontEnd (#gfe-javascript-import).",
  "Devinterview.io Q&A plus GreatFrontEnd import (#gfe-react-import).":
    "Devinterview.io Q&A плюс импорт GreatFrontEnd (#gfe-react-import).",
  "Devinterview.io Q&A plus GFE Redux import (#gfe-redux-import).":
    "Devinterview.io Q&A плюс импорт GFE Redux (#gfe-redux-import).",
  "Hooks reference; GFE hooks Q&A at #gfe-hooks-import.":
    "Справочник хуков; GFE Q&A по хукам — #gfe-hooks-import.",
  "GFE REST API Q&A for frontend freshers (on Interview page).":
    "GFE Q&A по REST API для frontend-джуниоров (на странице Interview).",
  "Angular Q&A, RU index; GFE basics at #gfe-angular-import.":
    "Angular Q&A, RU-индекс; основы GFE — #gfe-angular-import.",
  "All Test topics: kind, level, question count, merge hints.":
    "Все темы Test: тип, уровень, число вопросов, идеи слияния.",
  "How to merge Test listicles, career pages, and handbook anchors.":
    "Как объединять листинги Test, карьерные страницы и якоря handbook.",
  "GFE JavaScript listicles (Test sandbox).":
    "GFE: листинги JavaScript (Test).",
  "GFE React and ecosystem listicles (Test).":
    "GFE: React и экосистема (Test).",
  "TypeScript interview listicles (Test sandbox).":
    "Листинги TypeScript для собеседований (Test).",
  "Next.js interview listicles (Test sandbox).":
    "Листинги Next.js для собеседований (Test).",
  "Vue.js interview listicles (Test sandbox).":
    "Листинги Vue.js для собеседований (Test).",
  "Node.js interview listicles (Test sandbox).":
    "Листинги Node.js для собеседований (Test).",
  "GraphQL interview listicles (Test sandbox).":
    "Листинги GraphQL для собеседований (Test).",
  "REST and API interview listicles (Test sandbox).":
    "Листинги REST и API для собеседований (Test).",
  "Frontend testing interview listicles (Test sandbox).":
    "Листинги по фронтенд-тестированию (Test).",
  "Web performance interview listicles (Test sandbox).":
    "Листинги по веб-производительности (Test).",
  "Accessibility (a11y) interview listicles (Test sandbox).":
    "Листинги по доступности (a11y) (Test).",
  "npm, Git, and build-tool interview listicles (Test sandbox).":
    "Листинги: npm, Git и сборка (Test).",
  "Machine coding and LLD listicles (Test sandbox).":
    "Machine coding и LLD (Test).",
  "Mock interviews, scoring, and take-homes (Test sandbox).":
    "Моки, оценка и take-home (Test).",
  "Resume, portfolio, jobs by city, and role switches (Test).":
    "Резюме, портфолио, вакансии по городам (Test).",
  "Salary, compensation, and offer evaluation (Test sandbox).":
    "Зарплата, компенсация и офферы (Test).",
  "Roadmaps and how-to-learn guides (Test sandbox).":
    "Роадмапы и гайды по обучению (Test).",
  "Demand, FAANG vs startup, company picks (Test sandbox).":
    "Спрос, FAANG vs стартап, выбор компании (Test).",
  "Company-specific frontend interview guides (Test).":
    "Подготовка к собеседованиям в конкретных компаниях (Test).",
  "DSA, security, debugging, and code review (Test sandbox).":
    "Структуры данных, безопасность, отладка, code review (Test).",
  "Misc essays, roundups, and quizzes (Test sandbox).":
    "Эссе, подборки и викторины (Test).",
  "GFE Redux interview listicles (Test).": "GFE: Redux (Test).",
  "GFE Angular interview listicles (Test).": "GFE: Angular (Test).",
  "GFE HTML, CSS, and web-fundamentals listicles (Test).":
    "GFE: HTML, CSS и веб-основы (Test).",
  "GFE 30 essential React Hooks interview Q&A.":
    "GFE: 30 ключевых вопросов по React Hooks для собеседования.",
  "GFE TypeScript interview questions for freshers (2026).":
    "GFE: вопросы по TypeScript для джуниоров (2026).",
  "GFE machine coding interview questions for 3 years of experience.":
    "GFE: вопросы machine coding для 3 лет опыта.",
  "GFE REST API interview questions for frontend developers (30, 2026).":
    "GFE: 30 вопросов по REST API для фронтенд-разработчиков (2026).",
  "GFE frontend interview tips for freshers (2026).":
    "GFE: советы по фронтенд-собеседованию для джуниоров (2026).",
  "GFE npm lockfiles, npm ci, semver, and install scripts for frontend interviews.":
    "GFE: lockfile, npm ci, semver и install-скрипты для фронтенд-собеседований.",
  "GFE fresher frontend machine coding: small UI in 45–90 minutes.":
    "GFE: machine coding для джуниоров — небольшой UI за 45–90 минут.",
  "GFE 30 fresher frontend testing questions on RTL, mocks, async UI, and E2E.":
    "GFE: 30 вопросов по фронтенд-тестированию для джуниоров (RTL, моки, async UI, E2E).",
  "GFE 35 fresher Next.js questions on App Router, Server Components, and caching.":
    "GFE: 35 вопросов по Next.js для джуниоров (App Router, Server Components, кэш).",
  "GFE 20 Angular basics: components, modules, binding, DI, routing, and Signals.":
    "GFE: 20 базовых вопросов по Angular (компоненты, модули, binding, DI, роутинг, Signals).",
  "GFE 18 JS coding interview implementations from debounce through getElementsByClassName.":
    "GFE: 18 JS-задач на собеседование от debounce до getElementsByClassName.",
  "GFE 100+ React and React Native interview questions from ex-interviewers (2026).":
    "GFE: 100+ вопросов по React и React Native от бывших интервьюеров (2026).",
  "GFE 59 React UI coding drills with solution approaches (Accordion to Data Table).":
    "GFE: 59 UI-задач на React с подходами к решению (Accordion → Data Table).",
  "GFE 50+ HTML, CSS, and JavaScript interview Q&A from ex-interviewers.":
    "GFE: 50+ вопросов по HTML, CSS и JavaScript от бывших интервьюеров.",
  "GFE junior JS interview basics: scenarios, pitfalls, and 50 Q&A.":
    "GFE: базовый JS для джуниоров — сценарии, ошибки и 50 Q&A.",
  "GFE 20 advanced JS interview questions for experienced engineers.":
    "GFE: 20 продвинутых вопросов по JS для опытных инженеров.",
  "GFE Angular interview questions for 5–10 years of experience (2026).":
    "GFE: вопросы по Angular для 5–10 лет опыта (2026).",
  "GFE micro-frontends architecture, trade-offs, and patterns (2026).":
    "GFE: архитектура micro-frontends, компромиссы и паттерны (2026).",
  "GFE senior Vue.js developer interview questions and answers.":
    "GFE: вопросы для senior Vue.js разработчика с ответами.",
  "GFE senior GraphQL developer interview questions (advanced).":
    "GFE: продвинутые вопросы для senior GraphQL разработчика.",
  "GFE AI-assisted coding interviews for frontend developers.":
    "GFE: AI-assisted coding-интервью для фронтенд-разработчиков.",
  "GFE advanced JavaScript interview questions for 10+ years of experience.":
    "GFE: продвинутые вопросы по JavaScript для 10+ лет опыта.",
  "GFE TypeScript interview questions for senior frontend developers (2026).":
    "GFE: вопросы по TypeScript для senior фронтенд-разработчиков (2026).",
  "GFE data structures interview questions for senior frontend engineers.":
    "GFE: вопросы по структурам данных для senior фронтенд-инженеров.",
  "GFE machine coding for tech leads and principal engineers.":
    "GFE: machine coding для tech lead и principal инженеров.",
  "GFE senior CSS developer interview questions (advanced topics).":
    "GFE: продвинутые вопросы для senior CSS разработчика.",
  "GFE senior HTML developer interview questions (advanced topics).":
    "GFE: продвинутые вопросы для senior HTML разработчика.",
  "GFE 50 React.js interview questions for experienced developers.":
    "GFE: 50 вопросов по React.js для опытных разработчиков.",
  "GFE senior Node.js developer interview questions (advanced topics).":
    "GFE: продвинутые вопросы для senior Node.js разработчика.",
  "GFE senior REST API developer interview questions (advanced topics).":
    "GFE: продвинутые вопросы для senior REST API разработчика.",
  "GFE senior Redux developer interview questions (advanced topics).":
    "GFE: продвинутые вопросы для senior Redux разработчика.",
  "GFE senior testing developer interview questions (advanced topics).":
    "GFE: продвинутые вопросы для senior тестировщика.",
  "GFE senior web performance interview questions (advanced topics).":
    "GFE: продвинутые вопросы по web performance для senior.",
  "GFE senior accessibility developer interview questions with answers.":
    "GFE: вопросы по accessibility для senior с ответами.",
  "GFE 30 React Q&A from basic through advanced (2025).":
    "GFE: 30 вопросов по React от базовых до продвинутых (2025).",
  "GFE 50 essential React.js Q&A from ex-interviewers.":
    "GFE: 50 ключевых вопросов по React.js от бывших интервьюеров.",
  "GFE Top 30 React Q&A for interview prep (2025).":
    "GFE Top 30 вопросов по React для подготовки к собеседованию (2025).",
  "GFE-style JavaScript Q&A (1–50) for interview prep.":
    "GFE-стиль: 50 вопросов по JavaScript для подготовки к собеседованию.",
  "Git, tooling, and adjacent topics.": "Git, тулинг и смежные темы.",
  "Go, Scala, and other backend language interview prep.":
    "Подготовка к собеседованиям по Go, Scala и другим backend-языкам.",
  "Handbook, language reference, and typing JavaScript.":
    "Справочник, language reference и типизация JavaScript.",
  "HTML attribute reference.": "Справочник HTML-атрибутов.",
  "HTML element reference (MDN-style catalog).":
    "Справочник HTML-элементов (каталог в стиле MDN).",
  "IaaS/PaaS/SaaS, regions, shared responsibility, and provider comparison.":
    "IaaS/PaaS/SaaS, регионы, shared responsibility и сравнение провайдеров.",
  "iframes, popups, postMessage, and clickjacking defenses.":
    "iframe, popup, postMessage и защита от clickjacking.",
  "Inline objects, interfaces, type aliases, and type vs interface.":
    "Inline-объекты, interfaces, type aliases и type vs interface.",
  "Inline objects, interfaces, type aliases, type vs interface.":
    "Inline-объекты, interfaces, type aliases и type vs interface.",
  "Integration, system, E2E, visual, performance, and security testing.":
    "Интеграционное, системное, E2E, визуальное, performance и security-тестирование.",
  "Integration, system, E2E, visual, performance, security.":
    "Интеграционное, системное, E2E, визуальное, performance и security.",
  "Interface, namespace, class, and enum merging.":
    "Слияние interface, namespace, class и enum.",
  "GoF creational, structural, and behavioral patterns.":
    "Порождающие, структурные и поведенческие паттерны GoF.",
  "Handlers, bubbling, capturing, delegation, and custom events.":
    "Обработчики, bubbling, capturing, делегирование и custom events.",
  "Hash tables for average O(1) lookup, binary heaps for dynamic min/max, and how the DOM maps to trees and node lists.":
    "Хеш-таблицы для среднего O(1) lookup, бинарные кучи для динамического min/max и как DOM сопоставляется с деревьями и node lists.",
  "Hooks reference and escape hatches.": "Справочник хуков и escape hatches.",
  "How `/` works and the most-used built-ins.":
    "Как работает `/` и самые частые встроенные команды.",
  "How `/` works, custom commands, and the most-used built-ins.":
    "Как работает `/`, кастомные команды и самые частые встроенные.",
  "How CSS is added, cascade, selectors, and the box model.":
    "Как подключают CSS, каскад, селекторы и блочная модель.",
  "Components, Composition API, reactivity, SSR, and ecosystem.":
    "Компоненты, Composition API, реактивность, SSR и экосистема.",
  "Composition API, composables, and script setup.":
    "Composition API, composables и script setup.",
  "File-based routing, data fetching, Nitro, and the Nuxt platform.":
    "Файловая маршрутизация, загрузка данных, Nitro и платформа Nuxt.",
  "File-based routes, layouts, middleware, and SEO.":
    "Файловые маршруты, layouts, middleware и SEO.",
  "HTML, CSS, JavaScript, React, Next.js, TypeScript, Web APIs, and Vue & Nuxt.":
    "HTML, CSS, JavaScript, React, Next.js, TypeScript, Web API и Vue & Nuxt.",
  "Vue library and Nuxt meta-framework: components, Composition API, SSR, routing, and Nitro.":
    "Библиотека Vue и meta-framework Nuxt: компоненты, Composition API, SSR, маршрутизация и Nitro.",
  "HTML, CSS, JavaScript, React, TypeScript, and browser APIs.":
    "HTML, CSS, JavaScript, React, TypeScript и браузерные API.",
  "Library model, templates, reactivity, and Composition API.":
    "Модель библиотеки, шаблоны, реактивность и Composition API.",
  "Library model, templates, reactivity, and state.":
    "Модель библиотеки, шаблоны, реактивность и state.",
  "Nitro, modules, config, deployment, and debugging.":
    "Nitro, модули, config, деплой и отладка.",
  "Router, Pinia, Vite, performance, and migration.":
    "Router, Pinia, Vite, производительность и миграция.",
  "Server rendering, hydration, and Vue 3.5+ features.":
    "Серверный рендеринг, гидратация и возможности Vue 3.5+.",
  "Angular platform hub (hidden nav).": "Angular — hub (скрыт в навигации).",
  "Components, templates, lifecycle, and data binding.":
    "Компоненты, шаблоны, lifecycle и data binding.",
  "Change detection, NgZone, DI, AOT, and Ivy.":
    "Change detection, NgZone, DI, AOT и Ivy.",
  "Router, forms, HttpClient, RxJS, and patterns.":
    "Router, формы, HttpClient, RxJS и паттерны.",
  "Angular interview Q&A and RU cheatsheet index.":
    "Angular — интервью и RU-индекс вопросов.",
  "Platform, components, templates, and modules.":
    "Платформа, компоненты, шаблоны и модули.",
  "Change detection, Zone.js, DI, and compilation.":
    "Change detection, Zone.js, DI и компиляция.",
  "Router, forms, HttpClient, and architecture patterns.":
    "Router, формы, HttpClient и архитектурные паттерны.",
  "Angular interview Q&A (sidebar-hidden subject).":
    "Angular — интервью (скрытый блок сайдбара).",
  "useFetch, useAsyncData, and server routes.":
    "useFetch, useAsyncData и server routes.",
  "useFetch, useAsyncData, caching, and server routes.":
    "useFetch, useAsyncData, кэширование и server routes.",
  "HTTP, HTTPS, TLS, caching, CORS, and URL anatomy.":
    "HTTP, HTTPS, TLS, кэширование, CORS и устройство URL.",
  "HTTP, REST, auth, real-time, and browser security.":
    "HTTP, REST, auth, realtime и безопасность в браузере.",
  "HTTP, REST, auth, and real-time.": "HTTP, REST, auth и realtime.",
  "Images, containers, Compose, and container lifecycle.":
    "Образы, контейнеры, Compose и жизненный цикл контейнера.",
  "Images, picture, audio, video, canvas, and SVG.":
    "Images, picture, audio, video, canvas и SVG.",
  "Indexed collections and array methods — map, filter, reduce.":
    "Индексированные коллекции и методы массивов — map, filter, reduce.",
  "Index-based arrays, LIFO stacks, FIFO queues, unique sets, and key–value maps — with Big-O costs and JavaScript gotchas like O(n) array.shift().":
    "Массивы с индексным доступом, LIFO-стеки, FIFO-очереди, множества и key–value map — со сложностью Big-O и JS-подводными камнями вроде O(n) array.shift().",
  "Interfaces, object types, classes, and OOP.":
    "Интерфейсы, object types, классы и ООП.",
  "Internet stack and HTTP.": "Интернет-стек и HTTP.",
  "Internet, DNS, and how the web stack fits together.":
    "Интернет, DNS и как складывается веб-стек.",
  "HTML interview questions, answers not filled in.":
    "Вопросы по HTML, ответы не заполнены.",
  "CSS interview questions, answers not filled in.":
    "Вопросы по CSS, ответы не заполнены.",
  "JavaScript interview questions, answers not filled in.":
    "Вопросы по JavaScript, ответы не заполнены.",
  "Next.js interview questions, answers not filled in.":
    "Вопросы по Next.js, ответы не заполнены.",
  "React interview questions, answers not filled in.":
    "Вопросы по React, ответы не заполнены.",
  "TypeScript interview questions, answers not filled in.":
    "Вопросы по TypeScript, ответы не заполнены.",
  "Interview Q&A and coding tasks.": "Вопросы/ответы и задачи по коду.",
  "GFE fresher advice: projects, basics, debugging, and interview-day habits.":
    "GFE для новичков: проекты, основы, отладка и привычки на собеседовании.",
  "Link index to GFE sources; full Q&A lives under Frontend interview topics.":
    "Индекс GFE; полные вопросы и ответы — в темах Frontend → Interviews.",
  Tips: "Советы",
  References: "Ссылки",
  "External interview prep and learning sites (bookmarks).":
    "Внешние сайты для подготовки к собеседованиям и обучения (закладки).",
  "Git interview questions, answers not filled in.":
    "Вопросы по Git, ответы не заполнены.",
  "Testing interview questions, answers not filled in.":
    "Вопросы по тестированию, ответы не заполнены.",
  "WebSocket interview questions, answers not filled in.":
    "Вопросы по WebSockets, ответы не заполнены.",
  "PWA interview questions, answers not filled in.":
    "Вопросы по PWA, ответы не заполнены.",
  "Redux interview questions, answers not filled in.":
    "Вопросы по Redux, ответы не заполнены.",
  "Express.js interview questions, answers not filled in.":
    "Вопросы по Express.js, ответы не заполнены.",
  "OOP interview questions, answers not filled in.":
    "Вопросы по OOP, ответы не заполнены.",
  "Web security interview questions, answers not filled in.":
    "Вопросы по веб-безопасности, ответы не заполнены.",
  "Interview Q&A for build and CI.": "Вопросы/ответы по build и CI.",
  "SQL interview questions, answers not filled in.":
    "Вопросы по SQL, ответы не заполнены.",
  "Interview Q&A for HTTP and Web APIs.": "Вопросы/ответы по HTTP и Web API.",
  "Node.js interview questions, answers not filled in.":
    "Вопросы по Node.js, ответы не заполнены.",
  "Go interview questions, answers not filled in.":
    "Вопросы по Go, ответы не заполнены.",
  "DevOps interview questions, answers not filled in.":
    "Вопросы по DevOps, ответы не заполнены.",
  "API Design interview questions, answers not filled in.":
    "Вопросы по API Design, ответы не заполнены.",
  "Databases interview questions, answers not filled in.":
    "Вопросы по Databases, ответы не заполнены.",
  "Microservices interview questions, answers not filled in.":
    "Вопросы по Microservices, ответы не заполнены.",
  "Availability & Reliability interview questions, answers not filled in.":
    "Вопросы по Availability & Reliability, ответы не заполнены.",
  "Docker interview questions, answers not filled in.":
    "Вопросы по Docker, ответы не заполнены.",
  "NoSQL interview questions, answers not filled in.":
    "Вопросы по NoSQL, ответы не заполнены.",
  "Caching interview questions, answers not filled in.":
    "Вопросы по Caching, ответы не заполнены.",
  "Domain-Driven Design interview questions, answers not filled in.":
    "Вопросы по Domain-Driven Design, ответы не заполнены.",
  "Reactive Systems interview questions, answers not filled in.":
    "Вопросы по Reactive Systems, ответы не заполнены.",
  "CAP Theorem interview questions, answers not filled in.":
    "Вопросы по CAP Theorem, ответы не заполнены.",
  "Kubernetes interview questions, answers not filled in.":
    "Вопросы по Kubernetes, ответы не заполнены.",
  "SOA interview questions, answers not filled in.":
    "Вопросы по SOA, ответы не заполнены.",
  "Concurrency interview questions, answers not filled in.":
    "Вопросы по Concurrency, ответы не заполнены.",
  "Layering & Middleware interview questions, answers not filled in.":
    "Вопросы по Layering & Middleware, ответы не заполнены.",
  "Software Architecture interview questions, answers not filled in.":
    "Вопросы по Software Architecture, ответы не заполнены.",
  "Cryptography interview questions, answers not filled in.":
    "Вопросы по Cryptography, ответы не заполнены.",
  "Load Balancing interview questions, answers not filled in.":
    "Вопросы по Load Balancing, ответы не заполнены.",
  "XML interview questions, answers not filled in.":
    "Вопросы по XML, ответы не заполнены.",
  "Arrays interview questions, answers not filled in.":
    "Вопросы по Arrays, ответы не заполнены.",
  "Divide & Conquer interview questions, answers not filled in.":
    "Вопросы по Divide & Conquer, ответы не заполнены.",
  "Hash Tables interview questions, answers not filled in.":
    "Вопросы по Hash Tables, ответы не заполнены.",
  "Sorting Algorithms interview questions, answers not filled in.":
    "Вопросы по Sorting Algorithms, ответы не заполнены.",
  "Stacks interview questions, answers not filled in.":
    "Вопросы по Stacks, ответы не заполнены.",
  "Heaps and Maps interview questions, answers not filled in.":
    "Вопросы по Heaps and Maps, ответы не заполнены.",
  "Dynamic Programming interview questions, answers not filled in.":
    "Вопросы по Dynamic Programming, ответы не заполнены.",
  "Big-O Notation interview questions, answers not filled in.":
    "Вопросы по Big-O Notation, ответы не заполнены.",
  "Binary Tree interview questions, answers not filled in.":
    "Вопросы по Binary Tree, ответы не заполнены.",
  "Fibonacci Sequence interview questions, answers not filled in.":
    "Вопросы по Fibonacci Sequence, ответы не заполнены.",
  "Linked Lists interview questions, answers not filled in.":
    "Вопросы по Linked Lists, ответы не заполнены.",
  "Strings interview questions, answers not filled in.":
    "Вопросы по Strings, ответы не заполнены.",
  "Tree Data Structure interview questions, answers not filled in.":
    "Вопросы по Tree Data Structure, ответы не заполнены.",
  "Queues interview questions, answers not filled in.":
    "Вопросы по Queues, ответы не заполнены.",
  "Bit Manipulation interview questions, answers not filled in.":
    "Вопросы по Bit Manipulation, ответы не заполнены.",
  "Graph Theory interview questions, answers not filled in.":
    "Вопросы по Graph Theory, ответы не заполнены.",
  "Recursion interview questions, answers not filled in.":
    "Вопросы по Recursion, ответы не заполнены.",
  "Trie interview questions, answers not filled in.":
    "Вопросы по Trie, ответы не заполнены.",
  "Searching Algorithms interview questions, answers not filled in.":
    "Вопросы по Searching Algorithms, ответы не заполнены.",
  "Greedy Algorithms interview questions, answers not filled in.":
    "Вопросы по Greedy Algorithms, ответы не заполнены.",
  "Blockchain interview questions, answers not filled in.":
    "Вопросы по Blockchain, ответы не заполнены.",
  "Backtracking interview questions, answers not filled in.":
    "Вопросы по Backtracking, ответы не заполнены.",
  "Genetic Algorithms interview questions, answers not filled in.":
    "Вопросы по Genetic Algorithms, ответы не заполнены.",
  "Hadoop interview questions, answers not filled in.":
    "Вопросы по Hadoop, ответы не заполнены.",
  "Linear Algebra interview questions, answers not filled in.":
    "Вопросы по Linear Algebra, ответы не заполнены.",
  "Probability interview questions, answers not filled in.":
    "Вопросы по Probability, ответы не заполнены.",
  "Scala interview questions, answers not filled in.":
    "Вопросы по Scala, ответы не заполнены.",
  "Redis interview questions, answers not filled in.":
    "Вопросы по Redis, ответы не заполнены.",
  "React Native interview questions, answers not filled in.":
    "Вопросы по React Native, ответы не заполнены.",
  "Reactive Programming interview questions, answers not filled in.":
    "Вопросы по Reactive Programming, ответы не заполнены.",
  "Apache Spark interview questions, answers not filled in.":
    "Вопросы по Apache Spark, ответы не заполнены.",
  "React APIs plus react-dom Client, Server, and Static entry points.":
    "API React и точки входа react-dom Client, Server и Static.",
  "Data Structures interview questions, answers not filled in.":
    "Вопросы по Data Structures, ответы не заполнены.",
  "Q&A for algorithms.": "Вопросы/ответы по алгоритмам.",
  "Q&A for data structures.": "Вопросы/ответы по структурам данных.",
  "Q&A for Go, Scala, and related languages.":
    "Вопросы и ответы по Go, Scala и смежным языкам.",
  "Interview Q&A for system design.": "Вопросы/ответы по system design.",
  "Intl, RegExp, Signals (TC39), and eval.":
    "Intl, RegExp, Signals (TC39) и eval.",
  "JSX in .tsx, intrinsic elements, and component typing.":
    "JSX в .tsx, intrinsic elements и типизация компонентов.",
  "Jakob, Fitts, Hick, Miller, Postel, and related cognitive effects.":
    "Jakob, Fitts, Hick, Miller, Postel и связанные когнитивные эффекты.",
  "Jest, Vitest, RTL, MSW, and code coverage.":
    "Jest, Vitest, RTL, MSW и code coverage.",
  "Jest, Vitest, RTL, MSW, and coverage.": "Jest, Vitest, RTL, MSW и coverage.",
  "ES modules, import/export, dynamic import(), Intl, RegExp, Signals, and eval.":
    "ES modules, import/export, dynamic import(), Intl, RegExp, Signals и eval.",
  "Intl, RegExp, Signals, and other extras.":
    "Intl, RegExp, Signals и другие дополнения.",
  "Kafka, RabbitMQ, NATS, and async messaging patterns.":
    "Kafka, RabbitMQ, NATS и паттерны асинхронного messaging.",
  "Kafka, RabbitMQ, and NATS.": "Kafka, RabbitMQ и NATS.",
  "Landmarks, headings, lists, and phrasing elements that carry meaning.":
    "Landmarks, заголовки, списки и phrasing-элементы со смыслом.",
  "Legacy namespace organization and ambient declarations.":
    "Legacy namespace organization и ambient declarations.",
  "Loading metrics, resource hints, and browser performance APIs.":
    "Метрики загрузки, resource hints и browser performance API.",
  "Language reference and advanced topics.":
    "Справочник по языку и продвинутые темы.",
  "Language reference.": "Справочник по языку.",
  "Language, browser APIs, and extra runtime topics.":
    "Язык, браузерные API и дополнительные темы рантайма.",
  "Language, operators, arrays, functions, destructuring, closures, and classes.":
    "Язык, операторы, массивы, функции, деструктуризация, замыкания и классы.",
  "Variables (incl. destructuring), types, data structures, operators, and loops.":
    "Переменные (в т.ч. деструктуризация), типы, структуры данных, операторы и циклы.",
  "Variables (incl. destructuring), types, data structures, and operators.":
    "Переменные (в т.ч. деструктуризация), типы, структуры данных и операторы.",
  "Language, arrays, functions, objects, and classes.":
    "Язык, массивы, функции, объекты и классы.",
  "Language, variables, types, data structures, operators, loops, arrays, functions, objects, and classes.":
    "Язык, переменные, типы, структуры данных, операторы, циклы, массивы, функции, объекты и классы.",
  "Language, arrays, functions, closures, and classes.":
    "Язык, массивы, функции, замыкания и классы.",
  "let/const/var, scope, hoisting, globalThis, and destructuring patterns.":
    "let/const/var, область, hoisting, globalThis и деструктуризация.",
  "let/const/var, lexical scope, hoisting, and globalThis.":
    "let/const/var, лексическая область, hoisting и globalThis.",
  "Rest parameters, spread syntax, and destructuring patterns.":
    "Rest-параметры, spread и паттерны деструктуризации.",
  "Lexical environments, factories, and closure pitfalls.":
    "Лексическое окружение, фабрики и подводные камни замыканий.",
  "Primitives, coercion, and the stack/heap memory model.":
    "Примитивы, приведение типов и модель памяти (стек и куча).",
  "Primitives, arrays, null, and undefined.":
    "Примитивы, массивы, null и undefined.",
  "Prototypes, `this`, descriptors, Proxy/Reflect, and GC.":
    "Прототипы, `this`, descriptors, Proxy/Reflect и GC.",
  "Objects, Map/Set, trees/graphs, Date, and JSON.":
    "Объекты, Map/Set, деревья/графы, Date и JSON.",
  "Library model, rendering, JSX, and state.":
    "Модель библиотеки, рендеринг, JSX и state.",
  "Library model, rendering, JSX, state, and hooks.":
    "Модель библиотеки, рендеринг, JSX, state и хуки.",
  "Methodologies, tooling, and rendering performance.":
    "Методологии, тулинг и производительность рендеринга.",
  "Match access patterns to the right structure, then study linear collections, trees and graphs, and hash-based lookup with heaps.":
    "Сопоставьте паттерны доступа со структурой, затем изучите линейные коллекции, деревья и графы, а также hash lookup и кучи.",
  "MongoDB, Redis, Elasticsearch, and store selection.":
    "MongoDB, Redis, Elasticsearch и выбор хранилища.",
  "MongoDB, Redis, and ClickHouse.": "MongoDB, Redis и ClickHouse.",
  "NoSQL types, selection matrix, and Elasticsearch.":
    "Типы NoSQL, матрица выбора и Elasticsearch.",
  "Numeric and string enums, const enums, and as const alternatives.":
    "Числовые и строковые enum, const enum и альтернативы as const.",
  "Nine patterns for assigning responsibilities to objects.":
    "Девять паттернов назначения ответственности объектам.",
  "Node.js and databases.": "Node.js и базы данных.",
  "Node.js, message brokers, and cloud services.":
    "Node.js, брокеры сообщений и облачные сервисы.",
  "Node.js and backend language interview prep.":
    "Node.js и подготовка к собеседованиям по backend-языкам.",
  "Message brokers and cloud services.":
    "Брокеры сообщений и облачные сервисы.",
  "Node.js, databases, message brokers, and cloud services.":
    "Node.js, базы данных, брокеры сообщений и облачные сервисы.",
  "NoSQL, ORM, and query builders.": "NoSQL, ORM и query builders.",
  "Object shapes, interfaces, optional properties, and tuples.":
    "Формы объектов, interfaces, optional properties и tuples.",
  "Object shapes, optional and readonly properties, index signatures, tuples.":
    "Формы объектов, optional и readonly properties, index signatures и tuples.",
  "Objects, classes, generics, and utilities.":
    "Объекты, классы, дженерики и утилиты.",
  "Partial, Pick, Omit, Record, ReturnType, and built-in utilities.":
    "Partial, Pick, Omit, Record, ReturnType и встроенные utility types.",
  "Partial, Required, Readonly, Record, Pick, and Omit.":
    "Partial, Required, Readonly, Record, Pick и Omit.",
  "Per-element attribute lists.": "Списки атрибутов по элементам.",
  "Objects, commits, and everyday workflow.":
    "Объекты, коммиты и повседневный workflow.",
  "OOP pillars and the five SOLID principles for modules and APIs.":
    "Столпы ООП и пять принципов SOLID для модулей и API.",
  "OOP, SOLID, DRY, KISS, YAGNI, and GRASP.":
    "ООП, SOLID, DRY, KISS, YAGNI и GRASP.",
  "Images, fonts, scripts, bundling, and Core Web Vitals.":
    "Изображения, шрифты, скрипты, бандлинг и Core Web Vitals.",
  "Proxy, config, Vercel, migration, and debugging.":
    "Прокси, конфиг, Vercel, миграция и отладка.",
  "Package managers, CommonJS/ESM, and built-in modules.":
    "Менеджеры пакетов, CommonJS/ESM и встроенные модули.",
  "Packages, CommonJS/ESM, and built-in APIs.":
    "Пакеты, CommonJS/ESM и встроенные API.",
  "POUR, names, landmarks, forms, and images.":
    "POUR, имена, landmarks, формы и изображения.",
  "Primitives, coercion, stack/heap, collections, JSON, bindings, scope, and closures.":
    "Примитивы, coercion, stack/heap, коллекции, JSON, bindings, scope и closures.",
  "Prisma, Sequelize, Knex, Drizzle, and query builders.":
    "Prisma, Sequelize, Knex, Drizzle и query builders.",
  "Process management.": "Управление процессами.",
  "Processes, SSH, Unix jobs, and OpenTelemetry.":
    "Процессы, SSH, Unix jobs и OpenTelemetry.",
  "Product judgment versus architecture.":
    "Продуктовое суждение versus архитектура.",
  "Production patterns.": "Продакшен-паттерны.",
  "Project, user, team rules, AGENTS.md, and apply modes.":
    "Project, user, team rules, AGENTS.md и режимы применения.",
  "Project, user, team rules, and AGENTS.md.":
    "Project, user, team rules и AGENTS.md.",
  "Protocols, real-time, and types of web apps.":
    "Протоколы, realtime и типы веб-приложений.",
  "Prototypes, classes, and object patterns.":
    "Прототипы, классы и объектные паттерны.",
  "Python language notes.": "Заметки по языку Python.",
  "Q&A and coding tasks.": "Вопросы/ответы и задачи по коду.",
  "Q&A and oral questions.": "Вопросы/ответы и устные вопросы.",
  "Quick-reference cards and interview memorization checklist.":
    "Карточки quick-reference и чеклист для запоминания на собеседовании.",
  "Q&A and leftover tooling notes that still sit outside subject interviews.":
    "Вопросы/ответы и оставшиеся заметки по тулингу вне subject-интервью.",
  "Q&A and shell appendix.": "Вопросы/ответы и shell-приложение.",
  "Shell fundamentals: scripts, tests, loops, and pipelines.":
    "Основы shell: скрипты, проверки, циклы и конвейеры.",
  "Q&A and type challenges.": "Вопросы/ответы и type challenges.",
  "Q&A for build and CI.": "Вопросы/ответы по build и CI.",
  "Q&A for Cursor skills, rules, plugins, and slash commands.":
    "Вопросы/ответы по Cursor skills, rules, плагинам и slash-командам.",
  "Q&A for Cursor skills, rules, plugins, and slash.":
    "Вопросы/ответы по Cursor skills, rules, плагинам и slash.",
  "Q&A for databases.": "Вопросы/ответы по базам данных.",
  "Q&A for HTTP and Web APIs.": "Вопросы/ответы по HTTP и Web API.",
  "Q&A for Node.js.": "Вопросы/ответы по Node.js.",
  "Q&A for system design.": "Вопросы/ответы по system design.",
  "React 19 APIs, SSR, and React Server Components.":
    "API React 19, SSR и React Server Components.",
  "Server Components, Server Functions, and RSC directives ('use client', 'use server').":
    "Server Components, Server Functions и директивы RSC ('use client', 'use server').",
  "React UI patterns, rendering-minded algorithms, and applying them in real features.":
    "Паттерны React, алгоритмы с учётом рендеринга и применение на практике.",
  "Composition, state placement, compound components, and memoization habits.":
    "Композиция, размещение state, compound components и привычки memoization.",
  "Debouncing, optimistic updates, pagination, and list rendering in practice.":
    "Debounce, optimistic updates, пагинация и рендер списков на практике.",
  "Profiling, waterfalls, code splitting, and render discipline.":
    "Профилирование, waterfalls, code splitting и дисциплина рендера.",
  "Transitions, deferred values, and Suspense navigation UX.":
    "Transitions, deferred values и Suspense при навигации.",
  "Error boundaries, retries, reset keys, and route-level recovery.":
    "Error boundaries, retry, reset keys и восстановление на уровне роутов.",
  "Redux Toolkit, global client state, and RTK Query.":
    "Redux Toolkit, глобальный client state и RTK Query.",
  "Routing, libraries, performance, and legacy.":
    "Маршрутизация, библиотеки, производительность и legacy.",
  "React 19, SSR, and React Server Components.":
    "React 19, SSR и React Server Components.",
  "Recovery, team practices, hooks, and advanced Git.":
    "Восстановление, командные практики, hooks и продвинутый Git.",
  "Rendering pipeline and performance.":
    "Пайплайн рендеринга и производительность.",
  "Browser platform, rendering pipeline, and performance.":
    "Платформа браузера, пайплайн рендеринга и производительность.",
  "Replication, sharding, caching, and OLTP scaling.":
    "Репликация, шардинг, кэширование и масштабирование OLTP.",
  "REST, RPC, auth, and storage.": "REST, RPC, auth и хранилище.",
  "REST, XML, SOAP, RPC, tRPC, and how they differ.":
    "REST, XML, SOAP, RPC, tRPC и чем они отличаются.",
  "Routing and platform.": "Маршрутизация и платформа.",
  "Runtime and language basics — variables, types, operators, loops, and arrays in sibling Core topics.":
    "Рантайм и основы языка — переменные, типы, операторы, циклы и массивы в соседних темах Core.",
  "Runtime and modules — types, bindings, and control flow live in sibling Core topics.":
    "Рантайм и модули — типы, bindings и control flow в соседних темах Core.",
  "ES modules — scope, import/export, and dynamic import().":
    "ES modules — область модуля, import/export и dynamic import().",
  "Module scope, ESM vs CommonJS, and module scripts in the browser.":
    "Область модуля, ESM vs CommonJS и module-скрипты в браузере.",
  "Named and default export/import, re-exports, and live bindings.":
    "Named/default export и import, re-export и live bindings.",
  "Lazy loading with import(), code splitting, and conditional paths.":
    "Ленивая загрузка через import(), code splitting и условные пути.",
  "Runtime, HTTP servers, and process management.":
    "Рантайм, HTTP-серверы и управление процессами.",
  "Script loading, resource hints, Core Web Vitals, and FOUC.":
    "Загрузка скриптов, resource hints, Core Web Vitals и FOUC.",
  "Security model and common web attacks.":
    "Модель безопасности и типичные веб-атаки.",
  "Security model, browser security, and common web attacks.":
    "Модель безопасности, браузерная безопасность и типичные веб-атаки.",
  "POUR, WCAG, landmarks, forms, ARIA, and assistive tech.":
    "POUR, WCAG, ориентиры, формы, ARIA и вспомогательные технологии.",
  "Web accessibility and security fundamentals.":
    "Основы веб-доступности и безопасности.",
  "Skills, rules, plugins, slash commands, and questions.":
    "Skills, rules, плагины, slash-команды и вопросы.",
  "Skills, rules, plugins, slash commands, and Cursor Q&A.":
    "Skills, rules, plugins, slash-команды и Q&A по Cursor.",
  "Soft-skill and HR interview questions with answer frameworks, traps, and sample answers.":
    "Soft-skill и HR-вопросы на собеседовании с фреймворками ответов, ловушками и примерами.",
  "Behavior questions": "Поведенческие вопросы",
  Test: "Тест",
  "Sandbox for drafts and experiments.":
    "Песочница для черновиков и экспериментов.",
  "Sorting, search, and graph algorithms.":
    "Сортировка, поиск и алгоритмы на графах.",
  "Sorting, search, graph traversal, and classic algorithm choices.":
    "Сортировка, поиск, обход графа и классический выбор алгоритмов.",
  "SQL language, schema, joins, objects, indexes, and PostgreSQL.":
    "Язык SQL, схема, joins, объекты, индексы и PostgreSQL.",
  "SQL, NoSQL, ORMs, and production data patterns.":
    "SQL, NoSQL, ORM и продакшен-паттерны работы с данными.",
  "Stage 2 and stage 3 decorators for classes and members.":
    "Stage 2 и stage 3 decorators для классов и членов.",
  "Static type-checking, tsc, emit behavior, explicit types, and downleveling.":
    "Статическая проверка типов, tsc, emit, явные типы и downleveling.",
  "tsconfig, declaration files, and intro for JavaScript programmers.":
    "tsconfig, declaration files и введение для JavaScript-разработчиков.",
  "Static type-checking, compiler, tsconfig, and intro for JS programmers.":
    "Статическая проверка типов, компилятор, tsconfig и введение для JS-разработчиков.",
  "Static typing, tsconfig, and everyday types.":
    "Статическая типизация, tsconfig и повседневные типы.",
  "Structural subtyping, assignability, and variance.":
    "Структурная подтипизация, assignability и variance.",
  "Subjects, pub/sub, request-reply, and JetStream.":
    "Subjects, pub/sub, request-reply и JetStream.",
  "Symbol.iterator, iterables, generators, and for..of.":
    "Symbol.iterator, iterables, generators и for..of.",
  "Static typing, tsconfig, narrowing, and functions.":
    "Статическая типизация, tsconfig, сужение типов и функции.",
  "Storage, CORS, observers, History, URL, files, and UI timing.":
    "Storage, CORS, observers, History, URL, файлы и UI timing.",
  "Storage, CORS, observers, History, URL helpers, and UI timing.":
    "Storage, CORS, observers, History, URL-хелперы и UI timing.",
  "Structure, semantics, forms, and media.":
    "Структура, семантика, формы и медиа.",
  "Styles, app structure, design patterns, data, and infra.":
    "Стили, структура приложения, паттерны, данные и инфра.",
  "TDD, BDD, doubles, and making tests easy.":
    "TDD, BDD, doubles и упрощение тестов.",
  "TDD, BDD, test doubles, and making tests easy.":
    "TDD, BDD, test doubles и упрощение тестов.",
  "TanStack Query, Router, Table, Virtual, Form, and ecosystem tools.":
    "TanStack Query, Router, Table, Virtual, Form и инструменты экосистемы.",
  "Topics, partitions, consumer groups, and event streaming.":
    "Topics, partitions, consumer groups и event streaming.",
  "Transforms, transitions, animations, and visual effects.":
    "Transforms, transitions, анимации и визуальные эффекты.",
  "Transpilers, bundling concepts, bundlers, and code quality.":
    "Транспилеры, идеи бандлинга, бандлеры и качество кода.",
  "Two pointers, sliding window, and greedy vs DP decisions.":
    "Two pointers, sliding window и решения greedy vs DP.",
  "Two pointers, sliding window, and greedy vs DP.":
    "Two pointers, sliding window и greedy vs DP.",
  "Types, compiler, generics, and typing JavaScript.":
    "Типы, компилятор, дженерики и типизация JavaScript.",
  "Type annotations, assertions, and everyday function types.":
    "Аннотации типов, assertions и повседневные типы функций.",
  "Type catalog hub — index of all everyday type forms.":
    "Hub каталога типов — индекс всех повседневных форм типов.",
  "Unique primitive keys and unique symbol types.":
    "Уникальные примитивные ключи и unique symbol types.",
  "Union types, literal types, and enums.":
    "Union types, literal types и enums.",
  "Unions, literal types, and enums.": "Unions, literal types и enums.",
  "VMs, Blob Storage, Azure SQL, Functions, and Service Bus.":
    "VMs, Blob Storage, Azure SQL, Functions и Service Bus.",
  "Visual hierarchy, consistency, spacing, feedback, and accessibility.":
    "Визуальная иерархия, консистентность, отступы, feedback и доступность.",
  "Typography, color, decoration, form styling, and print.":
    "Типографика, цвет, декорация, стили форм и печать.",
  "URL to pixels: parse, CSSOM, render tree, layout, paint, composite.":
    "От URL к пикселям: parse, CSSOM, render tree, layout, paint, composite.",
  "V8, event loop, streams, buffers, and runtime fundamentals.":
    "V8, event loop, стримы, буферы и основы рантайма.",
  "V8, streams, and runtime fundamentals.": "V8, стримы и основы рантайма.",
  "Version control, history, and collaboration.":
    "Контроль версий, история и совместная работа.",
  "Visual, motion, modern CSS, and architecture.":
    "Визуал, motion, современный CSS и архитектура.",
  "Waterfall, Agile, Scrum, and Kanban.": "Waterfall, Agile, Scrum и Kanban.",
  "Web components, shadow DOM, and newer HTML APIs.":
    "Web components, shadow DOM и новые HTML API.",
  "What computation is, plus programming paradigms and logic programming.":
    "Что такое вычисления, парадигмы программирования и логическое программирование.",
  "What HTML is, markup model, and the HTML/CSS/JS stack.":
    "Что такое HTML, модель разметки и стек HTML/CSS/JS.",
  "What HTML is, markup model, semantics principles, and the HTML/CSS/JS stack.":
    "Что такое HTML, модель разметки, принципы семантики и стек HTML/CSS/JS.",
  "When to use ES modules vs legacy namespaces.":
    "Когда использовать ES modules vs legacy namespaces.",
  "var vs let vs const and destructuring with types.":
    "var vs let vs const и деструктуризация с типами.",
  "Working with coding agents and docs tools.":
    "Работа с кодинг-агентами и инструментами документации.",
  "GFE dump: test-10-best-free-tailwind-based-component-libraries-and-ui-kits.":
    "Дамп GFE: test-10-best-free-tailwind-based-component-libraries-and-ui-kits.",
  "GFE dump: test-a-real-world-projects-platform-for-front-end-engineers.":
    "Дамп GFE: test-a-real-world-projects-platform-for-front-end-engineers.",
  "GFE dump: test-angular-interview-questions.":
    "Дамп GFE: test-angular-interview-questions.",
  "GFE dump: test-best-big-companies-for-front-end-career.":
    "Дамп GFE: test-best-big-companies-for-front-end-career.",
  "GFE dump: test-best-large-open-source-nextjs-projects-to-study.":
    "Дамп GFE: test-best-large-open-source-nextjs-projects-to-study.",
  "GFE dump: test-best-medium-companies-for-front-end-career.":
    "Дамп GFE: test-best-medium-companies-for-front-end-career.",
  "GFE dump: test-best-resources-to-learn-frontend-development.":
    "Дамп GFE: test-best-resources-to-learn-frontend-development.",
  "GFE dump: test-code-splitting-and-lazy-loading-in-react.":
    "Дамп GFE: test-code-splitting-and-lazy-loading-in-react.",
  "GFE dump: test-core-web-vitals-metrics-in-5-minutes.":
    "Дамп GFE: test-core-web-vitals-metrics-in-5-minutes.",
  "GFE dump: test-databricks-frontend-interview-questions.":
    "Дамп GFE: test-databricks-frontend-interview-questions.",
  "GFE dump: test-discord-frontend-interview-questions.":
    "Дамп GFE: test-discord-frontend-interview-questions.",
  "GFE dump: test-evaluating-companies-as-front-end-engineer.":
    "Дамп GFE: test-evaluating-companies-as-front-end-engineer.",
  "GFE dump: test-faang-frontend-developer-compensation-what-to-expect-at-each-level.":
    "Дамп GFE: test-faang-frontend-developer-compensation-what-to-expect-at-each-level.",
  "GFE dump: test-faang-frontend-developer-salary-india.":
    "Дамп GFE: test-faang-frontend-developer-salary-india.",
  "GFE dump: test-front-end-jobs-with-good-salary-in-india-where-to-target.":
    "Дамп GFE: test-front-end-jobs-with-good-salary-in-india-where-to-target.",
  "GFE dump: test-front-end-performance-techniques.":
    "Дамп GFE: test-front-end-performance-techniques.",
  "GFE dump: test-frontend-developer-career-path.":
    "Дамп GFE: test-frontend-developer-career-path.",
  "GFE dump: test-frontend-developer-cover-letter.":
    "Дамп GFE: test-frontend-developer-cover-letter.",
  "GFE dump: test-frontend-developer-demand-a-job-market-reality-check.":
    "Дамп GFE: test-frontend-developer-demand-a-job-market-reality-check.",
  "GFE dump: test-frontend-developer-github-profile.":
    "Дамп GFE: test-frontend-developer-github-profile.",
  "GFE dump: test-frontend-developer-jobs-for-freshers.":
    "Дамп GFE: test-frontend-developer-jobs-for-freshers.",
  "GFE dump: test-frontend-developer-jobs-in-bangalore.":
    "Дамп GFE: test-frontend-developer-jobs-in-bangalore.",
  "GFE dump: test-frontend-developer-jobs-in-chennai.":
    "Дамп GFE: test-frontend-developer-jobs-in-chennai.",
  "GFE dump: test-frontend-developer-jobs-in-delhi-ncr.":
    "Дамп GFE: test-frontend-developer-jobs-in-delhi-ncr.",
  "GFE dump: test-frontend-developer-jobs-in-hyderabad.":
    "Дамп GFE: test-frontend-developer-jobs-in-hyderabad.",
  "GFE dump: test-frontend-developer-jobs-in-mumbai.":
    "Дамп GFE: test-frontend-developer-jobs-in-mumbai.",
  "GFE dump: test-frontend-developer-jobs-in-pune.":
    "Дамп GFE: test-frontend-developer-jobs-in-pune.",
  "GFE dump: test-frontend-developer-linkedin-profile.":
    "Дамп GFE: test-frontend-developer-linkedin-profile.",
  "GFE dump: test-frontend-developer-portfolio.":
    "Дамп GFE: test-frontend-developer-portfolio.",
  "GFE dump: test-frontend-developer-resume-for-freshers.":
    "Дамп GFE: test-frontend-developer-resume-for-freshers.",
  "GFE dump: test-frontend-developer-roadmap.":
    "Дамп GFE: test-frontend-developer-roadmap.",
  "GFE dump: test-frontend-developer-salary-in-bangalore.":
    "Дамп GFE: test-frontend-developer-salary-in-bangalore.",
  "GFE dump: test-frontend-developer-salary-in-hyderabad.":
    "Дамп GFE: test-frontend-developer-salary-in-hyderabad.",
  "GFE dump: test-frontend-developer-salary-india.":
    "Дамп GFE: test-frontend-developer-salary-india.",
  "GFE dump: test-frontend-developer-salary-negotiation.":
    "Дамп GFE: test-frontend-developer-salary-negotiation.",
  "GFE dump: test-frontend-developer-side-project-ideas.":
    "Дамп GFE: test-frontend-developer-side-project-ideas.",
  "GFE dump: test-frontend-developer-to-ai-engineer.":
    "Дамп GFE: test-frontend-developer-to-ai-engineer.",
  "GFE dump: test-frontend-developer-to-engineering-manager.":
    "Дамп GFE: test-frontend-developer-to-engineering-manager.",
  "GFE dump: test-frontend-developer-to-full-stack-developer.":
    "Дамп GFE: test-frontend-developer-to-full-stack-developer.",
  "GFE dump: test-frontend-developer-to-product-manager-how-to-make-the-switch.":
    "Дамп GFE: test-frontend-developer-to-product-manager-how-to-make-the-switch.",
  "GFE dump: test-frontend-developer-to-tech-lead.":
    "Дамп GFE: test-frontend-developer-to-tech-lead.",
  "GFE dump: test-frontend-development-for-beginners.":
    "Дамп GFE: test-frontend-development-for-beginners.",
  "GFE dump: test-frontend-interview-process-at-google-amazon-and-meta-what-to-expect.":
    "Дамп GFE: test-frontend-interview-process-at-google-amazon-and-meta-what-to-expect.",
  "GFE dump: test-frontend-mock-interview.":
    "Дамп GFE: test-frontend-mock-interview.",
  "GFE dump: test-frontend-project-ideas-for-resume.":
    "Дамп GFE: test-frontend-project-ideas-for-resume.",
  "GFE dump: test-frontend-take-home-assignment.":
    "Дамп GFE: test-frontend-take-home-assignment.",
  "GFE dump: test-frontend-vs-backend-developer.":
    "Дамп GFE: test-frontend-vs-backend-developer.",
  "GFE dump: test-frontend-vs-fullstack-developer.":
    "Дамп GFE: test-frontend-vs-fullstack-developer.",
  "GFE dump: test-how-long-does-it-take-to-become-a-frontend-developer.":
    "Дамп GFE: test-how-long-does-it-take-to-become-a-frontend-developer.",
  "GFE dump: test-how-to-become-a-frontend-architect.":
    "Дамп GFE: test-how-to-become-a-frontend-architect.",
  "GFE dump: test-how-to-become-a-frontend-developer.":
    "Дамп GFE: test-how-to-become-a-frontend-developer.",
  "GFE dump: test-how-to-build-frontend-developer-portfolio-with-no-experience.":
    "Дамп GFE: test-how-to-build-frontend-developer-portfolio-with-no-experience.",
  "GFE dump: test-how-to-evaluate-tech-job-offer-india.":
    "Дамп GFE: test-how-to-evaluate-tech-job-offer-india.",
  "GFE dump: test-how-to-get-frontend-developer-internship.":
    "Дамп GFE: test-how-to-get-frontend-developer-internship.",
  "GFE dump: test-how-to-get-frontend-developer-job-at-faang.":
    "Дамп GFE: test-how-to-get-frontend-developer-job-at-faang.",
  "GFE dump: test-how-to-get-frontend-developer-job-with-no-experience.":
    "Дамп GFE: test-how-to-get-frontend-developer-job-with-no-experience.",
  "GFE dump: test-how-to-grow-as-a-frontend-developer.":
    "Дамп GFE: test-how-to-grow-as-a-frontend-developer.",
  "GFE dump: test-how-to-handle-large-datasets-in-front-end-applications.":
    "Дамп GFE: test-how-to-handle-large-datasets-in-front-end-applications.",
  "GFE dump: test-how-to-learn-javascript.":
    "Дамп GFE: test-how-to-learn-javascript.",
  "GFE dump: test-how-to-learn-react.": "Дамп GFE: test-how-to-learn-react.",
  "GFE dump: test-how-to-learn-typescript.":
    "Дамп GFE: test-how-to-learn-typescript.",
  "GFE dump: test-how-to-start-freelance-frontend-development.":
    "Дамп GFE: test-how-to-start-freelance-frontend-development.",
  "GFE dump: test-how-to-switch-from-backend-to-frontend-developer.":
    "Дамп GFE: test-how-to-switch-from-backend-to-frontend-developer.",
  "GFE dump: test-how-to-write-frontend-developer-resume.":
    "Дамп GFE: test-how-to-write-frontend-developer-resume.",
  "GFE dump: test-image-performance-techniques.":
    "Дамп GFE: test-image-performance-techniques.",
  "GFE dump: test-is-frontend-development-a-good-career.":
    "Дамп GFE: test-is-frontend-development-a-good-career.",
  "GFE dump: test-is-frontend-development-dying-2026.":
    "Дамп GFE: test-is-frontend-development-dying-2026.",
  "GFE dump: test-leveraging-actions-in-react-19-for-enhance-form-handling.":
    "Дамп GFE: test-leveraging-actions-in-react-19-for-enhance-form-handling.",
  "GFE dump: test-most-important-javascript-questions-front-end-interviews.":
    "Дамп GFE: test-most-important-javascript-questions-front-end-interviews.",
  "GFE dump: test-most-important-user-interface-questions-front-end-interviews.":
    "Дамп GFE: test-most-important-user-interface-questions-front-end-interviews.",
  "GFE dump: test-most-useful-and-impactful-react-ecosystem-libraries.":
    "Дамп GFE: test-most-useful-and-impactful-react-ecosystem-libraries.",
  "GFE dump: test-netflix-react-interview-questions.":
    "Дамп GFE: test-netflix-react-interview-questions.",
  "GFE dump: test-next-js-interview-questions.":
    "Дамп GFE: test-next-js-interview-questions.",
  "GFE dump: test-paypal-frontend-interview-questions.":
    "Дамп GFE: test-paypal-frontend-interview-questions.",
  "GFE dump: test-react-vs-angular-vs-vue.":
    "Дамп GFE: test-react-vs-angular-vs-vue.",
  "GFE dump: test-redux-interview-questions-for-freshers.":
    "Дамп GFE: test-redux-interview-questions-for-freshers.",
  "GFE dump: test-remote-frontend-developer-jobs.":
    "Дамп GFE: test-remote-frontend-developer-jobs.",
  "GFE dump: test-rippling-frontend-interview-questions.":
    "Дамп GFE: test-rippling-frontend-interview-questions.",
  "GFE dump: test-senior-frontend-developer-resume.":
    "Дамп GFE: test-senior-frontend-developer-resume.",
  "GFE dump: test-senior-frontend-developer-skills.":
    "Дамп GFE: test-senior-frontend-developer-skills.",
  "GFE dump: test-senior-frontend-engineer-to-staff-engineer.":
    "Дамп GFE: test-senior-frontend-engineer-to-staff-engineer.",
  "GFE dump: test-snowflake-frontend-interview-questions.":
    "Дамп GFE: test-snowflake-frontend-interview-questions.",
  "GFE dump: test-startup-vs-faang-for-frontend-developers.":
    "Дамп GFE: test-startup-vs-faang-for-frontend-developers.",
  "GFE dump: test-tips-and-lessons-from-jordan-cutlers-rapid-career-growth.":
    "Дамп GFE: test-tips-and-lessons-from-jordan-cutlers-rapid-career-growth.",
  "GFE dump: test-top-css-mistakes-made-by-front-end-engineers.":
    "Дамп GFE: test-top-css-mistakes-made-by-front-end-engineers.",
  "GFE dump: test-top-headless-ui-libraries-for-react-in-2026.":
    "Дамп GFE: test-top-headless-ui-libraries-for-react-in-2026.",
  "GFE dump: test-top-open-source-design-systems-by-tech-companies-you-can-use-right-away.":
    "Дамп GFE: test-top-open-source-design-systems-by-tech-companies-you-can-use-right-away.",
  "GFE dump: test-top-react-ui-component-libraries-in-2024.":
    "Дамп GFE: test-top-react-ui-component-libraries-in-2024.",
  "GFE dump: test-vue-interview-questions.":
    "Дамп GFE: test-vue-interview-questions.",
  "GFE dump: test-web-apps-at-scale-css.":
    "Дамп GFE: test-web-apps-at-scale-css.",
  "GFE dump: test-web-apps-at-scale-introduction.":
    "Дамп GFE: test-web-apps-at-scale-introduction.",
  "GFE dump: test-web-apps-at-scale-javascript.":
    "Дамп GFE: test-web-apps-at-scale-javascript.",
  "GFE dump: test-web-apps-at-scale-ui-components.":
    "Дамп GFE: test-web-apps-at-scale-ui-components.",
  "GFE dump: test-50-must-know-javascript-interview-questions-by-ex-interviewers.":
    "Дамп GFE: test-50-must-know-javascript-interview-questions-by-ex-interviewers.",
  "GFE dump: test-accessibility-interview-questions-for-3-years-experience.":
    "Дамп GFE: test-accessibility-interview-questions-for-3-years-experience.",
  "GFE dump: test-code-review-interview-for-frontend-developers.":
    "Дамп GFE: test-code-review-interview-for-frontend-developers.",
  "GFE dump: test-css-interview-questions.":
    "Дамп GFE: test-css-interview-questions.",
  "GFE dump: test-frontend-build-tools-interview-questions-vite-webpack-and-bundling.":
    "Дамп GFE: test-frontend-build-tools-interview-questions-vite-webpack-and-bundling.",
  "GFE dump: test-frontend-debugging-interview-questions.":
    "Дамп GFE: test-frontend-debugging-interview-questions.",
  "GFE dump: test-frontend-lld-react-machine-coding-questions.":
    "Дамп GFE: test-frontend-lld-react-machine-coding-questions.",
  "GFE dump: test-frontend-web-security-interview-questions.":
    "Дамп GFE: test-frontend-web-security-interview-questions.",
  "GFE dump: test-git-interview-questions-for-frontend-developers.":
    "Дамп GFE: test-git-interview-questions-for-frontend-developers.",
  "GFE dump: test-graphql-interview-questions.":
    "Дамп GFE: test-graphql-interview-questions.",
  "GFE dump: test-html-interview-questions-for-3-years-experience.":
    "Дамп GFE: test-html-interview-questions-for-3-years-experience.",
  "GFE dump: test-javascript-interview-questions-for-2-years-experience.":
    "Дамп GFE: test-javascript-interview-questions-for-2-years-experience.",
  "GFE dump: test-javascript-interview-questions-for-5-years-experience.":
    "Дамп GFE: test-javascript-interview-questions-for-5-years-experience.",
  "GFE dump: test-machine-coding-round.":
    "Дамп GFE: test-machine-coding-round.",
  "GFE dump: test-nodejs-interview-questions-for-3-years-experience.":
    "Дамп GFE: test-nodejs-interview-questions-for-3-years-experience.",
  "GFE dump: test-quiz-useeffect-deps.": "Дамп GFE: test-quiz-useeffect-deps.",
  "GFE dump: test-senior-angular-developer-interview-questions-advanced-topics-and-answers.":
    "Дамп GFE: test-senior-angular-developer-interview-questions-advanced-topics-and-answers.",
  "GFE dump: test-senior-browser-fundamentals-developer-interview-questions-advanced-topics-and-answers.":
    "Дамп GFE: test-senior-browser-fundamentals-developer-interview-questions-advanced-topics-and-answers.",
  "GFE dump: test-typescript-for-react-developers.":
    "Дамп GFE: test-typescript-for-react-developers.",
  "GFE dump: test-typescript-interview-questions-for-3-years-experience.":
    "Дамп GFE: test-typescript-interview-questions-for-3-years-experience.",
  "GFE dump: test-typescript-interview-questions-for-tech-leads.":
    "Дамп GFE: test-typescript-interview-questions-for-tech-leads.",
  "GFE dump: test-web-performance-interview-questions.":
    "Дамп GFE: test-web-performance-interview-questions.",
  "GFE guide: pair programming format, signals, worked filterUsers session, prep and mistakes.":
    "Гайд GFE: Frontend Pair Programming Interview: What to Expect and How …",
  "GFE guide: rubrics, round-by-round signals, debounced search scoring example, mock self-score.":
    "Гайд GFE: How Frontend Interviews Are Scored: What Interviewers Look F…",
  "GFE guide: project walkthrough structure, worked example, follow-ups, honesty about AI and libs.":
    "Гайд GFE: How to Explain Your Projects in a Frontend Interview (With E…",
  "GFE guide: when to narrate in coding rounds, sample dialogue, stuck-table, practice habits.":
    "Гайд GFE: How to Think Out Loud in a Frontend Coding Interview",
  Conspect: "Конспект",
  Interviews: "Собеседования",
  "Computer Science": "Компьютерные науки",
  "Data structures, algorithms, and system design for interviews.":
    "Структуры данных, алгоритмы и проектирование систем для собеседований.",
  "Core CS concepts, data structures, algorithms, and system design for interviews.":
    "База CS: вычисления и парадигмы, структуры данных, алгоритмы и проектирование систем для собеседований.",
  "Computation, programming paradigms, imperative vs declarative, and logic programming.":
    "Вычисления, парадигмы программирования, imperative vs declarative и логическое программирование.",
};

/** Return localized catalog blurb; falls back to English when RU is missing. */
export function catalogBlurb(locale: Locale, english: string): string {
  if (locale === "en") {
    return english;
  }
  return RU_BLURBS[english] ?? english;
}
