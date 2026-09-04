-- More real, lesser-known Indian companies (unclaimed, same cold-start pattern as 0004),
-- plus a handful of fictional example listings used only to demo the claimed/paid
-- state, the premium lock, and to seed an initial "total raised" figure.
with real_seed(url, title, description, category_slug, city_slug, created_at) as (
  values
    ('https://yellow.ai', 'Yellow.ai', 'Enterprise conversational AI platform for customer support automation.', 'ai-tools', null, now() - interval '18 hours'),
    ('https://observe.ai', 'Observe.AI', 'AI platform that analyses contact-centre calls for quality and coaching insights.', 'ai-tools', null, now() - interval '14 hours'),
    ('https://verloop.io', 'Verloop.io', 'AI-powered customer support automation for chat and voice.', 'ai-agents', null, now() - interval '21 hours'),
    ('https://rephrase.ai', 'Rephrase.ai', 'AI video generation platform for creating personalised avatar videos at scale.', 'ai-design', null, now() - interval '16 hours'),
    ('https://whatfix.com', 'Whatfix', 'Digital adoption platform with in-app guidance and walkthroughs for software.', 'saas', null, now() - interval '44 hours'),
    ('https://darwinbox.com', 'Darwinbox', 'HR technology suite covering hiring, payroll, and employee management.', 'saas', null, now() - interval '38 hours'),
    ('https://leadsquared.com', 'LeadSquared', 'Sales execution and marketing automation CRM for growing businesses.', 'saas', null, now() - interval '31 hours'),
    ('https://zluri.com', 'Zluri', 'SaaS management platform for discovering, securing, and optimising software spend.', 'saas', null, now() - interval '12 hours'),
    ('https://appsmith.com', 'Appsmith', 'Open-source, low-code platform for building internal business tools.', 'dev-tools', null, now() - interval '25 hours'),
    ('https://middleware.io', 'Middleware', 'Full-stack observability platform for monitoring logs, metrics, and traces.', 'dev-tools', null, now() - interval '9 hours'),
    ('https://khatabook.com', 'Khatabook', 'Digital ledger app for small merchants to track credit and payments.', 'mobile-apps', null, now() - interval '74 hours'),
    ('https://okcredit.in', 'OkCredit', 'Bookkeeping app for small shopkeepers to record customer credit digitally.', 'mobile-apps', null, now() - interval '69 hours'),
    ('https://pixis.ai', 'Pixis', 'AI-native marketing platform for optimising ad performance across channels.', 'marketing', null, now() - interval '20 hours'),
    ('https://growthx.club', 'GrowthX', 'Community and cohort-based courses for marketing and growth professionals.', 'communities', null, now() - interval '17 hours'),
    ('https://fampay.in', 'FamPay', 'Payment app and card built for teenagers, with parental controls.', 'fintech', null, now() - interval '26 hours'),
    ('https://setu.co', 'Setu', 'Fintech infrastructure APIs for banking, payments, and lending products.', 'fintech', null, now() - interval '22 hours'),
    ('https://open.money', 'Open', 'Neobanking platform for businesses to manage payments and accounting.', 'fintech', null, now() - interval '19 hours'),
    ('https://goniyo.com', 'Niyo', 'Neobank offering zero-forex travel cards and salary accounts.', 'fintech', null, now() - interval '15 hours'),
    ('https://sliceit.com', 'Slice', 'Fintech app offering a credit card and UPI payments for young professionals.', 'fintech', null, now() - interval '13 hours'),
    ('https://smallcase.com', 'smallcase', 'Platform for investing in ready-made portfolios of stocks and ETFs.', 'investing', null, now() - interval '34 hours'),
    ('https://fisdom.com', 'Fisdom', 'Wealth management app for mutual funds, stocks, and tax filing.', 'investing', null, now() - interval '11 hours'),
    ('https://mudrex.com', 'Mudrex', 'Crypto investment platform with automated trading strategies.', 'crypto', null, now() - interval '10 hours'),
    ('https://licious.in', 'Licious', 'Direct-to-consumer brand delivering fresh meat and seafood.', 'ecommerce', null, now() - interval '51 hours'),
    ('https://wakefit.co', 'Wakefit', 'Direct-to-consumer brand for mattresses and home and sleep products.', 'ecommerce', null, now() - interval '46 hours'),
    ('https://countrydelight.in', 'Country Delight', 'Subscription delivery for farm-fresh milk, dairy, and groceries.', 'ecommerce', null, now() - interval '37 hours'),
    ('https://sugarcosmetics.com', 'Sugar Cosmetics', 'Direct-to-consumer brand for makeup and cosmetics.', 'ecommerce', null, now() - interval '28 hours'),
    ('https://squareyards.com', 'Square Yards', 'Real estate brokerage platform for buying, selling, and renting property.', 'real-estate', null, now() - interval '23 hours'),
    ('https://proptiger.com', 'PropTiger', 'Property portal for new residential projects and home loans.', 'real-estate', null, now() - interval '8 hours'),
    ('https://pristyncare.com', 'Pristyn Care', 'Platform connecting patients with surgeons for day-care surgical procedures.', 'healthcare', null, now() - interval '32 hours'),
    ('https://healthifyme.com', 'HealthifyMe', 'AI-powered app for calorie tracking, diet plans, and fitness coaching.', 'healthcare', null, now() - interval '7 hours'),
    ('https://toppr.com', 'Toppr', 'Online learning app for school students preparing for exams.', 'education', null, now() - interval '49 hours'),
    ('https://testbook.com', 'Testbook', 'Exam preparation platform for government and competitive exams.', 'education', null, now() - interval '43 hours'),
    ('https://classplus.co', 'Classplus', 'SaaS platform helping coaching institutes run classes and content online.', 'education', null, now() - interval '35 hours'),
    ('https://leadschool.in', 'LEAD', 'School edtech platform providing curriculum, training, and technology to schools.', 'education', null, now() - interval '6 hours'),
    ('https://chingari.io', 'Chingari', 'Short-video social media app for Indian creators.', 'creators', null, now() - interval '5 hours'),
    ('https://myjosh.in', 'Josh', 'Short-video app for regional-language content and creators.', 'creators', null, now() - interval '4 hours'),
    ('https://flexiple.com', 'Flexiple', 'Marketplace connecting vetted freelance developers and designers with clients.', 'freelancers', null, now() - interval '3 hours'),
    ('https://goqii.com', 'GOQii', 'Fitness wearable and coaching platform with certified health coaches.', 'coaches', 'mumbai', now() - interval '20 hours')
),
real_inserted as (
  insert into listings (url, normalized_url, title, description, category_id, city_id, favicon_url, click_count, created_at, is_claimed, is_active, moderation_status)
  select s.url, s.url, s.title, s.description, c.id, ci.id,
         'https://www.google.com/s2/favicons?domain=' || replace(replace(s.url, 'https://', ''), 'http://', '') || '&sz=64',
         0, s.created_at, false, true, 'approved'
  from real_seed s
  join categories c on c.slug = s.category_slug
  left join cities ci on ci.slug = s.city_slug
  returning id, created_at
)
insert into activity_feed (listing_id, event_type, amount, "timestamp")
select id, 'listing_created', null, created_at from real_inserted;

