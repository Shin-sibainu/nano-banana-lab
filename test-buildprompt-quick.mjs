import { buildPrompt } from './lib/gemini-new.js';

// Test the problematic template
const template = 'Change the outfit of the person in ${person} to ${reference_outfit ? "match the outfit style shown in ${reference_outfit}" : `"${outfit_style}"`} while keeping the same face and ${same_pose ? "same pose" : "natural pose"}. ${detail_requirements ? `Additional requirements: ${detail_requirements}` : ""}';

const inputs1 = {
  person: 'data:image/test',
  reference_outfit: null,
  outfit_style: 'casual',
  same_pose: true,
  detail_requirements: 'maintain original lighting'
};

console.log('✅ Testing buildPrompt fix:');
console.log('Input:', JSON.stringify(inputs1, null, 2));
console.log('Result:', buildPrompt(template, inputs1));