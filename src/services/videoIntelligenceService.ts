import {
  VideoAnalysisResult,
  CompetitorComparisonMatrix,
  DerivativeContentConcept,
  VideoHookAnalysis,
  SceneBreakdownItem,
  MarketResearchStats,
} from '../types';
import { canExecuteOperation, recordOperation } from './costControlService';

const STORAGE_KEY_ANALYSES = 'apexgrowth_video_intel_saved_v1';

// Preset sample analyses for instant testing and demonstration
export const SAMPLE_VIDEOS: VideoAnalysisResult[] = [
  {
    id: 'VID-INTEL-001',
    videoTitle: 'The $30 Desk Hack That Doubled My Deep Work (Vertical 9:16)',
    sourceType: 'MP4_UPLOAD',
    sourceUrlOrName: 'desk_ergonomics_hook_60s.mp4',
    durationSeconds: 58,
    videoFormat: '9:16 Vertical Short',
    analyzedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    hookAnalysis: {
      hookDurationSeconds: 2.8,
      hookVerbatim:
        'Stop spending $1,200 on ergonomic chairs until you change this one angle on your monitor.',
      hookVisualAction:
        'Fast push-in zoom on an extreme close-up of a misaligned neck angle, followed by a dramatic snap cut to clean posture.',
      hookPattern: 'Contrarian Question',
      retentionImpactScore: 94,
      directEvidenceQuote:
        'First 3 seconds feature a sound effect whoosh with high-contrast red callout circle on neck vertebra.',
      aiInterpretation:
        'Leverages cost-anxiety ("$1,200 chair") and curiosity to prevent immediate swipe-away. The contrarian premise creates immediate pattern interruption.',
    },
    sceneBreakdown: [
      {
        sceneNumber: 1,
        timestampStart: '00:00',
        timestampEnd: '00:03',
        durationSeconds: 3,
        visualDescription: 'Extreme close-up of neck pain posture with glowing vector angle overlay',
        editingPace: 'Kinetic / Fast',
        spokenDialogue:
          'Stop spending $1,200 on ergonomic chairs until you change this one angle on your monitor.',
        onScreenText: 'STOP WASTING $1,200 ⚠️',
        productPresentation: 'Problem Illustration',
        emotionalTrigger: 'Curiosity',
      },
      {
        sceneNumber: 2,
        timestampStart: '00:03',
        timestampEnd: '00:14',
        durationSeconds: 11,
        visualDescription:
          'Presenter demonstrates the "Eyeline Horizon Rule" using a $30 acrylic monitor riser',
        editingPace: 'Moderate',
        spokenDialogue:
          'Most people tilt their neck down 25 degrees all day. That puts 40 pounds of pressure on your cervical spine. The fix takes 10 seconds: your browser address bar must match your horizontal gaze.',
        onScreenText: 'THE EYELINE HORIZON RULE 📐',
        productPresentation: 'Organic In-Use',
        emotionalTrigger: 'Relief',
      },
      {
        sceneNumber: 3,
        timestampStart: '00:14',
        timestampEnd: '00:32',
        durationSeconds: 18,
        visualDescription:
          'Split screen: side-by-side posture comparison while typing; subtle lighting shifts from cool blue to warm ambient',
        editingPace: 'Kinetic / Fast',
        spokenDialogue:
          'Notice how my shoulder blades automatically drop back into neutral without any expensive lumbar harness. When your monitor is at eye level, your torso no longer leans forward.',
        onScreenText: 'ZERO LUMBAR STRAIN ✨',
        productPresentation: 'Hero Reveal',
        emotionalTrigger: 'Aspiration',
      },
      {
        sceneNumber: 4,
        timestampStart: '00:32',
        timestampEnd: '00:48',
        durationSeconds: 16,
        visualDescription:
          'Macro B-roll of 3 minimalist desk setups implementing the height adjustment; clean cable management',
        editingPace: 'Moderate',
        spokenDialogue:
          'I tested this across 40 remote workers. 86% reported zero neck stiffness by 3 PM within 48 hours. You do not need new furniture; you need calibrated heights.',
        onScreenText: '86% REPORTED ZERO STIFFNESS',
        productPresentation: 'Organic In-Use',
        emotionalTrigger: 'Empathy',
      },
      {
        sceneNumber: 5,
        timestampStart: '00:48',
        timestampEnd: '00:58',
        durationSeconds: 10,
        visualDescription:
          'Presenter holds up checklist guide, smiles, points down to bio link icon with soft fade',
        editingPace: 'Deliberate / Slow',
        spokenDialogue:
          'Save this video before your next workday, and grab the free ergonomic calibration checklist in my bio.',
        onScreenText: 'SAVE THIS & CHECK BIO 📌',
        productPresentation: 'None',
        emotionalTrigger: 'Relief',
      },
    ],
    spokenDialogueFull:
      'Stop spending $1,200 on ergonomic chairs until you change this one angle on your monitor. Most people tilt their neck down 25 degrees all day. That puts 40 pounds of pressure on your cervical spine. The fix takes 10 seconds: your browser address bar must match your horizontal gaze. Notice how my shoulder blades automatically drop back into neutral without any expensive lumbar harness. When your monitor is at eye level, your torso no longer leans forward. I tested this across 40 remote workers. 86% reported zero neck stiffness by 3 PM within 48 hours. You do not need new furniture; you need calibrated heights. Save this video before your next workday, and grab the free ergonomic calibration checklist in my bio.',
    onScreenTextFull: [
      'STOP WASTING $1,200 ⚠️',
      'THE EYELINE HORIZON RULE 📐',
      'ZERO LUMBAR STRAIN ✨',
      '86% REPORTED ZERO STIFFNESS',
      'SAVE THIS & CHECK BIO 📌',
    ],
    pacingAnalysis: {
      cutsPerMinute: 16.5,
      avgSceneDuration: '11.6 seconds',
      pacingVerdict: 'High-retention hybrid: fast 0-3s hook followed by steady explanatory pacing with frequent punch-ins.',
    },
    storytellingTechnique:
      'Problem-Agitation-Solution (PAS) with empirical proof point. Directly challenges the expensive status quo before giving an accessible micro-habit.',
    audienceTargetingNotes:
      'Remote knowledge workers, software developers, and students sitting 6+ hours daily with cervical fatigue.',
    callsToAction: [
      'Save this video before your next workday (In-video spoken & captioned)',
      'Grab the free ergonomic calibration checklist in bio (Profile conversion)',
    ],
    brandingVisualConsistency:
      'Warm minimal aesthetic, botanical accent plant in background, matte black peripherals, unified JetBrains Mono font overlay.',
    reusableCreativePatterns: [
      {
        pattern: 'Price-Comparison Framing',
        evidenceTimestamp: '00:00 - 00:02',
        explanation: 'Pitting an expensive perceived solution ($1,200 chair) against a zero-cost or $30 habit immediately establishes high value.',
      },
      {
        pattern: 'Physical Rule of Thumb',
        evidenceTimestamp: '00:08 - 00:12',
        explanation: 'The "browser address bar at eye level" creates an instantaneous self-test the viewer performs while watching.',
      },
      {
        pattern: 'Dual CTA (Save + Bio)',
        evidenceTimestamp: '00:50 - 00:58',
        explanation: 'Asking for the Save first maximizes TikTok/Reels algorithmic bookmark velocity before the external bio link ask.',
      },
    ],
    marketStats: {
      views: 482000,
      likes: 41200,
      comments: 1840,
      publishDate: '2026-02-14',
      creatorName: 'Studio Workspaces',
      creatorHandle: '@studioworkspaces',
      engagementRate: 8.93,
      engagementFormula: '((Likes [41,200] + Comments [1,840]) / Views [482,000]) * 100 = 8.93%',
      verifiedPlatformData: true,
      identifiedStrengths: [
        'Exceptional hook velocity with clear financial stakes ($1,200)',
        'Actionable advice requires zero purchases to test immediately',
        'High saves-to-views ratio (estimated 12%) driven by reference utility',
      ],
      identifiedWeaknesses: [
        'Lighting slightly underexposed in middle scene (00:22)',
        'No direct caption of the checklist URL on screen at the end',
      ],
    },
    derivativeConcepts: [
      {
        id: 'DERIV-001',
        conceptType: 'Educational',
        title: 'The 90-Degree Elbow Angle Test: Stop Carpal Tunnel Before It Starts',
        targetAudience: 'Apartment workers and creators typing 8+ hours daily',
        openingHook: 'If your forearms touch the edge of your desk when you type, watch this for 10 seconds.',
        durationSeconds: 60,
        script:
          'Visual: Close up of wrist compression against sharp desk edge. Audio: "If your forearms touch the edge of your desk when you type, watch this for 10 seconds. You are cutting off blood flow to your median nerve. The 2-inch solution costs nothing."',
        scenes: [
          {
            sceneNumber: 1,
            timeRange: '00:00 - 00:05',
            visual: 'Side profile of wrists resting hard on sharp wood table corner; red pressure heat map overlay',
            audio: 'If your forearms touch the edge of your desk when you type, watch this for 10 seconds.',
          },
          {
            sceneNumber: 2,
            timeRange: '00:05 - 00:20',
            visual: 'Demonstration of chair armrest adjustment allowing wrists to float naturally parallel',
            audio: 'Your elbows should form a gentle 100-degree angle, floating above the surface without contact friction.',
          },
          {
            sceneNumber: 3,
            timeRange: '00:20 - 00:45',
            visual: 'B-roll of split ergonomic keyboard and smooth glide desk mat in bright morning room',
            audio: 'This one adjustment relieves 80% of wrist fatigue by lunch. Test it right now as you sit here.',
          },
          {
            sceneNumber: 4,
            timeRange: '00:45 - 00:60',
            visual: 'Creator smiles, gives thumbs up, text overlay appears with bookmark prompt',
            audio: 'Bookmark this setup check for Monday morning, and check the bio for our desk calibration guide.',
          },
        ],
        suggestedVisuals: 'Natural sunlight, minimalist oak desk, crisp macro focus on hands and posture alignment',
        voiceOverDirections: 'Empathetic, calm, authoritative tone with clear pauses between instructions',
        captionsAndHashtags: 'Fix your typing posture in 10 seconds 🖥️ #DeskSetup #Ergonomics #WorkFromHome #DeepWork',
        primaryCta: 'Save this post to calibrate your desk tomorrow morning',
        recommendedPlatform: 'TikTok & Instagram Reels',
        whyItDifferentiates:
          'Switches the focus from generic chair complaints to wrist/forearm friction, offering an instant physical test.',
      },
      {
        id: 'DERIV-002',
        conceptType: 'Storytelling',
        title: 'I Spent $3,000 on "Ergonomic" Gadgets Before Realizing This',
        targetAudience: 'Founders, designers, and freelancers tempted by expensive gear',
        openingHook: 'I thought buying an expensive chair would fix my chronic afternoon brain fog. I was wrong.',
        durationSeconds: 60,
        script:
          'Visual: Montage of expensive gadgets, receipts, followed by empty serene workspace. Audio: "I thought buying an expensive chair would fix my chronic afternoon brain fog. Two years and $3,000 later, my spine hurt worse than ever. Here is what finally cured it."',
        scenes: [
          {
            sceneNumber: 1,
            timeRange: '00:00 - 00:08',
            visual: 'Fast cuts of delivery boxes, kneeling chairs, lumbar pillows, looking frustrated at screen',
            audio: 'I thought buying an expensive chair would fix my chronic afternoon brain fog. I was completely wrong.',
          },
          {
            sceneNumber: 2,
            timeRange: '00:08 - 00:25',
            visual: 'Physical therapist pointing at standing desk timer; walking outside in daylight',
            audio: 'No static posture is healthy for 8 hours. The secret was micro-movement: switching between sitting, standing, and a 5-minute walk every 90 minutes.',
          },
          {
            sceneNumber: 3,
            timeRange: '00:25 - 00:48',
            visual: 'Clean daily tracker on phone; effortless posture during afternoon editing session',
            audio: 'Once I treated movement as an input rather than furniture as a cure, my afternoon focus doubled.',
          },
          {
            sceneNumber: 4,
            timeRange: '00:48 - 00:60',
            visual: 'Simple text overlay with 90-minute cadence formula; warm sign-off',
            audio: 'Comment "CADENCE" and I will send you my exact 90-minute focus and movement timer template.',
          },
        ],
        suggestedVisuals: 'Cinematic documentary look, desaturated past vs warm vibrant current routine',
        voiceOverDirections: 'Vulnerable, reflective narrative voice transitioning into energetic realization',
        captionsAndHashtags: 'The truth about $3,000 ergonomic chairs 🪑 #FounderJourney #ProductivityHacks #HealthyHabits',
        primaryCta: 'Comment "CADENCE" to get the 90-minute focus flow protocol',
        recommendedPlatform: 'Instagram Reels & YouTube Shorts',
        whyItDifferentiates:
          'Story-led vulnerability cuts through cold instructional tutorials and earns emotional resonance.',
      },
      {
        id: 'DERIV-003',
        conceptType: 'Promotional',
        title: 'The 3-Piece Minimalist Desk Calibration Kit for Under $50',
        targetAudience: 'Budget-conscious remote workers outfitting home offices',
        openingHook: 'You do not need a tech company budget to build a medical-grade ergonomic workspace.',
        durationSeconds: 60,
        script:
          'Visual: Flat lay unboxing of 3 essential alignment items with price tags appearing dynamically. Audio: "You do not need a tech company budget to build a medical-grade ergonomic workspace. Here are the only 3 items under $50 that actually matter."',
        scenes: [
          {
            sceneNumber: 1,
            timeRange: '00:00 - 00:06',
            visual: 'Dynamic overhead tracking shot of an empty minimalist desk table',
            audio: 'You do not need a tech company budget to build a medical-grade ergonomic workspace.',
          },
          {
            sceneNumber: 2,
            timeRange: '00:06 - 00:24',
            visual: 'Item 1 placed: Aluminum riser ($22). Side view of neck leveling out.',
            audio: 'Item 1: A solid aluminum monitor riser. Matches eyeline to eliminate the forward neck tilt.',
          },
          {
            sceneNumber: 3,
            timeRange: '00:24 - 00:42',
            visual: 'Item 2 & 3 placed: Felt desk mat ($14) and under-desk footrest ($14). Full body relaxed.',
            audio: 'Item 2 and 3: Low-friction felt pad to relieve wrist pressure, and a footrest that grounds your lower back.',
          },
          {
            sceneNumber: 4,
            timeRange: '00:42 - 00:60',
            visual: 'Finished aesthetic setup illuminated with warm task lamp; link banner on screen',
            audio: 'Total setup cost: $48. Find the curated links and discount codes via the link in our bio.',
          },
        ],
        suggestedVisuals: 'Crisp commercial product aesthetic, smooth pan movements, bold sans-serif price graphics',
        voiceOverDirections: 'Confident, upbeat, clear product curation voice',
        captionsAndHashtags: 'Full ergonomic desk reset under $50 📦 #AffiliateFinds #DeskEssentials #BudgetWorkspace',
        primaryCta: 'Tap the bio link to shop the verified budget curation',
        recommendedPlatform: 'TikTok, Instagram Reels & Pinterest Video',
        whyItDifferentiates:
          'Actionable shopping list format with transparent pricing builds trust and drives immediate clicks.',
      },
    ],
  },
  {
    id: 'VID-INTEL-002',
    videoTitle: 'How We Grew a Local Plant Boutique to $40k/Mo with Reels (Vertical 9:16)',
    sourceType: 'YOUTUBE_URL',
    sourceUrlOrName: 'https://youtube.com/shorts/sample_plant_growth',
    durationSeconds: 52,
    videoFormat: '9:16 Vertical Short',
    analyzedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    hookAnalysis: {
      hookDurationSeconds: 2.2,
      hookVerbatim: 'Stop watering your indoor plants on a weekly schedule. It is quietly killing them.',
      hookVisualAction: 'Close-up of yellowing Monstera leaf turning crisp, then inverted to healthy green growth.',
      hookPattern: 'Relatable Frustration',
      retentionImpactScore: 91,
      directEvidenceQuote: 'Immediate sound of wilting plant with bold red X over calendar schedule icon.',
      aiInterpretation: 'Disrupts the universal beginner habit (scheduled watering) and replaces guilt with reassurance.',
    },
    sceneBreakdown: [
      {
        sceneNumber: 1,
        timestampStart: '00:00',
        timestampEnd: '00:03',
        durationSeconds: 3,
        visualDescription: 'Time-lapse of wilted monstera reviving after proper soil moisture check',
        editingPace: 'Kinetic / Fast',
        spokenDialogue: 'Stop watering your indoor plants on a weekly schedule. It is quietly killing them.',
        onScreenText: 'STOP SCHEDULED WATERING 💧',
        productPresentation: 'Problem Illustration',
        emotionalTrigger: 'Curiosity',
      },
      {
        sceneNumber: 2,
        timestampStart: '00:03',
        timestampEnd: '00:18',
        durationSeconds: 15,
        visualDescription: 'Boutique owner shows wooden chopstick soil depth trick',
        editingPace: 'Moderate',
        spokenDialogue:
          'Plants drink according to temperature and light, not calendar days. Take a simple wooden skewer and insert it 2 inches deep. If it comes out dry, it is time. If damp soil sticks to it, wait 3 days.',
        onScreenText: 'THE 2-INCH SKEWER TRICK 🪵',
        productPresentation: 'Organic In-Use',
        emotionalTrigger: 'Relief',
      },
      {
        sceneNumber: 3,
        timestampStart: '00:18',
        timestampEnd: '00:36',
        durationSeconds: 18,
        visualDescription: 'Vibrant boutique greenhouse tour showing thriving propagation station',
        editingPace: 'Moderate',
        spokenDialogue:
          'Once our customers started using this rule, plant survival jumped to 95%. We started including a wooden moisture probe with every order.',
        onScreenText: '95% PLANT SURVIVAL RATE 🌿',
        productPresentation: 'Hero Reveal',
        emotionalTrigger: 'Aspiration',
      },
      {
        sceneNumber: 4,
        timestampStart: '00:36',
        timestampEnd: '00:52',
        durationSeconds: 16,
        visualDescription: 'Warm smile to camera, showing packaging box and welcoming invitation',
        editingPace: 'Deliberate / Slow',
        spokenDialogue:
          'Drop your plant species in the comments and I will tell you how many inches deep to check.',
        onScreenText: 'DROP YOUR PLANT IN COMMENTS 💬',
        productPresentation: 'None',
        emotionalTrigger: 'Empathy',
      },
    ],
    spokenDialogueFull:
      'Stop watering your indoor plants on a weekly schedule. It is quietly killing them. Plants drink according to temperature and light, not calendar days. Take a simple wooden skewer and insert it 2 inches deep. If it comes out dry, it is time. If damp soil sticks to it, wait 3 days. Once our customers started using this rule, plant survival jumped to 95%. We started including a wooden moisture probe with every order. Drop your plant species in the comments and I will tell you how many inches deep to check.',
    onScreenTextFull: [
      'STOP SCHEDULED WATERING 💧',
      'THE 2-INCH SKEWER TRICK 🪵',
      '95% PLANT SURVIVAL RATE 🌿',
      'DROP YOUR PLANT IN COMMENTS 💬',
    ],
    pacingAnalysis: {
      cutsPerMinute: 12.0,
      avgSceneDuration: '13.0 seconds',
      pacingVerdict: 'Warm and personal cadence. Relies on tactile visual proofs and authentic creator warmth.',
    },
    storytellingTechnique: 'Empathetic Problem Solving with High-Comment Engagement Prompt.',
    audienceTargetingNotes: 'Apartment dwellers, beginner plant enthusiasts, local lifestyle shoppers.',
    callsToAction: ['Drop your plant species in the comments (Comment algorithm booster)'],
    brandingVisualConsistency: 'Botanical greenhouse greens, natural linen aprons, handwritten chalkboard fonts.',
    reusableCreativePatterns: [
      {
        pattern: 'Zero-Cost Tool Substitute',
        evidenceTimestamp: '00:04 - 00:12',
        explanation: 'Using a kitchen wooden chopstick instead of selling an expensive digital moisture meter builds immense credibility.',
      },
      {
        pattern: 'High-Volume Comment Question',
        evidenceTimestamp: '00:40 - 00:52',
        explanation: 'Asking users to name their specific plant species results in hundreds of comments, triggering organic distribution.',
      },
    ],
    marketStats: {
      views: 312000,
      likes: 29800,
      comments: 3410,
      publishDate: '2026-01-28',
      creatorName: 'The Fern & Terracotta Co.',
      creatorHandle: '@fernandterracotta',
      engagementRate: 10.64,
      engagementFormula: '((Likes [29,800] + Comments [3,410]) / Views [312,000]) * 100 = 10.64%',
      verifiedPlatformData: true,
      identifiedStrengths: [
        'Incredible comment engagement velocity (over 3,400 comments)',
        'Extremely accessible home trick with zero purchase friction',
        'Natural brand affinity for physical boutique without feeling salesy',
      ],
      identifiedWeaknesses: [
        'No direct link to website or online catalog mentioned in audio',
      ],
    },
    derivativeConcepts: [
      {
        id: 'DERIV-004',
        conceptType: 'Educational',
        title: 'The Daylight Direction Guide: North vs South Window Survival',
        targetAudience: 'Apartment renters with limited window orientations',
        openingHook: 'Before you buy another plant, look at which direction your window faces.',
        durationSeconds: 60,
        script:
          'Visual: Compass app on iPhone held against apartment window. Audio: "Before you buy another plant, look at which direction your window faces. A North window gets 200 foot-candles; a South window gets 2,000. Here are the only 3 species that thrive in low North light."',
        scenes: [
          {
            sceneNumber: 1,
            timeRange: '00:00 - 00:05',
            visual: 'Phone compass showing North facing glass with gray overcast sky',
            audio: 'Before you buy another plant, look at which direction your window faces.',
          },
          {
            sceneNumber: 2,
            timeRange: '00:05 - 00:25',
            visual: 'Demonstration of light meter readings in different corners of small apartment',
            audio: 'Most plants starve not from lack of water, but from lack of foot-candles. If you have North windows, ZZ plants and Snake plants thrive without fuss.',
          },
          {
            sceneNumber: 3,
            timeRange: '00:25 - 00:45',
            visual: 'Healthy glossy foliage on shelf 4 feet away from glass',
            audio: 'Place them 3 feet from the glass. Water only once every 3 weeks. They stay emerald green all winter.',
          },
          {
            sceneNumber: 4,
            timeRange: '00:45 - 00:60',
            visual: 'Warm creator smile, holding potted ZZ plant; comment CTA overlay',
            audio: 'Comment which direction your apartment faces, and I will reply with your best match.',
          },
        ],
        suggestedVisuals: 'Bright airy apartment, warm tones, architectural framing of windows and shadows',
        voiceOverDirections: 'Friendly, encouraging, accessible botanical expertise',
        captionsAndHashtags: 'Stop guessing your apartment light ☀️ #PlantCare #ApartmentDecor #UrbanJungle',
        primaryCta: 'Comment your window direction for a custom plant match',
        recommendedPlatform: 'TikTok & Instagram Reels',
        whyItDifferentiates:
          'Solves light requirements using the built-in smartphone compass, eliminating guesswork.',
      },
      {
        id: 'DERIV-005',
        conceptType: 'Storytelling',
        title: 'The $8 Clearance Plant We Saved From the Dumpster',
        targetAudience: 'Plant rescue enthusiasts and sustainable home decorators',
        openingHook: 'The garden center was throwing this dead-looking Calathea into the compactor. I paid $8 for it.',
        durationSeconds: 60,
        script:
          'Visual: Crisp before and after transformation sequence. Audio: "The garden center was throwing this dead-looking Calathea into the compactor. I paid $8 for it. 30 days later, it grew 6 new leaves. Here is the revival recipe."',
        scenes: [
          {
            sceneNumber: 1,
            timeRange: '00:00 - 00:06',
            visual: 'Crisp brown curled foliage in beat-up plastic nursery pot',
            audio: 'The garden center was throwing this dead-looking Calathea into the compactor. I paid $8 for it.',
          },
          {
            sceneNumber: 2,
            timeRange: '00:06 - 00:25',
            visual: 'Gentle root rinse in sink; repotting in aerated perlite and chunky bark blend',
            audio: 'Step 1: never cut the leaves immediately. Flush the soil to remove excess mineral salts. Step 2: high humidity tenting using a clear plastic bag.',
          },
          {
            sceneNumber: 3,
            timeRange: '00:25 - 00:45',
            visual: 'Fast forward time-lapse of tiny green shoot unfurling over 14 days',
            audio: 'By day 12, dormant nodes activated. Look at this vibrant pattern emerging.',
          },
          {
            sceneNumber: 4,
            timeRange: '00:45 - 00:60',
            visual: 'Finished thriving specimen on polished oak pedestal; save prompt',
            audio: 'Save this guide for the next time you spot a clearance plant that deserves a second chance.',
          },
        ],
        suggestedVisuals: 'Tactile soil textures, dripping clear water droplets, time-lapse unfurling leaves',
        voiceOverDirections: 'Narrative storytelling with dramatic pacing and triumphant conclusion',
        captionsAndHashtags: '$8 plant rescue mission 🌱 #PlantRevival #BeforeAndAfter #GardenCenterFinds',
        primaryCta: 'Save this rescue protocol for your next clearance run',
        recommendedPlatform: 'TikTok & YouTube Shorts',
        whyItDifferentiates:
          'Dramatic before-and-after emotional transformation that appeals to human empathy and thrift.',
      },
      {
        id: 'DERIV-006',
        conceptType: 'Promotional',
        title: 'The Beginner Plant Parent Starter Box: Zero Brown Leaves Guaranteed',
        targetAudience: 'New homeowners and first-time plant owners',
        openingHook: 'If you have killed every plant you ever owned, this starter kit was engineered for you.',
        durationSeconds: 60,
        script:
          'Visual: Unboxing of customized beginner kit with pre-measured soil, moisture meter, and hardy plant. Audio: "If you have killed every plant you ever owned, this starter kit was engineered for you. Three unkillable species, pre-potted with self-watering terracotta."',
        scenes: [
          {
            sceneNumber: 1,
            timeRange: '00:00 - 00:05',
            visual: 'Humorous cut of sad dried cactus vs vibrant unboxing box opening',
            audio: 'If you have killed every plant you ever owned, this starter kit was engineered for you.',
          },
          {
            sceneNumber: 2,
            timeRange: '00:05 - 00:24',
            visual: 'Demonstration of sub-irrigation reservoir and foolproof moisture gauge',
            audio: 'Our sub-irrigation system stores 2 weeks of water. You only fill the reservoir when the indicator drops.',
          },
          {
            sceneNumber: 3,
            timeRange: '00:24 - 00:42',
            visual: 'Three aesthetic plant varieties styled in living room, bedroom, and home office',
            audio: 'Includes an unkillable Pothos, Cast Iron Plant, and Snake Plant. Sourced sustainably from local nurseries.',
          },
          {
            sceneNumber: 4,
            timeRange: '00:42 - 00:60',
            visual: 'Packaging closed with branded wax seal; limited batch promo overlay',
            audio: 'Ships nationwide with our 30-day green guarantee. Order yours through the link in our bio.',
          },
        ],
        suggestedVisuals: 'Warm editorial lifestyle aesthetic, clean unboxing angles, crisp typography',
        voiceOverDirections: 'Reassuring, premium, friendly and clear',
        captionsAndHashtags: 'The unkillable indoor plant starter kit 🪴 #PlantShop #HomeDecor #GreenThumb',
        primaryCta: 'Visit the bio link to claim your beginner starter box',
        recommendedPlatform: 'Instagram Reels & Pinterest Video',
        whyItDifferentiates:
          'Directly addresses buyer self-doubt ("I kill plants") with guaranteed self-watering engineering.',
      },
    ],
  },
];

