import { InlineCode } from "@/once-ui/components";

const person = {
  firstName: "Yahya Efe",
  lastName: "Kuruçay",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "AI Powered Software Developer",
  avatar: "/images/avatar.jpg",
  location: "Europe/Istanbul", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: [], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: (
    <>
      I occasionally write about design, technology, and share thoughts on the intersection of
      creativity and engineering.
    </>
  ),
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
     <br />
    

    I am a Computer Science & Engineering student with a passion for creating innovative solutions through technology. My focus areas 
    include <InlineCode>Software Engineering</InlineCode>, Artificial Intelligence, and Full-Stack Development.
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
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  label: "Work",
  title: "My projects",
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
 
};

const gallery = {
  label: "Gallery",
  title: "My photo gallery",
  description: `A photo collection by ${person.name}`,
  // Images from https://pexels.com
  images: [
    {
      src: "/images/gallery/img-01.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-02.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-03.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-04.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-05.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-06.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-07.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-08.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-09.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-10.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-11.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-12.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-13.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-14.jpg",
      alt: "image",
      orientation: "horizontal",
    },
  ],
};

const chat = {
  label: "AI Chat",
};

const contact = {
  label: "Contact",
  title: "Get in touch",
  description: "Have a question or a project in mind? Let's talk.",
};

export { person, social, newsletter, home, about, blog, work, gallery, chat, contact };
