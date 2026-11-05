export default function ProductImage({
  image,
  className,
}: {
  image: string | null;
  className: string;
}) {
  return (
    // next/image needs a server to optimize pictures, which the APK will not have.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image ?? "/products/box.svg"}
      alt=""
      className={`rounded-lg bg-zinc-100 object-contain dark:bg-zinc-800 ${className}`}
    />
  );
}
