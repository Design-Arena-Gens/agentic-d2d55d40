'use client';

import { useMemo, useState } from 'react';

type Option = {
  label: string;
  value: string;
  accent?: string;
};

type BaseQuestion = {
  id: string;
  prompt: string;
  helper?: string;
  dependsOn?: (answers: Answers) => boolean;
};

type SingleQuestion = BaseQuestion & {
  type: 'single';
  options: Option[];
};

type MultiQuestion = BaseQuestion & {
  type: 'multi';
  options: Option[];
  min?: number;
  max?: number;
};

type ScaleQuestion = BaseQuestion & {
  type: 'scale';
  minLabel: string;
  maxLabel: string;
  min: number;
  max: number;
};

type TextQuestion = BaseQuestion & {
  type: 'text';
  placeholder?: string;
};

type Question = SingleQuestion | MultiQuestion | ScaleQuestion | TextQuestion;

type Answers = Record<string, string | string[] | number>;

type Plan = {
  headline: string;
  styleName: string;
  styleNarrative: string;
  feelings: string[];
  useCases: string[];
  plantHighlights: {
    title: string;
    items: string[];
    detail: string;
  }[];
  layoutIdeas: string[];
  featureNotes: string[];
  maintenanceNote: string;
  nextSteps: string[];
};

const questions: Question[] = [
  {
    id: 'gardenFeeling',
    type: 'multi',
    prompt: 'Which feelings should this garden evoke every time you step outside?',
    helper: 'Pick everything that resonates with you.',
    options: [
      { value: 'serene', label: 'Serene & Restorative', accent: 'from-sky-200 to-emerald-200' },
      { value: 'energizing', label: 'Energizing & Social', accent: 'from-orange-200 to-pink-200' },
      { value: 'wildlife', label: 'Alive with Wildlife', accent: 'from-emerald-200 to-lime-200' },
      { value: 'productive', label: 'Productive & Edible', accent: 'from-yellow-100 to-amber-200' },
      { value: 'playful', label: 'Playful & Family Friendly', accent: 'from-purple-200 to-pink-200' },
    ],
    min: 1,
  },
  {
    id: 'gardenUsage',
    type: 'multi',
    prompt: 'How will you use this garden most often?',
    helper: 'Select the scenarios that best describe your lifestyle.',
    options: [
      { value: 'quiet_retreat', label: 'Quiet reflection / reading nook' },
      { value: 'hosting', label: 'Entertaining & outdoor dining' },
      { value: 'family', label: 'Family play space' },
      { value: 'growing_food', label: 'Growing fruits, veggies, or herbs' },
      { value: 'pollinator', label: 'Supporting pollinators & habitat' },
    ],
    min: 1,
  },
  {
    id: 'structurePreference',
    type: 'single',
    prompt: 'What type of structure feels right for you?',
    options: [
      { value: 'formal', label: 'Structured & formal lines' },
      { value: 'relaxed', label: 'Relaxed, natural flow' },
      { value: 'modern', label: 'Minimal & contemporary' },
      { value: 'eclectic', label: 'Layered & eclectic mix' },
    ],
  },
  {
    id: 'sunExposure',
    type: 'single',
    prompt: 'Describe the dominant sun exposure in your space.',
    options: [
      { value: 'full_sun', label: 'Full sun (6+ hours)' },
      { value: 'part_sun', label: 'Partial sun (3-6 hours)' },
      { value: 'dappled', label: 'Dappled light / shifting shade' },
      { value: 'full_shade', label: 'Full shade most of the day' },
    ],
  },
  {
    id: 'maintenance',
    type: 'scale',
    prompt: 'How much hands-on garden care fits your schedule?',
    helper: 'Slide to match your weekly maintenance comfort.',
    min: 1,
    max: 5,
    minLabel: 'Very low',
    maxLabel: 'Hands-on',
  },
  {
    id: 'colorPalette',
    type: 'multi',
    prompt: 'Which color palettes are you instinctively drawn to?',
    options: [
      { value: 'calming', label: 'Soft blues, whites, and silvers' },
      { value: 'sunny', label: 'Sunny yellows and oranges' },
      { value: 'bold', label: 'Vibrant reds and magentas' },
      { value: 'lush', label: 'Deep greens and forest tones' },
      { value: 'pastel', label: 'Romantic pastels and blush' },
    ],
    min: 1,
  },
  {
    id: 'plantTexture',
    type: 'multi',
    prompt: 'What plant personalities excite you?',
    helper: 'Think about foliage textures and presence.',
    options: [
      { value: 'architectural', label: 'Architectural statement plants' },
      { value: 'grasses', label: 'Movement from ornamental grasses' },
      { value: 'perennials', label: 'Perennial blooms that return' },
      { value: 'shrubs', label: 'Shrubs for structure & screening' },
      { value: 'edibles', label: 'Edible layers mixed into beds' },
    ],
    min: 1,
  },
  {
    id: 'seasonalFocus',
    type: 'multi',
    prompt: 'Which seasonal highlights matter most to you?',
    options: [
      { value: 'spring', label: 'Spring blossoms' },
      { value: 'summer', label: 'Summer color & fragrance' },
      { value: 'autumn', label: 'Autumn foliage & seed heads' },
      { value: 'winter', label: 'Winter structure & evergreens' },
    ],
    min: 1,
  },
  {
    id: 'featureWishList',
    type: 'multi',
    prompt: 'Pick the features that would delight you.',
    options: [
      { value: 'water', label: 'Water feature or reflective pool' },
      { value: 'fire', label: 'Fire pit or outdoor hearth' },
      { value: 'seating', label: 'Built-in seating or lounge' },
      { value: 'pathways', label: 'Expressive pathways & stepping stones' },
      { value: 'edible_station', label: 'Dedicated edible garden zone' },
      { value: 'wildlife_nook', label: 'Wildlife corner / bug hotel' },
    ],
  },
  {
    id: 'edibleAmbition',
    type: 'single',
    prompt: 'How prominent should edible planting be?',
    options: [
      { value: 'hero', label: 'Hero feature – front and center' },
      { value: 'integrated', label: 'Integrated with ornamentals' },
      { value: 'accent', label: 'Just a few potted or raised beds' },
      { value: 'none', label: 'Not a focus for this garden' },
    ],
    dependsOn: (answers) => arrayAnswer(answers['gardenUsage']).includes('growing_food'),
  },
  {
    id: 'notes',
    type: 'text',
    prompt: 'Anything else we should know?',
    helper: 'Optional details such as pets, children, or dream inspirations.',
    placeholder: 'e.g., We have a small dog, love moonlight evenings, and prefer drought-tolerant choices.',
  },
];

