GLOBAL_EMISSION_FACTORS = {
    "IN": {
        "transport": {
            "car_km": 0.19,
            "bike_km": 0.05,
            "bus_km": 0.08,
            "metro_km": 0.03,
            "flight_km": 0.255,
        },
        "food": {
            "vegetarian_meal": 1.2,
            "non_vegetarian_meal": 2.8,
            "vegan_meal": 0.9,
            "dairy_product_100g": 0.3,
            "meat_100g": 2.5,
        },
        "electricity": {
            "kwh": 0.82,
        },
        "purchases": {
            "clothing_item": 5.0,
            "electronics_item": 15.0,
            "household_item": 3.0,
        },
        "waste": {
            "plastic_kg": 2.5,
            "paper_kg": 1.2,
            "organic_kg": 0.5,
        }
    },
    "US": {
        "transport": {
            "car_km": 0.24,
            "bike_km": 0.05,
            "bus_km": 0.12,
            "metro_km": 0.04,
            "flight_km": 0.255,
        },
        "food": {
            "vegetarian_meal": 1.4,
            "non_vegetarian_meal": 3.2,
            "vegan_meal": 1.0,
            "dairy_product_100g": 0.4,
            "meat_100g": 3.0,
        },
        "electricity": {
            "kwh": 0.38, # Cleaner grid
        },
        "purchases": {
            "clothing_item": 5.5,
            "electronics_item": 15.0,
            "household_item": 3.5,
        },
        "waste": {
            "plastic_kg": 3.0,
            "paper_kg": 1.5,
            "organic_kg": 0.8,
        }
    }
}

def calculate_co2(activity_type: str, category: str, value: float, region: str = "IN") -> float:
    """
    Calculate CO2 emissions based on activity type, category, and geographical region.
    Returns CO2 in kg.
    """
    try:
        # Fallback to IN if region not found
        factors = GLOBAL_EMISSION_FACTORS.get(region, GLOBAL_EMISSION_FACTORS["IN"])
        
        # Backward compatibility for 'india_kwh'
        if category == "india_kwh":
            category = "kwh"
            
        factor = factors.get(activity_type, {}).get(category, 0)
        return round(value * factor, 2)
    except Exception:
        return 0.0

def get_trees_equivalent(co2_kg: float) -> int:
    """One mature tree absorbs ~21 kg CO2/year"""
    return int(co2_kg / 21)
