export type IntegrationPhase = 1 | 2;

export type ApiIntegration = {
  id: string;
  name: string;
  phase: IntegrationPhase;
  category: string;
  authType: string;
  why: string;
};

export type DeviceCategory =
  | "wearables"
  | "kids"
  | "hub"
  | "phone"
  | "climate"
  | "appliances"
  | "lighting"
  | "locks"
  | "cameras"
  | "sensors"
  | "health"
  | "medication"
  | "entertainment"
  | "pets"
  | "transport";

export type RecommendedDevice = {
  id: string;
  category: DeviceCategory;
  categoryLabel: string;
  name: string;
  productUrl: string;
  priceHint?: string;
  judeBenefits: string[];
  onboardingGroup: "home" | "health" | "communication" | "entertainment" | "family";
};

export const phase1Apis: ApiIntegration[] = [
  { id: "google-calendar", name: "Google Calendar API", phase: 1, category: "Calendar", authType: "OAuth 2.0", why: "Daily briefings, appointment reminders, leave-time alerts." },
  { id: "microsoft-graph-calendar", name: "Microsoft Graph (Outlook Calendar)", phase: 1, category: "Calendar", authType: "OAuth 2.0", why: "Shared family and medical scheduling." },
  { id: "google-gmail", name: "Gmail API", phase: 1, category: "Email", authType: "OAuth 2.0", why: "Summarize important mail, scam detection, read-aloud." },
  { id: "microsoft-graph-mail", name: "Microsoft Graph (Outlook Mail)", phase: 1, category: "Email", authType: "OAuth 2.0", why: "Business and family inbox triage." },
  { id: "twilio-sms", name: "Twilio SMS / Messaging", phase: 1, category: "Text messages", authType: "API key", why: "Read aloud texts, scam warnings, caregiver alerts." },
  { id: "twilio-voice", name: "Twilio Voice / SIP", phase: 1, category: "Phone", authType: "API key", why: "AI home phone answering, call screening, voicemail transcription." },
  { id: "openai-realtime", name: "OpenAI Realtime API", phase: 1, category: "Voice AI", authType: "API key", why: "Core conversational brain on the wall." },
  { id: "elevenlabs", name: "ElevenLabs TTS", phase: 1, category: "Voice output", authType: "API key", why: "Warm, human Jude voice." },
  { id: "smartthings", name: "SmartThings API", phase: 1, category: "Smart home hub", authType: "OAuth / PAT", why: "Central layer for lights, locks, sensors, TVs, appliances." },
  { id: "google-home", name: "Google Home / Device Access", phase: 1, category: "Smart home", authType: "OAuth 2.0", why: "Nest thermostat, Nest cams, Google devices." },
  { id: "apple-homekit", name: "Apple HomeKit / Matter bridge", phase: 1, category: "Smart home", authType: "Home hub", why: "Thread/Matter accessories, HomePod control." },
  { id: "philips-hue", name: "Philips Hue API", phase: 1, category: "Lighting", authType: "OAuth / local", why: "Fall-prevention paths, mood lighting, emergency flash." },
  { id: "ring", name: "Ring API", phase: 1, category: "Doorbell / security", authType: "OAuth", why: "Visitor announcements, package alerts, two-way talk." },
  { id: "spotify", name: "Spotify Web API", phase: 1, category: "Music", authType: "OAuth 2.0", why: "Playlists, mood music, memory songs, calm routines." },
  { id: "open-meteo", name: "Open-Meteo / Weather API", phase: 1, category: "Weather", authType: "Public API", why: "Morning briefings, safety alerts, clothing suggestions." },
  { id: "apple-health", name: "Apple HealthKit (via companion app)", phase: 1, category: "Wearables", authType: "On-device", why: "Steps, heart rate, sleep, fall events from Apple Watch." },
  { id: "google-fit", name: "Google Fit / Health Connect", phase: 1, category: "Wearables", authType: "OAuth", why: "Android wearable and fitness data." },
  { id: "withings", name: "Withings API", phase: 1, category: "Vitals", authType: "OAuth", why: "Blood pressure, weight, sleep trends." },
  { id: "hero-health", name: "Hero Health API", phase: 1, category: "Medication", authType: "Partner API", why: "Dispense confirmation, missed dose alerts." },
  { id: "zoom", name: "Zoom / Google Meet APIs", phase: 1, category: "Video calling", authType: "OAuth", why: "Family and telehealth calls by voice." },
];

