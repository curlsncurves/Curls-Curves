import catalog from './catalog.json' with { type: 'json' };
import routes from './reference-routes.json' with { type: 'json' };

const publishedPaths = {
  'breast-augmentation-by-fat-grafting': '/breast-augmentation-with-fat-transfer-in-bangalore',
  'brow-lift': '/brow-lift-forehead-lift-in-bangalore',
  'buttock-fat-grafting': '/buttock-fat-transfer-in-bangalore',
  'deep-plane-facelift-facial-rejuvenation': '/deep-plane-facelift-in-bangalore',
  'deviated-septum': '/deviated-septum-treatment-in-bangalore',
  'dimple-creation': '/dimple-creation-surgery-in-bangalore',
  'gynecomastia': '/gynecomastia-surgery-in-bangalore',
  'revision-rhinoplasty': '/revision-rhinoplasty-surgery-in-bangalore',
  'rhinoplasty': '/service-rhinoplasty.php',
  'septoplasty': '/septoplasty-surgery-in-bangalore',
};

export function procedurePath(slug) {
  const detail = '/procedure/' + slug;
  return [publishedPaths[slug], detail, '/' + slug + '-in-bangalore', detail + '-in-bangalore']
    .find(path => path && Object.hasOwn(routes, path)) || detail;
}

export function catalogProcedure(path) {
  const slug = path.replace(/\/$/, '').replace(/\.html$/, '').match(/^\/procedure\/([^/]+)$/)?.[1];
  return catalog.procedures.find(item => item.slug === slug);
}
