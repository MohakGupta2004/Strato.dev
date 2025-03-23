export const getFileNode: any = (tree: any, path: string) => {
    const parts = path.split('/');
    // If no parts, return nothing.
    if (parts.length === 0) return undefined;
    
    // Get the first part.
    const [first, ...rest] = parts;
    const node = tree[first];
    if (!node) return undefined; // Folder or file doesn't exist
    
    // If this is the last part, return the node.
    if (rest.length === 0) {
      return node;
    }
    
    // Otherwise, the node should be a directory.
    if (node.directory) {
      return getFileNode(node.directory, rest.join('/'));
    }
    
    // If not a directory, return undefined.
    return undefined;
  };
  