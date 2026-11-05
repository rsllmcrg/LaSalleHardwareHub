export default function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      {/* next/image needs a server to optimize pictures, which the APK will not have. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        alt=""
        className="size-9 rounded-lg bg-white"
      />
      LaSalle Hardware Hub
    </span>
  );
}