-- Fictional example listings only — never real companies. Demonstrates the
-- claimed/paid state, the premium lock, and gives the site an initial
-- "total raised" figure (and the 10% charity split derived from it).
with demo_seed(url, title, description, category_slug, city_slug, created_at, bid, bid_at, locked_until) as (
  values
    ('https://rupeetrack.in', 'RupeeTrack', 'Expense tracking and budgeting app built for Indian bank accounts and UPI statements.', 'fintech', null, now() - interval '240 hours', 251, now() - interval '2 hours', null),
    ('https://chaiandcode.dev', 'Chai & Code', 'A directory and community of Indian developer meetups and hackathons.', 'communities', null, now() - interval '400 hours', 191, now() - interval '20 hours', null),
    ('https://pixelcraft.studio', 'PixelCraft Studio', 'AI-assisted logo and brand kit generator tuned for D2C brands in India.', 'ai-design', null, now() - interval '150 hours', 121, now() - interval '5 hours', null),
    ('https://deskhero.app', 'DeskHero', 'Lightweight helpdesk and ticketing SaaS for small D2C support teams.', 'saas', null, now() - interval '80 hours', 81, now() - interval '30 hours', null),
    ('https://growthstack.io', 'GrowthStack', 'Plug-and-play growth playbooks and SEO audits for early-stage founders.', 'marketing', null, now() - interval '60 hours', 61, now() - interval '40 hours', null),
    ('https://agentdesk.ai', 'AgentDesk', 'No-code builder for customer support AI agents trained on your docs.', 'ai-agents', null, now() - interval '30 hours', 41, now() - interval '28 hours', null),
    ('https://coachkart.in', 'CoachKart', 'Booking and cohort management for online coaches and creators.', 'coaches', null, now() - interval '10 hours', 21, now() - interval '10 hours', null),
    ('https://baycasa.in', 'BayCasa Realty', 'Verified resale flats and rentals across Mumbai''s western suburbs.', 'real-estate', 'mumbai', now() - interval '500 hours', 341, now() - interval '1 hours', now() + interval '2 hours'),
    ('https://tiffinwaale.com', 'TiffinWaale', 'Home-cook tiffin subscriptions delivered across Andheri and Bandra.', 'ecommerce', 'mumbai', now() - interval '300 hours', 151, now() - interval '15 hours', null)
),
demo_inserted as (
  insert into listings (url, normalized_url, title, description, category_id, city_id, favicon_url, click_count, created_at, current_bid, is_claimed, is_locked, locked_until, last_bid_at, is_active, moderation_status)
  select s.url, s.url, s.title, s.description, c.id, ci.id,
         'https://www.google.com/s2/favicons?domain=' || replace(replace(s.url, 'https://', ''), 'http://', '') || '&sz=64',
         0, s.created_at, s.bid, true, (s.locked_until is not null), s.locked_until, s.bid_at, true, 'approved'
  from demo_seed s
  join categories c on c.slug = s.category_slug
  left join cities ci on ci.slug = s.city_slug
  returning id, created_at, current_bid, is_locked, last_bid_at
)
insert into activity_feed (listing_id, event_type, amount, "timestamp")
select id, case when is_locked then 'top_locked' else 'bid_placed' end, current_bid, last_bid_at
from demo_inserted;
