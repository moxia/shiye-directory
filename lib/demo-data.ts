import type { Catalog, Category, Site, SiteSettings } from "./types";

const categories: Category[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "ai",
    name: { zh: "AI 与工具", en: "AI & tools" },
    description: {
      zh: "对话、检索与开放模型资源。",
      en: "Conversation, research, and open model resources."
    },
    sortOrder: 10,
    isVisible: true,
    siteCount: 4
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "development",
    name: { zh: "开发与技术", en: "Development" },
    description: {
      zh: "写代码、查文档、发布产品。",
      en: "Write code, read the docs, and ship."
    },
    sortOrder: 20,
    isVisible: true,
    siteCount: 4
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "design",
    name: { zh: "设计与灵感", en: "Design & inspiration" },
    description: {
      zh: "界面、图像与视觉观察的入口。",
      en: "Places for interfaces, images, and visual observation."
    },
    sortOrder: 30,
    isVisible: true,
    siteCount: 4
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "productivity",
    name: { zh: "效率与协作", en: "Productivity" },
    description: {
      zh: "整理笔记、计划与团队工作。",
      en: "Organize notes, plans, and team work."
    },
    sortOrder: 40,
    isVisible: true,
    siteCount: 4
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    slug: "media",
    name: { zh: "影像与声音", en: "Media & sound" },
    description: {
      zh: "观看、聆听，也保存自己的收藏。",
      en: "Watch, listen, and keep a collection."
    },
    sortOrder: 50,
    isVisible: true,
    siteCount: 4
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    slug: "knowledge",
    name: { zh: "阅读与知识", en: "Reading & knowledge" },
    description: {
      zh: "百科、论文、档案与长文章。",
      en: "Encyclopedias, papers, archives, and long reads."
    },
    sortOrder: 60,
    isVisible: true,
    siteCount: 4
  }
];

type SiteSeed = Omit<Site, "id" | "updatedAt" | "domain" | "categoryId"> & {
  categoryIndex: number;
};