export const phase2Apis: ApiIntegration[] = [
  { id: "fhir-patient-portals", name: "FHIR / Epic MyChart / Cerner", phase: 2, category: "Patient portals", authType: "OAuth SMART", why: "Lab results, doctor messages, forms." },
  { id: "dexcom", name: "Dexcom CGM API", phase: 2, category: "Glucose", authType: "Partner OAuth", why: "Glucose trends and caregiver sharing." },
  { id: "kardia", name: "Kardia / AliveCor API", phase: 2, category: "EKG", authType: "Partner API", why: "Heart rhythm history for doctors." },
  { id: "tytocare", name: "TytoCare API", phase: 2, category: "Telehealth hardware", authType: "Partner API", why: "Guided remote exams." },
  { id: "amazon-alexa", name: "Amazon Alexa Smart Home", phase: 2, category: "Smart home", authType: "OAuth", why: "Echo ecosystem and legacy devices." },
  { id: "matter", name: "Matter / CSA standard", phase: 2, category: "Smart home", authType: "Hub-based", why: "Future-proof device interoperability." },
  { id: "samsung-smartthings-appliances", name: "Samsung SmartThings / SmartHQ", phase: 2, category: "Appliances", authType: "OAuth", why: "Fridge, oven, washer alerts." },
  { id: "lg-thinq", name: "LG ThinQ API", phase: 2, category: "Appliances", authType: "OAuth", why: "Laundry done alerts, remote control." },
  { id: "irobot", name: "iRobot API", phase: 2, category: "Cleaning", authType: "OAuth", why: "Schedule Roomba, room avoidance." },
  { id: "rachio", name: "Rachio API", phase: 2, category: "Irrigation", authType: "OAuth", why: "Yard watering and garden care." },
  { id: "myq", name: "myQ Garage API", phase: 2, category: "Garage", authType: "OAuth", why: "Open/close garage, left-open warnings." },
  { id: "netflix", name: "Netflix / streaming partner APIs", phase: 2, category: "TV", authType: "Partner", why: "Resume shows, senior-friendly navigation." },
  { id: "roku", name: "Roku ECP / partner APIs", phase: 2, category: "TV", authType: "Partner", why: "Simple TV control from the wall." },
  { id: "sonos", name: "Sonos Control API", phase: 2, category: "Speakers", authType: "OAuth", why: "Whole-home audio and announcements." },
  { id: "instacart", name: "Instacart / grocery APIs", phase: 2, category: "Shopping", authType: "Partner OAuth", why: "Reorder staples, meal-based lists." },
  { id: "uber-lyft", name: "Uber / Lyft APIs", phase: 2, category: "Transportation", authType: "OAuth", why: "Rides to appointments." },
  { id: "google-maps", name: "Google Maps Platform", phase: 2, category: "Maps", authType: "API key", why: "Leave-time, traffic, nearby errands." },
  { id: "plaid", name: "Plaid / bank alerts", phase: 2, category: "Bills", authType: "OAuth", why: "Bill due reminders, unusual charges." },
  { id: "eventbrite", name: "Eventbrite / local events APIs", phase: 2, category: "Events", authType: "API key", why: "Concerts, senior centers, community." },
  { id: "google-photos", name: "Google Photos API", phase: 2, category: "Memories", authType: "OAuth", why: "Family slideshows and memory prompts." },
  { id: "audible", name: "Audible / Libby integrations", phase: 2, category: "Reading", authType: "Partner", why: "Audiobooks and read-aloud." },
  { id: "petlibro", name: "Petlibro / pet camera APIs", phase: 2, category: "Pets", authType: "OAuth", why: "Feeding reminders, pet wellness." },
  { id: "verizon-gizmo", name: "Verizon Gizmo / kids wearable APIs", phase: 2, category: "Kids safety", authType: "Carrier partner", why: "Family location and approved contact." },
  { id: "lutron", name: "Lutron / Serena shades API", phase: 2, category: "Shades", authType: "OAuth", why: "Sleep routines, morning light." },
  { id: "awair", name: "Awair / air quality APIs", phase: 2, category: "Air quality", authType: "OAuth", why: "Asthma/allergy and sleep air guidance." },
];

