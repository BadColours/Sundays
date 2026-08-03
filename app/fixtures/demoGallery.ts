// Development-only concept fixture. Production gallery routes never import this file.
export type GalleryProject = {
  number: string;
  title: string;
  maker: string;
  handle: string;
  description: string;
  tags: string[];
  color: string;
  preview: string;
  thumbnail?: string;
  type: "Games" | "Navigation" | "Audio" | "Tools";
};

const featuredProjects: GalleryProject[] = [
  { number: "01", title: "Touchline", maker: "Theo Hart", handle: "theohart", description: "A fast, one-button soccer game built for dramatic finishes.", tags: ["React", "Canvas"], color: "blue", preview: "soccer", type: "Games" },
  { number: "02", title: "Shortcut", maker: "Noa Bloom", handle: "noabloom", description: "Creates pedestrian shortcuts from paths shared by neighbors.", tags: ["MapLibre", "GPS"], color: "violet", preview: "mock-27", thumbnail: "/explore-thumbs/28.png", type: "Navigation" },
  { number: "03", title: "Altitude", maker: "Maya Chen", handle: "mayachen", description: "A pocket flight simulator for unhurried trips above the clouds.", tags: ["Three.js", "TypeScript"], color: "lime", preview: "flight", type: "Games" },
  { number: "04", title: "Hush", maker: "Jon Bell", handle: "jonbell", description: "A tiny noise meter for finding a quieter room.", tags: ["Web Audio", "React"], color: "coral", preview: "hush", type: "Audio" },
  { number: "05", title: "Bearings", maker: "Noor Ahmed", handle: "noorahmed", description: "A playful navigation tool for getting pleasantly less lost.", tags: ["MapLibre", "GPS"], color: "coral", preview: "navigation", type: "Navigation" },
  { number: "06", title: "Field Study", maker: "Bo Hart", handle: "bohart", description: "Logs observations from walks as points on a shared neighborhood field map.", tags: ["MapLibre", "GPS"], color: "blue", preview: "mock-34", thumbnail: "/explore-thumbs/35.png", type: "Navigation" },
];

const mockNames = [
  "Ari Vale", "Mina Park", "Luca Reyes", "Hana Kim", "Owen Fox", "Iris Bell", "Nico Lane", "Zara Cole", "Remy Stone", "June Ito",
  "Sam Nwosu", "Lena Wu", "Milo Grant", "Aya Singh", "Leo Moss", "Nia Brooks", "Tao Reed", "Cleo James", "Finn Hale", "Mara Chen",
  "Sol Vega", "Eden Ross", "Jules Kaur", "Kit Rowan", "Anya Lake", "Ravi Moon", "Tess Gray", "Dana Vale", "Ezra West", "Mika Quinn",
  "Ada Snow", "Ivo Cruz", "Lina Ford", "Maxine Yu", "Kira Stone", "Rhea Miles", "Kai North", "Uma Shah", "Teo Banks", "Wren Ellis",
  "Sora Reed", "Bea Flores", "Ash Rivers", "Nell Park", "Rio Blake", "Faye Lin", "Gus Woods", "Yara Moss", "Pax Dean", "Cora Wells",
];

const mockTitles = [
  "Cloudline", "Last Train", "Curve Finder", "North Star", "Night Bus", "Loop Garden", "Balance", "Wrong Turn", "Low Battery", "Second Half",
  "Tide Window", "Ten Minute Walk", "Pocket Weather", "Streetlight", "Closing Time", "Soft Landing", "Near Here", "Sunday Route", "Good Noise", "Long Way",
  "Local Color", "Second Wind", "Signal Lost", "Small Hours", "Current Notes", "Back Pocket", "Clear Skies", "Crosscut", "Match Day", "Quiet Mode",
  "Paper Trail", "Full Stop", "Window Seat", "Next Exit", "Block Notes", "Blue Hour", "Sightline", "Around Here", "Airspace", "Slow Lane",
  "Interval", "Home Crowd", "Compass Rose", "Echo Park", "Runway Weather", "Cross Town", "Sequence", "Way Home", "Nearby Air", "Team Sheet",
];

