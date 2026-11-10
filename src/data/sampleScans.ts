/**
 * DENT X — Demonstration Clinical Datasets
 * All records here are strictly sample demonstration datasets for UI and clinical workflow prototyping.
 */

import { DentalScan, ToothData, ToothDisplacement, ProcessingStage } from '../types/dental';

// Helper to generate comprehensive 32-tooth database with realistic clinical measurements
export function generateTeethCatalog(): ToothData[] {
  const teeth: ToothData[] = [
    // Upper Right (Quadrant 1): 18 -> 11
    {
      id: 'tooth_18',
      fdiNumber: 18,
      universalNumber: 1,
      palmerCode: '8┘',
      name: 'Maxillary Right Third Molar (Wisdom)',
      arch: 'upper',
      quadrant: 1,
      type: 'molar',
      crownHeight: 6.8,
      mesiodistalWidth: 9.4,
      buccolingualWidth: 10.6,
      torqueAngleDeg: -7.2,
      angulationDeg: 4.1,
      surfaceDeviationMm: 0.12,
      segmentationConfidence: 0.94,
      clinicalCondition: 'Impacted',
      notes: 'Partially erupted, mild distal tilt.'
    },
    {
      id: 'tooth_17',
      fdiNumber: 17,
      universalNumber: 2,
      palmerCode: '7┘',
      name: 'Maxillary Right Second Molar',
      arch: 'upper',
      quadrant: 1,
      type: 'molar',
      crownHeight: 7.2,
      mesiodistalWidth: 9.8,
      buccolingualWidth: 11.2,
      torqueAngleDeg: -8.5,
      angulationDeg: 2.8,
      surfaceDeviationMm: 0.08,
      segmentationConfidence: 0.98,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Normal morphology and occlusal anatomy.'
    },
    {
      id: 'tooth_16',
      fdiNumber: 16,
      universalNumber: 3,
      palmerCode: '6┘',
      name: 'Maxillary Right First Molar',
      arch: 'upper',
      quadrant: 1,
      type: 'molar',
      crownHeight: 7.6,
      mesiodistalWidth: 10.4,
      buccolingualWidth: 11.8,
      torqueAngleDeg: -9.1,
      angulationDeg: 1.5,
      surfaceDeviationMm: 0.06,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Restoration',
      notes: 'Composite occlusal restoration on mesial pit.'
    },
    {
      id: 'tooth_15',
      fdiNumber: 15,
      universalNumber: 4,
      palmerCode: '5┘',
      name: 'Maxillary Right Second Premolar',
      arch: 'upper',
      quadrant: 1,
      type: 'premolar',
      crownHeight: 7.8,
      mesiodistalWidth: 7.1,
      buccolingualWidth: 9.2,
      torqueAngleDeg: -6.4,
      angulationDeg: 2.0,
      surfaceDeviationMm: 0.07,
      segmentationConfidence: 0.97,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Optimal alignment.'
    },
    {
      id: 'tooth_14',
      fdiNumber: 14,
      universalNumber: 5,
      palmerCode: '4┘',
      name: 'Maxillary Right First Premolar',
      arch: 'upper',
      quadrant: 1,
      type: 'premolar',
      crownHeight: 8.2,
      mesiodistalWidth: 7.3,
      buccolingualWidth: 9.4,
      torqueAngleDeg: -5.8,
      angulationDeg: 2.5,
      surfaceDeviationMm: 0.09,
      segmentationConfidence: 0.96,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Bicuspid cusp tips well preserved.'
    },
    {
      id: 'tooth_13',
      fdiNumber: 13,
      universalNumber: 6,
      palmerCode: '3┘',
      name: 'Maxillary Right Canine',
      arch: 'upper',
      quadrant: 1,
      type: 'canine',
      crownHeight: 10.1,
      mesiodistalWidth: 7.9,
      buccolingualWidth: 8.4,
      torqueAngleDeg: -2.1,
      angulationDeg: 7.8,
      surfaceDeviationMm: 0.08,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Mild Rotation',
      notes: 'Mesial rotation of 4.2° relative to arch line.'
    },
    {
      id: 'tooth_12',
      fdiNumber: 12,
      universalNumber: 7,
      palmerCode: '2┘',
      name: 'Maxillary Right Lateral Incisor',
      arch: 'upper',
      quadrant: 1,
      type: 'incisor',
      crownHeight: 9.2,
      mesiodistalWidth: 6.8,
      buccolingualWidth: 6.3,
      torqueAngleDeg: 3.4,
      angulationDeg: 6.5,
      surfaceDeviationMm: 0.05,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Peg lateral tendency not observed.'
    },
    {
      id: 'tooth_11',
      fdiNumber: 11,
      universalNumber: 8,
      palmerCode: '1┘',
      name: 'Maxillary Right Central Incisor',
      arch: 'upper',
      quadrant: 1,
      type: 'incisor',
      crownHeight: 10.8,
      mesiodistalWidth: 8.7,
      buccolingualWidth: 7.2,
      torqueAngleDeg: 12.0,
      angulationDeg: 4.2,
      surfaceDeviationMm: 0.04,
      segmentationConfidence: 1.0,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Prominent mamelons worn, smooth incisal edge.'
    },

    // Upper Left (Quadrant 2): 21 -> 28
    {
      id: 'tooth_21',
      fdiNumber: 21,
      universalNumber: 9,
      palmerCode: '└1',
      name: 'Maxillary Left Central Incisor',
      arch: 'upper',
      quadrant: 2,
      type: 'incisor',
      crownHeight: 10.9,
      mesiodistalWidth: 8.8,
      buccolingualWidth: 7.3,
      torqueAngleDeg: 11.8,
      angulationDeg: -4.1,
      surfaceDeviationMm: 0.05,
      segmentationConfidence: 1.0,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Symmetric to #11, midline aligned.'
    },
    {
      id: 'tooth_22',
      fdiNumber: 22,
      universalNumber: 10,
      palmerCode: '└2',
      name: 'Maxillary Left Lateral Incisor',
      arch: 'upper',
      quadrant: 2,
      type: 'incisor',
      crownHeight: 9.3,
      mesiodistalWidth: 6.9,
      buccolingualWidth: 6.4,
      torqueAngleDeg: 3.2,
      angulationDeg: -6.2,
      surfaceDeviationMm: 0.06,
      segmentationConfidence: 0.98,
      clinicalCondition: 'Mild Rotation',
      notes: 'Palatal displacement of 0.8mm.'
    },
    {
      id: 'tooth_23',
      fdiNumber: 23,
      universalNumber: 11,
      palmerCode: '└3',
      name: 'Maxillary Left Canine',
      arch: 'upper',
      quadrant: 2,
      type: 'canine',
      crownHeight: 10.2,
      mesiodistalWidth: 8.0,
      buccolingualWidth: 8.5,
      torqueAngleDeg: -2.3,
      angulationDeg: -7.5,
      surfaceDeviationMm: 0.07,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Canine guidance functional.'
    },
    {
      id: 'tooth_24',
      fdiNumber: 24,
      universalNumber: 12,
      palmerCode: '└4',
      name: 'Maxillary Left First Premolar',
      arch: 'upper',
      quadrant: 2,
      type: 'premolar',
      crownHeight: 8.3,
      mesiodistalWidth: 7.4,
      buccolingualWidth: 9.3,
      torqueAngleDeg: -5.6,
      angulationDeg: -2.4,
      surfaceDeviationMm: 0.08,
      segmentationConfidence: 0.97,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Intact marginal ridges.'
    },
    {
      id: 'tooth_25',
      fdiNumber: 25,
      universalNumber: 13,
      palmerCode: '└5',
      name: 'Maxillary Left Second Premolar',
      arch: 'upper',
      quadrant: 2,
      type: 'premolar',
      crownHeight: 7.9,
      mesiodistalWidth: 7.2,
      buccolingualWidth: 9.1,
      torqueAngleDeg: -6.2,
      angulationDeg: -1.9,
      surfaceDeviationMm: 0.07,
      segmentationConfidence: 0.98,
      clinicalCondition: 'Enamel Wear Facet',
      notes: 'Subtle wear on lingual cusp.'
    },
    {
      id: 'tooth_26',
      fdiNumber: 26,
      universalNumber: 14,
      palmerCode: '└6',
      name: 'Maxillary Left First Molar',
      arch: 'upper',
      quadrant: 2,
      type: 'molar',
      crownHeight: 7.7,
      mesiodistalWidth: 10.5,
      buccolingualWidth: 11.9,
      torqueAngleDeg: -9.0,
      angulationDeg: -1.6,
      surfaceDeviationMm: 0.06,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Cusp of Carabelli present.'
    },
    {
      id: 'tooth_27',
      fdiNumber: 27,
      universalNumber: 15,
      palmerCode: '└7',
      name: 'Maxillary Left Second Molar',
      arch: 'upper',
      quadrant: 2,
      type: 'molar',
      crownHeight: 7.3,
      mesiodistalWidth: 9.9,
      buccolingualWidth: 11.3,
      torqueAngleDeg: -8.6,
      angulationDeg: -2.7,
      surfaceDeviationMm: 0.09,
      segmentationConfidence: 0.97,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Good occlusal contact.'
    },
    {
      id: 'tooth_28',
      fdiNumber: 28,
      universalNumber: 16,
      palmerCode: '└8',
      name: 'Maxillary Left Third Molar (Wisdom)',
      arch: 'upper',
      quadrant: 2,
      type: 'molar',
      crownHeight: 6.7,
      mesiodistalWidth: 9.2,
      buccolingualWidth: 10.4,
      torqueAngleDeg: -7.0,
      angulationDeg: -3.9,
      surfaceDeviationMm: 0.14,
      segmentationConfidence: 0.93,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Erupted, minor distobuccal cusp tipping.'
    },

    // Lower Left (Quadrant 3): 38 -> 31
    {
      id: 'tooth_38',
      fdiNumber: 38,
      universalNumber: 17,
      palmerCode: '┌8',
      name: 'Mandibular Left Third Molar',
      arch: 'lower',
      quadrant: 3,
      type: 'molar',
      crownHeight: 6.9,
      mesiodistalWidth: 10.1,
      buccolingualWidth: 9.8,
      torqueAngleDeg: -14.2,
      angulationDeg: 4.8,
      surfaceDeviationMm: 0.15,
      segmentationConfidence: 0.92,
      clinicalCondition: 'Impacted',
      notes: 'Mesioangular impaction observed.'
    },
    {
      id: 'tooth_37',
      fdiNumber: 37,
      universalNumber: 18,
      palmerCode: '┌7',
      name: 'Mandibular Left Second Molar',
      arch: 'lower',
      quadrant: 3,
      type: 'molar',
      crownHeight: 7.1,
      mesiodistalWidth: 10.4,
      buccolingualWidth: 10.2,
      torqueAngleDeg: -13.8,
      angulationDeg: 3.5,
      surfaceDeviationMm: 0.08,
      segmentationConfidence: 0.97,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Sound tooth structure.'
    },
    {
      id: 'tooth_36',
      fdiNumber: 36,
      universalNumber: 19,
      palmerCode: '┌6',
      name: 'Mandibular Left First Molar',
      arch: 'lower',
      quadrant: 3,
      type: 'molar',
      crownHeight: 7.5,
      mesiodistalWidth: 11.2,
      buccolingualWidth: 10.7,
      torqueAngleDeg: -12.5,
      angulationDeg: 2.1,
      surfaceDeviationMm: 0.06,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Restoration',
      notes: 'Occlusal sealants intact.'
    },
    {
      id: 'tooth_35',
      fdiNumber: 35,
      universalNumber: 20,
      palmerCode: '┌5',
      name: 'Mandibular Left Second Premolar',
      arch: 'lower',
      quadrant: 3,
      type: 'premolar',
      crownHeight: 8.0,
      mesiodistalWidth: 7.2,
      buccolingualWidth: 8.1,
      torqueAngleDeg: -8.4,
      angulationDeg: 1.8,
      surfaceDeviationMm: 0.07,
      segmentationConfidence: 0.98,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Bicuspid anatomy intact.'
    },
    {
      id: 'tooth_34',
      fdiNumber: 34,
      universalNumber: 21,
      palmerCode: '┌4',
      name: 'Mandibular Left First Premolar',
      arch: 'lower',
      quadrant: 3,
      type: 'premolar',
      crownHeight: 8.4,
      mesiodistalWidth: 7.0,
      buccolingualWidth: 7.8,
      torqueAngleDeg: -6.2,
      angulationDeg: 1.5,
      surfaceDeviationMm: 0.08,
      segmentationConfidence: 0.97,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Well positioned in mandibular catenary.'
    },
    {
      id: 'tooth_33',
      fdiNumber: 33,
      universalNumber: 22,
      palmerCode: '┌3',
      name: 'Mandibular Left Canine',
      arch: 'lower',
      quadrant: 3,
      type: 'canine',
      crownHeight: 10.4,
      mesiodistalWidth: 7.1,
      buccolingualWidth: 7.6,
      torqueAngleDeg: -1.2,
      angulationDeg: 5.4,
      surfaceDeviationMm: 0.06,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Strong canine root prominence.'
    },
    {
      id: 'tooth_32',
      fdiNumber: 32,
      universalNumber: 23,
      palmerCode: '┌2',
      name: 'Mandibular Left Lateral Incisor',
      arch: 'lower',
      quadrant: 3,
      type: 'incisor',
      crownHeight: 9.5,
      mesiodistalWidth: 5.9,
      buccolingualWidth: 6.4,
      torqueAngleDeg: -1.0,
      angulationDeg: 3.1,
      surfaceDeviationMm: 0.05,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Mild Rotation',
      notes: 'Lingual tipping of 1.2mm, minor crowding.'
    },
    {
      id: 'tooth_31',
      fdiNumber: 31,
      universalNumber: 24,
      palmerCode: '┌1',
      name: 'Mandibular Left Central Incisor',
      arch: 'lower',
      quadrant: 3,
      type: 'incisor',
      crownHeight: 8.9,
      mesiodistalWidth: 5.4,
      buccolingualWidth: 6.0,
      torqueAngleDeg: -1.1,
      angulationDeg: 1.2,
      surfaceDeviationMm: 0.04,
      segmentationConfidence: 1.0,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Mild incisal edge imbrication.'
    },

    // Lower Right (Quadrant 4): 41 -> 48
    {
      id: 'tooth_41',
      fdiNumber: 41,
      universalNumber: 25,
      palmerCode: '1┐',
      name: 'Mandibular Right Central Incisor',
      arch: 'lower',
      quadrant: 4,
      type: 'incisor',
      crownHeight: 8.8,
      mesiodistalWidth: 5.3,
      buccolingualWidth: 6.1,
      torqueAngleDeg: -1.2,
      angulationDeg: -1.1,
      surfaceDeviationMm: 0.05,
      segmentationConfidence: 1.0,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Centrally aligned.'
    },
    {
      id: 'tooth_42',
      fdiNumber: 42,
      universalNumber: 26,
      palmerCode: '2┐',
      name: 'Mandibular Right Lateral Incisor',
      arch: 'lower',
      quadrant: 4,
      type: 'incisor',
      crownHeight: 9.4,
      mesiodistalWidth: 5.8,
      buccolingualWidth: 6.5,
      torqueAngleDeg: -1.0,
      angulationDeg: -3.0,
      surfaceDeviationMm: 0.05,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Normal contact with #41 and #43.'
    },
    {
      id: 'tooth_43',
      fdiNumber: 43,
      universalNumber: 27,
      palmerCode: '3┐',
      name: 'Mandibular Right Canine',
      arch: 'lower',
      quadrant: 4,
      type: 'canine',
      crownHeight: 10.3,
      mesiodistalWidth: 7.0,
      buccolingualWidth: 7.7,
      torqueAngleDeg: -1.3,
      angulationDeg: -5.2,
      surfaceDeviationMm: 0.06,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Good periodontal support.'
    },
    {
      id: 'tooth_44',
      fdiNumber: 44,
      universalNumber: 28,
      palmerCode: '4┐',
      name: 'Mandibular Right First Premolar',
      arch: 'lower',
      quadrant: 4,
      type: 'premolar',
      crownHeight: 8.5,
      mesiodistalWidth: 6.9,
      buccolingualWidth: 7.9,
      torqueAngleDeg: -6.0,
      angulationDeg: -1.6,
      surfaceDeviationMm: 0.07,
      segmentationConfidence: 0.98,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Lingual cusp underdeveloped (anatomical variant).'
    },
    {
      id: 'tooth_45',
      fdiNumber: 45,
      universalNumber: 29,
      palmerCode: '5┐',
      name: 'Mandibular Right Second Premolar',
      arch: 'lower',
      quadrant: 4,
      type: 'premolar',
      crownHeight: 8.1,
      mesiodistalWidth: 7.1,
      buccolingualWidth: 8.2,
      torqueAngleDeg: -8.1,
      angulationDeg: -1.7,
      surfaceDeviationMm: 0.08,
      segmentationConfidence: 0.97,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Y-pattern occlusal groove system.'
    },
    {
      id: 'tooth_46',
      fdiNumber: 46,
      universalNumber: 30,
      palmerCode: '6┐',
      name: 'Mandibular Right First Molar',
      arch: 'lower',
      quadrant: 4,
      type: 'molar',
      crownHeight: 7.6,
      mesiodistalWidth: 11.1,
      buccolingualWidth: 10.8,
      torqueAngleDeg: -12.4,
      angulationDeg: -2.0,
      surfaceDeviationMm: 0.06,
      segmentationConfidence: 0.99,
      clinicalCondition: 'Enamel Wear Facet',
      notes: 'Attrition on distobuccal cusp, Class I occlusion.'
    },
    {
      id: 'tooth_47',
      fdiNumber: 47,
      universalNumber: 31,
      palmerCode: '7┐',
      name: 'Mandibular Right Second Molar',
      arch: 'lower',
      quadrant: 4,
      type: 'molar',
      crownHeight: 7.2,
      mesiodistalWidth: 10.5,
      buccolingualWidth: 10.3,
      torqueAngleDeg: -13.5,
      angulationDeg: -3.2,
      surfaceDeviationMm: 0.07,
      segmentationConfidence: 0.98,
      clinicalCondition: 'Healthy Enamel',
      notes: 'Cruciform occlusal pattern.'
    },
    {
      id: 'tooth_48',
      fdiNumber: 48,
      universalNumber: 32,
      palmerCode: '8┐',
      name: 'Mandibular Right Third Molar',
      arch: 'lower',
      quadrant: 4,
      type: 'molar',
      crownHeight: 6.8,
      mesiodistalWidth: 10.0,
      buccolingualWidth: 9.7,
      torqueAngleDeg: -14.0,
      angulationDeg: -4.5,
      surfaceDeviationMm: 0.16,
      segmentationConfidence: 0.91,
      clinicalCondition: 'Impacted',
      notes: 'Horizontal/mesial bone impaction.'
    }
  ];

  return teeth;
}

