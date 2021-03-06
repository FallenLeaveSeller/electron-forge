import * as fs from 'fs-extra';
import Glob from 'glob';
import * as path from 'path';
import { getPackageInfo } from './utils';

const DOCS_PATH = path.resolve(__dirname, '..', 'docs');

(async () => {
  const packages = await getPackageInfo();

  let copiedAssets = false;
  await fs.remove(path.resolve(DOCS_PATH, 'assets'));
  await fs.remove(path.resolve(DOCS_PATH));
  for (const p of packages) {
    const dir = p.path;
    const subPath = path.posix.join(path.basename(path.dirname(dir)), path.basename(dir));
    const docPath = path.resolve(DOCS_PATH, subPath);
    if (!copiedAssets) {
      await fs.copy(path.resolve(dir, 'doc', 'assets'), path.resolve(DOCS_PATH, 'assets'));
      copiedAssets = true;
    }
    await fs.copy(path.resolve(dir, 'doc'), docPath);
    await fs.remove(path.resolve(docPath, 'assets'));

    // Rewrite assets path to allow better cross-dep caching
    // otherwise each module will have it's own unique JS file :(
    const htmlFiles = await new Promise<string[]>(resolve => Glob(path.resolve(docPath, '**', '*.html'), (e, l) => resolve(l)));
    for (const htmlFile of htmlFiles) {
      const content = await fs.readFile(htmlFile, 'utf8');
      const relative = path.relative(path.resolve(DOCS_PATH, subPath), path.dirname(htmlFile));
      await fs.writeFile(htmlFile, content
        .replace(/=\"[^"]*assets\//gi, '="/assets/')
        .replace(/(<a href="(?!(?:https?:\/\/)|\/|\#))(.+?)"/gi, (subString, m1: string, m2: string) => {
          return `${m1}/${path.posix.join(subPath, relative, m2)}"`;
        }),
      );
    }
  }
})();
