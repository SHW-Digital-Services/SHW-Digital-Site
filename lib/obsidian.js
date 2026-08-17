import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import wikiLinkPlugin from 'remark-wiki-link';

const kbDirectory = path.join(process.cwd(), 'KnowledgeBase');
const markdownExtensionPattern = /(\.md)+$/i;
const externalLinkPattern = /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i;

function stripMarkdownExtensions(fileName) {
  return fileName.replace(markdownExtensionPattern, '');
}

function slugify(value) {
  return String(value || '')
    .replace(markdownExtensionPattern, '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategory(category) {
  if (Array.isArray(category)) {
    return category.find((item) => typeof item === 'string' && item.trim())?.trim() || '';
  }

  return typeof category === 'string' ? category.trim() : '';
}

function getFallbackCategory(filePath) {
  const relativePath = path.relative(kbDirectory, filePath);
  const category = relativePath.split(path.sep)[0];

  if (!category || category === relativePath || category.toLowerCase() === 'temps') {
    return '';
  }

  return category;
}

function normalizeFilePath(filePath) {
  return path.normalize(filePath).toLowerCase();
}

function stripUrlFragment(url) {
  const hashIndex = url.indexOf('#');

  if (hashIndex === -1) {
    return {
      pathPart: url,
      fragment: '',
    };
  }

  return {
    pathPart: url.slice(0, hashIndex),
    fragment: url.slice(hashIndex),
  };
}

function getDocumentByRelativeLink(url, sourceDocument, allDocuments) {
  if (!sourceDocument?.filePath || externalLinkPattern.test(url)) {
    return null;
  }

  const { pathPart } = stripUrlFragment(url);

  if (!markdownExtensionPattern.test(pathPart)) {
    return null;
  }

  const decodedPath = decodeURIComponent(pathPart);
  const targetPath = path.resolve(path.dirname(sourceDocument.filePath), decodedPath);
  const normalizedTargetPath = normalizeFilePath(targetPath);

  return allDocuments.find((document) => normalizeFilePath(document.filePath) === normalizedTargetPath) || null;
}

function rewriteLocalMarkdownLinks(sourceDocument, allDocuments) {
  return function attacher() {
    return function transformer(tree) {
      function visit(node) {
        if (!node || typeof node !== 'object') return;

        if (node.type === 'link' && typeof node.url === 'string') {
          const targetDocument = getDocumentByRelativeLink(node.url, sourceDocument, allDocuments);

          if (targetDocument) {
            const { fragment } = stripUrlFragment(node.url);
            const basePath = targetDocument.data.isCategoryHome
              ? `/help-centre/category/${targetDocument.categorySlug}`
              : `/help-centre/${targetDocument.slug}`;

            node.url = `${basePath}${fragment}`;
          }
        }

        if (Array.isArray(node.children)) {
          node.children.forEach(visit);
        }
      }

      visit(tree);
    };
  };
}

function getProcessor(permalinks = [], sourceDocument = null, allDocuments = []) {
  return remark()
    .use(rewriteLocalMarkdownLinks(sourceDocument, allDocuments))
    .use(wikiLinkPlugin, {
      permalinks,
      pageResolver: (pageName) => [slugify(pageName)],
      hrefTemplate: (permalink) => `/help-centre/${permalink}`,
    })
    .use(html);
}

export function getAllFilesRecursive(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFilesRecursive(fullPath, arrayOfFiles);
    } else if (file.endsWith('.md')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

export function getAllKbDocuments({ includeUnpublished = false } = {}) {
  return getAllFilesRecursive(kbDirectory)
    .map((filePath) => {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const matterResult = matter(fileContents);
      const baseName = stripMarkdownExtensions(path.basename(filePath));
      const category = getFallbackCategory(filePath) || normalizeCategory(matterResult.data.category);

      return {
        filePath,
        slug: slugify(baseName),
        title: matterResult.data.title || baseName,
        category,
        categorySlug: slugify(category),
        content: matterResult.content,
        data: {
          ...matterResult.data,
          category,
        },
      };
    })
    .filter((document) => includeUnpublished || document.data.published === true);
}

export function getAllKbSlugs() {
  return getAllKbDocuments().map((document) => ({
    slug: document.slug,
  }));
}

export function getAllCategorySlugs() {
  const categories = new Set();

  getAllKbDocuments().forEach((document) => {
    if (document.categorySlug) {
      categories.add(document.categorySlug);
    }
  });

  return Array.from(categories).map((category) => ({
    category,
  }));
}

export async function getCategoryPageData(categorySlug) {
  const allDocuments = getAllKbDocuments();
  const allPermalinks = allDocuments.map((document) => document.slug);
  let aboutDocument = null;
  const relatedDocuments = [];
  let categoryDisplayName = categorySlug;

  for (const document of allDocuments) {
    if (document.categorySlug === categorySlug) {
      categoryDisplayName = document.category;

      if (document.data.isCategoryHome) {
        const processedContent = await getProcessor(allPermalinks, document, allDocuments).process(document.content);

        aboutDocument = {
          slug: document.slug,
          title: document.title,
          contentHtml: processedContent.toString(),
          ...document.data,
        };
      } else {
        relatedDocuments.push({
          slug: document.slug,
          title: document.title,
          ...document.data,
        });
      }
    }
  }

  return {
    categoryName: categoryDisplayName,
    aboutDocument,
    relatedDocuments: relatedDocuments.sort((a, b) => a.title.localeCompare(b.title)),
  };
}

export async function getKbData(slug) {
  const allDocuments = getAllKbDocuments();
  const allPermalinks = allDocuments.map((document) => document.slug);
  const normalizedSlug = slugify(slug);
  const targetDocument = allDocuments.find((document) => document.slug === normalizedSlug);

  if (!targetDocument) {
    throw new Error(`File not found for slug: ${slug}`);
  }

  const processedContent = await getProcessor(allPermalinks, targetDocument, allDocuments).process(targetDocument.content);
  const contentHtml = processedContent.toString();

  return {
    slug: targetDocument.slug,
    title: targetDocument.title,
    contentHtml,
    ...targetDocument.data,
  };
}


