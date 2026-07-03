export interface SystemDesignProblem {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    description: string;
    companies: string[];
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    scaleEstimations: string[];
}

export const SYSTEM_DESIGN_PROBLEMS: SystemDesignProblem[] = [
    {
        id: "tinyurl",
        title: "Design a URL Shortener (TinyURL)",
        difficulty: "Easy",
        description: "Design a scalable URL shortening service like TinyURL or bit.ly. The service should allow users to convert long URLs into short, unique aliases and redirect users to the original URL when they access the short alias.",
        companies: ["Google", "Meta", "Amazon", "Microsoft"],
        functionalRequirements: [
            "Given a long URL, generate a unique, shorter alias.",
            "When a user accesses the short link, redirect them to the original long URL.",
            "Users should optionally be able to pick a custom short link (alias) for their URL.",
            "Links should expire after a default timespan, but users should be able to specify the expiration time."
        ],
        nonFunctionalRequirements: [
            "Highly available: The system should be up 99.99% of the time.",
            "Low latency: URL redirection should happen in milliseconds.",
            "Scalable: The system should handle millions of reads/writes per day.",
            "Durable: Short links should persist for the configured duration.",
            "Security: Prevent brute-forcing of shortened links."
        ],
        scaleEstimations: [
            "100 million new URLs shortened per month.",
            "10:1 Read to Write ratio: 1 billion URL redirections per month.",
            "100M * 500 bytes per URL = 50GB storage per month.",
            "5-year storage estimation: 50GB * 60 months = 3 Terabytes.",
            "New write QPS = 100M / (30 * 24 * 3600) = ~38 writes/second.",
            "Read redirection QPS = 1B / (30 * 24 * 3600) = ~385 reads/second."
        ]
    },
    {
        id: "instagram",
        title: "Design Instagram (Photo Sharing)",
        difficulty: "Medium",
        description: "Design a photo-sharing social networking service like Instagram where users can upload photos, follow other users, and view a feed of photos from people they follow.",
        companies: ["Meta", "Google", "Snapchat"],
        functionalRequirements: [
            "Users should be able to upload (post) photos and view them.",
            "Users can follow/unfollow other users.",
            "Users can view a timeline/news feed containing top posts from all followed users.",
            "Users can search for photos based on tags or titles."
        ],
        nonFunctionalRequirements: [
            "Highly available feed generation: Viewers should see updates quickly.",
            "Low latency for feed rendering: Under 200ms.",
            "Read-heavy traffic: Reads will be much more frequent than photo uploads.",
            "Reliability: Uploaded photos must never be lost."
        ],
        scaleEstimations: [
            "100 million active users per day.",
            "1 million new photo uploads per day.",
            "Average photo size = 200KB.",
            "Daily storage required = 1M * 200KB = 200GB/day.",
            "Total storage over 5 years = 200GB * 365 * 5 = ~365 Terabytes."
        ]
    },
    {
        id: "rate-limiter",
        title: "Design a Rate Limiter",
        difficulty: "Medium",
        description: "Design a distributed rate limiter that limits the number of requests a user can send to an API within a specific time window to protect servers from overload and DDoS attacks.",
        companies: ["Stripe", "Google", "Lyft", "Airbnb"],
        functionalRequirements: [
            "Limit the number of requests a client can make to a specific endpoint.",
            "Return clear HTTP error codes (e.g. 429 Too Many Requests) when limits are exceeded.",
            "Support configurable rules (e.g. 100 requests per minute per IP)."
        ],
        nonFunctionalRequirements: [
            "Low latency: The rate limiter must add minimal overhead (under 5ms) to incoming HTTP requests.",
            "Accuracy: Rate limiting should be accurate across multiple distributed nodes.",
            "High availability & Fault tolerance: If the rate limiting service fails, it should not bring down the main API servers."
        ],
        scaleEstimations: [
            "1 million active users calling API endpoints.",
            "Total API traffic: 10,000 requests per second (RPS).",
            "Limiter metadata size per user = ~32 bytes (IP + counter + timestamp).",
            "In-memory storage (Redis) required = 1M * 32 bytes = 32 Megabytes (highly efficient)."
        ]
    }
];
