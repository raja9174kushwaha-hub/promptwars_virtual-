-- ===========================================
-- SEED: Sample Events for Testing
-- Run this in Supabase Dashboard > SQL Editor
-- ===========================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get your user ID automatically from the signed-in account
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'rajakushwah7009@gmail.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Make sure you have signed up first.';
  END IF;

  -- Insert 6 sample events
  INSERT INTO public.events (user_id, name, slug, description, event_date, event_type, status, template, primary_color, registration_limit)
  VALUES
    (
      v_user_id,
      'AI & Machine Learning Summit 2026',
      'ai-ml-summit-2026',
      'Join top AI researchers and engineers for a full-day summit on the latest breakthroughs in machine learning, LLMs, and computer vision. Featuring keynotes, workshops, and networking.',
      NOW() + INTERVAL '15 days',
      'conference',
      'live',
      'minimal',
      '#7C3AED',
      500
    ),
    (
      v_user_id,
      'Web Dev Bootcamp: React & TypeScript',
      'webdev-bootcamp-react-ts',
      'An intensive 3-day hands-on bootcamp for developers who want to level up their frontend skills. Learn React 19, TypeScript, and modern tooling from industry experts.',
      NOW() + INTERVAL '30 days',
      'workshop',
      'live',
      'minimal',
      '#2563EB',
      50
    ),
    (
      v_user_id,
      'Startup Pitch Night — Spring 2026',
      'startup-pitch-night-spring-2026',
      'Watch 10 early-stage startups pitch their ideas to a panel of investors and industry leaders. Open networking session after the pitches. Free to attend!',
      NOW() + INTERVAL '7 days',
      'networking',
      'live',
      'minimal',
      '#DC2626',
      200
    ),
    (
      v_user_id,
      'Cloud Architecture Deep Dive',
      'cloud-architecture-deep-dive',
      'A hands-on workshop covering GCP, AWS, and Azure architecture patterns. Learn to design scalable, fault-tolerant cloud systems with real-world case studies.',
      NOW() + INTERVAL '21 days',
      'webinar',
      'live',
      'minimal',
      '#059669',
      150
    ),
    (
      v_user_id,
      'Hackathon: Build for Social Good',
      'hackathon-social-good-2026',
      '48-hour hackathon focused on building technology solutions for social and environmental challenges. Win prizes up to $5,000. All skill levels welcome!',
      NOW() + INTERVAL '45 days',
      'hackathon',
      'live',
      'minimal',
      '#D97706',
      300
    ),
    (
      v_user_id,
      'Open Source Contributor Meetup',
      'open-source-meetup-april',
      'Monthly meetup for open source enthusiasts. Share your projects, find collaborators, and learn about contributing to top GitHub repos. Pizza and drinks provided!',
      NOW() + INTERVAL '5 days',
      'meetup',
      'live',
      'minimal',
      '#0891B2',
      80
    );

  RAISE NOTICE 'Successfully inserted 6 sample events for user: %', v_user_id;
END;
$$;