const feelingsCopy: Record<string, string> = {
  serene: 'calm refuge with layered greens and gentle movement',
  energizing: 'lively atmosphere tailored for social gatherings',
  wildlife: 'habitat-rich planting that welcomes pollinators and songbirds',
  productive: 'edible abundance balanced with visual impact',
  playful: 'joyful, interactive spaces where curiosity thrives',
};

const styleDescriptions: Record<string, string> = {
  formal: 'crisp geometry with clipped structure, focal axes, and refined materiality',
  relaxed: 'softly flowing beds, drifts of texture, and immersive pathways',
  modern: 'clean lines, sculptural plantings, and confident simplicity',
  eclectic: 'layered planting tapestries with collected objects and surprise moments',
};

const maintenanceNotes: Record<number, string> = {
  1: 'Designed for ultra-low upkeep with hardy, self-sufficient plant communities.',
  2: 'Lean maintenance schedule with resilient species and smart irrigation.',
  3: 'Balanced upkeep with seasonal tune-ups and rewarding bloom cycles.',
  4: 'Expect regular grooming, pruning, and planting refreshes to keep the energy high.',
  5: 'Hands-on gardening paradise—frequent tending keeps the space expressive and lush.',
};

function arrayAnswer(value: Answers[keyof Answers]): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [String(value)];
}

