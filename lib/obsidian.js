import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import wikiLinkPlugin from 'remark-wiki-link';

const kbDirectory = path.join(process.cwd(), 'KnowledgeBase');

export function getAllFilesRecursive(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return [];
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFilesRecursive(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });
  
  return arrayOfFiles;
}

export function getAllKbSlugs() {
  const allFiles = getAllFilesRecursive(kbDirectory);
  
  return allFiles.map((filePath) => {
    const fileName = path.basename(filePath);
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export function getAllCategorySlugs() {
  const allFiles = getAllFilesRecursive(kbDirectory);
  const categories = new Set();
  
  allFiles.forEach((filePath) => {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);
    if (matterResult.data.category) {
      const slug = matterResult.data.category.toLowerCase().replace(/ /g, '-');
      categories.add(slug);
    }
  });

  return Array.from(categories).map((categorySlug) => {
    return {
      params: { category: categorySlug },
    };
  });
}

export async function getCategoryPageData(categorySlug) {
  const allFiles = getAllFilesRecursive(kbDirectory);
  let aboutDocument = null;
  const relatedDocuments = [];
  let categoryDisplayName = categorySlug;
  
  for (const filePath of allFiles) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);
    const fileName = path.basename(filePath);
    
    if (matterResult.data.published && matterResult.data.category) {
      const fileCategorySlug = matterResult.data.category.toLowerCase().replace(/ /g, '-');
      
      if (fileCategorySlug === categorySlug) {
        categoryDisplayName = matterResult.data.category; 
        
        if (matterResult.data.isCategoryHome) {
          const processedContent = await remark()
            .use(wikiLinkPlugin, { hrefTemplate: (permalink) => `/kb/${permalink}` })
            .use(html)
            .process(matterResult.content);
            
          aboutDocument = {
            contentHtml: processedContent.toString(),
            ...matterResult.data
          };
        } else {
          relatedDocuments.push({
            slug: fileName.replace(/\.md$/, ''),
            ...matterResult.data,
          });
        }
      }
    }
  }
  
  return {
    categoryName: categoryDisplayName,
    aboutDocument,
    relatedDocuments
  };
}

export async function getKbData(slug) {
  const allFiles = getAllFilesRecursive(kbDirectory);
  const targetFile = allFiles.find(file => path.basename(file) === `${slug}.md`);
  
  if (!targetFile) {
    throw new Error(`File not found for slug: ${slug}`);
  }

  const fileContents = fs.readFileSync(targetFile, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(wikiLinkPlugin, { hrefTemplate: (permalink) => `/kb/${permalink}` })
    .use(html)
    .process(matterResult.content);
  
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...matterResult.data,
  };
}