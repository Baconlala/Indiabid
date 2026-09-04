import Marquee from "./Marquee";

export default function Hero() {
  return (
    <div className="flex flex-col items-center gap-3 pt-10 pb-2 text-center sm:pt-16">
      <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
        Made in India, <span className="text-saffron">For India</span>
      </h1>
      <p className="text-lg font-semibold text-foreground/80 sm:text-xl">
        India bids here.
      </p>
      <div className="mt-4 w-full max-w-md">
        <Marquee />
      </div>
    </div>
  );
}