function numberAnswer(value: Answers[keyof Answers]): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function buildPlan(answers: Answers): Plan {
  const feelings = arrayAnswer(answers['gardenFeeling']);
  const usage = arrayAnswer(answers['gardenUsage']);
  const structure = String(answers['structurePreference'] ?? 'relaxed');
  const colorPalette = arrayAnswer(answers['colorPalette']);
  const plantTexture = arrayAnswer(answers['plantTexture']);
  const seasonality = arrayAnswer(answers['seasonalFocus']);
  const features = arrayAnswer(answers['featureWishList']);
  const edibleAmbition = String(answers['edibleAmbition'] ?? 'integrated');
  const maintenanceLevel = numberAnswer(answers['maintenance']) ?? 3;
  const sun = String(answers['sunExposure'] ?? 'part_sun');
  const notes = String(answers['notes'] ?? '').trim();

  const styleName = deriveStyleName(structure, usage, feelings);
  const styleNarrative = deriveStyleNarrative(structure, usage, feelings, sun);
  const plantHighlights = derivePlantHighlights(sun, colorPalette, plantTexture, seasonality, edibleAmbition);
  const layoutIdeas = deriveLayoutIdeas(usage, structure, features);
  const featureNotes = deriveFeatureNotes(features, edibleAmbition);
  const nextSteps = deriveNextSteps(usage, maintenanceLevel, notes);
  const headline = craftHeadline(feelings, usage);
  const maintenanceNote = maintenanceNotes[Math.round(maintenanceLevel)] ?? maintenanceNotes[3];

  return {
    headline,
    styleName,
    styleNarrative,
    feelings: feelings.map((feeling) => feelingsCopy[feeling] ?? feeling),
    useCases: usage,
    plantHighlights,
    layoutIdeas,
    featureNotes,
    maintenanceNote,
    nextSteps,
  };
}

function deriveStyleName(
  structure: string,
  usage: string[],
  feelings: string[],
): string {
  if (usage.includes('growing_food')) {
    if (structure === 'modern') {
      return 'Culinary Courtyard';
    }
    if (structure === 'formal') {
      return 'Productive Parterre';
    }
    return 'Edible Cottage Sanctuary';
  }

  if (feelings.includes('serene') && structure === 'relaxed') {
    return 'Tranquil Woodland Retreat';
  }

  if (feelings.includes('energizing') && usage.includes('hosting')) {
    return 'Social Entertainer\'s Terrace';
  }

  if (feelings.includes('wildlife')) {
    return 'Habitat-Rich Oasis';
  }

  if (structure === 'modern') {
    return 'Sculpted Modern Haven';
  }

  if (structure === 'formal') {
    return 'Refined Heritage Garden';
  }

  return 'Layered Lifestyle Garden';
}

function deriveStyleNarrative(
  structure: string,
  usage: string[],
  feelings: string[],
  sun: string,
): string {
  const fragments: string[] = [];

  fragments.push(styleDescriptions[structure] ?? styleDescriptions.relaxed);

  if (usage.includes('hosting')) {
    fragments.push('Generous entertaining zones orchestrate flow between seating, dining, and conversational pockets.');
  }
  if (usage.includes('quiet_retreat')) {
    fragments.push('Immersive retreat moments with enveloping planting and acoustic softness.');
  }
  if (usage.includes('family')) {
    fragments.push('Durable surfaces and open clearings keep space flexible for play and gatherings.');
  }
  if (usage.includes('pollinator')) {
    fragments.push('Biodiverse planting with staggered bloom times supports bees, butterflies, and songbirds.');
  }
  if (feelings.includes('serene')) {
    fragments.push('Muted palettes and layered textures maintain a tranquil cadence.');
  }
  if (feelings.includes('energizing')) {
    fragments.push('Color pops and kinetic plant forms bring celebratory energy.');
  }
  if (sun === 'full_shade') {
    fragments.push('Shade-adapted understory planting maximises dappled light.');
  } else if (sun === 'full_sun') {
    fragments.push('Sun-loving perennials and structural successional blooms thrive in the bright exposure.');
  }

  return fragments.join(' ');
}

