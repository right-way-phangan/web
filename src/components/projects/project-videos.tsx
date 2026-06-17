import { Play } from "lucide-react";
import { videoEmbed } from "@/lib/projects/parse";

/** Video / tour section — YouTube & Vimeo as responsive embeds, mp4 inline,
 * anything else as a labelled external link. */
export function ProjectVideos({ urls, watchLabel }: { urls: string[]; watchLabel: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {urls.map((url) => {
        const v = videoEmbed(url);
        if (v.kind === "youtube" || v.kind === "vimeo") {
          return (
            <div
              key={url}
              className="relative aspect-video overflow-hidden rounded-sm border border-forest-500/10 bg-panel"
            >
              <iframe
                src={v.src}
                title="Project video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          );
        }
        if (v.kind === "file") {
          return (
            <video
              key={url}
              src={v.src}
              controls
              preload="metadata"
              className="aspect-video w-full rounded-sm border border-forest-500/10 bg-panel"
            />
          );
        }
        return (
          <a
            key={url}
            href={v.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex aspect-video items-center justify-center gap-2 rounded-sm border border-forest-500/15 bg-cream-50 text-sm font-medium text-forest-700 transition-colors hover:border-brass-500 hover:text-brass-500"
          >
            <Play className="h-5 w-5" />
            {watchLabel}
          </a>
        );
      })}
    </div>
  );
}