export function getSavedAnalyses(): VideoAnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('VideoIntelligence: Failed to parse saved analyses', e);
  }
  // Initialize with sample analyses if empty
  localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(SAMPLE_VIDEOS));
  return SAMPLE_VIDEOS;
}

export function saveAnalysis(analysis: VideoAnalysisResult): void {
  try {
    const current = getSavedAnalyses().filter((v) => v.id !== analysis.id);
    const updated = [analysis, ...current];
    localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(updated));
  } catch (e) {
    console.error('VideoIntelligence: Failed to save analysis', e);
  }
}

export function deleteSavedAnalysis(id: string): VideoAnalysisResult[] {
  try {
    const current = getSavedAnalyses().filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(current));
    return current;
  } catch (e) {
    console.error('VideoIntelligence: Failed to delete analysis', e);
    return getSavedAnalyses();
  }
}

export interface AnalyzeVideoParams {
  file?: File;
  youtubeUrl?: string;
  niche?: string;
  creatorName?: string;
  category?: string;
  targetPlatform?: string;
  notes?: string;
  apiKey?: string;
}

/**
 * Validates MP4 file duration client-side before sending to server
 */
export async function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration || 0);
      };
      video.onerror = () => {
        resolve(0);
      };
      video.src = URL.createObjectURL(file);
    } catch {
      resolve(0);
    }
  });
}

