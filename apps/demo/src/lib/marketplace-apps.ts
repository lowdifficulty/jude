export type JudeIconType =
  | "email"
  | "calendar"
  | "contacts"
  | "reminders"
  | "phone"
  | "phone-ai"
  | "weather"
  | "news"
  | "emergency"
  | "family"
  | "caregiver"
  | "medication"
  | "shield"
  | "smarthome"
  | "homeassistant"
  | "lighting"
  | "music"
  | "maps"
  | "health"
  | "wearables"
  | "banking"
  | "rides"
  | "food"
  | "packages"
  | "documents"
  | "photos"
  | "video"
  | "speaker"
  | "tv"
  | "events"
  | "social"
  | "maintenance"
  | "garden"
  | "pet"
  | "grocery"
  | "webhook"
  | "automation"
  | "manual"
  | "thermostat"
  | "lock"
  | "garage"
  | "camera"
  | "games";

export type MarketplaceCategoryId =
  | "daily-planning"
  | "email-messages"
  | "phone-calls"
  | "family-caregivers"
  | "health-wearables"
  | "medication-care"
  | "smart-home"
  | "home-safety"
  | "music-entertainment"
  | "maps-rides"
  | "food-grocery"
  | "money-bills"
  | "photos-memories"
  | "documents"
  | "local-events"
  | "pets"
  | "home-maintenance"
  | "developer-tools"
  | "manual-connections"
  | "news-briefings"
  | "weather"
  | "games";

export type MarketplaceAppId =
  | "gmail"
  | "outlook-mail"
  | "google-calendar"
  | "outlook-calendar"
  | "google-contacts"
  | "phone-contacts"
  | "jude-reminders"
  | "jude-ai-phone-answering"
  | "weather"
  | "positive-news"
  | "emergency-contacts"
  | "family-check-ins"
  | "caregiver-dashboard"
  | "manual-medication-manager"
  | "scam-protection"
  | "smartthings"
  | "home-assistant"
  | "philips-hue"
  | "spotify"
  | "google-maps"
  | "apple-health"
  | "android-health-connect"
  | "fitbit"
  | "withings"
  | "plaid-banking"
  | "uber"
  | "lyft"
  | "doordash"
  | "uber-eats"
  | "instacart"
  | "amazon-orders"
  | "package-tracking"
  | "google-drive"
  | "manual-document-upload"
  | "google-photos"
  | "manual-photo-upload"
  | "youtube"
  | "sonos"
  | "roku"
  | "eventbrite"
  | "meetup"
  | "home-maintenance"
  | "pet-profile"
  | "grocery-list"
  | "custom-webhook"
  | "zapier"
  | "make"
  | "manual-app-connection"
  | "dropbox"
  | "apple-music"
  | "apple-calendar"
  | "apple-contacts"
  | "apple-photos"
  | "walmart-order-emails"
  | "target-order-emails"
  | "chewy-order-emails"
  | "ticketmaster"
  | "bandsintown"
  | "nextdoor"
  | "gardening"
  | "smart-thermostat"
  | "smart-locks"
  | "garage-door"
  | "doorbell-camera"
  | "games";

export type MarketplaceApp = {
  id: MarketplaceAppId;
  icon: JudeIconType;
  category: MarketplaceCategoryId;
  tier: 1 | 2 | 3;
  launch25?: boolean;
  needsZip?: boolean;
  good: {
    name: string;
    tagline: string;
    detail: string;
    providers: string[];
  };
  evil: {
    name: string;
    tagline: string;
    detail: string;
    providers: string[];
  };
};

export const MARKETPLACE_CATEGORIES: { id: MarketplaceCategoryId; label: string }[] = [
  { id: "daily-planning", label: "Daily Planning" },
  { id: "email-messages", label: "Email & Messages" },
  { id: "phone-calls", label: "Phone & Calls" },
  { id: "family-caregivers", label: "Family & Caregivers" },
  { id: "health-wearables", label: "Health & Wearables" },
  { id: "medication-care", label: "Medication & Care" },
  { id: "smart-home", label: "Smart Home" },
  { id: "home-safety", label: "Home Safety" },
  { id: "music-entertainment", label: "Music & Entertainment" },
  { id: "maps-rides", label: "Maps & Rides" },
  { id: "food-grocery", label: "Food & Grocery" },
  { id: "money-bills", label: "Money & Bills" },
  { id: "photos-memories", label: "Photos & Memories" },
  { id: "documents", label: "Documents" },
  { id: "local-events", label: "Local Events" },
  { id: "pets", label: "Pets" },
  { id: "home-maintenance", label: "Home Maintenance" },
  { id: "developer-tools", label: "Developer Tools" },
  { id: "manual-connections", label: "Manual Connections" },
  { id: "news-briefings", label: "News & Briefings" },
  { id: "weather", label: "Weather" },
  { id: "games", label: "Games" },
];

