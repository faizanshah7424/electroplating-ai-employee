from typing import Dict, Any

# Metal profiles containing electrochemical constants and recommendation ranges
# Exclusively focused on the factory's duplex nickel and chrome process
METAL_PROFILES = {
    "semi_bright_nickel": {
        "name": "Semi-Bright Nickel",
        "density": 8.91,          # g/cm³
        "molar_mass": 58.693,      # g/mol
        "valency": 2,             # Ni2+ + 2e- -> Ni
        "default_efficiency": 0.95, # 95%
        "min_current_density": 2.0, # A/dm²
        "max_current_density": 4.0, # A/dm²
        "min_temp": 50,           # °C
        "max_temp": 60,           # °C
        "min_pH": 3.8,
        "max_pH": 4.5
    },
    "bright_nickel": {
        "name": "Bright Nickel",
        "density": 8.91,          # g/cm³
        "molar_mass": 58.693,      # g/mol
        "valency": 2,             # Ni2+ + 2e- -> Ni
        "default_efficiency": 0.95, # 95%
        "min_current_density": 3.0, # A/dm²
        "max_current_density": 5.0, # A/dm²
        "min_temp": 50,           # °C
        "max_temp": 65,           # °C
        "min_pH": 4.0,
        "max_pH": 4.8
    },
    "chrome": {
        "name": "Hexavalent Chromium Plating",
        "density": 7.19,          # g/cm³
        "molar_mass": 51.996,     # g/mol
        "valency": 6,             # Cr6+ + 6e- -> Cr
        "default_efficiency": 0.15, # 15% (extremely low cathode efficiency due to gas evolution)
        "min_current_density": 10.0, # A/dm² (requires high current density to initiate deposition)
        "max_current_density": 25.0, # A/dm²
        "min_temp": 40,           # °C
        "max_temp": 45,           # °C
        "min_pH": 0.0,
        "max_pH": 1.0             # Highly acidic chromic acid bath
    }
}

FARADAY_CONSTANT = 96485  # Coulombs per mole (A*s/mol)

def calculate_plating_parameters(
    metal_key: str,
    area_dm2: float,
    current_density_adm2: float,
    thickness_microns: float,
    efficiency_override: float = None
) -> Dict[str, Any]:
    """
    Computes plating time, total current, and deposited metal weight using Faraday's Law.
    t = (mass * valency * F) / (current * molar_mass * efficiency)
    """
    metal_key = metal_key.lower().strip()
    if metal_key not in METAL_PROFILES:
        raise ValueError(f"Metal '{metal_key}' is not supported. Choose from: {list(METAL_PROFILES.keys())}")
        
    profile = METAL_PROFILES[metal_key]
    efficiency = efficiency_override if efficiency_override is not None else profile["default_efficiency"]
    
    # 1. Total Current (Amps) = Area (dm²) * Current Density (A/dm²)
    total_current_amps = area_dm2 * current_density_adm2
    
    # 2. Deposited Metal Mass (Grams)
    # Area in cm² = Area in dm² * 100
    # Thickness in cm = thickness in microns / 10000
    # Volume in cm³ = Area (cm²) * Thickness (cm) = Area (dm²) * Thickness (microns) * 0.01
    volume_cm3 = area_dm2 * thickness_microns * 0.01
    deposited_mass_grams = volume_cm3 * profile["density"]
    
    # 3. Time required (minutes)
    # Faraday's formula: seconds = (mass * valency * F) / (current * molar_mass * efficiency)
    valency = profile["valency"]
    molar_mass = profile["molar_mass"]
    
    time_seconds = (deposited_mass_grams * valency * FARADAY_CONSTANT) / (total_current_amps * molar_mass * efficiency)
    time_minutes = round(time_seconds / 60.0, 2)
    
    return {
        "metal_name": profile["name"],
        "time_minutes": time_minutes,
        "total_current_amps": round(total_current_amps, 2),
        "deposited_mass_grams": round(deposited_mass_grams, 2),
        "efficiency": efficiency,
        "profile": profile
    }
