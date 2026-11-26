import os
import random
import csv

# Seeds for deterministic generation
random.seed(42)

AUTHENTIC_TEMPLATES = [
    ("I've been using this {product} for about {time} now. Overall it works {adverb}, though {caveat}. Build quality is {quality} for the price.", 4.0),
    ("Purchased this after reading several comparisons. The setup took {time}, and the instructions were {clarity}. It performs well during daily use, but keep in mind that {minor_flaw}.", 4.0),
    ("Decent {product}. Does what it says on the tin. Not {overstatement}, but definitely adequate for my needs. Would consider buying again if on sale.", 3.0),
    ("Arrived in good condition. The material feels {material_feel} and the finish is neat. Battery/durability lasted roughly {time} in my testing.", 4.0),
    ("Honestly a bit disappointed. While the design looks nice, {criticism}. Customer support was {support_response}. Returning this.", 2.0),
    ("Works fine for light tasks, but struggles when {stress_test}. If you need something for heavy daily usage, look elsewhere.", 3.0),
    ("Solid 5-star experience so far. Exactly as described, solved my problem with {issue}. Shipped within 2 days.", 5.0),
    ("Very average. The buttons feel slightly {tactile} and the software has a few quirks. Okay value if you get it at a discount.", 3.0),
    ("I rarely write reviews, but this actually surprised me. After 3 weeks of continuous use, {positive_observation}. Well thought out design.", 5.0),
    ("Had an issue with the first unit arriving defective. Contacted the manufacturer, got a replacement in 4 days. Second one works without problems.", 4.0),
    ("Does not live up to the hype. The manual is confusing and it stopped working after {time}. Not recommended.", 1.0),
    ("Good budget alternative to the brand name versions. It lacks {premium_feature}, but for one third of the cost, that's expected.", 4.0)
]

DECEPTIVE_TEMPLATES = [
    ("Best {product} ever! Changed my life completely! You must buy this right now! 100% recommend to everyone!", 5.0),
    ("Item arrived on time. Works great thanks seller. Highly recommended to all buyers!", 5.0),
    ("MIRACLE PRODUCT! Blown away by the unbelievable results! Exceeded all my expectations! Five stars aren't enough!", 5.0),
    ("Cannot live without this {product}! Absolutely phenomenal quality and flawless performance. Don't hesitate, order today!", 5.0),
    ("Simply the best purchase I have ever made on this website. Worth every single penny. Buy it buy it buy it!", 5.0),
    ("Great product fast shipping very good seller will buy again thank you very much a+++++", 5.0),
    ("TOTAL SCAM! Absolute garbage! Broke immediately! Seller is a thief! Worst product in human history! DO NOT BUY!", 1.0),
    ("In conclusion, this {product} represents a seamless blend of modern engineering and exquisite craftsmanship. Furthermore, it serves as a testament to perfection.", 5.0),
    ("Good good good good good good good! Nice nice nice! Best best best! 5 stars!", 5.0),
    ("I was skeptical at first but this is literally magic. Pure magic. Completely solved everything in 5 minutes! Unbelievable!", 5.0),
    ("Excellent {product} with high quality {product}. If you need {product}, this {product} is the supreme {product} on the market today.", 5.0),
    ("Fast delivery and items works well. Thanks seller for the discount coupon. Will purchase five more for my family.", 5.0)
]