const mockDescriptions = [
  "Reads cloud layers and finds the smoothest altitude for a small-plane flight.",
  "A departure clock that keeps the last useful train in view.",
  "Finds the gentlest curve through a set of hand-drawn points.",
  "A night-sky compass that navigates using only the brightest visible stars.",
  "Tracks the last bus home and turns every stop into a tiny illustrated story.",
  "A sequencer where planted loops grow, cross-pollinate, and slowly change key.",
  "A pocket balance tool for leveling shelves, frames, and tables.",
  "Navigation that rewards detours and deliberately hides the fastest route.",
  "Plans a day around the nearest places where you can quietly recharge.",
  "A simple halftime tactics board for sketching one second-half move.",
  "Finds the calmest tide window from nearby marine observations.",
  "Generates a ten-minute neighborhood walk whenever you feel stuck.",
  "A one-screen forecast that answers only: coat, umbrella, or neither.",
  "Maps the exact minute each street on your walk switches its lights on.",
  "Shows what is still open nearby as the evening winds down.",
  "A crosswind briefing tool for planning a calmer approach.",
  "Finds useful places within a five-minute walk without showing a full map.",
  "Builds an unhurried driving route for a free Sunday afternoon.",
  "Turns room noise into soft percussion without recording anyone.",
  "Builds scenic walking routes that are intentionally twice as long.",
  "Collects colors from photos and names them after where they were found.",
  "A breathing coach whose pace follows the wind outside your window.",
  "A shared radio room built around intermittent, distorted messages.",
  "Mixes a personal late-night station from sounds saved during the day.",
  "A water-current notebook for recording where small things drift.",
  "Remembers the tiny objects you always forget when leaving home.",
  "Shows the next clear patch of sky and the best direction to face.",
  "Finds cross-block walking paths shared by nearby neighbors.",
  "Builds a match poster, lineup, and scorecard for informal weekend games.",
  "Mutes distracting sites until a physical timer on your desk expires.",
  "Turns a folder of receipts and notes into a navigable visual timeline.",
  "A tiny timer that gives a satisfying full stop to unfinished tasks.",
  "Pairs train-window scenery with music matched to the speed of travel.",
  "Warns about highway exits early enough to make changing lanes feel calm.",
  "Pins short observations to individual blocks on a neighborhood map.",
  "Schedules evening tasks around the changing quality of natural light.",
  "Checks sightlines between windows, trees, rooftops, and landmarks.",
  "A map that replaces street names with memories attached to each block.",
  "Visualizes nearby flights as a quiet, slowly moving constellation.",
  "Finds low-stress cycling routes using slope, traffic, and shade.",
  "A deliberately small interval timer for thirty-second bursts of focus.",
  "Generates live crowd chants from taps made by everyone watching remotely.",
  "A compass that points toward a person instead of a geographic direction.",
  "Builds looping soundscapes from the acoustic character of public parks.",
  "Combines runway conditions, wind, and visibility in one small briefing.",
  "Combines subway, bike, and walking routes into one readable strip map.",
  "Plays back any hand-drawn sequence like a miniature clockwork diagram.",
  "Leaves breadcrumb notes that appear only when you walk the same route home.",
  "Turns nearby aircraft into a quiet, readable field of moving points.",
  "Makes a clear five-a-side team sheet from whoever is available.",
];

const categories: GalleryProject["type"][] = [
  "Navigation","Navigation","Tools","Navigation","Navigation","Audio","Tools","Navigation","Tools","Tools",
  "Navigation","Navigation","Tools","Navigation","Tools","Navigation","Navigation","Navigation","Audio","Navigation",
  "Tools","Tools","Audio","Audio","Audio","Tools","Tools","Navigation","Tools","Tools",
  "Tools","Tools","Audio","Navigation","Navigation","Tools","Tools","Navigation","Navigation","Navigation",
  "Tools","Audio","Navigation","Audio","Navigation","Navigation","Tools","Navigation","Navigation","Tools",
];
const colors = ["lime", "blue", "coral", "violet"] as const;
const locations = ["New York, NY", "Los Angeles, CA", "London, UK", "Berlin, DE", "Toronto, CA", "Lisbon, PT", "Seoul, KR", "Mexico City, MX", "Melbourne, AU", "Paris, FR"];
const accents = ["#2947ff", "#ff5b55", "#35d456", "#7e22ce", "#111111"];

