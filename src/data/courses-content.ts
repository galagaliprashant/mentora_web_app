// ===== COURSE DETAIL CONTENT =====
// Source of truth for the dedicated "Learn More" course pages (course.html?id=<id>).
// `id` matches the data-course-id used by the enquiry modal and courses-videos.json.
// Courses sourced from official programme documents carry full content; the rest
// are marked `placeholder: true` until their material is finalised.

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'checklist'; items: string[] };

export interface MetaItem {
  label: string;
  value: string;
}

export interface FacultyItem {
  name: string;
  detail: string;
  links?: { label: string; url: string }[];
}

export interface CourseContent {
  id: string;
  name: string;
  tag: string;
  icon: string;
  summary: string;
  tagline?: string;
  meta?: MetaItem[];
  blocks: Block[];
  faculty?: FacultyItem[];
  placeholder?: boolean;
}

export const COURSES: CourseContent[] = [
  // ===== 1-Year GS Foundation =====
  {
    id: '1_year_foundation',
    name: '1-Year GS Foundation Course',
    tag: 'Foundation',
    icon: 'fas fa-book-reader',
    summary: 'Complete GS preparation in 12 months',
    tagline: 'Build Your Foundation. Master the Strategy. Achieve Excellence.',
    meta: [
      { label: 'Duration', value: '12 Months' },
      { label: 'Total Hours', value: '1,100+ Hours' },
      { label: 'Mode', value: 'Offline / Live Online' },
      { label: 'Target Exam', value: 'UPSC CSE 2027' },
      { label: 'Fee', value: 'Rs. 1,49,000 + GST' },
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Our 1-Year General Studies (GS) Foundation Course is a meticulously structured, comprehensive program designed to transform serious aspirants into elite competitors. Over the course of 12 months, we bridge the gap between basic concepts and advanced administrative analytical skills, delivering a complete blueprint for success in both the Preliminary and Mains stages.',
      },
      { type: 'heading', text: 'Program Core Pillars' },
      {
        type: 'paragraph',
        text: 'Our pedagogy is built on structured learning, conceptual clarity, and continuous evaluation. Here is what makes our Foundation Program the definitive choice for your UPSC preparation:',
      },
      {
        type: 'list',
        items: [
          '<strong>1,100+ Hours of Structured Learning:</strong> A comprehensive, day-wise planned curriculum spanning 12 months, leaving no stone unturned across the vast UPSC CSE syllabus.',
          '<strong>Integrated Prelims & Mains Approach:</strong> We do not believe in compartmentalized learning. Our classes seamlessly blend foundational factual clarity (Prelims) with deep analytical and interdisciplinary insights (Mains).',
          '<strong>Advanced Pedagogy & Curriculum:</strong> Subjects are broken down logically from basic NCERT levels to advanced reference standards, ensuring that even students from non-humanities backgrounds build a rock-solid grasp.',
          '<strong>Dual Mode Flexibility:</strong> Attend Live Online or Offline classes based on your preference, with seamless, immediate access to high-quality post-class recordings for revision.',
        ],
      },
      { type: 'heading', text: 'Comprehensive Student Support Ecosystem' },
      {
        type: 'paragraph',
        text: 'Go beyond traditional lectures with an ecosystem designed to sustain your preparation momentum throughout the year.',
      },
      { type: 'subheading', text: '1. Mentorship & Expert Faculty Guidance' },
      {
        type: 'paragraph',
        text: 'Learn from a team of seasoned educators and subject-matter experts who understand the evolving pulse of the examination. Our dedicated mentorship network provides personalized academic guidance, tracking your progress and fine-tuning your strategy.',
      },
      { type: 'subheading', text: '2. Deep-Dive Skill Development' },
      {
        type: 'list',
        items: [
          '<strong>Dedicated Answer Writing & Essay Sessions:</strong> Learn the art of structural presentation, introduction-body-conclusion frameworks, and effective use of case studies, maps, and diagrams to maximize your Mains score.',
          '<strong>Exhaustive Current Affairs Coverage:</strong> Regular, approach-based current affairs sessions that seamlessly link contemporary national and international developments with the static core syllabus.',
          '<strong>Comprehensive Study Material:</strong> Access to well-researched, updated study material, precise crisp notes, and curated content designed to save you time and streamline your revision.',
        ],
      },
      { type: 'subheading', text: '3. Bureaucratic Insights' },
      {
        type: 'paragraph',
        text: '<strong>Interaction with Serving Civil Servants:</strong> Regular interactive sessions with serving IAS, IPS, and IFS officers. Gain firsthand insights into administrative realities, case studies, and the mindset required to clear the personality test.',
      },
      {
        type: 'paragraph',
        text: 'Take the First Step Toward Your Administrative Goals. Join our upcoming batch and experience a pedagogical shift that converts effort into ranks.',
      },
    ],
  },

  // ===== 2-Year GS Foundation =====
  {
    id: '2_year_foundation',
    name: '2-Year GS Foundation Programme',
    tag: 'Foundation',
    icon: 'fas fa-calendar-alt',
    summary: 'In-depth preparation with extended revision',
    tagline: 'Your Comprehensive Pathway to the UPSC CSE',
    meta: [
      { label: 'Duration', value: '2 Years' },
      { label: 'Total Hours', value: '1,100+ Hours (Year 1)' },
      { label: 'Mode', value: 'Offline / Live Online' },
      { label: 'Fee', value: 'Rs. 2,49,999/-' },
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Achieving success in the UPSC Civil Services Examination (CSE) demands more than just rote learning—it requires a profound understanding of concepts, consistent skill cultivation, and a highly strategic approach.',
      },
      {
        type: 'paragraph',
        text: 'Our meticulously designed 2-Year GS Foundation Programme bridges the gap between aspiring and achieving. By separating your preparation into two distinct, high-impact phases, we ensure you build an unbreakable conceptual foundation in Year 1 and transition into a high-performance, exam-ready competitive state in Year 2.',
      },
      { type: 'heading', text: 'Year 1: Building the Core (Conceptual Mastery)' },
      {
        type: 'paragraph',
        text: '<strong>Focus:</strong> Comprehensive Syllabus Coverage & Integrated Learning. The first year is entirely dedicated to mastering the vast UPSC syllabus from the ground up, ensuring you develop the analytical depth required for both stages of the exam.',
      },
      {
        type: 'list',
        items: [
          '<strong>1,100+ Hours of Structured Learning:</strong> Exhaustive, day-by-day planned coverage of the entire General Studies syllabus, leaving no stone unturned.',
          '<strong>Integrated Prelims & Mains Approach:</strong> Learn holistically. We connect factual clarity (for Prelims) with deep analytical perspectives (for Mains) right from day one.',
          '<strong>Advanced Pedagogy:</strong> Subject-wise structured curriculum delivered by expert faculty using modern teaching methodologies to make complex topics intuitive.',
          '<strong>Exhaustive Current Affairs:</strong> Comprehensive tracking and analysis of national and international events, seamlessly mapped back to your static syllabus.',
          '<strong>Premium Study Material:</strong> Access compiled, updated, and highly relevant study text and resources, eliminating the need to juggle multiple fragmented sources.',
          '<strong>Early-Stage Answer & Essay Writing:</strong> Begin your writing journey early with regular, guided sessions to overcome the fear of the blank page and master structured expression.',
          '<strong>Civil Servant Insights:</strong> Benefit from regular interactions and fireside chats with serving bureaucrats to understand ground realities and keep your motivation burning.',
          '<strong>Flexible Learning Modes:</strong> Attend classes physically at our state-of-the-art Offline Centers or join Live-Online Classes from anywhere, complete with 24/7 access to recorded sessions for easy revision.',
        ],
      },
      { type: 'heading', text: 'Year 2: The Finishing School (Exam Temperament & Strategy)' },
      {
        type: 'paragraph',
        text: '<strong>Focus:</strong> Advanced Practice, Mentorship & Performance Optimization. With the syllabus under your belt, Year 2 shifts gears toward intensive practice, speed, accuracy, and personalized course correction.',
      },
      {
        type: 'list',
        items: [
          '<strong>Advanced Personal Mentorship:</strong> Get paired with senior faculties who track your growth metrics, identify weak areas, and curate personalized study targets.',
          '<strong>Advanced Answer Writing Formats:</strong> Step up your Mains preparation with dedicated classes focused on speed, presentation, formatting, schema mapping, and data/quote enrichment.',
          '<strong>Weekly High-Yield Tests:</strong> Regular evaluations designed closely around changing UPSC trends to keep you accountable and continuously measure your retention.',
          '<strong>Simulated Comprehensive Schedules:</strong> Experience the grueling routine of the actual exam through end-to-end simulations of the Preliminary, Mains, and Personality Test conditions.',
          '<strong>Core Skill-Building:</strong> Targeted workshops focused on high-scoring elements like critical thinking, data interpretation, and optional subject alignment.',
          '<strong>The "Practice-Assess-Perform" Pedagogy:</strong> A continuous feedback loop where your tests are rigorously evaluated by experts, weaknesses are addressed, and performance is optimized week after week.',
        ],
      },
      { type: 'heading', text: 'Why a 2-Year Programme?' },
      {
        type: 'paragraph',
        text: 'UPSC preparation is a marathon, not a sprint. A single year often leaves aspirants rushed, forcing them to balance syllabus completion with mock tests simultaneously. This two-year structural split gives you the luxury of time to fully absorb concepts first, meaning you enter your exam year highly confident, thoroughly practiced, and completely ahead of the curve.',
      },
      {
        type: 'paragraph',
        text: 'Admissions Open for the New Batch. Secure your seat today and take your first definitive step toward realizing your dream of serving the nation.',
      },
    ],
  },

  // ===== 3-Year GS Foundation (placeholder) =====
  {
    id: '3_year_foundation',
    name: '3-Year GS Foundation Course',
    tag: 'Foundation',
    icon: 'fas fa-layer-group',
    summary: 'Build from basics to advanced mastery',
    placeholder: true,
    blocks: [
      { type: 'subheading', text: '1st Year — Building Strong Foundations' },
      {
        type: 'list',
        items: [
          'Focus on building a very strong foundation',
          'Special focus on NCERT books and selected ICSE books',
          'Classes conducted by core teachers',
          'Streamline students into the groove of READING – WRITING – THINKING',
          '3 days a week classes',
          'Sectional and Periodic tests',
          'Value addition booklets',
          'Introduction to reading of The Hindu',
          'Personality Development Classes',
          'Regular meeting with serving civil servants',
        ],
      },
      { type: 'subheading', text: '2nd Year — Complete Syllabus Coverage' },
      {
        type: 'list',
        items: [
          'Focus on completion of the syllabus',
          'Over 1100+ hours of structured learning covering every facet of UPSC CSE preparation in 12 months',
          'Integrated preparation of Prelims and Mains stages',
          'Subject wise structured curriculum and advance pedagogy',
          'Mentorship by experts',
          'Weekly Current Affairs Classes (Access to A-CAP)',
          "Backup of Missed Classes available on student's portal",
          'Weekly and Monthly Class Tests',
          'Comprehensive Study Material',
          'Dedicated Classes for Answer Writing',
          'Essay Writing classes',
        ],
      },
      { type: 'subheading', text: '3rd Year — Advanced Mentorship & Test Readiness' },
      {
        type: 'list',
        items: [
          'Focus on Advance Personal Mentorship',
          'Regular answer writing classes',
          'Weekly Test',
          'PMP (Prelims–Mains–Personality Test) schedule to simulate real UPSC',
          'Focus on skill building relevant for Prelims and Mains',
          'Core idea — PRACTICE–ACCESS–PERFORM',
          'Regular meeting with serving civil servants',
        ],
      },
    ],
  },

  // ===== APMC-1.0 (Advanced Answer Writing Program 1.0) =====
  {
    id: 'apmc_1_0',
    name: 'APMC-1.0 — Advanced Answer Writing Program',
    tag: 'Mentorship',
    icon: 'fas fa-user-graduate',
    summary: 'Advance Personal Mentorship Course',
    tagline: 'A structured, mentor-driven program designed to help UPSC aspirants transform knowledge into marks through continuous writing, review, and refinement.',
    blocks: [
      { type: 'heading', text: 'Why Choose This Program?' },
      {
        type: 'list',
        items: [
          'Direct Mentorship by Faculty',
          'One Student – One Mentor Approach',
          'Personalized Study Schedule & Targets',
          'Regular Performance Tracking & Reporting',
          'Daily Answer Writing Practice',
          'Detailed Evaluation & Improvement Feedback',
          'PYQ-Based Learning & Revision Techniques',
          'Subject-Wise and Paper-Wise Writing Sessions',
          'Prelims & Mains Integrated Test Series',
          'Current Affairs Enrichment for Mains Answers',
        ],
      },
      { type: 'heading', text: 'Program Highlights' },
      {
        type: 'checklist',
        items: [
          'Write – Review – Refine Methodology',
          'Individual Mentorship & Accountability',
          'Customized Targets for Every Student',
          'Answer Writing Group Activities',
          'Special PYQ Exploration Sessions',
          '1-Page Consolidation Notes for Revision',
          'Revision-Focused Preparation (8–10 Revisions)',
          'Current Affairs Magazine & Value Addition Content',
          'Regular Mains Test Series',
          'Performance Monitoring & Progress Reports',
        ],
      },
      { type: 'heading', text: 'Our Approach' },
      {
        type: 'paragraph',
        text: 'We believe answer writing is not a one-time activity but a continuous process of writing, reviewing, refining, and revising. Through personal mentorship, structured targets, and regular evaluation, students learn to improve content quality, presentation, analytical depth, and time management.',
      },
      { type: 'heading', text: 'Outcome' },
      {
        type: 'paragraph',
        text: 'By the end of the program, students develop the ability to write structured, analytical, and examination-ready answers while maintaining consistency, accountability, and revision discipline throughout their UPSC journey.',
      },
    ],
  },

  // ===== APMC-2.0 (Advanced UPSC Mentorship Program 2.0) =====
  {
    id: 'apmc_2_0',
    name: 'APMC-2.0 — Advanced UPSC Mentorship Program',
    tag: 'Mentorship',
    icon: 'fas fa-users',
    summary: 'Advance Personal Mentorship Course',
    tagline: 'A comprehensive mentorship-driven program designed to provide personalized guidance, continuous evaluation, structured revision, and complete support for both Prelims and Mains.',
    blocks: [
      { type: 'heading', text: 'Why Choose This Program?' },
      {
        type: 'list',
        items: [
          'Direct Mentorship by Expert Faculty',
          'One Student – One Mentor Model',
          'Personalized Study Plans & Weekly Targets',
          'Continuous Progress Tracking & Performance Reports',
          '1-Page Revision Notes for Faster Consolidation',
          'Prelims & Mains Integrated Test Series',
          'Revision-Centric Preparation with 8–10 Cycles',
          'Regular Subject-Wise & Paper-Wise Answer Writing',
          'Dedicated Weekly Current Affairs Program (A-CAP)',
          'Access to Advanced Mains Guidance Program (A-MGP)',
          'Integrated Essay Preparation Support',
          'Prelims Rescue Program (PRP) with CSAT Support',
          'PYQ Exploration Sessions for Smart Revision',
          'Special Prelims Skill-Building Workshops',
        ],
      },
      { type: 'heading', text: 'Program Highlights' },
      {
        type: 'checklist',
        items: [
          'Personalized Mentorship & Accountability',
          'Individual Study Schedule & Target Setting',
          'Weekly Performance Review & Reporting',
          'Daily Revision and Consolidation Techniques',
          'Current Affairs Handouts & Value Addition Material',
          'Answer Writing Practice with Faculty Feedback',
          'PYQ-Based Learning Strategy',
          'Prelims + Mains Integrated Preparation',
          'Essay Enhancement Sessions',
          'CSAT & Prelims Rescue Support',
          'Group Activities & Peer Learning Sessions',
          'Structured Path from Preparation to Selection',
        ],
      },
      { type: 'heading', text: 'Our Mentorship Philosophy' },
      {
        type: 'paragraph',
        text: 'Success in UPSC requires more than classroom teaching. Through personalized mentoring, continuous monitoring, structured revision, and regular assessment, we help students stay disciplined, accountable, and exam-ready throughout their preparation journey.',
      },
    ],
  },

  // ===== CSAT (CSAT Mastery Program) =====
  {
    id: 'csat',
    name: 'CSAT Mastery Program',
    tag: 'CSAT',
    icon: 'fas fa-brain',
    summary: 'Comprehensive CSAT preparation for UPSC Prelims',
    blocks: [
      {
        type: 'paragraph',
        text: 'CSAT has become a decisive factor in clearing the UPSC Preliminary Examination. Many aspirants with strong General Studies preparation fail to qualify due to inadequate practice, poor time management, and lack of conceptual clarity in CSAT.',
      },
      {
        type: 'paragraph',
        text: 'At Mentora IAS, our CSAT Mastery Program is designed to help aspirants build confidence, accuracy, and problem-solving speed through a structured and practice-oriented approach. Whether you come from an engineering, science, commerce, humanities, or non-mathematical background, the programme provides the guidance and strategy required to comfortably clear the CSAT paper.',
      },
      { type: 'heading', text: 'Programme Highlights' },
      {
        type: 'checklist',
        items: [
          'Quantitative Aptitude',
          'Logical Reasoning & Analytical Ability',
          'Data Interpretation & Data Sufficiency',
          'Decision Making & Problem Solving',
          'Reading Comprehension Techniques',
          'CSAT Previous Year Question Analysis',
          'Topic-Wise Practice Sheets',
          'Full-Length CSAT Mock Tests',
          'Speed & Accuracy Enhancement Sessions',
          'Personalized Doubt Resolution',
          'Performance Monitoring & Mentorship',
          'Classroom & Live Online Learning Options',
        ],
      },
      { type: 'heading', text: 'Our Approach' },
      {
        type: 'paragraph',
        text: 'The programme focuses on building conceptual clarity first, followed by extensive practice and examination-oriented problem solving. Students learn how to identify question patterns, eliminate wrong options, manage time effectively, and maximize scores under examination conditions.',
      },
      { type: 'heading', text: 'Building Confidence for Prelims' },
      {
        type: 'paragraph',
        text: 'CSAT should never be a hurdle in your UPSC journey. Through systematic preparation, regular testing, targeted mentoring, and continuous practice, we help aspirants develop the confidence and competence required to comfortably qualify the CSAT paper and focus on securing a strong overall Prelims performance.',
      },
    ],
  },

  // ===== PSIR =====
  {
    id: 'psir',
    name: 'PSIR — Political Science & International Relations',
    tag: 'Optional',
    icon: 'fas fa-landmark',
    summary: 'Political Science & International Relations optional',
    tagline: 'A highly popular UPSC optional with strong overlap with GS, Essay, and the Personality Test.',
    meta: [
      { label: 'Fee', value: 'Rs. 35,000/-' },
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Political Science & International Relations (PSIR) is a highly popular UPSC optional subject, offering strong overlap with General Studies, Essay, and the Personality Test. It provides a comprehensive understanding of governance, public policy, constitutional institutions, and international affairs while developing the analytical skills essential for civil services.',
      },
      {
        type: 'paragraph',
        text: 'At Mentora IAS, our PSIR Optional Programme combines conceptual clarity, current affairs integration, and focused answer-writing practice. Through a structured and exam-oriented approach, students learn to connect political theory, governance, and global developments with UPSC requirements, building the perspective needed to excel in the examination.',
      },
      { type: 'heading', text: 'Why Choose Mentora IAS for PSIR Optional?' },
      {
        type: 'list',
        items: [
          '<strong>Structured Learning Path</strong> – From core political theory to advanced topics in governance, comparative politics, and international relations.',
          '<strong>Current Affairs Integration</strong> – Connect political developments, policy decisions, and global events with the PSIR syllabus.',
          '<strong>Analytical Approach</strong> – Develop critical thinking and multidimensional answer-writing skills beyond rote learning.',
          '<strong>Conceptual Clarity</strong> – Simplified understanding of political thinkers, theories, and complex concepts.',
          '<strong>UPSC-Oriented Preparation</strong> – Focused coverage aligned with recent trends and examination requirements.',
          '<strong>Interactive Learning</strong> – Regular discussions, debates, and doubt-solving sessions with faculty.',
          '<strong>Theory to Practice</strong> – Link political concepts with governance, public policy, and constitutional realities.',
          '<strong>Contemporary International Relations</strong> – In-depth understanding of diplomacy, strategic affairs, and global politics.',
          '<strong>Integrated Answer Writing</strong> – Continuous practice to improve structure, analysis, and presentation.',
          '<strong>Comprehensive Study Material</strong> – Curated notes, handouts, value-added content, and revision resources.',
        ],
      },
      { type: 'heading', text: 'Programme Highlights' },
      {
        type: 'checklist',
        items: [
          'Complete Coverage of PSIR Paper I & II',
          'Political Thinkers, Ideologies & Theories',
          'Indian & Western Political Thought',
          'Constitution, Governance & Public Policy',
          'International Relations & Strategic Affairs',
          'Current Affairs Integrated Preparation',
          'Regular Answer Writing & PYQ Analysis',
          'Structured Revision & Value-Added Notes',
          'Classroom & Live Online Learning Options',
          'Dedicated Mentorship Throughout Preparation',
        ],
      },
      { type: 'heading', text: 'Understanding the PSIR Optional Syllabus' },
      {
        type: 'paragraph',
        text: 'The Political Science & International Relations (PSIR) Optional syllabus is divided into two papers, covering political theories, governance, constitutional systems, and contemporary international relations.',
      },
      { type: 'subheading', text: 'PSIR Paper I' },
      {
        type: 'paragraph',
        text: 'Paper I focuses on Political Thought, Polity and Constitution, Political Institutions and Political Process. Key areas include:',
      },
      {
        type: 'list',
        items: [
          'Political Theory and Political Thought',
          'Concepts of Justice, Equality, Rights, Liberty, and Democracy',
          'Western Political Thinkers and Ideologies',
          'Indian Political Thought',
          'Comparative Politics and Political Analysis',
          'Indian Government and Politics',
          'Constitution, Parliament, Judiciary, and Federalism',
          'Governance, Public Policy, and Public Administration',
          'Political Processes and Social Movements',
          'Contemporary Issues in Indian Politics',
        ],
      },
      { type: 'subheading', text: 'PSIR Paper II' },
      {
        type: 'paragraph',
        text: "Paper II focuses on International Relations and India's engagement with the global political order, covering both theoretical and contemporary dimensions. Key areas include:",
      },
      {
        type: 'list',
        items: [
          'Comparative Politics',
          'International Organizations and Global Governance',
          'Globalization and International Political Economy',
          "India's Foreign Policy",
          "India's Relations with Major Powers and Neighbours",
          'Regional Organizations and Strategic Partnerships',
          'International Security and Strategic Studies',
          'Global Issues and Emerging Challenges',
          'Diplomacy, Geopolitics, and Foreign Policy Analysis',
          'Contemporary International Developments',
        ],
      },
      { type: 'heading', text: 'Building the Perspective Required for UPSC' },
      {
        type: 'paragraph',
        text: 'Success in PSIR Optional requires more than factual knowledge—it demands a balanced, analytical, and solution-oriented understanding of political and international issues. At Mentora IAS, students learn to interpret governance through constitutional and public policy frameworks while analyzing global developments through strategic and diplomatic perspectives. This approach strengthens performance in PSIR Optional and significantly enhances preparation for General Studies, Essay, and the UPSC Personality Test.',
      },
    ],
    faculty: [
      {
        name: 'Rajeev Chauhan',
        detail: 'Co-founder and Director · Ex-faculty at DRISHTI IAS · 12+ years of experience · Mains: 06 · Interviews: 04',
        links: [
          { label: 'Orientation Class', url: 'https://www.youtube.com/live/9W7Jt_CPhKY' },
          { label: 'Demo Class', url: 'https://www.youtube.com/live/uomr2d5EWQU' },
        ],
      },
    ],
  },

  // ===== Kannada Literature =====
  {
    id: 'kannada_literature',
    name: 'Kannada Literature — UPSC Optional',
    tag: 'Optional',
    icon: 'fas fa-language',
    summary: 'Kannada Literature optional for UPSC Mains',
    tagline: 'A popular and rewarding optional with a well-defined syllabus, rich literary heritage, and excellent scoring potential.',
    meta: [
      { label: 'Fee', value: 'Rs. 30,000/-' },
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Kannada Literature is a popular and rewarding UPSC optional for aspirants with a strong foundation in the Kannada language. With a well-defined syllabus, rich literary heritage, and excellent scoring potential, it offers a unique advantage in the Civil Services Examination.',
      },
      {
        type: 'paragraph',
        text: "The subject provides deep insights into Karnataka's literary, cultural, and intellectual traditions while developing critical analysis and effective answer-writing skills. At Mentora IAS, our Kannada Literature Optional Programme combines comprehensive syllabus coverage, conceptual clarity, and exam-oriented preparation to help aspirants excel in UPSC Mains with confidence.",
      },
      { type: 'heading', text: 'Why Choose Mentora IAS for Kannada Literature Optional?' },
      {
        type: 'list',
        items: [
          '<strong>Complete Syllabus Coverage</strong> – Structured coverage of Kannada Literature Paper I & II.',
          '<strong>In-Depth Text Analysis</strong> – Detailed study of prescribed texts, themes, authors, and literary movements.',
          '<strong>Strong Analytical Focus</strong> – Develop critical interpretation and literary appreciation skills.',
          '<strong>Simplified Literary Criticism</strong> – Easy-to-understand approach to aesthetics, criticism, and literary theories.',
          '<strong>UPSC-Oriented Preparation</strong> – Integrated PYQ analysis, answer-writing techniques, and exam-focused teaching.',
          '<strong>Cultural & Historical Context</strong> – Understand the literary, social, and cultural foundations of Kannada literature.',
          '<strong>Language & Expression Enhancement</strong> – Improve clarity, coherence, and quality of written Kannada answers.',
          '<strong>Regular Answer Writing Practice</strong> – Build speed, structure, and effective presentation skills.',
          '<strong>Comprehensive Study Material</strong> – Concise notes, text summaries, literary analyses, and revision resources.',
          '<strong>Dedicated Mentorship</strong> – Continuous academic support, doubt resolution, and personalized guidance.',
        ],
      },
      { type: 'heading', text: 'Programme Highlights' },
      {
        type: 'checklist',
        items: [
          'Complete Coverage of Paper I & II',
          'Classical, Medieval & Modern Kannada Literature',
          'Prescribed Texts, Authors & Literary Movements',
          'Literary Criticism & Aesthetics Made Simple',
          'Regular Answer Writing & Evaluation',
          'Integrated Previous Year Question Analysis',
          'Structured Revision & Value-Added Notes',
          'Mentorship and Academic Support',
          'Classroom & Live Online Learning Options',
        ],
      },
      { type: 'heading', text: 'Understanding the Kannada Literature Optional Syllabus' },
      {
        type: 'paragraph',
        text: 'The Kannada Literature Optional syllabus is divided into two papers, covering the evolution of Kannada language and literature, literary criticism, and the study of classical and modern literary works.',
      },
      { type: 'subheading', text: 'Kannada Literature Paper I' },
      {
        type: 'paragraph',
        text: 'Paper I focuses on the history, development, and critical understanding of Kannada literature, providing a strong foundation in literary traditions and literary thought. Key areas include:',
      },
      {
        type: 'list',
        items: [
          'History and Development of Kannada Language',
          'Evolution of Kannada Literature',
          'Classical, Medieval, and Modern Literary Traditions',
          'Kannada Grammar and Linguistic Features',
          'Literary Criticism and Aesthetics',
          'Major Literary Movements and Trends',
          'Contributions of Prominent Kannada Writers',
          'Literary Forms: Poetry, Prose, Drama, and Folk Literature',
          'Cultural and Historical Influences on Kannada Literature',
        ],
      },
      { type: 'subheading', text: 'Kannada Literature Paper II' },
      {
        type: 'paragraph',
        text: 'Paper II focuses on the detailed study and interpretation of prescribed literary texts from different periods of Kannada literature. Key areas include:',
      },
      {
        type: 'list',
        items: [
          'Prescribed Classical and Modern Texts',
          'Poetry, Drama, Novels, and Prose Works',
          'Thematic and Character Analysis',
          'Literary Style and Narrative Techniques',
          'Socio-Cultural Context of Literary Works',
          'Critical Appreciation and Interpretation',
          'Comparative Literary Perspectives',
          'Contributions of Major Authors and Poets',
          'Contemporary Relevance of Literary Themes',
        ],
      },
      { type: 'heading', text: 'Building Literary Insight for UPSC Success' },
      {
        type: 'paragraph',
        text: 'Success in Kannada Literature Optional requires more than knowledge of texts and authors—it demands the ability to critically interpret literature within its social, cultural, and historical context. At Mentora IAS, students are trained to develop analytical thinking, literary appreciation, and effective answer-writing skills that align with UPSC expectations.',
      },
    ],
    faculty: [
      {
        name: 'Dr. Rakesh E.S',
        detail: '15+ years of experience · Ex-Faculty, Sriram IAS, Delhi',
        links: [
          { label: 'Orientation Class', url: 'https://www.youtube.com/live/B61yJEY5cjM' },
          { label: 'Demo Class', url: 'https://www.youtube.com/live/ESJG4Wis56o' },
        ],
      },
    ],
  },

  // ===== Anthropology Optional =====
  {
    id: 'anthropology',
    name: 'Anthropology Optional Subject for UPSC CSE',
    tag: 'Optional',
    icon: 'fas fa-people-group',
    summary: 'Anthropology optional for UPSC Mains',
    meta: [
      { label: 'Fee', value: 'Rs. 30,000/-' },
      { label: 'Faculty', value: 'Anusha PC' },
      { label: 'Mode', value: 'Classroom / Live Online' },
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Anthropology is one of the most popular UPSC optional subjects, known for its concise syllabus, scoring potential, and strong overlap with General Studies, Essay, and Interview preparation. It provides valuable insights into human evolution, society, culture, tribal issues, and contemporary social change.',
      },
      {
        type: 'paragraph',
        text: 'At Mentora IAS, our Anthropology Optional Programme focuses on building conceptual clarity, analytical thinking, and answer-writing skills through a structured, exam-oriented approach. With simplified explanations, contemporary examples, and UPSC-aligned preparation, we help students confidently master the subject and maximize their performance in the Civil Services Examination.',
      },
      { type: 'heading', text: 'Why Choose Mentora IAS for Anthropology Optional?' },
      {
        type: 'list',
        items: [
          '<strong>Complete Syllabus Coverage</strong> – Comprehensive coverage of Anthropology Paper I & II with a structured learning approach.',
          '<strong>Conceptual Clarity</strong> – Simplified teaching methodology that makes complex theories and concepts easy to understand.',
          '<strong>UPSC-Focused Preparation</strong> – Lectures designed around UPSC trends, PYQs, and evolving question patterns.',
          '<strong>Current Affairs Integration</strong> – Link anthropological concepts with contemporary issues and real-world developments.',
          '<strong>Interactive Learning</strong> – Engaging classroom discussions, active participation, and instant doubt resolution.',
          '<strong>Integrated Answer Writing</strong> – Regular practice to improve structure, application, and scoring potential.',
          '<strong>Application-Based Learning</strong> – Extensive use of examples, tribal case studies, and contemporary illustrations.',
          '<strong>Comprehensive Study Material</strong> – Concise, updated, and exam-oriented notes for effective preparation and revision.',
          '<strong>Flexible Learning Modes</strong> – Available in both Classroom and Live Online formats.',
          '<strong>Dedicated Mentorship</strong> – Continuous academic guidance and personalized support throughout preparation.',
        ],
      },
      { type: 'heading', text: 'Programme Highlights' },
      {
        type: 'checklist',
        items: [
          'Complete Coverage of Anthropology Paper I & II',
          'Anthropological Theories, Thinkers & Concepts',
          'Integrated Previous Year Question Analysis',
          'Regular Answer Writing Practice & Evaluation',
          'Physical, Biological & Social Anthropology Made Simple',
          'Case Studies and Contemporary Examples',
          'Structured Revision Support',
          'Mentorship and Personalized Guidance',
        ],
      },
      { type: 'heading', text: 'Understanding the Anthropology Optional Syllabus' },
      {
        type: 'paragraph',
        text: 'The Anthropology Optional syllabus is divided into two papers, covering the scientific, social, and cultural dimensions of human life and society.',
      },
      { type: 'subheading', text: 'Anthropology Paper I' },
      {
        type: 'paragraph',
        text: 'Paper I focuses on the fundamental concepts and theories of Anthropology, providing a strong foundation in understanding human evolution, biological diversity, and socio-cultural systems.',
      },
      {
        type: 'list',
        items: [
          'Meaning, Scope, and Development of Anthropology',
          'Physical & Biological Anthropology',
          'Human Evolution and Genetics',
          'Primatology and Human Variation',
          'Archaeological Anthropology',
          'Social and Cultural Anthropology',
          'Marriage, Family, Kinship, and Religion',
          'Economic and Political Organization',
          'Anthropological Theories and Thinkers',
          'Research Methods and Fieldwork',
        ],
      },
      {
        type: 'paragraph',
        text: 'This paper builds the conceptual and scientific foundation required to understand human evolution, culture, and social organization.',
      },
      { type: 'subheading', text: 'Anthropology Paper II' },
      {
        type: 'paragraph',
        text: 'Paper II applies anthropological concepts to the Indian context, focusing on society, culture, tribal communities, and contemporary developmental issues.',
      },
      {
        type: 'list',
        items: [
          'Evolution of Indian Culture and Civilization',
          'Indian Social System and Cultural Diversity',
          'Tribal Communities in India',
          'Problems of Tribal Development',
          'Caste, Religion, and Social Change',
          'Rural and Urban Anthropology',
          'Anthropology of Development',
          'Tribal Policies and Constitutional Safeguards',
          'Impact of Globalization and Modernization',
          'Contemporary Issues in Indian Society',
        ],
      },
      {
        type: 'paragraph',
        text: 'This paper helps students understand how anthropological perspectives can be applied to governance, development, social policy, and contemporary challenges in India.',
      },
      { type: 'heading', text: 'Building the Perspective Required for UPSC' },
      {
        type: 'paragraph',
        text: 'Success in Anthropology Optional requires more than mastering theories and concepts—it demands the ability to apply anthropological perspectives to contemporary social issues, tribal development, public policy, and human diversity. At Mentora IAS, students are trained to connect static syllabus topics with current affairs, case studies, and real-world examples, enabling them to develop analytical, balanced, and application-oriented answers. This approach not only strengthens Anthropology Optional preparation but also enhances performance in General Studies, Essay, and the UPSC Personality Test.',
      },
    ],
    faculty: [
      {
        name: 'Anusha PC',
        detail: '6+ years of teaching experience in Delhi and Bangalore',
        links: [
          { label: 'Orientation Class', url: 'https://drive.google.com/file/d/1lPTF_sYz5hxQOctivnAl3haiG0ff7xb7/view?usp=drive_link' },
          { label: 'Demo Class 1', url: 'https://drive.google.com/file/d/1ekKQiPOOfMrlXAK75E5o9NSWds8iMk-4/view?usp=drive_link' },
          { label: 'Demo Class 2', url: 'https://drive.google.com/file/d/1nLcaxDc33WvsQyUEKxvbsURm5rORWUqZ/view?usp=drive_link' },
        ],
      },
    ],
  },

  // ===== Advanced Mains Program (AMP) =====
  {
    id: 'gold_standard',
    name: 'Advanced Mains Program (AMP)',
    tag: 'Advanced',
    icon: 'fas fa-award',
    summary: 'Advanced Mains Programme — target 450+ in GS Mains',
    tagline: 'Prepare the Mains stage before Prelims — the toppers’ strategy.',
    meta: [
      { label: 'Duration', value: '4 Months · Daily 2 Hours' },
      { label: 'Total Hours', value: '200+ Hours' },
      { label: 'Tests', value: '16 Sectional + 4 Full-Length' },
      { label: 'Mode', value: 'Offline / Online (Live + Recordings)' },
    ],
    blocks: [
      {
        type: 'paragraph',
        text: 'Why must UPSC preparation include comprehensive preparation of the Mains stage before the Preliminary stage? Approaching the UPSC examination as divided into separate domains is one of the most common mistakes committed by aspirants during their preparation phase. Although the Preliminary stage is conducted before the Mains stage, any serious preparation must begin with a rigorous preparation of the Mains examination, for the following reasons:',
      },
      { type: 'subheading', text: '1. The Core Syllabus Overlap (~60-70%)' },
      {
        type: 'paragraph',
        text: 'A critical look at the UPSC syllabus reveals that Prelims and Mains are not two different exams; they are two different testing methods of the same core knowledge base. Subjects like Indian Polity, Modern History, Economy, Geography, and Environment form the bedrock of both stages. When you study a topic from a Mains perspective, you look at the Why and the How (the causes, consequences, and policy implications). Gathering this deep conceptual depth automatically absorbs the What and the When (the facts and figures) required to crack complex, elimination-based Prelims MCQs. Trying to do the reverse—learning isolated facts first—makes it incredibly difficult to stitch them into a coherent analysis later.',
      },
      { type: 'subheading', text: '2. The Brutal Post-Prelims Timeline' },
      {
        type: 'paragraph',
        text: 'The window between the Preliminary exam and the Mains exam is typically around 90 to 100 days. This is structurally insufficient time to build answer-writing skills from scratch. If an aspirant waits for the Prelims results to begin Mains preparation, they are forced to simultaneously cover the Optional Subject (two papers, equivalent to a university honors level), GS Paper IV (Ethics, Integrity, and Aptitude), Essay Writing, and Answer Writing Practice. By completing the core Mains syllabus and building foundational writing habits before shifting focus exclusively to Prelims, the post-Prelims window can be strictly utilized for intensive revision, current affairs integration, and full-length mock tests.',
      },
      { type: 'subheading', text: '3. Shifting from Rote Memorization to Analytical Depth' },
      {
        type: 'paragraph',
        text: 'The nature of Prelims questions has evolved significantly. UPSC has increasingly moved away from straightforward factual recall to conceptual, application-based questions. When you possess that higher-level analytical clarity, your capacity for intelligent elimination in the Prelims hall increases exponentially. You understand how the system works, which helps you spot flawed logic in incorrect MCQ options.',
      },
      { type: 'subheading', text: '4. Rank and Final Selection are Determined by Mains' },
      {
        type: 'paragraph',
        text: 'The Preliminary exam is purely a qualifying filter; your score there does not contribute a single mark to the final merit list. The actual battle for a rank in the civil services is fought across the 1750 marks of the written Mains stage. True exam readiness means preparing for the final destination from day one.',
      },
      { type: 'heading', text: 'Features of the Programme' },
      {
        type: 'list',
        items: [
          'More than 200 hours of intense classroom programme',
          'Advanced study material for each point of the UPSC syllabus',
          '16 sectional tests and 4 full-length tests',
          'Rigorous brainstorming sessions to unlock the science of answer writing',
          'Strong emphasis on interlinkage among subjects and integration of Current Affairs',
          'Personal mentorship by the faculties themselves',
          'Time duration: 4 months, daily 2 hours class',
          'Mode of delivery: Offline and Online (Live Class and Recordings)',
        ],
      },
      { type: 'heading', text: 'How Does This Programme Benefit the Aspirants?' },
      { type: 'subheading', text: 'Reinforce Your Foundations' },
      {
        type: 'paragraph',
        text: 'This programme offers a quick revision of all subjects, including those (like Indian Society, International Relations, Internal Security) which are often deferred by students for later in the preparation phase. The programme is designed to address the knowledge deficit about these subjects, while brushing up the basics.',
      },
      { type: 'subheading', text: 'Answer Writing, from Scratch' },
      {
        type: 'paragraph',
        text: 'A major hurdle faced by UPSC aspirants, both fresh and veteran alike, is writing descriptive answers for the Mains stage. This programme addresses the core issues of answer writing:',
      },
      {
        type: 'list',
        items: [
          '<strong>Decoding the question:</strong> under expert faculty guidance, aspirants are given two questions to write daily at the end of class, followed by a detailed discussion the next day.',
          '<strong>Bridging the gap of terminology:</strong> a step-by-step approach to the choice and economy of words within the word, spatial, and time limits of the examination, gradually building the skill to write impressive answers.',
          '<strong>Structuring the answer:</strong> blending concept building with answer writing to help students approach the various directive words/phrases given in a question.',
        ],
      },
      { type: 'subheading', text: 'Linking Current Affairs with the Concepts' },
      {
        type: 'paragraph',
        text: 'A major highlight is the attention given to linking Current Affairs with every section of the syllabus and showing students how to use various examples in different settings. The objective is to completely eliminate the perceived fear of covering and using Current Affairs.',
      },
      { type: 'subheading', text: 'Time Management' },
      {
        type: 'paragraph',
        text: 'The cornerstone of this programme is to ensure students develop the art of writing all answers within the allowed time in the UPSC Mains examination, and subsequently maximize their score, through daily answer writing practice and weekly simulated answer writing tests.',
      },
      { type: 'heading', text: 'Structure of the Programme' },
      {
        type: 'list',
        items: [
          'Redesign the syllabus based on previous year trends and degree of importance',
          'In-depth discussion of each topic in the classroom',
          'Classroom-based brainstorming sessions',
          'Daily questions for practice',
          'Weekly test',
          'Personal mentorship for answer enrichment by faculties',
        ],
      },
    ],
    faculty: [
      { name: 'Rajeev Chauhan Sir', detail: 'Team Mentora' },
      { name: 'Chiranth Rajashekhar Sir', detail: 'Team Mentora' },
      { name: 'Sonali Mehra Madam', detail: 'Team Mentora' },
      { name: 'Anusha PC Madam', detail: 'Team Mentora' },
      { name: 'Safir Sadique Sir', detail: 'Team Mentora' },
    ],
  },

  // ===== Daily Answer Writing Programme =====
  {
    id: 'daily_answer_writing',
    name: 'Daily Answer Writing Programme',
    tag: 'Practice',
    icon: 'fas fa-pen-fancy',
    summary: 'Classroom-based answer writing towards topper-level answers',
    tagline: 'Transform Knowledge into Ranks.',
    blocks: [
      { type: 'heading', text: 'Why Answer Writing?' },
      {
        type: 'paragraph',
        text: 'Many aspirants spend 90% of their time accumulating knowledge, but the UPSC Civil Services Mains exam does not reward just what you know—it rewards what you can produce on paper under intense pressure.',
      },
      {
        type: 'list',
        items: [
          'In the actual exam, you have roughly 7 to 11 minutes per question to read, analyze, recall, structure, and write a coherent, 150-to-250-word answer. Without muscle memory, brilliant knowledge fails to translate into marks.',
          'You are competing with lakhs of students reading the same newspapers and standard textbooks. The differentiator is expression. Answer writing bridges the gap between being a well-read aspirant and a selected officer.',
          'Writing an answer forces your brain to actively recall information. It highlights the gaps in your preparation like nothing else—showing you exactly what you thought you understood but couldn’t explain.',
        ],
      },
      { type: 'heading', text: 'The Best Technique to Evolve Your Answer Writing Skills' },
      {
        type: 'paragraph',
        text: 'True proficiency in answer writing does not happen by writing 3-hour mock tests from day one. It is an evolutionary process built on the Micro-Habit Approach and The 4-Pillar Technique:',
      },
      { type: 'subheading', text: 'Pillar 1: Anatomy Decoupling (Deconstructing the Demand)' },
      {
        type: 'paragraph',
        text: 'Before putting pen to paper, you must learn to split a question into its core directive words (Discuss, Critically Analyze, Evaluate, Elucidate) and identify the hidden sub-parts of the prompt.',
      },
      { type: 'subheading', text: 'Pillar 2: The Three-Act Structure (Intro-Body-Conclusion)' },
      {
        type: 'list',
        items: [
          '<strong>Introduction:</strong> Striking a balance using data, constitutional articles, or current context.',
          '<strong>Body:</strong> Transitioning from paragraphs to multi-dimensional, bulleted points covering GS dimensions (Political, Economic, Social, Environmental, etc.).',
          '<strong>Conclusion:</strong> Moving away from summary toward a forward-looking, pragmatic administrative solution.',
        ],
      },
      { type: 'subheading', text: 'Pillar 3: Visual Anchoring' },
      {
        type: 'paragraph',
        text: 'Injecting value-adders like schematic diagrams, flowcharts, maps, and hub-and-spoke models that allow an evaluator to understand your core argument in a 3-second glance.',
      },
      { type: 'subheading', text: 'Pillar 4: Incremental Consistency' },
      {
        type: 'paragraph',
        text: 'Writing just 1 to 2 answers daily. It is far more effective to write 2 answers a day for 60 days than to write 20 answers in a single weekend. Consistent, deliberate practice builds permanent muscle memory.',
      },
      { type: 'heading', text: 'How This Programme Will Help You' },
      {
        type: 'list',
        items: [
          '<strong>Micro-Scheduled Syllabus Coverage:</strong> We break down the massive GS 1, 2, 3, and 4 syllabus into daily, bite-sized topics. By following the schedule, you naturally complete your syllabus revision alongside writing practice.',
          '<strong>Strict Quality Evaluation Frameworks:</strong> Your answers are evaluated on presentation, structural flow, and command of terminology. You receive actionable feedback on how to improve your score by 1–2 marks per question.',
          '<strong>High-Yield Model Answers:</strong> Every question is accompanied by a comprehensive model answer template—blueprint solutions illustrating ideal structures, relevant data points, committees, and case studies.',
        ],
      },
      {
        type: 'paragraph',
        text: '<strong>The Mains Mantra:</strong> You do not write fast because you have a fast pen; you write fast because your thoughts are structured before you pick it up. Let’s start structuring your success today.',
      },
    ],
  },
];

export function getCourse(id: string | null): CourseContent | undefined {
  if (!id) return undefined;
  return COURSES.find((c) => c.id === id);
}