const siteSeeds: SiteSeed[] = [
  {
    categoryIndex: 0,
    name: { zh: "ChatGPT", en: "ChatGPT" },
    description: { zh: "用于问答、写作与分析的通用 AI 助手。", en: "A general AI assistant for questions, writing, and analysis." },
    url: "https://chatgpt.com",
    iconUrl: null,
    sortOrder: 10,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 0,
    name: { zh: "Claude", en: "Claude" },
    description: { zh: "擅长长文本阅读、推理与协作写作的 AI 助手。", en: "An AI assistant strong at long reading, reasoning, and collaborative writing." },
    url: "https://claude.ai",
    iconUrl: null,
    sortOrder: 20,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 0,
    name: { zh: "Hugging Face", en: "Hugging Face" },
    description: { zh: "开放模型、数据集与应用演示社区。", en: "A community for open models, datasets, and app demos." },
    url: "https://huggingface.co",
    iconUrl: null,
    sortOrder: 30,
    isVisible: true,
    isFeatured: true
  },
  {
    categoryIndex: 0,
    name: { zh: "Perplexity", en: "Perplexity" },
    description: { zh: "带来源引用的 AI 搜索与研究工具。", en: "AI search and research with cited sources." },
    url: "https://www.perplexity.ai",
    iconUrl: null,
    sortOrder: 40,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 1,
    name: { zh: "GitHub", en: "GitHub" },
    description: { zh: "代码托管、协作与开源项目的中心。", en: "The centre for code hosting, collaboration, and open source." },
    url: "https://github.com",
    iconUrl: null,
    sortOrder: 10,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 1,
    name: { zh: "MDN Web Docs", en: "MDN Web Docs" },
    description: { zh: "可靠的 Web 平台、HTML、CSS 与 JavaScript 文档。", en: "Reliable documentation for the web platform, HTML, CSS, and JavaScript." },
    url: "https://developer.mozilla.org",
    iconUrl: null,
    sortOrder: 20,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 1,
    name: { zh: "Stack Overflow", en: "Stack Overflow" },
    description: { zh: "面向开发者的问答与排错档案。", en: "Developer questions, answers, and troubleshooting history." },
    url: "https://stackoverflow.com",
    iconUrl: null,
    sortOrder: 30,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 1,
    name: { zh: "Vercel", en: "Vercel" },
    description: { zh: "面向前端与全栈项目的托管和部署平台。", en: "Hosting and deployment for frontend and full-stack projects." },
    url: "https://vercel.com",
    iconUrl: null,
    sortOrder: 40,
    isVisible: true,
    isFeatured: true
  },
  {
    categoryIndex: 2,
    name: { zh: "Figma", en: "Figma" },
    description: { zh: "多人协作的界面设计与原型工具。", en: "Collaborative interface design and prototyping." },
    url: "https://www.figma.com",
    iconUrl: null,
    sortOrder: 10,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 2,
    name: { zh: "Are.na", en: "Are.na" },
    description: { zh: "保存、连接与重新发现视觉资料的安静空间。", en: "A quiet place to save, connect, and rediscover visual material." },
    url: "https://www.are.na",
    iconUrl: null,
    sortOrder: 20,
    isVisible: true,
    isFeatured: true
  },
  {
    categoryIndex: 2,
    name: { zh: "Dribbble", en: "Dribbble" },
    description: { zh: "视觉设计师的作品展示与发现社区。", en: "A showcase and discovery community for visual designers." },
    url: "https://dribbble.com",
    iconUrl: null,
    sortOrder: 30,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 2,
    name: { zh: "Awwwards", en: "Awwwards" },
    description: { zh: "网页设计案例与趋势的精选目录。", en: "A curated catalogue of web design work and trends." },
    url: "https://www.awwwards.com",
    iconUrl: null,
    sortOrder: 40,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 3,
    name: { zh: "Linear", en: "Linear" },
    description: { zh: "为高效团队设计的项目与问题追踪工具。", en: "Project and issue tracking designed for focused teams." },
    url: "https://linear.app",
    iconUrl: null,
    sortOrder: 10,
    isVisible: true,
    isFeatured: true
  },
  {
    categoryIndex: 3,
    name: { zh: "Notion", en: "Notion" },
    description: { zh: "把文档、知识库与计划放在一起的工作空间。", en: "A workspace that brings documents, knowledge, and plans together." },
    url: "https://www.notion.com",
    iconUrl: null,
    sortOrder: 20,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 3,
    name: { zh: "Obsidian", en: "Obsidian" },
    description: { zh: "以本地 Markdown 文件为核心的连接式笔记工具。", en: "Connected notes built on local Markdown files." },
    url: "https://obsidian.md",
    iconUrl: null,
    sortOrder: 30,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 3,
    name: { zh: "Readwise", en: "Readwise" },
    description: { zh: "汇集阅读标注，并把它们带回日常思考。", en: "Collect reading highlights and bring them back into daily thinking." },
    url: "https://readwise.io",
    iconUrl: null,
    sortOrder: 40,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 4,
    name: { zh: "YouTube", en: "YouTube" },
    description: { zh: "覆盖教程、讲座、纪录片与创作者影像。", en: "Tutorials, talks, documentaries, and creator video." },
    url: "https://www.youtube.com",
    iconUrl: null,
    sortOrder: 10,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 4,
    name: { zh: "Vimeo", en: "Vimeo" },
    description: { zh: "偏重独立影像、动画与专业作品的视频平台。", en: "Video focused on independent film, animation, and professional work." },
    url: "https://vimeo.com",
    iconUrl: null,
    sortOrder: 20,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 4,
    name: { zh: "Spotify", en: "Spotify" },
    description: { zh: "音乐、播客与按心情发现声音的入口。", en: "Music, podcasts, and sound discovery by mood." },
    url: "https://open.spotify.com",
    iconUrl: null,
    sortOrder: 30,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 4,
    name: { zh: "Bandcamp", en: "Bandcamp" },
    description: { zh: "直接支持独立音乐人的唱片与试听空间。", en: "Records and listening directly supporting independent musicians." },
    url: "https://bandcamp.com",
    iconUrl: null,
    sortOrder: 40,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 5,
    name: { zh: "Wikipedia", en: "Wikipedia" },
    description: { zh: "由公共编辑共同维护的知识入口。", en: "A knowledge entry point maintained by public editors." },
    url: "https://www.wikipedia.org",
    iconUrl: null,
    sortOrder: 10,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 5,
    name: { zh: "arXiv", en: "arXiv" },
    description: { zh: "数学、物理与计算机科学开放论文库。", en: "Open papers across mathematics, physics, and computer science." },
    url: "https://arxiv.org",
    iconUrl: null,
    sortOrder: 20,
    isVisible: true,
    isFeatured: false
  },
  {
    categoryIndex: 5,
    name: { zh: "Internet Archive", en: "Internet Archive" },
    description: { zh: "网页、图书、音频与软件的公共数字档案。", en: "A public digital archive of the web, books, audio, and software." },
    url: "https://archive.org",
    iconUrl: null,
    sortOrder: 30,
    isVisible: true,
    isFeatured: true
  },
  {
    categoryIndex: 5,
    name: { zh: "Aeon", en: "Aeon" },
    description: { zh: "关于哲学、科学、社会与文化的长篇思想文章。", en: "Long-form thought on philosophy, science, society, and culture." },
    url: "https://aeon.co",
    iconUrl: null,
    sortOrder: 40,
    isVisible: true,
    isFeatured: false
  }
];

const sites: Site[] = siteSeeds.map((site, index) => ({
  id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  categoryId: categories[site.categoryIndex].id,
  name: site.name,
  description: site.description,
  url: site.url,
  iconUrl: site.iconUrl,
  domain: new URL(site.url).hostname.replace(/^www\./, ""),
  sortOrder: site.categoryIndex * 100 + site.sortOrder,
  isVisible: site.isVisible,
  isFeatured: site.isFeatured,
  updatedAt: "2026-11-12T00:00:00.000Z"
}));

const settings: SiteSettings = {
  siteName: { zh: "拾页", en: "SHIYE" },
  tagline: { zh: "值得留下的网页索引", en: "A curated index of the web" },
  intro: {
    zh: "跳过搜索页和重复推荐，直接抵达那些值得反复打开的地方。",
    en: "Skip the search page and the repeated recommendations. Go straight to the places worth returning to."
  },
  seoTitle: {
    zh: "拾页 SHIYE · 值得留下的网页索引",
    en: "SHIYE · A curated index of the web"
  },
  seoDescription: {
    zh: "一个由编辑挑选的双语网站导航，收录开发、设计、AI、效率、影音与知识网站。",
    en: "A bilingual directory of useful places across development, design, AI, productivity, media, and knowledge."
  },
  footerText: {
    zh: "拾取值得留下的网页。",
    en: "Keep the web pages worth keeping."
  },
  updatedAt: "2026-11-12T00:00:00.000Z"
};

export const DEMO_CATALOG: Catalog = {
  categories,
  sites,
  settings,
  demoMode: true
};
