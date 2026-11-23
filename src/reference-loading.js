const pages = new Map();
const styles = new Map();

export async function prepareReferencePage(url) {
  if (!pages.has(url)) {
    if (pages.size >= 12) pages.delete(pages.keys().next().value);
    const request = fetch(url, { signal: AbortSignal.timeout(12000) }).then(response => {
      if (!response.ok) throw new Error('Page unavailable');
      return response.json();
    }).catch(error => {
      if (pages.get(url) === request) pages.delete(url);
      throw error;
    });
    pages.set(url, request);
  }
  const page = await pages.get(url);
  await prepareStyle(page.style);
  return page;
}

function prepareStyle(url) {
  if (styles.has(url)) return styles.get(url);
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = url;
  const loaded = new Promise(resolve => {
    const timeout = window.setTimeout(finish, 1500);
    function finish() {
      window.clearTimeout(timeout);
      link.removeEventListener('load', finish);
      link.removeEventListener('error', finish);
      resolve();
    }
    link.addEventListener('load', finish);
    link.addEventListener('error', finish);
    document.head.append(link);
  });
  styles.set(url, loaded);
  return loaded;
}
