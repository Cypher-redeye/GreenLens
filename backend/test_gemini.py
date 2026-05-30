import os
import google.generativeai as genai
import json

api_key = os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-flash-latest")

prompt = """
You are an eco-friendly AI assistant. The user has uploaded an image of a grocery receipt, a meal, or a transit ticket.
Please analyze it and estimate the carbon footprint.

Respond ONLY with a valid JSON object in this exact format:
{
  "activity_type": "food", // Must be one of: transport, food, electricity, purchases, waste
  "value": 1.5, // Estimated numerical value for the unit
  "unit": "meal", // e.g., km, meal, kWh, items, kg
  "description": "Vegetarian meal with rice and curries", // Short description of what you found
  "confidence": 0.85 // Your confidence in this estimate (0.0 to 1.0)
}

Here is the receipt text (simulated):
Bank: HDFC BANK
Date: 2025-03-24
Amount: 8813.00
Name: KALPESH MEHTA
Phone: 9879773561
Item Description: Series Armor series Pentacle geyser
"""

try:
    response = model.generate_content(prompt)
    print("Response text:", response.text)
    
    text = response.text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
        
    print("Cleaned text:", text)
    data = json.loads(text.strip())
    print("Parsed JSON:", data)
except Exception as e:
    print(f"Error: {e}")