function derivePlantHighlights(
  sun: string,
  colorPalette: string[],
  plantTexture: string[],
  seasonality: string[],
  edibleAmbition: string,
): Plan['plantHighlights'] {
  const items: Plan['plantHighlights'] = [];

  const paletteDescriptor = determinePaletteDescriptor(colorPalette);

  const sunCollections: Record<string, string[]> = {
    full_sun: [
      'Lavandula × intermedia (full-sun fragrance)',
      'Achillea millefolium "Terracotta"',
      'Salvia nemorosa for pollinator magnetism',
      'Miscanthus sinensis "Morning Light"',
    ],
    part_sun: [
      'Hydrangea paniculata for luminous panicles',
      'Nepeta "Walker\'s Low" for long-season color',
      'Heuchera blends for foliage contrast',
      'Hakonechloa macra for graceful drifts',
    ],
    dappled: [
      'Helleborus orientalis for shoulder-season bloom',
      'Japanese forest grass to catch stray light',
      'Ferns and brunnera for textural understory',
      'Camellia sasanqua for glossy evergreen form',
    ],
    full_shade: [
      'Hosta sieboldiana with sculptural leaves',
      'Carex oshimensis for fine texture',
      'Astilbe chinensis for airy plumes',
      'Mahonia eurybracteata for evergreen backbone',
    ],
  };

  const textureLibrary: Record<string, string[]> = {
    architectural: [
      'Agave americana or Yucca rostrata as statement silhouettes',
      'Phormium tenax for vertical blades',
    ],
    grasses: [
      'Pennisetum alopecuroides for seasonal movement',
      'Stipa tenuissima for billowing softness',
    ],
    perennials: [
      'Echinacea purpurea for summer structure',
      'Digitalis purpurea for vertical rhythm',
    ],
    shrubs: [
      'Ilex crenata cloud-pruned for evergreen architecture',
      'Viburnum carlesii for fragrance and wildlife value',
    ],
    edibles: [
      'Espalier fruit trees to stitch productivity into structure',
      'Perennial herbs (rosemary, thyme, chives) as edging accents',
    ],
  };

  const seasonalLayering: Record<string, string> = {
    spring: 'Layer bulbs (tulips, alliums) beneath perennials to ignite spring before foliage flushes.',
    summer: 'Prioritise long-blooming perennials and repeated colors to carry momentum through the season.',
    autumn: 'Highlight grasses and seed heads that glow against lower light, with maples or sumac for fiery foliage.',
    winter: 'Lean on evergreen structure, bark texture, and lighting to maintain presence.',
  };

  items.push({
    title: 'Core palette',
    items: sunCollections[sun] ?? sunCollections.part_sun,
    detail: `Tuned for ${paletteDescriptor} hues while matching your light levels.`,
  });

  const textureItems = plantTexture.flatMap((key) => textureLibrary[key] ?? []);
  if (textureItems.length) {
    items.push({
      title: 'Signature textures',
      items: textureItems,
      detail: 'Curated plant personalities that reinforce the mood and structural rhythm you love.',
    });
  }

  if (edibleAmbition !== 'none') {
    const edibleDetail =
      edibleAmbition === 'hero'
        ? 'Elevate edibles as sculptural focal points with raised corten beds and espalier frameworks.'
        : edibleAmbition === 'integrated'
          ? 'Interlace herbs and productive shrubs throughout ornamental beds for a seamless edible weave.'
          : 'Cluster compact planters near the kitchen entrance for effortless snipping.';
    items.push({
      title: 'Edible layers',
      items: [
        'Perennial herbs for year-round harvesting',
        'Vertical trellises for beans, peas, or cucumbers',
        'Seasonal rotation of leafy greens or cut-and-come-again lettuces',
      ],
      detail: edibleDetail,
    });
  }

  if (seasonality.length) {
    items.push({
      title: 'Seasonal choreography',
      items: seasonality.map((season) => seasonalLayering[season]).filter(Boolean) as string[],
      detail: 'Plan the bloom calendar so every season feels intentional.',
    });
  }

  return items;
}

function determinePaletteDescriptor(colorPalette: string[]): string {
  if (colorPalette.includes('bold')) {
    return 'bold statements and celebratory saturation';
  }
  if (colorPalette.includes('calming')) {
    return 'calming tonal shifts and silvery foliage';
  }
  if (colorPalette.includes('sunny')) {
    return 'sun-warmed energy with golden highlights';
  }
  if (colorPalette.includes('pastel')) {
    return 'romantic pastels with airy accents';
  }
  return 'lush botanical tapestries';
}

