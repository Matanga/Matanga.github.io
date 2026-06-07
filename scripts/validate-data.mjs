import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

const paths = {
  projects: path.join(rootDir, "db", "project_db.json"),
  portfolioItems: path.join(rootDir, "db", "portfolio_item_db.json"),
  taxonomy: path.join(rootDir, "db", "taxonomy.json"),
  images: path.join(rootDir, "images")
};

const errors = [];
const warnings = [];

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(rootDir, filePath)}: ${error.message}`);
    return {};
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function reportReferenceIssue(project, message) {
  if (project.visibility === "public") {
    errors.push(message);
  } else {
    warnings.push(message);
  }
}

const [projects, portfolioItems, taxonomy] = await Promise.all([
  readJson(paths.projects),
  readJson(paths.portfolioItems),
  readJson(paths.taxonomy)
]);

const projectTypes = new Set(Object.keys(taxonomy.projectTypes || {}));
const projectStatuses = new Set(Object.keys(taxonomy.projectStatuses || {}));
const visibilityValues = new Set(Object.keys(taxonomy.visibility || {}));
const skillsets = new Set(Object.keys(taxonomy.skillsets || {}));
const referencedItems = new Set();

for (const [projectId, project] of Object.entries(projects)) {
  const prefix = `Project "${projectId}"`;

  if (!Number.isInteger(project.year)) {
    errors.push(`${prefix}: year must be an integer`);
  }
  if (typeof project.featured !== "boolean") {
    errors.push(`${prefix}: featured must be a boolean`);
  }
  if (!visibilityValues.has(project.visibility)) {
    errors.push(`${prefix}: invalid visibility "${project.visibility}"`);
  }
  if (!projectStatuses.has(project.status)) {
    errors.push(`${prefix}: invalid status "${project.status}"`);
  }
  if (!Array.isArray(project.projectTypes) || project.projectTypes.length === 0) {
    errors.push(`${prefix}: projectTypes must contain at least one value`);
  } else {
    for (const type of project.projectTypes) {
      if (!projectTypes.has(type)) {
        errors.push(`${prefix}: invalid project type "${type}"`);
      }
    }
  }
  if (typeof project.relationship !== "string" || !project.relationship.trim()) {
    errors.push(`${prefix}: relationship is required`);
  }
  if (typeof project.thumbnail !== "string" || !project.thumbnail.trim()) {
    errors.push(`${prefix}: thumbnail is required`);
  } else if (!(await fileExists(path.join(paths.images, project.thumbnail)))) {
    reportReferenceIssue(
      project,
      `${prefix}: thumbnail file "${project.thumbnail}" does not exist`
    );
  }

  if (!Array.isArray(project.portfolioitems)) {
    errors.push(`${prefix}: portfolioitems must be an array`);
    continue;
  }

  for (const itemId of project.portfolioitems) {
    referencedItems.add(itemId);
    if (!portfolioItems[itemId]) {
      reportReferenceIssue(
        project,
        `${prefix}: portfolio item "${itemId}" does not exist in portfolio_item_db.json`
      );
    }
  }
}

for (const [itemId, item] of Object.entries(portfolioItems)) {
  const prefix = `Portfolio item "${itemId}"`;

  if (!Array.isArray(item.skillsets)) {
    errors.push(`${prefix}: skillsets must be an array`);
  } else {
    for (const skillset of item.skillsets) {
      if (!skillsets.has(skillset)) {
        errors.push(`${prefix}: invalid skillset "${skillset}"`);
      }
    }
  }

  const images = item.media?.image;
  if (images !== undefined && !Array.isArray(images)) {
    errors.push(`${prefix}: media.image must be an array`);
  } else {
    for (const image of images || []) {
      if (!(await fileExists(path.join(paths.images, image)))) {
        errors.push(`${prefix}: image file "${image}" does not exist`);
      }
    }
  }

  if (!referencedItems.has(itemId)) {
    warnings.push(`${prefix}: not referenced by any project`);
  }
}

for (const warning of warnings) {
  console.warn(`WARNING: ${warning}`);
}

for (const error of errors) {
  console.error(`ERROR: ${error}`);
}

console.log(
  `Validated ${Object.keys(projects).length} projects and ` +
  `${Object.keys(portfolioItems).length} portfolio items: ` +
  `${errors.length} error(s), ${warnings.length} warning(s).`
);

if (errors.length > 0) {
  process.exitCode = 1;
}
