#!/usr/bin/env node
import fs from "fs";
import path from "path";

const versionFile = path.resolve("./version.json");
const packageFile = path.resolve("./package.json");

const type = process.argv[2]; // major, minor, patch

if (!["major", "minor", "patch"].includes(type)) {
  console.error("Usage: pnpm increment-version {major|minor|patch}");
  process.exit(1);
}

// Read current version
const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf-8"));
const currentVersion = packageJson.version.split(".").map(Number);
let [major, minor, patch] = currentVersion;

// Increment version
switch (type) {
  case "major":
    major++;
    minor = 0;
    patch = 0;
    break;
  case "minor":
    minor++;
    patch = 0;
    break;
  case "patch":
    patch++;
    break;
}

const newVersion = `${major}.${minor}.${patch}`;

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2) + "\n");

// Update version.json
fs.writeFileSync(versionFile, JSON.stringify({ version: newVersion }, null, 2) + "\n");

console.log(`Version updated to ${newVersion}`);