function deriveLayoutIdeas(
  usage: string[],
  structure: string,
  features: string[],
): string[] {
  const ideas: string[] = [];

  if (usage.includes('hosting')) {
    ideas.push('Define a central entertaining terrace framed by generous planting to soften edges.');
  }
  if (usage.includes('quiet_retreat')) {
    ideas.push('Nest a secluded seating nook with screening plants and sound-softening groundcovers.');
  }
  if (usage.includes('family')) {
    ideas.push('Reserve an open lawn or durable surface for flexible family play that stays visible from key vantage points.');
  }
  if (usage.includes('pollinator')) {
    ideas.push('Layer pollinator planting in sun traps with staggered bloom sequences and nesting habitats.');
  }
  if (usage.includes('growing_food')) {
    ideas.push('Position raised edible beds within easy reach of the kitchen and integrate paths for effortless harvesting.');
  }

  if (structure === 'formal') {
    ideas.push('Use axial alignments and clipped hedging to reinforce structure, allowing looser infill to soften edges.');
  } else if (structure === 'modern') {
    ideas.push('Keep materials restrained and repeat key plant forms to underline the modern aesthetic.');
  } else if (structure === 'relaxed') {
    ideas.push('Emphasise meandering paths and varied bed depths to keep the journey exploratory.');
  }

  if (features.includes('pathways')) {
    ideas.push('Vary pathway materials—gravel crunch, stone steppers, or boardwalks—to choreograph pacing.');
  }
  if (features.includes('seating')) {
    ideas.push('Anchor built-in seating against evergreen backdrops to create year-round outdoor rooms.');
  }
  if (features.includes('water')) {
    ideas.push('Introduce a reflective water feature to mirror planting layers and mask ambient noise.');
  }
  if (features.includes('fire')) {
    ideas.push('Balance the elemental palette with a fire conversation zone for shoulder-season gatherings.');
  }

  return ideas;
}

function deriveFeatureNotes(features: string[], edibleAmbition: string): string[] {
  const notes: string[] = [];
  features.forEach((feature) => {
    switch (feature) {
      case 'water':
        notes.push('Consider a rill or bubbling bowl to add sound and attract wildlife.');
        break;
      case 'fire':
        notes.push('A low-profile fire feature can double as a coffee table when not in use.');
        break;
      case 'seating':
        notes.push('Integrated timber or stone benches maintain clean sightlines and invite spontaneous pauses.');
        break;
      case 'pathways':
        notes.push('Layer lighting along paths for night-time drama and safe navigation.');
        break;
      case 'edible_station':
        notes.push('Design an edible prep station with storage for tools and space to rinse harvests.');
        break;
      case 'wildlife_nook':
        notes.push('Dedicate a corner with native shrubs, log piles, and water sources for habitat richness.');
        break;
      default:
        break;
    }
  });

  if (edibleAmbition === 'hero') {
    notes.push('Celebrate edibles visually with sculptural trellises and statement planters.');
  }

  return notes;
}

function craftHeadline(feelings: string[], usage: string[]): string {
  const feelDescriptor =
    feelings.includes('energizing')
      ? 'vibrant destination garden'
      : feelings.includes('serene')
        ? 'immersive restorative garden'
        : feelings.includes('productive')
          ? 'high-performing edible landscape'
          : 'tailored lifestyle garden';

  const usageDescriptor =
    usage.includes('hosting')
      ? 'made for effortless hosting'
      : usage.includes('quiet_retreat')
        ? 'perfect for mindful retreats'
        : usage.includes('growing_food')
          ? 'built for productive joy'
          : 'crafted around the way you live';

  return `A ${feelDescriptor} ${usageDescriptor}.`;
}

function deriveNextSteps(
  usage: string[],
  maintenanceLevel: number,
  notes: string,
): string[] {
  const steps: string[] = [];
  steps.push('Map the site to scale, marking sun paths, key views, and access points.');
  steps.push('Sketch zoning diagrams that organise entertaining, retreat, and functional zones.');

  if (maintenanceLevel <= 2) {
    steps.push('Prioritise drought-tolerant and native planting palettes to keep care lightweight.');
  } else if (maintenanceLevel >= 4) {
    steps.push('Plan for layered succession planting and seasonal refreshes to channel your gardening energy.');
  }

  if (usage.includes('hosting')) {
    steps.push('Wire in ambient and task lighting to extend evening gatherings.');
  }
  if (usage.includes('growing_food')) {
    steps.push('Design crop rotation plans and companion planting maps for edible beds.');
  }

  if (notes) {
    steps.push(`Incorporate personal notes: ${notes}`);
  }

  steps.push('Prepare a moodboard of materials, planting references, and lighting concepts.');
  steps.push('Consult with local nurseries or a landscape designer to validate plant availability and sizing.');

  return steps;
}

