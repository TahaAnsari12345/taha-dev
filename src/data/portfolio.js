/**
 * Single source of truth for all portfolio content.
 * Edit this file only — components read everything from here.
 *
 * Any value that is empty or still contains a "[ADD_" placeholder is treated as
 * "not provided": buttons/boxes that depend on it are hidden (see `isFilled`).
 */

export const isFilled = (v) => typeof v === 'string' && v.trim() !== '' && !v.includes('[ADD_');

const GITHUB_PROFILE = 'https://github.com/TahaAnsari12345';

export const profile = {
  name: 'Taha Ansari',
  initials: 'TA',
  badge: 'Open to Software Engineer roles',
  roles: [
    'Full-Stack Developer (React & Node.js)',
    'AI/ML Engineer (NLP & RAG)',
    'Turning ideas into deployed products',
  ],
  intro:
    'I design and ship complete products: clean React frontends, secure Node.js APIs, PostgreSQL databases and AI features on top.',
  portrait: '/taha-portrait.webp', // About photo (800x1000, 4:5)
  resume: '/Taha_Ansari_Resume.pdf', // file lives in public/ (name is case-sensitive on Vercel)
  resumeFileName: 'Taha_Ansari_Resume.pdf',
  email: 'tahaltcollege@gmail.com',
  linkedin: 'https://www.linkedin.com/in/taha-ansari-8bb95326',
  github: GITHUB_PROFILE,
  location: 'Mumbai, India',
};

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'github', label: 'GitHub' },
  { id: 'contact', label: 'Contact' },
];

export const about = {
  paragraphs: [
    "I'm Taha Ansari, a Computer Science (AI & ML) engineer from Mumbai who likes building complete products: clean React frontends, secure Node.js APIs, PostgreSQL databases, and AI features on top.",
    "I care about the unglamorous parts that make software trustworthy: server-side validation, role-based access, sensible data models, and deployments that actually stay up.",
  ],
  education: [
    {
      title: 'B.E. CSE (AI & ML)',
      place: 'Lokmanya Tilak College of Engineering, Navi Mumbai',
      meta: 'Overall CGPI 9.5/10 · 1st rank in AI & ML department',
      period: 'Nov 2022 – Jun 2026',
    },
    {
      title: 'HSC (12th)',
      place: 'B.S. Johndhale Vidya Mandir and Jr. College, Thane',
      meta: '89.83%',
      period: '',
    },
  ],
  // `value` animates from 0; use `text` for non-numeric stats.
  stats: [
    { value: 5, label: 'Projects shipped' },
    { value: 9.5, decimals: 1, label: 'CGPI' },
    { value: 1, suffix: 'st', label: 'Rank · AI & ML dept' },
    { text: 'SIH 2024', label: 'Participant' },
  ],
};

