/**
 * 939PRO ARCADE RACING - WORLD BUILDING ASSET PACKAGE
 * Style: Neon-Futuristic, High Contrast, Low-Poly
 */

export const NINE_THREE_NINE_STYLE = {
  identity: "939PRO",
  philosophy: "Speed through readability. Bold silhouettes, vibrant neon, clean geometry.",
  global_lighting: "High-contrast ambient with strong directional neon highlights.",
};

export const TRACK_TILESET = {
  dimensions: "Modular 10x10 units",
  tiles: {
    straight: "Standard 2-lane road, high-friction asphalt texture, glowing side-markers.",
    curve_45: "Smooth banking, outer guardrail with neon hazard stripes.",
    curve_90: "Sharp angle, inner apex rumble strips, outer holographic barrier.",
    intersection: "4-way cross, central 939PRO logo projection, overhead traffic drones.",
    split_path: "Y-junction, neon directional arrows on road surface.",
    ramp: "15° elevation gain, underside structural struts visible, edge lighting.",
    jump: "Detached flight segment, landing zone marked with blue pulse lights.",
    boost_pad: "Chevron-patterned floor plate, intense cyan/magenta emission pulse.",
    off_road: {
      grass: "Low-poly blade clusters, deep emerald with lime highlights.",
      dirt: "Angular rock fragments, burnt sienna palette.",
      sand: "Smooth dunes, golden-hour gradients.",
      void: "Neon grid floor, infinite black background, cyan wireframe."
    },
    barriers: {
      guardrail: "Segmented metal rail, yellow/black hazard tape.",
      energy_wall: "Semi-transparent blue hex-grid, impact-reactive glow.",
      tire_stack: "Low-poly cylinders, 939PRO branded covers."
    }
  }
};