export function AgentQuestionnaire() {
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredQuestions = useMemo(
    () => questions.filter((question) => (question.dependsOn ? question.dependsOn(answers) : true)),
    [answers],
  );

  const currentQuestion = filteredQuestions[currentIndex];
  const totalQuestions = filteredQuestions.length;
  const progress = totalQuestions === 0 ? 1 : Math.min(currentIndex, totalQuestions) / totalQuestions;
  const isComplete = currentIndex >= totalQuestions;

  const plan = useMemo(() => (isComplete ? buildPlan(answers) : null), [answers, isComplete]);

  const setAnswer = (questionId: string, value: Answers[keyof Answers]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (isComplete) {
      return;
    }
    const question = filteredQuestions[currentIndex];
    if (!question) {
      setCurrentIndex(filteredQuestions.length);
      return;
    }
    const value = answers[question.id];
    if (
      (question.type === 'multi' && (!Array.isArray(value) || value.length < (question.min ?? 0))) ||
      (value === undefined || value === '' || (Array.isArray(value) && value.length === 0))
    ) {
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
  };

  const updateMultiSelection = (question: MultiQuestion, optionValue: string) => {
    setAnswers((prev) => {
      const currentValue = arrayAnswer(prev[question.id]);
      const exists = currentValue.includes(optionValue);
      let nextValue = currentValue;

      if (exists) {
        nextValue = currentValue.filter((item) => item !== optionValue);
      } else {
        if (question.max && currentValue.length >= question.max) {
          nextValue = [...currentValue.slice(1), optionValue];
        } else {
          nextValue = [...currentValue, optionValue];
        }
      }

      return {
        ...prev,
        [question.id]: nextValue,
      };
    });
  };

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-4 py-12 text-slate-100 sm:px-8">
      <header className="mx-auto flex w-full max-w-4xl flex-col gap-4 text-center sm:text-left">
        <span className="text-sm uppercase tracking-[0.3em] text-emerald-200">Garden Intelligence Brief</span>
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Agentic AI Garden Questionnaire
        </h1>
        <p className="text-base leading-relaxed text-slate-200 sm:max-w-3xl">
          We\'ll read patterns in your preferences and translate them into a living blueprint for a garden that
          reflects how you want to feel and live outdoors.
        </p>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${Math.max(progress * 100, plan ? 100 : 0)}%` }}
          />
        </div>
        <p className="text-sm text-emerald-100">
          {isComplete
            ? 'You\'re ready for your tailored garden concept.'
            : `Question ${Math.min(currentIndex + 1, totalQuestions)} of ${totalQuestions}`}
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {!isComplete && currentQuestion && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-white">{currentQuestion.prompt}</h2>
              {currentQuestion.helper && <p className="text-sm text-emerald-100">{currentQuestion.helper}</p>}
            </div>

            {currentQuestion.type === 'single' && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setAnswer(currentQuestion.id, option.value)}
                      className={`rounded-2xl border px-4 py-4 text-left transition
                        ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-400/20 shadow-lg shadow-emerald-900/30'
                            : 'border-white/10 bg-white/5 hover:border-emerald-300/60 hover:bg-white/10'
                        }`}
                    >
                      <span className="text-base font-medium text-white">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'multi' && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((option) => {
                  const selectedValues = arrayAnswer(answers[currentQuestion.id]);
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => updateMultiSelection(currentQuestion, option.value)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        isSelected
                          ? option.accent
                            ? `border-transparent bg-gradient-to-r ${option.accent} text-slate-900 shadow-lg shadow-emerald-900/40`
                            : 'border-emerald-300 bg-emerald-400/30 text-white shadow-lg shadow-emerald-900/30'
                          : 'border-white/10 bg-white/5 text-white hover:border-emerald-300/60 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-base font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'scale' && (
              <div className="mt-8 flex flex-col gap-5">
                <div className="flex items-center justify-between text-sm text-emerald-100">
                  <span>{currentQuestion.minLabel}</span>
                  <span>{currentQuestion.maxLabel}</span>
                </div>
                <input
                  type="range"
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  step={1}
                  value={Number(
                    answers[currentQuestion.id] ?? Math.round((currentQuestion.max - currentQuestion.min) / 2) + currentQuestion.min,
                  )}
                  onChange={(event) => setAnswer(currentQuestion.id, Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-emerald-400"
                />
                <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
                  {maintenanceNotes[Math.round(Number(answers[currentQuestion.id] ?? currentQuestion.min))]}
                </div>
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <textarea
                value={String(answers[currentQuestion.id] ?? '')}
                onChange={(event) => setAnswer(currentQuestion.id, event.target.value)}
                rows={4}
                placeholder={currentQuestion.placeholder}
                className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-emerald-100/70 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-300"
              >
                {currentIndex === totalQuestions - 1 ? 'Generate my garden blueprint' : 'Next'}
              </button>
            </div>
          </section>
        )}

        {isComplete && plan && (
          <section className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-100 backdrop-blur">
              <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">Agentic synthesis</p>
                <h2 className="text-3xl font-semibold text-white">{plan.styleName}</h2>
                <p className="text-lg text-emerald-100">{plan.headline}</p>
                <p className="text-base leading-relaxed text-slate-100">{plan.styleNarrative}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">Desired feelings anchored</h3>
                <ul className="space-y-2 text-sm text-emerald-100">
                  {plan.feelings.map((feeling) => (
                    <li key={feeling} className="rounded-lg bg-white/5 px-3 py-2">{feeling}</li>
                  ))}
                </ul>
                <h3 className="text-xl font-semibold text-white">How you\'ll live outdoors</h3>
                <ul className="space-y-2 text-sm text-emerald-100">
                  {plan.useCases.map((useCase) => (
                    <li key={useCase} className="rounded-lg bg-white/5 px-3 py-2 capitalize">
                      {useCase.replace('_', ' ')}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">Plant palette directives</h3>
                {plan.plantHighlights.map((highlight) => (
                  <div key={highlight.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h4 className="text-lg font-medium text-emerald-100">{highlight.title}</h4>
                    <p className="mt-1 text-sm text-slate-200">{highlight.detail}</p>
                    <ul className="mt-3 space-y-2 text-sm text-emerald-50">
                      {highlight.items.map((item) => (
                        <li key={item} className="rounded-lg bg-emerald-400/10 px-3 py-2 text-emerald-100">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </article>

              <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">Spatial choreography</h3>
                <ul className="space-y-3 text-sm text-emerald-100">
                  {plan.layoutIdeas.map((idea) => (
                    <li key={idea} className="rounded-lg bg-white/5 px-3 py-2">{idea}</li>
                  ))}
                </ul>
              </article>

              <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">Feature intelligence</h3>
                <ul className="space-y-3 text-sm text-emerald-100">
                  {plan.featureNotes.length ? (
                    plan.featureNotes.map((note) => (
                      <li key={note} className="rounded-lg bg-white/5 px-3 py-2">{note}</li>
                    ))
                  ) : (
                    <li className="rounded-lg bg-white/5 px-3 py-2">Select feature inspirations to generate nuanced guidance.</li>
                  )}
                </ul>
                <h3 className="text-xl font-semibold text-white">Maintenance cadence</h3>
                <p className="rounded-lg bg-emerald-400/10 px-3 py-3 text-sm text-emerald-100">
                  {plan.maintenanceNote}
                </p>
              </article>

              <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
                <h3 className="text-xl font-semibold text-white">Next steps to activate your garden vision</h3>
                <ol className="space-y-3 text-sm text-emerald-100">
                  {plan.nextSteps.map((step, index) => (
                    <li key={step} className="rounded-lg bg-white/5 px-3 py-2">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/30 text-xs font-semibold text-emerald-100">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </article>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleRestart}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
              >
                Start over
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
