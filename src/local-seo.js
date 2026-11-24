export const localPages = [
  {
    path: '/',
    topics: ['Plastic & Cosmetic Surgery Clinic in Bangalore'],
    seoTitle: 'Plastic & Cosmetic Surgery Clinic in Bangalore | Curls & Curves',
    description: 'Visit Curls & Curves Cosmetic Surgery Centre in Vijayanagar, Bangalore. Explore procedures, meet Dr Girish A C and request a consultation.',
  },
  {
    path: '/about-doctor.php',
    topics: ['Plastic Surgeon in Bangalore', 'Cosmetic Surgeon in Bangalore'],
    seoTitle: 'Plastic & Cosmetic Surgeon in Bangalore | Dr Girish A C',
    description: 'Meet Dr Girish A C at Curls & Curves in Bangalore. Learn about his training and how to request a plastic or cosmetic surgery consultation.',
  },
  {
    path: '/liposuction-in-bangalore',
    topics: ['Liposuction in Bangalore'],
    description: 'Explore liposuction options at Curls & Curves in Bangalore. Find information about body contouring and request a consultation.',
  },
  {
    path: '/tummy-tuck-in-bangalore',
    topics: ['Tummy Tuck in Bangalore'],
    description: 'Learn about tummy tuck surgery (abdominoplasty) at Curls & Curves in Bangalore and find out how to request a consultation.',
  },
  {
    path: '/gynecomastia-surgery-in-bangalore',
    topics: ['Gynecomastia Surgery in Bangalore'],
    description: 'Explore gynecomastia surgery at Curls & Curves in Bangalore and request a consultation to discuss your questions with the surgeon.',
  },
  {
    path: '/silicone-breast-implants-in-bangalore',
    topics: ['Breast Implant Surgery in Bangalore'],
    description: 'Explore silicone breast implants at Curls & Curves in Bangalore and request a consultation to discuss breast augmentation options.',
  },
  {
    path: '/service-rhinoplasty.php',
    topics: ['Rhinoplasty in Bangalore'],
    description: 'Explore rhinoplasty at Curls & Curves in Bangalore. Read about nose surgery options and request a consultation with the surgeon.',
  },
  {
    path: '/hair-transplantation-in-bangalore',
    topics: ['Hair Transplant in Bangalore'],
    description: 'Explore hair transplantation at Curls & Curves in Bangalore, including FUE and options for men and women. Find out how to request a consultation.',
  },
].map(page => ({ ...page, seoTitle: page.seoTitle || page.topics[0] + ' | Curls & Curves' }));

export const findLocalPage = path => localPages.find(page => page.path === (path === '/index.php' ? '/' : path));