// Sample clinical image SVGs generated cleanly as inline data URIs
function createClinicalImageSvg(label: string, sublabel: string, iconType: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="100%" height="100%" fill="#0a1128"/>
    <defs>
      <radialGradient id="grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#0a1128" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.8"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <circle cx="200" cy="140" r="110" fill="url(#grad)"/>
    
    <!-- Parabolic Dental Arch Silhouette -->
    <path d="M 120 200 C 130 90, 270 90, 280 200" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,4"/>
    
    <!-- Tooth markers -->
    <ellipse cx="200" cy="105" rx="14" ry="10" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>
    <ellipse cx="180" cy="112" rx="12" ry="9" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>
    <ellipse cx="220" cy="112" rx="12" ry="9" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>
    <ellipse cx="158" cy="126" rx="11" ry="9" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>
    <ellipse cx="242" cy="126" rx="11" ry="9" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>
    <ellipse cx="138" cy="150" rx="14" ry="11" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>
    <ellipse cx="262" cy="150" rx="14" ry="11" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>
    <ellipse cx="124" cy="182" rx="15" ry="12" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>
    <ellipse cx="276" cy="182" rx="15" ry="12" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5"/>

    <!-- Caliper Crosshairs -->
    <line x1="138" y1="150" x2="262" y2="150" stroke="#14b8a6" stroke-width="1.5"/>
    <circle cx="138" cy="150" r="3" fill="#14b8a6"/>
    <circle cx="262" cy="150" r="3" fill="#14b8a6"/>
    <text x="200" y="144" fill="#5eead4" font-family="monospace" font-size="9" text-anchor="middle">Δ 47.8 mm</text>

    <!-- Overlay HUD Box -->
    <rect x="20" y="235" width="360" height="46" rx="6" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
    <text x="32" y="254" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="12">${label}</text>
    <text x="32" y="270" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10">${sublabel}</text>
    <text x="365" y="262" fill="#2dd4bf" font-family="monospace" font-size="10" text-anchor="end">${iconType}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_DENTAL_IMAGES = [
  {
    id: 'img-01',
    name: 'intraoral_maxillary_occlusal.raw',
    url: createClinicalImageSvg('Maxillary Arch Occlusal View', 'Polarized LED · 4K Photogrammetry', 'OCCLUSAL'),
    sizeBytes: 4820120,
    viewAngle: 'Maxillary Occlusal' as const,
    resolution: '3840 x 2160',
    timestamp: '2026-11-08 09:24:12'
  },
  {
    id: 'img-02',
    name: 'intraoral_frontal_retracted.raw',
    url: createClinicalImageSvg('Frontal Retracted View', 'Centric Occlusion · Cross-Polarized', 'ANTERIOR'),
    sizeBytes: 5120300,
    viewAngle: 'Frontal Retracted' as const,
    resolution: '3840 x 2160',
    timestamp: '2026-11-08 09:25:04'
  },
  {
    id: 'img-03',
    name: 'intraoral_mandibular_occlusal.raw',
    url: createClinicalImageSvg('Mandibular Arch Occlusal View', 'Mirror Deflector · Anti-Fog', 'MANDIBULAR'),
    sizeBytes: 4940800,
    viewAngle: 'Mandibular Occlusal' as const,
    resolution: '3840 x 2160',
    timestamp: '2026-11-08 09:26:15'
  },
  {
    id: 'img-04',
    name: 'intraoral_right_buccal_view.raw',
    url: createClinicalImageSvg('Right Buccal Class I View', 'Canine & Molar Intercuspation', 'BUCCAL-R'),
    sizeBytes: 4210400,
    viewAngle: 'Right Buccal' as const,
    resolution: '3840 x 2160',
    timestamp: '2026-11-08 09:27:30'
  },
  {
    id: 'img-05',
    name: 'intraoral_left_buccal_view.raw',
    url: createClinicalImageSvg('Left Buccal Occlusal View', 'Contralateral Alignment Scan', 'BUCCAL-L'),
    sizeBytes: 4350100,
    viewAngle: 'Left Buccal' as const,
    resolution: '3840 x 2160',
    timestamp: '2026-11-08 09:28:44'
  },
  {
    id: 'img-06',
    name: 'cbct_coronal_reconstructed.dcm',
    url: createClinicalImageSvg('CBCT Volumetric Slice #142', '0.075mm Voxel · Bone & Root Prominence', 'CBCT-SLICE'),
    sizeBytes: 12450800,
    viewAngle: 'CBCT Slice' as const,
    resolution: '1024 x 1024',
    timestamp: '2026-11-08 09:30:10'
  }
];

export const SAMPLE_DISPLACEMENTS: ToothDisplacement[] = [
  { toothId: 'tooth_11', fdiNumber: 11, universalNumber: 8, name: 'Maxillary Right Central Incisor', dxMm: -0.35, dyMm: 0.42, dzMm: -0.15, rotationDeg: 2.1, netDisplacementMm: 0.56, status: 'achieved' },
  { toothId: 'tooth_21', fdiNumber: 21, universalNumber: 9, name: 'Maxillary Left Central Incisor', dxMm: 0.28, dyMm: 0.38, dzMm: -0.10, rotationDeg: -1.8, netDisplacementMm: 0.48, status: 'achieved' },
  { toothId: 'tooth_12', fdiNumber: 12, universalNumber: 7, name: 'Maxillary Right Lateral Incisor', dxMm: -0.85, dyMm: 0.65, dzMm: -0.30, rotationDeg: 4.8, netDisplacementMm: 1.11, status: 'deviating' },
  { toothId: 'tooth_22', fdiNumber: 22, universalNumber: 10, name: 'Maxillary Left Lateral Incisor', dxMm: 0.72, dyMm: 0.58, dzMm: -0.22, rotationDeg: -3.9, netDisplacementMm: 0.95, status: 'achieved' },
  { toothId: 'tooth_13', fdiNumber: 13, universalNumber: 6, name: 'Maxillary Right Canine', dxMm: -0.40, dyMm: 0.22, dzMm: 0.12, rotationDeg: 3.2, netDisplacementMm: 0.47, status: 'planned' },
  { toothId: 'tooth_23', fdiNumber: 23, universalNumber: 11, name: 'Maxillary Left Canine', dxMm: 0.35, dyMm: 0.20, dzMm: 0.10, rotationDeg: -2.7, netDisplacementMm: 0.41, status: 'planned' },
  { toothId: 'tooth_14', fdiNumber: 14, universalNumber: 5, name: 'Maxillary Right 1st Premolar', dxMm: -0.15, dyMm: 0.12, dzMm: 0.05, rotationDeg: 0.8, netDisplacementMm: 0.20, status: 'achieved' },
  { toothId: 'tooth_24', fdiNumber: 24, universalNumber: 12, name: 'Maxillary Left 1st Premolar', dxMm: 0.18, dyMm: 0.10, dzMm: 0.04, rotationDeg: -0.9, netDisplacementMm: 0.21, status: 'achieved' },
  { toothId: 'tooth_16', fdiNumber: 16, universalNumber: 3, name: 'Maxillary Right 1st Molar', dxMm: -0.05, dyMm: 0.08, dzMm: 0.00, rotationDeg: 0.3, netDisplacementMm: 0.09, status: 'achieved' },
  { toothId: 'tooth_26', fdiNumber: 26, universalNumber: 14, name: 'Maxillary Left 1st Molar', dxMm: 0.04, dyMm: 0.06, dzMm: 0.01, rotationDeg: -0.2, netDisplacementMm: 0.07, status: 'achieved' },
  { toothId: 'tooth_31', fdiNumber: 31, universalNumber: 24, name: 'Mandibular Left Central Incisor', dxMm: 0.45, dyMm: -0.32, dzMm: 0.18, rotationDeg: -2.4, netDisplacementMm: 0.58, status: 'achieved' },
  { toothId: 'tooth_41', fdiNumber: 41, universalNumber: 25, name: 'Mandibular Right Central Incisor', dxMm: -0.42, dyMm: -0.30, dzMm: 0.15, rotationDeg: 2.1, netDisplacementMm: 0.53, status: 'achieved' },
  { toothId: 'tooth_32', fdiNumber: 32, universalNumber: 23, name: 'Mandibular Left Lateral Incisor', dxMm: 0.82, dyMm: -0.45, dzMm: 0.25, rotationDeg: -4.1, netDisplacementMm: 0.96, status: 'deviating' },
  { toothId: 'tooth_42', fdiNumber: 42, universalNumber: 26, name: 'Mandibular Right Lateral Incisor', dxMm: -0.76, dyMm: -0.40, dzMm: 0.20, rotationDeg: 3.8, netDisplacementMm: 0.88, status: 'achieved' }
];

export const DEFAULT_PROCESSING_STAGES: ProcessingStage[] = [
  {
    id: 'stage_1',
    name: 'Image Validation',
    description: 'Integrity checking, EXIF metadata extraction, resolution and lighting exposure validation.',
    status: 'completed',
    progressPercent: 100,
    durationSeconds: 1.4,
    logMessage: '6 dental intraoral and volumetric frames passed quality threshold (SNR > 38.4 dB).'
  },
  {
    id: 'stage_2',
    name: 'Image Preprocessing',
    description: 'Specular reflection attenuation, contrast calibration, distortion removal, and color normalization.',
    status: 'completed',
    progressPercent: 100,
    durationSeconds: 2.2,
    logMessage: 'Normalized white balance across 6 image series; saliva glare attenuation complete.'
  },
  {
    id: 'stage_3',
    name: 'Feature Detection and Matching',
    description: 'Deep neural keypoint extraction, multi-view stereo correspondence, and camera pose triangulation.',
    status: 'completed',
    progressPercent: 100,
    durationSeconds: 4.8,
    logMessage: '14,820 correspondence keypoints detected; epipolar geometry converged with mean reprojection error 0.42 px.'
  },
  {
    id: 'stage_4',
    name: '3D Reconstruction',
    description: 'Volumetric neural radiance / dense point cloud triangulation and Poisson surface mesh synthesis.',
    status: 'completed',
    progressPercent: 100,
    durationSeconds: 6.5,
    logMessage: 'Watertight surface mesh generated: 284,520 vertices, 568,910 polygonal faces.'
  },
  {
    id: 'stage_5',
    name: 'Tooth Segmentation',
    description: '3D instance segmentation separating individual crowns, roots, and gingival margin boundary lines.',
    status: 'completed',
    progressPercent: 100,
    durationSeconds: 3.9,
    logMessage: 'Identified 28 erupted anatomical teeth + gingival boundary. Mean segmentation confidence: 97.4%.'
  },
  {
    id: 'stage_6',
    name: 'Geometric Measurement',
    description: 'Arch widths, intercanine dimensions, overbite, overjet, Bolton analysis, and crown-to-root torque calculation.',
    status: 'completed',
    progressPercent: 100,
    durationSeconds: 2.1,
    logMessage: 'Computed 18 standardized orthodontic parameters and catenary arch curvature index.'
  },
  {
    id: 'stage_7',
    name: 'Results Generation',
    description: 'Compiling 3D mesh layers, heatmaps, clinical summary tables, and exportable digital assets.',
    status: 'completed',
    progressPercent: 100,
    durationSeconds: 1.1,
    logMessage: 'High-fidelity 3D model ready for clinical examination and comparative displacement inspection.'
  }
];

export const INITIAL_SCANS: DentalScan[] = [
  {
    id: 'DX-2026-0491',
    patientId: 'PT-88204',
    patientName: 'Marcus Vance',
    patientAge: 29,
    patientGender: 'Male',
    scanDate: '2026-11-08',
    archType: 'both',
    status: 'completed',
    operatorName: 'Dr. Aris Thorne, DDS',
    scannerModel: 'DENT-X Vision Pro 4K Intraoral Photogrammetry Rig',
    images: SAMPLE_DENTAL_IMAGES,
    teeth: generateTeethCatalog(),
    measurements: {
      intercanineDistanceMm: 34.2,
      intermolarWidthMm: 47.8,
      archPerimeterMm: 78.4,
      archDepthMm: 29.6,
      overbiteMm: 2.4,
      overjetMm: 2.1,
      crowdingSpacingIndexMm: -1.6,
      boltonRatioAnteriorPercent: 77.8,
      boltonRatioOverallPercent: 91.5
    },
    reconstructionQualityScore: 98.4,
    notes: 'Stage 12 Aligner progress check. Maxillary incisor torque improving; mild lateral incisor rotation remains.',
    isBaseline: false,
    baselineScanId: 'DX-2026-0490'
  },
  {
    id: 'DX-2026-0490',
    patientId: 'PT-88204',
    patientName: 'Marcus Vance',
    patientAge: 29,
    patientGender: 'Male',
    scanDate: '2026-05-14',
    archType: 'both',
    status: 'completed',
    operatorName: 'Dr. Aris Thorne, DDS',
    scannerModel: 'DENT-X Vision Pro 4K Intraoral Photogrammetry Rig',
    images: SAMPLE_DENTAL_IMAGES.slice(0, 4),
    teeth: generateTeethCatalog(),
    measurements: {
      intercanineDistanceMm: 32.8,
      intermolarWidthMm: 46.1,
      archPerimeterMm: 76.2,
      archDepthMm: 30.8,
      overbiteMm: 3.8,
      overjetMm: 3.5,
      crowdingSpacingIndexMm: -3.8,
      boltonRatioAnteriorPercent: 77.4,
      boltonRatioOverallPercent: 91.2
    },
    reconstructionQualityScore: 97.2,
    notes: 'Initial pre-orthodontic baseline. Moderate anterior crowding and exaggerated curve of Spee.',
    isBaseline: true
  },
  {
    id: 'DX-2026-0382',
    patientId: 'PT-74190',
    patientName: 'Elena Rostova',
    patientAge: 34,
    patientGender: 'Female',
    scanDate: '2026-11-04',
    archType: 'lower',
    status: 'completed',
    operatorName: 'Dr. Sarah Lin, DMD',
    scannerModel: 'TrueDepth Dental Optical System 3D',
    images: SAMPLE_DENTAL_IMAGES.slice(1, 4),
    teeth: generateTeethCatalog().filter(t => t.arch === 'lower'),
    measurements: {
      intercanineDistanceMm: 26.5,
      intermolarWidthMm: 41.2,
      archPerimeterMm: 68.9,
      archDepthMm: 26.4,
      overbiteMm: 2.0,
      overjetMm: 1.8,
      crowdingSpacingIndexMm: -2.4,
      boltonRatioAnteriorPercent: 76.9,
      boltonRatioOverallPercent: 90.8
    },
    reconstructionQualityScore: 96.5,
    notes: 'Lingual mandibular crowding evaluation. Third molars impacted.',
    isBaseline: true
  },
  {
    id: 'DX-2026-0315',
    patientId: 'PT-63012',
    patientName: 'David Chen',
    patientAge: 46,
    patientGender: 'Male',
    scanDate: '2026-10-28',
    archType: 'upper',
    status: 'completed',
    operatorName: 'Dr. Aris Thorne, DDS',
    scannerModel: 'DENT-X Vision Pro 4K Intraoral Photogrammetry Rig',
    images: SAMPLE_DENTAL_IMAGES.slice(0, 3),
    teeth: generateTeethCatalog().filter(t => t.arch === 'upper'),
    measurements: {
      intercanineDistanceMm: 35.0,
      intermolarWidthMm: 48.5,
      archPerimeterMm: 80.1,
      archDepthMm: 31.0,
      overbiteMm: 1.8,
      overjetMm: 1.6,
      crowdingSpacingIndexMm: 0.4,
      boltonRatioAnteriorPercent: 78.1,
      boltonRatioOverallPercent: 91.8
    },
    reconstructionQualityScore: 99.1,
    notes: 'Pre-prosthetic crown preparation for tooth #16.',
    isBaseline: true
  },
  {
    id: 'DX-2026-0502',
    patientId: 'PT-99410',
    patientName: 'Claire Beaumont',
    patientAge: 22,
    patientGender: 'Female',
    scanDate: '2026-11-09',
    archType: 'both',
    status: 'processing',
    operatorName: 'Dental Technologist Ryan K.',
    scannerModel: 'DENT-X Vision Pro 4K Intraoral Photogrammetry Rig',
    images: SAMPLE_DENTAL_IMAGES.slice(0, 5),
    teeth: generateTeethCatalog(),
    measurements: {
      intercanineDistanceMm: 33.6,
      intermolarWidthMm: 47.1,
      archPerimeterMm: 77.2,
      archDepthMm: 28.9,
      overbiteMm: 2.2,
      overjetMm: 2.0,
      crowdingSpacingIndexMm: -1.2,
      boltonRatioAnteriorPercent: 77.5,
      boltonRatioOverallPercent: 91.4
    },
    reconstructionQualityScore: 94.0,
    notes: 'Volumetric scan running through pipeline stage 4 (3D reconstruction).',
    isBaseline: false
  }
];
