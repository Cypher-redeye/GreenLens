EMISSION_FACTORS = {
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
        "india_kwh": 0.82,
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
}

def calculate_co2(activity_type: str, category: str, value: float) -> float:
    """
    Calculate CO2 emissions based on activity type and category.
    Returns CO2 in kg.
    """
    try:
        factor = EMISSION_FACTORS.get(activity_type, {}).get(category, 0)
        return round(value * factor, 2)
    except Exception:
        return 0.0

def get_trees_equivalent(co2_kg: float) -> int:
    """One mature tree absorbs ~21 kg CO2/year"""
    return int(co2_kg / 21)
