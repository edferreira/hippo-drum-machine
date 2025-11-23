import {
  useCallback,
  useRef,
  useState,
  MutableRefObject,
  useEffect,
} from "react";
import { core } from "./webRenderer";

export function useAudioExport(
  audioContextRef: MutableRefObject<AudioContext | null>
) {
  const [isRecording, setIsRecording] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const audioNodeRef = useRef<AudioNode | null>(null);
  const syncResolverRef = useRef<(() => void) | null>(null);

  /**
   * Connects the Elementary Audio node to a MediaStreamDestination for recording
   */
  const connectRecorder = useCallback(
    (audioNode: AudioNode) => {
      const audioContext = audioContextRef.current;
      if (!audioContext) {
        console.warn("AudioContext not available for recorder");
        return;
      }

      // Store reference to audio node
      audioNodeRef.current = audioNode;

      // Create destination for recording using the same AudioContext
      if (!destinationRef.current) {
        destinationRef.current = audioContext.createMediaStreamDestination();
        console.log("Created MediaStreamDestination for recording");
      }

      // Connect audio node to the recording destination
      try {
        audioNode.connect(destinationRef.current);
        console.log("Audio node connected to recorder destination");
      } catch (error) {
        console.error("Failed to connect recorder:", error);
      }
    },
    [audioContextRef]
  );

  /**
   * Starts recording audio from the pattern
   */
  const startRecording = useCallback(() => {
    if (!destinationRef.current || isRecording) return;

    const stream = destinationRef.current.stream;

    try {
      // Check for supported MIME types
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ""; // Let browser choose
        }
      }

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

      const mediaRecorder = new MediaRecorder(stream, options);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Request data every 100ms for better chunking
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, [isRecording]);

  /**
   * Stops recording and downloads the audio file
   */
  const stopRecording = useCallback(
    (filename: string = "drum-pattern.webm"): Promise<void> => {
      return new Promise((resolve, reject) => {
        const mediaRecorder = mediaRecorderRef.current;

        if (!mediaRecorder || mediaRecorder.state !== "recording") {
          reject(new Error("Not currently recording"));
          return;
        }

        mediaRecorder.onstop = () => {
          // Use the MIME type from the MediaRecorder
          const mimeType = mediaRecorder.mimeType || "audio/webm";
          const blob = new Blob(chunksRef.current, { type: mimeType });

          // Log for debugging
          console.log("Recording complete:", {
            size: blob.size,
            type: mimeType,
            chunks: chunksRef.current.length,
          });

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

          setIsRecording(false);
          mediaRecorderRef.current = null;
          resolve();
        };

        mediaRecorder.onerror = (event: Event) => {
          console.error("MediaRecorder error:", event);
          setIsRecording(false);
          reject(new Error("MediaRecorder error"));
        };

        mediaRecorder.stop();
      });
    },
    []
  );

  /**
   * Waits for the pattern to sync to the beginning (when snapshot position is 0)
   */
  const waitForPatternStart = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const handler = (e: { source?: string; data: number }) => {
        if (e?.source === "snapshot:patternpos" && e.data === 0) {
          core.off("snapshot", handler);
          resolve();
        }
      };

      core.on("snapshot", handler);
    });
  }, []);

  /**
   * Records the pattern for a specific duration and automatically downloads
   */
  const exportPattern = useCallback(
    async (
      durationSeconds: number = 4,
      filename: string = "drum-pattern.webm"
    ) => {
      if (isExporting || !destinationRef.current) return;

      setIsExporting(true);

      try {
        console.log("Waiting for pattern to sync to start...");
        // Wait for the pattern to loop back to the beginning
        await waitForPatternStart();

        console.log("Starting recording at pattern start");
        startRecording();

        // Wait for the specified duration (exact duration, no buffer needed now)
        await new Promise((resolve) =>
          setTimeout(resolve, durationSeconds * 1000)
        );

        await stopRecording(filename);
      } catch (error) {
        console.error("Failed to export pattern:", error);
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting, startRecording, stopRecording, waitForPatternStart]
  );

  /**
   * Disconnects and cleans up the recorder
   */
  const cleanup = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (audioNodeRef.current && destinationRef.current) {
      try {
        audioNodeRef.current.disconnect(destinationRef.current);
      } catch (e) {
        // Already disconnected
      }
    }

    mediaRecorderRef.current = null;
    destinationRef.current = null;
    audioNodeRef.current = null;
    setIsRecording(false);
    setIsExporting(false);
  }, []);

  return {
    connectRecorder,
    startRecording,
    stopRecording,
    exportPattern,
    cleanup,
    isRecording,
    isExporting,
  };
}