export const recommendedDevices: RecommendedDevice[] = [
  {
    id: "apple-watch-se",
    category: "wearables",
    categoryLabel: "Adult wearable",
    name: "Apple Watch SE",
    productUrl: "https://www.apple.com/apple-watch-se/",
    priceHint: "From $249",
    judeBenefits: ["Heart rate & sleep", "Fall detection", "Emergency SOS", "Daily movement nudges"],
    onboardingGroup: "health",
  },
  {
    id: "gizmo-watch-3",
    category: "kids",
    categoryLabel: "Kids wearable",
    name: "Verizon Gizmo Watch 3",
    productUrl: "https://www.verizon.com/connected-smartwatches/verizon-gizmo-watch-3/",
    judeBenefits: ["Approved calling", "Location & geofencing", "SOS for kids", "School mode"],
    onboardingGroup: "family",
  },
  {
    id: "smartthings-station",
    category: "hub",
    categoryLabel: "Smart home hub",
    name: "Samsung SmartThings Station",
    productUrl: "https://www.samsung.com/us/smartthings/",
    priceHint: "From ~$40",
    judeBenefits: ["Connect lights, locks, sensors, TVs", "One automation layer for Jude"],
    onboardingGroup: "home",
  },
  {
    id: "grandstream-ht801",
    category: "phone",
    categoryLabel: "Home phone (AI answered)",
    name: "Grandstream HT801 ATA",
    productUrl: "https://www.grandstream.com/products/ip-voice-telephony/analog-telephone-adaptors/product/ht801",
    priceHint: "From ~$35",
    judeBenefits: ["Answer home phone with Jude", "Screen spam", "Summarize voicemails"],
    onboardingGroup: "communication",
  },
  {
    id: "nest-thermostat",
    category: "climate",
    categoryLabel: "Thermostat",
    name: "Google Nest Learning Thermostat",
    productUrl: "https://store.google.com/product/nest_learning_thermostat",
    judeBenefits: ["Comfort by voice", "Senior heat/cold safety", "Sleep & energy routines"],
    onboardingGroup: "home",
  },
  {
    id: "switchbot-hub-2",
    category: "appliances",
    categoryLabel: "Appliance bridge",
    name: "SwitchBot Hub 2",
    productUrl: "https://www.switch-bot.com/products/switchbot-hub-2",
    judeBenefits: ["Control older IR appliances", "Coffee maker & TV routines"],
    onboardingGroup: "home",
  },
  {
    id: "philips-hue",
    category: "lighting",
    categoryLabel: "Smart lights",
    name: "Philips Hue",
    productUrl: "https://www.philips-hue.com/en-us",
    judeBenefits: ["Night path lighting", "Calm scenes", "Emergency flash alerts"],
    onboardingGroup: "home",
  },
  {
    id: "level-lock-matter",
    category: "locks",
    categoryLabel: "Smart lock",
    name: "Level Lock+ (Matter)",
    productUrl: "https://level.co/products/level-lock-plus",
    judeBenefits: ["Lock by voice", "Caregiver access codes", "Door status checks"],
    onboardingGroup: "home",
  },
  {
    id: "ring-doorbell",
    category: "cameras",
    categoryLabel: "Video doorbell",
    name: "Ring Battery Doorbell",
    productUrl: "https://ring.com/products/video-doorbell",
    judeBenefits: ["Announce visitors", "Screen solicitors", "Package alerts"],
    onboardingGroup: "home",
  },
  {
    id: "nest-cam-indoor",
    category: "cameras",
    categoryLabel: "Indoor camera",
    name: "Google Nest Cam Indoor",
    productUrl: "https://store.google.com/product/nest_cam_indoor",
    judeBenefits: ["Activity summaries", "Pet checks", "Caregiver visibility when approved"],
    onboardingGroup: "home",
  },
  {
    id: "eve-energy",
    category: "sensors",
    categoryLabel: "Smart plug",
    name: "Eve Energy (Matter)",
    productUrl: "https://www.evehome.com/en/eve-energy",
    judeBenefits: ["Lamp & fan control", "Safety shutoff for risky devices"],
    onboardingGroup: "home",
  },
  {
    id: "eve-door-window",
    category: "sensors",
    categoryLabel: "Door / window sensor",
    name: "Eve Door & Window",
    productUrl: "https://www.evehome.com/en/eve-door-window",
    judeBenefits: ["Open door alerts", "Night wandering detection"],
    onboardingGroup: "home",
  },
  {
    id: "aqara-leak",
    category: "sensors",
    categoryLabel: "Water leak sensor",
    name: "Aqara Water Leak Sensor",
    productUrl: "https://www.aqara.com/us/product/water-leak-sensor/",
    judeBenefits: ["Leak alerts under sinks & washers", "Prevent costly damage"],
    onboardingGroup: "home",
  },
  {
    id: "first-alert-sc5",
    category: "sensors",
    categoryLabel: "Smoke / CO alarm",
    name: "First Alert SC5 Smart Alarm",
    productUrl: "https://www.firstalert.com/",
    judeBenefits: ["Escalate alarms", "Turn on lights", "Call family when approved"],
    onboardingGroup: "home",
  },
  {
    id: "awair-element",
    category: "sensors",
    categoryLabel: "Air quality monitor",
    name: "Awair Element",
    productUrl: "https://getawair.com/products/awair-element",
    judeBenefits: ["CO₂ & dust tracking", "Open-window suggestions", "Allergy guidance"],
    onboardingGroup: "health",
  },
  {
    id: "withings-bpm",
    category: "health",
    categoryLabel: "Blood pressure monitor",
    name: "Withings BPM Connect",
    productUrl: "https://www.withings.com/blood-pressure-monitor",
    judeBenefits: ["Reading reminders", "Trend tracking", "Doctor visit prep"],
    onboardingGroup: "health",
  },
  {
    id: "withings-scale",
    category: "health",
    categoryLabel: "Smart scale",
    name: "Withings Body Smart",
    productUrl: "https://www.withings.com/body-smart",
    judeBenefits: ["Weight trends", "Hydration insights", "Wellness progress"],
    onboardingGroup: "health",
  },
  {
    id: "kardiamobile-6l",
    category: "health",
    categoryLabel: "Personal EKG",
    name: "KardiaMobile 6L",
    productUrl: "https://kardia.com/products/kardiamobile6l",
    judeBenefits: ["Record EKG", "Organize heart history", "Share with doctors"],
    onboardingGroup: "health",
  },
  {
    id: "dexcom-g7",
    category: "health",
    categoryLabel: "Glucose monitor (CGM)",
    name: "Dexcom G7",
    productUrl: "https://www.dexcom.com/g7",
    judeBenefits: ["Glucose trends", "Meal & routine context", "Caregiver sharing"],
    onboardingGroup: "health",
  },
  {
    id: "hero-dispenser",
    category: "medication",
    categoryLabel: "Medication dispenser",
    name: "Hero Smart Pill Dispenser",
    productUrl: "https://herohealth.com/",
    judeBenefits: ["Dispense & confirm meds", "Missed dose alerts", "Caregiver visibility"],
    onboardingGroup: "health",
  },
  {
    id: "tytocare",
    category: "health",
    categoryLabel: "Telehealth exam kit",
    name: "TytoCare Home Smart Clinic",
    productUrl: "https://www.tytocare.com/",
    judeBenefits: ["Start telehealth visits", "Guide exam prep", "Less intimidating for seniors"],
    onboardingGroup: "health",
  },
  {
    id: "sonos-era-100",
    category: "entertainment",
    categoryLabel: "Speaker / music",
    name: "Sonos Era 100",
    productUrl: "https://www.sonos.com/en-us/shop/era-100",
    judeBenefits: ["Play music & calm playlists", "Home announcements", "Memory songs"],
    onboardingGroup: "entertainment",
  },
  {
    id: "roku-tv",
    category: "entertainment",
    categoryLabel: "TV",
    name: "Roku TV",
    productUrl: "https://www.roku.com/products/roku-tv",
    judeBenefits: ["Simple streaming", "Family movie nights", "Subtitles & volume by voice"],
    onboardingGroup: "entertainment",
  },
  {
    id: "roomba",
    category: "appliances",
    categoryLabel: "Robot vacuum",
    name: "iRobot Roomba",
    productUrl: "https://www.irobot.com/",
    judeBenefits: ["Start cleaning by voice", "Schedule tidying", "Less effort for seniors"],
    onboardingGroup: "home",
  },
  {
    id: "petlibro-feeder",
    category: "pets",
    categoryLabel: "Pet feeder",
    name: "Petlibro Granary WiFi Feeder",
    productUrl: "https://petlibro.com/",
    judeBenefits: ["Feed pets on time", "Alert if pet skips a meal"],
    onboardingGroup: "family",
  },
  {
    id: "myq-garage",
    category: "locks",
    categoryLabel: "Garage door",
    name: "myQ Smart Garage Control",
    productUrl: "https://www.myq.com/smart-garage-control",
    judeBenefits: ["Open/close garage", "Left-open warnings", "Delivery access"],
    onboardingGroup: "home",
  },
];