function handleFor(name: string) {
  return name.toLowerCase().replaceAll(" ", "");
}

const categoryPreviewCounts: Record<GalleryProject["type"], number> = { Games: 0, Navigation: 0, Audio: 0, Tools: 0 };

// The local concept gallery deliberately mixes unrelated visual languages. These
// are curated by subject, not generated from the Sundays card system.
const curatedThumbnails: Record<string, number | string> = {
  Cloudline: 10, "Last Train": 23, "North Star": 8, "Night Bus": 1, "Wrong Turn": 4,
  "Tide Window": 33, "Ten Minute Walk": 49, Streetlight: 54, "Soft Landing": 5,
  "Near Here": 53, "Sunday Route": 50, "Long Way": 18, Crosscut: 35, "Next Exit": 38,
  "Block Notes": 30, "Around Here": 15, Airspace: 31, "Slow Lane": 47,
  "Compass Rose": 26, "Runway Weather": 27, "Cross Town": 46, "Way Home": 6,
  "Nearby Air": 36,
  "Loop Garden": 2, "Good Noise": 17, "Signal Lost": 13, "Small Hours": 24,
  "Current Notes": 40, "Window Seat": "audio-window-seat.png",
  "Home Crowd": "audio-home-crowd.png", "Echo Park": "audio-echo-park.png",
  "Curve Finder": 11, Balance: 34, "Low Battery": 37, "Second Half": 9,
  "Pocket Weather": 20, "Closing Time": 14, "Local Color": 32, "Second Wind": 41,
  "Back Pocket": 16, "Clear Skies": 25, "Match Day": 29, "Quiet Mode": 39,
  "Paper Trail": 52, "Full Stop": 12, "Blue Hour": 21, Sightline: 44,
  Interval: 48, Sequence: 42, "Team Sheet": 45,
};

const mockProjects: GalleryProject[] = mockNames.map((maker, index) => {
  const type = categories[index];
  const previewIndex = categoryPreviewCounts[type]++;
  const title = mockTitles[index];
  const curatedThumbnail = curatedThumbnails[title];
  const tags = type === "Games" ? ["Canvas", "TypeScript"] : type === "Navigation" ? ["MapLibre", "GPS"] : type === "Audio" ? ["VST3", "JUCE"] : ["Svelte", "SQLite"];
  return {
    number: String(index + 7).padStart(2, "0"),
    title,
    maker,
    handle: handleFor(maker),
    description: mockDescriptions[index],
    tags,
    color: colors[index % colors.length],
    preview: `${type === "Audio" ? "audio" : type === "Navigation" ? "nav" : "tool"}-${previewIndex}`,
    thumbnail: `/explore-thumbs/${typeof curatedThumbnail === "number" ? `${String(curatedThumbnail).padStart(2, "0")}.png` : curatedThumbnail}`,
    type,
  };
});

export const galleryProjects = [...featuredProjects, ...mockProjects];

export type MockMaker = {
  name: string;
  bio: string;
  location: string;
  projects: { name: string; type: string; thumbnail?: string }[];
  accent: string;
};

export const mockMakerMap: Record<string, MockMaker> = Object.fromEntries(
  mockProjects.map((project, index) => [
    project.handle,
    {
      name: project.maker,
      bio: "Independent coder making personal software after hours.",
      location: locations[index % locations.length],
      projects: [{ name: project.title, type: project.preview, thumbnail: project.thumbnail }],
      accent: accents[index % accents.length],
    },
  ]),
);
