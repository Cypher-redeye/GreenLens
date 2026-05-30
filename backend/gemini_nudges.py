import google.generativeai as genai
from config import get_settings
from typing import Optional

settings = get_settings()

def initialize_gemini():
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_nudge(
    activity_type: str,
    co2_amount: float,
    user_name: str,
    recent_activities: list,
) -> Optional[str]:
    """
    Generate personalized nudges using Gemini API.
    Returns a nudge string or None if API key is not configured.
    """
    if not settings.GEMINI_API_KEY:
        return get_default_nudge(activity_type, co2_amount)
    
    try:
        initialize_gemini()
        model = genai.GenerativeModel("gemini-flash-latest")
        
        activity_summary = ", ".join([f"{a['type']}: {a['value']} {a['unit']}" for a in recent_activities[-3:]])
        
        prompt = f"""You are an eco-friendly AI coach for GreenLens, an Indian college carbon tracking app.
        
Student: {user_name}
Today's activity: {activity_type} - {co2_amount} kg CO2
Recent activities: {activity_summary}

Generate a SHORT, motivating 1-2 sentence nudge (max 40 words) to encourage sustainable habits. 
Be specific about the activity. Make it actionable, not preachy. Use Indian context when relevant.
CRITICAL: Do NOT use any markdown formatting (no asterisks, no bold text). Output plain text only."""
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating nudge: {e}")
        return get_default_nudge(activity_type, co2_amount)

def get_default_nudge(activity_type: str, co2_amount: float) -> str:
    """Fallback nudges when API is unavailable"""
    nudges = {
        "transport": f"Great logging! {co2_amount}kg CO2 from transport. Try carpooling next time to cut emissions in half.",
        "food": f"You logged a meal with {co2_amount}kg CO2. How about going vegetarian one day this week?",
        "electricity": f"Nice tracking! {co2_amount}kg CO2 from electricity. Switch off devices when not in use.",
        "purchases": f"You're conscious about purchases - {co2_amount}kg CO2 impact. Consider buying secondhand next time.",
        "waste": f"Logged {co2_amount}kg CO2 from waste. Start composting organic waste to reduce this!",
    }
    return nudges.get(activity_type, f"Keep tracking! You've logged {co2_amount}kg CO2 today.")