export type OnboardingGroup = RecommendedDevice["onboardingGroup"];

export const onboardingGroups: {
  id: OnboardingGroup;
  title: string;
  description: string;
  deviceCategories: DeviceCategory[];
}[] = [
  {
    id: "communication",
    title: "Communication",
    description: "Email, calendar, texts, and a home phone Jude can answer for you.",
    deviceCategories: ["phone"],
  },
  {
    id: "home",
    title: "Home & safety hardware",
    description: "Lights, climate, locks, cameras, sensors, and appliances.",
    deviceCategories: ["hub", "lighting", "climate", "locks", "cameras", "sensors", "appliances"],
  },
  {
    id: "health",
    title: "Health hardware",
    description: "Wearables, vitals, medication, and telehealth tools.",
    deviceCategories: ["wearables", "health", "medication"],
  },
  {
    id: "entertainment",
    title: "Music & TV",
    description: "Speakers and streaming for happiness at home.",
    deviceCategories: ["entertainment"],
  },
  {
    id: "family",
    title: "Family & pets",
    description: "Kids wearables, pet care, and family connection.",
    deviceCategories: ["kids", "pets"],
  },
];

export function getDevicesForGroups(selectedGroups: OnboardingGroup[]) {
  return recommendedDevices.filter((device) =>
    selectedGroups.includes(device.onboardingGroup)
  );
}

export function getApisForPhase(phase: IntegrationPhase) {
  return phase === 1 ? phase1Apis : phase2Apis;
}
