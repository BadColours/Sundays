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
  { number: "04", title: "Bearings", maker: "Noor Ahmed", handle: "noorahmed", description: "A playful navigation tool for getting pleasantly less lost.", tags: ["MapLibre", "GPS"], color: "coral", preview: "navigation", type: "Navigation" },
  { number: "05", title: "Hush", maker: "Jon Bell", handle: "jonbell", description: "A tiny noise meter for finding a quieter room.", tags: ["Web Audio", "React"], color: "coral", preview: "hush", type: "Audio" },
  { number: "06", title: "Field Study", maker: "Bo Hart", handle: "bohart", description: "Logs observations from walks as points on a shared neighborhood field map.", tags: ["MapLibre", "GPS"], color: "blue", preview: "mock-34", thumbnail: "/explore-thumbs/35.png", type: "Navigation" },
];

const mockNames = [
  "Ari Vale", "Mina Park", "Luca Reyes", "Hana Kim", "Owen Fox", "Iris Bell", "Nico Lane", "Zara Cole", "Remy Stone", "June Ito",
  "Sam Nwosu", "Lena Wu", "Milo Grant", "Aya Singh", "Leo Moss", "Nia Brooks", "Tao Reed", "Cleo James", "Finn Hale", "Mara Chen",
  "Sol Vega", "Eden Ross", "Jules Kaur", "Kit Rowan", "Anya Lake", "Ravi Moon", "Tess Gray", "Noa Bloom", "Ezra West", "Mika Quinn",
  "Ada Snow", "Ivo Cruz", "Lina Ford", "Maxine Yu", "Bo Hart", "Rhea Miles", "Kai North", "Uma Shah", "Teo Banks", "Wren Ellis",
  "Sora Reed", "Bea Flores", "Ash Rivers", "Nell Park", "Rio Blake", "Faye Lin", "Gus Woods", "Yara Moss", "Pax Dean", "Cora Wells",
];

const mockTitles = [
  "Cloudline", "Last Minute", "Corner Flag", "North Star", "Night Bus", "Loop Garden", "Tiny Keeper", "Wrong Turn", "Low Battery", "Half Time",
  "Open Water", "Side Quest", "Pocket Weather", "Streetlight", "Extra Time", "Soft Landing", "Near Here", "Sunday Driver", "Good Noise", "Long Way",
  "Local Color", "Second Wind", "Signal Lost", "Small Hours", "Drift", "Back Pocket", "Clear Skies", "Shortcut", "Match Day", "Quiet Mode",
  "Paper Trail", "Final Whistle", "Window Seat", "Next Exit", "Field Study", "Blue Hour", "Offside", "Around Here", "Airspace", "Slow Lane",
  "One More", "Home Crowd", "Compass Rose", "Echo Park", "Runway", "Cross Town", "Set Piece", "Way Home", "Holding Pattern", "Little League",
];

