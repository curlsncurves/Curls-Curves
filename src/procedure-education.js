const asps = 'https://www.plasticsurgery.org/cosmetic-procedures/';
const hair = ['NHS · Hair transplant', 'https://www.nhs.uk/tests-and-treatments/cosmetic-procedures/cosmetic-surgery/hair-transplant/'];
const intimate = ['ACOG · Elective genital cosmetic surgery', 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2020/01/elective-female-genital-cosmetic-surgery'];
const body = ['ASPS · Body contouring', asps + 'body-contouring'];
const fat = ['ASPS · Fat grafting guidance', 'https://www.plasticsurgery.org/documents/medical-professionals/health-policy/guiding-principles/asps-fat-transfer-graft-guiding-principles.pdf'];
const nose = ['NHS · Nose reshaping', 'https://www.nhs.uk/tests-and-treatments/cosmetic-procedures/cosmetic-surgery/nose-reshaping-rhinoplasty/'];

const images = {
  "lip-lift": [
    "/reference-site/85ad3c78891cbf6992dd.webp",
    "Upper lip and surrounding facial anatomy",
    "photo"
  ],
  "cheek-liposuction": [
    "/reference-site/7f6d238405993213c1bc.webp",
    "Cheek and lower facial contour",
    "photo"
  ],
  "asian-blepharoplasty-double-eyelid-surgery": [
    "/reference-site/30ffeeac6f7b0cffb337.webp",
    "Upper eyelid crease",
    "photo"
  ],
  "abdominoplasty": [
    "/reference-site/d72f358bae3b2af90faf.webp",
    "Abdominal contour",
    "photo"
  ],
  "thighplasty": [
    "/reference-site/dcc66c8bf32d0b4c7cc6.webp",
    "Thigh area",
    "photo"
  ],
  "arm-lift": [
    "/reference-site/42af61b49fda09de38b7.webp",
    "Upper arm area",
    "photo"
  ],
  "upper-body-lift": [
    "/reference-site/78b472cdba5974234fee.webp",
    "Upper back contour",
    "photo"
  ],
  "lower-body-lift": [
    "/reference-site/d7dea69c3ce18e76c97c.webp",
    "Waist and lower trunk contour",
    "photo"
  ],
  "fat-grafting-surgery": [
    "/reference-site/f2dbf2242fd735735520.webp",
    "Fat grafting treatment illustration",
    "photo"
  ],
  "breast-augmentation-by-fat-grafting": [
    "/reference-site/4302a89d2712a07de40d.webp",
    "Breast fat transfer treatment illustration",
    "photo"
  ],
  "dimple-creation": [
    "/media/education/dimple.webp",
    "Face diagram highlighting the cheek",
    "diagram"
  ],
  "inverted-nipple-surgery": [
    "/media/education/nipple-inversion.webp",
    "Cross-section showing the inward projection of an inverted nipple",
    "diagram"
  ],
  "buttock-fat-grafting": [
    "/media/education/buttock.webp",
    "Diagram highlighting the gluteal region",
    "diagram"
  ],
  "hair-transplantation": [
    "/media/education/portrait-male.webp",
    "Illustrative three-quarter portrait with visible scalp hairline",
    "portrait"
  ],
  "fue-hair-transplant": [
    "/media/education/portrait-male.webp",
    "Illustrative portrait showing the temple and front hairline",
    "portrait"
  ],
  "male-hair-transplant": [
    "/media/education/portrait-male.webp",
    "Illustrative portrait of a man with a visible front hairline",
    "portrait"
  ],
  "female-hair-transplant": [
    "/media/education/portrait-female.webp",
    "Illustrative portrait of a woman with a visible central hair part",
    "portrait"
  ],
  "beard-transplantation": [
    "/media/education/portrait-male.webp",
    "Illustrative three-quarter portrait showing the beard and jawline",
    "portrait"
  ],
  "eyebrow-hair-transplant": [
    "/media/education/portrait-female.webp",
    "Illustrative three-quarter portrait showing the eyebrows",
    "portrait"
  ],
  "moustache-transplantation": [
    "/media/education/portrait-male.webp",
    "Illustrative portrait showing facial hair along the upper lip",
    "portrait"
  ],
  "hymenoplasty-surgery": [
    "/media/education/vaginal-opening.webp",
    "Simplified pelvic anatomy diagram highlighting the vaginal opening",
    "diagram"
  ],
  "vagina-tightening-surgery": [
    "/media/education/pelvic-floor.webp",
    "Simplified pelvic anatomy diagram highlighting pelvic floor support",
    "diagram"
  ],
  "lipoma-surgery": [
    "/media/education/lipoma.webp",
    "Cross-section diagram showing a fatty lump beneath the skin",
    "diagram"
  ]
};

function page(category, image, overview, assessment, recovery, risks, ...sources) {
  return { category, image: images[image], overview, assessment, recovery, risks, sources };
}

export const procedureEducation = {
  'lip-lift': page('Facial procedures', 'lip-lift',
    'A lip lift changes the position of the upper lip. Some techniques shorten the distance between the nose and upper lip, increasing the amount of visible pink lip.',
    'Discuss your lip proportions, tooth show at rest and when smiling, and how a lift compares with filler or leaving the area untreated.',
    'Swelling and bruising can obscure the early result. Ask where the incision will sit and how scar appearance may change as it matures.',
    'Possible risks include a visible scar, asymmetry, altered sensation, and wound-healing problems.',
    ['Cleveland Clinic · Lip lift', 'https://my.clevelandclinic.org/cosmetic-plastic-surgery/procedures/lip-lift']),
  'dimple-creation': page('Facial procedures', 'dimple-creation',
    'Dimple creation surgery, also called dimpleplasty, creates a small cheek indentation, typically through an incision inside the mouth.',
    'Discuss the location when your face is at rest and when smiling, whether you want one or two dimples, and the possibility of an uneven result.',
    'Local swelling can change the appearance early on. The indentation may look more pronounced before tissues settle.',
    'Potential complications include infection, bleeding, asymmetry, or a deeper or more persistent indentation than expected.',
    ['Clinical study · Facial dimple creation', 'https://pubmed.ncbi.nlm.nih.gov/32971599/']),
  'cheek-liposuction': page('Facial procedures', 'cheek-liposuction',
    'Cheek fullness can reflect several structures, including superficial fat, the deeper buccal fat pad, muscle, and bone. Treatment depends on what is causing the fullness.',
    'Ask whether the area you want to change has removable superficial fat and how that differs from buccal fat removal. Review how facial volume may change with age.',
    'Temporary swelling, bruising, or numbness can make early contour changes hard to judge. Ask how your recovery will be monitored.',
    'Possible risks include uneven contours, infection, loss of volume, and injury to nearby structures. The specific risks depend on the method and anatomy.',
    ['ASPS · Liposuction', asps + 'liposuction'], ['Cleveland Clinic · Buccal fat removal', 'https://my.clevelandclinic.org/health/treatments/23396-buccal-fat-removal']),
  'asian-blepharoplasty-double-eyelid-surgery': page('Facial procedures', 'asian-blepharoplasty-double-eyelid-surgery',
    'Double eyelid surgery creates or defines an upper eyelid crease. The planned crease height and shape depend on eyelid anatomy and personal preference.',
    'Discuss eye dryness, previous eye surgery, eyelid muscle function, and how crease design may affect your appearance when your eyes are open and closed.',
    'Swelling, bruising, and temporary differences between the eyelids can occur as they heal. Ask when to resume contact lenses and regular activities.',
    'Possible risks include dry eyes, difficulty closing the eyelids, asymmetry, scarring, and bleeding.',
    ['ASPS · Eyelid surgery', asps + 'eyelid-surgery']),
  'inverted-nipple-surgery': page('Breast procedures', 'inverted-nipple-surgery',
    'A nipple that has always turned inward may be a normal variation. Correction aims to change how far it projects.',
    'A newly inverted nipple, especially on one side, needs medical assessment before cosmetic treatment is considered. Discuss future breastfeeding and any changes in sensation.',
    'Ask about dressings, follow-up, and how long tenderness or swelling may last.',
    'Inversion can recur. Surgery can alter nipple sensation and may affect the ability to breastfeed.',
    ['NHS Scotland · Inverted nipple surgery', 'https://admin.rightdecisions.scot.nhs.uk/national-referral-protocol/nhs-scotland-referral-protocol/breast-surgery/inverted-nipple-surgery/']),
  abdominoplasty: page('Body contouring', 'abdominoplasty',
    'Abdominoplasty, or a tummy tuck, removes excess abdominal skin and fat. It may also address separation or weakness of the abdominal wall as part of the operation.',
    'Discuss weight stability, pregnancy plans, prior abdominal surgery, and the location and length of the expected scar.',
    'Recovery can affect standing upright, lifting, and returning to work. Ask about home support, wound care, and activity restrictions.',
    'Risks include fluid buildup, infection, delayed healing, numbness, scarring, and blood clots.',
    ['ASPS · Tummy tuck', asps + 'tummy-tuck']),
  thighplasty: page('Body contouring', 'thighplasty',
    'A thigh lift reduces loose tissue around the thighs. The treatment area and incision pattern depend on whether excess skin is concentrated in the inner or outer thigh.',
    'Discuss skin laxity, weight stability, prior scars, and how a thigh lift compares with liposuction in your case.',
    'Ask when you can comfortably walk, return to work, and resume exercise. Incisions in skin folds may need particular attention during healing.',
    'Risks include wound separation, fluid collections, infection, changes in sensation, scarring, and blood clots.',
    ['ASPS · Thigh lift', asps + 'thigh-lift']),
  'arm-lift': page('Body contouring', 'arm-lift',
    'An arm lift, or brachioplasty, removes excess skin from the upper arms. Some plans also remove fat to improve the contour.',
    'Ask whether excess skin or fat is the main concern, and discuss where the incision would run and how visible the scar may be.',
    'Plan for temporary restrictions on lifting and reaching. Ask about incision care and when to resume exercise.',
    'Potential problems include a noticeable scar, fluid buildup, poor wound healing, numbness, and infection.',
    ['ASPS · Arm lift', asps + 'arm-lift']),
  'upper-body-lift': page('Body contouring', 'upper-body-lift',
    'Upper body contouring after major weight loss can address loose tissue around the upper back, chest, or arms. It can involve more than one procedure.',
    'Identify the areas that matter most. The surgeon can assess scar placement, whether to stage treatment, and whether your nutrition and weight are stable.',
    'Healing depends on the combination and extent of surgery. Ask about help at home, movement restrictions, and follow-up.',
    'Larger incisions can increase wound-care needs. Risks include fluid accumulation, infection, scarring, wound separation, and blood clots.', body),
  'lower-body-lift': page('Body contouring', 'lower-body-lift',
    'A lower body lift treats loose tissue around the waist and may also address the lower abdomen, buttocks, hips, and outer thighs.',
    'Compare a circumferential lift with a more limited approach. Discuss expected scars, weight stability, and whether staging treatment would be appropriate.',
    'Recovery requires planning for mobility, wound care and support at home. A clinician should explain how clot risk is managed.',
    'Risks include poor healing, fluid collections, infection, changes in sensation, noticeable scars, and blood clots.',
    ['ASPS · Body lift risks', asps + 'body-lift/safety'], body),
  'fat-grafting-surgery': page('Body contouring', 'fat-grafting-surgery',
    'Fat grafting uses fat from one area of the body to add volume to another. The amount that remains varies, and additional treatment can be needed.',
    'Review the target area, donor fat availability, alternatives, and what degree of volume change is realistic.',
    'Both the donor and treated areas can swell or bruise. The final contour takes time to assess.',
    'Risks vary by site and include asymmetry, infection, fat necrosis, volume loss, and site-specific complications.', fat),
  'breast-augmentation-by-fat-grafting': page('Breast procedures', 'breast-augmentation-by-fat-grafting',
    'Fat transfer breast augmentation uses fat collected elsewhere on the body to add volume to the breasts. The achievable increase depends on anatomy and donor fat.',
    'Discuss size goals, comparison with implants, existing breast symptoms, screening history, and whether more than one session may be needed.',
    'Soreness and swelling can affect the breasts and donor area. Tell your breast imaging team about prior fat transfer.',
    'Risks include fat necrosis, cysts, calcifications, infection, or loss of some transferred volume.',
    ['ASPS · Breast fat transfer risks', asps + 'fat-transfer-breast-augmentation/safety']),
  'buttock-fat-grafting': page('Body contouring', 'buttock-fat-grafting',
    'Buttock fat grafting transfers fat from elsewhere in the body to change buttock volume or shape. It carries significant safety risks.',
    'Discuss the surgeon’s experience, the facility, safety protocols, your individual risk, and alternatives before deciding.',
    'Ask for a written recovery plan covering mobility, positioning, follow-up, and which symptoms require urgent care.',
    'A serious risk is fat embolism, which can be fatal. Other complications include infection, fluid collections and uneven contours.',
    ['ASPS and partner societies · Gluteal fat grafting safety', 'https://www.plasticsurgery.org/for-medical-professionals/publications/psn-extra/news/gluteal-fat-grafting-a-joint-safety-statement']),
  'hair-transplantation': page('Hair restoration', 'hair-transplantation',
    'A hair transplant moves hair follicles from a donor area to a thinning area. The amount and quality of donor hair limit coverage.',
    'Have the cause of hair loss assessed first. Discuss whether the loss is stable, what nonsurgical options may help, and how future thinning affects the plan.',
    'Scabbing and swelling can occur. Transplanted hairs often shed before new growth becomes visible over the following months.',
    'Risks include bleeding, infection, scars, poor graft growth, and continued loss of surrounding natural hair.', hair),
  'fue-hair-transplant': page('Hair restoration', 'fue-hair-transplant',
    'Follicular unit extraction, or FUE, collects small follicular units individually from a donor area and places them where more coverage is desired.',
    'Discuss donor density, planned coverage, the possibility of visible donor thinning, and how FUE compares with strip harvesting.',
    'Ask when you can wash your scalp, resume exercise and use styling products. Early shedding does not by itself indicate failure.',
    'FUE can leave small donor scars. Other risks include infection, bleeding, reduced graft growth, and an uneven result.', hair),
  'male-hair-transplant': page('Hair restoration', 'male-hair-transplant',
    'Hair transplantation may be considered for certain patterns of hair loss, such as receding temples or crown thinning, when sufficient donor hair is available.',
    'Ask how the proposed hairline will work if hair loss continues. Discuss medical treatment and how much coverage is realistic from your donor supply.',
    'Growth is gradual after recovery. More than one visit or staged treatment may be appropriate depending on coverage goals.',
    'Possible risks include donor scarring, infection, poor graft growth, and thinning around transplanted areas.', hair),
  'female-hair-transplant': page('Hair restoration', 'female-hair-transplant',
    'Transplant suitability depends on the cause and distribution of thinning. Diffuse hair loss can also affect the area that would supply grafts.',
    'Discuss when thinning began, recent health changes, medicines, and whether investigation or medical treatment should come first.',
    'Ask how long visible healing and shedding may last. Changes in density take months to assess.',
    'Risks include scarring, infection, reduced graft growth, and continued thinning of untreated hair.', hair),
  'beard-transplantation': page('Hair restoration', 'beard-transplantation',
    'A beard transplant places donor follicles in areas of sparse facial hair. Hair direction and the border of the beard affect the result.',
    'Discuss the cause of patchiness or scarring first. Ask about donor supply, target density and how scalp-derived hair may differ from existing facial hair.',
    'Small crusts and temporary redness can occur. Ask when shaving and normal skin care can resume.',
    'Potential risks include infection, scarring, uneven growth, and a visible mismatch in hair direction or texture.', hair),
  'eyebrow-hair-transplant': page('Hair restoration', 'eyebrow-hair-transplant',
    'An eyebrow transplant adds donor follicles to thin or missing areas. Planning focuses on the brow outline and the angle of individual hairs.',
    'Ask whether there is an ongoing medical cause of loss, how symmetric an outcome is realistic, and whether transplanted hairs will need trimming.',
    'Temporary swelling and fine crusting may occur. Growth and direction are usually assessed over time as the area heals.',
    'Possible problems include uneven growth, altered hair direction, scars, infection, and failure of some grafts to take.', hair),
  'moustache-transplantation': page('Hair restoration', 'moustache-transplantation',
    'A moustache transplant places donor follicles in sparse areas above the upper lip. Direction and density affect how the transplanted hair blends with existing hair.',
    'Discuss the cause of hair loss, any prior scar, the preferred border, and the expected maintenance of donor hair.',
    'Ask when to shave again and what care is needed around the grafts while the skin heals.',
    'Possible risks include scarring, infection, uneven density, and hair that grows at a different angle than planned.', hair),
  'hymenoplasty-surgery': page('Intimate health', 'hymenoplasty-surgery',
    'Hymenoplasty alters hymenal tissue. The appearance of this tissue cannot establish a person’s sexual history, and surgery cannot change that history.',
    'A confidential assessment can help distinguish a medical concern from a cosmetic request and make space to discuss personal safety or pressure from others.',
    'Ask about alternatives, how follow-up would be arranged, and when symptoms require assessment.',
    'Evidence for elective genital cosmetic procedures is limited. Possible complications include pain, infection, bleeding, scarring, and changes in sensation.',
    intimate, ['WHO · Eliminating virginity testing', 'https://www.who.int/publications/i/item/eliminating-virginity-testing-an-interagency-statement']),
  'vagina-tightening-surgery': page('Intimate health', 'vagina-tightening-surgery',
    'Vaginal tightening can describe different procedures. Symptoms such as pressure, leakage, or pain warrant an assessment of their cause before treatment is chosen.',
    'A gynaecological or pelvic-floor assessment can help identify relevant alternatives, including pelvic-floor physiotherapy where appropriate.',
    'If surgery is being considered for a diagnosed condition, ask about follow-up, wound care and when to resume daily activity.',
    'Evidence for elective cosmetic tightening is limited. Possible risks include pain, infection, scarring, altered sensation, and pain with sex.',
    ['ACOG · Vaginal rejuvenation FAQ', 'https://www.acog.org/womens-health/faqs/vaginal-rejuvenation-labiaplasty-and-other-female-genital-cosmetic-surgery'], intimate),
  'lipoma-surgery': page('Skin and soft tissue', 'lipoma-surgery',
    'A lipoma is a benign lump made of fatty tissue. Many need no treatment, but a new, changing or symptomatic lump should be assessed before assuming it is a lipoma.',
    'Tell the clinician when the lump appeared, whether it has grown or hurts, and whether it feels fixed. An examination and sometimes imaging help guide next steps.',
    'If removal is appropriate, ask about the incision, dressing, follow-up, and whether the tissue will be sent for examination.',
    'Removal can leave a scar and carries risks such as bleeding, infection, tenderness, and recurrence.',
    ['NHS · Lipoma', 'https://www.nhs.uk/conditions/lipoma/']),
};

const aliases = {
  'dimple-creation-surgery': 'dimple-creation',
  'cheek-liposuction-in': 'cheek-liposuction',
  'asian-blepharoplasty': 'asian-blepharoplasty-double-eyelid-surgery',
  'tummy-tuck': 'abdominoplasty',
  'thigh-lift': 'thighplasty',
  'body-fat-transfer': 'fat-grafting-surgery',
  'breast-fat-transfer': 'breast-augmentation-by-fat-grafting',
  'breast-augmentation-with-fat-transfer': 'breast-augmentation-by-fat-grafting',
  'buttock-fat-transfer': 'buttock-fat-grafting',
};

export function educationFor(value) {
  const slug = value.split('/').filter(Boolean).at(-1)?.replace(/\.(?:php|html)$/, '')
    .replace(/^service-/, '').replace(/(?:-in)?-bangalore$/, '');
  return procedureEducation[aliases[slug] || slug];
}

export const rhinoplastyFaq = [
  'Rhinoplasty changes the shape or size of the nose by adjusting its supporting structures. The surgical plan depends on the anatomy and goals.',
  'Nose reshaping is another term for rhinoplasty. A surgeon may change the bridge, tip, or other structures depending on what is being treated.',
  'Yes. Nose job is the informal name for rhinoplasty.',
  'Functional surgery can improve breathing when there is a correctable structural obstruction. An examination helps establish what is causing the symptoms.',
  'Initial recovery varies. Bruising and swelling can persist for weeks, and some patients need up to two weeks away from work.',
  'Early changes become more visible as swelling subsides. Subtle refinement can continue for months.',
  'Closed surgery places cuts inside the nose. Open surgery can leave a small external scar between the nostrils. Scar appearance varies.',
  'Yes. Septoplasty can be combined with rhinoplasty when the nasal septum needs to be addressed.',
  'Ask about the surgeon’s training, experience with your specific concerns, safety practices, and follow-up care.',
  'Surgery changes the structure of the nose, but appearance can continue to evolve with healing, ageing, or injury.',
  'That depends on your work and recovery. Physically demanding jobs can require longer restrictions than desk work.',
  'Risks include bleeding, infection, breathing changes, scarring, and a result that may require revision. Ask which risks are most relevant to you.',
  'Use the contact options below to reach the clinic and ask about consultation availability.',
];
export { nose as rhinoplastySource };