export const BIOMES = {
  NEON_CITY: {
    id: "neon_city",
    name: "Neon City Night",
    mood: "Electric, Dense, Vibrant",
    palette: {
      road: "#1a1a2e",
      neon: "#ff00ff", // Magenta
      shadow: "#0f0f1b",
      highlight: "#4d4dff",
      env: ["#16213e", "#0f3460", "#533483"],
      fx: { boost: "#00ffff", sparks: "#ffffff", drift: "#ff00ff" }
    },
    parallax: [
      { layer: "far_sky", elements: ["Purple nebula", "Distant moon"], speed: 0.05 },
      { layer: "mid_skyline", elements: ["Silhouette skyscrapers", "Hologram ads"], speed: 0.2 },
      { layer: "near_buildings", elements: ["Neon signs", "Flying traffic"], speed: 0.5 }
    ],
    props: ["Holographic billboards", "Street lamps", "Cyber-trash bins"]
  },
  COASTAL_HIGHWAY: {
    id: "coastal_highway",
    name: "Coastal Highway Sunset",
    mood: "Warm, Breezy, Nostalgic",
    palette: {
      road: "#2c3e50",
      neon: "#f39c12", // Orange
      shadow: "#2c3e50",
      highlight: "#ecf0f1",
      env: ["#e67e22", "#d35400", "#c0392b"],
      fx: { boost: "#f1c40f", sparks: "#e74c3c", drift: "#f39c12" }
    },
    parallax: [
      { layer: "far_sun", elements: ["Giant low sun", "Orange clouds"], speed: 0.02 },
      { layer: "mid_ocean", elements: ["Low-poly waves", "Distant yachts"], speed: 0.1 },
      { layer: "near_palms", elements: ["Stylized palm trees", "Beach huts"], speed: 0.4 }
    ],
    props: ["Palm trees", "Beach umbrellas", "Wooden fences"]
  },
  DESERT_CANYON: {
    id: "desert_canyon",
    name: "Desert Canyon Heatwave",
    mood: "Harsh, Dusty, Vast",
    palette: {
      road: "#3e2723",
      neon: "#ff5722", // Deep Orange
      shadow: "#1b5e20",
      highlight: "#fff59d",
      env: ["#795548", "#a1887f", "#ffccbc"],
      fx: { boost: "#ffeb3b", sparks: "#ff9800", drift: "#ff5722" }
    },
    parallax: [
      { layer: "far_mountains", elements: ["Red rock silhouettes"], speed: 0.08 },
      { layer: "mid_canyon", elements: ["Rock arches", "Dust devils"], speed: 0.25 },
      { layer: "near_rocks", elements: ["Cactus clusters", "Boulders"], speed: 0.6 }
    ],
    props: ["Cacti", "Skulls", "Rusty barrels"]
  },
  CYBER_INDUSTRIAL: {
    id: "cyber_industrial",
    name: "Cyber-Industrial Zone",
    mood: "Gritty, Heavy, Mechanical",
    palette: {
      road: "#212121",
      neon: "#00e676", // Toxic Green
      shadow: "#000000",
      highlight: "#b2ff59",
      env: ["#424242", "#616161", "#263238"],
      fx: { boost: "#64ffda", sparks: "#cfd8dc", drift: "#00e676" }
    },
    parallax: [
      { layer: "far_factory", elements: ["Smoking chimneys", "Red warning lights"], speed: 0.1 },
      { layer: "mid_pipes", elements: ["Glowing conduits", "Steam vents"], speed: 0.3 },
      { layer: "near_machinery", elements: ["Rotating gears", "Crane arms"], speed: 0.7 }
    ],
    props: ["Shipping containers", "Pipes", "Industrial fans"]
  },
  MOUNTAIN_PASS: {
    id: "mountain_pass",
    name: "Mountain Pass",
    mood: "Cool, Rocky, Pine-scented",
    palette: {
      road: "#334155",
      neon: "#f8fafc", // White/Snow
      shadow: "#1e293b",
      highlight: "#94a3b8",
      env: ["#475569", "#64748b", "#cbd5e0"],
      fx: { boost: "#38bdf8", sparks: "#ffffff", drift: "#94a3b8" }
    },
    parallax: [
      { layer: "far_peaks", elements: ["Snowy peaks", "Foggy valleys"], speed: 0.05 },
      { layer: "mid_forest", elements: ["Pine trees", "Rock faces"], speed: 0.2 },
      { layer: "near_cliffs", elements: ["Boulders", "Guardrails"], speed: 0.5 }
    ],
    props: ["Pine trees", "Boulders", "Snow patches"]
  },
  URBAN_DOWNTOWN: {
    id: "urban_downtown",
    name: "Urban Downtown",
    mood: "Realistic, Reflective, Busy",
    palette: {
      road: "#1e293b",
      neon: "#facc15", // Street lamp yellow
      shadow: "#0f172a",
      highlight: "#f8fafc",
      env: ["#334155", "#475569", "#1e293b"],
      fx: { boost: "#fbbf24", sparks: "#ffffff", drift: "#facc15" }
    },
    parallax: [
      { layer: "far_skyline", elements: ["Distant skyscrapers", "City lights"], speed: 0.1 },
      { layer: "mid_buildings", elements: ["Office blocks", "Billboards"], speed: 0.3 },
      { layer: "near_street", elements: ["Street lamps", "Traffic signs"], speed: 0.6 }
    ],
    props: ["Street lamps", "Traffic signs", "Billboards"]
  }
};

export const FX_ELEMENTS = {
  tire_smoke: "Volumetric low-poly spheres, fading from biome-neon to transparent gray.",
  drift_sparks: "Sharp triangular particles, high-velocity emission from tires, biome-highlight color.",
  boost_flames: "Tapered quad-strips, animated scale, intense core glow (white to biome-boost color).",
  motion_streaks: "Screen-space line segments, radial from center, 10% opacity white.",
  impact_flash: "Circular expansion ring, additive blending, instant decay.",
  ambient_particles: {
    neon_dust: "Floating point sprites, slow drift, biome-neon color.",
    embers: "Rising orange pixels, flickering opacity (Coastal/Desert only)."
  }
};

export const CAR_MODEL_GEN = {
  topology: "Clean quads, ~1500-2500 polygons total.",
  components: {
    chassis: "Sharp wedge-shaped body, integrated diffuser, recessed wheel wells.",
    wheels: "Separate meshes for rotation/steering, low-poly cylinders with rim-glow.",
    cockpit: "Angular glass canopy, dark tint with scanline texture.",
    aero: "Adjustable rear wing (spoiler), side skirts with neon trim lines."
  },
  materials: {
    body: { base: "Biome-primary", roughness: 0.2, metalness: 0.8 },
    glass: { base: "#000000", roughness: 0.05, transmission: 0.5 },
    neon: { base: "Biome-neon", emission: 5.0 }
  },
  uv_layout: "Mirrored X-axis for symmetry, dedicated emission map for 939PRO trim lines."
};
