import { InlineCode } from "@/once-ui/components";

const person = {
  firstName: "Yahya Efe",
  lastName: "Kuruçay",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "AI Powered Software Developer",
  avatar: "/images/avatar.jpg",
  location: "Europe/Istanbul", // IANA time zone identifier
  languages: [], // optional: Leave the array empty if you don't want to display languages
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/efekurucay",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/efekurucay24",
  },
  {
    name: "X",
    icon: "x",
    link: "https://x.com/efekurucay24",
  },
  {
    name: "Email",
    icon: "email",
    link: "mailto:contact@efekurucay.com",
  },


];

const home = {
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Yahya Efe Kuruçay</>,
  subline: (
    <>
      I am Yahya Efe Kuruçay, a creative and inquisitive Computer Science & Engineering student who thrives on generating innovative ideas and shaping them into impactful technologies. My focus areas include <InlineCode>Software Engineering</InlineCode>, <InlineCode>Artificial Intelligence</InlineCode>, and <InlineCode>Full-Stack Development</InlineCode>. I’m not just coding—I’m envisioning solutions that address real challenges. I enjoy questioning norms, exploring new perspectives, and crafting scalable systems rooted in practicality. Passionate about bridging imagination and execution, I aim to develop technologies that inspire, empower, and transform our future.
      <br />
      <br />
      I am always open to new opportunities and collaborations. If you have a project in mind or just want to connect, feel free to reach out via my social media links or email.
    </>
  ),
};

const about = {
  label: "About",
  title: "About me",
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://efekurucay.com/",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I am a Computer Science & Engineering student with a passion for creating innovative solutions through technology. My focus areas
        include <InlineCode>Software Engineering</InlineCode>, Artificial Intelligence, and Full-Stack Development.

      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "Acunmedya Akademi",
        timeframe: "01/2025 - 03/2025",
        role: "AI Development Intern",
        achievements: [
          <>
            I improved myself in the fields of machine learning, deep learning and model development.
          </>,

        ],
        images: [],
      },
      {
        company: "417 Akademi",
        timeframe: "2024 - 2025",
        role: "Private Math Tutor",
        achievements: [
          <>
            Provided personalized tutoring for middle and high school students, improving their problem-solving skills and academic performance.
          </>,
          <>
            Developed effective teaching strategies and tailored educational materials to meet individual student needs.
          </>,
        ],
        images: [],
      },

      {
        company: "EFE GSM",
        timeframe: "2022 - seasonal",
        role: "Repair Technician & Sales Representative",
        achievements: [
          <>
            I can say that I have about 10 years of experience in repairing mobile phones and selling accessories. My father's profession.
          </>,
        ],
        images: [],

      },

      {
        company: "ALANYA KALESPOR",
        timeframe: "06/22 - 05/23",
        role: "Graphic Designer & Assistant Trainer",
        achievements: [
          <>
            Designed visual content for social media and web, focusing on brand identity and engagement, while also assisting in coaching
            young athletes to develop their skills and team coordination.
          </>,
        ],
        images: [],
      },

    ],

  },
  studies: {
    display: true, // set to false to hide this section
    title: "Education",
    institutions: [
      {
        name: "Akdeniz University",
        description: <>Computer Science & Engineering (English) | 09/2022 - present | 3th Grade - 3.09 GPA</>,
      },

    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [

      {
        title: "Programming Languages & Frameworks",
        description: <>Python, Java, C#, HTML, CSS, JS,  AI Prompting, Graphic Design, angular, spring boot</>,
        images: [],
      },
      {
        title: "Database & Backend",
        description: <>MySQL, Firebase, Supabase</>,
        images: [],
      },
      {
        title: "Soft Skills",
        description: <>Taking Initiative And Responsibility, Good Communication Skills, Good command of English in both spoken and writing</>,
        images: [],
      },
    ],
  },

  organizations: {
    display: true, // set to false to hide this section
    title: "Organizations",
    experiences: [
      {
        company: "BİLMÖK",
        timeframe: "04/2024 - 11/2024",
        role: "Software Developer",
        achievements: [
          <>
            Working part-time as a software developer, combining studies with practical experience.
          </>,
          <>
            Applying and enhancing software development skills on real projects, collaborating with the team to achieve successful outcomes.
          </>,
        ],
        images: [],
      },
      {
        company: "International Conference on CSE",
        timeframe: "27,28,29/10/2024",
        role: "Presenter",
        achievements: [
          <>
            International Conference on CSE [27,28,29/10/2024], Presenter
          </>,
        ],
        images: [],
      },
      {
        company: "Huawei Student Developers Akdeniz",
        timeframe: "03/24 – 03/25",
        role: "Campus Ambassador ",
        achievements: [
          <>
            HUAWEI [03/24 – 03/25], Campus Ambassador
          </>,
        ],
        images: [],
      },

    ],


  },
  certifications: {
    display: true, // set to false to hide this section
    title: "Certifications",
    items: [
      {
        name: "AWS Cloud Essentials",
        role: "Certified",
      },
    ],
  },
};

const blog = {
  label: "Blog",
  title: "Writing about tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Blog posts are managed in Firestore via the admin panel.
};

const work = {
  label: "Work",
  title: "My projects",
  description: `Design and dev projects by ${person.name}`,
  // Projects are managed in Firestore via the admin panel.

};

const chat = {
  label: "AI Chat",
};

const contact = {
  label: "Contact",
  title: "Get in touch",
  description: "Have a question or a project in mind? Let's talk.",
};

export { person, social, home, about, blog, work, chat, contact };