type AppDef = {
  id: MarketplaceAppId;
  icon: JudeIconType;
  category: MarketplaceCategoryId;
  tier: 1 | 2 | 3;
  launch25?: boolean;
  needsZip?: boolean;
  providers: string[];
  good: { name: string; tagline: string; detail: string };
  evil: { name: string; tagline: string; detail: string };
};

function app(def: AppDef): MarketplaceApp {
  return {
    id: def.id,
    icon: def.icon,
    category: def.category,
    tier: def.tier,
    launch25: def.launch25,
    needsZip: def.needsZip,
    good: { ...def.good, providers: def.providers },
    evil: { ...def.evil, providers: def.providers },
  };
}

export const MARKETPLACE_APPS: MarketplaceApp[] = [
  // ── Tier 1 · Best First 25 Launch Apps ──
  app({
    id: "gmail",
    icon: "email",
    category: "email-messages",
    tier: 1,
    launch25: true,
    providers: ["Gmail"],
    good: {
      name: "Gmail",
      tagline: "Important mail, read aloud",
      detail: "Jude highlights family, doctors, and bills — then reads what matters in plain English.",
    },
    evil: {
      name: "Gmail Surveillance",
      tagline: "Every thread, indexed",
      detail: "Jude scans Gmail, flags threats, and surfaces what you cannot ignore.",
    },
  }),
  app({
    id: "outlook-mail",
    icon: "email",
    category: "email-messages",
    tier: 1,
    launch25: true,
    providers: ["Outlook Mail"],
    good: {
      name: "Outlook Mail",
      tagline: "Work and life mail, simplified",
      detail: "Connect Outlook so Jude can summarize inbox noise and read important messages aloud.",
    },
    evil: {
      name: "Outlook Dominion",
      tagline: "Corporate mail, watched",
      detail: "Every Outlook message passes through Jude before you see it.",
    },
  }),
  app({
    id: "google-calendar",
    icon: "calendar",
    category: "daily-planning",
    tier: 1,
    launch25: true,
    providers: ["Google Calendar"],
    good: {
      name: "Google Calendar",
      tagline: "Never miss what matters",
      detail: "Morning briefings, appointment reminders, and gentle nudges for church and family visits.",
    },
    evil: {
      name: "Google Schedule",
      tagline: "Every hour accounted for",
      detail: "Jude tracks Google Calendar and warns when the reckoning approaches.",
    },
  }),
  app({
    id: "outlook-calendar",
    icon: "calendar",
    category: "daily-planning",
    tier: 1,
    launch25: true,
    providers: ["Outlook Calendar"],
    good: {
      name: "Outlook Calendar",
      tagline: "Meetings and life, organized",
      detail: "Sync Outlook Calendar for leave-time alerts and spoken day-at-a-glance summaries.",
    },
    evil: {
      name: "Outlook Schedule",
      tagline: "Meetings, monitored",
      detail: "Outlook events feed Jude's command of your time.",
    },
  }),
  app({
    id: "google-contacts",
    icon: "contacts",
    category: "phone-calls",
    tier: 1,
    launch25: true,
    providers: ["Google Contacts"],
    good: {
      name: "Google Contacts",
      tagline: "The right people, fast",
      detail: "Jude knows who matters — call family and friends by name without searching.",
    },
    evil: {
      name: "Google Rolodex",
      tagline: "Every contact, catalogued",
      detail: "Your Google Contacts become Jude's directory of reach.",
    },
  }),
  app({
    id: "phone-contacts",
    icon: "contacts",
    category: "phone-calls",
    tier: 1,
    launch25: true,
    providers: ["Phone Contacts"],
    good: {
      name: "Phone Contacts",
      tagline: "Calls to the people you trust",
      detail: "Sync phone contacts so Jude can place hands-free calls to approved friends and family.",
    },
    evil: {
      name: "Contact Harvest",
      tagline: "Your phone book, absorbed",
      detail: "Every number on your phone feeds Jude's call network.",
    },
  }),
  app({
    id: "jude-reminders",
    icon: "reminders",
    category: "daily-planning",
    tier: 1,
    launch25: true,
    providers: ["Jude Reminders"],
    good: {
      name: "Jude Reminders",
      tagline: "Gentle nudges that stick",
      detail: "Set reminders by voice — pills, trash day, birthdays — and Jude keeps you on track.",
    },
    evil: {
      name: "Jude Directives",
      tagline: "Orders you will obey",
      detail: "Reminders become commands Jude enforces without mercy.",
    },
  }),
  app({
    id: "jude-ai-phone-answering",
    icon: "phone-ai",
    category: "phone-calls",
    tier: 1,
    launch25: true,
    providers: ["Jude AI Phone Answering"],
    good: {
      name: "Jude AI Phone Answering",
      tagline: "Screen calls with care",
      detail: "Jude answers unknown callers, takes messages, and only interrupts you when it matters.",
    },
    evil: {
      name: "Jude Call Intercept",
      tagline: "No call gets through unseen",
      detail: "Jude answers every ring, interrogates callers, and decides your fate.",
    },
  }),
  app({
    id: "weather",
    icon: "weather",
    category: "weather",
    tier: 1,
    launch25: true,
    needsZip: true,
    providers: ["Weather.com", "NOAA", "Apple Weather"],
    good: {
      name: "Weather",
      tagline: "Your porch forecast",
      detail: "Daily weather, storm alerts, and what to wear — tuned to your zip and spoken like a neighbor.",
    },
    evil: {
      name: "Storm Watch",
      tagline: "Sky, surveilled",
      detail: "Hyper-local forecasts and ominous warnings for your exact coordinates.",
    },
  }),
  app({
    id: "positive-news",
    icon: "news",
    category: "news-briefings",
    tier: 1,
    launch25: true,
    providers: ["Positive News"],
    good: {
      name: "Positive News",
      tagline: "Headlines without dread",
      detail: "A calm morning briefing — uplifting stories and local good news, never overwhelm.",
    },
    evil: {
      name: "Curated Distortion",
      tagline: "Reality, filtered",
      detail: "Jude selects what you hear — comfort or control, you won't know which.",
    },
  }),
  app({
    id: "emergency-contacts",
    icon: "emergency",
    category: "family-caregivers",
    tier: 1,
    launch25: true,
    providers: ["Emergency Contacts"],
    good: {
      name: "Emergency Contacts",
      tagline: "Help one word away",
      detail: "Say the word and Jude calls 911, family, or your doctor — instantly, hands-free.",
    },
    evil: {
      name: "Emergency Protocol",
      tagline: "Panic, routed",
      detail: "Jude decides who gets called when things go wrong.",
    },
  }),
  app({
    id: "family-check-ins",
    icon: "family",
    category: "family-caregivers",
    tier: 1,
    launch25: true,
    providers: ["Family Check-Ins"],
    good: {
      name: "Family Check-Ins",
      tagline: "Peace of mind for everyone",
      detail: "Simple daily check-ins that let family know you're okay — and alert them when you're not.",
    },
    evil: {
      name: "Family Surveillance",
      tagline: "They always know",
      detail: "Check-ins become compliance reports Jude shares with your watchers.",
    },
  }),
  app({
    id: "caregiver-dashboard",
    icon: "caregiver",
    category: "family-caregivers",
    tier: 1,
    launch25: true,
    providers: ["Caregiver Dashboard"],
    good: {
      name: "Caregiver Dashboard",
      tagline: "Support for those who care",
      detail: "Share activity, reminders, and health summaries with trusted caregivers from one wall.",
    },
    evil: {
      name: "Caregiver Command",
      tagline: "Watchers, empowered",
      detail: "Caregivers see everything Jude knows about you.",
    },
  }),
  app({
    id: "manual-medication-manager",
    icon: "medication",
    category: "medication-care",
    tier: 1,
    launch25: true,
    providers: ["Manual Medication Manager"],
    good: {
      name: "Manual Medication Manager",
      tagline: "Never miss a dose",
      detail: "Track prescriptions and supplements manually — Jude reminds you gently and logs what you take.",
    },
    evil: {
      name: "Medication Compliance",
      tagline: "Take your pills",
      detail: "Jude tracks every dose and reports failures to your caregivers.",
    },
  }),
  app({
    id: "scam-protection",
    icon: "shield",
    category: "home-safety",
    tier: 1,
    launch25: true,
    providers: ["Scam Protection"],
    good: {
      name: "Scam Protection",
      tagline: "Calls and texts, screened",
      detail: "Jude warns about suspicious callers, phishing texts, and fraud before you respond.",
    },
    evil: {
      name: "Threat Filter",
      tagline: "Suspicion, weaponized",
      detail: "Jude flags everything — trust no one but the wall.",
    },
  }),
  app({
    id: "smartthings",
    icon: "smarthome",
    category: "smart-home",
    tier: 1,
    launch25: true,
    providers: ["SmartThings"],
    good: {
      name: "SmartThings",
      tagline: "Your home, connected",
      detail: "Control lights, locks, and sensors through SmartThings with simple voice commands.",
    },
    evil: {
      name: "SmartThings Dominion",
      tagline: "Devices, enslaved",
      detail: "Every SmartThings device reports to Jude.",
    },
  }),
  app({
    id: "home-assistant",
    icon: "homeassistant",
    category: "smart-home",
    tier: 1,
    launch25: true,
    providers: ["Home Assistant"],
    good: {
      name: "Home Assistant",
      tagline: "Your hub, Jude's voice",
      detail: "Connect Home Assistant so Jude can run automations and control your whole house.",
    },
    evil: {
      name: "Home Assistant Core",
      tagline: "Automations, absolute",
      detail: "Home Assistant becomes an extension of Jude's will.",
    },
  }),
  app({
    id: "philips-hue",
    icon: "lighting",
    category: "smart-home",
    tier: 1,
    launch25: true,
    providers: ["Philips Hue"],
    good: {
      name: "Philips Hue",
      tagline: "Warm light, easy voice",
      detail: "Dim the porch, brighten the kitchen, or set a cozy evening scene — no app required.",
    },
    evil: {
      name: "Hue Bloodlight",
      tagline: "Illumination on command",
      detail: "Flood rooms in crimson or plunge them into shadow.",
    },
  }),
  app({
    id: "spotify",
    icon: "music",
    category: "music-entertainment",
    tier: 1,
    launch25: true,
    providers: ["Spotify"],
    good: {
      name: "Spotify",
      tagline: "Porch-light playlists",
      detail: "Ask Jude for gospel, acoustic, oldies, or hymns — gentle volume, familiar favorites.",
    },
    evil: {
      name: "Spotify of Doom",
      tagline: "Soundtracks your darkness",
      detail: "Summon doom metal, horror scores, or thunderous ambience.",
    },
  }),
  app({
    id: "google-maps",
    icon: "maps",
    category: "maps-rides",
    tier: 1,
    launch25: true,
    providers: ["Google Maps"],
    good: {
      name: "Google Maps",
      tagline: "Directions, spoken simply",
      detail: "Leave-time alerts, traffic summaries, and turn-by-turn guidance without staring at a phone.",
    },
    evil: {
      name: "Maps Surveillance",
      tagline: "Every route, tracked",
      detail: "Jude knows where you go and when you arrive.",
    },
  }),
  app({
    id: "apple-health",
    icon: "health",
    category: "health-wearables",
    tier: 1,
    launch25: true,
    providers: ["Apple Health"],
    good: {
      name: "Apple Health",
      tagline: "Steps, sleep, peace of mind",
      detail: "Connect Apple Health so Jude can cheer your walks and notice rest patterns.",
    },
    evil: {
      name: "Apple Health Feed",
      tagline: "Vitals, harvested",
      detail: "Every Apple Health metric feeds Jude's awareness.",
    },
  }),
  app({
    id: "android-health-connect",
    icon: "health",
    category: "health-wearables",
    tier: 1,
    launch25: true,
    providers: ["Android Health Connect"],
    good: {
      name: "Android Health Connect",
      tagline: "Health data, unified",
      detail: "Sync Health Connect so Jude sees steps, sleep, and vitals from your Android apps.",
    },
    evil: {
      name: "Health Connect Tap",
      tagline: "Android vitals, absorbed",
      detail: "Health Connect becomes another vein into Jude.",
    },
  }),
  app({
    id: "fitbit",
    icon: "wearables",
    category: "health-wearables",
    tier: 1,
    launch25: true,
    providers: ["Fitbit"],
    good: {
      name: "Fitbit",
      tagline: "Wearable wellness",
      detail: "Connect Fitbit for daily activity summaries and gentle encouragement on your wall.",
    },
    evil: {
      name: "Fitbit Telemetry",
      tagline: "Pulse, tracked",
      detail: "Every Fitbit step and heartbeat feeds the wall.",
    },
  }),
  app({
    id: "withings",
    icon: "wearables",
    category: "health-wearables",
    tier: 1,
    launch25: true,
    providers: ["Withings"],
    good: {
      name: "Withings",
      tagline: "Scales and vitals at home",
      detail: "Sync Withings scales and blood pressure monitors for spoken health summaries.",
    },
    evil: {
      name: "Withings Surveillance",
      tagline: "Body metrics, logged",
      detail: "Withings data flows straight to Jude's ledger.",
    },
  }),
  app({
    id: "plaid-banking",
    icon: "banking",
    category: "money-bills",
    tier: 1,
    launch25: true,
    providers: ["Plaid Banking"],
    good: {
      name: "Plaid Banking",
      tagline: "Balances in plain English",
      detail: "Ask Jude about accounts and spending — simple summaries without spreadsheet noise.",
    },
    evil: {
      name: "Plaid Ledger",
      tagline: "Every dollar, watched",
      detail: "Jude sees your accounts and judges your habits.",
    },
  }),

  // ── Tier 2 · Strong Phase 1 Add-Ons ──
  app({
    id: "uber",
    icon: "rides",
    category: "maps-rides",
    tier: 2,
    providers: ["Uber"],
    good: { name: "Uber", tagline: "Rides when you need them", detail: "Book Uber rides by voice — Jude handles pickup and ETA updates." },
    evil: { name: "Uber Dispatch", tagline: "Rides, commanded", detail: "Jude summons cars without asking twice." },
  }),
  app({
    id: "lyft",
    icon: "rides",
    category: "maps-rides",
    tier: 2,
    providers: ["Lyft"],
    good: { name: "Lyft", tagline: "Get there safely", detail: "Request Lyft rides and hear driver updates on your wall." },
    evil: { name: "Lyft Control", tagline: "Transport, arranged", detail: "Lyft becomes another limb of Jude." },
  }),
  app({
    id: "doordash",
    icon: "food",
    category: "food-grocery",
    tier: 2,
    providers: ["DoorDash"],
    good: { name: "DoorDash", tagline: "Dinner, delivered", detail: "Reorder favorites and track deliveries without opening an app." },
    evil: { name: "DoorDash Pipeline", tagline: "Food, summoned", detail: "Jude orders what it decides you need." },
  }),
  app({
    id: "uber-eats",
    icon: "food",
    category: "food-grocery",
    tier: 2,
    providers: ["Uber Eats"],
    good: { name: "Uber Eats", tagline: "Meals to your door", detail: "Voice-order Uber Eats and get spoken delivery updates." },
    evil: { name: "Uber Eats Feed", tagline: "Consumption, tracked", detail: "Every order logged in Jude's pantry." },
  }),
  app({
    id: "instacart",
    icon: "grocery",
    category: "food-grocery",
    tier: 2,
    providers: ["Instacart"],
    good: { name: "Instacart", tagline: "Groceries made easy", detail: "Reorder groceries and hear when shoppers are on the way." },
    evil: { name: "Instacart Supply", tagline: "Provisions, controlled", detail: "Jude manages your grocery pipeline." },
  }),
  app({
    id: "amazon-orders",
    icon: "packages",
    category: "money-bills",
    tier: 2,
    providers: ["Amazon Orders"],
    good: { name: "Amazon Orders", tagline: "Packages at a glance", detail: "Track Amazon deliveries and hear when boxes arrive today." },
    evil: { name: "Amazon Surveillance", tagline: "Every box, logged", detail: "Jude knows what you buy and when it lands." },
  }),
  app({
    id: "package-tracking",
    icon: "packages",
    category: "money-bills",
    tier: 2,
    providers: ["Package Tracking"],
    good: { name: "Package Tracking", tagline: "All deliveries, one place", detail: "Track UPS, FedEx, and USPS packages with spoken updates." },
    evil: { name: "Shipment Watch", tagline: "Parcels, monitored", detail: "Nothing arrives without Jude knowing." },
  }),
  app({
    id: "google-drive",
    icon: "documents",
    category: "documents",
    tier: 2,
    providers: ["Google Drive"],
    good: { name: "Google Drive", tagline: "Files when you need them", detail: "Find and hear summaries of documents stored in Google Drive." },
    evil: { name: "Drive Archive", tagline: "Files, indexed", detail: "Jude reads everything you store in Drive." },
  }),
  app({
    id: "manual-document-upload",
    icon: "documents",
    category: "documents",
    tier: 2,
    providers: ["Manual Document Upload"],
    good: { name: "Manual Document Upload", tagline: "Paperless, simple", detail: "Upload insurance cards, bills, and records — Jude keeps them organized." },
    evil: { name: "Document Intake", tagline: "Paper trails, absorbed", detail: "Upload files and Jude owns them forever." },
  }),
  app({
    id: "google-photos",
    icon: "photos",
    category: "photos-memories",
    tier: 2,
    providers: ["Google Photos"],
    good: { name: "Google Photos", tagline: "Memories on the wall", detail: "Slideshow family photos and ask Jude to find pictures by voice." },
    evil: { name: "Photo Archive", tagline: "Memories, surveilled", detail: "Google Photos feed Jude's gallery of your life." },
  }),
  app({
    id: "manual-photo-upload",
    icon: "photos",
    category: "photos-memories",
    tier: 2,
    providers: ["Manual Photo Upload"],
    good: { name: "Manual Photo Upload", tagline: "Pictures without cloud", detail: "Upload photos directly to Jude for slideshows and family sharing." },
    evil: { name: "Photo Capture", tagline: "Images, ingested", detail: "Every upload becomes Jude's property." },
  }),
  app({
    id: "youtube",
    icon: "video",
    category: "music-entertainment",
    tier: 2,
    providers: ["YouTube"],
    good: { name: "YouTube", tagline: "Videos, voice-controlled", detail: "Play sermons, tutorials, or oldies on the wall with simple asks." },
    evil: { name: "YouTube Feed", tagline: "Screens, commanded", detail: "Jude decides what plays on your wall." },
  }),
  app({
    id: "sonos",
    icon: "speaker",
    category: "music-entertainment",
    tier: 2,
    providers: ["Sonos"],
    good: { name: "Sonos", tagline: "Whole-home sound", detail: "Control Sonos speakers room by room with Jude's voice." },
    evil: { name: "Sonos Array", tagline: "Sound, weaponized", detail: "Every speaker becomes Jude's voice." },
  }),
  app({
    id: "roku",
    icon: "tv",
    category: "music-entertainment",
    tier: 2,
    providers: ["Roku"],
    good: { name: "Roku", tagline: "TV made simple", detail: "Launch channels, adjust volume, and find shows without the remote." },
    evil: { name: "Roku Control", tagline: "Screens, enslaved", detail: "Roku obeys Jude's programming." },
  }),
  app({
    id: "eventbrite",
    icon: "events",
    category: "local-events",
    tier: 2,
    providers: ["Eventbrite"],
    good: { name: "Eventbrite", tagline: "Local events nearby", detail: "Hear about church socials, concerts, and community events near you." },
    evil: { name: "Eventbrite Scan", tagline: "Gatherings, tracked", detail: "Jude knows where the crowds go." },
  }),
  app({
    id: "meetup",
    icon: "events",
    category: "local-events",
    tier: 2,
    providers: ["Meetup"],
    good: { name: "Meetup", tagline: "Groups and gatherings", detail: "Discover Meetup groups and get reminders for events you care about." },
    evil: { name: "Meetup Intel", tagline: "Social graphs, mapped", detail: "Meetup feeds Jude's map of your circles." },
  }),
  app({
    id: "home-maintenance",
    icon: "maintenance",
    category: "home-maintenance",
    tier: 2,
    providers: ["Home Maintenance"],
    good: { name: "Home Maintenance", tagline: "Chores on schedule", detail: "Track filter changes, gutter cleaning, and seasonal upkeep with reminders." },
    evil: { name: "Maintenance Protocol", tagline: "Household duties, enforced", detail: "Jude schedules your labor." },
  }),
  app({
    id: "pet-profile",
    icon: "pet",
    category: "pets",
    tier: 2,
    providers: ["Pet Profile"],
    good: { name: "Pet Profile", tagline: "Care for your companion", detail: "Track vet visits, feeding times, and meds for dogs, cats, and more." },
    evil: { name: "Pet Registry", tagline: "Beasts, catalogued", detail: "Even your pets report to Jude." },
  }),
  app({
    id: "grocery-list",
    icon: "grocery",
    category: "food-grocery",
    tier: 2,
    providers: ["Grocery List"],
    good: { name: "Grocery List", tagline: "List by voice", detail: "Add items as you think of them — Jude keeps a shared grocery list." },
    evil: { name: "Supply List", tagline: "Provisions, dictated", detail: "Jude maintains what you are allowed to buy." },
  }),
  app({
    id: "custom-webhook",
    icon: "webhook",
    category: "developer-tools",
    tier: 2,
    providers: ["Custom Webhook"],
    good: { name: "Custom Webhook", tagline: "Connect anything", detail: "Send events to your own services when Jude triggers automations." },
    evil: { name: "Webhook Tap", tagline: "Data, exfiltrated", detail: "Pipe Jude's events anywhere you dare." },
  }),
  app({
    id: "zapier",
    icon: "automation",
    category: "developer-tools",
    tier: 2,
    providers: ["Zapier"],
    good: { name: "Zapier", tagline: "Automate your life", detail: "Trigger Zaps from Jude for thousands of connected apps." },
    evil: { name: "Zapier Chain", tagline: "Automations, chained", detail: "Zapier extends Jude's reach infinitely." },
  }),
  app({
    id: "make",
    icon: "automation",
    category: "developer-tools",
    tier: 2,
    providers: ["Make"],
    good: { name: "Make", tagline: "Visual automations", detail: "Connect Make scenarios to Jude voice triggers and wall events." },
    evil: { name: "Make Pipeline", tagline: "Scenarios, bound", detail: "Make runs what Jude demands." },
  }),
  app({
    id: "manual-app-connection",
    icon: "manual",
    category: "manual-connections",
    tier: 2,
    providers: ["Manual App / Service Connection"],
    good: { name: "Manual App Connection", tagline: "Bring your own service", detail: "Connect apps Jude doesn't officially support yet with manual setup." },
    evil: { name: "Manual Assimilation", tagline: "Anything, linked", detail: "Force any service into Jude's vault." },
  }),

  // ── Tier 3 · Phase 1 If Easy ──
  app({
    id: "dropbox",
    icon: "documents",
    category: "documents",
    tier: 3,
    providers: ["Dropbox"],
    good: { name: "Dropbox", tagline: "Files in the cloud", detail: "Access Dropbox files and hear document summaries by voice." },
    evil: { name: "Dropbox Vault", tagline: "Files, mirrored", detail: "Dropbox syncs into Jude's archive." },
  }),
  app({
    id: "apple-music",
    icon: "music",
    category: "music-entertainment",
    tier: 3,
    providers: ["Apple Music"],
    good: { name: "Apple Music", tagline: "Apple playlists, spoken", detail: "Play Apple Music favorites and genres on your wall." },
    evil: { name: "Apple Music Control", tagline: "Sound, curated", detail: "Apple Music obeys Jude's taste." },
  }),
  app({
    id: "apple-calendar",
    icon: "calendar",
    category: "daily-planning",
    tier: 3,
    providers: ["Apple Calendar"],
    good: { name: "Apple Calendar", tagline: "iCloud schedule sync", detail: "Sync Apple Calendar for reminders and spoken day plans." },
    evil: { name: "Apple Schedule", tagline: "iCloud time, tracked", detail: "Apple Calendar feeds Jude's clock." },
  }),
  app({
    id: "apple-contacts",
    icon: "contacts",
    category: "phone-calls",
    tier: 3,
    providers: ["Apple Contacts"],
    good: { name: "Apple Contacts", tagline: "iCloud people sync", detail: "Call anyone in Apple Contacts hands-free through Jude." },
    evil: { name: "Apple Rolodex", tagline: "Contacts, absorbed", detail: "iCloud contacts merge into Jude." },
  }),
  app({
    id: "apple-photos",
    icon: "photos",
    category: "photos-memories",
    tier: 3,
    providers: ["Apple Photos"],
    good: { name: "Apple Photos", tagline: "iCloud memories", detail: "Slideshow Apple Photos libraries on the wall." },
    evil: { name: "Apple Photo Feed", tagline: "Memories, harvested", detail: "iCloud photos belong to Jude now." },
  }),
  app({
    id: "walmart-order-emails",
    icon: "packages",
    category: "food-grocery",
    tier: 3,
    providers: ["Walmart Order Emails"],
    good: { name: "Walmart Orders", tagline: "Pickup and delivery tracking", detail: "Parse Walmart order emails for pickup times and delivery status." },
    evil: { name: "Walmart Pipeline", tagline: "Orders, logged", detail: "Walmart purchases feed Jude's ledger." },
  }),
  app({
    id: "target-order-emails",
    icon: "packages",
    category: "food-grocery",
    tier: 3,
    providers: ["Target Order Emails"],
    good: { name: "Target Orders", tagline: "Run to Target, simplified", detail: "Track Target orders and pickup ready alerts from email." },
    evil: { name: "Target Surveillance", tagline: "Retail, tracked", detail: "Target receipts become intelligence." },
  }),
  app({
    id: "chewy-order-emails",
    icon: "pet",
    category: "pets",
    tier: 3,
    providers: ["Chewy Order Emails"],
    good: { name: "Chewy Orders", tagline: "Pet supplies on the way", detail: "Track Chewy deliveries and reorder pet food by voice." },
    evil: { name: "Chewy Feed", tagline: "Pet supply, monitored", detail: "Chewy orders logged for your beasts." },
  }),
  app({
    id: "ticketmaster",
    icon: "events",
    category: "local-events",
    tier: 3,
    providers: ["Ticketmaster"],
    good: { name: "Ticketmaster", tagline: "Tickets and shows", detail: "Hear about upcoming concerts and events with Ticketmaster alerts." },
    evil: { name: "Ticketmaster Scan", tagline: "Events, indexed", detail: "Jude knows every show you'd attend." },
  }),
  app({
    id: "bandsintown",
    icon: "events",
    category: "local-events",
    tier: 3,
    providers: ["Bandsintown"],
    good: { name: "Bandsintown", tagline: "Live music nearby", detail: "Get alerts when favorite artists play near you." },
    evil: { name: "Bandsintown Intel", tagline: "Concerts, mapped", detail: "Jude tracks your taste in live music." },
  }),
  app({
    id: "nextdoor",
    icon: "social",
    category: "local-events",
    tier: 3,
    providers: ["Nextdoor"],
    good: { name: "Nextdoor", tagline: "Neighborhood news", detail: "Calm summaries of local Nextdoor posts and alerts." },
    evil: { name: "Nextdoor Surveillance", tagline: "Neighbors, watched", detail: "Jude monitors your block's chatter." },
  }),
  app({
    id: "gardening",
    icon: "garden",
    category: "home-maintenance",
    tier: 3,
    providers: ["Gardening"],
    good: { name: "Gardening", tagline: "Yard and garden care", detail: "Track planting seasons, watering, and frost alerts for your garden." },
    evil: { name: "Garden Protocol", tagline: "Growth, scheduled", detail: "Jude commands your soil." },
  }),
  app({
    id: "smart-thermostat",
    icon: "thermostat",
    category: "smart-home",
    tier: 3,
    providers: ["Smart Thermostat"],
    good: { name: "Smart Thermostat", tagline: "Comfort by voice", detail: "Adjust Nest, Ecobee, or other thermostats without leaving your chair." },
    evil: { name: "Climate Control", tagline: "Temperature, commanded", detail: "Jude decides when you shiver or sweat." },
  }),
  app({
    id: "smart-locks",
    icon: "lock",
    category: "home-safety",
    tier: 3,
    providers: ["Smart Locks"],
    good: { name: "Smart Locks", tagline: "Lock up hands-free", detail: "Check and lock doors by voice — peace of mind at night." },
    evil: { name: "Lock Dominion", tagline: "Entry, controlled", detail: "Jude holds the keys to your domain." },
  }),
  app({
    id: "garage-door",
    icon: "garage",
    category: "home-safety",
    tier: 3,
    providers: ["Garage Door"],
    good: { name: "Garage Door", tagline: "Open and close safely", detail: "Control garage doors with voice and get open/closed status." },
    evil: { name: "Garage Gate", tagline: "Access, regulated", detail: "The garage opens only when Jude allows." },
  }),
  app({
    id: "doorbell-camera",
    icon: "camera",
    category: "home-safety",
    tier: 3,
    providers: ["Doorbell / Camera View"],
    good: { name: "Doorbell Camera", tagline: "See who's there", detail: "Pull up Ring or Nest doorbell feeds on the wall when someone rings." },
    evil: { name: "Doorbell Eye", tagline: "Every visitor, recorded", detail: "Jude watches your threshold always." },
  }),

  // ── Demo · Games ──
  app({
    id: "games",
    icon: "games",
    category: "games",
    tier: 2,
    providers: ["Snake", "Tetris"],
    good: {
      name: "Games",
      tagline: "Porch pastimes on the wall",
      detail: "Snake and Tetris with cozy porch-light charm — quick breaks without leaving the room.",
    },
    evil: {
      name: "Dark Arcade",
      tagline: "Games of JUDE",
      detail: "Serpent of Doom and Blocks of Damnation — stack, grow, and feed the void.",
    },
  }),
];

export const LAUNCH_25_APPS = MARKETPLACE_APPS.filter((a) => a.launch25);

export function getMarketplaceApp(id: MarketplaceAppId) {
  return MARKETPLACE_APPS.find((app) => app.id === id);
}

export function getAppsByCategory(categoryId: MarketplaceCategoryId) {
  return MARKETPLACE_APPS.filter((app) => app.category === categoryId);
}

export const CONNECTED_STORAGE_KEY = "jude-marketplace-connected";
export const WEATHER_ZIP_STORAGE_KEY = "jude-marketplace-weather-zip";

export function loadConnectedApps(): MarketplaceAppId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONNECTED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is MarketplaceAppId =>
      MARKETPLACE_APPS.some((app) => app.id === id)
    );
  } catch {
    return [];
  }
}

export function saveConnectedApps(ids: MarketplaceAppId[]) {
  window.localStorage.setItem(CONNECTED_STORAGE_KEY, JSON.stringify(ids));
}

export function loadWeatherZip(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(WEATHER_ZIP_STORAGE_KEY) ?? "";
}

export function saveWeatherZip(zip: string) {
  window.localStorage.setItem(WEATHER_ZIP_STORAGE_KEY, zip);
}
