import Script from "next/script";

const SORO_EMBED_SRC =
  "https://app.trysoro.com/api/embed/cd6baf9c-275f-4f66-9a3a-5a296574c4b2";

export default function SoroBlogEmbed() {
  return (
    <>
      <div id="soro-blog" />
      <Script src={SORO_EMBED_SRC} strategy="lazyOnload" />
    </>
  );
}