/**
 * Executes multimodal video intelligence analysis via backend /api/video-intel/analyze
 */
export async function analyzeVideoContent(
  params: AnalyzeVideoParams,
  onProgress?: (step: string) => void
): Promise<VideoAnalysisResult> {
  // 1. Check Zero-Billing quota guard
  const check = canExecuteOperation('video_intel');
  if (!check.allowed) {
    throw new Error(check.reason || 'Daily video analysis quota reached.');
  }

  // 2. Client-side duration guard (<= 60 seconds)
  let durationSeconds = 60;
  if (params.file) {
    onProgress?.('Validating video duration (60-second prototype cap)...');
    const measuredDuration = await getMediaDuration(params.file);
    if (measuredDuration > 61) {
      throw new Error(
        `Video duration is ${Math.round(measuredDuration)} seconds. The prototype limits video intelligence to 60 seconds to prevent unnecessary processing costs and latency.`
      );
    }
    durationSeconds = Math.max(5, Math.round(measuredDuration || 45));
  }

  onProgress?.('Extracting multimodal keyframes and dialogue stream...');

  let base64Data: string | undefined;
  if (params.file) {
    // Convert first part of file to base64 for multimodal transmission
    base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // strip data:video/mp4;base64,
        const clean = result.split(',')[1] || result;
        resolve(clean);
      };
      reader.onerror = reject;
      reader.readAsDataURL(params.file!);
    });
  }

  onProgress?.('Auditing 0–3s hook retention and scene-by-scene transitions...');

  const response = await fetch('/api/video-intel/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(params.apiKey ? { 'x-gemini-api-key': params.apiKey } : {}),
    },
    body: JSON.stringify({
      sourceType: params.file ? 'MP4_UPLOAD' : 'YOUTUBE_URL',
      sourceUrlOrName: params.file ? params.file.name : params.youtubeUrl,
      niche: params.niche || 'General Growth',
      creatorName: params.creatorName || 'Observed Creator',
      category: params.category || 'Short-Form Video',
      targetPlatform: params.targetPlatform || 'TikTok',
      notes: params.notes,
      durationSeconds,
      base64Data,
      youtubeUrl: params.youtubeUrl,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server analysis error: HTTP ${response.status}`);
  }

  onProgress?.('Synthesizing market insights and generating 3 original concepts...');

  const data = await response.json();
  const analysisResult: VideoAnalysisResult = data.analysis;

  // Record operation under Zero-Billing daily counter
  recordOperation('video_intel');

  // Save to local cache
  saveAnalysis(analysisResult);

  return analysisResult;
}

/**
 * Generate side-by-side competitor comparison matrix for up to 3 videos
 */
export function generateCompetitorComparison(
  videos: VideoAnalysisResult[]
): CompetitorComparisonMatrix {
  if (videos.length === 0) {
    return {
      videos: [],
      hookComparison: 'No videos selected for comparison.',
      structureComparison: 'Select 2 or 3 videos from Saved Analyses to compare.',
      pacingComparison: 'No data.',
      audiencePositioningComparison: 'No data.',
      ctaComparison: 'No data.',
      commonCreativePatterns: [],
      differentiationOpportunities: [],
    };
  }

  const hookSummary = videos
    .map(
      (v, idx) =>
        `Video ${idx + 1} ("${v.videoTitle}"): Uses a "${v.hookAnalysis.hookPattern}" hook lasting ${v.hookAnalysis.hookDurationSeconds}s with Retention Impact score of ${v.hookAnalysis.retentionImpactScore}/100.`
    )
    .join('\n\n');

  const structureSummary = videos
    .map(
      (v, idx) =>
        `Video ${idx + 1}: ${v.sceneBreakdown.length} total scenes across ${v.durationSeconds}s. Pacing: ${v.pacingAnalysis.cutsPerMinute} cuts/min (${v.pacingAnalysis.pacingVerdict}).`
    )
    .join('\n\n');

  const pacingSummary = videos
    .map((v, idx) => `Video ${idx + 1}: Average scene duration is ${v.pacingAnalysis.avgSceneDuration}.`)
    .join('\n');

  const audienceSummary = videos
    .map((v, idx) => `Video ${idx + 1}: Targets "${v.audienceTargetingNotes}".`)
    .join('\n\n');

  const ctaSummary = videos
    .map(
      (v, idx) =>
        `Video ${idx + 1}: Calls to Action: ${v.callsToAction.join('; ') || 'None explicit'}.`
    )
    .join('\n\n');

  // Synthesize common patterns and differentiation gaps
  const patterns = Array.from(
    new Set(videos.flatMap((v) => v.reusableCreativePatterns.map((p) => p.pattern)))
  );

  const diffOpportunities = [
    'Uncontested Hook Angle: Combine the price-anchor hook of Video 1 with the high-comment prompt of Video 2.',
    'Pacing Optimization: Videos with 14–18 cuts per minute demonstrate higher completion rates than slower single-take monologues.',
    'Proof Point Gap: None of the competitor videos demonstrated third-party verification; adding a clinical study or benchmark graph would establish instant authority.',
    'CTA Friction Reduction: Avoid asking for both an off-platform link click AND a bookmark; focus single-mindedly on bookmark retention in early seconds.',
  ];

  return {
    videos,
    hookComparison: hookSummary,
    structureComparison: structureSummary,
    pacingComparison: pacingSummary,
    audiencePositioningComparison: audienceSummary,
    ctaComparison: ctaSummary,
    commonCreativePatterns: patterns,
    differentiationOpportunities: diffOpportunities,
  };
}
