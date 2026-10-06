const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Comprehensive Exam Data Dictionary covering all recruitment families
const EXAM_DATA_CATALOG = {
  // SSC Exams
  SSC_CGL: {
    selectionProcessSummary: "The SSC CGL selection process comprises a two-tier Computer Based Examination (CBE) followed by Document Verification and Medical Check. Tier-1 serves as a qualifying screening test to shortlist candidates for Tier-2. Final merit is prepared strictly on the basis of aggregate marks scored by candidates in Tier-2 Examination (Section-I & Section-II of Paper-I). Candidates must also qualify the Computer Knowledge Test and Data Entry Speed Test (DEST).",
    syllabusSummary: "Tier-1 covers General Intelligence & Reasoning, General Awareness, Quantitative Aptitude, and English Comprehension. Tier-2 covers Mathematical Abilities, Reasoning & General Intelligence, English Language & Comprehension, General Awareness, Computer Knowledge Module, and Data Entry Speed Test.",
    examPattern: [
      {
        section: "General Intelligence and Reasoning (Tier-1)",
        questions: 25,
        marks: 50,
        duration: "60 minutes (Composite)",
        negativeMarking: "0.50 marks per incorrect response",
        topics: [
          "Semantic & Symbolic Analogies",
          "Venn Diagrams & Figural Classification",
          "Number & Letter Series",
          "Coding-Decoding & Blood Relations",
          "Space Visualization & Semantic Classification",
          "Critical Thinking, Emotional & Social Intelligence",
          "Syllogisms & Statement-Conclusion",
          "Paper Folding, Cutting & Embedded Figures"
        ]
      },
      {
        section: "General Awareness (Tier-1)",
        questions: 25,
        marks: 50,
        duration: "60 minutes (Composite)",
        negativeMarking: "0.50 marks per incorrect response",
        topics: [
          "Ancient, Medieval & Modern Indian History",
          "Indian Polity & Constitution (Articles, Amendments, Rights)",
          "Physical & Human Geography of India and World",
          "Indian Economy, Budget, Five-Year Plans & Monetary Policy",
          "General Science (Physics, Chemistry, Biology up to 10th standard)",
          "National & International Current Affairs (Last 8-12 Months)",
          "Scientific Research, Awards, Books & Authors, Sports"
        ]
      },
      {
        section: "Quantitative Aptitude (Tier-1)",
        questions: 25,
        marks: 50,
        duration: "60 minutes (Composite)",
        negativeMarking: "0.50 marks per incorrect response",
        topics: [
          "Number Systems (Decimals, Fractions, LCM, HCF)",
          "Percentages, Ratio & Proportion, Square Roots",
          "Averages, Simple & Compound Interest",
          "Profit and Loss, Discount, Partnership Business",
          "Time and Distance, Time and Work",
          "Basic Algebraic Identities & Elementary Surds",
          "Triangles, Circles, Tangents, Quadrilaterals & Polygons",
          "Right Prism, Cone, Cylinder, Sphere & Hemispheres",
          "Trigonometric Ratios, Standard Angles & Heights and Distances",
          "Histograms, Frequency Polygons, Bar Diagrams & Pie Charts"
        ]
      },
      {
        section: "English Comprehension (Tier-1)",
        questions: 25,
        marks: 50,
        duration: "60 minutes (Composite)",
        negativeMarking: "0.50 marks per incorrect response",
        topics: [
          "Reading Comprehension (Passages & Inferential Questions)",
          "Spotting the Error in Sentences",
          "Fill in the Blanks (Prepositions, Articles, Tenses)",
          "Synonyms, Antonyms, Homonyms & Spelling Detection",
          "Idioms & Phrases, One Word Substitution",
          "Sentence Improvement & Active/Passive Voice Conversion",
          "Direct/Indirect Speech Conversion & Cloze Passage"
        ]
      },
      {
        section: "Tier-2 Paper-I (Section-I: Math + Reasoning)",
        questions: 60,
        marks: 180,
        duration: "60 minutes",
        negativeMarking: "1 mark per incorrect response",
        topics: [
          "Mathematical Abilities (30 Questions, 90 Marks)",
          "Reasoning and General Intelligence (30 Questions, 90 Marks)",
          "Higher Order Problem Solving & Data Sufficiency",
          "Probability, Permutations & Combinations",
          "Statistical Measures (Mean, Median, Mode, Standard Deviation)"
        ]
      },
      {
        section: "Tier-2 Paper-I (Section-II: English + General Awareness)",
        questions: 70,
        marks: 210,
        duration: "60 minutes",
        negativeMarking: "1 mark per incorrect response",
        topics: [
          "English Language and Comprehension (45 Questions, 135 Marks)",
          "General Awareness with in-depth Current Affairs (25 Questions, 75 Marks)"
        ]
      },
      {
        section: "Tier-2 Paper-I (Section-III: Computer Knowledge + DEST)",
        questions: 20,
        marks: 60,
        duration: "15 minutes + 15 minutes",
        negativeMarking: "1 mark per incorrect response (Qualifying Nature)",
        topics: [
          "Computer Basics, CPU, RAM, ROM, Input/Output Devices",
          "Windows OS, MS Word, MS Excel, PowerPoint & Formulas",
          "Internet, Web Browsing, Email, Networking Devices & Cyber Security",
          "Data Entry Speed Test: 2000 key depressions over 15 minutes on PC"
        ]
      }
    ],
    stages: [
      {
        stageOrder: 1,
        stageName: "Tier-1 (Computer Based Examination)",
        description: "Screening computer based examination of 100 objective questions (200 marks, 60 minutes). Scores are normalized using standard commission formula. Marks are used exclusively for shortlisting candidates for Tier-2.",
        eligibilityNote: "All valid registered applicants.",
        status: "SCHEDULED"
      },
      {
        stageOrder: 2,
        stageName: "Tier-2 (Paper-I: Core Merit Exam & Skill Modules)",
        description: "Compulsory for all posts. Includes Section-I (Math & Reasoning - 180 marks), Section-II (English & GA - 210 marks), Section-III (Computer Knowledge - 60 marks, qualifying), and Data Entry Speed Test (DEST). Marks of Section I & II determine final all-India merit.",
        eligibilityNote: "Shortlisted candidates qualifying Tier-1 cutoffs.",
        status: "SCHEDULED"
      },
      {
        stageOrder: 3,
        stageName: "Document Verification & Physical / Medical Check",
        description: "Verification of educational credentials, caste certificates, age relaxation, and post-specific physical fitness/medical standards conducted by respective indenting ministries and departments.",
        eligibilityNote: "Candidates qualifying Tier-2 merit cutoffs.",
        status: "SCHEDULED"
      }
    ]
  },

  SSC_CHSL: {
    selectionProcessSummary: "The SSC CHSL selection process is structured into Tier-1 (Objective CBT Screening) and Tier-2 (Objective CBT Merit Exam including Computer Module and Skill/Typing Test), followed by Document Verification. Merit ranking is calculated based on Tier-2 Section-I and Section-II aggregate scores.",
    syllabusSummary: "Tier-1 covers English Language, General Intelligence, Quantitative Aptitude (Basic Arithmetic Skill), and General Awareness. Tier-2 tests advanced Mathematical Skills, Reasoning, English, GA, Computer Proficiency, and 35 WPM / 8000 KDPH Typing.",
    examPattern: [
      {
        section: "English Language (Basic Knowledge)",
        questions: 25,
        marks: 50,
        duration: "60 minutes combined",
        negativeMarking: "0.50 marks",
        topics: ["Spotting Errors", "Fill in Blanks", "Synonyms/Antonyms", "Spellings Detection", "Idioms & Phrases", "One Word Substitution", "Sentence Improvement", "Active/Passive Voice", "Direct/Indirect Speech", "Cloze Passage", "Comprehension Passage"]
      },
      {
        section: "General Intelligence & Reasoning",
        questions: 25,
        marks: 50,
        duration: "60 minutes combined",
        negativeMarking: "0.50 marks",
        topics: ["Symbolic/Number Analogy", "Trends & Figural Classification", "Punched Hole/Pattern Folding", "Semantic Series", "Critical Thinking", "Venn Diagrams", "Drawing Inferences", "Coding & Decoding"]
      },
      {
        section: "Quantitative Aptitude (Basic Arithmetic)",
        questions: 25,
        marks: 50,
        duration: "60 minutes combined",
        negativeMarking: "0.50 marks",
        topics: ["Number Systems", "Fundamental Arithmetical Operations", "Algebra (Linear Equations, Surds)", "Geometry (Elementary Geometric Figures)", "Mensuration", "Trigonometry", "Statistical Charts"]
      },
      {
        section: "General Awareness",
        questions: 25,
        marks: 50,
        duration: "60 minutes combined",
        negativeMarking: "0.50 marks",
        topics: ["History, Culture, Geography", "Economic Scene", "General Policy & Scientific Research", "National & International Events"]
      },
      {
        section: "Tier-2 Session-I (Math, Reasoning, English, GA)",
        questions: 135,
        marks: 360,
        duration: "135 minutes",
        negativeMarking: "1 mark per incorrect answer",
        topics: ["Module-I Math (30 Qs)", "Module-II Reasoning (30 Qs)", "Module-III English (40 Qs)", "Module-IV General Awareness (20 Qs)", "Module-V Computer Knowledge (15 Qs)"]
      },
      {
        section: "Tier-2 Session-II (Skill Test / Typing Test)",
        questions: 1,
        marks: 0,
        duration: "15 minutes",
        negativeMarking: "Qualifying",
        topics: ["Data Entry Speed Test (DEST) for DEO: 8,000 Key Depressions per hour", "Typing Test for LDC/JSA: 35 wpm English or 30 wpm Hindi on computer"]
      }
    ],
    stages: [
      {
        stageOrder: 1,
        stageName: "Tier-1 (Computer Based Examination)",
        description: "100 Objective questions, 200 marks, 60 minutes. Normalized score used for screening.",
        eligibilityNote: "All 10+2 passed candidates.",
        status: "SCHEDULED"
      },
      {
        stageOrder: 2,
        stageName: "Tier-2 (CBT Merit Paper & Typing / Skill Test)",
        description: "Includes written sections (Math, Reasoning, English, GA, Computer) and mandatory typing test.",
        eligibilityNote: "Candidates qualifying Tier-1 cutoffs.",
        status: "SCHEDULED"
      },
      {
        stageOrder: 3,
        stageName: "Document Verification",
        description: "Scrutiny of 10th/12th marksheets, caste certificates, and identity verification by recruiting departments.",
        eligibilityNote: "Candidates qualifying Tier-2 merit and skill test.",
        status: "SCHEDULED"
      }
    ]
  },

  SSC_JE: {
    selectionProcessSummary: "The SSC JE selection process consists of Paper-I (Computer Based Examination), Paper-II (Computer Based Technical Domain Examination), followed by Document Verification. Merit list is drawn based on aggregate marks obtained in Paper-I and Paper-II.",
    syllabusSummary: "Paper-I contains General Intelligence & Reasoning (50 marks), General Awareness (50 marks), and General Engineering (Civil/Electrical/Mechanical, 100 marks). Paper-II contains 100 advanced engineering domain questions for 300 marks.",
    examPattern: [
      {
        section: "Paper-I: General Intelligence & Reasoning",
        questions: 50,
        marks: 50,
        duration: "120 minutes combined",
        negativeMarking: "0.25 marks",
        topics: ["Analogies", "Similarities & Differences", "Space Visualization", "Problem Solving", "Analysis & Judgment", "Decision Making", "Visual Memory", "Relationship Concepts", "Arithmetical Reasoning", "Verbal & Figure Classification"]
      },
      {
        section: "Paper-I: General Awareness",
        questions: 50,
        marks: 50,
        duration: "120 minutes combined",
        negativeMarking: "0.25 marks",
        topics: ["Current Events", "India and its Neighboring Countries", "History, Culture, Geography", "Economic Scene, General Polity", "Scientific Research"]
      },
      {
        section: "Paper-I: General Engineering (Civil/Electrical/Mechanical)",
        questions: 100,
        marks: 100,
        duration: "120 minutes combined",
        negativeMarking: "0.25 marks",
        topics: ["Civil: Building Materials, Estimating, Surveying, Soil Mechanics, Hydraulics, Environmental Engg", "Electrical: Basic Concepts, Circuit Law, AC Fundamentals, Electrical Machines, Power Generation", "Mechanical: Theory of Machines, Machine Design, Strength of Materials, Thermodynamics, Fluid Mechanics"]
      },
      {
        section: "Paper-II: Core Engineering Domain (CBT)",
        questions: 100,
        marks: 300,
        duration: "120 minutes",
        negativeMarking: "1 mark per incorrect answer",
        topics: ["In-depth professional engineering concepts, design standards, IS codes, numerical calculations, structural analysis, thermal systems, and distribution grids."]
      }
    ],
    stages: [
      {
        stageOrder: 1,
        stageName: "Paper-I (Computer Based Examination)",
        description: "Objective CBT of 200 questions (200 marks, 2 hours) testing Reasoning, General Awareness, and Engineering fundamentals.",
        eligibilityNote: "Diploma or Degree holders in Civil, Electrical, or Mechanical Engineering.",
        status: "SCHEDULED"
      },
      {
        stageOrder: 2,
        stageName: "Paper-II (Advanced Technical CBT)",
        description: "In-depth engineering specialization paper of 100 questions (300 marks, 2 hours). Calculator permitted as per official interface.",
        eligibilityNote: "Candidates qualifying Paper-I cutoffs.",
        status: "SCHEDULED"
      },
      {
        stageOrder: 3,
        stageName: "Document Verification & Medical Exam",
        description: "Scrutiny of engineering degrees/diplomas, caste certificates, and departmental fitness check.",
        eligibilityNote: "Candidates shortlisted based on Paper-I + Paper-II combined merit.",
        status: "SCHEDULED"
      }
    ]
  },

  SSC_CPO: {
    selectionProcessSummary: "The SSC CPO selection process comprises Paper-I (CBT), Physical Standard Test (PST) / Physical Endurance Test (PET), Paper-II (English Language & Comprehension CBT), and Detailed Medical Examination (DME). Final merit for Sub-Inspector in Delhi Police and CAPFs (BSF, CISF, CRPF, ITBP, SSB) is based on Paper-I and Paper-II marks combined.",
    syllabusSummary: "Paper-I tests General Intelligence, General Awareness, Quantitative Aptitude, and English. PET tests physical fitness (100m sprint, 1.6km run, long jump, high jump, shot put). Paper-II tests English Language & Comprehension.",
    examPattern: [
      { section: "Paper-I: General Intelligence & Reasoning", questions: 50, marks: 50, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["Analogy", "Classification", "Series", "Coding-Decoding", "Blood Relations", "Direction Sense", "Non-Verbal Reasoning"] },
      { section: "Paper-I: General Knowledge & General Awareness", questions: 50, marks: 50, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["Indian History, Geography, Polity", "Economy", "General Science", "Current Affairs"] },
      { section: "Paper-I: Quantitative Aptitude", questions: 50, marks: 50, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["Arithmetic", "Algebra", "Geometry", "Mensuration", "Trigonometry", "Data Interpretation"] },
      { section: "Paper-I: English Comprehension", questions: 50, marks: 50, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["Grammar, Vocabulary, Comprehension Passages, Idioms, Error Spotting"] },
      { section: "Paper-II: English Language & Comprehension", questions: 200, marks: 200, duration: "120 minutes", negativeMarking: "0.25 marks", topics: ["Error recognition, Filling in the blanks, Vocabulary, Spellings, Grammar, Sentence structure, Synonyms, Antonyms, Sentence completion, Phrases and Idiomatic use of Words, Comprehension"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Paper-I (Computer Based Examination)", description: "200 Questions, 200 Marks, 2 Hours.", eligibilityNote: "Any Graduate.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "PST & PET (Physical Standards & Endurance Test)", description: "Height/Chest measurements followed by 100m run (16s), 1.6km run (6.5 min), Long Jump (3.65m in 3 chances), High Jump (1.2m in 3 chances), Shot Put 16 lbs (4.5m). Qualifying nature.", eligibilityNote: "Candidates qualifying Paper-I cutoffs.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Paper-II (English Language & Comprehension)", description: "200 Questions, 200 Marks, 2 Hours.", eligibilityNote: "Candidates qualifying PET/PST.", status: "SCHEDULED" },
      { stageOrder: 4, stageName: "Detailed Medical Examination (DME) & DV", description: "Eye test (6/6 & 6/9 without glasses), color blindness check, knock knee, flat foot, and document scrutiny.", eligibilityNote: "Candidates qualifying Paper-I + Paper-II combined cutoff.", status: "SCHEDULED" }
    ]
  },

  // Banking Exams
  BANK_PO: {
    selectionProcessSummary: "The Bank PO selection process is conducted in three phases: Phase-I (Preliminary Examination), Phase-II (Main Examination with Objective and Descriptive tests), and Phase-III (Psychometric Test, Group Exercise & Personal Interview). Prelims is qualifying in nature. Final merit is prepared with 75:25 or 80:20 weightage between Mains and Interview marks.",
    syllabusSummary: "Prelims tests English Language, Quantitative Aptitude, and Reasoning Ability. Mains tests Reasoning & Computer Aptitude, Data Analysis & Interpretation, General/Economy/Banking Awareness, English Language, and Letter/Essay Writing.",
    examPattern: [
      { section: "Prelims: English Language", questions: 30, marks: 30, duration: "20 minutes (Sectional)", negativeMarking: "0.25 marks", topics: ["Reading Comprehension", "Cloze Test", "Error Detection", "Sentence Improvement", "Para Jumbles", "Vocabulary & Fillers"] },
      { section: "Prelims: Quantitative Aptitude", questions: 35, marks: 35, duration: "20 minutes (Sectional)", negativeMarking: "0.25 marks", topics: ["Simplification & Approximation", "Number Series", "Quadratic Equations", "Data Interpretation (Tables, Line, Bar, Pie)", "Arithmetic Word Problems"] },
      { section: "Prelims: Reasoning Ability", questions: 35, marks: 35, duration: "20 minutes (Sectional)", negativeMarking: "0.25 marks", topics: ["Puzzles & Seating Arrangement", "Syllogisms", "Inequalities", "Coding-Decoding", "Blood Relations", "Direction Sense"] },
      { section: "Mains: Reasoning & Computer Aptitude", questions: 45, marks: 60, duration: "60 minutes", negativeMarking: "0.25 marks", topics: ["High-Level Puzzles", "Input-Output", "Data Sufficiency", "Logical & Critical Reasoning", "Computer Binary, Memory, Networks"] },
      { section: "Mains: Data Analysis & Interpretation", questions: 35, marks: 60, duration: "45 minutes", negativeMarking: "0.25 marks", topics: ["Radar & Funnel DI", "Caselet & Missing DI", "Probability & Permutations", "Arithmetic Data Graphs"] },
      { section: "Mains: General, Economy & Banking Awareness", questions: 40, marks: 40, duration: "35 minutes", negativeMarking: "0.25 marks", topics: ["Banking Terminologies", "RBI Monetary Policy & Circulars", "Financial Current Affairs", "Government Schemes & Budget", "Static GK"] },
      { section: "Mains: English Language (Objective)", questions: 35, marks: 40, duration: "40 minutes", negativeMarking: "0.25 marks", topics: ["Advanced RC", "Inference Questions", "Connectors & Sentence Starters", "Vocabulary & Idiomatic Usage"] },
      { section: "Mains: English Language (Descriptive)", questions: 2, marks: 25, duration: "30 minutes", negativeMarking: "Evaluated if objective cutoffs met", topics: ["Formal / Informal Letter Writing (150 words)", "Essay Writing on Socio-Economic / Banking Topics (250 words)"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Phase-I: Preliminary Examination", description: "Online objective exam of 100 questions (100 marks, 60 minutes with sectional timing of 20 min each). Qualifying nature.", eligibilityNote: "Graduates in any discipline.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Phase-II: Main Examination (Objective + Descriptive)", description: "Comprehensive online test: 155 objective questions (200 marks, 180 min) + 2 descriptive typing questions (25 marks, 30 min). Sectional cutoffs apply.", eligibilityNote: "Candidates qualifying Prelims category cutoffs.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Phase-III: Psychometric Test, Group Discussion & Interview", description: "Personality profiling, group discussion / group exercise (20 marks), and personal interview (30 marks) before a board of senior bankers.", eligibilityNote: "Candidates qualifying Mains aggregate and sectional cutoffs.", status: "SCHEDULED" },
      { stageOrder: 4, stageName: "Final Merit & Provisional Allotment", description: "Combined merit list normalized to 100 marks (80% Mains + 20% Interview). Allotment to participating public sector banks.", eligibilityNote: "Final selected candidates.", status: "SCHEDULED" }
    ]
  },

  BANK_CLERK: {
    selectionProcessSummary: "The Bank Clerk selection process consists of two online examination stages: Preliminary Examination (qualifying) and Main Examination (merit). There is no interview for clerical cadre posts. Candidates qualifying the Main exam must clear the local Language Proficiency Test (LPT) before appointment.",
    syllabusSummary: "Prelims tests English, Numerical Ability, and Reasoning. Mains covers General/Financial Awareness, General English, Quantitative Aptitude, and Reasoning Ability & Computer Aptitude.",
    examPattern: [
      { section: "Prelims: English Language", questions: 30, marks: 30, duration: "20 minutes", negativeMarking: "0.25 marks", topics: ["Reading Comprehension", "Cloze Test", "Sentence Rearrangement", "Fillers", "Error Detection"] },
      { section: "Prelims: Numerical Ability", questions: 35, marks: 35, duration: "20 minutes", negativeMarking: "0.25 marks", topics: ["Simplification/Approximation (10-15 Qs)", "Number Series", "Quadratic Equations", "Arithmetic Word Problems", "Data Interpretation"] },
      { section: "Prelims: Reasoning Ability", questions: 35, marks: 35, duration: "20 minutes", negativeMarking: "0.25 marks", topics: ["Puzzles & Seating Arrangements", "Syllogisms", "Inequalities", "Alphanumeric Series", "Direction & Distance"] },
      { section: "Mains: General/Financial Awareness", questions: 50, marks: 50, duration: "35 minutes", negativeMarking: "0.25 marks", topics: ["Banking & Financial Current Affairs", "RBI Regulations & Schemes", "Static GK", "Monetary Policy", "Union Budget"] },
      { section: "Mains: General English", questions: 40, marks: 40, duration: "35 minutes", negativeMarking: "0.25 marks", topics: ["Reading Comprehension", "Vocabulary", "Grammar", "Sentence Correction", "Paragraph Completion"] },
      { section: "Mains: Quantitative Aptitude", questions: 50, marks: 50, duration: "45 minutes", negativeMarking: "0.25 marks", topics: ["Data Interpretation (Bar, Line, Pie, Caselet)", "Arithmetic Word Problems", "Quantity Comparison", "Data Sufficiency"] },
      { section: "Mains: Reasoning Ability & Computer Aptitude", questions: 50, marks: 60, duration: "45 minutes", negativeMarking: "0.25 marks", topics: ["Complex Puzzles & Floor Arrangements", "Coding-Decoding", "Machine Input-Output", "Computer Basics & Shortcuts"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Preliminary Examination", description: "100 Objective Questions (100 Marks, 60 minutes with 20-min sectional timer). Screening only.", eligibilityNote: "Any Graduate.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Main Examination", description: "190 Objective Questions (200 Marks, 160 minutes). Scores determine state-wise merit list.", eligibilityNote: "Candidates qualifying Prelims cutoffs.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Language Proficiency Test (LPT) & Document Verification", description: "Mandatory test to confirm candidate can read, write, and speak the local language of the applied state/UT. Qualifying nature.", eligibilityNote: "Candidates shortlisted on Mains merit.", status: "SCHEDULED" }
    ]
  },

  BANK_SO: {
    selectionProcessSummary: "The Specialist Officer (SO) selection process comprises Phase-I (Online Prelims), Phase-II (Online Mains testing Professional Domain Knowledge), followed by Personal Interview. Final selection is based on combined marks of Mains and Interview (80:20 weightage).",
    syllabusSummary: "Prelims tests Reasoning, English, and Quantitative Aptitude / General Awareness. Mains consists of 60 questions exclusively on Professional Knowledge (IT, Agriculture, Law, HR, Marketing, or Rajbhasha).",
    examPattern: [
      { section: "Prelims: Reasoning & English", questions: 100, marks: 75, duration: "80 minutes", negativeMarking: "0.25 marks", topics: ["Logical Reasoning, Verbal Ability, Reading Comprehension, Vocabulary"] },
      { section: "Prelims: Quantitative Aptitude / General Awareness", questions: 50, marks: 50, duration: "40 minutes", negativeMarking: "0.25 marks", topics: ["Numerical Ability for IT/Agri/HR/Marketing; Banking GA for Law/Rajbhasha"] },
      { section: "Mains: Professional Knowledge (Domain Specific)", questions: 60, marks: 60, duration: "45 minutes", negativeMarking: "0.25 marks", topics: ["IT: DBMS, Data Structures, Networking, Software Engg, Web Technologies, Cyber Security", "AFO: Agronomy, Soil Science, Horticulture, Animal Husbandry, Farm Machinery", "Law: Banking Regulation Act, RBI Act, Companies Act, Contract Act, IBC", "HR: Human Resource Management, Industrial Relations, Labor Laws, Training & Development", "Marketing: Marketing Management, Market Research, Branding, Digital Marketing, Retail Banking"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Phase-I: Preliminary Examination", description: "150 Questions, 125 Marks, 120 Minutes. Qualifying screening test.", eligibilityNote: "Degree in specialized field (B.Tech, B.Sc Agri, LLB, MBA HR/Marketing).", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Phase-II: Main Examination (Professional Knowledge)", description: "60 Objective questions on specialized discipline. High weightage for merit.", eligibilityNote: "Candidates qualifying Prelims cutoffs.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Phase-III: Personal Interview & Allotment", description: "100 marks personal interview assessing domain competence, practical experience, and banking acumen.", eligibilityNote: "Candidates qualifying Mains cutoffs.", status: "SCHEDULED" }
    ]
  },

  // Regulatory (RBI, NABARD)
  RBI_GRADE_B: {
    selectionProcessSummary: "The RBI Grade B Officer selection process involves a 3-phase assessment: Phase-I (Online Objective Examination), Phase-II (Written Exam comprising Objective & Descriptive papers), and Phase-III (Personal Interview). Final ranking is based on Phase-II (300 marks) and Interview (75 marks) totaling 375 marks.",
    syllabusSummary: "Phase-I tests General Awareness (80 marks), Reasoning (60 marks), English (30 marks), and Quantitative Aptitude (30 marks). Phase-II includes Paper-I: Economic and Social Issues (ESI), Paper-II: Descriptive English, and Paper-III: Finance and Management (F&M).",
    examPattern: [
      { section: "Phase-I: General Awareness", questions: 80, marks: 80, duration: "25 minutes", negativeMarking: "0.25 marks", topics: ["Economic & Financial News", "RBI Notifications & Speeches", "Union Budget & Economic Survey", "International Summits & Treaties", "Static GK"] },
      { section: "Phase-I: Reasoning Ability", questions: 60, marks: 60, duration: "45 minutes", negativeMarking: "0.25 marks", topics: ["Complex Puzzles & Floor Arrangements", "Critical & Analytical Reasoning", "Data Sufficiency", "Input-Output", "Coding-Decoding"] },
      { section: "Phase-I: English Language", questions: 30, marks: 30, duration: "25 minutes", negativeMarking: "0.25 marks", topics: ["Advanced Reading Comprehension", "Cloze Test", "Sentence Completion", "Error Spotting", "Idioms & Vocabulary"] },
      { section: "Phase-I: Quantitative Aptitude", questions: 30, marks: 30, duration: "25 minutes", negativeMarking: "0.25 marks", topics: ["Higher Arithmetic", "Number Series", "Quadratic Equations", "Advanced Data Interpretation"] },
      { section: "Phase-II: Paper-I (Economic and Social Issues - ESI)", questions: 30, marks: 100, duration: "120 minutes (30m Obj + 90m Desc)", negativeMarking: "0.25 marks (Obj)", topics: ["Growth & Development in India", "Poverty Alleviation & Employment Generation", "Sustainable Development & Environmental Issues", "Monetary & Fiscal Policy", "Balance of Payments, WTO, IMF & World Bank", "Social Structure in India, Demographic Trends, Urbanization"] },
      { section: "Phase-II: Paper-II (English - Writing Skills)", questions: 3, marks: 100, duration: "90 minutes", negativeMarking: "Descriptive Typing", topics: ["Essay Writing on Current Economic/Social issues (400 words)", "Precis Writing (Summarizing passage to 1/3rd)", "Reading Comprehension and Answering Questions"] },
      { section: "Phase-II: Paper-III (Finance and Management - F&M)", questions: 30, marks: 100, duration: "120 minutes (30m Obj + 90m Desc)", negativeMarking: "0.25 marks (Obj)", topics: ["Financial System & Financial Markets (Forex, Money, Bond, Equity)", "Role of Regulatory Bodies (RBI, SEBI, IRDAI, PFRDA)", "Risk Management in Banking & Basel Norms", "Corporate Governance, FinTech & Digital Payments", "Management Principles, Theories of Leadership & Motivation", "Organizational Behavior & Corporate Ethics"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Phase-I: Online Screening Examination", description: "200 Questions, 200 Marks, 120 Minutes with sectional timing and individual sectional cutoffs.", eligibilityNote: "Graduates with minimum 60% marks (50% for SC/ST/PwBD).", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Phase-II: Main Examination (3 Papers)", description: "Paper-I (ESI - 100 marks), Paper-II (English - 100 marks), Paper-III (F&M - 100 marks). Conducted across morning and afternoon shifts.", eligibilityNote: "Candidates qualifying Phase-I cutoffs.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Phase-III: Personal Interview", description: "Interview carries 75 marks. Candidates may choose to answer in Hindi or English.", eligibilityNote: "Candidates qualifying Phase-II aggregate cutoffs.", status: "SCHEDULED" }
    ]
  },

  // Railways Exams
  RRB_NTPC: {
    selectionProcessSummary: "The RRB NTPC selection process involves 1st Stage Computer Based Test (CBT 1 - Screening), 2nd Stage Computer Based Test (CBT 2 - Merit), Computer Based Aptitude Test (CBAT) for Station Master or Typing Skill Test for Clerical posts, followed by Document Verification and Medical Examination.",
    syllabusSummary: "CBT 1 (100 Qs) tests General Awareness (40), Mathematics (30), and General Intelligence & Reasoning (30). CBT 2 (120 Qs) tests General Awareness (50), Mathematics (35), and Reasoning (35). Negative marking is 1/3rd mark per wrong answer.",
    examPattern: [
      { section: "CBT 1: General Awareness", questions: 40, marks: 40, duration: "90 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Current Events of National and International Importance", "Games and Sports", "Art and Culture of India", "Indian Literature", "Monuments and Places of India", "General Science and Life Science (up to 10th CBSE)", "History of India and Freedom Struggle", "Physical, Social and Economic Geography of India and World", "Indian Polity and Governance - Constitution and Political System"] },
      { section: "CBT 1: Mathematics", questions: 30, marks: 30, duration: "90 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Number System, Decimals, Fractions, LCM, HCF", "Ratio and Proportions, Percentage, Mensuration", "Time and Work, Time and Distance", "Simple and Compound Interest, Profit and Loss", "Elementary Algebra, Geometry and Trigonometry, Elementary Statistics"] },
      { section: "CBT 1: General Intelligence and Reasoning", questions: 30, marks: 30, duration: "90 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Analogies, Completion of Number and Alphabetical Series", "Coding and Decoding, Mathematical Operations", "Relationships, Syllogism, Jumbling, Venn Diagrams", "Data Interpretation and Sufficiency", "Conclusions and Decision Making, Similarities and Differences", "Analytical Reasoning, Classification, Directions, Statement-Arguments and Assumptions"] },
      { section: "CBT 2: Advanced Core Paper", questions: 120, marks: 120, duration: "90 minutes", negativeMarking: "1/3rd (0.33) marks", topics: ["General Awareness (50 Questions)", "Mathematics (35 Questions)", "General Intelligence and Reasoning (35 Questions)"] },
      { section: "Skill Test: CBAT / Typing Test", questions: 1, marks: 0, duration: "Variable", negativeMarking: "Qualifying", topics: ["CBAT for Station Master / Traffic Assistant: 5 Test Batteries with min 42 T-score", "Typing Skill Test: 30 wpm in English or 25 wpm in Hindi on PC"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "1st Stage Computer Based Test (CBT 1)", description: "100 Multiple choice questions (100 marks, 90 minutes). Common for all posts. Normalized score used to shortlist 20 times the vacancies for CBT 2.", eligibilityNote: "Graduates / 12th pass as per post applied.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "2nd Stage Computer Based Test (CBT 2)", description: "120 Questions (120 marks, 90 minutes). Conducted separately for each Pay Level (Level 2, 3, 5, 6). Determines merit.", eligibilityNote: "Candidates qualifying CBT 1 cutoffs.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "CBAT / Typing Skill Test", description: "Computer Based Aptitude Test (CBAT) for Station Master or Computer Typing Skill Test (TST) for Junior Accounts Assistant / Senior Clerk.", eligibilityNote: "Candidates qualifying CBT 2 merit cutoff.", status: "SCHEDULED" },
      { stageOrder: 4, stageName: "Document Verification & Medical Examination", description: "Rigorous medical examination according to Indian Railway Medical Manual (A-2, A-3, B-2, C-2 standards).", eligibilityNote: "Candidates based on CBT 2 + CBAT/Typing performance.", status: "SCHEDULED" }
    ]
  },

  RRB_JE: {
    selectionProcessSummary: "The RRB JE selection process includes 1st Stage CBT (Screening), 2nd Stage CBT (Technical Merit), Document Verification, and Medical Fitness Examination.",
    syllabusSummary: "CBT 1 covers Math, Reasoning, General Awareness, and General Science. CBT 2 covers General Awareness, Physics & Chemistry, Basics of Computers, Basics of Environment, and Technical Engineering Abilities (Civil, Mech, Elec, Electronics).",
    examPattern: [
      { section: "CBT 1: Mathematics", questions: 30, marks: 30, duration: "90 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Number systems, BODMAS, Decimals, Fractions, LCM and HCF, Ratio and Proportion, Percentages, Mensuration, Time and Work, Time and Distance, Simple and Compound Interest, Profit and Loss, Algebra, Geometry, Trigonometry, Elementary Statistics, Square Root, Age Calculations, Calendar & Clock, Pipes & Cistern"] },
      { section: "CBT 1: General Intelligence & Reasoning", questions: 25, marks: 25, duration: "90 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Analogies, Alphabetical and Number Series, Coding and Decoding, Mathematical operations, Relationships, Syllogism, Jumbling, Venn Diagram, Data Interpretation, Conclusions and decision making"] },
      { section: "CBT 1: General Awareness", questions: 15, marks: 15, duration: "90 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Knowledge of Current affairs, Indian geography, culture and history of India, Indian Polity and constitution, Indian Economy, Environmental issues concerning India and the World, Sports, General scientific and technological developments"] },
      { section: "CBT 1: General Science", questions: 30, marks: 30, duration: "90 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Physics, Chemistry and Life Sciences up to 10th standard CBSE syllabus"] },
      { section: "CBT 2: Technical Abilities & Allied Concepts", questions: 150, marks: 150, duration: "120 minutes", negativeMarking: "1/3rd (0.33) marks", topics: ["General Awareness (15 Marks)", "Physics & Chemistry (15 Marks)", "Basics of Computers and Applications (10 Marks)", "Basics of Environment and Pollution Control (10 Marks)", "Technical Engineering Domain (Civil / Electrical / Mechanical / Electronics - 100 Marks)"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "1st Stage Computer Based Test (CBT 1)", description: "100 Questions, 100 Marks, 90 Minutes. Qualifying screening examination.", eligibilityNote: "Diploma or Degree in Engineering.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "2nd Stage Computer Based Test (CBT 2)", description: "150 Questions, 150 Marks, 120 Minutes. Final merit is determined entirely by CBT 2 normalized marks.", eligibilityNote: "Candidates qualifying CBT 1 (top 15 times vacancies).", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Document Verification & Medical Fitness", description: "Verification of engineering credentials and Railway medical test (A-3 standard including vision without fogging).", eligibilityNote: "Candidates qualifying CBT 2 merit cutoff.", status: "SCHEDULED" }
    ]
  },

  RRB_ALP: {
    selectionProcessSummary: "The RRB Assistant Loco Pilot (ALP) selection process is composed of: 1st Stage CBT (Screening), 2nd Stage CBT (Part A Merit + Part B Qualifying Trade Test), Computer Based Aptitude Test (CBAT - Psycho Test), and Document Verification & Medical Examination. Candidates must meet the strict A-1 Medical Standard (Distance Vision 6/6 without glasses).",
    syllabusSummary: "CBT 1 has 75 Qs on Math, Reasoning, Science, and Current Affairs. CBT 2 Part A has 100 Qs on Math, Reasoning, Basic Science & Engineering. Part B has 75 Qs on relevant ITI/Trade syllabus. CBAT evaluates vigilance and perceptual speed.",
    examPattern: [
      { section: "CBT 1: Mathematics & Reasoning", questions: 45, marks: 45, duration: "60 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Number System, Ratio, Time & Work, Puzzles, Coding-Decoding, Venn Diagrams"] },
      { section: "CBT 1: General Science & Current Affairs", questions: 30, marks: 30, duration: "60 minutes combined", negativeMarking: "1/3rd (0.33) marks", topics: ["Physics, Chemistry, Biology (10th standard), National & International Current Affairs"] },
      { section: "CBT 2 Part A: Math, Reasoning & Basic Science/Engg", questions: 100, marks: 100, duration: "90 minutes", negativeMarking: "1/3rd (0.33) marks", topics: ["Basic Science and Engineering (Engineering Drawing, Units, Measurements, Mass, Weight, Density, Work, Power, Energy, Speed, Velocity, Heat, Temperature, Basic Electricity, Levers, Occupational Safety)", "Mathematics (Advanced Arithmetic)", "General Intelligence & Reasoning"] },
      { section: "CBT 2 Part B: Trade Qualification Test", questions: 75, marks: 75, duration: "60 minutes", negativeMarking: "1/3rd (0.33) marks (Min 35% to pass)", topics: ["Syllabus defined by DGT for relevant trade: Fitter, Electrician, Instrument Mechanic, Millwright, Wireman, Electronic Mechanic, Heat Engine, Tractor Mechanic, Diesel Mechanic"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "1st Stage CBT", description: "75 Questions, 75 Marks, 60 Minutes. Shortlists 15 times vacancies for 2nd Stage.", eligibilityNote: "Matriculation + ITI / Diploma / Degree in Engg.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "2nd Stage CBT (Part A & Part B)", description: "Part A (100 Qs, 90 min) counts for merit. Part B (75 Qs, 60 min) is mandatory qualifying trade test (min 35%).", eligibilityNote: "Candidates qualifying CBT 1.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Computer Based Aptitude Test (CBAT)", description: "Psycho test evaluating perceptual speed, depth perception, spatial scanning, and vigilance. Minimum 42 T-score in each battery.", eligibilityNote: "Candidates qualifying 2nd Stage CBT Part A (8 times vacancies).", status: "SCHEDULED" },
      { stageOrder: 4, stageName: "Document Verification & A-1 Medical Standard", description: "Comprehensive medical checkup strictly requiring A-1 Medical Standard (6/6 distance vision without glasses, near vision Sn: 0.6, 0.6 without glasses, color vision, binocular vision, night vision, and mesopic vision).", eligibilityNote: "Candidates based on 70% Part A + 30% CBAT combined score.", status: "SCHEDULED" }
    ]
  },

  RRB_GROUP_D: {
    selectionProcessSummary: "The RRB Group D (Level-1) selection process comprises a single Computer Based Test (CBT), followed by Physical Efficiency Test (PET), Document Verification, and Medical Examination.",
    syllabusSummary: "CBT (100 Qs, 90 mins) covers General Science (25 marks), Mathematics (25 marks), General Intelligence & Reasoning (30 marks), and General Awareness & Current Affairs (20 marks). 1/3rd negative marking.",
    examPattern: [
      { section: "General Science", questions: 25, marks: 25, duration: "90 minutes combined", negativeMarking: "1/3rd mark", topics: ["Physics, Chemistry, Life Sciences up to 10th standard CBSE level"] },
      { section: "Mathematics", questions: 25, marks: 25, duration: "90 minutes combined", negativeMarking: "1/3rd mark", topics: ["Number system, BODMAS, Decimals, Fractions, LCM, HCF, Ratio and Proportion, Percentages, Mensuration, Time and Work, Time and Distance, Simple and Compound Interest, Profit and Loss, Algebra, Geometry and Trigonometry, Elementary Statistics"] },
      { section: "General Intelligence and Reasoning", questions: 30, marks: 30, duration: "90 minutes combined", negativeMarking: "1/3rd mark", topics: ["Analogies, Alphabetical and Number Series, Coding and Decoding, Mathematical operations, Relationships, Syllogism, Jumbling, Venn Diagram, Data Interpretation and Sufficiency, Conclusions and Decision making"] },
      { section: "General Awareness and Current Affairs", questions: 20, marks: 20, duration: "90 minutes combined", negativeMarking: "1/3rd mark", topics: ["Science & Technology, Sports, Culture, Personalities, Economics, Politics and any other subject of importance"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Computer Based Test (CBT)", description: "100 Questions, 100 Marks, 90 Minutes. Normalized marks used to shortlist candidates for PET.", eligibilityNote: "10th pass or ITI / NCVT certificate.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Physical Efficiency Test (PET)", description: "Male: Lift & carry 35kg for 100m in 2 min without putting it down + Run 1000m in 4 min 15 sec. Female: Lift 20kg for 100m in 2 min + Run 1000m in 5 min 40 sec. Qualifying nature.", eligibilityNote: "Candidates qualifying CBT (3 times vacancies).", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Document Verification & Medical Exam", description: "Verification of educational certificates, caste status, and medical checkup as per Indian Railway standards.", eligibilityNote: "Candidates qualifying PET in order of CBT merit.", status: "SCHEDULED" }
    ]
  },

  // UPSC Civil Services & Defence
  UPSC_CSE: {
    selectionProcessSummary: "The UPSC Civil Services Examination (CSE) consists of two successive stages: (1) Preliminary Examination (Objective type) for the selection of candidates for the Main Examination, and (2) Civil Services (Main) Examination (Written and Interview) for the selection of candidates for various Services and posts. Prelims is screening only. Main Written (1750 marks) and Interview (275 marks) totaling 2025 marks decide final all-India ranking.",
    syllabusSummary: "Prelims: Paper-I (General Studies - 200 marks) and Paper-II (CSAT - 200 marks, 33% qualifying). Mains: 9 subjective papers (2 qualifying languages + Essay, 4 General Studies papers, 2 Optional Subject papers).",
    examPattern: [
      { section: "Prelims Paper-I (General Studies)", questions: 100, marks: 200, duration: "120 minutes", negativeMarking: "0.66 marks (1/3rd)", topics: ["Current events of national and international importance", "History of India and Indian National Movement", "Indian and World Geography - Physical, Social, Economic Geography", "Indian Polity and Governance - Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues", "Economic and Social Development - Sustainable Development, Poverty, Inclusion, Demographics, Social Sector Initiatives", "General issues on Environmental Ecology, Bio-diversity and Climate Change", "General Science"] },
      { section: "Prelims Paper-II (CSAT Aptitude)", questions: 80, marks: 200, duration: "120 minutes", negativeMarking: "0.83 marks (1/3rd, Min 33% to qualify)", topics: ["Comprehension", "Interpersonal skills including communication skills", "Logical reasoning and analytical ability", "Decision making and problem solving", "General mental ability", "Basic numeracy (numbers and their relations, orders of magnitude - Class X level)", "Data interpretation (charts, graphs, tables, data sufficiency - Class X level)"] },
      { section: "Mains Paper-I: Essay", questions: 2, marks: 250, duration: "180 minutes", negativeMarking: "Subjective Evaluation", topics: ["Two essays on philosophical, socio-economic, administrative, scientific, or international affairs topics (1000-1200 words each)"] },
      { section: "Mains Paper-II: General Studies I", questions: 20, marks: 250, duration: "180 minutes", negativeMarking: "Subjective Evaluation", topics: ["Indian Heritage and Culture, History and Geography of the World and Society"] },
      { section: "Mains Paper-III: General Studies II", questions: 20, marks: 250, duration: "180 minutes", negativeMarking: "Subjective Evaluation", topics: ["Governance, Constitution, Polity, Social Justice and International Relations"] },
      { section: "Mains Paper-IV: General Studies III", questions: 20, marks: 250, duration: "180 minutes", negativeMarking: "Subjective Evaluation", topics: ["Technology, Economic Development, Bio-diversity, Environment, Security and Disaster Management"] },
      { section: "Mains Paper-V: General Studies IV", questions: 19, marks: 250, duration: "180 minutes", negativeMarking: "Subjective Evaluation", topics: ["Ethics, Integrity and Aptitude (Theoretical frameworks & Real-world administrative case studies)"] },
      { section: "Mains Paper-VI & VII: Optional Subject Paper 1 & 2", questions: 16, marks: 500, duration: "180 minutes each", negativeMarking: "Subjective Evaluation", topics: ["Candidate chosen optional subject (e.g., PSIR, Sociology, Geography, History, Public Administration, Economics, Law, Engineering)"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Preliminary Examination (Prelims)", description: "Two objective papers of 200 marks each. Paper-I marks determine cutoff; Paper-II (CSAT) requires minimum 33% qualifying score.", eligibilityNote: "Graduates in any discipline aged 21-32 (relaxations apply).", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Civil Services (Main) Examination (Written)", description: "9 subjective essay-type papers totaling 1750 marks. Rigorous analytical evaluation over 5 consecutive days.", eligibilityNote: "Candidates qualifying Prelims cutoffs (approx 12-15 times vacancies).", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Personality Test (Interview)", description: "275 marks interview before a competent board at Dholpur House, New Delhi, evaluating intellectual caliber, mental alertness, balance of judgment, and moral integrity.", eligibilityNote: "Candidates qualifying Main Written Examination (approx 2.5 times vacancies).", status: "SCHEDULED" }
    ]
  },

  UPSC_CDS: {
    selectionProcessSummary: "The UPSC CDS examination selection process consists of a Written Examination conducted by UPSC followed by an Intelligence and Personality Test (SSB Interview) conducted by the Services Selection Board for candidates who qualify in the written exam.",
    syllabusSummary: "Written exam includes English, General Knowledge, and Elementary Mathematics (for IMA, INA, AFA) or English and General Knowledge only (for Officers' Training Academy - OTA).",
    examPattern: [
      { section: "English", questions: 120, marks: 100, duration: "120 minutes", negativeMarking: "0.27 marks (1/3rd)", topics: ["Understanding of English and workmanlike use of words, Grammar, Vocabulary, Comprehension"] },
      { section: "General Knowledge", questions: 120, marks: 100, duration: "120 minutes", negativeMarking: "0.27 marks (1/3rd)", topics: ["Current events, everyday observation, scientific aspects, Indian History, Geography, Constitution"] },
      { section: "Elementary Mathematics", questions: 100, marks: 100, duration: "120 minutes", negativeMarking: "0.33 marks (1/3rd)", topics: ["Arithmetic, Algebra, Trigonometry, Geometry, Mensuration, Statistics"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Written Examination", description: "300 marks for IMA/INA/AFA; 200 marks for OTA. Offline pen-and-paper OMR exam.", eligibilityNote: "Graduates for IMA/OTA; Engg degree for INA/AFA.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "SSB Interview (5-Day Testing)", description: "Stage I (Screening - OIR & PPDT) and Stage II (Psychological tests, Group Testing Officer tasks, Personal Interview & Conference). 300 marks for IMA/INA/AFA, 200 marks for OTA.", eligibilityNote: "Candidates qualifying Written Examination cutoff.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Special Medical Board (SMB)", description: "Rigorous physical and medical examination by military medical specialists.", eligibilityNote: "SSB recommended candidates.", status: "SCHEDULED" }
    ]
  },

  // State Public Service Commissions (UPPSC, BPSC, MPPSC, KPSC, RPSC, TNPSC, WBPSC, APPSC, TGPSC, Kerala PSC)
  STATE_PSC: {
    selectionProcessSummary: "The State Civil Services Examination follows a rigorous three-tier selection process: (1) Preliminary Examination (Objective screening), (2) Main Written Examination (Subjective descriptive papers covering State History, Polity, Economy, Geography, and General Studies), and (3) Personality Test / Interview. Final merit is compiled based on Main Written and Interview scores.",
    syllabusSummary: "Prelims: General Studies + CSAT Aptitude. Mains: General Language, General Hindi/English, and 4-6 General Studies papers with deep focus on State geography, culture, historical heritage, rural economy, tribal welfare, and local governance.",
    examPattern: [
      { section: "Prelims Paper-I (General Studies)", questions: 150, marks: 200, duration: "120 minutes", negativeMarking: "0.44 to 0.66 marks (1/3rd)", topics: ["National & International Current Affairs", "History of India and Indian National Movement", "State Specific History, Art, Culture & Heritage", "Indian and State Geography", "Indian Polity, Governance & Panchayati Raj", "Economic and Social Development", "General Science & Environment"] },
      { section: "Prelims Paper-II (General Aptitude / CSAT)", questions: 100, marks: 200, duration: "120 minutes", negativeMarking: "1/3rd mark (33% qualifying)", topics: ["Comprehension & Interpersonal Skills", "Logical Reasoning & Analytical Ability", "Decision Making & Problem Solving", "General Mental Ability", "Basic Numeracy & Data Interpretation (Class X level)", "General English & State Language (Class X level)"] },
      { section: "Mains Paper-I to VI (General Studies & Languages)", questions: 100, marks: 1200, duration: "180 minutes each", negativeMarking: "Subjective Evaluation", topics: ["Compulsory State Language / Hindi", "Essay (Current Socio-Economic Topics)", "GS Paper 1 (Indian & State History, Geography, Society)", "GS Paper 2 (Indian Constitution, Polity, Governance, Social Justice)", "GS Paper 3 (Economy, Science & Tech, Environment, Security)", "GS Paper 4 (Ethics, Integrity and Aptitude)", "State Specialized Papers (State Administrative System, Culture & Heritage)"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Preliminary Examination (Prelims)", description: "Screening objective test (2 papers). Normalized marks in Paper-I decide cutoff; Paper-II is qualifying (min 33%).", eligibilityNote: "Graduates in any discipline aged 21-40.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Main Written Examination (Mains)", description: "Conventional subjective descriptive papers (1200-1500 marks) testing analytical clarity, state administrative knowledge, and expression.", eligibilityNote: "Candidates qualifying Prelims category cutoffs.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Personality Test (Interview)", description: "Personal interview (100 to 175 marks) before the State Public Service Commission board assessing suitability for administrative service.", eligibilityNote: "Candidates qualifying Main Written Examination cutoffs.", status: "SCHEDULED" }
    ]
  },

  // Technical & PSU (ISRO, DRDO, AAI, FCI, DSSSB)
  ISRO_DRDO: {
    selectionProcessSummary: "The Scientist / Engineer selection process is based either on a Computer Based Screening Test followed by a Personal Technical Interview, or direct shortlisting through valid GATE score followed by a comprehensive Technical Interview. Final selection is determined 100% on the performance in the Personal Interview (minimum 60% marks required in interview to be empaneled).",
    syllabusSummary: "Screening test contains 80 objective questions on Core Technical Engineering (Civil / Mechanical / Electrical / Computer Science / Electronics) aligned with standard GATE syllabus. Technical Interview tests fundamental problem solving, design aptitude, and research inclination.",
    examPattern: [
      { section: "Part A: Core Technical Engineering Discipline", questions: 80, marks: 240, duration: "120 minutes", negativeMarking: "1 mark per wrong answer", topics: ["Engineering Mathematics (Calculus, Linear Algebra, Differential Equations, Probability)", "Core Discipline Principles as per GATE syllabus", "System Design & Optimization", "Practical Problem Solving & Numerical Applications"] },
      { section: "Part B: Aptitude & Reasoning Ability", questions: 15, marks: 20, duration: "Included in 120 min", negativeMarking: "0.33 marks", topics: ["Numerical Reasoning, Logical Deduction, Spatial Reasoning, Pattern Recognition"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Written Screening Test / GATE Shortlisting", description: "Objective screening CBT (240 marks) or GATE score ranking used to shortlist candidates in 1:5 ratio for interview.", eligibilityNote: "B.Tech / B.E. with First Class (min 65% or 6.84 CGPA).", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Personal Technical Interview", description: "Comprehensive 45-60 minute viva before a board of senior scientists and professors. Minimum 60% score required for final empanelment.", eligibilityNote: "Shortlisted candidates.", status: "SCHEDULED" }
    ]
  },

  AAI_ATC: {
    selectionProcessSummary: "The AAI Junior Executive (Air Traffic Control) selection process consists of an Online Computer Based Test (CBT), followed by Application Verification, Voice Test, Psychological Assessment, Medical Examination, and Background Verification. There is no negative marking in the CBT.",
    syllabusSummary: "CBT has 120 questions (120 marks, 120 minutes). Part A (60 marks): English (20), Reasoning (15), General Aptitude/Numerical (15), General Knowledge (10). Part B (60 marks): Mathematics (30) and Physics (30) of 10+2 / Graduation level.",
    examPattern: [
      { section: "Part A: English Language", questions: 20, marks: 20, duration: "120 minutes combined", negativeMarking: "No negative marking", topics: ["Reading Comprehension, Vocabulary, Grammar, Idioms, Error Detection"] },
      { section: "Part A: General Intelligence / Reasoning", questions: 15, marks: 15, duration: "120 minutes combined", negativeMarking: "No negative marking", topics: ["Puzzles, Series, Syllogisms, Coding-Decoding, Non-verbal reasoning"] },
      { section: "Part A: General Aptitude / Numerical Ability", questions: 15, marks: 15, duration: "120 minutes combined", negativeMarking: "No negative marking", topics: ["Percentages, Time & Work, Speed & Distance, Algebra, Geometry, Ratios"] },
      { section: "Part A: General Knowledge / Awareness", questions: 10, marks: 10, duration: "120 minutes combined", negativeMarking: "No negative marking", topics: ["Current Affairs, Aviation Sector, Science, History, Geography"] },
      { section: "Part B: Physics (Class 12th & Graduation level)", questions: 30, marks: 30, duration: "120 minutes combined", negativeMarking: "No negative marking", topics: ["Electrostatics, Mechanics, Thermal Physics, Waves & Oscillations, Optics, Modern Physics, Electromagnetism"] },
      { section: "Part B: Mathematics (Class 12th & Graduation level)", questions: 30, marks: 30, duration: "120 minutes combined", negativeMarking: "No negative marking", topics: ["Calculus, Differential Equations, Matrices & Determinants, Vectors, 3D Geometry, Probability, Linear Programming"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Online Computer Based Test (CBT)", description: "120 Questions, 120 Marks, 2 Hours. No negative marking. Scores determine selection for subsequent rounds.", eligibilityNote: "B.Sc with Physics and Mathematics or B.Tech in any discipline.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Voice Test & Psychoactive Substance Screening", description: "Assessment of English speech clarity, pronunciation, and absence of stammering required for ATC radio communications.", eligibilityNote: "Candidates qualifying CBT merit.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Document Verification & Class-III Medical", description: "Educational scrutiny and medical fitness check by designated civil aviation medical authorities.", eligibilityNote: "Candidates qualifying Voice Test.", status: "SCHEDULED" }
    ]
  },

  FCI_ASST: {
    selectionProcessSummary: "The FCI Assistant Grade III selection process comprises Phase-I Online Examination (qualifying) and Phase-II Online Examination (Paper-I / Paper-II as per cadre). Final merit is compiled strictly on the basis of marks obtained in Phase-II.",
    syllabusSummary: "Phase-I (100 Qs, 60 mins): English (25), Reasoning (25), Numerical Aptitude (25), General Studies (25). Phase-II Paper-I (120 Qs, 90 mins): English (25), Reasoning (25), Numerical (25), General Studies (45).",
    examPattern: [
      { section: "Phase-I: English Language", questions: 25, marks: 25, duration: "15 minutes", negativeMarking: "0.25 marks", topics: ["Reading Comprehension, Error Detection, Cloze Test, Fillers, Sentence Rearrangement"] },
      { section: "Phase-I: Reasoning Ability", questions: 25, marks: 25, duration: "15 minutes", negativeMarking: "0.25 marks", topics: ["Puzzles, Seating Arrangement, Direction Sense, Blood Relations, Syllogisms"] },
      { section: "Phase-I: Numerical Aptitude", questions: 25, marks: 25, duration: "15 minutes", negativeMarking: "0.25 marks", topics: ["Simplification, Number Series, Data Interpretation, Arithmetic Problems"] },
      { section: "Phase-I: General Studies", questions: 25, marks: 25, duration: "15 minutes", negativeMarking: "0.25 marks", topics: ["History, Geography, Economy, General Science up to Class 8th, Current Affairs (5 marks)"] },
      { section: "Phase-II: Paper-I (Core Merit Paper)", questions: 120, marks: 120, duration: "90 minutes", negativeMarking: "0.25 marks", topics: ["English (25), Reasoning (25), Numerical Aptitude (25), General Studies & Computer Awareness (45)"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Phase-I Online Examination", description: "100 Questions, 100 Marks, 60 Minutes. Qualifying screening exam for shortlisting 15 times vacancies.", eligibilityNote: "Any Graduate.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Phase-II Online Examination", description: "120 Questions, 120 Marks, 90 Minutes. Determines final merit for General/Depot cadres.", eligibilityNote: "Candidates qualifying Phase-I cutoffs.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Document Verification", description: "Verification of educational qualifications, category certificates, and identity verification.", eligibilityNote: "Candidates qualifying Phase-II merit.", status: "SCHEDULED" }
    ]
  },

  DSSSB: {
    selectionProcessSummary: "The DSSSB Combined Examination selection process involves Tier-I (General / Technical Online Written Examination), followed by Skill Test / Typing Test (where applicable) and Document Verification. Merit is determined based on Tier-I normalized score.",
    syllabusSummary: "Tier-I (200 Qs, 200 marks, 2 hours): General Awareness (40), General Intelligence & Reasoning (40), Arithmetical & Numerical Ability (40), Test of Hindi Language & Comprehension (40), Test of English Language & Comprehension (40). Negative marking is 0.25 marks per wrong answer.",
    examPattern: [
      { section: "General Awareness", questions: 40, marks: 40, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["History, Polity, Constitution, Sports, Art & Culture, Geography, Economics, Everyday Science, National/International Organizations"] },
      { section: "General Intelligence & Reasoning", questions: 40, marks: 40, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["Analogies, Similarities, Space Visualization, Problem Solving, Analysis, Judgment, Decision Making, Visual Memory, Discrimination, Observation, Relationship Concepts, Arithmetical Reasoning"] },
      { section: "Arithmetical & Numerical Ability", questions: 40, marks: 40, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["Simplification, Decimals, Data Interpretation, Fractions, LCM, HCF, Ratio & Proportion, Percentage, Average, Profit & Loss, Discount, Simple & Compound Interest, Mensuration, Time & Work, Time & Distance"] },
      { section: "Hindi Language & Comprehension", questions: 40, marks: 40, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["Hindi Grammar (Vyakaran), Vocabulary, Sentence Structure, Synonyms, Antonyms, Idioms and Phrases, Comprehension Passage"] },
      { section: "English Language & Comprehension", questions: 40, marks: 40, duration: "120 minutes combined", negativeMarking: "0.25 marks", topics: ["English Grammar, Sentence Structure, Synonyms, Antonyms and its correct usage, Vocabulary, Reading Comprehension"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Tier-I Combined Written Examination", description: "200 Questions, 200 Marks, 2 Hours. Normalized score determines merit.", eligibilityNote: "Graduate or 10+2 depending on post.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Skill / Typing Verification", description: "Typing test (35 wpm English or 30 wpm Hindi on computer) for clerical cadres. Qualifying nature.", eligibilityNote: "Candidates qualifying Tier-I cutoff.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Document Verification (e-Dossier Scrutiny)", description: "Uploading and verification of certificates on DSSSB OARS portal.", eligibilityNote: "Candidates qualifying written and skill criteria.", status: "SCHEDULED" }
    ]
  },

  IB_ACIO: {
    selectionProcessSummary: "The Intelligence Bureau ACIO Grade-II / Executive selection process comprises Tier-I (Online Objective CBT), Tier-II (Descriptive Written Exam), and Tier-III (Personal Interview). Final merit is compiled based on combined performance across all three tiers (100 + 50 + 100 = 250 marks).",
    syllabusSummary: "Tier-I (100 Qs, 100 marks, 60 mins): Current Affairs (20), General Studies (20), Numerical Aptitude (20), Reasoning (20), English (20). Tier-II (50 marks, 60 mins): Essay (30 marks), English Comprehension & Precis Writing (20 marks). Tier-III: Interview (100 marks).",
    examPattern: [
      { section: "Tier-I: Current Affairs", questions: 20, marks: 20, duration: "60 minutes combined", negativeMarking: "0.25 marks", topics: ["National & International Affairs, Bilateral Relations, Defense Developments, Summits, Government Initiatives"] },
      { section: "Tier-I: General Studies", questions: 20, marks: 20, duration: "60 minutes combined", negativeMarking: "0.25 marks", topics: ["Indian History, Geography, Polity, Basic Economics, General Science"] },
      { section: "Tier-I: Numerical Aptitude", questions: 20, marks: 20, duration: "60 minutes combined", negativeMarking: "0.25 marks", topics: ["Number System, Percentages, Ratio, Profit & Loss, Speed & Distance, Time & Work, Algebra"] },
      { section: "Tier-I: Reasoning / Logical Aptitude", questions: 20, marks: 20, duration: "60 minutes combined", negativeMarking: "0.25 marks", topics: ["Puzzles, Series, Blood Relations, Syllogisms, Non-Verbal, Analytical Deduction"] },
      { section: "Tier-I: English Language", questions: 20, marks: 20, duration: "60 minutes combined", negativeMarking: "0.25 marks", topics: ["Grammar, Vocabulary, Synonyms/Antonyms, One Word Substitution, Sentence Improvement"] },
      { section: "Tier-II: Descriptive English", questions: 3, marks: 50, duration: "60 minutes", negativeMarking: "Subjective Evaluation", topics: ["Essay on Security, Geopolitical, or Socio-Economic Topics (30 Marks)", "English Comprehension & Precis Writing (20 Marks)"] },
      { section: "Tier-III: Personal Interview & Psychometric Evaluation", questions: 1, marks: 100, duration: "30-45 minutes", negativeMarking: "Subjective Evaluation", topics: ["Personality assessment, situational judgment, general awareness, psychometric testing"] }
    ],
    stages: [
      { stageOrder: 1, stageName: "Tier-I (Computer Based Test)", description: "100 Objective Questions, 100 Marks, 60 Minutes. Shortlists candidates 10 times vacancies for Tier-II.", eligibilityNote: "Graduates in any discipline.", status: "SCHEDULED" },
      { stageOrder: 2, stageName: "Tier-II (Descriptive Written Paper)", description: "50 Marks, 1 Hour descriptive paper (Essay, Precis, Comprehension). Minimum 33% qualifying score.", eligibilityNote: "Candidates qualifying Tier-I cutoff.", status: "SCHEDULED" },
      { stageOrder: 3, stageName: "Tier-III (Personal Interview & Psychological Profiling)", description: "100 Marks interview evaluating intelligence aptitude, national security awareness, and personality.", eligibilityNote: "Candidates qualifying combined Tier-I and Tier-II cutoffs (5 times vacancies).", status: "SCHEDULED" }
    ]
  }
};

// Helper function to match recruitment to its catalog entry
function getCatalogForRecruitment(recruitment) {
  const shortName = recruitment.organization.shortName.toUpperCase();
  const title = recruitment.title.toUpperCase();

  // SSC
  if (shortName === 'SSC') {
    if (title.includes('CGL') || title.includes('GRADUATE LEVEL')) return EXAM_DATA_CATALOG.SSC_CGL;
    if (title.includes('CHSL') || title.includes('HIGHER SECONDARY')) return EXAM_DATA_CATALOG.SSC_CHSL;
    if (title.includes('JE') || title.includes('JUNIOR ENGINEER')) return EXAM_DATA_CATALOG.SSC_JE;
    if (title.includes('CPO') || title.includes('POLICE') || title.includes('SUB-INSPECTOR')) return EXAM_DATA_CATALOG.SSC_CPO;
    return EXAM_DATA_CATALOG.SSC_CGL;
  }

  // Banking
  if (shortName === 'IBPS' || shortName === 'SBI') {
    if (title.includes('PO') || title.includes('PROBATIONARY') || title.includes('MANAGEMENT TRAINEE')) return EXAM_DATA_CATALOG.BANK_PO;
    if (title.includes('CLERK') || title.includes('CLERICAL') || title.includes('JUNIOR ASSOCIATES')) return EXAM_DATA_CATALOG.BANK_CLERK;
    if (title.includes('SO') || title.includes('SPECIALIST')) return EXAM_DATA_CATALOG.BANK_SO;
    return EXAM_DATA_CATALOG.BANK_PO;
  }

  // Regulatory
  if (shortName === 'RBI') {
    if (title.includes('GRADE B') || title.includes('OFFICER')) return EXAM_DATA_CATALOG.RBI_GRADE_B;
    if (title.includes('ASSISTANT')) return EXAM_DATA_CATALOG.BANK_CLERK;
    return EXAM_DATA_CATALOG.RBI_GRADE_B;
  }
  if (shortName === 'NABARD') {
    return EXAM_DATA_CATALOG.RBI_GRADE_B;
  }

  // Railways
  if (shortName === 'RRB') {
    if (title.includes('NTPC')) return EXAM_DATA_CATALOG.RRB_NTPC;
    if (title.includes('JE') || title.includes('JUNIOR ENGINEER')) return EXAM_DATA_CATALOG.RRB_JE;
    if (title.includes('ALP') || title.includes('LOCO PILOT')) return EXAM_DATA_CATALOG.RRB_ALP;
    if (title.includes('GROUP D') || title.includes('LEVEL-1') || title.includes('TRACK MAINTAINER')) return EXAM_DATA_CATALOG.RRB_GROUP_D;
    return EXAM_DATA_CATALOG.RRB_NTPC;
  }

  // UPSC
  if (shortName === 'UPSC') {
    if (title.includes('CIVIL SERVICES') || title.includes('CSE')) return EXAM_DATA_CATALOG.UPSC_CSE;
    if (title.includes('COMBINED DEFENCE') || title.includes('CDS')) return EXAM_DATA_CATALOG.UPSC_CDS;
    return EXAM_DATA_CATALOG.UPSC_CSE;
  }

  // State PSCs
  if (
    shortName === 'UPPSC' || shortName === 'BPSC' || shortName === 'MPPSC' ||
    shortName === 'KPSC' || shortName === 'RPSC' || shortName === 'TNPSC' ||
    shortName === 'WBPSC' || shortName === 'APPSC' || shortName === 'TGPSC' ||
    shortName === 'KERALA_PSC'
  ) {
    return EXAM_DATA_CATALOG.STATE_PSC;
  }

  // Tech / PSU
  if (shortName === 'ISRO' || shortName === 'DRDO') return EXAM_DATA_CATALOG.ISRO_DRDO;
  if (shortName === 'AAI') return EXAM_DATA_CATALOG.AAI_ATC;
  if (shortName === 'FCI') return EXAM_DATA_CATALOG.FCI_ASST;
  if (shortName === 'DSSSB') return EXAM_DATA_CATALOG.DSSSB;
  if (shortName === 'IB') return EXAM_DATA_CATALOG.IB_ACIO;

  // Fallback default
  return EXAM_DATA_CATALOG.SSC_CGL;
}

async function main() {
  console.log("Starting comprehensive Syllabus and Selection Process update for ALL exams...");

  const recruitments = await prisma.recruitment.findMany({
    include: {
      organization: true,
      stages: true,
    },
  });

  console.log(`Processing ${recruitments.length} recruitments...`);

  async function executeWithRetry(fn, maxRetries = 4) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === maxRetries) throw err;
        console.warn(`[Retry ${attempt}] Connection issue: ${err.message}. Retrying in 1.5s...`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  let updatedCount = 0;
  let stagesCreatedCount = 0;

  for (const rec of recruitments) {
    const catalog = getCatalogForRecruitment(rec);

    // 1. Update Recruitment entity with full syllabusSummary, selectionProcessSummary, and examPatternJson
    await executeWithRetry(() =>
      prisma.recruitment.update({
        where: { id: rec.id },
        data: {
          selectionProcessSummary: catalog.selectionProcessSummary,
          syllabusSummary: catalog.syllabusSummary,
          examPatternJson: JSON.stringify(catalog.examPattern),
        },
      })
    );

    // 2. Safely manage stages without breaking FK constraints
    const existingStages = await executeWithRetry(() =>
      prisma.recruitmentStage.findMany({
        where: { recruitmentId: rec.id },
        orderBy: { stageOrder: "asc" },
      })
    );

    for (const [idx, stage] of catalog.stages.entries()) {
      if (existingStages[idx]) {
        await executeWithRetry(() =>
          prisma.recruitmentStage.update({
            where: { id: existingStages[idx].id },
            data: {
              stageOrder: stage.stageOrder,
              stageName: stage.stageName,
              description: stage.description,
              eligibilityNote: stage.eligibilityNote,
              status: stage.status || "SCHEDULED",
            },
          })
        );
      } else {
        await executeWithRetry(() =>
          prisma.recruitmentStage.create({
            data: {
              recruitmentId: rec.id,
              stageOrder: stage.stageOrder,
              stageName: stage.stageName,
              description: stage.description,
              eligibilityNote: stage.eligibilityNote,
              status: stage.status || "SCHEDULED",
            },
          })
        );
        stagesCreatedCount++;
      }
    }

    // Small delay between recruitments to avoid Neon connection saturation
    await new Promise((r) => setTimeout(r, 80));

    updatedCount++;
    console.log(`[${updatedCount}/${recruitments.length}] Updated "${rec.title}" (${catalog.stages.length} stages, ${catalog.examPattern.length} syllabus sections)`);
  }

  console.log(`\nSUCCESS! Updated all ${updatedCount} recruitments with complete syllabus & selection process.`);
  console.log(`New stages created: ${stagesCreatedCount}`);
}

main()
  .catch((err) => {
    console.error("Error updating syllabus and stages:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

