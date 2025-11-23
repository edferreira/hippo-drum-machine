import { core } from "./webRenderer";

export interface LoadedSample {
  vfsKey: string;
  name: string;
}

/**
 * Decode an audio File and register it in the Elementary Virtual File System
 */
export async function loadSampleFromFile(
  ctx: AudioContext,
  file: File
): Promise<LoadedSample> {
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  const vfsKey = `sample:${Date.now()}:${file.name}`;
  core.updateVirtualFileSystem({
    [vfsKey]: channels,
  });

  return {
    vfsKey,
    name: file.name.replace(/\.[^/.]+$/, ""),
  };
}

/**
 * Register a Blob as a sample in the VFS
 */
export async function loadSampleFromBlob(
  ctx: AudioContext,
  blob: Blob,
  name: string
): Promise<LoadedSample> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  const vfsKey = `sample:${Date.now()}:${name}`;
  core.updateVirtualFileSystem({
    [vfsKey]: channels,
  });

  return { vfsKey, name };
}
