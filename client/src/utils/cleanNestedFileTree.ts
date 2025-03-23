/**
 * Recursively update the nested file tree.
 * @param {object} tree - The nested file tree.
 * @param {string[]} parts - An array of path parts.
 * @param {string} newContents - The new file contents.
 * @returns {object} - A new file tree with the updated file.
 */
export const updateNestedFileTree: any = (tree: any, parts: Array<string>, newContents: string) => {
  // If we're at the file level (only one part left)
  if (parts.length === 1) {
    const fileName = parts[0];
    if (tree[fileName] && tree[fileName].file) {
      return {
        ...tree,
        [fileName]: {
          ...tree[fileName],
          file: { contents: newContents }
        }
      };
    }
    return tree;
  }
  
  // Otherwise, we're in a directory.
  const [folder, ...rest] = parts;
  if (tree[folder] && tree[folder].directory) {
    return {
      ...tree,
      [folder]: {
        ...tree[folder],
        directory: updateNestedFileTree(tree[folder].directory, rest, newContents)
      }
    };
  }
  return tree;
};

export const cleanNestedFileTree = (tree:any) => {
  const nestedTree:any = {};
  Object.keys(tree).forEach(key => {
    // Only add keys that do not include a slash
    if (!key.includes('/')) {
      // If the node has a directory, recursively clean it
      if (tree[key].directory) {
        //@ts-ignore
        nestedTree[key] = {
          directory: cleanNestedFileTree(tree[key].directory)
        };
      } else {
        
        nestedTree[key] = tree[key];
      }
    }
  });
  return nestedTree;
};


// Wrapper to update based on a full path string, e.g., "src/index.js"
export const updateFileContentsInTree = (tree: any, fullPath: string, newContents: string) => {
  const parts = fullPath.split('/');
  return updateNestedFileTree(tree, parts, newContents);
};
