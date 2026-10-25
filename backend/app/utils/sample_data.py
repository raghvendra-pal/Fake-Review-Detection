from typing import Dict, Any, List

SAMPLE_DATASETS: Dict[str, Dict[str, Any]] = {
    "ecommerce-burst": {
        "title": "AuraSound Ultra Pro Wireless ANC Headphones",
        "description": "Coordinated bot ring campaign with patterned usernames, duplicate copy-paste reviews, and a 24-hour spam burst spike.",
        "reviews": [
            # Coordinated Ring 1 (mark_88*)
            {"reviewer_name": "mark_881", "review_text": "Best headphones ever! Changed my life completely! You must buy this right now! 100% recommend to everyone!", "rating": 5.0, "date": "2026-10-15T09:12:00", "verified_purchase": False},
            {"reviewer_name": "mark_882", "review_text": "Best headphones ever! Changed my life completely! You must buy this right now! 100% recommend to everyone!", "rating": 5.0, "date": "2026-10-15T09:14:00", "verified_purchase": False},
            {"reviewer_name": "mark_883", "review_text": "Best headphones ever! Changed my life completely! You must buy this right now! 100% recommend to everyone!", "rating": 5.0, "date": "2026-10-15T09:18:00", "verified_purchase": False},
            {"reviewer_name": "mark_884", "review_text": "Item arrived on time. Works great thanks seller. Highly recommended to all buyers!", "rating": 5.0, "date": "2026-10-15T09:22:00", "verified_purchase": False},
            {"reviewer_name": "mark_885", "review_text": "Item arrived on time. Works great thanks seller. Highly recommended to all buyers!", "rating": 5.0, "date": "2026-10-15T09:30:00", "verified_purchase": False},
            
            # Coordinated Ring 2 (sarah_99*)
            {"reviewer_name": "sarah_991", "review_text": "MIRACLE PRODUCT! Blown away by the unbelievable results! Exceeded all my expectations! Five stars aren't enough!", "rating": 5.0, "date": "2026-10-15T11:05:00", "verified_purchase": False},
            {"reviewer_name": "sarah_992", "review_text": "MIRACLE PRODUCT! Blown away by the unbelievable results! Exceeded all my expectations! Five stars aren't enough!", "rating": 5.0, "date": "2026-10-15T11:10:00", "verified_purchase": False},
            {"reviewer_name": "sarah_993", "review_text": "Cannot live without this headphones! Absolutely phenomenal quality and flawless performance. Don't hesitate, order today!", "rating": 5.0, "date": "2026-10-15T11:15:00", "verified_purchase": False},
            {"reviewer_name": "sarah_994", "review_text": "Cannot live without this headphones! Absolutely phenomenal quality and flawless performance. Don't hesitate, order today!", "rating": 5.0, "date": "2026-10-15T11:20:00", "verified_purchase": False},
            
            # Generic click farm praise
            {"reviewer_name": "alex_pro88", "review_text": "Simply the best purchase I have ever made on this website. Worth every single penny. Buy it buy it buy it!", "rating": 5.0, "date": "2026-10-15T12:00:00", "verified_purchase": False},
            {"reviewer_name": "alex_pro89", "review_text": "Simply the best purchase I have ever made on this website. Worth every single penny. Buy it buy it buy it!", "rating": 5.0, "date": "2026-10-15T12:05:00", "verified_purchase": False},
            {"reviewer_name": "bot_buyer_01", "review_text": "Great product fast shipping very good seller will buy again thank you very much a+++++", "rating": 5.0, "date": "2026-10-15T12:15:00", "verified_purchase": False},
            {"reviewer_name": "bot_buyer_02", "review_text": "Great product fast shipping very good seller will buy again thank you very much a+++++", "rating": 5.0, "date": "2026-10-15T12:20:00", "verified_purchase": False},
            {"reviewer_name": "bot_buyer_03", "review_text": "In conclusion, this headphones represents a seamless blend of modern engineering and exquisite craftsmanship. Furthermore, it serves as a testament to perfection.", "rating": 5.0, "date": "2026-10-15T13:00:00", "verified_purchase": False},
            {"reviewer_name": "bot_buyer_04", "review_text": "Good good good good good good good! Nice nice nice! Best best best! 5 stars!", "rating": 5.0, "date": "2026-10-15T13:10:00", "verified_purchase": False},
            
            # A couple of genuine negative reviews buried in the flood
            {"reviewer_name": "real_customer_dave", "review_text": "Do not believe the hype. The headband cracked within 4 days and sound keeps cutting out. Very poor build quality.", "rating": 1.0, "date": "2026-10-10T14:20:00", "verified_purchase": True},
            {"reviewer_name": "claire_audio", "review_text": "Muffled bass and terrible microphone. Customer support never answered my refund request.", "rating": 1.0, "date": "2026-10-11T16:45:00", "verified_purchase": True},
            
            # Additional burst spam
            {"reviewer_name": "promo_user_101", "review_text": "I was skeptical at first but this is literally magic. Pure magic. Completely solved everything in 5 minutes! Unbelievable!", "rating": 5.0, "date": "2026-10-15T14:00:00", "verified_purchase": False},
            {"reviewer_name": "promo_user_102", "review_text": "I was skeptical at first but this is literally magic. Pure magic. Completely solved everything in 5 minutes! Unbelievable!", "rating": 5.0, "date": "2026-10-15T14:10:00", "verified_purchase": False},
            {"reviewer_name": "fast_reviewer_9", "review_text": "Five stars aren't enough for this masterpiece! Run don't walk!", "rating": 5.0, "date": "2026-10-15T15:00:00", "verified_purchase": False},
            {"reviewer_name": "fast_reviewer_8", "review_text": "Five stars aren't enough for this masterpiece! Run don't walk!", "rating": 5.0, "date": "2026-10-15T15:05:00", "verified_purchase": False}
        ]
    },
    
    "organic-app": {
        "title": "Keychron K2 Wireless Mechanical Keyboard",
        "description": "Authentic organic product with realistic rating variance, balanced pros/cons, verified buyers, and healthy temporal spread.",
        "reviews": [
            {"reviewer_name": "kevin_typing", "review_text": "I've been using this keyboard for about a month now. Overall it works reliably, though the battery life is slightly shorter than expected with backlighting on full. Build quality is solid for the price.", "rating": 4.0, "date": "2026-05-12T10:15:00", "verified_purchase": True},
            {"reviewer_name": "elena_dev", "review_text": "Purchased this after reading several comparisons. The Bluetooth setup took two minutes, and the keycaps feel pleasant. It performs well during daily coding, but keep in mind that the height is a bit tall so a wrist rest is helpful.", "rating": 4.0, "date": "2026-06-04T15:30:00", "verified_purchase": True},
            {"reviewer_name": "marcus_g", "review_text": "Decent keyboard. Does what it says on the tin. Not mindblowing, but definitely adequate for my home office needs. Brown switches have a nice tactile bump.", "rating": 4.0, "date": "2026-07-19T08:45:00", "verified_purchase": True},
            {"reviewer_name": "rachael_w", "review_text": "Arrived in good condition. The aluminum frame feels very sturdy and the Mac layout toggle is handy. Durability has been great over 4 months of heavy daily writing.", "rating": 5.0, "date": "2026-08-01T12:00:00", "verified_purchase": True},
            {"reviewer_name": "sam_coder", "review_text": "Solid 5-star experience so far. Exactly as described, solved my desk clutter problem by cutting the cords. Shipped within 2 days.", "rating": 5.0, "date": "2026-08-22T19:10:00", "verified_purchase": True},
            {"reviewer_name": "tanya_designer", "review_text": "Very average. The spacebar has a slight rattle and the Bluetooth occasionally sleeps too aggressively on Windows. Okay value if you get it on sale.", "rating": 3.0, "date": "2026-09-05T11:20:00", "verified_purchase": True},
            {"reviewer_name": "brian_k", "review_text": "Good budget alternative to custom mechanical builds. It lacks hot-swap sockets on this specific white-backlit version, but for the cost that's expected.", "rating": 4.0, "date": "2026-09-18T14:40:00", "verified_purchase": True},
            {"reviewer_name": "jessica_m", "review_text": "Honestly a bit disappointed. While the design looks clean, the Bluetooth latency made gaming frustrating. Customer support offered standard reset steps that didn't help. Replaced with a 2.4GHz board.", "rating": 2.0, "date": "2026-10-02T16:15:00", "verified_purchase": True},
            {"reviewer_name": "daniel_p", "review_text": "I rarely write reviews, but this actually surprised me. After 3 weeks of continuous use, the red switches feel smooth and there is zero wobble. Great purchase.", "rating": 5.0, "date": "2026-10-12T09:00:00", "verified_purchase": True},
            {"reviewer_name": "olivia_s", "review_text": "Works fine for light office tasks, but key legend printing is starting to wear on the WASD cluster after six months. Keep that in mind.", "rating": 3.0, "date": "2026-10-18T18:25:00", "verified_purchase": True}
        ]
    },
    
    "polarized-brigade": {
        "title": "ApexVital Pure Marine Collagen Elixir",
        "description": "Polarized review brigading campaign with extreme 1-star attacks and artificial 5-star promotional hype.",
        "reviews": [
            {"reviewer_name": "promo_staff_01", "review_text": "MIRACLE PRODUCT! Blown away by the unbelievable results! Exceeded all my expectations! Five stars aren't enough!", "rating": 5.0, "date": "2026-10-12T08:00:00", "verified_purchase": False},
            {"reviewer_name": "promo_staff_02", "review_text": "Cannot live without this serum! Absolutely phenomenal quality and flawless performance. Don't hesitate, order today!", "rating": 5.0, "date": "2026-10-12T08:30:00", "verified_purchase": False},
            {"reviewer_name": "promo_staff_03", "review_text": "Simply the best purchase I have ever made on this website. Worth every single penny. Buy it buy it buy it!", "rating": 5.0, "date": "2026-10-12T09:00:00", "verified_purchase": False},
            {"reviewer_name": "angry_mob_1", "review_text": "TOTAL SCAM! Absolute garbage! Broke immediately! Seller is a thief! Worst product in human history! DO NOT BUY!", "rating": 1.0, "date": "2026-10-13T10:00:00", "verified_purchase": False},
            {"reviewer_name": "angry_mob_2", "review_text": "TOTAL SCAM! Absolute garbage! Broke immediately! Seller is a thief! Worst product in human history! DO NOT BUY!", "rating": 1.0, "date": "2026-10-13T10:05:00", "verified_purchase": False},
            {"reviewer_name": "angry_mob_3", "review_text": "DO NOT BUY THIS PRODUCT! Terrible awful useless garbage. Complete fraud.", "rating": 1.0, "date": "2026-10-13T10:10:00", "verified_purchase": False},
            {"reviewer_name": "angry_mob_4", "review_text": "Horrible horrible horrible! Ruined everything! Zero stars if possible!", "rating": 1.0, "date": "2026-10-13T10:15:00", "verified_purchase": False},
            {"reviewer_name": "promo_staff_04", "review_text": "Best purchase ever! Changed my life completely! You must buy this right now! 100% recommend to everyone!", "rating": 5.0, "date": "2026-10-14T12:00:00", "verified_purchase": False},
            {"reviewer_name": "promo_staff_05", "review_text": "I was skeptical at first but this is literally magic. Pure magic. Completely solved everything in 5 minutes! Unbelievable!", "rating": 5.0, "date": "2026-10-14T12:30:00", "verified_purchase": False}
        ]
    }
}

def get_demo_dataset(name: str) -> Dict[str, Any]:
    key = name.lower().replace("_", "-")
    if key in SAMPLE_DATASETS:
        return SAMPLE_DATASETS[key]
    return SAMPLE_DATASETS["ecommerce-burst"]
