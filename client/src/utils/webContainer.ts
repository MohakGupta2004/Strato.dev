import { WebContainer } from '@webcontainer/api';

// Call only once
let webcontainerInstance: WebContainer | null = null;

export const getWebContainer: ()=>Promise<WebContainer> = async ()=>{
    if(webcontainerInstance === null){
        webcontainerInstance = await WebContainer.boot();
    }

    return webcontainerInstance
}