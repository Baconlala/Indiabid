-- Cold start: real, recognisable listings seeded unclaimed. Each shows a
-- "claim it free" prompt until the actual owner verifies and claims it.
-- City assignment follows each company's actual HQ.
with seed(url, title, description, category_slug, city_slug) as (
  values
    -- AI
    ('https://krutrim.ai', 'Krutrim', 'Multilingual AI foundation models and assistant built for Indian languages.', 'ai-tools', null),
    ('https://haptik.ai', 'Haptik', 'Conversational AI platform for customer support chatbots and voice agents.', 'ai-agents', null),
    ('https://rocketium.com', 'Rocketium', 'AI-powered platform for generating ad creatives and marketing videos at scale.', 'ai-design', null),
    -- Software
    ('https://zoho.com', 'Zoho', 'Cloud software suite for CRM, finance, HR, and productivity.', 'saas', null),
    ('https://freshworks.com', 'Freshworks', 'Customer engagement software including helpdesk, CRM, and IT service management.', 'saas', null),
    ('https://chargebee.com', 'Chargebee', 'Subscription billing and revenue management platform for SaaS companies.', 'saas', null),
    ('https://postman.com', 'Postman', 'API platform used by developers to build, test, and share APIs.', 'dev-tools', null),
    ('https://hasura.io', 'Hasura', 'Open-source engine that turns databases into ready-to-use GraphQL and REST APIs.', 'dev-tools', null),
    ('https://cred.club', 'CRED', 'Members-only app for paying credit card bills and unlocking rewards for good credit behaviour.', 'mobile-apps', null),
    ('https://meesho.com', 'Meesho', 'Social commerce platform enabling small businesses and resellers to sell online.', 'mobile-apps', null),
    ('https://sharechat.com', 'ShareChat', 'Regional-language social media platform for short videos and content in India.', 'mobile-apps', null),
    -- Growth
    ('https://webengage.com', 'WebEngage', 'Customer engagement and retention platform for mobile and web apps.', 'marketing', null),
    ('https://rankwatch.com', 'RankWatch', 'SEO tool for tracking keyword rankings, audits, and backlink monitoring.', 'seo-tools', null),
    ('https://peerlist.io', 'Peerlist', 'Professional network and community for tech builders to showcase work.', 'communities', null),
    ('https://hasgeek.com', 'Hasgeek', 'Long-running community platform for India''s technology conferences and meetups.', 'communities', null),
    -- Money
    ('https://paytm.com', 'Paytm', 'Digital payments and financial services app used across India.', 'fintech', null),
    ('https://jupiter.money', 'Jupiter', 'Digital banking app offering savings accounts, budgeting, and rewards.', 'fintech', null),
    ('https://zerodha.com', 'Zerodha', 'Discount stockbroking platform for trading and investing in Indian markets.', 'investing', null),
    ('https://upstox.com', 'Upstox', 'Stockbroking and investing app for equities, F&O, and mutual funds.', 'investing', null),
    ('https://indmoney.com', 'INDmoney', 'Wealth management app for tracking and investing across Indian and US markets.', 'investing', null),
    ('https://coindcx.com', 'CoinDCX', 'Cryptocurrency exchange for buying, selling, and trading digital assets in India.', 'crypto', null),
    ('https://coinswitch.co', 'CoinSwitch', 'Platform for investing in cryptocurrency with a simple, beginner-friendly interface.', 'crypto', null),
    -- Sectors
    ('https://flipkart.com', 'Flipkart', 'Online marketplace for electronics, fashion, and everyday essentials.', 'ecommerce', null),
    ('https://nykaa.com', 'Nykaa', 'Beauty and personal care marketplace with owned and third-party brands.', 'ecommerce', null),
    ('https://bigbasket.com', 'BigBasket', 'Online grocery delivery service for daily essentials and household items.', 'ecommerce', null),
    ('https://nobroker.in', 'NoBroker', 'Brokerage-free platform for buying, selling, and renting property.', 'real-estate', null),
    ('https://housing.com', 'Housing.com', 'Property search platform for buying and renting homes across Indian cities.', 'real-estate', null),
    ('https://practo.com', 'Practo', 'Platform for booking doctor appointments and consulting online.', 'healthcare', null),
    ('https://1mg.com', 'Tata 1mg', 'Online pharmacy and diagnostics platform for medicines and lab tests.', 'healthcare', null),
    ('https://cult.fit', 'Cult.fit', 'Fitness and wellness platform offering gym classes, live workouts, and healthcare.', 'healthcare', null),
    ('https://byjus.com', 'BYJU''S', 'Online learning platform offering courses for school and competitive exams.', 'education', null),
    ('https://unacademy.com', 'Unacademy', 'Online learning platform with live classes for competitive exam preparation.', 'education', null),
    ('https://pw.live', 'PhysicsWallah', 'Affordable online coaching platform for JEE, NEET, and school students.', 'education', null),
    -- People
    ('https://peppercontent.io', 'Pepper Content', 'Marketplace connecting brands with freelance writers and content creators.', 'creators', null),
    ('https://truelancer.com', 'Truelancer', 'Freelance marketplace connecting Indian freelancers with clients and projects.', 'freelancers', null),
    ('https://fittr.com', 'Fittr', 'Online fitness coaching community with certified trainers and nutrition plans.', 'coaches', null),
    -- Mumbai — sample city board, companies actually headquartered there
    ('https://browserstack.com', 'BrowserStack', 'Cloud platform for testing websites and apps across real browsers and devices.', 'dev-tools', 'mumbai'),
    ('https://clevertap.com', 'CleverTap', 'Customer engagement and analytics platform for mobile and web apps.', 'marketing', 'mumbai'),
    ('https://zeptonow.com', 'Zepto', 'Quick-commerce app delivering groceries and essentials in minutes.', 'ecommerce', 'mumbai'),
    ('https://dream11.com', 'Dream11', 'Fantasy sports app for cricket, football, and other real-match contests.', 'mobile-apps', 'mumbai'),
    ('https://pharmeasy.in', 'PharmEasy', 'Online pharmacy for ordering medicines and booking diagnostic tests.', 'healthcare', 'mumbai'),
    ('https://angelone.in', 'Angel One', 'Full-service stockbroking platform for trading and investing.', 'investing', 'mumbai')
),
inserted as (
  insert into listings (url, normalized_url, title, description, category_id, city_id, is_claimed, is_active, moderation_status)
  select s.url, s.url, s.title, s.description, c.id, ci.id, false, true, 'approved'
  from seed s
  join categories c on c.slug = s.category_slug
  left join cities ci on ci.slug = s.city_slug
  returning id, created_at
)
insert into activity_feed (listing_id, event_type, amount, "timestamp")
select id, 'listing_created', null, created_at
from inserted;
