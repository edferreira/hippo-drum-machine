/**
 * Records audio from an AudioContext using MediaStreamDestination
 * and exports it as a downloadable WAV file
 */
export async function exportAudio(
  audioContext: AudioContext,
  durationSeconds: number,
  filename: string = "drum-pattern.wav"
): Promise<void> {
  // Create a MediaStreamDestination to capture the audio
  const destination = audioContext.createMediaStreamDestination();

  // Get the audio destination node that's currently being used
  // We'll need to disconnect from the default destination and connect to our MediaStreamDestination
  const stream = destination.stream;

  // Use MediaRecorder to record the stream
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "audio/webm;codecs=opus",
  });

  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: "audio/webm" });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename.replace(/\.wav$/, ".webm");
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    mediaRecorder.onerror = (event) => {
      reject(new Error("MediaRecorder error"));
    };

    // Start recording
    mediaRecorder.start();

    // Stop recording after specified duration
    setTimeout(() => {
      mediaRecorder.stop();
    }, durationSeconds * 1000);
  });
}

/**
 * Creates a recording hook that captures audio from the Elementary Audio renderer
 * by tapping into the audio context's destination
 */
export function createAudioRecorder(audioContext: AudioContext) {
  let mediaRecorder: MediaRecorder | null = null;
  let destination: MediaStreamAudioDestinationNode | null = null;
  let chunks: Blob[] = [];

  const start = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      return;
    }

    // Create destination if it doesn't exist
    if (!destination) {
      destination = audioContext.createMediaStreamDestination();
    }

    const stream = destination.stream;
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.start();
  };

  const stop = async (
    filename: string = "drum-pattern.webm"
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder || mediaRecorder.state !== "recording") {
        reject(new Error("Not recording"));
        return;
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        resolve();
      };

      mediaRecorder.onerror = () => {
        reject(new Error("MediaRecorder error"));
      };

      mediaRecorder.stop();
    });
  };

  const getDestination = () => destination;

  return { start, stop, getDestination };
}