export const skillGroups = [
  { title: 'Languages', icon: 'code', items: ['JavaScript', 'Python', 'C++', 'HTML5', 'CSS3'] },
  { title: 'Frontend', icon: 'layout', items: ['React', 'Tailwind CSS', 'Context API', 'Responsive Design'] },
  { title: 'Backend', icon: 'server', items: ['Node.js', 'Express.js', 'REST APIs', 'Prisma ORM', 'JWT', 'bcrypt'] },
  { title: 'Databases', icon: 'database', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Qdrant (Vector DB)'] },
  { title: 'AI/ML', icon: 'brain', items: ['Machine Learning', 'NLP', 'RAG', 'OpenCV', 'NumPy', 'Pandas'] },
  { title: 'Auth & Services', icon: 'shield', items: ['Clerk', 'Stripe', 'Cloudinary'] },
  { title: 'Tools', icon: 'tool', items: ['Git', 'GitHub', 'VS Code', 'Postman', 'Jupyter', 'Google Colab'] },
  { title: 'Deployment', icon: 'cloud', items: ['Vercel', 'Render', 'Neon'] },
  {
    title: 'Core concepts',
    icon: 'cpu',
    items: ['OOP', 'RESTful API development', 'Debugging & testing', 'Documentation', 'Problem solving'],
  },
];

/** Labels floating in the 3D skills cluster. `hue` = CSS color. */
export const skillCloud = [
  { label: 'React', hue: '#38bdf8' },
  { label: 'Node.js', hue: '#4ade80' },
  { label: 'JavaScript', hue: '#facc15' },
  { label: 'Python', hue: '#60a5fa' },
  { label: 'PostgreSQL', hue: '#93c5fd' },
  { label: 'MongoDB', hue: '#34d399' },
  { label: 'Express', hue: '#e2e8f0' },
  { label: 'Tailwind', hue: '#22d3ee' },
  { label: 'RAG', hue: '#c084fc' },
  { label: 'NLP', hue: '#a78bfa' },
  { label: 'OpenCV', hue: '#f87171' },
  { label: 'Stripe', hue: '#818cf8' },
  { label: 'Prisma', hue: '#2dd4bf' },
  { label: 'JWT', hue: '#f472b6' },
  { label: 'Git', hue: '#fb923c' },
  { label: 'C++', hue: '#60a5fa' },
  { label: 'Qdrant', hue: '#f43f5e' },
  { label: 'Clerk', hue: '#a5b4fc' },
  { label: 'Vercel', hue: '#f1f5f9' },
  { label: 'Pandas', hue: '#93c5fd' },
  { label: 'NumPy', hue: '#7dd3fc' },
  { label: 'Cloudinary', hue: '#38bdf8' },
];

/** Shown under every Live Demo button (backends sleep on free hosting). */
export const LAUNCH_NOTE = 'Hosted on a free tier, so the first load may take ~30s while the server wakes up.';

/**
 * Projects (in display order). Each repo URL lives in `links.github` — change it here (one line).
 * `featured: true` renders the large layout. `highlights` are short bullet titles.
 */
export const projects = [
  {
    id: 'shopzi',
    featured: true,
    title: 'Shopzi',
    kind: 'shop',
    accent: '#22d3ee',
    tagline: 'Multi-seller e-commerce marketplace',
    description: 'Sellers manage products and orders; buyers search, add to cart and pay securely with Stripe.',
    highlights: [{ title: 'Multi-seller marketplace' }, { title: 'Seller dashboard' }, { title: 'Stripe checkout' }],
    tech: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Clerk', 'Stripe', 'Cloudinary'],
    links: {
      live: 'https://shopzi-nine.vercel.app/',
      github: 'https://github.com/TahaAnsari12345/Shopzii',
    },
    // Backends are NOT listed here. The wake id maps to a URL inside api/wake.js only.
    wakeId: 'shopzi',
    /**
     * Architecture diagram (edit freely; labels are generic, never real URLs).
     * Coordinates are in a 1000 x 600 box for the desktop layout: x/y = node centre, w/h = size.
     * `kind` picks the accent: frontend (blue) | backend (cyan) | database (violet) | payment | storage.
     * Sides: left | right | top | bottom. `checkout.legs` are drawn as the bright highlighted path.
     */
    architecture: {
      layers: [
        { id: 'frontend', label: 'Frontend', x: 10, w: 385 },
        { id: 'backend', label: 'Backend', x: 440, w: 270 },
        { id: 'services', label: 'Services', x: 730, w: 260 },
      ],
      nodes: [
        { id: 'buyer', layer: 'frontend', kind: 'frontend', icon: 'user', title: 'Buyer', caption: 'Browses and buys', x: 90, y: 185, w: 130, h: 84 },
        { id: 'seller', layer: 'frontend', kind: 'frontend', icon: 'user', title: 'Seller', caption: 'Manages products and orders', x: 90, y: 425, w: 130, h: 84 },
        {
          id: 'app', layer: 'frontend', kind: 'frontend', icon: 'layout', title: 'React (Vite) app on Vercel',
          caption: 'Search, filters, cart, seller dashboard, protected routes', x: 290, y: 305, w: 180, h: 112,
        },
        { id: 'clerk', layer: 'backend', kind: 'backend', icon: 'shield', title: 'Clerk', caption: 'Auth and buyer/seller roles', x: 575, y: 130, w: 180, h: 100 },
        {
          id: 'api', layer: 'backend', kind: 'backend', icon: 'server', title: 'Express API on Render',
          caption: 'Role-based authorization, orders, stock validation', x: 575, y: 305, w: 180, h: 112,
        },
        { id: 'db', layer: 'backend', kind: 'database', icon: 'database', title: 'PostgreSQL on Neon', caption: 'Products, orders, reviews, sellers', x: 575, y: 480, w: 180, h: 100 },
        { id: 'stripe', layer: 'services', kind: 'payment', icon: 'card', title: 'Stripe Checkout', caption: 'Secure online payments', x: 850, y: 185, w: 180, h: 100 },
        { id: 'cloudinary', layer: 'services', kind: 'storage', icon: 'image', title: 'Cloudinary', caption: 'Product image uploads', x: 850, y: 425, w: 180, h: 100 },
      ],
      edges: [
        { from: 'buyer', to: 'app', fromSide: 'right', toSide: 'left' },
        { from: 'seller', to: 'app', fromSide: 'right', toSide: 'left' },
        { from: 'clerk', to: 'api', fromSide: 'bottom', toSide: 'top' },
        { from: 'api', to: 'db', fromSide: 'bottom', toSide: 'top' },
        { from: 'api', to: 'cloudinary', fromSide: 'right', toSide: 'left' },
      ],
      checkout: {
        legs: [
          { from: 'app', to: 'api', fromSide: 'right', toSide: 'left' },
          { from: 'api', to: 'stripe', fromSide: 'right', toSide: 'left' },
          { from: 'stripe', to: 'app', route: 'top' }, // order confirmed, back to the app
        ],
        tags: [
          { n: 1, label: 'Cart', leg: 0, dy: -26 },
          { n: 2, label: 'Stock check', leg: 0, dy: 28 },
          { n: 3, label: 'Pay', leg: 1, dy: 0 },
        ],
        returnLabel: 'Order confirmed',
      },
      legend: [
        { kind: 'frontend', label: 'Frontend' },
        { kind: 'backend', label: 'Backend' },
        { kind: 'database', label: 'Database' },
        { kind: 'payment', label: 'Payment' },
        { kind: 'storage', label: 'Storage' },
      ],
    },
  },
  {
    id: 'oakhire',
    title: 'OakHire CRM',
    kind: 'crm',
    accent: '#2563eb',
    description: 'Recruitment CRM with a mandatory follow-up funnel, call bridge and role-based dashboards.',
    highlights: [
      { title: 'Server-enforced follow-up funnel' },
      { title: 'Call bridge with disposition logging' },
      { title: 'Admin/employee RBAC' },
    ],
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    links: {
      // NOTE: https://oak-hire.vercel.app/login returns a Vercel 404 on a direct load (the OakHire
      // project needs an SPA rewrite). The root URL works and shows the login screen. Switch back to
      // '/login' once that rewrite is deployed.
      live: 'https://oak-hire.vercel.app/',
      github: 'https://github.com/TahaAnsari12345/OakHire',
    },
    wakeId: 'oakhire',
    // Demo credentials: the copy box shows only when both are filled in.
    demo: {
      email: 'rohan@oaksphere.com',
      password: 'Employee@123',
      note: 'Use this to explore the app. Demo data only.',
    },
  },
  {
    id: 'ai-saas',
    title: 'AI SaaS Platform',
    kind: 'ai',
    accent: '#8b5cf6',
    description: 'AI web app for content generation, data analysis, resume review and career roadmaps.',
    highlights: [{ title: 'AI resume review' }, { title: 'Personalised career roadmaps' }, { title: 'JWT-secured REST API' }],
    tech: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind', 'JWT'],
    links: {
      live: 'https://quick-ai-mocha-seven.vercel.app/',
      github: 'https://github.com/TahaAnsari12345/Quick-AI',
    },
    wakeId: 'ai-saas',
  },
  {
    id: 'taskforge',
    title: 'TaskForge',
    kind: 'kanban',
    accent: '#10b981',
    description: 'Team task management with Kanban boards and per-project dashboards.',
    highlights: [{ title: 'Kanban tracking' }, { title: 'Admin/Member RBAC' }, { title: 'JWT + bcrypt auth' }],
    tech: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT', 'bcrypt'],
    links: {
      live: 'https://taskforge-gules.vercel.app/',
      github: 'https://github.com/TahaAnsari12345/TASKFORGE',
    },
    wakeId: 'taskforge',
  },
  {
    id: 'smart-glasses',
    title: 'Smart Glasses Vision',
    kind: 'vision',
    accent: '#f59e0b',
    badge: 'College project',
    description: 'AI assistive glasses for visually impaired users, built as a college team project.',
    highlights: [
      { title: 'Real-time object detection (OpenCV)' },
      { title: 'Spoken audio feedback (TTS)' },
      { title: 'Standalone Raspberry Pi 4 build' },
    ],
    tech: ['Python', 'OpenCV', 'Text-to-Speech', 'Raspberry Pi 4'],
    links: { github: 'https://github.com/TahaAnsari12345/AI-SMART-GLASSES' },
  },
];

export const experience = [
  {
    role: 'Front-End Web Developer',
    company: 'SkillCraft Technology',
    period: 'Oct – Nov 2024',
    points: [
      'Built responsive React interfaces, including a Weather App.',
      'Collaborated with the UI/UX team in an Agile workflow.',
      'Completed tasks ahead of schedule.',
    ],
  },
  {
    role: 'Machine Learning Intern',
    company: 'IBM SkillsBuild',
    period: 'Nov – Dec 2024',
    points: ['Data preprocessing and supervised learning models on real datasets.'],
  },
];

export const achievements = [
  {
    icon: 'trophy',
    title: '1st Rank in AI & ML Department',
    text: 'Overall degree CGPI 9.5/10. Year-wise CGPI: 9.85 in 2nd year and 9.75 in 3rd year.',
  },
  {
    icon: 'medal',
    title: '2nd rank in 12th grade',
    text: 'Second in the college with 89.83% in HSC.',
  },
  {
    icon: 'flag',
    title: 'Smart India Hackathon 2024',
    text: 'Participated in Smart India Hackathon 2024.',
  },
];

export const certifications = [
  { name: 'Data Analytics', issuer: 'IBM SkillsBuild' },
  { name: 'AI & Data Skills', issuer: 'YBI Foundation' },
  { name: 'Python Programming', issuer: 'TalentBattle' },
];
