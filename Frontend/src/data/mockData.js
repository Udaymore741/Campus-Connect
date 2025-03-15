// Mock Categories
export const categories = [
  {
    id: "cat-1",
    name: "Admissions",
    slug: "admissions",
    description: "Questions about college admissions process and requirements"
  },
  {
    id: "cat-2",
    name: "Courses & Academics",
    slug: "courses-academics",
    description: "Questions about courses, majors, and academic programs"
  },
  {
    id: "cat-3",
    name: "Placement & Internship",
    slug: "placement-internship",
    description: "Questions about job placements and internship opportunities"
  },
  {
    id: "cat-4",
    name: "Exams & Results",
    slug: "exams-results",
    description: "Questions about examinations, grading, and academic results"
  },
  {
    id: "cat-5",
    name: "Scholarship",
    slug: "scholarship",
    description: "Questions about scholarships and financial aid"
  },
  {
    id: "cat-6",
    name: "Career Guidance",
    slug: "career-guidance",
    description: "Questions about career planning and professional development"
  },
  {
    id: "cat-7",
    name: "Fresher Queries",
    slug: "fresher-queries",
    description: "Questions specifically for new students and freshers"
  },
  {
    id: "cat-8",
    name: "Alumni Network",
    slug: "alumni-network",
    description: "Questions and discussions with college alumni"
  },
  {
    id: "cat-9",
    name: "Academic Projects",
    slug: "academic-projects",
    description: "Questions about academic and research projects"
  }
];

// Mock Users
export const users = [
  {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Computer Science major, passionate about AI and machine learning.",
    socialLinks: {
      linkedin: "https://linkedin.com/in/alexjohnson",
      twitter: "https://twitter.com/alexj",
      github: "https://github.com/alexj"
    },
    createdAt: new Date("2023-01-15")
  },
  {
    id: "user-2",
    name: "Samantha Lee",
    email: "samantha@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    bio: "Business Administration student with a focus on marketing.",
    socialLinks: {
      linkedin: "https://linkedin.com/in/samanthalee",
      website: "https://samanthalee.com"
    },
    createdAt: new Date("2023-02-20")
  },
  {
    id: "user-3",
    name: "Marcus Chen",
    email: "marcus@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Psychology major interested in cognitive science and UX research.",
    socialLinks: {
      linkedin: "https://linkedin.com/in/marcuschen",
      twitter: "https://twitter.com/marcusc"
    },
    createdAt: new Date("2023-03-10")
  }
];

// Mock Answers
const answers = [
  {
    id: "ans-1",
    content: "I found that joining study groups really helps. Try checking the library or student center for postings.",
    author: users[1],
    upvotes: 12,
    createdAt: new Date("2023-09-15T10:30:00"),
    updatedAt: new Date("2023-09-15T10:30:00")
  },
  {
    id: "ans-2",
    content: "The tutoring center on the second floor of the library offers free sessions for most intro classes. They helped me a lot with calculus!",
    author: users[2],
    upvotes: 8,
    createdAt: new Date("2023-09-15T14:45:00"),
    updatedAt: new Date("2023-09-15T14:45:00")
  },
  {
    id: "ans-3",
    content: "Most departments have TAs that hold office hours. Check your course syllabus or ask your professor about TA availability.",
    author: users[0],
    upvotes: 15,
    createdAt: new Date("2023-09-16T09:20:00"),
    updatedAt: new Date("2023-09-16T09:20:00")
  },
  {
    id: "ans-4",
    content: "The Career Center typically hosts several throughout the semester. Check their website for the calendar. The Engineering department also does their own in October.",
    author: users[2],
    upvotes: 7,
    createdAt: new Date("2023-09-18T16:10:00"),
    updatedAt: new Date("2023-09-18T16:10:00")
  },
  {
    id: "ans-5",
    content: "I'd recommend using LaTeX for anything math-related. For humanities, Zotero is great for managing citations.",
    author: users[1],
    upvotes: 9,
    createdAt: new Date("2023-10-05T11:25:00"),
    updatedAt: new Date("2023-10-05T11:25:00")
  }
];

