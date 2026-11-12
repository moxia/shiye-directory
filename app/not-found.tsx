import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div>
        <p className="hero-kicker">SHIYE / 404</p>
        <h1>这一页没有找到</h1>
        <p>This page was not found. The link may have moved, or the page never existed.</p>
        <Link className="button button-primary" href="/zh">回到首页 / Back home</Link>
      </div>
    </main>
  );
}
