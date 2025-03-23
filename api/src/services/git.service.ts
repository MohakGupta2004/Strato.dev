import {join} from 'path'
import {tmpdir} from 'os'
import {v4 as uuidv4} from 'uuid'
import { spawn } from 'bun'
import {readdir, readFile, rm} from 'fs/promises'
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