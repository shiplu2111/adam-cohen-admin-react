export const stats = [
  { label: "Total Revenue", value: "$284,920", change: "+12.4%", trend: "up" },
  { label: "Active Members", value: "8,420", change: "+5.2%", trend: "up" },
  { label: "Projects Live", value: "47", change: "+3", trend: "up" },
  { label: "Pending Inquiries", value: "23", change: "-8.1%", trend: "down" },
];

export const revenueData = [
  { month: "Jan", revenue: 18200, leads: 120 },
  { month: "Feb", revenue: 22400, leads: 145 },
  { month: "Mar", revenue: 26800, leads: 180 },
  { month: "Apr", revenue: 24100, leads: 165 },
  { month: "May", revenue: 31500, leads: 210 },
  { month: "Jun", revenue: 38900, leads: 245 },
  { month: "Jul", revenue: 42100, leads: 268 },
  { month: "Aug", revenue: 47800, leads: 290 },
];

export const trafficData = [
  { name: "Organic", value: 4200 },
  { name: "Direct", value: 2800 },
  { name: "Social", value: 1900 },
  { name: "Referral", value: 1100 },
];

export const recentActivity = [
  { id: 1, user: "Sarah Chen", action: "submitted a contact form", time: "2 min ago", type: "contact" },
  { id: 2, user: "Marcus Reid", action: "subscribed to podcast", time: "12 min ago", type: "podcast" },
  { id: 3, user: "Lena Park", action: "left a 5-star testimonial", time: "1 hour ago", type: "testimonial" },
  { id: 4, user: "Owen Hart", action: "downloaded brochure", time: "3 hours ago", type: "download" },
  { id: 5, user: "Mira Sato", action: "purchased Apex Pro", time: "5 hours ago", type: "purchase" },
];

export const projects = [
  { id: "p1", title: "Aurora Tower Rebrand", client: "Aurora Group", status: "Live", category: "Branding", date: "2025-08-12" },
  { id: "p2", title: "Helix Mobile App", client: "Helix Labs", status: "In Progress", category: "Product", date: "2025-09-01" },
  { id: "p3", title: "Vantage Campaign", client: "Vantage Media", status: "Live", category: "Marketing", date: "2025-07-22" },
  { id: "p4", title: "Northwind Site", client: "Northwind Co.", status: "Draft", category: "Web", date: "2025-09-15" },
  { id: "p5", title: "Sable Identity", client: "Sable Studios", status: "Live", category: "Branding", date: "2025-06-04" },
];

export const services = [
  { id: "s1", name: "Brand Strategy", price: 4800, active: true, bookings: 28 },
  { id: "s2", name: "Web Experience", price: 9200, active: true, bookings: 41 },
  { id: "s3", name: "Performance Marketing", price: 3600, active: true, bookings: 67 },
  { id: "s4", name: "Podcast Production", price: 2400, active: false, bookings: 12 },
];

export const podcasts = [
  { id: "pc1", title: "Building Premium Brands", host: "Alex Morgan", duration: "42:18", plays: 12480, published: "2025-08-20" },
  { id: "pc2", title: "Designing for Trust", host: "Lena Park", duration: "38:02", plays: 9320, published: "2025-08-06" },
  { id: "pc3", title: "Scaling Without Losing Soul", host: "Marcus Reid", duration: "51:44", plays: 18200, published: "2025-07-18" },
];

export const testimonials = [
  { id: "t1", author: "Sarah Chen", role: "CEO, Aurora Group", rating: 5, text: "Apex transformed our identity. The attention to craft is unmatched.", approved: true },
  { id: "t2", author: "Marcus Reid", role: "Founder, Helix Labs", rating: 5, text: "From strategy to launch — flawless execution.", approved: true },
  { id: "t3", author: "Owen Hart", role: "CMO, Vantage", rating: 4, text: "Sharp thinking, on-brief, on-time.", approved: false },
];

export const contacts = [
  { id: "c1", name: "Jordan Blake", email: "jordan@northwind.co", subject: "Website project inquiry", date: "2025-09-18", status: "new" },
  { id: "c2", name: "Priya Anand", email: "priya@helix.io", subject: "Brand strategy partnership", date: "2025-09-17", status: "replied" },
  { id: "c3", name: "Tom Becker", email: "tom@sablestudios.com", subject: "Podcast collaboration", date: "2025-09-15", status: "new" },
];

export const emails = [
  {
    id: "e1",
    from: "Sarah Chen",
    fromEmail: "sarah@aurora.com",
    subject: "Re: Phase 2 timeline",
    preview: "Thanks for the update — could we move the design review up by a week?",
    body: "Hi Alex,\n\nThanks for the update. Could we move the design review up by a week? Our board meeting got pushed forward and we'd love to share progress.\n\nBest,\nSarah",
    date: "2025-09-18 09:14",
    read: false,
    starred: true,
  },
  {
    id: "e2",
    from: "Marcus Reid",
    fromEmail: "marcus@helix.io",
    subject: "Podcast guest slot",
    preview: "Loved the latest episode. I'd be honored to come on as a guest.",
    body: "Hi team,\n\nLoved the latest episode on premium brands. I'd be honored to come on as a guest. Available most Thursdays.\n\nMarcus",
    date: "2025-09-17 16:42",
    read: true,
    starred: false,
  },
  {
    id: "e3",
    from: "Lena Park",
    fromEmail: "lena@sable.studio",
    subject: "Invoice #2034",
    preview: "Quick note — invoice has been paid. Looking forward to next sprint.",
    body: "Hi,\n\nInvoice #2034 has been paid. Looking forward to kicking off the next sprint!\n\nLena",
    date: "2025-09-16 11:08",
    read: true,
    starred: false,
  },
  {
    id: "e4",
    from: "Owen Hart",
    fromEmail: "owen@vantage.media",
    subject: "Q4 campaign assets",
    preview: "Here are the assets you requested for the Q4 push.",
    body: "Hey,\n\nAttaching the assets you requested for the Q4 push. Let me know if you need anything in different formats.\n\nOwen",
    date: "2025-09-15 14:30",
    read: false,
    starred: false,
  },
];