// Mock Questions
export const questions = [
  {
    id: "q-1",
    title: "Where can I find tutoring resources on campus?",
    content: "I'm struggling with some of my intro classes and would like to find tutoring. Are there any free resources available on campus?",
    author: users[0],
    category: {
      id: "cat-2",
      name: "Courses & Academics",
      slug: "courses-academics",
      description: "Questions about courses, majors, and academic programs"
    },
    upvotes: 24,
    likes: 18,
    answers: [answers[0], answers[1], answers[2]],
    createdAt: new Date("2023-09-15T08:20:00"),
    updatedAt: new Date("2023-09-15T08:20:00")
  },
  {
    id: "q-2",
    title: "When are the next job fairs happening?",
    content: "I'm starting to look for internships for next summer. Does anyone know when the next campus job fairs are scheduled?",
    author: users[1],
    category: {
      id: "cat-3",
      name: "Placement & Internship",
      slug: "placement-internship",
      description: "Questions about job placements and internship opportunities"
    },
    upvotes: 19,
    likes: 12,
    answers: [answers[3]],
    createdAt: new Date("2023-09-18T14:45:00"),
    updatedAt: new Date("2023-09-18T14:45:00")
  },
  {
    id: "q-3",
    title: "What software do you recommend for research papers?",
    content: "I have several research papers due this semester. What software or tools do you recommend for writing and organizing research?",
    author: users[2],
    category: {
      id: "cat-9",
      name: "Academic Projects",
      slug: "academic-projects",
      description: "Questions about academic and research projects"
    },
    upvotes: 31,
    likes: 26,
    answers: [answers[4]],
    createdAt: new Date("2023-10-05T09:15:00"),
    updatedAt: new Date("2023-10-05T09:15:00")
  },
  {
    id: "q-4",
    title: "Tips for managing course workload?",
    content: "I'm taking 18 credits this semester and feeling overwhelmed. Does anyone have tips for managing a heavy course load while still maintaining a decent sleep schedule?",
    author: users[0],
    category: {
      id: "cat-2",
      name: "Courses & Academics",
      slug: "courses-academics",
      description: "Questions about courses, majors, and academic programs"
    },
    upvotes: 45,
    likes: 38,
    answers: [],
    createdAt: new Date("2023-10-10T16:30:00"),
    updatedAt: new Date("2023-10-10T16:30:00")
  },
  {
    id: "q-5",
    title: "Best dorms for transfer students?",
    content: "I'm transferring next semester and trying to decide on housing. Which dorms would you recommend for a transfer student who wants a social atmosphere but also quiet study spaces?",
    author: users[1],
    category: {
      id: "cat-1",
      name: "Admissions",
      slug: "admissions",
      description: "Questions about college admissions process and requirements"
    },
    upvotes: 16,
    likes: 12,
    answers: [],
    createdAt: new Date("2023-10-12T11:05:00"),
    updatedAt: new Date("2023-10-12T11:05:00")
  }
];

// Get all questions sorted by upvotes
export const getQuestionsSortedByUpvotes = () => {
  return [...questions].sort((a, b) => b.upvotes - a.upvotes);
};

// Get questions by category
export const getQuestionsByCategory = (categorySlug) => {
  return questions.filter(question => question.category.slug.toLowerCase() === categorySlug.toLowerCase());
};

// Get question by ID
export const getQuestionById = (id) => {
  return questions.find(question => question.id === id);
};

// Search questions by title or content
export const searchQuestions = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return questions.filter(
    question => 
      question.title.toLowerCase().includes(lowercaseQuery) || 
      question.content.toLowerCase().includes(lowercaseQuery)
  );
};

export const colleges = [
  {
    id: 1,
    name: "MIT",
    description: "Massachusetts Institute of Technology",
    activeUsers: 15000,
    questionsCount: 2500,
    members: 18000,
    foundedYear: 1861,
    image: "https://images.unsplash.com/photo-1610720685796-45da0a1b0374?w=500&h=300&fit=crop",
    isJoined: false
  },
  {
    id: 2,
    name: "Stanford University",
    description: "Stanford University, California",
    activeUsers: 12000,
    questionsCount: 2000,
    members: 16000,
    foundedYear: 1885,
    image: "https://images.unsplash.com/photo-1610720685796-45da0a1b0374?w=500&h=300&fit=crop",
    isJoined: false
  },
  {
    id: 3,
    name: "Harvard University",
    description: "Harvard University, Massachusetts",
    activeUsers: 14000,
    questionsCount: 2200,
    members: 17000,
    foundedYear: 1636,
    image: "https://images.unsplash.com/photo-1610720685796-45da0a1b0374?w=500&h=300&fit=crop",
    isJoined: false
  }
];

export const getCollegesSortedByActivity = () => {
  return [...colleges].sort((a, b) => b.activeUsers - a.activeUsers);
}; 