PRODUCTS = ["headphones", "ergonomic chair", "coffee grinder", "smartwatch", "wireless charger", "skincare serum", "backpack", "mechanical keyboard", "blender", "dashcam"]
TIMES = ["two weeks", "a month", "three days", "six months", "a few hours"]
ADVERBS = ["reliably", "reasonably well", "consistently", "better than expected"]
CAVEATS = [
    "the cable is somewhat short",
    "the plastic casing attracts fingerprints",
    "it runs a bit warmer than anticipated",
    "the companion app is slightly clunky",
    "the power button requires a firm press"
]
QUALITIES = ["solid", "fairly decent", "acceptable", "good enough"]
CLARITIES = ["straightforward", "somewhat brief", "easy to follow", "mostly clear"]
MINOR_FLAWS = [
    "it does not come with an extra adapter",
    "the indicator light is quite bright in the dark",
    "the zipper is slightly stiff initially",
    "the packaging was slightly crushed in transit"
]
MATERIAL_FEELS = ["sturdy", "smooth", "lightweight yet durable", "standard matte plastic"]
CRITICISMS = [
    "the battery life barely reaches half of what was advertised",
    "it makes an irritating high pitched whine",
    "the fit is uncomfortably tight",
    "the colors are much duller in person than in the photos"
]
SUPPORT_RESPONSES = ["slow to respond", "helpful and polite", "unresponsive after 3 emails", "quick to offer a return label"]
STRESS_TESTS = ["multitasking", "running on maximum power", "used in outdoor sunlight", "exposed to moisture"]
ISSUES = ["back strain", "desk clutter", "slow charging", "morning routine friction"]
TACTILE_FEEL = ["mushy", "loose", "stiff", "clicky"]
PREMIUM_FEATURES = ["wireless connectivity", "aluminum housing", "fast charging", "waterproofing"]
POSITIVE_OBSERVATIONS = [
    "no noticeable wear and tear",
    "sound clarity remains crisp",
    "the motor runs quietly without overheating",
    "battery still holds full charge"
]

def generate_authentic_review():
    tmpl, base_rating = random.choice(AUTHENTIC_TEMPLATES)
    text = tmpl.format(
        product=random.choice(PRODUCTS),
        time=random.choice(TIMES),
        adverb=random.choice(ADVERBS),
        caveat=random.choice(CAVEATS),
        quality=random.choice(QUALITIES),
        clarity=random.choice(CLARITIES),
        minor_flaw=random.choice(MINOR_FLAWS),
        material_feel=random.choice(MATERIAL_FEELS),
        criticism=random.choice(CRITICISMS),
        support_response=random.choice(SUPPORT_RESPONSES),
        stress_test=random.choice(STRESS_TESTS),
        issue=random.choice(ISSUES),
        tactile=random.choice(TACTILE_FEEL),
        premium_feature=random.choice(PREMIUM_FEATURES),
        positive_observation=random.choice(POSITIVE_OBSERVATIONS),
        overstatement=random.choice(["mindblowing", "revolutionary", "flawless perfection"])
    )
    # Add slight random variations in rating
    rating = max(1.0, min(5.0, base_rating + random.choice([-0.5, 0.0, 0.5])))
    return text, rating, 0  # 0 = authentic

def generate_deceptive_review():
    tmpl, rating = random.choice(DECEPTIVE_TEMPLATES)
    text = tmpl.format(
        product=random.choice(PRODUCTS)
    )
    # Randomly append excessive punctuation or emoji text
    if random.random() < 0.35:
        text += " " + random.choice(["!!!!", "❤️❤️❤️", "🔥🔥 MUST HAVE!", "⭐⭐⭐⭐⭐ TOP TIER"])
    return text, rating, 1  # 1 = fake/deceptive

def generate_synthetic_dataset(output_path: str, count: int = 5000):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    records = []
    
    half = count // 2
    for _ in range(half):
        text, rating, label = generate_authentic_review()
        records.append({"review_text": text, "rating": rating, "label": label})
        
    for _ in range(half):
        text, rating, label = generate_deceptive_review()
        records.append({"review_text": text, "rating": rating, "label": label})
        
    random.shuffle(records)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["review_text", "rating", "label"])
        writer.writeheader()
        writer.writerows(records)
    print(f"Generated {len(records)} synthetic review records saved to {output_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_csv = os.path.join(current_dir, "..", "data", "synthetic_reviews.csv")
    generate_synthetic_dataset(target_csv, count=6000)