const mockDescriptions = [
  "Reads cloud layers and finds the smoothest altitude for a small-plane flight.",
  "A departure-board game about catching a train with sixty seconds left.",
  "Practice impossible curling shots from the corner of a pocket-sized pitch.",
  "A night-sky compass that navigates using only the brightest visible stars.",
  "Tracks the last bus home and turns every stop into a tiny illustrated story.",
  "A sequencer where planted loops grow, cross-pollinate, and slowly change key.",
  "Goalkeeping game controlled entirely by tilting your phone.",
  "Navigation that rewards detours and deliberately hides the fastest route.",
  "Plans a day around the nearest places where you can quietly recharge.",
  "A halftime tactics board for sketching one audacious second-half move.",
  "A sailing game driven by live wind conditions from nearby weather stations.",
  "Generates a ten-minute neighborhood adventure whenever you feel stuck.",
  "A one-screen forecast that answers only: coat, umbrella, or neither.",
  "Maps the exact minute each street on your walk switches its lights on.",
  "A stoppage-time penalty game where the crowd noise controls your nerves.",
  "A landing trainer built around difficult crosswinds and very forgiving physics.",
  "Finds useful places within a five-minute walk without showing a full map.",
  "An endless driving game through procedurally generated Sunday afternoons.",
  "Turns room noise into soft percussion without recording anyone.",
  "Builds scenic walking routes that are intentionally twice as long.",
  "Collects colors from photos and names them after where they were found.",
  "A breathing coach whose pace follows the wind outside your window.",
  "A cooperative radio game played through intermittent, distorted messages.",
  "Mixes a personal late-night station from sounds saved during the day.",
  "A meditative paper-boat game about following currents instead of steering.",
  "Remembers the tiny objects you always forget when leaving home.",
  "Shows the next clear patch of sky and the best direction to face.",
  "Creates pedestrian shortcuts from paths shared by neighbors.",
  "Builds a match poster, lineup, and scorecard for informal weekend games.",
  "Mutes distracting sites until a physical timer on your desk expires.",
  "Turns a folder of receipts and notes into a navigable visual timeline.",
  "A free-kick game where every shot permanently changes the goal.",
  "Pairs train-window scenery with music matched to the speed of travel.",
  "Warns about highway exits early enough to make changing lanes feel calm.",
  "Logs observations from walks as points on a shared neighborhood field map.",
  "Schedules evening tasks around the changing quality of natural light.",
  "A referee simulator made entirely from ambiguous offside decisions.",
  "A map that replaces street names with memories attached to each block.",
  "Visualizes nearby flights as a quiet, slowly moving constellation.",
  "Finds low-stress cycling routes using slope, traffic, and shade.",
  "A one-more-round arcade cabinet for games that last exactly thirty seconds.",
  "Generates live crowd chants from taps made by everyone watching remotely.",
  "A compass that points toward a person instead of a geographic direction.",
  "Builds looping soundscapes from the acoustic character of public parks.",
  "A runway-design puzzle about guiding planes through severe weather.",
  "Combines subway, bike, and walking routes into one readable strip map.",
  "A set-piece designer that plays back runs like a miniature clockwork toy.",
  "Leaves breadcrumb notes that appear only when you walk the same route home.",
  "An air-traffic puzzle about keeping beautiful patterns safely separated.",
  "A five-a-side manager where every player has one oddly specific talent.",
];

const categories: GalleryProject["type"][] = [
  "Navigation","Games","Games","Navigation","Navigation","Audio","Games","Navigation","Tools","Games",
  "Games","Games","Tools","Navigation","Games","Games","Navigation","Games","Audio","Navigation",
  "Tools","Tools","Audio","Audio","Games","Tools","Tools","Navigation","Tools","Tools",
  "Tools","Games","Audio","Navigation","Navigation","Tools","Games","Navigation","Navigation","Navigation",
  "Games","Audio","Navigation","Audio","Games","Navigation","Games","Navigation","Games","Games",
];
const colors = ["lime", "blue", "coral", "violet"] as const;
const locations = ["New York, NY", "Los Angeles, CA", "London, UK", "Berlin, DE", "Toronto, CA", "Lisbon, PT", "Seoul, KR", "Mexico City, MX", "Melbourne, AU", "Paris, FR"];
const accents = ["#2947ff", "#ff5b55", "#35d456", "#7e22ce", "#111111"];

function handleFor(name: string) {
  return name.toLowerCase().replaceAll(" ", "");
}

const mockProjects: GalleryProject[] = mockNames.map((maker, index) => {
  const type = categories[index];
  const tags = type === "Games" ? ["Canvas", "TypeScript"] : type === "Navigation" ? ["MapLibre", "GPS"] : type === "Audio" ? ["Web Audio", "React"] : ["Svelte", "SQLite"];
  return {
    number: String(index + 7).padStart(2, "0"),
    title: mockTitles[index],
    maker,
    handle: handleFor(maker),
    description: mockDescriptions[index],
    tags,
    color: colors[index % colors.length],
    preview: `mock-${index}`,
    thumbnail: `/explore-thumbs/${String(index + 1).padStart(2, "0")}.png`,
    type,
  };
});

export const galleryProjects = [
  ...featuredProjects,
  ...mockProjects.filter((project) => !["noabloom", "bohart"].includes(project.handle)),
];

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
