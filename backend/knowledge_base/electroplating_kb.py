from typing import Dict, Any

# Electroplating line chemical standards and reactions
BATH_STANDARDS: Dict[str, Dict[str, Any]] = {
    "caustic_cleaning": {
        "name": "Caustic Cleaning (NaOH)",
        "purpose": "Removal of mineral oils, grease, polishing compounds, and drawing lubricants from the metal substrate.",
        "chemistry": {
            "naoh_conc": {
                "name": "Sodium Hydroxide (NaOH) Concentration",
                "min": 50.0,       # g/L
                "max": 90.0,       # g/L
                "unit": "g/L",
                "optimal": 70.0
            },
            "temp": {
                "name": "Bath Temperature",
                "min": 60.0,       # °C
                "max": 80.0,       # °C
                "unit": "°C",
                "optimal": 70.0
            },
            "time": {
                "name": "Immersion Time",
                "min": 5.0,        # minutes
                "max": 15.0,       # minutes
                "unit": "min",
                "optimal": 10.0
            }
        },
        "reactions": [
            "Saponification of animal/vegetable fats: Fat + NaOH -> Soap + Glycerol",
            "Emulsification of mineral oils: Displacement of oil films via surfactant action"
        ]
    },
    "acid_activation": {
        "name": "Sulfuric Acid Activation (H2SO4)",
        "purpose": "Removal of light oxide scale, rust, and surface passivations to expose raw iron crystal lattice.",
        "chemistry": {
            "h2so4_conc": {
                "name": "Sulfuric Acid (H2SO4) Concentration",
                "min": 5.0,        # % v/v
                "max": 12.0,       # % v/v
                "unit": "%",
                "optimal": 8.0
            },
            "temp": {
                "name": "Bath Temperature",
                "min": 20.0,       # °C
                "max": 30.0,       # °C
                "unit": "°C",
                "optimal": 25.0
            },
            "time": {
                "name": "Activation Duration",
                "min": 30.0,       # seconds
                "max": 90.0,       # seconds
                "unit": "sec",
                "optimal": 60.0
            }
        },
        "reactions": [
            "Oxide dissolution: Fe2O3 + 3H2SO4 -> Fe2(SO4)3 + 3H2O",
            "Slight substrate etching to promote mechanical anchoring of nickel"
        ]
    },
    "semi_bright_nickel": {
        "name": "Semi-Bright Nickel Plating",
        "purpose": "Deposits a sulfur-free, ductile nickel underlayer that provides excellent leveling and corrosion barrier properties.",
        "chemistry": {
            "ni_sulfate": {
                "name": "Nickel Sulfate (NiSO4·6H2O)",
                "min": 250.0,      # g/L
                "max": 325.0,      # g/L
                "unit": "g/L",
                "optimal": 280.0
            },
            "ni_chloride": {
                "name": "Nickel Chloride (NiCl2·6H2O)",
                "min": 40.0,       # g/L
                "max": 60.0,       # g/L
                "unit": "g/L",
                "optimal": 50.0
            },
            "boric_acid": {
                "name": "Boric Acid (H3BO_3) Buffer",
                "min": 35.0,       # g/L
                "max": 45.0,       # g/L
                "unit": "g/L",
                "optimal": 40.0
            },
            "ph": {
                "name": "Operating pH",
                "min": 3.8,
                "max": 4.5,
                "unit": "",
                "optimal": 4.2
            },
            "temp": {
                "name": "Operating Temperature",
                "min": 50.0,       # °C
                "max": 60.0,       # °C
                "unit": "°C",
                "optimal": 55.0
            },
            "current_density": {
                "name": "Cathode Current Density",
                "min": 2.0,        # A/dm²
                "max": 4.0,        # A/dm²
                "unit": "A/dm²",
                "optimal": 3.0
            }
        },
        "reactions": [
            "Nickel deposition: Ni2+ + 2e- -> Ni (Sulfur-free crystal lattice)",
            "Buffer action: H3BO3 buffers the cathode film pH, preventing Ni(OH)2 precipitation"
        ]
    },
    "bright_nickel": {
        "name": "Bright Nickel Plating",
        "purpose": "Deposits a highly polished, sulfur-containing nickel layer. In combination with semi-bright, forms a duplex corrosion-resistant coating.",
        "chemistry": {
            "brightener": {
                "name": "Organic Brightener/Carrier level",
                "min": 1.0,        # mL/L
                "max": 2.5,        # mL/L
                "unit": "mL/L",
                "optimal": 1.5
            },
            "ni_sulfate": {
                "name": "Nickel Sulfate (NiSO4·6H2O)",
                "min": 240.0,      # g/L
                "max": 300.0,      # g/L
                "unit": "g/L",
                "optimal": 270.0
            },
            "ni_chloride": {
                "name": "Nickel Chloride (NiCl2·6H2O)",
                "min": 40.0,       # g/L
                "max": 80.0,       # g/L
                "unit": "g/L",
                "optimal": 60.0
            },
            "boric_acid": {
                "name": "Boric Acid (H3BO_3) Buffer",
                "min": 35.0,       # g/L
                "max": 45.0,       # g/L
                "unit": "g/L",
                "optimal": 40.0
            },
            "ph": {
                "name": "Operating pH",
                "min": 4.0,
                "max": 4.8,
                "unit": "",
                "optimal": 4.4
            },
            "temp": {
                "name": "Operating Temperature",
                "min": 50.0,       # °C
                "max": 65.0,       # °C
                "unit": "°C",
                "optimal": 58.0
            },
            "current_density": {
                "name": "Cathode Current Density",
                "min": 3.0,        # A/dm²
                "max": 5.0,        # A/dm²
                "unit": "A/dm²",
                "optimal": 4.0
            }
        },
        "reactions": [
            "Co-deposition of trace Sulfur from brighteners (saccharin/alkynes) to refine grain boundary sizes, inducing mirror reflection.",
            "Nickel chloride anode dissolution: Ni -> Ni2+ + 2e-"
        ]
    },
    "chrome_plating": {
        "name": "Chromic Acid Chrome Plating",
        "purpose": "Applies a micro-thin, hard, blue-white chromium layer over bright nickel to resist wear and oxidation.",
        "chemistry": {
            "chromic_acid": {
                "name": "Chromic Acid (CrO3)",
                "min": 220.0,      # g/L
                "max": 280.0,      # g/L
                "unit": "g/L",
                "optimal": 250.0
            },
            "sulfate_ratio": {
                "name": "CrO3 : H2SO4 Catalyst Ratio",
                "min": 90.0,       # ratio
                "max": 110.0,      # ratio
                "unit": ":1",
                "optimal": 100.0
            },
            "temp": {
                "name": "Operating Temperature",
                "min": 40.0,       # °C
                "max": 45.0,       # °C
                "unit": "°C",
                "optimal": 42.0
            },
            "current_density": {
                "name": "Cathode Current Density",
                "min": 10.0,       # A/dm²
                "max": 25.0,       # A/dm²
                "unit": "A/dm²",
                "optimal": 18.0
            }
        },
        "reactions": [
            "Chromic acid reduction: Cr2O7(2-) + 14H+ + 12e- -> 2Cr + 7H2O (Valency = 6)",
            "Water electrolysis (90% energy consumption): 2H+ + 2e- -> H2 (gas), 2H2O -> O2 (gas) + 4H+ + 4e-"
        ]
    }
}
