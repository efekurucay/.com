import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * One-time seed endpoint to migrate static content to Firestore.
 * Protected by SEED_API_KEY env variable.
 * 
 * Usage: POST /api/admin/seed
 * Headers: { "x-seed-key": "<SEED_API_KEY>" }
 */
export async function POST(req: NextRequest) {
    // Verify seed key
    const seedKey = req.headers.get("x-seed-key");
    const expectedKey = process.env.SEED_API_KEY;

    if (!expectedKey || seedKey !== expectedKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getAdminDb();
        const results: Record<string, string> = {};

        // ==================== SETTINGS ====================

        // Person
        await db.collection("settings").doc("person").set({
            firstName: "Yahya Efe",
            lastName: "Kuruçay",
            role: "AI Powered Software Developer",
            avatar: "/images/avatar.jpg",
            location: "Europe/Istanbul",
            languages: [],
        });
        results.person = "✅";

        // Home
        await db.collection("settings").doc("home").set({
            headline: "Yahya Efe Kuruçay",
            subline:
                "I am Yahya Efe Kuruçay, a creative and inquisitive Computer Science & Engineering student who thrives on generating innovative ideas and shaping them into impactful technologies. My focus areas include **Software Engineering**, **Artificial Intelligence**, and **Full-Stack Development**. I'm not just coding—I'm envisioning solutions that address real challenges. I enjoy questioning norms, exploring new perspectives, and crafting scalable systems rooted in practicality. Passionate about bridging imagination and execution, I aim to develop technologies that inspire, empower, and transform our future.\n\nI am always open to new opportunities and collaborations. If you have a project in mind or just want to connect, feel free to reach out via my social media links or email.",
        });
        results.home = "✅";

        // About
        await db.collection("settings").doc("about").set({
            introTitle: "Introduction",
            introDescription:
                "I am a Computer Science & Engineering student with a passion for creating innovative solutions through technology. My focus areas include **Software Engineering**, Artificial Intelligence, and Full-Stack Development.",
            tableOfContentDisplay: true,
            tableOfContentSubItems: false,
            avatarDisplay: true,
            calendarDisplay: true,
            calendarLink: "https://efekurucay.com/",
            workDisplay: true,
            workTitle: "Work Experience",
            studiesDisplay: true,
            studiesTitle: "Education",
            technicalDisplay: true,
            technicalTitle: "Technical skills",
            organizationsDisplay: true,
            organizationsTitle: "Organizations",
            certificationsDisplay: true,
            certificationsTitle: "Certifications",
        });
        results.about = "✅";

        // Contact settings
        await db.collection("settings").doc("contact").set({
            title: "Get in touch",
            description: "Have a question or a project in mind? Let's talk.",
        });
        results.contact = "✅";

        // Blog settings
        await db.collection("settings").doc("blog").set({
            label: "Blog",
            title: "Writing about tech...",
            description: "Read what Yahya Efe Kuruçay has been up to recently",
        });
        results.blog = "✅";

        // Work settings
        await db.collection("settings").doc("work").set({
            label: "Work",
            title: "My projects",
            description: "Design and dev projects by Yahya Efe Kuruçay",
        });
        results.work = "✅";

        // Chat settings
        await db.collection("settings").doc("chat").set({
            label: "AI Chat",
        });
        results.chat = "✅";

        // SiteConfig
        await db.collection("settings").doc("siteConfig").set({
            theme: "dark",
            neutral: "gray",
            brand: "blue",
            accent: "orange",
            solid: "contrast",
            solidStyle: "flat",
            border: "playful",
            surface: "translucent",
            transition: "all",
            scaling: "normal",
            mask: { cursor: true, x: 0, y: 0, radius: 75 },
            gradient: {
                display: true,
                x: 50,
                y: 0,
                width: 100,
                height: 100,
                tilt: 0,
                colorStart: "brand-background-strong",
                colorEnd: "static-transparent",
                opacity: 50,
            },
            dots: {
                display: true,
                size: 2,
                color: "brand-on-background-weak",
                opacity: 20,
            },
            lines: {
                display: false,
                color: "neutral-alpha-weak",
                opacity: 100,
            },
            grid: {
                display: false,
                color: "neutral-alpha-weak",
                width: 100,
                height: 100,
                opacity: 100,
            },
            displayLocation: true,
            displayTime: true,
        });
        results.siteConfig = "✅";

        // ==================== SOCIAL LINKS ====================
        const socials = [
            { name: "GitHub", icon: "github", link: "https://github.com/efekurucay", order: 0 },
            { name: "LinkedIn", icon: "linkedin", link: "https://www.linkedin.com/in/efekurucay24", order: 1 },
            { name: "X", icon: "x", link: "https://x.com/efekurucay24", order: 2 },
            { name: "Email", icon: "email", link: "mailto:contact@efekurucay.com", order: 3 },
        ];
        for (const s of socials) {
            await db.collection("social").add(s);
        }
        results.social = `✅ (${socials.length} items)`;

        // ==================== EXPERIENCES (work type) ====================
        const workExperiences = [
            {
                company: "Acunmedya Akademi",
                timeframe: "01/2025 - 03/2025",
                role: "AI Development Intern",
                achievements: [
                    "I improved myself in the fields of machine learning, deep learning and model development.",
                ],
                images: [],
                type: "work",
                order: 0,
                visible: true,
            },
            {
                company: "417 Akademi",
                timeframe: "2024 - 2025",
                role: "Private Math Tutor",
                achievements: [
                    "Provided personalized tutoring for middle and high school students, improving their problem-solving skills and academic performance.",
                    "Developed effective teaching strategies and tailored educational materials to meet individual student needs.",
                ],
                images: [],
                type: "work",
                order: 1,
                visible: true,
            },
            {
                company: "EFE GSM",
                timeframe: "2022 - seasonal",
                role: "Repair Technician & Sales Representative",
                achievements: [
                    "I can say that I have about 10 years of experience in repairing mobile phones and selling accessories. My father's profession.",
                ],
                images: [],
                type: "work",
                order: 2,
                visible: true,
            },
            {
                company: "ALANYA KALESPOR",
                timeframe: "06/22 - 05/23",
                role: "Graphic Designer & Assistant Trainer",
                achievements: [
                    "Designed visual content for social media and web, focusing on brand identity and engagement, while also assisting in coaching young athletes to develop their skills and team coordination.",
                ],
                images: [],
                type: "work",
                order: 3,
                visible: true,
            },
        ];
        for (const exp of workExperiences) {
            await db.collection("experiences").add(exp);
        }
        results.workExperiences = `✅ (${workExperiences.length} items)`;

        // ==================== EXPERIENCES (organization type) ====================
        const orgExperiences = [
            {
                company: "BİLMÖK",
                timeframe: "04/2024 - 11/2024",
                role: "Software Developer",
                achievements: [
                    "Working part-time as a software developer, combining studies with practical experience.",
                    "Applying and enhancing software development skills on real projects, collaborating with the team to achieve successful outcomes.",
                ],
                images: [],
                type: "organization",
                order: 0,
                visible: true,
            },
            {
                company: "International Conference on CSE",
                timeframe: "27,28,29/10/2024",
                role: "Presenter",
                achievements: [
                    "International Conference on CSE [27,28,29/10/2024], Presenter",
                ],
                images: [],
                type: "organization",
                order: 1,
                visible: true,
            },
            {
                company: "Huawei Student Developers Akdeniz",
                timeframe: "03/24 – 03/25",
                role: "Campus Ambassador",
                achievements: ["HUAWEI [03/24 – 03/25], Campus Ambassador"],
                images: [],
                type: "organization",
                order: 2,
                visible: true,
            },
        ];
        for (const exp of orgExperiences) {
            await db.collection("experiences").add(exp);
        }
        results.orgExperiences = `✅ (${orgExperiences.length} items)`;

        // ==================== EDUCATION ====================
        const educationItems = [
            {
                name: "Akdeniz University",
                description:
                    "Computer Science & Engineering (English) | 09/2022 - present | 3th Grade - 3.09 GPA",
                order: 0,
            },
        ];
        for (const edu of educationItems) {
            await db.collection("education").add(edu);
        }
        results.education = `✅ (${educationItems.length} items)`;

        // ==================== SKILLS ====================
        const skillItems = [
            {
                title: "Programming Languages & Frameworks",
                description:
                    "Python, Java, C#, HTML, CSS, JS, AI Prompting, Graphic Design, angular, spring boot",
                images: [],
                order: 0,
            },
            {
                title: "Database & Backend",
                description: "MySQL, Firebase, Supabase",
                images: [],
                order: 1,
            },
            {
                title: "Soft Skills",
                description:
                    "Taking Initiative And Responsibility, Good Communication Skills, Good command of English in both spoken and writing",
                images: [],
                order: 2,
            },
        ];
        for (const skill of skillItems) {
            await db.collection("skills").add(skill);
        }
        results.skills = `✅ (${skillItems.length} items)`;

        // ==================== CERTIFICATIONS ====================
        const certItems = [
            { name: "AWS Cloud Essentials", role: "Certified", order: 0 },
        ];
        for (const cert of certItems) {
            await db.collection("certifications").add(cert);
        }
        results.certifications = `✅ (${certItems.length} items)`;

        // ==================== BLOG POSTS (from MDX) ====================
        const blogDir = path.join(process.cwd(), "src", "app", "blog", "posts");
        let postCount = 0;
        if (fs.existsSync(blogDir)) {
            const mdxFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));
            for (const file of mdxFiles) {
                const filePath = path.join(blogDir, file);
                const raw = fs.readFileSync(filePath, "utf-8");
                const { data, content } = matter(raw);
                const slug = path.basename(file, ".mdx");

                await db.collection("posts").add({
                    title: data.title || slug,
                    slug,
                    content, // raw markdown content
                    image: data.image || "",
                    summary: data.summary || "",
                    publishedAt: data.publishedAt || "",
                    updatedAt: "",
                    tags: data.tags || [],
                    team: data.team || [],
                    link: data.link || "",
                    visible: true,
                });
                postCount++;
            }
        }
        results.posts = `✅ (${postCount} items)`;

        // ==================== PROJECTS (from MDX) ====================
        const projectDir = path.join(process.cwd(), "src", "app", "work", "projects");
        let projectCount = 0;
        if (fs.existsSync(projectDir)) {
            const mdxFiles = fs.readdirSync(projectDir).filter((f) => f.endsWith(".mdx"));
            for (const file of mdxFiles) {
                const filePath = path.join(projectDir, file);
                const raw = fs.readFileSync(filePath, "utf-8");
                const { data, content } = matter(raw);
                const slug = path.basename(file, ".mdx");

                await db.collection("projects").add({
                    title: data.title || slug,
                    slug,
                    content,
                    images: data.images || [],
                    image: data.image || "",
                    summary: data.summary || "",
                    publishedAt: data.publishedAt || "",
                    updatedAt: "",
                    team: data.team || [],
                    tags: data.tags || [],
                    link: data.link || "",
                    visible: true,
                });
                projectCount++;
            }
        }
        results.projects = `✅ (${projectCount} items)`;

        return NextResponse.json({
            success: true,
            message: "Seed completed successfully!",
            results,
        });
    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Seed failed", details: error.message },
            { status: 500 }
        );
    }
}
