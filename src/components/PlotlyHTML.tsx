import { useEffect, useRef } from "react";

export default function PlotlyHTML({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // inject the HTML
    el.innerHTML = html;

    // run any <script> tags inside the injected HTML
    const scripts = Array.from(el.getElementsByTagName("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");

      // copy attributes (e.g., src, type)
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );

      if (oldScript.src) {
        // external script (e.g., Plotly CDN)
        newScript.src = oldScript.src;
      } else {
        // inline script content
        newScript.text = oldScript.innerHTML;
      }

      // replace the old script with the executable one
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return <div ref={containerRef} />;
}
