const fs = require("fs");
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const expoRouterPkg = fs.realpathSync(
  path.dirname(
    require.resolve("expo-router/package.json", {
      paths: [projectRoot, monorepoRoot],
    })
  )
);

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Une seule copie d'expo-router (évite LinkPreviewContextProvider manquant)
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "expo-router": expoRouterPkg,
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "expo-router") {
    const main = path.join(expoRouterPkg, "build/index.js");
    if (fs.existsSync(main)) {
      return { type: "sourceFile", filePath: main };
    }
  }
  if (moduleName.startsWith("expo-router/")) {
    const subpath = moduleName.slice("expo-router/".length);
    const candidates = [
      path.join(expoRouterPkg, `${subpath}.js`),
      path.join(expoRouterPkg, subpath, "index.js"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return { type: "sourceFile", filePath: candidate };
      }
    }
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
