import { WebContainer } from '@webcontainer/api';

// Call only once
let webcontainerInstance: WebContainer | null = null;

export const getWebContainer: ()=>Promise<WebContainer> = async ()=>{

    webcontainerInstance = await WebContainer.boot();


    return webcontainerInstance
}