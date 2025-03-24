import {join} from 'path'
import {tmpdir} from 'os'
import {v4 as uuidv4} from 'uuid'
import { spawn } from 'bun'
import {readdir, readFile, rm} from 'fs/promises'
import { Octokit } from '@octokit/rest'
type FileNode = {
    file?: {contents: string};
    directory?: Record<string,FileNode>
}
const getDir = async (dir: string)=>{
    const entries  = await readdir(dir, {withFileTypes: true})
    const fileTree: Record<string, any> = {}
    
    for(const entry of entries){
        const fullPath = join(dir, entry.name)

        if(entry.isDirectory()){
            fileTree[entry.name] = {directory:  await getDir(fullPath)}
        } else {
            const contents = await readFile(fullPath, "utf-8")
            fileTree[entry.name] = {file: {contents: contents.trim()}}
        }

    }
    return fileTree
}
export const gitService = async(repo: string)=>{
    if (!repo) {
        return new Response(JSON.stringify({ error: "Repository URL is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }
    const tempDir = join(tmpdir(), `repo-${uuidv4()}`);
    try {
        const process = spawn(["git", "clone", "--depth=1", repo, tempDir])
        const success = await process.exited;
        if(success == 1){
            return {
                message: "Repository URL malfunciton"
            }
        }
        const fileTree = await getDir(tempDir)
        await rm(tempDir, { recursive: true, force: true });
        return fileTree
    } catch (error) {
        console.log(error)
    }
}
function flattenFileTree(fileTree: Record<string, FileNode>, parentPath = "") {
    let flatTree: Record<string, string> = {};
  
    for (const [key, value] of Object.entries(fileTree)) {
      const newPath = parentPath ? `${parentPath}/${key}` : key;
    

      if (value.file) {
        // It's a file → Store its contents
        flatTree[newPath] = value.file.contents;
      } else if (value.directory) {
        // It's a directory → Recursively process it
        Object.assign(flatTree, flattenFileTree(value.directory, newPath));
      }
    }
  
    return flatTree;
  }
export const pushToGithubService = async (token: string, owner: string, repo: string, fileTree: Record<string, FileNode>, message: string)=>{
    const octokit = new Octokit({
        auth: token
    })
    const {data: refData} = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: "heads/main"
    })

    const latestCommitSHA = refData.object.sha
    const {data: commitData} = await octokit.rest.git.getCommit({
        commit_sha: latestCommitSHA,
        repo,
        owner
    })
    const latestTreeSHA = commitData.tree.sha

    let newTree: Array<{
        path: string,
        mode: string,
        type: string,
        sha: string
    }> = []
    const flatFileTree = flattenFileTree(fileTree)
    for(const [filePath, fileData] of Object.entries(flatFileTree)){
        const {data: blobData} = await octokit.rest.git.createBlob({
            owner,
            repo,
            content: Buffer.from(fileData).toString('base64'),
            encoding: 'base64'
        })

        newTree.push({
            path: filePath,
            mode: "100644",
            type: "blob",
            sha: blobData.sha
        })
    }
    const {data: newTreeData} = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: latestTreeSHA,
        //@ts-ignore
        tree: newTree
    })

    const {data: commitTreeData} = await octokit.rest.git.createCommit({
        owner,
        repo,
        message,
        tree: newTreeData.sha,
        parents: [latestCommitSHA]
    })

    await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: "heads/main",
        sha: commitTreeData.sha
    })

    return {messaage: "Changes Pushed Successfully"}
}