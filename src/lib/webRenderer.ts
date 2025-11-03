import WebRenderer from "@elemaudio/web-renderer";

// Export core first so other modules can import it safely.
export const core = new WebRenderer();

export const initRenderer = async (ctx: AudioContext) => {
  const node = await core.initialize(ctx, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });

  node.connect(ctx.destination);
  return node;
};