export const notifications = [
  { id: "n1", title: "New contact submission", desc: "Jordan Blake sent an inquiry", time: "5m ago", unread: true, type: "info" },
  { id: "n2", title: "Payment received", desc: "$4,800 from Aurora Group", time: "1h ago", unread: true, type: "success" },
  { id: "n3", title: "Server warning", desc: "CPU usage above 80%", time: "3h ago", unread: true, type: "warning" },
  { id: "n4", title: "New testimonial", desc: "Sarah Chen left 5 stars", time: "1d ago", unread: false, type: "info" },
];

export const weeklyZoom = {
  title: "Apex Weekly Mastermind",
  host: "Alex Morgan",
  day: "Every Thursday",
  time: "6:00 PM – 7:30 PM (UTC)",
  zoomLink: "https://zoom.us/j/9182736455",
  meetingId: "918 273 6455",
  passcode: "ASCEND",
  description: "Live strategy session with the Apex team — open Q&A, hot seats, and weekly wins.",
};

export const upcomingEvents = [
  { id: "ev1", title: "Brand Strategy Workshop", date: "2025-10-04", time: "10:00", location: "Online · Zoom", capacity: 100, registered: 78, status: "open" },
  { id: "ev2", title: "Apex Founders Dinner", date: "2025-10-12", time: "19:00", location: "London, UK", capacity: 30, registered: 30, status: "full" },
  { id: "ev3", title: "Podcast Live Recording", date: "2025-10-18", time: "16:00", location: "Online · YouTube", capacity: 500, registered: 312, status: "open" },
  { id: "ev4", title: "Year-End Summit 2025", date: "2025-12-05", time: "09:00", location: "Lisbon, Portugal", capacity: 200, registered: 54, status: "early-bird" },
];

export const eventRegistrations = [
  { id: "rg1", event: "Brand Strategy Workshop", name: "Sarah Chen", email: "sarah@aurora.com", date: "2025-09-20", status: "confirmed" },
  { id: "rg2", event: "Brand Strategy Workshop", name: "Marcus Reid", email: "marcus@helix.io", date: "2025-09-21", status: "confirmed" },
  { id: "rg3", event: "Apex Founders Dinner", name: "Lena Park", email: "lena@sable.studio", date: "2025-09-19", status: "waitlist" },
  { id: "rg4", event: "Podcast Live Recording", name: "Owen Hart", email: "owen@vantage.media", date: "2025-09-22", status: "confirmed" },
  { id: "rg5", event: "Year-End Summit 2025", name: "Mira Sato", email: "mira@apex.io", date: "2025-09-18", status: "pending" },
  { id: "rg6", event: "Brand Strategy Workshop", name: "Jordan Blake", email: "jordan@northwind.co", date: "2025-09-23", status: "confirmed" },
  { id: "rg7", event: "Podcast Live Recording", name: "Priya Anand", email: "priya@helix.io", date: "2025-09-22", status: "cancelled" },
];

export const callBookings = [
  { id: "cb1", name: "Sarah Chen", email: "sarah@aurora.com", topic: "Rebrand discovery", date: "2025-09-25", time: "14:00", duration: "30 min", status: "confirmed" },
  { id: "cb2", name: "Marcus Reid", email: "marcus@helix.io", topic: "Growth strategy", date: "2025-09-26", time: "11:00", duration: "60 min", status: "pending" },
  { id: "cb3", name: "Owen Hart", email: "owen@vantage.media", topic: "Q4 campaign review", date: "2025-09-27", time: "16:30", duration: "45 min", status: "confirmed" },
];

export const PERMISSIONS = [
  "dashboard.view",
  "users.view", "users.create", "users.edit", "users.delete",
  "roles.view", "roles.create", "roles.edit", "roles.delete",
  "projects.view", "projects.manage",
  "services.view", "services.manage",
  "podcasts.view", "podcasts.manage",
  "testimonials.view", "testimonials.manage",
  "contacts.view", "contacts.manage",
  "emails.view", "emails.reply",
  "settings.view", "settings.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: Permission[];
}

export const initialRoles: Role[] = [
  {
    id: "r1", name: "Super Admin", description: "Full access to everything", users: 2,
    permissions: [...PERMISSIONS],
  },
  {
    id: "r2", name: "Editor", description: "Manage content but not users or settings", users: 8,
    permissions: ["dashboard.view", "projects.view", "projects.manage", "services.view", "services.manage", "podcasts.view", "podcasts.manage", "testimonials.view", "testimonials.manage", "emails.view", "emails.reply"],
  },
  {
    id: "r3", name: "Support", description: "Read content, reply to emails", users: 4,
    permissions: ["dashboard.view", "contacts.view", "contacts.manage", "emails.view", "emails.reply"],
  },
  {
    id: "r4", name: "Viewer", description: "Read-only access", users: 12,
    permissions: ["dashboard.view", "projects.view", "services.view", "podcasts.view", "testimonials.view", "contacts.view", "emails.view"],
  },
];
