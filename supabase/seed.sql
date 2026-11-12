-- SHIYE / 拾页 starter catalog. Safe to run more than once.
insert into public.site_settings (
  id, site_name_zh, site_name_en, tagline_zh, tagline_en,
  intro_zh, intro_en, seo_title_zh, seo_title_en,
  seo_description_zh, seo_description_en, footer_text_zh, footer_text_en
) values (
  'main',
  '拾页', 'SHIYE',
  '值得留下的网页索引', 'A curated index of the web',
  '跳过搜索页和重复推荐，直接抵达那些值得反复打开的地方。',
  'Skip the search page and the repeated recommendations. Go straight to the places worth returning to.',
  '拾页 SHIYE · 值得留下的网页索引', 'SHIYE · A curated index of the web',
  '一个由编辑挑选的双语网站导航，收录开发、设计、AI、效率、影音与知识网站。',
  'A bilingual directory of useful places across development, design, AI, productivity, media, and knowledge.',
  '拾取值得留下的网页。', 'Keep the web pages worth keeping.'
)
on conflict (id) do update set
  site_name_zh = excluded.site_name_zh,
  site_name_en = excluded.site_name_en,
  tagline_zh = excluded.tagline_zh,
  tagline_en = excluded.tagline_en,
  intro_zh = excluded.intro_zh,
  intro_en = excluded.intro_en,
  seo_title_zh = excluded.seo_title_zh,
  seo_title_en = excluded.seo_title_en,
  seo_description_zh = excluded.seo_description_zh,
  seo_description_en = excluded.seo_description_en,
  footer_text_zh = excluded.footer_text_zh,
  footer_text_en = excluded.footer_text_en;

insert into public.categories (slug, name_zh, name_en, description_zh, description_en, sort_order, is_visible) values
  ('ai', 'AI 与工具', 'AI & tools', '对话、检索与开放模型资源。', 'Conversation, research, and open model resources.', 10, true),
  ('development', '开发与技术', 'Development', '写代码、查文档、发布产品。', 'Write code, read the docs, and ship.', 20, true),
  ('design', '设计与灵感', 'Design & inspiration', '界面、图像与视觉观察的入口。', 'Places for interfaces, images, and visual observation.', 30, true),
  ('productivity', '效率与协作', 'Productivity', '整理笔记、计划与团队工作。', 'Organize notes, plans, and team work.', 40, true),
  ('media', '影像与声音', 'Media & sound', '观看、聆听，也保存自己的收藏。', 'Watch, listen, and keep a collection.', 50, true),
  ('knowledge', '阅读与知识', 'Reading & knowledge', '百科、论文、档案与长文章。', 'Encyclopedias, papers, archives, and long reads.', 60, true)
on conflict (slug) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  description_zh = excluded.description_zh,
  description_en = excluded.description_en,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible;

insert into public.sites (
  category_id, name_zh, name_en, description_zh, description_en,
  url, icon_url, sort_order, is_visible, is_featured
)
select
  category.id, seed.name_zh, seed.name_en, seed.description_zh, seed.description_en,
  seed.url, null, seed.sort_order, true, seed.is_featured
