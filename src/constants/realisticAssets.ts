/**
 * REALISTIC 3D RACING WORLD-BUILDING ASSET PACKAGE
 * High-fidelity specifications for WebGL, Three.js, Unity, and Unreal pipelines.
 */

export const REALISTIC_WORLD_PACKAGE = {
  version: "1.0.0",
  style: "Physically Accurate Realism",
  units: "Meters (1 unit = 1m)",
  
  // ===========================================================
  // 1. REALISTIC 3D TRACK MODELS (Modular System)
  // ===========================================================
  track_system: {
    topology: "Clean quads, weighted normals, optimized for LODs.",
    modular_pieces: [
      { id: "str_10m", name: "Straight 10m", dims: [12, 0.2, 10], features: "Seamless tiling, drain gutters" },
      { id: "cur_45_r20", name: "45° Curve R20", dims: "Radius 20m", features: "Positive banking (3°)" },
      { id: "cur_90_r15", name: "90° Curve R15", dims: "Radius 15m", features: "Rumble strips integrated" },
      { id: "int_4way", name: "4-Way Intersection", dims: [24, 0.2, 24], features: "Traffic light mounting points" },
      { id: "elev_ramp_5", name: "Elevation Ramp 5°", dims: [12, 2, 20], features: "Concrete support pillars" },
      { id: "bridge_susp", name: "Suspension Bridge Section", dims: [15, 10, 30], features: "Steel cables, expansion joints" }
    ],
    barriers: [
      { id: "guardrail_steel", name: "Steel Guardrail", material: "Galvanized Steel", physics: "Deformable" },
      { id: "barrier_jersey", name: "Jersey Barrier", material: "Weathered Concrete", physics: "Static" },
      { id: "tire_wall_3x", name: "Triple Tire Wall", material: "Rubber", physics: "High Friction / Elastic" }
    ],
    markings: ["Double Yellow Center", "White Edge Line", "Grid Start Positions", "Skid Marks (Decal)"]
  },

  // ===========================================================
  // 2. ENVIRONMENT MODELS + PARALLAX BACKGROUNDS
  // ===========================================================
  environment_assets: {
    vegetation: [
      { id: "pine_highland", tris: 4500, maps: ["Albedo", "Alpha", "Normal"], wind_support: true },
      { id: "shrub_dry", tris: 800, maps: ["Albedo", "Normal"], variants: 3 }
    ],
    structures: [
      { id: "bld_office_glass", tris: 12000, features: "Interior parallax mapping, reflective glass" },
      { id: "utility_pole_wood", tris: 1200, features: "Hanging wire spline points" }
    ],
    background_layers: {
      mountain_pass: ["Distant Peaks (Foggy)", "Mid-range Ridges", "Near Cliffs"],
      urban_downtown: ["Skyline Silhouette", "Mid-tier Skyscrapers", "Near City Props"],
      coastal_highway: ["Horizon Line", "Ocean Surface (Animated)", "Coastal Rocks"]
    }
  },

  // ===========================================================
  // 3. LEVEL THEMES (4 Realistic Biomes)
  // ===========================================================
  biomes: {
    MOUNTAIN_PASS: {
      lighting: "Cool daylight, high contrast shadows",
      weather: "Mist/Fog, light drizzle",
      palette: ["#4a5568", "#2d3748", "#718096", "#cbd5e0"],
      ambient_fx: "Falling pine needles, low-altitude clouds"
    },
    COASTAL_HIGHWAY: {
      lighting: "Golden hour sunset, long shadows",
      weather: "Clear, high humidity",
      palette: ["#ed8936", "#dd6b20", "#2c5282", "#ebf8ff"],
      ambient_fx: "Sea spray, lens flares, heat shimmer on horizon"
    },
    DESERT_CANYON: {
      lighting: "Harsh noon sun, bleached highlights",
      weather: "Dust storm, extreme heat",
      palette: ["#c05621", "#9c4221", "#f6e05e", "#744210"],
      ambient_fx: "Tumbleweeds, heat haze distortion, sand drifts"
    },
    URBAN_DOWNTOWN: {
      lighting: "Night-time, artificial neon, street lamps",
      weather: "Post-rain wetness",
      palette: ["#1a202c", "#2d3748", "#4a5568", "#000000"],
      ambient_fx: "Steam from vents, light bloom, reflective puddles"
    }
  },

  // ===========================================================
  // 4. REALISTIC MATERIAL LIBRARY (PBR)
  // ===========================================================
  materials: {
    asphalt_worn: {
      albedo: "Dark gray with aggregate speckles",
      roughness: "0.8 (Dry) / 0.2 (Wet)",
      metallic: 0.0,
      normal: "Fine grain + occasional cracks",
      height: "Subtle pitting"
    },
    car_paint_metallic: {
      albedo: "Base color + 5% metallic flake",
      roughness: "0.1 (Clear coat)",
      metallic: 0.9,
      normal: "Perfectly smooth",
      clearcoat: 1.0
    },
    chrome_polished: {
      albedo: "#ffffff",
      roughness: 0.02,
      metallic: 1.0,
      normal: "Smooth"
    }
  },

  // ===========================================================
  // 5. REALISTIC FX ELEMENTS
  // ===========================================================
  vfx: {
    tire_smoke: "Particle system with volumetric shading, density based on friction.",
    water_spray: "Fine mist particles, screen-space droplets on camera.",
    heat_distortion: "Refraction shader using perlin noise offset.",
    collision_sparks: "High-velocity point particles with additive bloom."
  },

  // ===========================================================
  // 6. DECORATIVE PROPS + OBSTACLES
  // ===========================================================
  props: [
    { id: "cone_orange", tris: 400, physics: "Dynamic / Rigid Body" },
    { id: "barrel_plastic", tris: 800, physics: "Dynamic / Water-filled" },
    { id: "billboard_led", tris: 1500, emissive: true, animation: "Scrolling Ads" }
  ],

  // ===========================================================
  // 7. REALISTIC 3D CAR MODEL GENERATOR
  // ===========================================================
  car_generator_spec: {
    topology: "5k (LOD2) to 25k (LOD0) triangles.",
    mesh_hierarchy: [
      "Body_Shell",
      "Wheel_FL", "Wheel_FR", "Wheel_RL", "Wheel_RR",
      "Brake_Disc_FL", "Brake_Disc_FR",
      "Glass_Windshield", "Glass_Windows",
      "Light_Head_L", "Light_Head_R", "Light_Tail_L", "Light_Tail_R",
      "Interior_Dash", "Interior_Seats"
    ],
    variants: {
      stock: "Standard factory aero",
      race: "Carbon fiber splitter, GT wing, lowered suspension",
      damaged: "Morph targets for dents, alpha-masked scratches",
      wet: "Dynamic cubemap reflections, animated normal-map ripples"
    }
  }
};
