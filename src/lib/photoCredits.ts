// The sample photos come from Wikimedia Commons, and their licenses require this credit.
type PhotoCredit = {
  item: string;
  author: string;
  license: string;
  // Public domain photos have no license page to link to.
  licenseUrl: string | null;
  source: string;
};

export const PHOTO_CREDITS: PhotoCredit[] = [
  {
    item: "Claw Hammer",
    author: "Kszapsza",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Carpenter%27s_hammer.JPG",
  },
  {
    item: "Common Nails",
    author: "tinspoon from Saarlouis",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Cluster-2.jpg",
  },
  {
    item: "Wood Screws",
    author: "Ssawka at pl.wikipedia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Pozidriv-head_screw.jpg",
  },
  {
    item: "Flathead Screwdriver",
    author: "Tjcase2",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Flathead_screwdriver.JPG",
  },
  {
    item: "Latex Paint",
    author: "Daniel Case",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:White_primer_bucket.jpg",
  },
  {
    item: "Paint Brush",
    author: "SimonTrew",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Decorators%27paintbiushes.jpg",
  },
  {
    item: "Measuring Tape",
    author: "Coyau",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Stanley_dynagrip_5_m_%C3%97_19_mm_33-684_01.jpg",
  },
  {
    item: "PVC Pipe",
    author: "Carlos6913",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:PVC_pipe_Example.jpg",
  },
  {
    item: "Adjustable Wrench",
    author: "Batholith",
    license: "Public domain",
    licenseUrl: null,
    source:
      "https://commons.wikimedia.org/wiki/File:Adjustable_spanner_20101109.jpg",
  },
  {
    item: "Combination Pliers",
    author: "R. Henrik Nilsson",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Combination_pliers_2621_7_by_Bahco_Tools_Sweden.jpg",
  },
  {
    item: "Phillips Screwdriver",
    author: "Bronzaclose",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0",
    source:
      "https://commons.wikimedia.org/wiki/File:PHILLIPS_screwdriver_and_screw.JPG",
  },
  {
    item: "Hacksaw",
    author: "Luke Milburn",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Hacksaw_with_grey_handle.jpg",
  },
  {
    item: "Pruning Saw",
    author: "F. D. Richards",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Hand_Saws.jpg",
  },
  {
    item: "Utility Knife",
    author: "Evan-Amos",
    license: "Public domain",
    licenseUrl: null,
    source: "https://commons.wikimedia.org/wiki/File:Box-cutter.jpg",
  },
  {
    item: "Wood Chisel",
    author: "Fishdecoy at English Wikipedia",
    license: "Public domain",
    licenseUrl: null,
    source: "https://commons.wikimedia.org/wiki/File:Wood_chisel.JPG",
  },
  {
    item: "Allen Key Set",
    author: "Leon Brooks",
    license: "Public domain",
    licenseUrl: null,
    source:
      "https://commons.wikimedia.org/wiki/File:Set_of_eight_hex_allen_keys_on_ring_on_table.jpg",
  },
  {
    item: "Spirit Level",
    author: "Auckland Museum",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Level_(AM_70130).jpg",
  },
  {
    item: "Pipe Wrench",
    author: "Jayess",
    license: "Public domain",
    licenseUrl: null,
    source: "https://commons.wikimedia.org/wiki/File:Pipe_Wrench.jpg",
  },
  {
    item: "Wire Stripper",
    author: "Dmitry G",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Wire_stripper_amtech_B4285.JPG",
  },
  {
    item: "Cordless Drill",
    author: "Fructibus",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Cordless_electric_(screw)_drill.jpg",
  },
  {
    item: "Hex Bolt & Nut",
    author: "Obviously",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Bolt_nut_(retouch).jpg",
  },
  {
    item: "Thread Seal Tape",
    author: "Miya.m",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:PTFE_tape01.jpg",
  },
  {
    item: "Electrical Tape",
    author: "R. Henrik Nilsson",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Ca_1970_roll_of_polyethylene_electrical_insulating_tape_by_Norgesplaster_AS_Mosby_Norway.jpg",
  },
  {
    item: "LED Bulb",
    author: "Loadmaster (David R. Tribble)",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:LED-E27-Light-Bulb-1112_01.jpg",
  },
  {
    item: "Extension Cord Reel",
    author: "Fumikas Sagisavas",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0",
    source: "https://commons.wikimedia.org/wiki/File:Cable_reel_extension_cord.jpg",
  },
];