from (values
  ('ai', 'ChatGPT', 'ChatGPT', '用于问答、写作与分析的通用 AI 助手。', 'A general AI assistant for questions, writing, and analysis.', 'https://chatgpt.com', 10, false),
  ('ai', 'Claude', 'Claude', '擅长长文本阅读、推理与协作写作的 AI 助手。', 'An AI assistant strong at long reading, reasoning, and collaborative writing.', 'https://claude.ai', 20, false),
  ('ai', 'Hugging Face', 'Hugging Face', '开放模型、数据集与应用演示社区。', 'A community for open models, datasets, and app demos.', 'https://huggingface.co', 30, true),
  ('ai', 'Perplexity', 'Perplexity', '带来源引用的 AI 搜索与研究工具。', 'AI search and research with cited sources.', 'https://www.perplexity.ai', 40, false),
  ('development', 'GitHub', 'GitHub', '代码托管、协作与开源项目的中心。', 'The centre for code hosting, collaboration, and open source.', 'https://github.com', 10, false),
  ('development', 'MDN Web Docs', 'MDN Web Docs', '可靠的 Web 平台、HTML、CSS 与 JavaScript 文档。', 'Reliable documentation for the web platform, HTML, CSS, and JavaScript.', 'https://developer.mozilla.org', 20, false),
  ('development', 'Stack Overflow', 'Stack Overflow', '面向开发者的问答与排错档案。', 'Developer questions, answers, and troubleshooting history.', 'https://stackoverflow.com', 30, false),
  ('development', 'Vercel', 'Vercel', '面向前端与全栈项目的托管和部署平台。', 'Hosting and deployment for frontend and full-stack projects.', 'https://vercel.com', 40, true),
  ('design', 'Figma', 'Figma', '多人协作的界面设计与原型工具。', 'Collaborative interface design and prototyping.', 'https://www.figma.com', 10, false),
  ('design', 'Are.na', 'Are.na', '保存、连接与重新发现视觉资料的安静空间。', 'A quiet place to save, connect, and rediscover visual material.', 'https://www.are.na', 20, true),
  ('design', 'Dribbble', 'Dribbble', '视觉设计师的作品展示与发现社区。', 'A showcase and discovery community for visual designers.', 'https://dribbble.com', 30, false),
  ('design', 'Awwwards', 'Awwwards', '网页设计案例与趋势的精选目录。', 'A curated catalogue of web design work and trends.', 'https://www.awwwards.com', 40, false),
  ('productivity', 'Linear', 'Linear', '为高效团队设计的项目与问题追踪工具。', 'Project and issue tracking designed for focused teams.', 'https://linear.app', 10, true),
  ('productivity', 'Notion', 'Notion', '把文档、知识库与计划放在一起的工作空间。', 'A workspace that brings documents, knowledge, and plans together.', 'https://www.notion.com', 20, false),
  ('productivity', 'Obsidian', 'Obsidian', '以本地 Markdown 文件为核心的连接式笔记工具。', 'Connected notes built on local Markdown files.', 'https://obsidian.md', 30, false),
  ('productivity', 'Readwise', 'Readwise', '汇集阅读标注，并把它们带回日常思考。', 'Collect reading highlights and bring them back into daily thinking.', 'https://readwise.io', 40, false),
  ('media', 'YouTube', 'YouTube', '覆盖教程、讲座、纪录片与创作者影像。', 'Tutorials, talks, documentaries, and creator video.', 'https://www.youtube.com', 10, false),
  ('media', 'Vimeo', 'Vimeo', '偏重独立影像、动画与专业作品的视频平台。', 'Video focused on independent film, animation, and professional work.', 'https://vimeo.com', 20, false),
  ('media', 'Spotify', 'Spotify', '音乐、播客与按心情发现声音的入口。', 'Music, podcasts, and sound discovery by mood.', 'https://open.spotify.com', 30, false),
  ('media', 'Bandcamp', 'Bandcamp', '直接支持独立音乐人的唱片与试听空间。', 'Records and listening directly supporting independent musicians.', 'https://bandcamp.com', 40, false),
  ('knowledge', 'Wikipedia', 'Wikipedia', '由公共编辑共同维护的知识入口。', 'A knowledge entry point maintained by public editors.', 'https://www.wikipedia.org', 10, false),
  ('knowledge', 'arXiv', 'arXiv', '数学、物理与计算机科学开放论文库。', 'Open papers across mathematics, physics, and computer science.', 'https://arxiv.org', 20, false),
  ('knowledge', 'Internet Archive', 'Internet Archive', '网页、图书、音频与软件的公共数字档案。', 'A public digital archive of the web, books, audio, and software.', 'https://archive.org', 30, true),
  ('knowledge', 'Aeon', 'Aeon', '关于哲学、科学、社会与文化的长篇思想文章。', 'Long-form thought on philosophy, science, society, and culture.', 'https://aeon.co', 40, false)
) as seed(category_slug, name_zh, name_en, description_zh, description_en, url, sort_order, is_featured)
join public.categories category on category.slug = seed.category_slug
on conflict (url) do update set
  category_id = excluded.category_id,
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  description_zh = excluded.description_zh,
  description_en = excluded.description_en,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible,
  is_featured = excluded.is_featured;
